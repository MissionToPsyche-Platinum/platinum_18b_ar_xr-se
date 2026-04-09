// leaderboard.js
// Manages top-5 scores in localStorage.

const STORAGE_KEY = "meteoroid_leaderboard";
const MAX_ENTRIES = 5;

/**
 * @typedef {{ score: number, date: string }} LeaderboardEntry
 */

/**
 * Load the leaderboard array from localStorage.
 * @returns {LeaderboardEntry[]}
 */
export function getLeaderboard() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed;
  } catch {
    return [];
  }
}

/**
 * Save a new score. Inserts, sorts descending, trims to top 5, persists.
 * @param {number} score
 * @returns {LeaderboardEntry[]} updated leaderboard
 */
export function saveScore(score) {
  const board = getLeaderboard();

  const now = new Date();
  const date = now.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });

  board.push({ score, date });
  board.sort((a, b) => b.score - a.score);
  const trimmed = board.slice(0, MAX_ENTRIES);

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  } catch {
    // storage quota exceeded — silently skip persistence
  }

  return trimmed;
}

/**
 * Clear the leaderboard (useful for testing / reset button).
 */
export function clearLeaderboard() {
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * Draw the leaderboard onto a canvas 2D context.
 * Used by the game-over screen in main.js.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {number} W  canvas width
 * @param {number} H  canvas height
 * @param {number} currentScore  the score just achieved (highlighted in gold)
 * @param {Function} fontPx  the main.js fontPx helper
 */
export function drawLeaderboard(ctx, W, H, currentScore, fontPx) {
  const board = getLeaderboard();
  if (board.length === 0) return;

  const centerX = W / 2;

  // Section header
  ctx.font = fontPx(20, "monospace");
  ctx.fillStyle = "rgba(255,255,255,0.55)";
  ctx.textAlign = "center";
  ctx.fillText("— TOP SCORES —", centerX, H / 2 + 60);

  const rowH = Math.round(28 * Math.min(W / 390, H / 844));
  const startY = H / 2 + 60 + rowH;

  const medals = ["🥇", "🥈", "🥉", "4.", "5."];

  board.slice(0, MAX_ENTRIES).forEach((entry, i) => {
    const y = startY + i * rowH;
    const isCurrentRun = entry.score === currentScore;

    ctx.font = fontPx(isCurrentRun ? 18 : 16, "monospace", isCurrentRun ? "bold" : "");
    ctx.fillStyle = isCurrentRun ? "gold" : "white";

    const label = `${medals[i]}  ${String(entry.score).padStart(6, " ")}   ${entry.date}`;
    ctx.fillText(label, centerX, y);
  });
}