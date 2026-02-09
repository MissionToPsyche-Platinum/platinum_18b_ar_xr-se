// asteroid.js
import { isColliding } from './utils.js';
import { sounds } from './audio.js';
import { CONSTANTS } from "./constants.js";

const { ASTEROIDS } = CONSTANTS;


export const asteroids = [];
let spawnTimer = 0;
const spawnInterval = ASTEROIDS.SPAWN_INTERVAL;

function isAABBColliding(a, b) {
  return (
    a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y
  );
}

function expandedBox(rect, margin) {
  return {
    x: rect.x - margin,
    y: rect.y - margin,
    w: rect.w + margin * 2,
    h: rect.h + margin * 2
  };
}



// --- Load Asteroid Images ---
const asteroidImgs = [];
for (let i = 1; i <= 2; i++) {
  const img = new Image();
  img.src = `src/assets/meteor${i}.png`; 
  asteroidImgs.push(img);
}

export function updateAsteroids(dt, player, W, H, difficulty, activePowerUps, onGameOver, onNearMiss)
 {
  spawnTimer += dt;
  if (spawnTimer > spawnInterval / difficulty) {
    spawnTimer = 0;
   asteroids.push({
      w: ASTEROIDS.SIZE,
      h: ASTEROIDS.SIZE,
      x: Math.random() * (W - ASTEROIDS.SIZE),
      y: -ASTEROIDS.SIZE,
      speed: (ASTEROIDS.BASE_SPEED + Math.random() * ASTEROIDS.SPEED_VARIANCE) * difficulty,
      rot: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * ASTEROIDS.ROT_SPEED_VARIANCE,
      img: asteroidImgs[Math.floor(Math.random() * asteroidImgs.length)]
    });
  }

  for (let i = asteroids.length - 1; i >= 0; i--) {
    const a = asteroids[i];
    a.y += a.speed * dt;
    a.rot += a.rotSpeed;

    // Near-miss detection...Triggers once per asteroid.
    if (!a.nearMissed && typeof onNearMiss === "function") {
      const margin = 14; // adjust 10-18 for feel
      const nearZone = expandedBox(player, margin);

      // "near miss" = overlaps nearZone
      if (isAABBColliding(a, nearZone) && !isColliding(a, player)) {
        a.nearMissed = true;
        onNearMiss();
      }
    }

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
