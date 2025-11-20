const slider = document.querySelector('#orbitSlider');
const infoBox = document.querySelector('#infoBox');
const container = document.getElementById('three-container');
const viewToggle = document.getElementById('viewToggle');
const radius = 233; // Adjusted for larger container

let isRealisticView = false; // Start with normal view

// Three.js setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 2000);
camera.position.z = 1000;

const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
renderer.setSize(1200, 1200);
container.appendChild(renderer.domElement);

// Create a cube to represent Psyche (placeholder)
let psycheModel = null;

const geometry = new THREE.BoxGeometry(30, 30, 30);
const material = new THREE.MeshPhongMaterial({
    color: 0x888888,
    shininess: 30
});
const cube = new THREE.Mesh(geometry, material);
// Don't add cube to scene yet - will be replaced by GLTF
psycheModel = cube;

// Add lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 1); // Brighter ambient light
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 2); // Stronger directional light
directionalLight.position.set(0, 0, 1000); // Position it at the camera
scene.add(directionalLight);

// Add a second light from the side for better visibility
const sideLight = new THREE.DirectionalLight(0xffffff, 1);
sideLight.position.set(500, 500, 500);
scene.add(sideLight);

// Load GLTF model to replace cube
const loader = new THREE.GLTFLoader();
loader.load(
    './models/psyche/scene.glb',
    function(gltf) {
        const model = gltf.scene;
        model.scale.set(5, 5, 5); // Size of the sun (comment from original)
        psycheModel = model; // Replace cube reference
        scene.add(model);

        // Set initial position based on slider
        const currentAngle = parseFloat(slider.value);
        updatePosition(currentAngle);

        console.log('GLTF model loaded and orbiting!');
    },
    function(xhr) {
        console.log((xhr.loaded / xhr.total * 100) + '% loaded');
    },
    function(error) {
        console.error('Error loading GLTF:', error);
    }
);

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
    const rad = angle * Math.PI / 180;
    const x = Math.cos(rad) * radius;
    const y = Math.sin(rad) * radius;

    // Move the model along the orbit
    if (psycheModel) {
        psycheModel.position.x = x;
        psycheModel.position.y = -y;

        // Rotate the model (spin)
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

// Update position when slider changes
slider.addEventListener('input', () => {
    const angle = parseFloat(slider.value);
    updatePosition(angle);
});

// Initialize position
updatePosition(0);

// Toggle between usable and realistic view
viewToggle.addEventListener('click', () => {
    isRealisticView = !isRealisticView;
    viewToggle.classList.toggle('active');

    if (psycheModel) {
        if (isRealisticView) {
            // Realistic view - actual scale relative to sun
            psycheModel.scale.set(10000, 10000, 10000);
        } else {
            // Normal view - easier to see
            psycheModel.scale.set(5, 5, 5);
        }

        // Re-render the scene
        const currentAngle = parseFloat(slider.value);
        updatePosition(currentAngle);
    }
});
