// ─── models.js ───────────────────────────────────────────────
// Thee.js GLTF model loading for Psyche asteroid and Sun

const loader = new THREE.GLTFLoader();

// Load Psyche asteroid model
loader.load(
    './models/psyche/scene.glb',
    function (gltf) {
        const model = gltf.scene;
        model.scale.set(8, 8, 8);

        model.traverse((child) => {
            if (child.isMesh) child.frustumCulled = false;
        });

        // Add pole markers
        const poleGeometry      = new THREE.SphereGeometry(1, 16, 16);
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

        if (!radius || !camera) initThreeSize();

        updatePosition(parseFloat(slider.value));
        console.log('Psyche model loaded!');
    },
    function (xhr) {
        console.log((xhr.loaded / xhr.total * 100) + '% loaded');
    },
    function (error) {
        console.error('Error loading Psyche model:', error);
    }
);

// Load Sun model
loader.load(
    './models/psyche/sun.glb',
    function (gltf) {
        sunModel = gltf.scene;
        sunModel.position.set(0, 0, 0);
        sunModel.scale.set(150, 150, 150);

        sunModel.traverse((child) => {
            if (child.isMesh) child.frustumCulled = false;
        });

        scene.add(sunModel);
        initThreeSize();
        requestAnimationFrame(updateSunGlowPosition);
        console.log('Sun model loaded!');
    },
    function (xhr) {
        console.log('Sun: ' + (xhr.loaded / xhr.total * 100) + '% loaded');
    },
    function (error) {
        console.error('Error loading Sun model:', error);
    }
);