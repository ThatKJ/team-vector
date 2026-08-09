const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config({ path: 'backend/.env.local' });
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`).then(r => r.json()).then(d => console.log(d.models.map(m=>m.name))).catch(e => console.error(e));
