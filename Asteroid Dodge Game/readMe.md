# 🚀 Asteroid Dodge  
**Part of the Platinum AR/XR Psyche Project — Team 35**

## 🪐 Overview
Asteroid Dodge is a fast-paced, reflex-driven browser game built in vanilla JavaScript and HTML5 Canvas.  
Players control a Psyche satellite, dodging falling asteroids while collecting power-ups to boost score or activate shields.  
It’s designed as a mobile-friendly outreach activity for the **NASA Psyche Mission** exhibit.

---

## 🎮 Gameplay
- **Objective:** Survive as long as possible while dodging asteroids and collecting power-ups.  
- **Controls:**  
  - Move with arrow keys, WASD, or drag/tap on mobile.  
  - Avoid red asteroids and grab glowing icons for bonuses.  
- **Power-Ups:**  
  - 🛡️ **Shield:** Temporary invincibility with a blue aura.  
  - ✨ **Score Boost:** Doubles points for 5 seconds.  
- **Visual Effects:**  
  - Particle explosions and screen shake on collisions.  
  - Flash and glow feedback for power-up collection.  
  - Persistent cyan shield aura while shield is active.

---

## 🧠 Features
- Real-time physics & collision detection  
- Modular code structure (asteroids, power-ups, effects, player)  
- Dynamic audio (background + power-up cues)  
- Mobile scaling and responsive UI  
- 100% pure JS / Canvas (no frameworks)  

---

## 🧩 File Structure
Asteroid Dodge Game/
├─ docs/
│ └─ sprint1/UML Diagrams/
│ ├─ ActivityDiagram.pdf
│ ├─ AsteroidDodgeUseCase.pdf
│ └─ ClassDiagram.pdf
├─ sounds/
│ ├─ game-over.mp3
│ ├─ game-start.mp3
│ ├─ powerup_scoreboost.mp3
│ ├─ powerup_shield.mp3
│ └─ spaceship.mp3
├─ src/
│ ├─ assets/
│ │ ├─ meteor1.png
│ │ ├─ meteor2.png
│ │ ├─ shield.png
│ │ └─ doubleScore.png
│ ├─ asteroid.js
│ ├─ audio.js
│ ├─ effects.js
│ ├─ main.js
│ ├─ player.js
│ ├─ powerups.js
│ ├─ stars.js
│ ├─ start.js
│ ├─ startAsteroids.js
│ └─ utils.js
├─ index.html
├─ readMe.md
└─ spaceShuttle.png

---

## ⚙️ Setup & Running
1. Clone the repository.  
2. Open this folder in VS Code.  
3. Launch with the **Live Server** extension or any local HTTP server.  
4. Open `index.html` in your browser (works on desktop and mobile).  

---

## 🧱 Tech Stack
- JavaScript (ES6 Modules)  
- HTML5 Canvas API  
- CSS / Inline Styles for layout  
- GitHub Pages for hosting  

---

## 🚧 Future Improvements
- Add leaderboard + high scores  
- Add additional power-ups (slow-motion, magnet, double asteroid)  
- Animate background stars for depth effect  
- Integrate sound toggle buttons  

---

## 🧑‍🚀 Credits
**Developed by Team 35 – SER 401, Arizona State University**  
Contributors: John Sullins, Alex Allen, Mitchell Allen, Brayden Brown, Bryce Marrello  
Assets: NASA Psyche imagery (public domain) + open-source icons  
License: MIT  

