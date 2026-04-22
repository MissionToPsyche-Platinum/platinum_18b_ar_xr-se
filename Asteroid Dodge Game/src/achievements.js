// achievements.js

const STORAGE_KEY = "meteoroid_achievements";

// ── Achievement Definitions ──────────────────────────────────────────────────
export const ACHIEVEMENT_LIST = [
  {
    id: "first_flight",
    name: "First Flight",
    desc: "Play your first game",
    icon: "🚀"
  },
  {
    id: "survivor",
    name: "Survivor",
    desc: "Survive for 60 seconds",
    icon: "⏱️"
  },
  {
    id: "close_call",
    name: "Close Call",
    desc: "Trigger a near miss",
    icon: "😅"
  },
  {
    id: "combo_king",
    name: "Combo King",
    desc: "Reach a x10 combo",
    icon: "🔥"
  },
  {
    id: "high_roller",
    name: "High Roller",
    desc: "Reach a score of 500",
    icon: "💰"
  },
  {
    id: "untouchable",
    name: "Untouchable",
    desc: "Finish a game with all 3 lives",
    icon: "🛡️"
  }
];

// ── Notification Queue ───────────────────────────────────────────────────────
export const notificationQueue = [];
 
// Toast timing constants
const TOAST_FADE_IN  = 0.3;   // seconds
const TOAST_HOLD     = 2.0;   // seconds
const TOAST_FADE_OUT = 0.5;   // seconds
const TOAST_TOTAL    = TOAST_FADE_IN + TOAST_HOLD + TOAST_FADE_OUT;
 
// Active toast state (one at a time)
let activeToast = null;   

/**
 * Returns a Set of unlocked achievement ids from localStorage.
 * @returns {Set<string>}
 */
export function getUnlockedIds() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed);
  } catch {
    return new Set();
  }
}

/**
 * Unlock an achievement by id. No-ops if already unlocked.
 * Queues a notification and returns true if newly unlocked.
 * @param {string} id
 * @returns {boolean}
 */
export function unlockAchievement(id) {
  const unlocked = getUnlockedIds();
  if (unlocked.has(id)) return false;

  unlocked.add(id);

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...unlocked]));
  } catch {
    // quota exceeded — skip persistence silently
  }

  const def = ACHIEVEMENT_LIST.find(a => a.id === id);
  if (def) {
    notificationQueue.push({ ...def });
  }

  return true;
}

/**
 * Clear all achievement progress from localStorage.
 */
export function clearAchievements() {
  localStorage.removeItem(STORAGE_KEY);
}

// ── Per-run tracking ─────────────────────────────────────────────────────────
// Tracks which achievements were earned THIS run (for game over screen Day 3)
let sessionUnlocks = [];

export function getSessionUnlocks() {
  return sessionUnlocks;
}

export function resetSessionUnlocks() {
  sessionUnlocks = [];
}

export function updateNotification(dt) {
  if (!activeToast) {
    if (notificationQueue.length === 0) return;
    activeToast = { ...notificationQueue.shift(), timer: 0 };
  }
 
  activeToast.timer += dt;
 
  if (activeToast.timer >= TOAST_TOTAL) {
    activeToast = null;
  }
}


export function drawNotification(ctx, W, H) {
  if (!activeToast) return;
 
  const t = activeToast.timer;
 
  // Calculate alpha based on phase
  let alpha = 1;
  if (t < TOAST_FADE_IN) {
    alpha = t / TOAST_FADE_IN;
  } else if (t > TOAST_FADE_IN + TOAST_HOLD) {
    alpha = 1 - (t - TOAST_FADE_IN - TOAST_HOLD) / TOAST_FADE_OUT;
  }
  alpha = Math.max(0, Math.min(1, alpha));
 
  // Slide in from top
  const slideRange = 24;
  let slideY = 0;
  if (t < TOAST_FADE_IN) {
    slideY = slideRange * (1 - t / TOAST_FADE_IN);
  }
 
  ctx.save();
  ctx.globalAlpha = alpha;
 
  // Toast dimensions
  const padX = 18;
  const padY = 12;
  const iconSize = 28;
  const gap = 10;
 
  ctx.font = "bold 15px sans-serif";
  const nameW = ctx.measureText(activeToast.name).width;
  ctx.font = "13px sans-serif";
  const descW = ctx.measureText(activeToast.desc).width;
 
  const textW = Math.max(nameW, descW);
  const boxW = padX + iconSize + gap + textW + padX;
  const boxH = padY + iconSize + padY;
 
  const x = W / 2 - boxW / 2;
  const y = 18 + slideY;
  const r = 10;
 
  // Background pill
  ctx.fillStyle = "rgba(0, 0, 0, 0.78)";
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + boxW, y,         x + boxW, y + boxH, r);
  ctx.arcTo(x + boxW, y + boxH,  x,        y + boxH, r);
  ctx.arcTo(x,        y + boxH,  x,        y,        r);
  ctx.arcTo(x,        y,         x + boxW, y,        r);
  ctx.closePath();
  ctx.fill();
 
  // Gold left border accent
  ctx.fillStyle = "gold";
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + 4, y,        x + 4, y + boxH, r);
  ctx.arcTo(x + 4, y + boxH, x,     y + boxH, r);
  ctx.arcTo(x,     y + boxH, x,     y,        r);
  ctx.arcTo(x,     y,        x + 4, y,        r);
  ctx.closePath();
  ctx.fill();
 
  // Icon (emoji)
  const iconX = x + padX;
  const iconY = y + padY;
  ctx.font = `${iconSize}px sans-serif`;
  ctx.textBaseline = "top";
  ctx.fillText(activeToast.icon, iconX, iconY);
 
  // "Achievement Unlocked!" label
  const textX = iconX + iconSize + gap;
  ctx.font = "bold 11px sans-serif";
  ctx.fillStyle = "gold";
  ctx.textBaseline = "top";
  ctx.fillText("Achievement Unlocked!", textX, iconY);
 
  // Achievement name
  ctx.font = "bold 15px sans-serif";
  ctx.fillStyle = "white";
  ctx.fillText(activeToast.name, textX, iconY + 14);
 
  // Achievement desc
  ctx.font = "13px sans-serif";
  ctx.fillStyle = "rgba(255,255,255,0.65)";
  ctx.fillText(activeToast.desc, textX, iconY + 32);
 
  ctx.restore();
}



// ── Unlock Logic ─────────────────────────────────────────────────────────────
/**
 * Call this every update() tick and on relevant events.
 * 
 * @param {Object} stats
 * @param {number} stats.elapsedTime   seconds since game started
 * @param {number} stats.comboCount    current combo count
 * @param {number} stats.score         current score
 * @param {number} stats.lives         current lives remaining
 * @param {boolean} stats.nearMiss     true if a near miss just happened this tick
 * @param {boolean} stats.gameOver     true if the game just ended
 */
export function checkAchievements(stats) {
  const { elapsedTime, comboCount, score, livesLost, nearMiss, gameOver } = stats;

  function tryUnlock(id) {
    const wasNew = unlockAchievement(id);
    if (wasNew) sessionUnlocks.push(id);
  }

  // 🚀 First Flight — fires once at the very start of a run
  if (elapsedTime >= 0) tryUnlock("first_flight");

  // ⏱️ Survivor — survive 60 seconds
  if (elapsedTime >= 60) tryUnlock("survivor");

  // 😅 Close Call — near miss happened this tick
  if (nearMiss) tryUnlock("close_call");

  // 🔥 Combo King — hit x10 combo
  if (comboCount >= 10) tryUnlock("combo_king");

  // 💰 High Roller — reach score 500
  if (score >= 500) tryUnlock("high_roller");

  // 🛡️ Untouchable — finish with all 3 lives  
   if (gameOver && livesLost === 0) tryUnlock("untouchable");
}