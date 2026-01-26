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

export const facts = {
  enabled: true,

  // display state
  current: "",
  alpha: 0,
  timer: 0,

  // milestone tracking (prevents spam)
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

    this.timer = CONSTANTS.FACTS.DISPLAY_SECONDS;
    this.alpha = 1;
  },

  update(dt, elapsedTime, score) {
    if (!this.enabled) return;

    let shown = false;
    // Trigger on time milestone
    if (elapsedTime >= this.nextTimeMilestone && !shown) {
      this.showNextFact();
      this.nextTimeMilestone += CONSTANTS.FACTS.TIME_INTERVAL;
      shown = true;
    }

    // Trigger on score milestone
    if (score >= this.nextScoreMilestone && !shown) {
      this.showNextFact();
  this.nextScoreMilestone += CONSTANTS.FACTS.SCORE_INTERVAL;
}


    // Fade out logic
    if (this.timer > 0) {
      this.timer -= dt;
      if (this.timer <= 0) {
        this.timer = 0;
      }
    } else if (this.alpha > 0) {
      this.alpha -= dt * CONSTANTS.FACTS.FADE_SPEED;
      if (this.alpha < 0) this.alpha = 0;
    }
  },

  draw(ctx, W) {
    if (!this.enabled) return;
    if (!this.current || this.alpha <= 0) return;

    ctx.save();
    ctx.globalAlpha = this.alpha;

    ctx.font = CONSTANTS.FACTS.FONT;
    ctx.textAlign = "center";
    ctx.textBaseline = "top";

    // Background pill
    const paddingX = 18;
    const paddingY = 10;
    const maxWidth = Math.min(CONSTANTS.FACTS.MAX_WIDTH, W - 40);

    // Basic single-line clamp (simple + safe)
    let text = this.current;
    if (ctx.measureText(text).width > maxWidth) {
      // crude trim with ellipsis
      while (text.length > 0 && ctx.measureText(text + "…").width > maxWidth) {
        text = text.slice(0, -1);
      }
      text = text + "…";
    }

    const textWidth = ctx.measureText(text).width;
    const boxW = textWidth + paddingX * 2;
    const boxH = 24 + paddingY * 2;

    const x = W / 2 - boxW / 2;
    const y = CONSTANTS.FACTS.TOP_OFFSET;

    ctx.fillStyle = "rgba(0, 0, 0, 0.55)";
    ctx.fillRect(x, y, boxW, boxH);

    ctx.fillStyle = "#fff";
    ctx.fillText(text, W / 2, y + paddingY);

    ctx.restore();
  }
};
