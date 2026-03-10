    let cameraSoundInterval = null;
    let count = 0;
    let timeLeft = 5;
    let timerStarted = false;
    let timerId = null;
    let resultsTimeoutId = null;
    
    const MAX_PRESSES = 33;
    function updateProgressBar() {
      const clamped = Math.min(count, MAX_PRESSES);
      const pct = (clamped / MAX_PRESSES) * 100;
      progressFill.style.width = pct + "%";
    
    }

    function showPage(which) {
      pageGame.classList.toggle("active", which === "game");
      pageResults.classList.toggle("active", which === "results");
    }


    function resetGame() {
      stopMashAudio();
      stopCameraSounds();
      stopCongrats();
      progressFill.style.width = "0%";

      if (timerId !== null) {
        clearInterval(timerId);
        timerId = null;
      }
      if (resultsTimeoutId !== null) {
        clearTimeout(resultsTimeoutId);
        resultsTimeoutId = null;
      }

      count = 0;
      updateProgressBar();   //updates the progress bar
      timeLeft = 5;
      timerStarted = false;

      countEl.textContent = count;
      timeEl.textContent = timeLeft;

      btn.classList.remove("disabled");
      btn.textContent = "PRESS THE BUTTON TO START";

      finalScoreEl.textContent = "0";
      funFactEl.style.display = "none";
      funFactEl.textContent = "";
      animWrap.style.display = "flex";

      orbitEl.style.setProperty("--orbitDur", "6s");

      showPage("game");
    }

    

    function endGame() {
      stopMashAudio();

      btn.classList.add("disabled");

      finalScoreEl.textContent = String(count);

      const orbitSeconds = scoreToOrbitSeconds(count);
      orbitEl.style.setProperty("--orbitDur", orbitSeconds + "s");

      showPage("results");
      startCameraSounds();

      funFactEl.textContent = getEndMessage(count);
      funFactEl.style.display = "none";
      animWrap.style.display = "flex";

      resultsTimeoutId = setTimeout(() => {
        stopCameraSounds();

        animWrap.style.display = "none";
        funFactEl.style.display = "block";

        if (getEndMessage(count).includes("100%")) {
          playCongrats();
        }
      }, 5000);
    }


    function startTimer() {
      timerId = setInterval(() => {
        timeLeft--;
        timeEl.textContent = timeLeft;

        if (timeLeft <= 0) {
          clearInterval(timerId);
          timerId = null;
          endGame();
        }
      }, 1000);
    }


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
  if (count < MAX_PRESSES) {
    count++;
    countEl.textContent = count;
    updateProgressBar();
  } else {
    playDing();
    updateProgressBar(); 
  }
}
    }, { passive: false });

    resetBtn.addEventListener("click", resetGame);
    playAgainBtn.addEventListener("click", resetGame);

  
   
  