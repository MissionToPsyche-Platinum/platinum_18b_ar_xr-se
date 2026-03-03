// effects.js
import { activePowerUps } from './powerups.js';
import { CONSTANTS } from "./constants.js";
const { EFFECTS } = CONSTANTS;

export const effects = {
powerGlows: [],
  explosions: [],
  flashAlpha: 0,
  shakeTimer: 0,
  shakeIntensity: EFFECTS.SHAKE_INTENSITY,

  // --- Explosion setup ---
  triggerExplosion(x, y) {
    for (let i = 0; i < EFFECTS.EXPLOSION_PARTICLES; i++) {
      this.explosions.push({
        x,
        y,
        size: 2 + Math.random() * 4,
        color: `hsl(${Math.random() * 30}, 100%, 60%)`, // orange/yellow tone
        vx: (Math.random() - 0.5) * 250,
        vy: (Math.random() - 0.5) * 250,
        life: EFFECTS.EXPLOSION_LIFE_MIN + Math.random() * EFFECTS.EXPLOSION_LIFE_VARIANCE
      });
    }
  },

  triggerFlash() {
  this.flashAlpha = 1;
},

  triggerShake() {
    this.shakeTimer = EFFECTS.SHAKE_DURATION;
  },

    triggerNearMiss(player) {
    // small shake (lighter than game over)
    this.shakeTimer = Math.max(this.shakeTimer, 0.12);
    this.shakeIntensity = 2.5;

    // quick pulse around the player (reuse the glow system)
    this.powerGlows.push({
      x: player.x + player.w / 2,
      y: player.y + player.h / 2,
      r: player.w * 0.9,
      color: "rgba(255,255,255,0.9)",
      life: 0.25
    });
  },


  update(dt) {
  // existing explosion, flash, shake logic…
  this.updatePowerGlows(dt);

    // Update explosions
    this.explosions.forEach(p => {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt;
    });
    this.explosions = this.explosions.filter(p => p.life > 0);

    // Update flash
    if (this.flashAlpha > 0) {
      this.flashAlpha -= dt * 1.2; // fade out
      if (this.flashAlpha < 0) this.flashAlpha = 0;
    }

    // Update shake timer
    if (this.shakeTimer > 0) {
      this.shakeTimer -= dt;
      if (this.shakeTimer < 0) this.shakeTimer = 0;
    }
  },
  
  triggerPowerGlow(type, player) {
  // Creates a quick pulse around player when a power-up is collected
  const color = type === "shield" ? "rgba(0,255,255,0.8)" : "rgba(255,215,0,0.8)";
  this.powerGlows.push({
    x: player.x + player.w / 2,
    y: player.y + player.h / 2,
    r: player.w,
    color,
    life: EFFECTS.POWER_GLOW_LIFE
  });
},

  updatePowerGlows(dt) {
    this.powerGlows.forEach(g => {
      g.r += EFFECTS.POWER_GLOW_EXPAND_SPEED * dt;   // expand
      g.life -= dt;     // fade
    });
    this.powerGlows = this.powerGlows.filter(g => g.life > 0);
  },


  draw(ctx, W, H) {
    ctx.save();

    // screen shake effect
    if (this.shakeTimer > 0) {
      const dx = (Math.random() - 0.5) * this.shakeIntensity;
      const dy = (Math.random() - 0.5) * this.shakeIntensity;
      ctx.translate(dx, dy);
    }

    // draw explosions
    this.explosions.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.globalAlpha = Math.max(p.life, 0);
      ctx.fill();
      ctx.globalAlpha = 1;
    });

      if (activePowerUps.shield && this.playerRef) {
  const p = this.playerRef;
  const time = Date.now() * 0.005;
  const pulse = 0.8 + Math.sin(time) * 0.2;

  ctx.save();
  ctx.beginPath();
  ctx.arc(p.x + p.w / 2, p.y + p.h / 2, p.w * 1.1, 0, Math.PI * 2);
  ctx.strokeStyle = `rgba(0, 255, 255, ${pulse})`; // cyan glow
  ctx.lineWidth = 4;
  ctx.shadowBlur = 15;
  ctx.shadowColor = "cyan";
  ctx.stroke();
  ctx.restore();
}

    // draw powerGlows (pulse rings)
    this.powerGlows.forEach(g => {
      const alpha = Math.max(0, g.life / 0.6); 
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      ctx.arc(g.x, g.y, g.r, 0, Math.PI * 2);
      ctx.strokeStyle = g.color;
      ctx.lineWidth = 3;
      ctx.stroke();
      ctx.restore();
    });


    // white flash overlay
    if (this.flashAlpha > 0) {
      ctx.fillStyle = `rgba(255,255,255,${this.flashAlpha})`;
      ctx.fillRect(0, 0, W, H);
    }
  ctx.restore();  
  },

  reset() {
  this.powerGlows = [];
  this.explosions = [];
  this.flashAlpha = 0;
  this.shakeTimer = 0;
}

};
