const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');
const path = require('path');

// Load .env.local
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

console.log('Testing API Key:', apiKey ? 'FOUND (starts with ' + apiKey.substring(0, 8) + '...)' : 'NOT FOUND');

if (!apiKey) {
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(apiKey);

async function test() {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent('Say hello');
    console.log('Success! Response:', result.response.text());
  } catch (error) {
    console.error('API Test Failed:');
    console.error('Error Message:', error.message);
    if (error.message.includes('403')) {
      console.error('Status: 403 (Forbidden) - This usually means the API key is invalid or not enabled for this service.');
    }
  }
}

test();
