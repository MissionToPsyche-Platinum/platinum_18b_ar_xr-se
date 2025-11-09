// startAsteroids.js
const NUM_ASTEROIDS = 8;

export const startAsteroids = {
  list: [],

  init(canvas) {
    this.list = [];
    for (let i = 0; i < NUM_ASTEROIDS; i++) {
      this.list.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: 40 + Math.random() * 60,
        speed: 10 + Math.random() * 20,
        rot: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.01
      });
    }
  },

  update(dt, canvas) {
    for (let a of this.list) {
      a.y += a.speed * dt;
      a.rot += a.rotSpeed;
      if (a.y - a.size > canvas.height) {
        a.y = -a.size;
        a.x = Math.random() * canvas.width;
      }
    }
  },

  draw(ctx) {
    ctx.save();
    ctx.strokeStyle = "gray";
    ctx.lineWidth = 2;

    for (let a of this.list) {
      ctx.save();
      ctx.translate(a.x, a.y);
      ctx.rotate(a.rot);

      ctx.beginPath();
      for (let i = 0; i < 7; i++) {
        const angle = (i / 7) * Math.PI * 2;
        const r = a.size / 2 + Math.sin(angle * 3) * 4;
        ctx.lineTo(Math.cos(angle) * r, Math.sin(angle) * r);
      }
      ctx.closePath();
      ctx.stroke();
      ctx.restore();
    }

    ctx.restore();
  }
};
