
    function startMashAudio() {
      if (!mashSfx) return;
      mashSfx.currentTime = 0;
      mashSfx.play().catch(() => {});
    }

    function stopMashAudio() {
      if (!mashSfx) return;
      mashSfx.pause();
      mashSfx.currentTime = 0;
    }

    function startCameraSounds() {
      stopCameraSounds();
      cameraSoundInterval = setInterval(() => {
        const sound = Math.random() < 0.5 ? cameraSound1 : cameraSound2;
        sound.currentTime = 0;
        sound.play().catch(() => {});
      }, 400 + Math.random() * 600);
    }

    function stopCameraSounds() {
      if (cameraSoundInterval !== null) {
        clearInterval(cameraSoundInterval);
        cameraSoundInterval = null;
      }
      cameraSound1.pause();
      cameraSound2.pause();
    }

    function playCongrats() {
      if (!congratsSfx) return;
      congratsSfx.currentTime = 0;
      congratsSfx.play().catch(() => {});
    }

    function stopCongrats() {
      if (!congratsSfx) return;
      congratsSfx.pause();
      congratsSfx.currentTime = 0;
    }

    
    function playDing() {
     if (!dingSfx) return;
      dingSfx.currentTime = 0;
      dingSfx.play().catch(() => {});
    }