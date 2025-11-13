// asteroid.js
import { isColliding } from './utils.js';
import { sounds } from './audio.js';

export const asteroids = [];
let spawnTimer = 0;
const spawnInterval = 0.8;

// --- Load Asteroid Images ---
const asteroidImgs = [];
for (let i = 1; i <= 2; i++) {
  const img = new Image();
  img.src = `src/assets/meteor${i}.png`; 
  asteroidImgs.push(img);
}

export function updateAsteroids(dt, player, W, H, difficulty, activePowerUps, onGameOver) {
  spawnTimer += dt;
  if (spawnTimer > spawnInterval / difficulty) {
    spawnTimer = 0;
    asteroids.push({
      w: 40,
      h: 40,
      x: Math.random() * (W - 40),
      y: -40,
      speed: (100 + Math.random() * 150) * difficulty,
      rot: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.05,
      img: asteroidImgs[Math.floor(Math.random() * asteroidImgs.length)]
    });
  }

  for (let i = asteroids.length - 1; i >= 0; i--) {
    const a = asteroids[i];
    a.y += a.speed * dt;
    a.rot += a.rotSpeed;

    // Collision detection
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

    // Remove off-screen asteroids
    if (a.y > H) asteroids.splice(i, 1);
  }
}

export function drawAsteroids(ctx) {
  for (const a of asteroids) {
    ctx.save();
    ctx.translate(a.x + a.w / 2, a.y + a.h / 2);
    ctx.rotate(a.rot);

    // Only draw if the image has loaded successfully
    if (a.img && a.img.complete && a.img.naturalWidth > 0) {
      ctx.drawImage(a.img, -a.w / 2, -a.h / 2, a.w, a.h);
    } else {
      // red rectangle if image hasn’t loaded yet
      ctx.fillStyle = "#f00";
      ctx.fillRect(-a.w / 2, -a.h / 2, a.w, a.h);
    }

    ctx.restore();
  }
}

export function resetAsteroids() {
  asteroids.length = 0;
  spawnTimer = 0;
}
