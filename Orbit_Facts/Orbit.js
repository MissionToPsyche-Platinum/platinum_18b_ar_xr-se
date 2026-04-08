// ─── Orbit.js ────────────────────────────────────────────────
// Camera setup, orbit line, sun glow positioning, and position updates

function initThreeSize() {
    const orbitElem = document.querySelector('.orbit');
    const orbitRect = orbitElem.getBoundingClientRect();
    const width     = orbitRect.width;
    const height    = orbitRect.height;

    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio || 1);

    const padding      = 250;
    const eccentricity = 0.14;
    const centerOffset = radius * eccentricity;

    if (!camera) {
        camera = new THREE.OrthographicCamera(
            width / -2 - padding - centerOffset,
            width / 2 + padding - centerOffset,
            height / 2 + padding,
            height / -2 - padding,
            0.1,
            2000
        );
        camera.position.set(-centerOffset, 0, 1000);
        camera.lookAt(-centerOffset, 0, 0);
    } else {
        camera.left   = width / -2 - padding - centerOffset;
        camera.right  = width / 2 + padding - centerOffset;
        camera.top    = height / 2 + padding;
        camera.bottom = height / -2 - padding;
        camera.updateProjectionMatrix();
    }

    const circleRadius = Math.min(width, height) / 1.32;
    radius = circleRadius;

    // Scale sun model proportionally to orbit radius
    if (sunModel) {
        const sunScale = radius / 2;
        sunModel.scale.set(sunScale, sunScale, sunScale);
    }

    drawOrbitLine();
}

function updateSunGlowPosition() {
    const sunGlow       = document.querySelector('.sun');
    const orbitContainer= document.querySelector('.orbit');
    if (sunGlow && orbitContainer) {
        const orbitRect = orbitContainer.getBoundingClientRect();
        const spaceRect = document.querySelector('.space').getBoundingClientRect();

        const sunScreenX  = orbitRect.width / 2;
        const sunScreenY  = orbitRect.height / 2;
        const leftOffset  = (orbitRect.left - spaceRect.left) + sunScreenX;
        const topOffset   = (orbitRect.top  - spaceRect.top)  + sunScreenY;

        sunGlow.style.left      = `${leftOffset}px`;
        sunGlow.style.top       = `${topOffset}px`;
        sunGlow.style.transform = 'translate(-50%, -50%)';
    }
}

let orbitLine = null;
function drawOrbitLine() {
    if (orbitLine) scene.remove(orbitLine);

    const eccentricity  = 0.14;
    const semiMajorAxis = radius;
    const semiMinorAxis = radius * Math.sqrt(1 - eccentricity * eccentricity);
    const centerOffset  = radius * eccentricity;

    const curve = new THREE.EllipseCurve(
        -centerOffset, 0,
        semiMajorAxis,
        semiMinorAxis,
        0, 2 * Math.PI,
        false
    );

    const points   = curve.getPoints(128);
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({ color: 0xffffff, opacity: 0.5, transparent: true });

    orbitLine = new THREE.LineLoop(geometry, material);
    scene.add(orbitLine);
}

function updatePosition(angle) {
    if (!radius) initThreeSize();

    const rad          = angle * Math.PI / 1800;
    const eccentricity = 0.14;
    const semiMajorAxis= radius;
    const semiMinorAxis= radius * Math.sqrt(1 - eccentricity * eccentricity);
    const centerOffset = radius * eccentricity;

    const x = Math.cos(rad) * semiMajorAxis - centerOffset;
    const y = Math.sin(rad) * semiMinorAxis;

    if (psycheModel) {
        psycheModel.position.x = x;
        psycheModel.position.y = -y;

        sunLight.position.set(0, 0, 0);
        sunLight.target = psycheModel;

        const spinx = angle * (10446 / 360) / 10;
        psycheModel.rotation.x = spinx;
        psycheModel.rotation.y = 0;
        // 8 degree tilt for ~95 degree total axial tilt
        psycheModel.rotation.z = 8 * Math.PI / 180;
    }

    // Update facts
    updateFacts(angle);

    // Update slider fill gradient
    const pct = ((angle - slider.min) / (slider.max - slider.min)) * 100;
    slider.style.setProperty('--slider-pct', pct + '%');

    if (camera) renderer.render(scene, camera);
}