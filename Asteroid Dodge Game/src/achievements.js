// achievements.js
// Day 1 — Data layer, localStorage persistence, unlock logic

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
// Toasts are queued here and drawn one at a time by drawNotification() (Day 2)
export const notificationQueue = [];

// ── Persistence ─────────────────────────────────────────────────────────────

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