const slider = document.querySelector('#orbitSlider');
const infoBox = document.querySelector('#infoBox');
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

    const padding = 150;

    // Create or update an orthographic camera that matches the orbit dimensions
    if (!camera) {
        camera = new THREE.OrthographicCamera(
            width / -2 - padding,
            width / 2 + padding,
            height / 2 + padding,
            height / -2 - padding,
            0.1,
            2000
        );
        camera.position.set(0, 0, 1000);
        camera.lookAt(0, 0, 0);
    } else {
        camera.left = width / -2 - padding;
        camera.right = width / 2 + padding;
        camera.top = height / 2 + padding;
        camera.bottom = height / -2 - padding;
        camera.updateProjectionMatrix();
    }

    // Inner dashed circle: used for actual orbit radius
    const circleElem = document.querySelector('.orbit-circle');
    if (circleElem) {
        const circleRect = circleElem.getBoundingClientRect();
        const circleWidth = circleRect.width;
        const circleHeight = circleRect.height;
        const circleRadius = Math.min(circleWidth, circleHeight) / 1.32;
        const margin = 0;
        radius = circleRadius - margin;
    } else {
        // Fallback if .orbit-circle doesn't exist
        const circleRadius = Math.min(width, height) / 2;
        const margin = 50;
        radius = circleRadius - margin;
    }
}

// Fun facts about seasons on 16 Psyche
const facts = [
    {
        range: [0, 450],
        text: "Psyche's axial tilt of ~98° causes extreme seasons, where poles face the Sun directly during parts of the orbit."
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
        text: "Temperature swings of 240°F can occur on Psyche between its sunlit and shadowed poles during different seasons."
    },
    {
        range: [1800, 2250],
        text: "The opposite pole endures darkness for the same duration, resulting in a long 'winter' night."
    },
    {
        range: [2250, 2700],
        text: "Psyche's elliptical orbit brings it as close as 235 million miles to the Sun and as far as 309 million miles away."
    },
    {
        range: [2700, 3150],
        text: "The rapid 4.2-hour rotation means the asteroid rotates over 10,000 times per orbit."
    },
    {
        range: [3150, 3600],
        text: "At the warmest, Psyche's surface reaches only -100°F (-70°C). At the poles during winter, temperatures plunge to -340°F (-200°C)."
    }
];

function updatePosition(angle) {
    // Ensure radius is initialized
    if (!radius) {
        initThreeSize();
    }

    const rad = angle * Math.PI / 1800;
    const x = Math.cos(rad) * radius;
    const y = Math.sin(rad) * radius;

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

        // Add 8 degree tilt for 98 degree total axial tilt
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

        currentValue += 50 * deltaTime; // 10 slider units = 1 degree, so 10 per second

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