const slider = document.querySelector('#orbitSlider');
const infoBox = document.querySelector('#infoBox');
const generalInfoBox = document.querySelector('#generalInfoBox');
const container = document.getElementById('three-container');
const viewToggle = document.getElementById('viewToggle');
const autoplayToggle = document.getElementById('autoplayToggle');

let radius = 0;           // Will be set based on container size
let isRealisticView = false; // Start with To Scale view
let psycheModel = null;   // Will hold the loaded 3D model
let isAutoplay = false;   // Autoplay state
let animationId = null;   // Animation frame ID

// Three.js setup
const scene = new THREE.Scene();

let camera = null;

const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
container.appendChild(renderer.domElement);

// Add lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5); // Increased ambient light
scene.add(ambientLight);

const sunLight = new THREE.DirectionalLight(0xffffff, 10); // Increased sunlight intensity
sunLight.position.set(0, 0, 100);
scene.add(sunLight);

function initThreeSize() {
    // Measure the dashed orbit element itself
    const orbitElem = document.querySelector('.orbit');
    const orbitRect = orbitElem.getBoundingClientRect();
    const width = orbitRect.width;
    const height = orbitRect.height;

    // Match the renderer to the orbit circle
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio || 1);

    const padding = 250; // Increased padding to accommodate Sun and elliptical offset

    // Calculate elliptical offset for camera positioning
    const eccentricity = 0.14;
    const centerOffset = radius * eccentricity;

    // Create or update an orthographic camera that matches the orbit dimensions
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
        camera.left = width / -2 - padding - centerOffset;
        camera.right = width / 2 + padding - centerOffset;
        camera.top = height / 2 + padding;
        camera.bottom = height / -2 - padding;
        camera.updateProjectionMatrix();
    }

    // Calculate radius from orbit container since orbit-circle is now hidden
    const circleRadius = Math.min(width, height) / 1.32;
    radius = circleRadius;

    // Position sun glow to match the Sun's position accounting for camera offset
    updateSunGlowPosition();

    // Draw the elliptical orbit line in Three.js using the same values as the asteroid path
    drawOrbitLine();
}

function updateSunGlowPosition() {
    const sunGlow = document.querySelector('.sun');
    const orbitContainer = document.querySelector('.orbit');
    if (sunGlow && orbitContainer) {
        // The camera lookAt is at (-centerOffset, 0, 0)
        // But the Sun is at (0, 0, 0)
        // So visually, the Sun appears offset from center
        const eccentricity = 0.14;


        // Get orbit container rect to position relative to it
        const orbitRect = orbitContainer.getBoundingClientRect();
        const spaceRect = document.querySelector('.space').getBoundingClientRect();

        // Sun at (0,0,0) with camera looking at (-centerOffset, 0, 0)
        // means Sun appears at +centerOffset in screen space
        const sunScreenX = (orbitRect.width / 2);
        const sunScreenY = orbitRect.height / 2;

        // Position relative to space container
        const leftOffset = (orbitRect.left - spaceRect.left) + sunScreenX;
        const topOffset = (orbitRect.top - spaceRect.top) + sunScreenY;

        sunGlow.style.left = `${leftOffset}px`;
        sunGlow.style.top = `${topOffset}px`;
        sunGlow.style.transform = 'translate(-50%, -50%)';
    }
}

let orbitLine = null;
function drawOrbitLine() {
    // Remove existing orbit line if present
    if (orbitLine) {
        scene.remove(orbitLine);
    }

    const eccentricity = 0.14;
    const semiMajorAxis = radius;
    const semiMinorAxis = radius * Math.sqrt(1 - eccentricity * eccentricity);
    const centerOffset = radius * eccentricity;

    // EllipseCurve(x, y, xRadius, yRadius, startAngle, endAngle)
    const curve = new THREE.EllipseCurve(
        -centerOffset, 0,       // Center offset so Sun is at one focus
        semiMajorAxis,          // X radius
        semiMinorAxis,          // Y radius
        0, 2 * Math.PI,         // Full ellipse
        false                   // Clockwise
    );

    const points = curve.getPoints(128);
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({
        color: 0xffffff,
        opacity: 0.5,
        transparent: true
    });

    orbitLine = new THREE.LineLoop(geometry, material);
    scene.add(orbitLine);
}

// Fun facts about seasons on 16 Psyche
const facts = [
    {
        range: [0, 450],
        text: "Psyche's axial tilt of ~95° causes extreme seasons, where poles face the Sun directly during parts of the orbit."
    },
    {
        range: [450, 900],
        text: "Unlike Earth where the equator is warmest, Psyche's sideways rotation means the poles receive the most intense seasonal heating."
    },
    {
        range: [900, 1350],
        text: "Due to the high tilt, one pole experiences continuous sunlight for about 2.5 Earth years, mimicking a 2.5 year long summer day."
    },
    {
        range: [1350, 1800],
        text: "The opposite pole endures darkness for the same duration, resulting in a long 'winter' night."
    },
    {
        range: [1800, 2250],
        text: "Temperature swings of 240°F can occur on Psyche between its sunlit and shadowed poles during different seasons."
    },
    {
        range: [2250, 2700],
        text: "At the warmest, Psyche's surface reaches only -100°F (-70°C). At the poles during winter, temperatures plunge to -340°F (-200°C)."
    },
    {
        range: [2700, 3150],
        text: "During Psyche's polar winter, temperatures plunge to -340°F—cold enough to freeze carbon dioxide into dry ice and turn gases like methane and ammonia into solid ice crystals in the shadowed polar craters."
    },
    {
        range: [3150, 3600],
        text: "The temperature difference between Psyche's sunlit and shadowed hemispheres can exceed 240°F, creating extreme thermal stress on the asteroid's metallic surface."
    }
];

// General facts about 16 Psyche
const generalFacts = [
    {
        range: [0, 450],
        text: "Psyche's elliptical orbit brings it as close as 235 million miles to the Sun and as far as 309 million miles away."
    },
    {
        range: [450, 900],
        text: "Psyche's orbital eccentricity of about 0.14 means its distance from the Sun varies by about 74 million miles between its closest and farthest points."
    },
    {
        range: [900, 1350],
        text: "Due to its elliptical orbit, Psyche moves faster when closer to the Sun (perihelion) and slower when farther away (aphelion), following Kepler's laws of planetary motion."
    },
    {
        range: [1350, 1800],
        text: "The rapid 4.2-hour rotation (Psyche's \"day\") means the asteroid rotates over 10,000 times per orbit around the sun (Psyche's \"year\")."
    },
    {
        range: [1800, 2250],
        text: "Despite being only 1% of the Moon's mass, Psyche may contain more iron-nickel metal than has ever been mined on Earth throughout human history."
    },
    {
        range: [2250, 2700],
        text: "Psyche measures approximately 280 kilometers (173 miles) across at its widest point—roughly the distance from Los Angeles to San Diego."
    },
    {
        range: [2700, 3150],
        text: "Psyche may be the exposed iron-nickel core of a planetesimal that lost its outer layers in ancient collisions, offering a rare glimpse into planetary interiors normally hidden beneath rock and ice."
    },
    {
        range: [3150, 3600],
        text: "Psyche may help us understand how terrestrial planets like Earth, Mars, Venus, and Mercury formed their iron cores during the chaotic early years of solar system history—a period when planetary bodies were still colliding and separating into distinct layers."
    }
];

function updatePosition(angle) {
    // Ensure radius is initialized
    if (!radius) {
        initThreeSize();
    }

    const rad = angle * Math.PI / 1800;

    // Psyche's orbital eccentricity is ~0.14
    // Semi-major axis (a) and semi-minor axis (b) relationship: b = a * sqrt(1 - e^2)
    const eccentricity = 0.14;
    const semiMajorAxis = radius;
    const semiMinorAxis = radius * Math.sqrt(1 - eccentricity * eccentricity);

    // Center offset to keep Sun at one focus (not center)
    const centerOffset = radius * eccentricity;

    const x = Math.cos(rad) * semiMajorAxis - centerOffset;
    const y = Math.sin(rad) * semiMinorAxis;

    // Move the model along the orbit
    if (psycheModel) {
        psycheModel.position.x = x;
        psycheModel.position.y = -y;

        // Update sunlight to point from sun (at origin) to Psyche
        sunLight.position.set(0, 0, 0);
        sunLight.target = psycheModel;

        //calculate spins
        const spinx = angle * (10446 / 360) / 10;

        // Rotate the model (spin tied to slider)
        psycheModel.rotation.x = spinx;

        //used to spin model in y direction
        psycheModel.rotation.y = 0;

        // Add 8 degree tilt for ~95 degree total axial tilt
        psycheModel.rotation.z = 8 * Math.PI / 180;
    }

    // Update fun fact based on angle
    let currentFact = facts[0].text;
    for (const fact of facts) {
        if (angle >= fact.range[0] && angle < fact.range[1]) {
            currentFact = fact.text;
            break;
        }
    }
    const infoBody = infoBox.querySelector('.info-box-body');
    if (infoBody) { infoBody.textContent = currentFact; } else { infoBox.textContent = currentFact; }

    // Update general fact based on angle
    let currentGeneralFact = generalFacts[0].text;
    for (const fact of generalFacts) {
        if (angle >= fact.range[0] && angle < fact.range[1]) {
            currentGeneralFact = fact.text;
            break;
        }
    }
    const generalBody = generalInfoBox.querySelector('.info-box-body');
    if (generalBody) { generalBody.textContent = currentGeneralFact; } else { generalInfoBox.textContent = currentGeneralFact; }

    // Update slider fill gradient
    const pct = ((angle - slider.min) / (slider.max - slider.min)) * 100;
    slider.style.setProperty('--slider-pct', pct + '%');

    if (camera) {
        renderer.render(scene, camera);
    }
}

// Load GLTF model
const loader = new THREE.GLTFLoader();
loader.load(
    './models/psyche/scene.glb',
    function (gltf) {
        const model = gltf.scene;
        model.scale.set(8, 8, 8); // Start with "To Scale" view

        // Disable frustum culling to prevent clipping
        model.traverse((child) => {
            if (child.isMesh) {
                child.frustumCulled = false;
            }
        });

        // Add pole markers (spheres at top and bottom)
        const poleGeometry = new THREE.SphereGeometry(1, 16, 16); // Smaller dots
        const northPoleMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 }); // Red for north
        const southPoleMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff }); // Blue for south

        const northPole = new THREE.Mesh(poleGeometry, northPoleMaterial);
        const southPole = new THREE.Mesh(poleGeometry, southPoleMaterial);

        // Position poles (adjust Y values based on your model's size)
        northPole.position.set(6, 0, 0); // Moved closer to center
        southPole.position.set(-6, 0, 0); // Moved closer to center

        // Add poles to the model so they rotate with it
        model.add(northPole);
        model.add(southPole);

        psycheModel = model;
        scene.add(model);

        // Ensure everything is initialized before first render
        if (!radius || !camera) {
            initThreeSize();
        }

        const currentAngle = parseFloat(slider.value);
        updatePosition(currentAngle);

        console.log('GLTF model loaded and orbiting!');
    },
    function (xhr) {
        console.log((xhr.loaded / xhr.total * 100) + '% loaded');
    },
    function (error) {
        console.error('Error loading GLTF:', error);
    }
);

// Load Sun GLTF model
loader.load(
    './models/psyche/sun.glb',
    function (gltf) {
        const sunModel = gltf.scene;
        sunModel.position.set(0, 0, 0); // Position at origin (center)
        sunModel.scale.set(150, 150, 150); // Enlarged for visibility

        // Disable frustum culling
        sunModel.traverse((child) => {
            if (child.isMesh) {
                child.frustumCulled = false;
            }
        });

        scene.add(sunModel);
        console.log('Sun model loaded!');
    },
    function (xhr) {
        console.log('Sun: ' + (xhr.loaded / xhr.total * 100) + '% loaded');
    },
    function (error) {
        console.error('Error loading Sun model:', error);
    }
);

// Slider listener
slider.addEventListener('input', () => {
    const angle = parseFloat(slider.value);
    updatePosition(angle);
});

// View toggle listener
viewToggle.addEventListener('click', () => {
    isRealisticView = !isRealisticView;
    viewToggle.classList.toggle('active');

    if (psycheModel) {
        if (isRealisticView) {
            // "Realistic" (smaller) view
            psycheModel.scale.set(1, 1, 1);
        } else {
            // To Scale view - easier to see
            psycheModel.scale.set(8, 8, 8);
        }

        const currentAngle = parseFloat(slider.value);
        updatePosition(currentAngle);
    }
});

// Handle window resize
window.addEventListener('resize', () => {
    initThreeSize();
    const currentAngle = parseFloat(slider.value);
    updatePosition(currentAngle);
});

// Autoplay animation function (1 degree per second = 10 slider units per second with max 3600)
let lastTime = Date.now();
let currentValue = 0;

function animate() {
    if (isAutoplay) {
        const currentTime = Date.now();
        const deltaTime = (currentTime - lastTime) / 1000; // seconds elapsed
        lastTime = currentTime;

        currentValue += 10 * deltaTime; // 10 slider units = 1 degree, so 10 per second

        if (currentValue >= 3600) {
            currentValue = 0;
        }

        slider.value = Math.floor(currentValue);
        updatePosition(Math.floor(currentValue));

        animationId = requestAnimationFrame(animate);
    }
}

// Autoplay toggle listener
autoplayToggle.addEventListener('click', () => {
    isAutoplay = !isAutoplay;
    autoplayToggle.classList.toggle('active');

    if (isAutoplay) {
        currentValue = parseFloat(slider.value);
        lastTime = Date.now();
        animate();
    } else {
        if (animationId) {
            cancelAnimationFrame(animationId);
            animationId = null;
        }
    }
});

// Initial sizing and render
initThreeSize();
updatePosition(0);