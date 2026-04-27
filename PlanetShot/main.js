(() => {
    const canvas = document.getElementById("game");
    const ctx = canvas.getContext("2d");
    const hudLevel = document.getElementById("level");
    const hudAngle = document.getElementById("angle");
    const hudPower = document.getElementById("power");
    const hudShots = document.getElementById("shots");
    const hudTotalShots = document.getElementById("totalShots");
    const msg = document.getElementById("msg");

    const shipImg = new Image();
    shipImg.src = "ship.png";
    const psycheImg = new Image();
    psycheImg.src = "asteroid.png";

    const mercuryImg = new Image();
    mercuryImg.src = "mercury.svg";
    const venusImg = new Image();
    venusImg.src = "venus.svg";
    const earthImg = new Image();
    earthImg.src = "earth.svg";
    const marsImg = new Image();
    marsImg.src = "mars.svg";
    const jupiterImg = new Image();
    jupiterImg.src = "jupiter.svg";
    const saturnImg = new Image();
    saturnImg.src = "saturn.svg";
    const uranusImg = new Image();
    uranusImg.src = "uranus.svg";
    const neptuneImg = new Image();
    neptuneImg.src = "neptune.svg";
    

    const celestialCatalog = {
        mercury: {
            name: "Mercury",
            r: 36,
            mu: 10500000,
            soften: 900,
            image: mercuryImg
        },
        venus: {
            name: "Venus",
            r: 58,
            mu: 18000000,
            soften: 1700,
            image: venusImg
        },
        earth: {
            name: "Earth",
            r: 60,
            mu: 20000000,
            soften: 1800,
            image: earthImg
        },
        mars: {
            name: "Mars",
            r: 42,
            mu: 11000000,
            soften: 1100,
            image: marsImg
        },
        jupiter: {
            name: "Jupiter",
            r: 82,
            mu: 28000000,
            soften: 2600,
            image: jupiterImg
        },
        saturn: {
            name: "Saturn",
            r: 74,
            mu: 24000000,
            soften: 2300,
            image: saturnImg
        },
        uranus: {
            name: "Uranus",
            r: 66,
            mu: 21000000,
            soften: 2000,
            image: uranusImg
        },
        neptune: {
            name: "Neptune",
            r: 68,
            mu: 22000000,
            soften: 2050,
            image: neptuneImg
        }
    }

    const pars = [3, 4, 4, 5, 4, 4, 3, 4, 5, 4, 4, 3, 4, 5, 4, 3, 4, 5]
    const PAR = 72;
    let currentPar = 0;

    
    const levels = [
        {
            ship: { x: 0.12, y: 0.5 },
            asteroid: { x: 0.86, y: 0.5, r: 40 },
            previewFraction: 0.60,
            previewBaseMaxPoints: 70,
            previewSpeedScale: 50,
            bodies: [
                { type: "mars", x: 0.5, y: 0.5 }
            ]
        },
        {
            ship: { x: 0.16, y: 0.75 },
            asteroid: { x: 0.85, y: 0.42, r: 40 },
            previewFraction: 0.5,
            previewBaseMaxPoints: 60,
            previewSpeedScale: 40,
            bodies: [
                { type: "venus", x: 0.42, y: 0.45 },
                { type: "mercury", x: 0.72, y: 0.62 }
            ]
        },
        {
            ship: { x: 0.20, y: 0.8 },
            asteroid: { x: 0.9, y: 0.2, r: 40 },
            previewFraction: 0.5,
            previewBaseMaxPoints: 60,
            previewSpeedScale: 40,
            bodies: [
                { type: "earth", x: 0.33, y: 0.76 },
                { type: "mars", x: 0.72, y: 0.25}
            ]
        },
        {
            ship: { x: 0.16, y: 0.2 },
            asteroid: { x: 0.78, y: 0.8, r: 40 },
            previewFraction: 0.60,
            previewBaseMaxPoints: 50,
            previewSpeedScale: 30,
            bodies: [
                { type: "jupiter", x: 0.5, y: 0.5 },
                { type: "mercury", x: 0.6, y: 0.82}
            ]
        },
        {
            ship: { x: 0.42, y: 0.2 },
            asteroid: { x: 0.60, y: 0.81, r: 40 },
            previewFraction: 0.5,
            previewBaseMaxPoints: 60,
            previewSpeedScale: 40,
            bodies: [ 
                { type: "neptune", x: 0.38, y: 0.42 },
                { type: "uranus", x: 0.66, y: 0.70 }
            ]
        },
        {
            ship: { x: 0.61, y: 0.84 },
            asteroid: { x: 0.2, y: 0.25, r:40 },
            previewFraction: 0.5,
            previewBaseMaxPoints: 60,
            previewSpeedScale: 40,
            bodies: [
                { type: "earth", x: 0.38, y: 0.65 },
                { type: "mars", x: 0.2, y: 0.38 }
            ]
        },
        {
            ship: { x: 0.85, y: 0.2 },
            asteroid: { x: 0.24, y: 0.34, r: 40 },
            previewFraction: 0.6,
            previewBaseMaxPoints: 70,
            previewSpeedScale: 50,
            bodies: [
                { type: "jupiter", x: 0.5, y: 0.5}
            ]
        },
        {
            ship: { x: 0.78, y: 0.82 },
            asteroid: { x: 0.32, y: 0.28, r: 40 },
            previewFraction: 0.5,
            previewBaseMaxPoints: 60,
            previewSpeedScale: 40,
            bodies: [
                { type: "mercury", x: 0.45, y: 0.68 },
                { type: "venus", x: 0.26, y: 0.48 },
                { type: "earth", x: 0.72, y: 0.28}
            ]
        },
        {
            ship: { x: 0.54, y: 0.23 },
            asteroid: { x: 0.24, y: 0.81, r: 40 },
            previewFraction: 0.4,
            previewBaseMaxPoints: 50,
            previewSpeedScale: 30,
            bodies: [
                { type: "jupiter", x: 0.68, y: 0.36 },
                { type: "mars", x: 0.25, y: 0.5 },
                { type: "earth", x: 0.78, y: 0.77 }
            ]
        }
    ];
    
    let currentLevel = 0;
    let activeBodies = [];
    let cachedTrajectory = [];
    let previewDirty = true;

    const ship = {
        x: 200,
        y: canvas.height / 2,
        vx: 0,
        vy: 0,
        r: 12,
        angle: 0,
        width: 60,
        height: 90
    };

    const asteroid = {
        x: canvas.width - 200,
        y: Math.random() * (canvas.height - 200) + 100,
        r: 40
    };

    const MIN_POWER = 0.1
    const MAX_POWER = 2.0;
    const POWER_STEP = 0.1;
    const POWER_RATE = 1.5;
    const SPEED_SCALE = 380;
    const FRICTION = 0.0;
    const STOP_EPS = 0.05;

    const DEBUG = true;

    let charging = false;
    let power = MIN_POWER;
    let shotsThisLevel = 0;
    let totalShots = 0;
    let won = false;
    let lost = false;

    function clampPower(value) {
        return Math.max(MIN_POWER, Math.min(MAX_POWER, value));
    }

    function isShipMoving() {
        return Math.hypot(ship.vx, ship.vy) > STOP_EPS;
    }

    function resolveCoord(value, max) {
        if (value == null) return max / 2;
        return value <=1 ? value * max : value;
    }

    function getCollidingBody(px, py, pr = ship.r) {
        for (const body of activeBodies) {
            const d = Math.hypot(px - body.x, py - body.y);
            if (d <= pr + body.r) {
                return body;
            }
        }
        return null;
    }

    function goToLevel(index) {
        currentLevel = Math.max(0, Math.min(levels.length -1, index));
        resetGame(false);
    }

    function buildBodySprite(body) {
        const size = Math.ceil(body.r * 2);

        const spriteCanvas = document.createElement("canvas");
        spriteCanvas.width = size;
        spriteCanvas.height = size;

        const sctx = spriteCanvas.getContext("2d");

        if (body.image && body.image.complete && body.image.naturalWidth > 0) {
            sctx.drawImage(body.image, 0, 0, size, size);
        } else {
            const g = sctx.createRadialGradient(
                size * 0.4,
                size * 0.4,
                6,
                size / 2,
                size / 2,
                body.r
            );
            g.addColorStop(0, "#ffe680");
            g.addColorStop(1, "#b38f00");
            sctx.fillStyle = g;
            sctx.beginPath();
            sctx.arc(size / 2, size / 2, body.r, 0, Math.PI * 2);
            sctx.fill();
            sctx.strokeStyle = "#ffd24d";
            sctx.lineWidth = 2;
            sctx.stroke();
        }
        
        return spriteCanvas;
    }

    function loadLevel(index) {

        previewDirty = true;
        
        const level = levels[index];

        ship.x = level.ship.x <= 1 ? canvas.width * level.ship.x : level.ship.x;
        ship.y = level.ship.y <= 1 ? canvas.height * level.ship.y : level.ship.y;
        ship.vx = 0;
        ship.vy = 0;
        ship.angle = 0;

        asteroid.r = level.asteroid.r;
        asteroid.x = level.asteroid.x <= 1 ? canvas.width * level.asteroid.x : level.asteroid.x;
        asteroid.y = level.asteroid.y <= 1 ? canvas.height * level.asteroid.y : level.asteroid.y;

        activeBodies = level.bodies.map((bodyDef) => {
            const base = celestialCatalog[bodyDef.type];

            if (!base) {
                throw new Error(`Unknown celestial body type: ${bodyDef.type}`);
            }

            const body = {
                type: bodyDef.type,
                name: base.name,
                x: resolveCoord(bodyDef.x, canvas.width),
                y: resolveCoord(bodyDef.y, canvas.height),
                r: bodyDef.r ?? base.r,
                mu: bodyDef.mu ?? base.mu,
                soften: bodyDef.soften ?? base.soften,
                image: base.image
            };

            body.spriteCanvas = buildBodySprite(body);

            return body;
        });

        if (activeBodies.length === 0) {
            throw new Error("Level must contain at least one body.");
        }

        hudLevel.textContent = String(index + 1);
    }

    function resize() {
        previewDirty = true;
        canvas.width = innerWidth;
        canvas.height = innerHeight;
        loadLevel(currentLevel);
    }
    window.addEventListener("resize", resize);
    resize();

    function placeStart() {
        ship.x = 200;
        ship.y = canvas.height / 2;
        ship.vx = 0;
        ship.vy = 0;
        asteroid.x = canvas.width - 200;
        asteroid.y = Math.random() * (canvas.height - 200) + 100;
    }

    canvas.addEventListener("mousedown", () => {
        if (won || lost) return;
        if (isShipMoving()) return; // no new shot while in flight
        
        const speed = power * SPEED_SCALE;
        ship.vx = Math.cos(ship.angle) * speed;
        ship.vy = Math.sin(ship.angle) * speed;

        shotsThisLevel++;
        totalShots++;
        hudShots.textContent = shotsThisLevel;
        hudTotalShots.textContent = totalShots;
    });

    window.addEventListener("mouseup", () => {
        if (!charging || won || lost) return;
        charging = false;
        const speed = power * SPEED_SCALE;
        ship.vx = Math.cos(ship.angle) * speed;
        ship.vy = Math.sin(ship.angle) * speed;
        shotsThisLevel++;
        totalShots++;
        hudShots.textContent = shotsThisLevel;
        hudTotalShots.textContent = totalShots;
        power = 0;
    });

    canvas.addEventListener("mousemove", (e) => {
        if (won || lost) return;
        if (isShipMoving()) return; // while moving, player cannot aim
        const rect = canvas.getBoundingClientRect();
        const mx = (e.clientX - rect.left) * (canvas.width / rect.width);
        const my = (e.clientY - rect.top) * (canvas.height / rect.height);
        const oldAngle = ship.angle;
        ship.angle = Math.atan2(my - ship.y, mx - ship.x);
        if (ship.angle !== oldAngle) previewDirty = true;
    });

    canvas.addEventListener("wheel", (e) => {
        if (won || lost) return;
        if (isShipMoving()) return;

        e.preventDefault();

        const oldPower = power;

        if (e.deltaY < 0) {
            power = clampPower(power + POWER_STEP);
        } else {
            power = clampPower(power - POWER_STEP);
        }

        if (oldPower !== power) previewDirty = true;

        hudPower.textContent = Math.round((power / MAX_POWER) * 100) + "%";
    }, { passive: false });

    window.addEventListener("keydown", (e) => {
        if (won || lost) return;
        if (isShipMoving()) return;

        const oldPower = power;

        if (e.code === "KeyE") {
            power = clampPower(power + POWER_STEP);
        } else if (e.code === "KeyQ") {
            power = clampPower(power - POWER_STEP);
        }

        if (oldPower !== power) previewDirty = true;

        hudPower.textContent = Math.round((power / MAX_POWER) * 100) + "%";

        if (!DEBUG) return;
        
        if (e.code === "BracketRight") {
            goToLevel(currentLevel + 1);
        } else if (e.code === "BracketLeft") {
            goToLevel(currentLevel - 1);
        } else if (e.code === "Backslash") {
            goToLevel(levels.length - 1);
        }
    });

    function drawShip() {
        ctx.save();
        ctx.translate(ship.x, ship.y);
        ctx.rotate(ship.angle + Math.PI / 2);
        if (shipImg.complete && shipImg.naturalWidth > 0) {
            ctx.drawImage(
                shipImg,
                -ship.width / 2,
                -ship.height / 2,
                ship.width,
                ship.height
            );
        } else {
            ctx.beginPath();
            ctx.moveTo(ship.r, 0);
            ctx.lineTo(-ship.r * 0.8, ship.r * 0.6);
            ctx.lineTo(-ship.r * 0.8, -ship.r * 0.6);
            ctx.closePath();
            ctx.fillStyle = "#00ffff";
            ctx.fill();
        }
        if (charging) {
            const glow = ctx.createRadialGradient(-ship.r, 0, 0, -ship.r, 0, 20);
            glow.addColorStop(0, "#ff6600cc");
            glow.addColorStop(1, "transparent");
            ctx.fillStyle = glow;
            ctx.beginPath();
            ctx.arc(-ship.r, 0, 20 * power + 5, 0, Math.PI * 2);
            ctx.fill();
        }
        ctx.restore();
    }

    function drawAsteroid() {
        ctx.save();
        const size = asteroid.r * 2;
        if (psycheImg.complete && psycheImg.naturalWidth > 0) {
            ctx.translate(asteroid.x, asteroid.y);
            ctx.drawImage(psycheImg, -size / 2, -size / 2, size, size);
        } else {
            const grad = ctx.createRadialGradient(
                asteroid.x - 10,
                asteroid.y - 10,
                asteroid.r * 0.2,
                asteroid.x,
                asteroid.y,
                asteroid.r
            );
            grad.addColorStop(0, "#555");
            grad.addColorStop(1, "#222");
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(asteroid.x, asteroid.y, asteroid.r, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = "#888";
            ctx.lineWidth = 2;
            ctx.stroke();
        }
        ctx.restore();
    }

    function drawBodies() {
        
        if (activeBodies.length === 0) return;

        for ( const body of activeBodies) {
            ctx.save();
            ctx.translate(body.x, body.y);

            if (body.spriteCanvas) {
                ctx.drawImage(
                    body.spriteCanvas,
                    -body.spriteCanvas.width / 2,
                    -body.spriteCanvas.height / 2
                );
            } else {
                const size = body.r * 2;
                const g = ctx.createRadialGradient(
                    body.x - 6,
                    body.y -6,
                    6,
                    body.x,
                    body.y,
                    body.r
                );
                g.addColorStop(0, "#ffe680");
                g.addColorStop(1, "#b38f00");
                ctx.fillStyle = g;
                ctx.beginPath();
                ctx.arc(0, 0, body.r, 0, Math.PI * 2);
                ctx.fill();
                ctx.strokeStyle = "#ffd24d";
                ctx.lineWidth = 2;
                ctx.stroke();
            }

            ctx.restore();
        }
    }

    function applyGravity(dtMs) {
        if (activeBodies.length === 0) return;

        const dt = dtMs / 1000;
        let totalAx = 0;
        let totalAy = 0;

        for (const body of activeBodies) {
            const dx = body.x - ship.x;
            const dy = body.y - ship.y;
            const r2 = dx * dx + dy * dy + body.soften;
            const r = Math.sqrt(r2);

            if (r === 0) continue;

            const a = body.mu / r2;
            totalAx += (dx / r) * a;
            totalAy += (dy / r) * a;
        }

        ship.vx += totalAx * dt;
        ship.vy += totalAy * dt;
    }

    function computeTrajectory(angle, powerValue) {
        if (activeBodies.length === 0) return [];

        const points = [];

        let x = ship.x;
        let y = ship.y;
        const speed = powerValue * SPEED_SCALE;
        let vx = Math.cos(angle) * speed;
        let vy = Math.sin(angle) * speed;

        const dtMs = 16;
        const dt = dtMs / 1000;
        const maxSteps = 600;

        for (let i = 0; i < maxSteps; i++) {
            points.push({ x, y });

            const hitBody = getCollidingBody(x, y, ship.r);
            if (hitBody) {
                break;
            }

            if (x < -50 || x > canvas.width + 50 || y < -50 || y > canvas.height + 50) break;

            const dAst = Math.hypot(x - asteroid.x, y - asteroid.y);
            if (dAst < asteroid.r) {
                points.push({ x: asteroid.x, y: asteroid.y });
                break;
            }

            let totalAx = 0;
            let totalAy = 0;

            for (const body of activeBodies) {
                const dx = body.x - x;
                const dy = body.y - y;
                const r2 = dx * dx + dy * dy + body.soften;
                const r = Math.sqrt(r2);

                if (r === 0) continue;

                const a = body.mu / r2;
                totalAx += (dx / r) * a;
                totalAy += (dy / r) * a;
            }

            vx += totalAx * dt;
            vy += totalAy * dt;
            x += vx * dt;
            y += vy * dt;

            if (Math.hypot(vx, vy) <= STOP_EPS) break;
        }

        return points;
    }

    function step(dt) {

        if (!won && !lost && isShipMoving()) {
            applyGravity(dt);
            const dtSec = dt / 1000;
            ship.x += ship.vx * dtSec;
            ship.y += ship.vy * dtSec;

            const hitBody = getCollidingBody(ship.x, ship.y);
            if (!won && !lost && hitBody) {
                lost = true;
                ship.vx = ship.vy = 0;
                msg.innerHTML = `☄️ You crashed into ${hitBody.name}.<br><small>Press [Space] to retry.</small>`;
            }

            const speed = Math.hypot(ship.vx, ship.vy);
            if (speed <= STOP_EPS) {
                ship.vx = ship.vy = 0;
            } else if (FRICTION > 0) {
                const slow = FRICTION * dt * speed;
                const newSpeed = Math.max(0, speed - slow);
                const s = newSpeed / speed;
                ship.vx *= s;
                ship.vy *= s;
            }

            // While in motion, ship aims in direction of travel
            if (isShipMoving()) {
                ship.angle = Math.atan2(ship.vy, ship.vx);
            }

            if (
                !lost && (
                ship.x - ship.r <= 0 ||
                ship.x + ship.r >= canvas.width ||
                ship.y - ship.r <= 0 ||
                ship.y + ship.r >= canvas.height
                )
            ) {
                lost = true;
                ship.vx = ship.vy = 0;
                msg.innerHTML = `💥 Ship lost — you hit the boundary.<br><small>Press [Space] to reset.</small>`;
            }
        }

        const d = Math.hypot(ship.x - asteroid.x, ship.y - asteroid.y);
        if (!won && !lost && d < asteroid.r - ship.r / 2) {
            won = true;
            ship.vx = ship.vy = 0;

            if (currentLevel < levels.length - 1) {
                msg.innerHTML = `🚀 Direct hit in ${shotsThisLevel} ${shotsThisLevel === 1 ? "shot" : "shots"} this level!<br><small>Total shots: ${totalShots}. Press [Space] for next level.</small>`
            } else {
                msg.innerHTML = `🏆 Course complete! Level shots: ${shotsThisLevel}.<br><small>Total shots across all levels: ${totalShots}. Press [Space] to restart.</small>`;
            }
        }

        const deg = ((ship.angle * 180) / Math.PI + 360) % 360;
        hudAngle.textContent = Math.round(deg) + "°";
    }

    function drawTrajectoryPreview() {

        if (won || lost) return;
        if (isShipMoving()) return;

        if (previewDirty) {
            cachedTrajectory = computeTrajectory(ship.angle, power);
            previewDirty = false;
        }
        
        if (!cachedTrajectory || cachedTrajectory.length < 2) return;

        const previewFraction = levels[currentLevel].previewFraction ?? 1.0;
        const previewBaseMaxPoints = levels[currentLevel].previewBaseMaxPoints ?? Infinity;
        const speedNorm = 1.0 - (power / MAX_POWER);
        const previewSpeedScale = levels[currentLevel].previewSpeedScale;
        const dynamicMaxPoints = previewBaseMaxPoints + speedNorm * previewSpeedScale;
        const visibleFractionCount = Math.max(2, Math.floor(cachedTrajectory.length * previewFraction));
        const visibleCount = Math.max(2, Math.min(cachedTrajectory.length, visibleFractionCount, dynamicMaxPoints));
        const visiblePoints = cachedTrajectory.slice(0, visibleCount);

        ctx.save();
        ctx.beginPath();
        ctx.moveTo(visiblePoints[0].x, visiblePoints[0].y);
        for (let i = 1; i < visiblePoints.length; i++) ctx.lineTo(visiblePoints[i].x, visiblePoints[i].y);
        ctx.strokeStyle = "#00ffb388";
        ctx.lineWidth = 2;
        ctx.setLineDash([8, 6]);
        ctx.stroke();
        ctx.setLineDash([]);
        for (let i = 0; i < visiblePoints.length; i += Math.max(1, Math.floor(visiblePoints.length / 30))) {
            const p = visiblePoints[i];
            ctx.beginPath();
            ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
            ctx.fillStyle = "#00ffb3aa";
            ctx.fill();
        }
        ctx.restore();
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        ctx.fillStyle = "#ffffff10";
        for (let i = 0; i < 150; i++) {
            const x = (i * 137) % canvas.width;
            const y = (i * 61) % canvas.height;
            ctx.fillRect(x, y, 2, 2);
        }
        ctx.restore();
        drawBodies();
        drawAsteroid();
        drawTrajectoryPreview();
        drawShip();
        if (charging) {
            ctx.beginPath();
            ctx.moveTo(ship.x, ship.y);
            ctx.lineTo(
                ship.x + Math.cos(ship.angle) * 100,
                ship.y + Math.sin(ship.angle) * 100
            );
            ctx.strokeStyle = "#00ffff88";
            ctx.lineWidth = 2;
            ctx.setLineDash([6, 6]);
            ctx.stroke();
            ctx.setLineDash([]);
        }
    }

    let last = performance.now();
    function loop(now) {
        const dt = Math.min(now - last, 32);
        last = now;
        step(dt);
        draw();
        requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);

    window.addEventListener("keydown", (e) => {
        if (e.code !== "Space") return;

        if (won) {
            if (currentLevel < levels.length - 1) {
                currentLevel++;
                resetGame(false);
            } else {
                resetGame(true);
            }
        } else {
            resetGame(false);
        }
    });

    function resetGame(fullRestart = false) {

        previewDirty = true;

        if (fullRestart) {
            currentLevel = 0;
            totalShots = 0;
            hudTotalShots.textContent = "0";
        }    

        shotsThisLevel = 0;
        power = MIN_POWER;
        hudPower.textContent = Math.round((power / MAX_POWER) * 100) + "%";
        won = false;
        lost = false;
        msg.innerHTML = "";
        hudShots.textContent = "0";

        loadLevel(currentLevel);
    }

    resetGame(true);
})();
