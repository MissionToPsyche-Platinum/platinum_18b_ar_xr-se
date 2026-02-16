// main.js
import { player } from './player.js';
import { sounds } from './audio.js';
import { updateAsteroids, drawAsteroids, resetAsteroids } from './asteroid.js';
import { updatePowerUps, drawPowerUps, activePowerUps, resetPowerUps } from './powerups.js';
import { initStars, updateStars, drawStars } from './stars.js';
import { startMenu } from './start.js';
import { effects } from './effects.js';
import { CONSTANTS } from "./constants.js";
import { facts } from "./facts.js";

export let gameState = "start";

const { SCORING, UI, PLAYER } = CONSTANTS;

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
let gameOverFade = 0;
let isPaused = false; 
effects.playerRef = player;


//fit to screen for mobile/web
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
let W = canvas.width;
let H = canvas.height;

// --- Initialize Player ---
player.init(W, H);

// --- Initialize Facts --- //
facts.init();


// Keep updated when window resizes
window.addEventListener('resize', () => {
  resizeCanvas();
  W = canvas.width;
  H = canvas.height;
});




// --- Input (keyboard) ---
let keys = { left: false, right: false };
window.addEventListener('keydown', e => {
  if (e.code === 'ArrowLeft' || e.code === 'KeyA') keys.left = true;
  if (e.code === 'ArrowRight' || e.code === 'KeyD') keys.right = true;
  if (e.code === 'Space') {
    if (gameState === "start") startGame();
    else if (gameState === "gameover") restartGame();
  }

   // Toggle educational facts
  if (e.code === 'KeyF') {
    facts.toggle();
  }

  if ((e.code === "KeyP" || e.code === "Escape") && gameState === "playing") {
    isPaused = !isPaused;
    // Stop movement if a key was held during pause
    keys.left = false;
    keys.right = false;
  }

});

window.addEventListener('keyup', e => {
  if (e.code === 'ArrowLeft' || e.code === 'KeyA') keys.left = false;
  if (e.code === 'ArrowRight' || e.code === 'KeyD') keys.right = false;
});

// --- Touch (Mobile) ---
// Supports BOTH:
// 1) Tap/hold left-right zones for movement
// 2) Swipe/drag to reposition the ship
let touchStartX = null;
let touchMoved = false;

canvas.addEventListener(
  "touchstart",
  (e) => {
    e.preventDefault();
    const x = e.touches[0].clientX;

    touchStartX = x;
    touchMoved = false;

    // Tap zones: left half = left, right half = right
    keys.left = x < W / 2;
    keys.right = x >= W / 2;
  },
  { passive: false }
);

canvas.addEventListener(
  "touchmove",
  (e) => {
    e.preventDefault();
    const x = e.touches[0].clientX;

    if (touchStartX === null) touchStartX = x;

    const delta = x - touchStartX;
    touchStartX = x;

    // If the finger actually moves, treat it as swipe control
    if (Math.abs(delta) > 2) {
      touchMoved = true;
      keys.left = false;
      keys.right = false;

      player.x += delta;

      // keep player in bounds
      if (player.x < 0) player.x = 0;
      if (player.x + player.w > W) player.x = W - player.w;
    }
  },
  { passive: false }
);

canvas.addEventListener(
  "touchend",
  (e) => {
    e.preventDefault();
    touchStartX = null;
    touchMoved = false;

    // stop tap-zone movement when finger lifts
    keys.left = false;
    keys.right = false;
  },
  { passive: false }
);


// --- Scoring / difficulty ---
let score = 0;
let highScore = parseInt(localStorage.getItem("highScore")) || 0;
let elapsedTime = 0;
let difficulty = 1;
let startHintTimer = 0;
let startHintAlpha = 0;

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
  startHintTimer = 0;
  startHintAlpha  = 1
  difficulty = 1;
  isPaused = false;

  resetAsteroids();
  resetPowerUps();
  effects.reset();
  facts.reset();

 
  // reset player position each run
  player.x = W / 2 - player.w / 2;
  player.y = H - PLAYER.GAME_BOTTOM_OFFSET;

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

// --- Difficulty easing --- (starts slow, ramps, then smooths out)
function easedDifficulty(elapsed, rampTime, cap) {
  const t = Math.max(0, Math.min(1, elapsed / rampTime)); 
  const eased = t * t * (3 - 2 * t); 
  return 1 + eased * cap; 
}


// --- Update ---
function update(dt) {
  if (gameState === "start") {
    startMenu.update(dt, canvas);
    updateStars(canvas);
    return;
  }

  if (gameState !== "playing") return;
    if (isPaused) {
    // Keep background alive
    updateStars(canvas);
    // Keep effects from animating while paused
     effects.update(dt);
    return;
  }


  // world + score and facts update
  updateStars(canvas);
  elapsedTime += dt;
  score = Math.floor(elapsedTime * (activePowerUps.scoreBoost ? SCORING.SCORE_BOOST_MULTIPLIER : 1));
  difficulty = easedDifficulty(elapsedTime, SCORING.DIFFICULTY_RAMP_TIME, SCORING.DIFFICULTY_CAP);
  facts.update(dt, elapsedTime, score);
  
  // --- Start hint timing (shows once per run) ---
  startHintTimer += dt;
  const hintHold = UI.START_HINT_HOLD;
  const hintFade = UI.START_HINT_FADE;

  if (startHintTimer <= hintHold) {
    startHintAlpha = 1;
  } else if (startHintTimer <= hintHold + hintFade) {
    const t = (startHintTimer - hintHold) / hintFade; // 0..1
    startHintAlpha = 1 - t;
  } else {
    startHintAlpha = 0;
  }

  // player movement
  player.update(dt, keys, W);

  // --- Collision check + asteroid update ---
  updateAsteroids(dt, player, W, H, difficulty, activePowerUps, () => {
    if (gameState !== "gameover") {
      effects.triggerExplosion(player.x + player.w / 2, player.y + player.h / 2);
      effects.triggerFlash();
      effects.triggerShake();

      sounds.bg.pause();
      updateHighScore();

      setTimeout(() => {
        gameState = "gameover";
      }, 1300);
    }
  },
  () => {
    // Near-miss feedback
    effects.triggerNearMiss(player);
  }
);


  // power-ups
  updatePowerUps(dt, player, W, H);

  // effects update
  effects.update(dt);
}

// --Draw ---
function draw() {
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = 'midnightblue';
  ctx.fillRect(0, 0, W, H);

  // background stars
  drawStars(ctx);

  if (gameState === "start") {
    startMenu.draw(ctx, W, H);
    return;
  }

  // --- Gameplay visuals ---
  drawAsteroids(ctx);
  drawPowerUps(ctx);
  player.draw(ctx);

  if (gameState === "playing") {
    // in-game HUD
    ctx.fillStyle = "white";
    ctx.font = UI.HUD_FONT;
    ctx.textAlign = "left";
    ctx.fillText(`Score: ${score}`, 20, 40);

    // --- Start hint overlay ---
    if (startHintAlpha > 0) {
      ctx.save();
      ctx.globalAlpha = startHintAlpha;

      // background pill
      const text = UI.START_HINT_TEXT;
      ctx.font = UI.START_HINT_FONT;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      const padX = 18;
      const padY = 10;
      const textW = ctx.measureText(text).width;
      const boxW = textW + padX * 2;
      const boxH = 22 + padY * 2;
      const x = W / 2;
      const y = UI.START_HINT_Y;

      // rounded-ish rectangle 
      ctx.fillStyle = "rgba(0,0,0,0.55)";
      ctx.fillRect(x - boxW / 2, y - boxH / 2, boxW, boxH);

      ctx.fillStyle = "white";
      ctx.fillText(text, x, y);

      ctx.restore();
    }


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

    // draw facts
    facts.draw(ctx, W);
  }

  //freeze frame when paused
    if (isPaused) {
      ctx.fillStyle = "rgba(0,0,0,0.55)";
      ctx.fillRect(0, 0, W, H);

      ctx.textAlign = "center";
      ctx.fillStyle = "white";
      ctx.font = "bold 60px sans-serif";
      ctx.fillText("PAUSED", W / 2, H / 2 - 40);

      ctx.font = "22px sans-serif";
      ctx.fillStyle = "lightgray";
      ctx.fillText("Press P or Esc to Resume", W / 2, H / 2 + 20);
    }

  // --- Draw effects on top of everything ---
  effects.draw(ctx, W, H);

  if (gameState === "gameover") {
    // blackout overlay
    ctx.fillStyle = "rgba(0,0,0,0.85)";
    ctx.fillRect(0, 0, W, H);
    ctx.textAlign = "center";
    
    ctx.font = UI.GAMEOVER_TITLE_FONT;   
    ctx.fillStyle = "red";
    ctx.fillText("GAME OVER", W / 2, H / 2 - 80);

    ctx.font = UI.GAMEOVER_STATS_FONT;         
    ctx.fillStyle = "gold";
    ctx.fillText(`🏆 High Score: ${highScore}`, W / 2, H / 2);

    ctx.fillStyle = "white";
    ctx.fillText(`💫 Your Score: ${score}`, W / 2, H / 2 + 40);

    ctx.font = UI.GAMEOVER_HINT_FONT;        
    ctx.fillStyle = "lightgray";
    ctx.fillText("Tap to Restart", W / 2, H / 2 + 100);
  }
}

requestAnimationFrame(loop);
