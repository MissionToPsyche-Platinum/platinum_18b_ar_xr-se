// ─── orbit_facts Test Suite ──────────────────────────────────
//Implemented console checks for Orbit Facts module
//Comment out script line in index.html for production use

(function () {
    let passed = 0;
    let failed = 0;

    function assert(condition, testId, description) {
        if (condition) {
            console.log(`%c✓ PASS [${testId}] ${description}`, 'color: #4CAF50');
            passed++;
        } else {
            console.error(`✗ FAIL [${testId}] ${description}`);
            failed++;
        }
    }

    function runTests() {
        console.group('%corbit_facts — Test Suite', 'font-weight: bold; font-size: 14px;');

        // ─── OBJ: Object Tests ─────────────────────────────────
        console.group('DOM Structure');

        assert(
            document.getElementById('orbitSlider') !== null,
            'OBJ-01', 'Orbit slider element exists'
        );
        assert(
            document.getElementById('infoBox') !== null,
            'OBJ-02', 'Seasonal fact info box exists'
        );
        assert(
            document.getElementById('generalInfoBox') !== null,
            'OBJ-03', 'Mission data info box exists'
        );
        assert(
            document.getElementById('viewToggle') !== null,
            'OBJ-04', 'View scale toggle exists'
        );
        assert(
            document.getElementById('autoplayToggle') !== null,
            'OBJ-05', 'Autoplay toggle exists'
        );
        assert(
            document.getElementById('menuBtn') !== null,
            'OBJ-06', 'Menu button exists'
        );
        assert(
            document.getElementById('menuPanel') !== null,
            'OBJ-07', 'Menu panel exists'
        );
        assert(
            document.getElementById('menuOverlay') !== null,
            'OBJ-08', 'Menu overlay exists'
        );
        assert(
            document.getElementById('resetBtn') !== null,
            'OBJ-09', 'Reset button exists'
        );
        assert(
            document.getElementById('disclaimerBtn') !== null,
            'OBJ-10', 'Disclaimer button exists'
        );
        assert(
            document.getElementById('star-canvas') !== null,
            'OBJ-11', 'Star canvas element exists'
        );
        assert(
            document.querySelector('.sun') !== null,
            'OBJ-12', 'Sun glow element exists'
        );
        assert(
            document.getElementById('three-container') !== null,
            'OBJ-13', 'Three.js container exists'
        );

        console.groupEnd();

        // ─── SLD: Slider Tests ────────────────────────────────────────
        console.group('Slider Configuration');

        const slider = document.getElementById('orbitSlider');
        assert(
            slider.min === '0',
            'SLD-01', 'Slider minimum value is 0'
        );
        assert(
            slider.max === '3600',
            'SLD-02', 'Slider maximum value is 3600'
        );
        assert(
            slider.step === '1',
            'SLD-03', 'Slider step is 1'
        );
        assert(
            parseFloat(slider.value) >= 0 && parseFloat(slider.value) <= 3600,
            'SLD-04', 'Slider value is within valid range'
        );

        console.groupEnd();

        // ─── MNU: Menu Tests ──────────────────────────────────────────
        console.group('Menu Behaviour');

        const menuPanel  = document.getElementById('menuPanel');
        const menuBtn    = document.getElementById('menuBtn');
        const menuOverlay = document.getElementById('menuOverlay');

        assert(
            !menuPanel.classList.contains('open'),
            'MNU-01', 'Menu panel is closed on load'
        );
        assert(
            !menuOverlay.classList.contains('visible'),
            'MNU-02', 'Menu overlay is hidden on load'
        );

        // Simulate open
        menuBtn.click();
        assert(
            menuPanel.classList.contains('open'),
            'MNU-03', 'Menu panel opens on button click'
        );
        assert(
            menuOverlay.classList.contains('visible'),
            'MNU-04', 'Menu overlay visible when menu is open'
        );
        assert(
            menuBtn.classList.contains('open'),
            'MNU-05', 'Menu button has open class when menu is open'
        );

        // Simulate close
        menuBtn.click();
        assert(
            !menuPanel.classList.contains('open'),
            'MNU-06', 'Menu panel closes on second button click'
        );

        console.groupEnd();

        // ─── LNK: Link Tests ──────────────────────────────────
        console.group('Module Links');

        const links = document.querySelectorAll('.menu-link');
        assert(
            links.length >= 3,
            'LNK-01', 'At least 3 module links exist'
        );

        const hrefs = Array.from(links).map(l => l.href);
        assert(
            hrefs.some(h => h.includes('Button%20Masher') || h.includes('Button Masher')),
            'LNK-02', 'Button Masher link exists'
        );
        assert(
            hrefs.some(h => h.includes('Asteroid%20Dodge') || h.includes('Asteroid Dodge')),
            'LNK-03', 'Asteroid Dodge link exists'
        );
        assert(
            hrefs.some(h => h.includes('Metal%20Activity') || h.includes('Metal Activity')),
            'LNK-04', 'Metal Activity link exists'
        );
        assert(
            hrefs.some(h => h.includes('nasa.gov') || h.includes('psyche')),
            'LNK-05', 'NASA Psyche link exists'
        );

        const blankLinks = Array.from(links).filter(l => l.target === '_blank');
        assert(
            blankLinks.length === links.length,
            'LNK-06', 'All links open in a new tab'
        );

        console.groupEnd();

        // ─── SPD: Speed button Tests ──────────────────────────────────
        console.group('Speed Buttons');

        const speedBtns = document.querySelectorAll('.speed-btn');
        assert(
            speedBtns.length === 3,
            'SPD-01', 'Three speed buttons exist (Slow, Medium, Fast)'
        );
        assert(
            document.querySelector('.speed-btn.active') !== null,
            'SPD-02', 'One speed button is active by default'
        );
        assert(
            document.querySelector('.speed-btn.active').dataset.speed === '10',
            'SPD-03', 'Slow (10) is the default active speed'
        );

        // Simulate clicking Medium
        const mediumBtn = Array.from(speedBtns).find(b => b.dataset.speed === '25');
        mediumBtn.click();
        assert(
            mediumBtn.classList.contains('active'),
            'SPD-04', 'Medium speed button becomes active on click'
        );
        assert(
            document.querySelectorAll('.speed-btn.active').length === 1,
            'SPD-05', 'Only one speed button is active at a time'
        );

        // Reset back to slow
        Array.from(speedBtns).find(b => b.dataset.speed === '10').click();

        console.groupEnd();

        // ─── DIS: Disclaimer Tests ────────────────────────────────────
        console.group('Disclaimer');

        const disclaimerBtn  = document.getElementById('disclaimerBtn');
        const disclaimerText = document.getElementById('disclaimerText');

        assert(
            !disclaimerText.classList.contains('visible'),
            'DIS-01', 'Disclaimer text is hidden on load'
        );

        disclaimerBtn.click();
        assert(
            disclaimerText.classList.contains('visible'),
            'DIS-02', 'Disclaimer text shows on button click'
        );
        assert(
            disclaimerBtn.textContent === 'Hide Disclaimer',
            'DIS-03', 'Disclaimer button text changes to Hide Disclaimer when open'
        );

        disclaimerBtn.click();
        assert(
            !disclaimerText.classList.contains('visible'),
            'DIS-04', 'Disclaimer text hides on second click'
        );

        console.groupEnd();

        // ─── Summary ─────────────────────────────────────────────
        console.group('%cResults', 'font-weight: bold');
        console.log(`%c✓ ${passed} passed`, 'color: #4CAF50; font-weight: bold');
        if (failed > 0) {
            console.log(`%c✗ ${failed} failed`, 'color: #f44336; font-weight: bold');
        }
        console.groupEnd();
        console.groupEnd();
    }

    // Run after page has fully loaded
    window.addEventListener('load', runTests);

})();