
const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');

async function testGemini3() {
  let apiKey = '';
  try {
    const envContent = fs.readFileSync(path.join(process.cwd(), '.env.local'), 'utf8');
    const match = envContent.match(/NEXT_PUBLIC_GEMINI_API_KEY=(.*)/);
    if (match) apiKey = match[1].trim().replace(/^["']|["']$/g, '');
    if (!apiKey) {
        const match2 = envContent.match(/GEMINI_API_KEY=(.*)/);
        if (match2) apiKey = match2[1].trim().replace(/^["']|["']$/g, '');
    }
  } catch (e) {
    console.error('Could not read .env.local', e.message);
  }

  if (!apiKey) {
    console.error('No API key found in .env.local');
    return;
  }

  console.log('Testing with gemini-3-flash-preview...');
  
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-3-flash-preview' });
    const result = await model.generateContent('Say "Gemini 3 is working!"');
    console.log('Success!');
    console.log('Response:', result.response.text());
  } catch (err) {
    console.error('Failed:', err.message);
  }
}

testGemini3();
