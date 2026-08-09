const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config({ path: 'backend/.env.local' });
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-3.0-flash' });
model.generateContent('Hello').then(r => console.log(r.response.text())).catch(e => console.error(e));
