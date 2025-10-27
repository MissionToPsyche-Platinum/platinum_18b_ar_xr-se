// start.js
export const startMenu = {
  animTime: 0,

  update(dt, canvas) {
    this.animTime += dt;
  },

  draw(ctx, W, H) {
    ctx.save();
    ctx.textAlign = "center";

    // Title gradient
    const gradient = ctx.createLinearGradient(0, 0, W, 0);
    gradient.addColorStop(0, "cyan");
    gradient.addColorStop(0.5, "white");
    gradient.addColorStop(1, "violet");
    ctx.fillStyle = gradient;
    ctx.font = `${Math.floor(W / 15)}px Orbitron, sans-serif`;
    ctx.fillText("ASTEROID DODGE", W / 2, H / 2 - 100);

    // Pulse text
    const alpha = (Math.sin(this.animTime * 3) + 1) / 2;
    ctx.globalAlpha = alpha;
    ctx.font = `${Math.floor(W / 22)}px monospace`;
    ctx.fillStyle = "white";
    ctx.fillText("Tap to Start", W / 2, H / 2 + 40);
    ctx.globalAlpha = 1;

    ctx.restore();
  }
};
