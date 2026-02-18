import { CONSTANTS } from "./constants.js";

// player.js
export const player = {
  w: CONSTANTS.PLAYER.WIDTH,
  h: CONSTANTS.PLAYER.HEIGHT,
  x: 0,
  y: 0,
  speed: CONSTANTS.PLAYER.SPEED,


  init(W, H) {
    this.x = W / 2 - this.w / 2;
    this.y = H - CONSTANTS.PLAYER.GAME_BOTTOM_OFFSET;



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
    ctx.save();

    // Subtle outline/glow for better visibility on bright screens
    ctx.shadowBlur = 12;
    ctx.shadowColor = "rgba(255,255,255,0.85)";

    if (this.sprite && this.sprite.complete && this.sprite.naturalWidth > 0) {
      ctx.drawImage(this.sprite, this.x, this.y, this.w, this.h);

      // Thin outline helps even more 
      ctx.shadowBlur = 0;
      ctx.lineWidth = 2;
      ctx.strokeStyle = "rgba(255,255,255,0.35)";
      ctx.strokeRect(this.x + 1, this.y + 1, this.w - 2, this.h - 2);
    } else {
      // fallback block + outline
      ctx.fillStyle = "#ee4444";
      ctx.fillRect(this.x, this.y, this.w, this.h);

      ctx.shadowBlur = 0;
      ctx.lineWidth = 2;
      ctx.strokeStyle = "rgba(255,255,255,0.6)";
      ctx.strokeRect(this.x + 1, this.y + 1, this.w - 2, this.h - 2);
    }

    ctx.restore();
  }


};
