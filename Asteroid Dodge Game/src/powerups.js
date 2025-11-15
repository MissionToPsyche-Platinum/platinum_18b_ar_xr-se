// powerups.js
import { isColliding } from './utils.js';
import { sounds } from './audio.js';
import { effects } from './effects.js';



export const powerUps = [];
const powerUpInterval = 10;
let powerUpTimer = 0;
const powerUpDuration = 5;

// Load Power-Up Images
const powerUpImgs = {
  shield: new Image(),
  scoreBoost: new Image()
};
powerUpImgs.shield.src = "src/assets/shield.png";
powerUpImgs.scoreBoost.src = "src/assets/doubleScore.png";


export const activePowerUps = { shield: false, scoreBoost: false };
export const powerUpTimers = { shield: 0, scoreBoost: 0 };

export function updatePowerUps(dt, player, W, H) {
  powerUpTimer += dt;
  if (powerUpTimer > powerUpInterval) {
    powerUpTimer = 0;
    const type = Math.random() < 0.5 ? 'shield' : 'scoreBoost';
    powerUps.push({
      type,
      w: 30,
      h: 30,
      x: Math.random() * (W - 30),   // ← use W
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

      activePowerUps[p.type] = true;
      powerUpTimers[p.type] = powerUpDuration;
      effects.triggerPowerGlow(p.type, player);
        
      // Play power-up sound based on type
      if (p.type === 'shield' && sounds.powerupShield) {
        sounds.powerupShield.currentTime = 0;
        sounds.powerupShield.play();
      } 
      else if (p.type === 'scoreBoost' && sounds.powerupScore) {
        sounds.powerupScore.currentTime = 0;
        sounds.powerupScore.play();
      }
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
    ctx.save();
    ctx.translate(p.x + p.w / 2, p.y + p.h / 2);

    if (powerUpImgs[p.type] && powerUpImgs[p.type].complete) {
      ctx.drawImage(powerUpImgs[p.type], -p.w / 2, -p.h / 2, p.w, p.h);
    } else {
      ctx.fillStyle = p.type === "shield" ? "cyan" : "gold";
      ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
    }

    ctx.restore();
  }
}



export function resetPowerUps() {
  powerUps.length = 0;
  powerUpTimer = 0;
  activePowerUps.shield = false;
  activePowerUps.scoreBoost = false;
  powerUpTimers.shield = 0;
  powerUpTimers.scoreBoost = 0;
}
