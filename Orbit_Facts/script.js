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
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const sunLight = new THREE.DirectionalLight(0xffffff, 10);
sunLight.position.set(0, 0, 100);
scene.add(sunLight);

function initThreeSize() {
    const orbitElem = document.querySelector('.orbit');
    const orbitRect = orbitElem.getBoundingClientRect();
    const width = orbitRect.width;
    const height = orbitRect.height;

    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio || 1);

    const padding = 250;

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
        camera.left = width / -2 - padding - centerOffset;
        camera.right = width / 2 + padding - centerOffset;
        camera.top = height / 2 + padding;
        camera.bottom = height / -2 - padding;
        camera.updateProjectionMatrix();
    }

    const circleRadius = Math.min(width, height) / 1.32;
    radius = circleRadius;

    updateSunGlowPosition();
    drawOrbitLine();
}

function updateSunGlowPosition() {
    const sunGlow = document.querySelector('.sun');
    const orbitContainer = document.querySelector('.orbit');
    if (sunGlow && orbitContainer) {
        const eccentricity = 0.14;
        const centerOffset = radius * eccentricity;

        const orbitRect = orbitContainer.getBoundingClientRect();
        const spaceRect = document.querySelector('.space').getBoundingClientRect();

        const sunScreenX = (orbitRect.width / 2) + centerOffset;
        const sunScreenY = orbitRect.height / 2;

        const leftOffset = (orbitRect.left - spaceRect.left) + sunScreenX;
        const topOffset = (orbitRect.top - spaceRect.top) + sunScreenY;

        sunGlow.style.left = `${leftOffset}px`;
        sunGlow.style.top = `${topOffset}px`;
        sunGlow.style.transform = 'translate(-50%, -50%)';
    }
}

let orbitLine = null;
function drawOrbitLine() {
    if (orbitLine) {
        scene.remove(orbitLine);
    }

    const eccentricity = 0.14;
    const semiMajorAxis = radius;
    const semiMinorAxis = radius * Math.sqrt(1 - eccentricity * eccentricity);
    const centerOffset = radius * eccentricity;

    const curve = new THREE.EllipseCurve(
        -centerOffset, 0,
        semiMajorAxis,
        semiMinorAxis,
        0, 2 * Math.PI,
        false
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
        text: "Psyche may be exposed iron-nickel core material of a planetesimal that lost its outer layers in ancient collisions, offering a rare glimpse into planetary interiors normally hidden beneath rock and ice."
    },
    {
        range: [3150, 3600],
        text: "Psyche may help us understand how terrestrial planets like Earth, Mars, Venus, and Mercury formed their iron cores during the chaotic early years of solar system history—a period when planetary bodies were still colliding and separating into distinct layers."
    }
];

function updatePosition(angle) {
    if (!radius) {
        initThreeSize();
    }

    const rad = angle * Math.PI / 1800;

    const eccentricity = 0.14;
    const semiMajorAxis = radius;
    const semiMinorAxis = radius * Math.sqrt(1 - eccentricity * eccentricity);
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

    // Update fun fact based on angle
    let currentFact = facts[0].text;
    for (const fact of facts) {
        if (angle >= fact.range[0] && angle < fact.range[1]) {
            currentFact = fact.text;
            break;
        }
    }
    infoBox.textContent = `Fun Fact: ${currentFact}`;

    // Update general fact based on angle
    let currentGeneralFact = generalFacts[0].text;
    for (const fact of generalFacts) {
        if (angle >= fact.range[0] && angle < fact.range[1]) {
            currentGeneralFact = fact.text;
            break;
        }
    }
    generalInfoBox.textContent = `General Fact: ${currentGeneralFact}`;

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
        model.scale.set(8, 8, 8);

        model.traverse((child) => {
            if (child.isMesh) {
                child.frustumCulled = false;
            }
        });

        const poleGeometry = new THREE.SphereGeometry(1, 16, 16);
        const northPoleMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        const southPoleMaterial = new THREE.MeshBasicMaterial({ color: 0x0000ff });

        const northPole = new THREE.Mesh(poleGeometry, northPoleMaterial);
        const southPole = new THREE.Mesh(poleGeometry, southPoleMaterial);

        northPole.position.set(6, 0, 0);
        southPole.position.set(-6, 0, 0);

        model.add(northPole);
        model.add(southPole);

        psycheModel = model;
        scene.add(model);

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
        sunModel.position.set(0, 0, 0);
        sunModel.scale.set(150, 150, 150);

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
            psycheModel.scale.set(1, 1, 1);
        } else {
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

// Autoplay animation function
let lastTime = Date.now();
let currentValue = 0;

function animate() {
    if (isAutoplay) {
        const currentTime = Date.now();
        const deltaTime = (currentTime - lastTime) / 1000;
        lastTime = currentTime;

        currentValue += 10 * deltaTime;

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