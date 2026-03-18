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

const uiButtons = {
  size: 56,
  pad: 16,
  gap: 12,

  menu: {x: 0, y: 0, w: 0, h: 0},
  pause: {x: 0, y: 0, w: 0, h: 0},
  updateBounds(W) {
    const s = this.size;
    const x = W - this.pad - s;

    this.menu.x = x;
    this.menu.y = this.pad;
    this.menu.w = s;
    this.menu.h = s;
    
    this.pause.x = x;
    this.pause.y = this.pad + s + this.gap;
    this.pause.w = s;
    this.pause.h = s;
  },

  contains(btn, px, py) {
    return px >= btn.x && px <= btn.x + btn.w && py >= btn.y && py <= btn.y + btn.h;
  }
};

//fit to screen for mobile/web
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  uiButtons.updateBounds(canvas.width);
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
      toggleGameMenu();
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

    const t = e.touches[0];
    const x = t.clientX;
    const y = t. clientY;

    touchStartX = x;
    touchMoved = false;

    uiButtons.updateBounds(W);

    if (uiButtons.contains(uiButtons.menu, x, y)) {
      toggleGameMenu();
      keys.left = false;
      keys.right = false;
      touchStartX = null;
      return;
    }

    if (uiButtons.contains(uiButtons.pause, x, y) && (gameState === "playing" || prevState === "playing")) {
      if(isMenuVisible()) {
        closeMenu();
        isPaused = false;
      } else if (gameState === "playing") {
        isPaused = !isPaused;
      }
      keys.left = false;
      keys.right = false;
      touchStartX = null;
      return;
    }

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
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    uiButtons.updateBounds(W);

    if (uiButtons.contains(uiButtons.menu, x, y)) {
      e.preventDefault();
      toggleGameMenu();
      return;
    }

    if (uiButtons.contains(uiButtons.pause, x, y) && (gameState === "playing" || prevState === "playing")) {
      e.preventDefault();
      if(isMenuVisible()) {
        closeMenu();
        isPaused = false;
      } else if (gameState === "playing") {
        isPaused = !isPaused;
      }
      keys.left = false;
      keys.right = false;
      return;
    }

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
  },
  { passive: false }
);


// ==============================
// Mobile Orientation Handling
// ==============================

// Function that checks if device is likely a mobile device so this message doesn't appear on desktop
function isProbablyPhone() {
  if (navigator.userAgentData && typeof navigator.userAgentData.mobile === "boolean") {
    return navigator.userAgentData.mobile;
  }

  // Fallback
  const hasTouch = 
    ("maxTouchPoints" in navigator && navigator.maxTouchPoints > 0) ||
    ("ontouchstart" in window);
    
  const coarsePointer = window.matchMedia?.("(pointer: coarse)")?.matches ?? false;
  const smallScreen = Math.min(window.innerWidth, window.innerHeight) <= 820;

  // Probably phone if has touch capabilities, has coarse pointers and has a smallish screen
  return hasTouch && coarsePointer && smallScreen;
}

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
  const enforce = isProbablyPhone();
  const landscape = isLandscape();

  showRotateOverlay(landscape && enforce);

  // auto-pause when landscape
  if (enforce && landscape && gameState === "playing") {
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

    uiButtons.updateBounds(W);
    
    drawButtonBase(ctx, uiButtons.menu);
    drawHamburgerIcon(ctx, uiButtons.menu);

    drawButtonBase(ctx, uiButtons.pause);
    if (isMenuVisible() || isPaused) {
      drawPlayIcon(ctx, uiButtons.pause);
    } else {
      drawPauseIcon(ctx, uiButtons.pause);
    }

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

function drawButtonBase(ctx, btn) {
  const { x, y, w, h } = btn;
  const r = 12;

  ctx.save();
  ctx.globalAlpha = 0.85;
  ctx.fillStyle = "rgba(0,0,0,0.35)";
  ctx.lineWidth = 2;

  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.restore();
}

function drawHamburgerIcon(ctx, btn) {
  const { x, y, w, h } = btn;

  ctx.save();
  ctx.fillStyle = "white";
  ctx.globalAlpha = 0.95;

  const barW = Math.round(w * 0.55);
  const barH = 4;
  const gap = 8;

  const cx = x + w / 2;
  const cy = y + h / 2;

  const left = Math.round(cx - barW / 2);
  const top1 = Math.round(cy - gap - barH);
  const top2 = Math.round(cy - barH / 2);
  const top3 = Math.round(cy + gap);

  ctx.fillRect(left, top1, barW, barH);
  ctx.fillRect(left, top2, barW, barH);
  ctx.fillRect(left, top3, barW, barH);

  ctx.restore();
}

function drawPauseIcon(ctx, btn) {
  const { x, y, w, h } = btn;

  ctx.save();
  ctx.fillStyle = "white";
  ctx.globalAlpha = 0.95;

  const barW = 6;
  const barH = 22;
  const gap = 4;
  
  const cx = x + w / 2;
  const cy = y + h / 2;

  ctx.fillRect(cx - gap - barW, cy - barH / 2, barW, barH);
  ctx.fillRect(cx + gap, cy - barH / 2, barW, barH);

  ctx.restore();
}

function drawPlayIcon(ctx, btn) {
  const { x, y, w, h } = btn;

  ctx.save();
  ctx.fillStyle = "white";
  ctx.globalAlpha = 0.95;

  const cx = x + w / 2;
  const cy = y + h / 2;

  const triW = 18;
  const triH = 24;

  ctx.beginPath();
  ctx.moveTo(cx - triW / 2, cy - triH / 2);
  ctx.lineTo(cx - triW / 2, cy + triH / 2);
  ctx.lineTo(cx + triW / 2, cy);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

}

function openMenu() {
  if (isMenuVisible()) return;
  prevState = gameState;
  gameState = "menu";
  keys.left = false;
  keys.right = false;
  toggleMenu();
}

function closeMenu() {
  if (!isMenuVisible()) return;
  toggleMenu();
  gameState = prevState ?? "playing";
  prevState = null;
}

function toggleGameMenu() {
  if (isMenuVisible()) {
    closeMenu();
  } else {
    openMenu();
  }
}

requestAnimationFrame(loop);
