import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Built-in fallback so the server NEVER crashes if the file is missing
const spaceFallbackData = {
  topic: 'Space',
  explainer: 'Space is a vast, nearly perfect vacuum beyond Earth\'s atmosphere. It is governed by fundamental forces like gravity, which holds planetary systems together. Exploring space allows humanity to understand the origins of the universe.',
  quiz: [
    { question: 'What is the closest star to Earth after the Sun?', options: ['Proxima Centauri', 'Sirius', 'Alpha Centauri A', 'Betelgeuse'], correctIndex: 0, explanation: 'Proxima Centauri is approximately 4.24 light-years away.' },
    { question: 'Which planet is known as the "Red Planet"?', options: ['Venus', 'Jupiter', 'Mars', 'Mercury'], correctIndex: 2, explanation: 'Mars appears red due to iron oxide on its surface.' },
    { question: 'What region of space has gravity so strong light cannot escape?', options: ['Nebula', 'Black Hole', 'Supernova', 'Pulsar'], correctIndex: 1, explanation: 'A black hole\'s gravitational pull is immense.' },
    { question: 'How long does sunlight take to reach Earth?', options: ['8 seconds', '8 minutes', '8 hours', '8 days'], correctIndex: 1, explanation: 'It takes ~8 minutes and 20 seconds.' },
    { question: 'Which galaxy will collide with the Milky Way?', options: ['Andromeda', 'Triangulum', 'Sombrero', 'Whirlpool'], correctIndex: 0, explanation: 'Andromeda is on a collision course with us.' }
  ]
};

// Safely attempt to load the external fallback file
let fallbackData = spaceFallbackData;
try {
  const fallbackPath = path.join(__dirname, 'fallbackData.json');
  if (fs.existsSync(fallbackPath)) {
    fallbackData = JSON.parse(fs.readFileSync(fallbackPath, 'utf8'));
  }
} catch (e) {
  console.log('⚠️ Could not load fallbackData.json, using built-in space memory.');
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

app.post('/api/generate-quiz', async (req, res) => {
  try {
    const { topic = 'Space', level = 'cadet' } = req.body;
    console.log(`📡 Received request: Topic [${topic}] | Level [${level}]`);

    if (!process.env.GEMINI_API_KEY) {
      console.error('❌ GEMINI_API_KEY missing. Sending fallback.');
      return res.json(topic.toLowerCase().includes('space') ? spaceFallbackData : fallbackData);
    }

    // Define difficulty instructions based on the level passed from frontend
    let difficultyInstruction = "basic, introductory concepts suitable for beginners.";
    if (level === 'pilot') {
      difficultyInstruction = "intermediate concepts, requiring deeper understanding and critical thinking.";
    } else if (level === 'commander') {
      difficultyInstruction = "advanced, highly technical questions requiring expert-level knowledge.";
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: `Generate a concise 3-sentence lesson explainer and a 5-question multiple-choice quiz about: "${topic}". The difficulty of these questions MUST BE ${difficultyInstruction}.`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            topic: { type: Type.STRING },
            explainer: { type: Type.STRING },
            quiz: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING },
                  options: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING },
                  },
                  correctIndex: { type: Type.INTEGER },
                  explanation: { type: Type.STRING },
                },
                required: ['question', 'options', 'correctIndex', 'explanation'],
              },
            },
          },
          required: ['topic', 'explainer', 'quiz'],
        },
      },
    });

    // The SDK handles structure, we just need to parse the clean text
    const quizData = JSON.parse(response.text);
    console.log('✅ Successfully generated quiz via SDK');
    
    return res.json(quizData);
  } catch (error) {
    console.error('⚠️ Exception caught, using fallback data:', error.message);
    const requestedTopic = req.body?.topic || 'Space';
    return res.status(200).json(requestedTopic.toLowerCase().includes('space') ? spaceFallbackData : fallbackData);
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Backend running on port ${PORT}`));