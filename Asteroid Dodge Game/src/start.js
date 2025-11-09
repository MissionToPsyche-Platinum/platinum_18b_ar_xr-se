// start.js
import { startAsteroids } from './startAsteroids.js';
export const startMenu = {
  animTime: 0,

  init(canvas) {
    startAsteroids.init(canvas);
  },

  update(dt, canvas) {
    this.animTime += dt;
    startAsteroids.update(dt, canvas);
  },

  draw(ctx, W, H) {
    // draw background asteroids
    startAsteroids.draw(ctx);

    ctx.save();
    ctx.textAlign = "center";

    // title gradient
    const gradient = ctx.createLinearGradient(0, 0, W, 0);
    gradient.addColorStop(0, "cyan");
    gradient.addColorStop(0.5, "white");
    gradient.addColorStop(1, "violet");
    ctx.fillStyle = gradient;
    ctx.font = `${Math.floor(W / 15)}px Orbitron, sans-serif`;
    ctx.fillText("ASTEROID DODGE", W / 2, H / 2 - 100);

    // blinking "Tap to Start"
    const alpha = (Math.sin(this.animTime * 3) + 1) / 2;
    ctx.globalAlpha = alpha;
    ctx.font = `${Math.floor(W / 22)}px monospace`;
    ctx.fillStyle = "white";
    ctx.fillText("Tap to Start", W / 2, H / 2 + 40);
    ctx.globalAlpha = 1;

    ctx.restore();
  }
};

