// player.js
export const player = {
  w: 40,
  h: 40,
  x: 0,
  y: 0,
  speed: 300,

  init(W, H) {
    this.x = W / 2 - this.w / 2;
    this.y = H - this.h - 20;

    // Loads the space shuttle pic
    this.sprite = new Image();
    this.sprite.src = './spaceShuttle.png';
    this.sprite.onload = () => console.log("Shuttle image loaded successfully");
    this.sprite.onerror = (e) => console.error("Shuttle image failed to load:", e);
  },

  update(dt, keys, W) {
    let vx = 0;
    if (keys.left) vx -= this.speed;
    if (keys.right) vx += this.speed;
    this.x += vx * dt;

    // keep in bounds
    if (this.x < 0) this.x = 0;
    if (this.x + this.w > W) this.x = W - this.w;
  },

  draw(ctx) {
    if (this.sprite && this.sprite.complete && this.sprite.naturalWidth > 0) {
      ctx.drawImage(this.sprite, this.x, this.y, this.w, this.h);
    } else {
      ctx.fillStyle = "#ee4444"; // red block fallback
      ctx.fillRect(this.x, this.y, this.w, this.h);
    }
  }
};
