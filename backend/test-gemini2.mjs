import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
const apiKey = process.env.GEMINI_API_KEY;
const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
const response = await fetch(url);
console.log(response.status);
const data = await response.json();
console.log(data.models.map(m => m.name).join("\n"));
