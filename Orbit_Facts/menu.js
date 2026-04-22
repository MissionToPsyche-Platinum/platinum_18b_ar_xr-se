// ─── menu.js ─────────────────────────────────────────────────
// Menu open/close, speed buttons, disclaimer toggle, reset button

const menuBtn        = document.getElementById('menuBtn');
const menuPanel      = document.getElementById('menuPanel');
const menuOverlay    = document.getElementById('menuOverlay');
const menuClose      = document.getElementById('menuClose');
const menuViewToggle = document.getElementById('menuViewToggle');
const speedBtns      = document.querySelectorAll('.speed-btn');
const disclaimerBtn  = document.getElementById('disclaimerBtn');
const disclaimerText = document.getElementById('disclaimerText');
const resetBtn       = document.getElementById('resetBtn');

// ─── Open / Close ────────────────────────────────────────────
function openMenu() {
    menuPanel.classList.add('open');
    menuOverlay.classList.add('visible');
    menuBtn.classList.add('open');
}

function closeMenu() {
    menuPanel.classList.remove('open');
    menuOverlay.classList.remove('visible');
    menuBtn.classList.remove('open');
}

menuBtn.addEventListener('click', () => {
    menuPanel.classList.contains('open') ? closeMenu() : openMenu();
});
menuClose.addEventListener('click', closeMenu);
menuOverlay.addEventListener('click', closeMenu);

// ─── Menu View Toggle ────────────────────────────────────────
menuViewToggle.addEventListener('click', () => {
    isRealisticView = !isRealisticView;
    menuViewToggle.classList.toggle('active');
    viewToggle.classList.toggle('active');

    if (psycheModel) {
        psycheModel.scale.set(
            isRealisticView ? 1 : 8,
            isRealisticView ? 1 : 8,
            isRealisticView ? 1 : 8
        );
        updatePosition(parseFloat(slider.value));
    }
});

// ─── Speed Buttons ───────────────────────────────────────────
speedBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        speedBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        autoplaySpeed = parseFloat(btn.dataset.speed);
    });
});

// ─── Disclaimer ──────────────────────────────────────────────
disclaimerBtn.addEventListener('click', () => {
    const isVisible = disclaimerText.classList.toggle('visible');
    disclaimerBtn.textContent = isVisible ? 'Hide Disclaimer' : 'View Disclaimer';
});

// ─── Reset ───────────────────────────────────────────────────
resetBtn.addEventListener('click', () => {
    if (isAutoplay) {
        isAutoplay = false;
        autoplayToggle.classList.remove('active');
        if (animationId) {
            cancelAnimationFrame(animationId);
            animationId = null;
        }
    }
    currentValue = 0;
    slider.value = 0;
    updatePosition(0);
    closeMenu();
});