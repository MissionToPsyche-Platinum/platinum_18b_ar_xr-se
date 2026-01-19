import { activePowerUps } from './powerups.js'; 

// effects.js
export const effects = {
powerGlows: [],
  explosions: [],
  flashAlpha: 0,
  shakeTimer: 0,
  shakeIntensity: 6,

  // --- Explosion setup ---
  triggerExplosion(x, y) {
    for (let i = 0; i < 25; i++) {
      this.explosions.push({
        x,
        y,
        size: 2 + Math.random() * 4,
        color: `hsl(${Math.random() * 30}, 100%, 60%)`, // orange/yellow tone
        vx: (Math.random() - 0.5) * 250,
        vy: (Math.random() - 0.5) * 250,
        life: 1.2 + Math.random() * 0.5
      });
    }
  },

  triggerFlash() {
    this.flashAlpha = 1;
  },

  triggerShake() {
    this.shakeTimer = 0.6; // 0.6 seconds of shake
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
    life: 0.6
  });
},

  updatePowerGlows(dt) {
    this.powerGlows.forEach(g => {
      g.r += 60 * dt;   // expand
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
