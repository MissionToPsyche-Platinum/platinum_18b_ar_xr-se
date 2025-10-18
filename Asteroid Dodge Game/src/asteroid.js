// asteroid.js
import { isColliding } from './utils.js';
import { sounds } from './audio.js';


export const asteroids = [];
let spawnTimer = 0;
const spawnInterval = 0.8;

export function updateAsteroids(dt, player, W, H, difficulty, activePowerUps, onGameOver) {
  spawnTimer += dt;
  if (spawnTimer > spawnInterval / difficulty) {
    spawnTimer = 0;
    asteroids.push({
      w: 40, h: 40,
      x: Math.random() * (W - 40),    // ← use W, not 800
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
        onGameOver();
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


export function resetAsteroids() {
  asteroids.length = 0;
  spawnTimer = 0;
}
