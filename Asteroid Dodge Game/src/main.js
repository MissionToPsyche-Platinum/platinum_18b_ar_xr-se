// ==============================
//          main.js
// ==============================
import { player } from './player.js';
import { sounds } from './audio.js';
import { updateAsteroids, drawAsteroids, resetAsteroids } from './asteroid.js';
import { updatePowerUps, drawPowerUps, activePowerUps, resetPowerUps } from './powerups.js';
import { initStars, updateStars, drawStars } from './stars.js';
import { toggleMenu, isMenuVisible } from "./menu.js";

import { startMenu } from './start.js';
import { effects } from './effects.js';
import { CONSTANTS } from "./constants.js";
import { facts } from "./facts.js";

export let gameState = "start";
let prevState;

const { SCORING, UI, PLAYER } = CONSTANTS;

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
let gameOverFade = 0;
let isPaused = false;
effects.playerRef = player;

const pauseBtn = {
  size: 56,
  pad: 16,
  x: 0, y:0, w:0, h:0,
  updateBounds(W) {
    this.w = this.size;
    this.h = this.size;
    this.x = W - this.pad - this.size;
    this.y = this.pad;
  },
  contains(px, py) {
    return px >= this.x && px <= this.x + this.w && py >= this.y && py <= this.y + this.h;
  }
};

//fit to screen for mobile/web
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  pauseBtn.updateBounds(canvas.width);
}
resizeCanvas();
let W = canvas.width;
let H = canvas.height;

// --- UI scaling helpers ---
function getUiScale() {
  // 390x844 scale down/up smoothly
  return Math.min(W / 390, H / 844);
}

function fontPx(px, family = "sans-serif", weight = "") {
  const size = Math.max(12, Math.round(px * getUiScale())); // never too tiny
  return `${weight ? weight + " " : ""}${size}px ${family}`;
}

// --- Safe area ---
function getSafeTop() {
  // visualViewport offset helps on mobile browsers 
  const vv = window.visualViewport;
  const top = vv ? Math.max(0, vv.offsetTop) : 0;
  return top + 16; // add small margin so HUD isn't hugging the edge
}


// --- Mobile haptics (safe fallback) ---
function vibrate(pattern) {
  if (navigator.vibrate) navigator.vibrate(pattern);
}

// --- Initialize Player ---
player.init(W, H);

// --- Initialize Facts ---
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
  if (e.code === 'KeyF') facts.toggle();

  if (e.code === 'Escape') {
    toggleMenu();
    if(isMenuVisible()) {
      prevState = gameState;
      gameState = "menu";
    } else {
      gameState = prevState;
      prevState = null;
    }
  }

  if ((e.code === "KeyP") && gameState === "playing") {
    isPaused = !isPaused;
    keys.left = false;
    keys.right = false;
  }
});

window.addEventListener('keyup', e => {
  if (e.code === 'ArrowLeft' || e.code === 'KeyA') keys.left = false;
  if (e.code === 'ArrowRight' || e.code === 'KeyD') keys.right = false;
});

// --- Auto-pause when app loses focus ---
document.addEventListener("visibilitychange", () => {
  if (document.hidden && gameState === "playing") {
    isPaused = true;
    keys.left = false;
    keys.right = false;
  }
});

// ==============================
//       Touch (Mobile) 
// Supports BOTH:
//   Tap/hold left-right zones for movement
//   Swipe/drag to reposition the ship
// ==============================
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

// --- Start overlay hint state ---
let startHintTimer = 0;
let startHintAlpha = 0;

function updateHighScore() {
  if (score > highScore) {
    highScore = score;
    localStorage.setItem("highScore", highScore);
  }
}

startMenu.init(canvas);
// ==============================
//  Tap to Start / Restart 
// ==============================
canvas.addEventListener(
  "pointerdown",
  (e) => {
    // Only handle start/restart taps. Otherwise let pointer be used for movement logic.
    if (gameState === "start") {
      e.preventDefault();
      startGame();
      return;
    }
    if (gameState === "gameover") {
      e.preventDefault();
      restartGame();
      return;
    }
    if (isPaused && gameState === "playing") {
      e.preventDefault();
      isPaused = false;
      return;
}
  },
  { passive: false }
);


// ==============================
// Mobile Orientation Handling
// ==============================
function isLandscape() {
  return window.innerWidth > window.innerHeight;
}

function showRotateOverlay(show) {
  let el = document.getElementById("rotateOverlay");

  if (!el) {
    el = document.createElement("div");
    el.id = "rotateOverlay";
    el.style.cssText =
      "position:fixed;inset:0;display:flex;align-items:center;justify-content:center;" +
      "background:rgba(0,0,0,0.9);color:white;font:24px sans-serif;" +
      "text-align:center;z-index:99999;padding:20px;";
    el.innerText = "Rotate your phone back to Portrait to play.";
    document.body.appendChild(el);
  }

  el.style.display = show ? "flex" : "none";
}

function handleOrientation() {
  const landscape = isLandscape();
  showRotateOverlay(landscape);

  // auto-pause when landscape
  if (landscape && gameState === "playing") {
    isPaused = true;
    keys.left = false;
    keys.right = false;
  }
}

window.addEventListener("resize", handleOrientation);
window.addEventListener("orientationchange", handleOrientation);
handleOrientation();

// --- Game flow ---
function startGame() {
  gameState = "playing";
  score = 0;
  elapsedTime = 0;
  difficulty = 1;
  isPaused = false;

  // reset start hint each run
  startHintTimer = 0;
  startHintAlpha = 1;

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

// --- Difficulty easing ---
function easedDifficulty(elapsed, rampTime, cap) {
  const t = Math.max(0, Math.min(1, elapsed / rampTime));
  const eased = t * t * (3 - 2 * t); // smoothstep
  return 1 + eased * cap;
}

// ==============================
//            Update 
// ==============================
function update(dt) {
  if (gameState === "start") {
    startMenu.update(dt, canvas);
    updateStars(canvas);
    return;
  }

  if (gameState !== "playing" &&  prevState !== "playing") return;
    if (isPaused || isMenuVisible()) {
    // Keep background alive
    updateStars(canvas);
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

  // ==============================
  //    asteroids + collisions
  // ==============================
  updateAsteroids(
    dt,
    player,
    W,
    H,
    difficulty,
    activePowerUps,
    () => {
      if (gameState !== "gameover") {
        effects.triggerExplosion(player.x + player.w / 2, player.y + player.h / 2);
        effects.triggerFlash();
        effects.triggerShake();
        vibrate([60, 30, 60]); // game over vibration

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
      vibrate(15);
    }
  );

  // power-ups
  updatePowerUps(dt, player, W, H);

  // effects update
  effects.update(dt);
}

// --- Draw ---
function draw() {
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = 'midnightblue';
  ctx.fillRect(0, 0, W, H);

  drawStars(ctx);

  if (gameState === "start" || (isMenuVisible() && prevState === "start")) {
    startMenu.draw(ctx, W, H);
    if(isMenuVisible()) {
      ctx.fillStyle = "rgba(0,0,0,0.55)";
      ctx.fillRect(0, 0, W, H);
    }
    return;
  }

  drawAsteroids(ctx);
  drawPowerUps(ctx);
  player.draw(ctx);

  if (gameState === "playing" || (isMenuVisible() && prevState === "playing")) {
    // in-game HUD
    ctx.fillStyle = "white";
    const safeTop = getSafeTop();
    ctx.font = fontPx(22, "monospace"); 

    ctx.textAlign = "left";
    ctx.fillText(`Score: ${score}`, 20, safeTop + 24);

    // --- Start hint overlay ---
    if (startHintAlpha > 0) {
      ctx.save();
      ctx.globalAlpha = startHintAlpha;

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
    const y = safeTop + 85;

      ctx.fillStyle = "rgba(0,0,0,0.55)";
      ctx.fillRect(x - boxW / 2, y - boxH / 2, boxW, boxH);

      ctx.fillStyle = "white";
      ctx.fillText(text, x, y);

      ctx.restore();
    }

    pauseBtn.updateBounds(W);
    drawPauseButton(ctx);

    // power-up indicators
    let y = safeTop + 55;
    if (activePowerUps.shield) {
      ctx.fillStyle = "cyan";
      ctx.fillText("🛡️ Shield Active", 20, y);
      y += 30;
    }
    if (activePowerUps.scoreBoost) {
      ctx.fillStyle = "gold";
      ctx.fillText("💫 Score x2", 20, y);
    }

    facts.draw(ctx, W);
  }

  //freeze frame when paused
    if (isPaused || (isMenuVisible() && prevState != "gameover")) {
      ctx.fillStyle = "rgba(0,0,0,0.55)";
      ctx.fillRect(0, 0, W, H);

      ctx.textAlign = "center";
      ctx.fillStyle = "white";
      ctx.font = "bold 60px sans-serif";
      ctx.fillText("PAUSED", W / 2, H / 5 -  10);

      ctx.font = "22px sans-serif";
      ctx.fillStyle = "lightgray";

      if (isPaused) ctx.fillText("Press P to Resume", W / 2, H / 5 * 4  + 30);
      if (isMenuVisible()) ctx.fillText("Press Esc to Resume", W / 2, H / 5 * 4 + 30);

    }

  effects.draw(ctx, W, H);
  
  if (gameState === "gameover" || (isMenuVisible() && prevState === "gameover")) {
    // blackout overlay
    ctx.fillStyle = "rgba(0,0,0,0.85)";
    ctx.fillRect(0, 0, W, H);
    ctx.textAlign = "center";

    ctx.font = fontPx(54, "sans-serif", "bold");
    ctx.fillStyle = "red";
    ctx.fillText("GAME OVER", W / 2, H / 2 - 80);

    // --- GAME OVER UI ---
    ctx.font = fontPx(26, "sans-serif");
    const lineGap = Math.round(36 * getUiScale()); 

    ctx.fillStyle = "gold";
    ctx.fillText(`🏆 High Score: ${highScore}`, W / 2, H / 2);

    ctx.fillStyle = "white";
    ctx.fillText(`💫 Your Score: ${score}`, W / 2, H / 2 + lineGap);

    ctx.font = fontPx(20, "sans-serif");
    ctx.fillStyle = "lightgray";
    ctx.fillText("Tap to Restart", W / 2, H / 2 + lineGap * 2);
  }
}

function drawPauseButton(ctx) {
  ctx.save();
  ctx.globalAlpha = 0.85;
  ctx.fillStyle = "rgba(0,0,0,0.35)";
  ctx.lineWidth = 2;

  const r = 12;
  const { x, y, w, h } = pauseBtn;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.globalAlpha = 1;
  ctx.fillStyle = "white";
  const barW = 6, gap = 8, barH = 22;
  const cx = x + w / 2;
  const cy = y + h / 2; 
  ctx.fillRect(cx - gap - barW / 2, barW, barH);
  ctx.fillRect(cx + gap, cy - barH / 2, barW, barH);

  ctx.restore();
}

requestAnimationFrame(loop);
