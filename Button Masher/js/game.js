// ===== STAGES =====
const stages = [
  { name: "Stage 1", target: 15, time: 5 },
  { name: "Stage 2", target: 25, time: 5 },
  { name: "Stage 3", target: 35, time: 6 }
];

let currentStageIndex = 0;
let stageTapCount = 0;
let totalTapCount = 0;

/// ===== STAGE INFO =====
function updateStageInfo() {
  const stage = stages[currentStageIndex];
  stageLabel.textContent = stage.name;
  stageTarget.textContent = `Target: ${stage.target} taps`;
  stageTaps.textContent = `Taps: ${stageTapCount}`;
}

// ===== GAME STATE =====
let cameraSoundInterval = null;
let count = 0;
let timeLeft = stages[0].time;
let timerStarted = false;
let timerId = null;
let resultsTimeoutId = null;

// ===== UI =====
function updateProgressBar() {
  const stage = stages[currentStageIndex];
  const clamped = Math.min(stageTapCount, stage.target);
  const pct = (clamped / stage.target) * 100;
  progressFill.style.width = pct + "%";
}

function showPage(which) {
  pageGame.classList.toggle("active", which === "game");
  pageResults.classList.toggle("active", which === "results");
}

// ===== RESET GAME =====
function resetGame() {
  stopMashAudio();
  stopCameraSounds();
  stopCongrats();
  stageStatus.textContent = "";
  updateStageInfo();
  stageOverlay.classList.add("hidden");

  if (timerId !== null) {
    clearInterval(timerId);
    timerId = null;
  }

  if (resultsTimeoutId !== null) {
    clearTimeout(resultsTimeoutId);
    resultsTimeoutId = null;
  }

  currentStageIndex = 0;
  stageTapCount = 0;
  totalTapCount = 0;

  count = 0;
  timeLeft = stages[0].time;
  timerStarted = false;

  countEl.textContent = count;
  timeEl.textContent = timeLeft;

  progressFill.style.width = "0%";

  btn.classList.remove("disabled");
  btn.textContent = "START STAGE 1";

  finalScoreEl.textContent = "0";
  funFactEl.style.display = "none";
  funFactEl.textContent = "";
  animWrap.style.display = "flex";

  orbitEl.style.setProperty("--orbitDur", "6s");

  showPage("game");
}

// ===== END STAGE =====
function endStage() {
  stopMashAudio();

  const stage = stages[currentStageIndex];
  const cleared = stageTapCount >= stage.target;

  // Freeze the button so the user can't keep tapping during transition
  btn.classList.add("disabled");

  // Show the CURRENT stage info/result first
  stageLabel.textContent = stage.name;
  stageTarget.textContent = `Target: ${stage.target} taps`;
  stageTaps.textContent = `Taps: ${stageTapCount}`;
  stageStatus.textContent = cleared
    ? `${stage.name} CLEAR!`
    : `${stage.name} FAILED!`;

  
  // Show overlay with result
overlayStatus.textContent = cleared ? `${stage.name} CLEAR! ✅` : `${stage.name} FAILED! ❌`;
overlayTaps.textContent = `Taps: ${stageTapCount} / ${stage.target}`;
stageOverlay.classList.remove("hidden");

setTimeout(() => {
  stageOverlay.classList.add("hidden");

  if (!cleared) {
    endGame();
    return;
  }

  currentStageIndex++;

  if (currentStageIndex >= stages.length) {
    endGame();
    return;
  }

  stageTapCount = 0;
  count = 0;
  timeLeft = stages[currentStageIndex].time;
  timerStarted = false;

  countEl.textContent = "0";
  timeEl.textContent = String(timeLeft);
  progressFill.style.width = "0%";

  stageLabel.textContent = stages[currentStageIndex].name;
  stageTarget.textContent = `Target: ${stages[currentStageIndex].target} taps`;
  stageTaps.textContent = "Taps: 0";
  stageStatus.textContent = "";

  btn.textContent = `START ${stages[currentStageIndex].name}`;
  btn.classList.remove("disabled");
}, 1500);
}

// ===== FINAL GAME =====
function endGame() {
  stopMashAudio();

  finalScoreEl.textContent = totalTapCount;

  funFactEl.textContent = getRank(totalTapCount);

  showPage("results");

  startCameraSounds();

  resultsTimeoutId = setTimeout(() => {
    stopCameraSounds();

    animWrap.style.display = "none";
    funFactEl.style.display = "block";
  }, 4000);
}

// ===== TIMER =====
function startTimer() {
  timerId = setInterval(() => {
    timeLeft--;
    timeEl.textContent = timeLeft;

    if (timeLeft <= 0) {
      clearInterval(timerId);
      timerId = null;
      endStage();
    }
  }, 1000);
}

// ===== BUTTON INPUT =====
btn.addEventListener("pointerdown", (e) => {
  e.preventDefault();

  if (btn.classList.contains("disabled")) return;

  // START TIMER ON FIRST TAP
  if (!timerStarted) {
    timerStarted = true;
    btn.textContent = "TAP!";
    startMashAudio();
    startTimer();
  }

  // ONLY COUNT IF TIME LEFT
  if (timeLeft > 0) {
    // UPDATE COUNTS
    stageTapCount++;
    totalTapCount++;

    // update displayed count
    count = stageTapCount;
    countEl.textContent = count;

    // UPDATE STAGE UI
    stageTaps.textContent = `Taps: ${stageTapCount}`;

    // UPDATE PROGRESS BAR
    updateProgressBar();
  }

}, { passive: false });

// ===== RESET BUTTONS =====
resetBtn.addEventListener("click", resetGame);
playAgainBtn.addEventListener("click", resetGame);