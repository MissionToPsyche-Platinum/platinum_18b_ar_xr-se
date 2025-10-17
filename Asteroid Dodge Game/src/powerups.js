// powerups.js
import { isColliding } from './utils.js';

export const powerUps = [];
const powerUpInterval = 10;
let powerUpTimer = 0;
const powerUpDuration = 5;

export const activePowerUps = { shield: false, scoreBoost: false };
export const powerUpTimers = { shield: 0, scoreBoost: 0 };

export function updatePowerUps(dt, player, H) {
  powerUpTimer += dt;
  if (powerUpTimer > powerUpInterval) {
    powerUpTimer = 0;
    const type = Math.random() < 0.5 ? 'shield' : 'scoreBoost';
    powerUps.push({
      type,
      w: 30,
      h: 30,
      x: Math.random() * (player.canvasWidth - 30),
      y: -30,
      speed: 100 + Math.random() * 50
    });
  }

  for (let i = powerUps.length - 1; i >= 0; i--) {
    const p = powerUps[i];
    p.y += p.speed * dt;

    if (isColliding(p, player)) {
      activePowerUps[p.type] = true;
      powerUpTimers[p.type] = powerUpDuration;
      powerUps.splice(i, 1);
      continue;
    }
    if (p.y > H) powerUps.splice(i, 1);
  }

  for (const key in powerUpTimers) {
    if (activePowerUps[key]) {
      powerUpTimers[key] -= dt;
      if (powerUpTimers[key] <= 0) activePowerUps[key] = false;
    }
  }
}

export function drawPowerUps(ctx) {
  for (const p of powerUps) {
    ctx.fillStyle = p.type === "shield" ? "cyan" : "gold";
    ctx.fillRect(p.x, p.y, p.w, p.h);
  }
}
