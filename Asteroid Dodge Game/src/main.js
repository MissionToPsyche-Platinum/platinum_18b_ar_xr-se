// main.js
import { player } from './player.js';
import { sounds } from './audio.js';
import { asteroids, updateAsteroids, drawAsteroids } from './asteroid.js';
import { powerUps, updatePowerUps, drawPowerUps, activePowerUps, powerUpTimers } from './powerups.js';
export let gameState = "start";


const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

// Auto-scale to fit screen
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const W = canvas.width;
const H = canvas.height;

window.addEventListener('resize', () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});


player.init(W, H);

let keys = { left: false, right: false };
let score = 0;
let elapsedTime = 0;
let difficulty = 1;

window.addEventListener('keydown', e => {
  if (e.code === 'ArrowLeft' || e.code === 'KeyA') keys.left = true;
  if (e.code === 'ArrowRight' || e.code === 'KeyD') keys.right = true;
  if (e.code === 'Space') {
    if (gameState === "start") startGame();
    else if (gameState === "gameover") restartGame();
  }
});

window.addEventListener('keyup', e => {
  if (e.code === 'ArrowLeft' || e.code === 'KeyA') keys.left = false;
  if (e.code === 'ArrowRight' || e.code === 'KeyD') keys.right = false;
});

// Support for mobile controls
let touchStartX = null;

canvas.addEventListener('touchstart', e => {
  touchStartX = e.touches[0].clientX;
});

canvas.addEventListener('touchmove', e => {
  const currentX = e.touches[0].clientX;
  const delta = currentX - touchStartX;
  touchStartX = currentX;
  player.x += delta; // move relative to drag
  if (player.x < 0) player.x = 0;
if (player.x + player.w > canvas.width) player.x = canvas.width - player.w;

});

canvas.addEventListener('touchend', e => {
  // A tap (short touch) triggers shooting
  if (e.changedTouches.length === 1 && e.changedTouches[0].clientX === touchStartX) {
    shoot(player);
  }
  touchStartX = null;
});


function startGame() {
  gameState = "playing";
  score = 0;
  elapsedTime = 0;
  difficulty = 1;
  asteroids.length = 0;
  powerUps.length = 0;

  sounds.start.play();
  sounds.bg.currentTime = 0;
  sounds.bg.play();
}

function restartGame() {
  startGame();
}

let lastTime = performance.now();
function loop(now) {
  const dt = (now - lastTime) / 1000;
  lastTime = now;
  update(dt);
  draw();
  requestAnimationFrame(loop);
}

function update(dt) {
  if (gameState !== "playing") return;

  elapsedTime += dt;
  score = Math.floor(elapsedTime * (activePowerUps.scoreBoost ? 2 : 1));
  difficulty = 1 + Math.min(elapsedTime / 10, 4);

  player.update(dt, keys, W);
  updateAsteroids(dt, player, H, difficulty, activePowerUps, () => {
  gameState = "gameover";
});
  updatePowerUps(dt, player, H);
}

function draw() {
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = 'midnightblue';
  ctx.fillRect(0, 0, W, H);

  if (gameState === "start") {
    ctx.fillStyle = "white";
    ctx.font = "48px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("ASTEROID DODGE", W / 2, H / 2 - 40);
    ctx.font = "24px sans-serif";
    ctx.fillText("Press SPACE to Start", W / 2, H / 2 + 20);
    return;
  }

  drawAsteroids(ctx);
  drawPowerUps(ctx);
  player.draw(ctx);

  ctx.fillStyle = "white";
  ctx.font = "24px monospace";
  ctx.textAlign = "left";
  ctx.fillText(`Score: ${score}`, 20, 40);

  let y = 70;
  if (activePowerUps.shield) {
    ctx.fillStyle = "cyan";
    ctx.fillText("🛡️ Shield Active", 20, y);
    y += 30;
  }
  if (activePowerUps.scoreBoost) {
    ctx.fillStyle = "gold";
    ctx.fillText("💫 Score x2", 20, y);
  }

  if (gameState === "gameover") {
    ctx.fillStyle = "white";
    ctx.font = "48px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("GAME OVER", W / 2, H / 2);
    ctx.font = "24px sans-serif";
    ctx.fillText("Press SPACE to Restart", W / 2, H / 2 + 40);
  }
}

requestAnimationFrame(loop);
