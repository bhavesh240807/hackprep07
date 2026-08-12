# SYSTEM DIRECTIVE: ANTIGRAVITY AGENT
**Role:** You are an expert Principal Full-Stack Engineer and Game Developer. 
**Task:** Your objective is to build "AntiGravity", a web-based, gamified space-learning platform. 
**Execution:** Read this entire Product Requirements Document (PRD). Follow the UI/UX guidelines, architectural decisions, and game loops precisely. Whenever you write code for this project, refer back to this document to ensure alignment with the overarching vision.

---

# PRODUCT REQUIREMENTS DOCUMENT (PRD)

**Project Name:** to be decided 
**Tagline:** Gamified Astrophysics & Orbital Mechanics Engine  
**Platform:** Responsive Web Application (React/Next.js + HTML5 Canvas/WebGL)  
**Art Style:** Retro 8-bit / 16-bit Sci-Fi Pixel Art  
**Target Audience:** K-12 students, STEM enthusiasts, and casual learners  

## 1. Product Overview
AntiGravity bridges theoretical space concepts (orbital mechanics, gravity, stellar evolution) with micro-games. It uses dynamic LLM generation to create limitless trivia and telemetry logs, tying gameplay mechanics directly to academic learning.

---

## 2. The Landing Page (The Spaceport)
The landing page must immediately immerse the user in the retro-arcade aesthetic while clearly explaining the platform's value. 

### Structure & Flow
*   **Hero Section:**
    *   **Visual:** A full-viewport, parallax-scrolling pixel art background of a galaxy with shooting stars and a slowly rotating space station. 
    *   **Typography:** The title "AntiGravity" in a large, glowing pixel font.
    *   **Call to Action (CTA):** A flashing, retro-arcade style button reading `[PRESS START TO LAUNCH]` or `[INITIATE IGNITION]`.
*   **Feature Highlights (Grid Layout):**
    *   *Dynamic Missions:* "Infinite knowledge powered by the flight computer" (Highlighting AI generation).
    *   *Arcade Physics:* "Learn orbital mechanics by actually flying."
    *   *Rank Up:* "Earn Stardust, unlock badges, and become a Cosmic Explorer."
*   **Footer:** Retro arcade copyright text (`(c) 2026 AntiGravity Engine. INSERT COIN.`).

---

## 3. Pixelated UI/UX & Visual Aesthetics
The app must feel like a modern web application wrapped in a nostalgic, highly polished 1990s arcade cabinet.

### Color Palette & Variables
*   **Deep Cosmic Void:** `#0B0F19` (App Background)
*   **Neon Cyan:** `#00F0FF` (Primary interactive elements, HUD text)
*   **Electric Magenta:** `#FF007F` (Enemy alerts, wrong answers, lasers)
*   **Supernova Gold:** `#FFD700` (Stardust currency, level ups)
*   **Nebula Purple:** `#8A2BE2` (Secondary backgrounds, shadows)

### Typography & CSS FX
*   **Fonts:** `Press Start 2P`, `Silkscreen`, or `Fira Code`. 
*   **CRT Shader Effect:** Apply a global, subtle CSS overlay with scanlines (`background: linear-gradient(...)`) and a faint screen flicker animation.
*   **Micro-interactions:**
    *   *Hover states:* Buttons should invert colors and emit a soft neon box-shadow (`box-shadow: 0 0 10px #00F0FF;`).
    *   *Audio:* Bind 8-bit hover blips and click confirm sounds to all navigational buttons (using Howler.js).

---

## 4. Gamification Engine (The Progression Loop)
Gamification is the core retention mechanic. State must persist across sessions.

### Currency & Leveling
*   **Currency:** **Stardust** (`+100` per correct answer/completed stage).
*   **Level Calculation:** 
    $$Level = \lfloor \frac{Stardust}{300} \rfloor + 1$$

### Astronaut Ranks
| Stardust Range | Rank Title | Pixel Badge Asset |
| :--- | :--- | :--- |
| `0 - 299` | Space Cadet | 👨‍🚀 (White Suit) |
| `300 - 599` | Star Pilot | 🛸 (Fighter Ship) |
| `600 - 1199` | Flight Commander | 🚀 (Heavy Rocket) |
| `1200+` | Cosmic Explorer | 🌌 (Glowing Nebula) |

### Engagement Hooks
*   **Orbit Streaks:** Track consecutive days logged in. Displayed in the header as a flame icon (`🔥 x3`). If a day is missed, the hull "cools down" (resets to 0).
*   **Telemetry Badges:** Achievement unlocks tied to specific categories (e.g., "Event Horizon Survivor" for completing 5 Black Hole missions).
*   **State Persistence:** Save `astroquest_stardust`, `astroquest_streak`, and `astroquest_inventory` to browser `localStorage`.

---

## 5. Page Architecture & Routing

1.  **The Flight Deck (Dashboard):** 
    *   Contains the Top HUD (Rank, Stardust, Streak).
    *   Features an interactive, panning pixel-art Star Map to select learning domains (Sectors).
2.  **Mission Briefing (Pre-Game Lobby):** 
    *   A retro terminal interface with typing animations (green text on black).
    *   Displays the 3-sentence LLM-generated topic summary.
    *   "INITIATE LAUNCH" button transitions to the canvas.
3.  **Active Mission (Game Canvas):** 
    *   Full-screen HTML5 Canvas/WebGL layer.
    *   Overlay HUD for hull integrity (lives), score, and question text.
4.  **Telemetry Archives (Profile):** 
    *   Grid view of unlocked badges and a history log of answered questions for study review.

---

## 6. Micro-Game Engines & Integration
Questions generated by the API are physically injected into the gameplay loop.

*   **Game Mode 1: Asteroid Quiz Runner (Arcade Action)**
    *   *Mechanic:* A vertically scrolling rocket. A question appears on the HUD. Four pixelated asteroids spawn, marked A, B, C, D.
    *   *Integration:* The player steers the ship to crash into the correct asteroid. Correct = +100 Stardust and speed boost. Incorrect = Hull damage and explanation flash.
*   **Game Mode 2: Orbital Trajectory Simulator (Physics Puzzle)**
    *   *Mechanic:* Slingshot a probe around a gravity well. 
    *   *Integration:* Earning "Fuel Cells" for launch attempts requires answering a comms-satellite trivia prompt.
*   **Game Mode 3: Rover Payload Collector (Platformer)**
    *   *Mechanic:* Side-scrolling lunar rover jumping craters.
    *   *Integration:* Security gates block the path. Hitting a gate opens a terminal prompt. Correct answers open the gate; wrong answers reset to the checkpoint.

---

## 7. Data Architecture & API Pipeline

### The Dual-Layer Pipeline
Use the `@google/genai` SDK (Gemini 2.5 Flash) for dynamic content generation, with a strict local JSON fallback to ensure 100% uptime.

### API JSON Schema Contract
The LLM prompt MUST enforce this exact JSON structure (no markdown tags):
```json
{
  "topic": "String",
  "summary": "String (Exactly 3 concise sentences introducing the concept)",
  "questions": [
    {
      "id": 1,
      "question": "String",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctIndex": 0,
      "explanation": "String (Short telemetry explanation of the answer)"
    }
  ]
}