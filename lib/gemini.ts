import { GoogleGenerativeAI } from '@google/generative-ai';
import { CommunityNeed, Volunteer, VolunteerMatch, NeedCategory } from '../types';
import toast from 'react-hot-toast';

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(apiKey);

// ── helpers ──
const cleanJsonResponse = (text: string) => {
  return text.replace(/```json/g, '').replace(/```/g, '').trim();
};

const errorToastStyle = {
  style: { background: '#1b1f2c', color: '#fff', border: '1px solid rgba(255,107,53,0.4)' },
  iconTheme: { primary: '#FF6B35', secondary: '#0f131f' },
};

/**
 * Exponential backoff retry wrapper.
 * Retries up to `maxAttempts` times with 2^attempt * baseDelayMs wait.
 */
async function withRetry<T>(
  fn: () => Promise<T>,
  label: string,
  maxAttempts = 3,
  baseDelayMs = 1000
): Promise<T> {
  let lastError: unknown;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      console.warn(`[Gemini] ${label} — attempt ${attempt}/${maxAttempts} failed`, err);

      if (attempt < maxAttempts) {
        const delay = baseDelayMs * Math.pow(2, attempt - 1);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  // all attempts exhausted
  const msg = lastError instanceof Error ? lastError.message : 'Unknown error';
  console.error(`[Gemini] ${label} — all ${maxAttempts} attempts failed:`, lastError);

  try {
    const displayMsg = msg.includes('403') ? 'Invalid API Key' : msg.includes('429') ? 'Quota Exceeded' : label;
    toast.error(`AI service error: ${displayMsg}`, errorToastStyle as any);
  } catch {
    // toast may not be available in server context — fail silently
  }

  throw lastError;
}

// ══════════════════════════════════════════════════════════
// Function 1 — Process a single survey record
// ══════════════════════════════════════════════════════════
export async function processSurveyRecord(rawText: string): Promise<Partial<CommunityNeed>> {
  try {
    const result = await withRetry(async () => {
      const model = genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
        systemInstruction:
          'You are a community needs analyst. Extract structured data from NGO survey responses. Always respond with valid JSON only, no markdown.',
        generationConfig: { responseMimeType: 'application/json' },
      });

      const prompt = `Extract from this survey text: 1) need category (exactly one of: medical/food/education/housing/safety/other), 2) urgency score 1-10 (10=life threatening, 1=minor improvement), 3) location/area name as a string, 4) affected population count (estimate if not stated), 5) clear title (max 8 words), 6) description (max 30 words). Survey text: ${rawText}. Return JSON: { "category": "", "urgencyScore": 0, "location": "", "affectedCount": 0, "title": "", "description": "" }`;

      return await model.generateContent(prompt);
    }, 'processSurveyRecord', 5, 2000); // More retries, longer base delay

    const responseText = result.response.text();
    const data = JSON.parse(cleanJsonResponse(responseText));

    return {
      category: data.category as NeedCategory,
      urgencyScore: data.urgencyScore || 1,
      location: data.location || 'Unknown Location',
      affectedCount: data.affectedCount || 0,
      title: data.title || 'Untitled Need',
      description: data.description || '',
    };
  } catch (error) {
    console.error('Error processing survey record with Gemini:', error);
    // Fallback object so the upload pipeline doesn't halt entirely
    return {
      category: NeedCategory.OTHER,
      urgencyScore: 5,
      location: 'Unknown Location',
      affectedCount: 0,
      title: 'Unprocessed Survey Report',
      description: rawText.substring(0, 30) + '...',
    };
  }
}

// ══════════════════════════════════════════════════════════
// Function 2 — Match a volunteer to community needs
// ══════════════════════════════════════════════════════════
export async function matchVolunteerToNeeds(
  volunteer: Volunteer,
  needs: CommunityNeed[]
): Promise<VolunteerMatch[]> {
  if (!needs || needs.length === 0) return [];

  try {
    const result = await withRetry(async () => {
      const model = genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
        systemInstruction:
          'You are a volunteer coordinator AI. Match volunteers to community needs based on skills, location proximity, and urgency. Always respond with valid JSON only.',
        generationConfig: { responseMimeType: 'application/json' },
      });

      const topNeeds = needs.slice(0, 10);
      const prompt = `Volunteer profile: skills=[${volunteer.skills.join(', ')}], city=[${volunteer.city}]. Available needs (top 10 by urgency): ${JSON.stringify(topNeeds)}. For each need, calculate a match score 0-100 and write one sentence explaining why this volunteer is or isn't a good fit. Return JSON array: [{ "needId": "", "matchScore": 0, "aiExplanation": "" }] sorted by matchScore descending. Return top 3 only.`;

      return await model.generateContent(prompt);
    }, 'matchVolunteerToNeeds', 3, 1000);

    const responseText = result.response.text();

    interface RawMatch {
      needId: string;
      matchScore: number;
      aiExplanation: string;
    }
    const data: RawMatch[] = JSON.parse(cleanJsonResponse(responseText));

    return data.map(match => ({
      volunteerId: volunteer.id,
      needId: match.needId,
      matchScore: match.matchScore,
      aiExplanation: match.aiExplanation,
      status: 'pending' as const,
      createdAt: new Date(),
    }));
  } catch (error) {
    console.error('Error matching volunteer with Gemini:', error);
    return [];
  }
}

// ══════════════════════════════════════════════════════════
// Function 3 — Generate a single-sentence insight
// ══════════════════════════════════════════════════════════
export async function generateInsight(needs: CommunityNeed[]): Promise<string> {
  if (!needs || needs.length === 0) return 'No active needs data available to analyze.';

  try {
    const result = await withRetry(async () => {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const prompt = `Analyze these community needs and identify the single most critical pattern or surge. Respond in exactly one sentence, max 20 words, starting with the area name. Data: ${JSON.stringify(needs)}`;

      return await model.generateContent(prompt);
    }, 'generateInsight', 2, 500);

    return result.response.text().trim();
  } catch (error) {
    console.error('Error generating insight with Gemini:', error);
    return 'Unable to generate intelligence insights at this time.';
  }
}
