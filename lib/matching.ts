import { Volunteer, CommunityNeed, VolunteerMatch, SkillType, NeedCategory } from '../types';
import { matchVolunteerToNeeds } from './gemini';

// ── Category to Skill Mapping ──
const CATEGORY_SKILLS: Record<NeedCategory, SkillType[]> = {
  [NeedCategory.MEDICAL]: [SkillType.MEDICAL],
  [NeedCategory.FOOD]: [SkillType.FOOD_DISTRIBUTION, SkillType.LOGISTICS],
  [NeedCategory.EDUCATION]: [SkillType.EDUCATION],
  [NeedCategory.HOUSING]: [SkillType.CONSTRUCTION],
  [NeedCategory.SAFETY]: [SkillType.COUNSELLING, SkillType.LOGISTICS],
  [NeedCategory.OTHER]: Object.values(SkillType),
};

/**
 * Algorithmic matching score (0-100)
 * Location: 40%
 * Skills: 60%
 */
export function calculateMatchScore(volunteer: Volunteer, need: CommunityNeed): number {
  let score = 0;

  // 1. Location Match (40 pts)
  if (volunteer.city?.trim().toLowerCase() === need.location?.trim().toLowerCase()) {
    score += 40;
  }

  // 2. Skill Overlap (60 pts)
  const requiredSkills = CATEGORY_SKILLS[need.category as NeedCategory] || [];
  const hasSkill = volunteer.skills?.some(skill => 
    requiredSkills.some(req => req.toLowerCase() === skill.toLowerCase())
  );
  
  if (hasSkill) {
    score += 60;
  } else if (need.category?.toLowerCase() === NeedCategory.OTHER) {
    score += 30; // Partial points for generic needs
  }

  // 3. Urgency Multiplier (Subtle adjustment)
  score = Math.min(100, score + (need.urgencyScore || 0));

  return score;
}

/**
 * Hybrid matching: 
 * 1. Filter and sort by algorithm
 * 2. Use Gemini to generate explanations for the top 5
 */
export async function getHybridMatches(
  volunteer: Volunteer,
  needs: CommunityNeed[]
): Promise<VolunteerMatch[]> {
  if (!needs || needs.length === 0) return [];

  // 1. Calculate algorithmic scores
  const scoredNeeds = needs.map(need => ({
    need,
    score: calculateMatchScore(volunteer, need)
  }));
  console.log('Hybrid: Scored Needs:', scoredNeeds);

  // 2. Sort by score descending and take top 5
  const topScored = scoredNeeds
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .map(item => ({
      ...item.need,
      matchScore: item.score
    }));

  // 3. Use Gemini to generate explanations for these pre-selected needs
  try {
    // We reuse the existing gemini utility but it's now "secondary" 
    // because it only explains the already-chosen best matches.
    const aiMatches = await matchVolunteerToNeeds(volunteer, topScored as any);
    
    // Map AI explanations back to our scored needs
    return topScored.map(item => {
      const aiMatch = aiMatches.find(m => m.needId === item.id);
      return {
        volunteerId: volunteer.id,
        needId: item.id,
        matchScore: item.matchScore,
        aiExplanation: aiMatch?.aiExplanation || `Matches your ${volunteer.skills[0]} skills and location in ${volunteer.city}.`,
        status: 'pending' as const,
        createdAt: new Date(),
      };
    });
  } catch (error) {
    console.error('Hybrid matching AI step failed:', error);
    // Fallback to purely algorithmic results
    return topScored.map(item => ({
      volunteerId: volunteer.id,
      needId: item.id,
      matchScore: item.matchScore,
      aiExplanation: `Strong match based on your ${volunteer.skills[0]} expertise in ${volunteer.city}.`,
      status: 'pending' as const,
      createdAt: new Date(),
    }));
  }
}
