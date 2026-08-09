const https = require('https');
require('dotenv').config({ path: 'backend/.env.local' });

const req = https.request('https://api.groq.com/openai/v1/models', {
  headers: { 'Authorization': `Bearer ${process.env.GROQ_API_KEY}` }
}, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const json = JSON.parse(data);
    console.log(json.data ? json.data.map(m => m.id) : json);
  });
});
req.on('error', console.error);
req.end();
