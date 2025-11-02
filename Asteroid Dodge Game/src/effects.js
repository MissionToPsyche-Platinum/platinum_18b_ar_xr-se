// effects.js
export const effects = {
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

    ctx.restore();

    // white flash overlay
    if (this.flashAlpha > 0) {
      ctx.fillStyle = `rgba(255,255,255,${this.flashAlpha})`;
      ctx.fillRect(0, 0, W, H);
    }
  }
};
