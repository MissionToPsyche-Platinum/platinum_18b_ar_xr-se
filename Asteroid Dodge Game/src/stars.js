// stars.js
import { CONSTANTS } from "./constants.js";
const { STARS } = CONSTANTS;

export let stars = [];
const numStars = STARS.COUNT;
const speed = STARS.SPEED_FACTOR;


export function initStars(canvas) {
  stars = [];
  for (let i = 0; i < numStars; i++) {
    stars.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: Math.random() * 1.5,
      velocity: Math.random() * 1.0 + 1.0,
    });
  }
}

export function updateStars(canvas) {
  for (const star of stars) {
    star.y += star.velocity * speed;
    if (star.y > canvas.height) {
      star.y = 0;
      star.x = Math.random() * canvas.width;
    }
  }
}

export function drawStars(ctx) {
  ctx.fillStyle = "white";
  for (const star of stars) {
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
    ctx.fill();
  }
}
