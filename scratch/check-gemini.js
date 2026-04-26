
const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');

async function checkModels() {
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

  console.log('Using API Key (first 5 chars):', apiKey.substring(0, 5) + '...');
  
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    
    const modelsToTry = ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-pro'];
    
    for (const modelName of modelsToTry) {
        console.log(`\n--- Testing model: ${modelName} ---`);
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent('Say hello');
            console.log(`Success with ${modelName}!`);
            console.log('Response:', result.response.text());
            break; // Stop if we found a working one
        } catch (err) {
            console.error(`Failed with ${modelName}:`, err.message);
            if (err.status) console.error('Status:', err.status);
        }
    }
  } catch (err) {
    console.error('Fatal error during diagnostics:', err.message);
  }
}

checkModels();
