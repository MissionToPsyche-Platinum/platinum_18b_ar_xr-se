// asteroid.js
import { isColliding } from './utils.js';
import { sounds } from './audio.js';
import { gameState } from './main.js';

export const asteroids = [];
let spawnTimer = 0;
const spawnInterval = 0.8;

export function updateAsteroids(dt, player, H, difficulty, activePowerUps, onGameOver) {
  spawnTimer += dt;
  if (spawnTimer > spawnInterval / difficulty) {
    spawnTimer = 0;
    asteroids.push({
      w: 40, h: 40,
      x: Math.random() * (800 - 40),
      y: -40,
      speed: (100 + Math.random() * 150) * difficulty
    });
  }

  for (let i = asteroids.length - 1; i >= 0; i--) {
    const a = asteroids[i];
    a.y += a.speed * dt;

    if (isColliding(a, player)) {
      if (activePowerUps.shield) {
        activePowerUps.shield = false;
        asteroids.splice(i, 1);
      } else {
        sounds.bg.pause();
        sounds.gameover.currentTime = 0;
        sounds.gameover.play();
        onGameOver();   // 🔥 call the callback instead of touching gameState
        break;
      }
    }

    if (a.y > H) asteroids.splice(i, 1);
  }
}


export function drawAsteroids(ctx) {
  ctx.fillStyle = "#f00";
  for (const a of asteroids) ctx.fillRect(a.x, a.y, a.w, a.h);
}
