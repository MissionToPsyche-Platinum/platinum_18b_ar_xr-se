// ─── script.js ────────────────────────────────────────────────
//Global variables

const slider        = document.querySelector('#orbitSlider');
const infoBox       = document.querySelector('#infoBox');
const generalInfoBox= document.querySelector('#generalInfoBox');
const container     = document.getElementById('three-container');
const viewToggle    = document.getElementById('viewToggle');
const autoplayToggle= document.getElementById('autoplayToggle');

let radius        = 0;
let isRealisticView = false;
let psycheModel   = null;
let sunModel      = null;
let isAutoplay    = false;
let animationId   = null;
let autoplaySpeed = 10;
let currentValue  = 0;
let lastTime      = Date.now();

// ─── Three.js Scene Setup ────────────────────────────────────
const scene    = new THREE.Scene();
let   camera   = null;

const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
container.appendChild(renderer.domElement);

const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const sunLight = new THREE.DirectionalLight(0xffffff, 10);
sunLight.position.set(0, 0, 100);
scene.add(sunLight);
