# Asteroid Dodge

## Overview
Asteroid Dodge is a reflex-based, browser-playable arcade game developed as part of the
**Platinum AR/XR Project** for the **Mission to Psyche** outreach initiative.
The game is designed to provide a fun, fast-paced interaction for museum or exhibit visitors
who access the experience by scanning a QR code on a physical Psyche asteroid model.

Players control a Psyche satellite and must avoid falling asteroids while collecting power-ups
to survive as long as possible and maximize their score.

This module is designed to run entirely in modern mobile and desktop browsers without
requiring installation or user accounts.

---

## Educational Purpose
Asteroid Dodge reinforces concepts related to:
- Orbital navigation and spatial awareness
- Reaction time and decision-making
- Engagement with NASA’s Psyche mission themes through interactive play

The experience is intentionally lightweight and accessible to users of all ages.

---

## Gameplay Features
- Continuous asteroid spawning with increasing difficulty
- Score tracking based on survival time
- Power-ups:
  - **Shield** – temporary invulnerability
  - **Slow Motion** – reduces asteroid speed
- Animated start screen
- Collision effects (screen shake, flash, explosion visuals)
- Game over state with restart functionality

---

## Controls
### Mobile
- Touch-based movement controls

### Desktop
- Keyboard input (arrow keys or WASD, depending on configuration)

---

## Technical Details
- **Language:** JavaScript
- **Rendering:** HTML5 Canvas
- **Styling:** CSS
- **Audio:** HTML Audio API
- **Architecture:** Modular JavaScript components for maintainability

The game logic, rendering, audio, and effects are separated into reusable modules to support
future expansion and easier debugging.

---

## File Structure (Simplified)
