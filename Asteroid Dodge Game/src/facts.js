// src/facts.js
import { CONSTANTS } from "./constants.js";

const DEFAULT_FACTS = [
  "NASA’s Psyche mission launched in October 2023.",
  "Psyche orbits in the asteroid belt between Mars and Jupiter.",
  "Psyche is thought to be metal-rich—possibly an exposed planetary core.",
  "The spacecraft will study Psyche from orbit and will not land.",
  "Psyche is expected to arrive in the late 2020s (mission timeline).",
  "Studying Psyche may help scientists understand how planets formed."
];

//helper method for drawing wrapped text
function wrapText(ctx, text, maxWidth, maxLines) {
  const words = text.split(" ");
  const lines = [];
  let line = "";

  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (ctx.measureText(test).width <= maxWidth) {
      line = test;
    } else {
      lines.push(line);
      line = word;
      if (lines.length === maxLines - 1) break;
    }
  }

  if (line) lines.push(line);

  // If we hit max lines and still have words left, add ellipsis to last line
  if (lines.length === maxLines && words.length > 0) {
    let last = lines[maxLines - 1];
    while (last.length > 0 && ctx.measureText(last + "…").width > maxWidth) {
      last = last.slice(0, -1);
    }
    lines[maxLines - 1] = last + "…";
  }

  return lines.slice(0, maxLines);
}


export const facts = {
  enabled: true,

  // display state
  current: "",
  alpha: 0,
  timer: 0,

  phase: "hidden", 
  phaseTime: 0,


  // milestone tracking
  nextTimeMilestone: 10,   // seconds
  nextScoreMilestone: 250, // points/score units

  factIndex: 0,
  factList: DEFAULT_FACTS.slice(),

  init(customFacts = null) {
    if (Array.isArray(customFacts) && customFacts.length > 0) {
      this.factList = customFacts.slice();
    }
    this.reset();
  },

  reset() {
  this.current = "";
  this.alpha = 0;
  this.timer = 0;

  this.phase = "hidden";
  this.phaseTime = 0;

  this.factIndex = 0;
  this.nextTimeMilestone = CONSTANTS.FACTS.TIME_INTERVAL;
  this.nextScoreMilestone = CONSTANTS.FACTS.SCORE_INTERVAL;
},

  toggle() {
    this.enabled = !this.enabled;
    // Hide any current fact when turning off
    if (!this.enabled) this.reset();
  },

  showNextFact() {
  if (!this.enabled) return;

  this.current = this.factList[this.factIndex % this.factList.length];
  this.factIndex++;

  this.phase = "fadein";
  this.phaseTime = 0;
  this.alpha = 0;
},


  update(dt, elapsedTime, score) {
  if (!this.enabled) return;

  // --- Trigger logic (keep your shown guard if you added it) ---
  let shown = false;

  if (elapsedTime >= this.nextTimeMilestone && !shown) {
    this.showNextFact();
    this.nextTimeMilestone += CONSTANTS.FACTS.TIME_INTERVAL;
    shown = true;
  }

  if (score >= this.nextScoreMilestone && !shown) {
    this.showNextFact();
    this.nextScoreMilestone += CONSTANTS.FACTS.SCORE_INTERVAL;
  }

  // --- Phase animation logic ---
  if (this.phase === "hidden") return;

  this.phaseTime += dt;

  if (this.phase === "fadein") {
    const t = Math.min(1, this.phaseTime / CONSTANTS.FACTS.FADE_IN_SECONDS);
    this.alpha = t;

    if (t >= 1) {
      this.phase = "hold";
      this.phaseTime = 0;
      this.alpha = 1;
    }
  } else if (this.phase === "hold") {
    this.alpha = 1;

    if (this.phaseTime >= CONSTANTS.FACTS.DISPLAY_SECONDS) {
      this.phase = "fadeout";
      this.phaseTime = 0;
    }
  } else if (this.phase === "fadeout") {
    const t = Math.min(1, this.phaseTime / CONSTANTS.FACTS.FADE_OUT_SECONDS);
    this.alpha = 1 - t;

    if (t >= 1) {
      this.phase = "hidden";
      this.phaseTime = 0;
      this.alpha = 0;
      this.current = "";
    }
  }
},



  draw(ctx, W) {
  if (!this.enabled) return;
  if (!this.current || this.alpha <= 0) return;

  const F = CONSTANTS.FACTS;

  ctx.save();
  ctx.globalAlpha = this.alpha;

  ctx.font = F.FONT;
  ctx.textAlign = "center";
  ctx.textBaseline = "top";

  const maxWidth = Math.min(F.MAX_WIDTH, W - F.SIDE_MARGIN * 2) - F.PADDING_X * 2;

  const lines = wrapText(ctx, this.current, maxWidth, F.MAX_LINES);

  const textWidths = lines.map(l => ctx.measureText(l).width);
  const widest = Math.max(...textWidths, 0);

  const boxW = widest + F.PADDING_X * 2;
  const boxH = lines.length * F.LINE_HEIGHT + F.PADDING_Y * 2;

  const x = W / 2 - boxW / 2;
  const y = F.TOP_OFFSET;

  ctx.fillStyle = F.BG_COLOR;
  ctx.fillRect(x, y, boxW, boxH);

  ctx.fillStyle = F.TEXT_COLOR;
  for (let i = 0; i < lines.length; i++) {
    ctx.fillText(lines[i], W / 2, y + F.PADDING_Y + i * F.LINE_HEIGHT);
  }

  ctx.restore();
}
};
