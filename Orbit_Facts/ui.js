// ─── ui.js ───────────────────────────────────────────────────
// Slider, view toggle, autoplay toggle, and resize listener

// Slider
slider.addEventListener('input', () => {
    updatePosition(parseFloat(slider.value));
});
slider.style.touchAction = 'none';

// View scale toggle
viewToggle.addEventListener('click', () => {
    isRealisticView = !isRealisticView;
    viewToggle.classList.toggle('active');

    if (psycheModel) {
        psycheModel.scale.set(
            isRealisticView ? 1 : 8,
            isRealisticView ? 1 : 8,
            isRealisticView ? 1 : 8
        );
        updatePosition(parseFloat(slider.value));
    }

    // Keep menu toggle in sync
    const menuViewToggle = document.getElementById('menuViewToggle');
    if (menuViewToggle) {
        menuViewToggle.classList.toggle('active', viewToggle.classList.contains('active'));
    }
});

// Autoplay animation
function animate() {
    if (isAutoplay) {
        const currentTime = Date.now();
        const deltaTime   = (currentTime - lastTime) / 1000;
        lastTime = currentTime;

        currentValue += autoplaySpeed * deltaTime;
        if (currentValue >= 3600) currentValue = 0;

        slider.value = Math.floor(currentValue);
        updatePosition(Math.floor(currentValue));

        animationId = requestAnimationFrame(animate);
    }
}

// Autoplay toggle
autoplayToggle.addEventListener('click', () => {
    isAutoplay = !isAutoplay;
    autoplayToggle.classList.toggle('active');

    if (isAutoplay) {
        currentValue = parseFloat(slider.value);
        lastTime     = Date.now();
        animate();
    } else {
        if (animationId) {
            cancelAnimationFrame(animationId);
            animationId = null;
        }
    }
});

// Window resize
window.addEventListener('resize', () => {
    initThreeSize();
    updateSunGlowPosition();
    updatePosition(parseFloat(slider.value));
});