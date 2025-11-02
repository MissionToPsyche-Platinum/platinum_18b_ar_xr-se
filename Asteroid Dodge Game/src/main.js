// main.js
import { player } from './player.js';
import { sounds } from './audio.js';
import { updateAsteroids, drawAsteroids, resetAsteroids } from './asteroid.js';
import { updatePowerUps, drawPowerUps, activePowerUps, resetPowerUps } from './powerups.js';
import { initStars, updateStars, drawStars } from './stars.js';
import { startMenu } from './start.js';



export let gameState = "start";

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

// Fit to screen once for mobile devices
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const W = canvas.width;
const H = canvas.height;

player.init(W, H);

// --- Input (keyboard) ---
let keys = { left: false, right: false };
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

// --- Touch -- Mobile only ---
let touchStartX = null;
canvas.addEventListener('touchstart', e => {
  touchStartX = e.touches[0].clientX;
});
canvas.addEventListener('touchmove', e => {
  const currentX = e.touches[0].clientX;
  const delta = currentX - touchStartX;
  touchStartX = currentX;
  player.x += delta;

  // keep player in bounds
  if (player.x < 0) player.x = 0;
  if (player.x + player.w > canvas.width) player.x = canvas.width - player.w;
});
canvas.addEventListener('touchend', () => {
  touchStartX = null;
});

// --- Scoring / difficulty ---
let score = 0;
let highScore = parseInt(localStorage.getItem("highScore")) || 0;
let elapsedTime = 0;
let difficulty = 1;

function updateHighScore() {
  if (score > highScore) {
    highScore = score;
    localStorage.setItem("highScore", highScore);
  }
}

startMenu.init(canvas);

// --- Game flow ---
function startGame() {
  gameState = "playing";
  score = 0;
  elapsedTime = 0;
  difficulty = 1;
  resetAsteroids();
  resetPowerUps();
 
  // reset player position each run
  player.x = W / 2 - player.w / 2;
  player.y = H - 60;

  sounds.start.currentTime = 0;
  sounds.start.play();
  sounds.bg.currentTime = 0;
  sounds.bg.play();

  initStars(canvas);
}

function restartGame() {
  startGame();
}

// --- Loop ---
let lastTime = performance.now();
function loop(now) {
  const dt = (now - lastTime) / 1000;
  lastTime = now;
  update(dt);
  draw();
  requestAnimationFrame(loop);
}

// --- Update ---
function update(dt) {
  if (gameState === "start") {
  startMenu.update(dt, canvas);
  updateStars(canvas);
  return;
}

  if (gameState !== "playing") return;

  // world + score
  updateStars(canvas);
  elapsedTime += dt;
  score = Math.floor(elapsedTime * (activePowerUps.scoreBoost ? 2 : 1));
  difficulty = 1 + Math.min(elapsedTime / 10, 4);

  // player movement (keyboard)
  player.update(dt, keys, W);

  // asteroids
  updateAsteroids(dt, player, W, H, difficulty, activePowerUps, () => {
  if (gameState !== "gameover") {
    gameState = "gameover";
    sounds.bg.pause();
    updateHighScore();   
  }
});

  // power-ups
 updatePowerUps(dt, player, W, H);

}

// --- Draw ---
function draw() {
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = 'midnightblue';
  ctx.fillRect(0, 0, W, H);

  // background stars on all screens
  drawStars(ctx);


  if (gameState === "start") {
  drawStars(ctx);
  startMenu.draw(ctx, W, H);
  return;
}


  // game play layer
  drawAsteroids(ctx);
  drawPowerUps(ctx);
  player.draw(ctx);

  if (gameState === "playing") {
    // in-game HUD
    ctx.fillStyle = "white";
    ctx.font = "24px monospace";
    ctx.textAlign = "left";
    ctx.fillText(`Score: ${score}`, 20, 40);

    // power-up indicators
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
  }

  if (gameState === "gameover") {
    // blackout overlay
    ctx.fillStyle = "rgba(0,0,0,0.85)";
    ctx.fillRect(0, 0, W, H);
    ctx.textAlign = "center";
    ctx.font = "bold 60px sans-serif";
    ctx.fillStyle = "red";
    ctx.fillText("GAME OVER", W / 2, H / 2 - 80);

    ctx.font = "28px monospace";
    ctx.fillStyle = "gold";
    ctx.fillText(`🏆 High Score: ${highScore}`, W / 2, H / 2);

    ctx.fillStyle = "white";
    ctx.fillText(`💫 Your Score: ${score}`, W / 2, H / 2 + 40);

    ctx.font = "22px sans-serif";
    ctx.fillStyle = "lightgray";
    ctx.fillText("Press SPACE to Restart", W / 2, H / 2 + 100);
  }
}

requestAnimationFrame(loop);
