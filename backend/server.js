import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const fallbackData = JSON.parse(fs.readFileSync(path.join(__dirname, 'fallbackData.json'), 'utf8'));

const app = express();
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Space topic fallback data
const spaceFallbackData = {
  topic: 'Space',
  explainer: 'Space is a vast, nearly perfect vacuum beyond Earth\'s atmosphere containing celestial bodies like stars, planets, and galaxies. It is governed by fundamental forces like gravity, which holds planetary systems together and causes light to bend around massive objects. Exploring space allows humanity to understand the origins of the universe and search for potential habitable worlds beyond our own.',
  quiz: [
    {
      question: 'What is the closest star to Earth after the Sun?',
      options: ['Proxima Centauri', 'Sirius', 'Alpha Centauri A', 'Betelgeuse'],
      correctIndex: 0,
      explanation: 'Proxima Centauri is the closest star to our Sun at approximately 4.24 light-years away.'
    },
    {
      question: 'Which planet in our solar system is known as the "Red Planet"?',
      options: ['Venus', 'Jupiter', 'Mars', 'Mercury'],
      correctIndex: 2,
      explanation: 'Mars appears red due to iron oxide (rust) on its surface.'
    },
    {
      question: 'What is the term for a region of space where gravity is so strong that even light cannot escape?',
      options: ['Nebula', 'Black Hole', 'Supernova', 'Pulsar'],
      correctIndex: 1,
      explanation: 'A black hole has gravitational pull so intense that nothing, not even light, can escape from within its event horizon.'
    },
    {
      question: 'How long does it take light from the Sun to reach Earth?',
      options: ['8 seconds', '8 minutes', '8 hours', '8 days'],
      correctIndex: 1,
      explanation: 'Sunlight takes approximately 8 minutes and 20 seconds to travel from the Sun to Earth.'
    },
    {
      question: 'Which galaxy is predicted to collide with the Milky Way in about 4.5 billion years?',
      options: ['Andromeda Galaxy', 'Triangulum Galaxy', 'Sombrero Galaxy', 'Whirlpool Galaxy'],
      correctIndex: 0,
      explanation: 'The Andromeda Galaxy is moving toward the Milky Way and will eventually merge with it.'
    }
  ]
};

app.post('/api/generate-quiz', async (req, res) => {
  try {
    const { topic = 'Photosynthesis' } = req.body;
    console.log('📡 Received request for topic:', topic);
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
      console.error('❌ GEMINI_API_KEY is missing, using fallback');
      // Use space fallback if topic is Space, otherwise use general fallback
      const fallback = topic.toLowerCase().includes('space') ? spaceFallbackData : fallbackData;
      return res.json(fallback);
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

    // Updated model to gemini-3.6-flash
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
      console.log('⚠️ API failed, using fallback data');
      // Use space fallback if topic is Space, otherwise use general fallback
      const fallback = topic.toLowerCase().includes('space') ? spaceFallbackData : fallbackData;
      return res.json(fallback);
    }

    const rawText = data.candidates[0].content.parts[0].text;
    const quizData = JSON.parse(rawText);

    console.log('✅ Successfully generated quiz via API');
    return res.json(quizData);
  } catch (error) {
    console.error('Error in /api/generate-quiz:', error);
    console.log('⚠️ Exception caught, using fallback data');
    // Use space fallback if topic is Space, otherwise use general fallback
    const topic = req.body?.topic || 'Photosynthesis';
    const fallback = topic.toLowerCase().includes('space') ? spaceFallbackData : fallbackData;
    return res.status(200).json(fallback);
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));