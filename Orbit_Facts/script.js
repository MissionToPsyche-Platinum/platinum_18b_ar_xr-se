const slider = document.querySelector('#orbitSlider');
const infoBox = document.querySelector('#infoBox');
const container = document.getElementById('three-container');
const viewToggle = document.getElementById('viewToggle');

let radius = 0;           // Will be set based on container size
let isRealisticView = false; // Start with normal view

// Three.js setup
const scene = new THREE.Scene();

let camera = null;
// const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 2000);
// camera.position.z = 1000;

const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
container.appendChild(renderer.domElement);

// Create a cube to represent Psyche (placeholder)
let psycheModel = null;

const geometry = new THREE.BoxGeometry(30, 30, 30);
const material = new THREE.MeshPhongMaterial({
    color: 0x888888,
    shininess: 30
});
const cube = new THREE.Mesh(geometry, material);
// Optional: add placeholder so there's *something* if GLTF fails
psycheModel = cube;
scene.add(cube);

// Add lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 1);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
directionalLight.position.set(0, 0, 1000);
scene.add(directionalLight);

const sideLight = new THREE.DirectionalLight(0xffffff, 1);
sideLight.position.set(500, 500, 500);
scene.add(sideLight);

function initThreeSize() {
    // Measure the dashed orbit element itself
    const orbitElem = document.querySelector('.orbit');
    const rect = orbitElem.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    // Match the renderer to the orbit circle
    renderer.setSize(width, height);
    renderer.setPixelRatio(window.devicePixelRatio || 1);

    // Create or update an orthographic camera that matches the orbit dimensions
    if (!camera) {
        camera = new THREE.OrthographicCamera(
            width / -2,
            width / 2,
            height / 2,
            height / -2,
            0.1,
            2000
        );
        camera.position.set(0, 0, 1000);
        camera.lookAt(0, 0, 0);
    } else {
        camera.left = width / -2;
        camera.right = width / 2;
        camera.top = height / 2;
        camera.bottom = height / -2;
        camera.updateProjectionMatrix();
    }

    // Radius right on the dashed circle (minus a tiny margin if needed)
    const circleRadius = Math.min(width, height) / 2;
    const margin = 2; // adjust to taste
    radius = circleRadius - margin;
}

// Fun facts about seasons on 16 Psyche
const facts = [
    {
        range: [0, 90],
        text: "Psyche's axial tilt of ~98° causes extreme seasons, where poles face the Sun directly during parts of the orbit."
    },
    {
        range: [90, 180],
        text: "Due to the high tilt, one pole experiences continuous sunlight for about 2.5 Earth years, mimicking a 2.5 year long summer day."
    },
    {
        range: [180, 270],
        text: "The opposite pole endures darkness for the same duration, resulting in a long 'winter' night."
    },
    {
        range: [270, 360],
        text: "The rapid 4.2-hour rotation means the asteroid rotates over 10,000 times per orbit."
    }
];

function updatePosition(angle) {
    // Ensure radius is initialized
    if (!radius) {
        initThreeSize();
    }

    const rad = angle * Math.PI / 180;
    const x = Math.cos(rad) * radius;
    const y = Math.sin(rad) * radius;

    // Move the model along the orbit
    if (psycheModel) {
        psycheModel.position.x = x;
        psycheModel.position.y = -y;

        // Rotate the model (spin tied to slider)
        const spin = angle * 4;
        psycheModel.rotation.x = spin * Math.PI / 180;
        psycheModel.rotation.y = spin * Math.PI / 180;
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

    renderer.render(scene, camera);
}

// Load GLTF model to replace placeholder cube
const loader = new THREE.GLTFLoader();
loader.load(
    './models/psyche/scene.glb',
    function (gltf) {
        const model = gltf.scene;
        model.scale.set(5, 5, 5);
        // Remove placeholder cube if it exists
        if (psycheModel && psycheModel !== model) {
            scene.remove(psycheModel);
        }
        psycheModel = model;
        scene.add(model);

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
            // "Realistic" (exaggerated) view for demonstration
            psycheModel.scale.set(15, 15, 15);
        } else {
            // Normal view - easier to see
            psycheModel.scale.set(5, 5, 5);
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

// Initial sizing and render
initThreeSize();
updatePosition(0);
