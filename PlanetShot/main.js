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

    
    const levels = [
        {
            ship: { x: 200, y: 300 },
            asteroid: { x: 1000, y: 300, r: 40 },
            bodies: [
                { type: "mars", x: 0.5, y: 0.5 }
            ]
        },
        {
            ship: { x: 180, y:200 },
            asteroid: { x: 1050, y: 300, r: 40 },
            bodies: [
                { type: "venus", x: 0.42, y: 0.45 },
                { type: "mercury", x: 0.72, y: 0.62}
            ]
        },
        {
            ship: { x: 220, y: 550 },
            asteroid: { x: 980, y: 180, r: 40 },
            bodies: [
                { type: "jupiter", x: 0.5, y:0.5 }
            ]
        }
    ];
    
    let currentLevel = 0;
    let activeBodies = [];

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

    let charging = false;
    let power = 0;
    let shotsThisLevel = 0;
    let totalShots = 0;
    let won = false;
    let lost = false;

    const MAX_POWER = 2.0;
    const POWER_RATE = 1.5;
    const SPEED_SCALE = 380;
    const FRICTION = 0.0;
    const STOP_EPS = 0.05;

    function isShipMoving() {
        return Math.hypot(ship.vx, ship.vy) > STOP_EPS;
    }

    function resolveCoord(value, max) {
        if (value == null) return max / 2;
        return value <=1 ? value * max : value;
    }

    function loadLevel(index) {
        
        const level = levels[index];

        ship.x = level.ship.x <= 1 ? canvas.width * level.ship.x : level.ship.x;
        ship.y = level.ship.y <= 1 ? canvas.height * level.ship.y : level.ship.y;
        ship.vx = 0;
        ship.vy = 0;
        ship.angle = 0;

        asteroid.r = level.asteroid.r;
        asteroid.x = level.asteroid.x < 0 ? canvas.width + level.asteroid.x : level.asteroid.x;

        if ("y" in level.asteroid) {
            asteroid.y = level.asteroid.y <= 1 ? canvas.height * level.asteroid.y : level.asteroid.y;
        } else {
            const minY = level.asteroid.yMin >= 0 ? level.asteroid.yMin : canvas.height + level.asteroid.yMin;
            const maxY = level.asteroid.yMax >= 0 ? level.asteroid.yMax : canvas.height + level.asteroid.yMax;
            asteroid.y = Math.random() * (maxY - minY) + minY;
        }

        activeBodies = level.bodies.map((bodyDef) => {
            const base = celestialCatalog[bodyDef.type];

            if (!base) {
                throw new Error(`Unknown celestial body type: ${bodyDef.type}`);
            }

            return {
                type: bodyDef.type,
                name: base.name,
                x: resolveCoord(bodyDef.x, canvas.width),
                y: resolveCoord(bodyDef.y, canvas.height),
                r: bodyDef.r ?? base.r,
                mu: bodyDef.mu ?? base.mu,
                soften: bodyDef.soften ?? base.soften,
                image: base.image
            };
        });

        if (activeBodies.length === 0) {
            throw new Error("Level must contain at least one body.");
        }

        hudLevel.textContent = String(index + 1);
    }

    function resize() {
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
        charging = true;
        power = 0;
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
        ship.angle = Math.atan2(my - ship.y, mx - ship.x);
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

    function drawGravityWell() {
        
        if (activeBodies.length === 0) return;

        for ( const body of activeBodies) {
            ctx.save();
            const size = body.r * 2;

            if (body.image && body.image.complete && body.image.naturalWidth > 0) {
                ctx.translate(body.x, body.y);
                ctx.drawImage(body.image, -size / 2, -size / 2, size, size);
            } else {
                const g = ctx.createRadialGradient(
                    body.x - 6,
                    body.y - 6,
                    6,
                    body.x,
                    body.y,
                    body.r
                );
                g.addColorStop(0, #ffe680);
                g.addColorStop(1, "#b38f00");
                ctx.fillStyle = g;
                ctx.beginPath();
                ctx.arc(body.x, body.y, body.r, 0, Math.PI * 2);
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
        const maxSteps = 1200;

        for (let i = 0; i < maxSteps; i++) {
            points.push({ x, y });

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
        if (charging && !won && !lost) {
            power = Math.min(MAX_POWER, power + POWER_RATE * (dt / 1000));
        }
        hudPower.textContent = Math.round(power * 100) + "%";

        if (!won && !lost && isShipMoving()) {
            applyGravity(dt);
            const dtSec = dt / 1000;
            ship.x += ship.vx * dtSec;
            ship.y += ship.vy * dtSec;

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
                ship.x - ship.r <= 0 ||
                ship.x + ship.r >= canvas.width ||
                ship.y - ship.r <= 0 ||
                ship.y + ship.r >= canvas.height
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
        if (!charging) return;
        const points = computeTrajectory(ship.angle, power);
        if (!points || points.length < 2) return;
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(points[0].x, points[0].y);
        for (let i = 1; i < points.length; i++) ctx.lineTo(points[i].x, points[i].y);
        ctx.strokeStyle = "#00ffb388";
        ctx.lineWidth = 2;
        ctx.setLineDash([8, 6]);
        ctx.stroke();
        ctx.setLineDash([]);
        for (let i = 0; i < points.length; i += Math.max(1, Math.floor(points.length / 30))) {
            const p = points[i];
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
        if (fullRestart) {
            currentLevel = 0;
            totalShots = 0;
            hudTotalShots.textContent = "0";
        }    

        shotsThisLevel = 0;
        power = 0;
        won = false;
        lost = false;
        msg.innerHTML = "";
        hudShots.textContent = "0";

        loadLevel(currentLevel);
    }

    resetGame(true);
})();
