import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.post('/api/generate-quiz', async (req, res) => {
  try {
    const { topic = 'Photosynthesis' } = req.body;
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: 'GEMINI_API_KEY is missing from .env' });
    }

    const prompt = `
      Generate a concise 3-sentence lesson explainer and a 5-question multiple-choice quiz about the space topic: "${topic}".
      You must respond strictly with valid JSON. Do not include markdown code block formatting.
      
      JSON Structure:
      {
        "topic": "${topic}",
        "explainer": "3-sentence explainer here",
        "quiz": [
          {
            "question": "Question text?",
            "options": ["Option A", "Option B", "Option C", "Option D"],
            "correctIndex": 0,
            "explanation": "Why this option is correct"
          }
        ]
      }
    `;

    // Updated model to gemini-2.0-flash
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          responseMimeType: 'application/json'
        }
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Google API Error Response:', data);
      return res.status(response.status).json({ error: 'Google API Error', details: data });
    }

    const rawText = data.candidates[0].content.parts[0].text;
    const quizData = JSON.parse(rawText);

    return res.json(quizData);
  } catch (error) {
    console.error('Error in /api/generate-quiz:', error);
    return res.status(500).json({ error: 'Failed to generate quiz data.', details: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));