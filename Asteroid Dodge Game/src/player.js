// player
export const player = {
  w: 40,
  h: 40,
  x: 0,
  y: 0,
  speed: 300,

  init(W, H) {
    this.x = W / 2 - this.w / 2;
    this.y = H - 60;
  },

  update(dt, keys, W) {
    let vx = 0;
    if (keys.left) vx -= this.speed;
    if (keys.right) vx += this.speed;
    this.x += vx * dt;
    if (this.x < 0) this.x = 0;
    if (this.x + this.w > W) this.x = W - this.w;
  },

  draw(ctx) {
    ctx.fillStyle = "#fff";
    ctx.fillRect(this.x, this.y, this.w, this.h);
  }
};
