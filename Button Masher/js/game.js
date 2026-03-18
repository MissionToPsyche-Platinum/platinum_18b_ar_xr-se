// ===== STAGES =====
const stages = [
  { name: "Stage 1", target: 15, time: 5 },
  { name: "Stage 2", target: 25, time: 5 },
  { name: "Stage 3", target: 35, time: 6 }
];

let currentStageIndex = 0;
let stageTapCount = 0;
let totalTapCount = 0;

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

  if (stageTapCount >= stage.target) {
    // STAGE CLEAR
    currentStageIndex++;

    if (currentStageIndex >= stages.length) {
      endGame();
      return;
    }

    alert(`${stage.name} CLEAR!`);

    // move to next stage
    stageTapCount = 0;
    count = 0;
    timeLeft = stages[currentStageIndex].time;
    timerStarted = false;

    countEl.textContent = 0;
    timeEl.textContent = timeLeft;

    progressFill.style.width = "0%";

    btn.textContent = `START ${stages[currentStageIndex].name}`;
  } else {
    // FAIL
    alert(`${stage.name} FAILED`);
    endGame();
  }
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

  if (!timerStarted) {
    timerStarted = true;
    btn.textContent = "TAP!";
    startMashAudio();
    startTimer();
  }

  if (timeLeft > 0) {
    stageTapCount++;
    totalTapCount++;

    count = stageTapCount;
    countEl.textContent = count;

    updateProgressBar();
  }
}, { passive: false });

// ===== RESET BUTTONS =====
resetBtn.addEventListener("click", resetGame);
playAgainBtn.addEventListener("click", resetGame);