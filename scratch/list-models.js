
const https = require('https');
const fs = require('fs');
const path = require('path');

async function listAvailableModels() {
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
  
  const options = {
    hostname: 'generativelanguage.googleapis.com',
    path: `/v1beta/models?key=${apiKey}`,
    method: 'GET'
  };

  const req = https.request(options, (res) => {
    let data = '';
    console.log('Status Code:', res.statusCode);
    
    res.on('data', (chunk) => {
      data += chunk;
    });

    res.on('end', () => {
      try {
        const json = JSON.parse(data);
        if (json.models) {
          console.log('Available Models:');
          json.models.forEach(m => console.log(` - ${m.name}`));
        } else {
          console.log('No models property in response.');
          console.log(JSON.stringify(json, null, 2));
        }
      } catch (e) {
        console.error('Failed to parse response:', data);
      }
    });
  });

  req.on('error', (e) => {
    console.error(`Problem with request: ${e.message}`);
  });

  req.end();
}

listAvailableModels();
