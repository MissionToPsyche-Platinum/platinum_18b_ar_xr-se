(() => {
    const canvas = document.getElementById("game");
    const ctx = canvas.getContext("2d");
    const hudAngle = document.getElementById("angle");
    const hudPower = document.getElementById("power");
    const hudShots = document.getElementById("shots");
    const msg = document.getElementById("msg");

    const gravityWell = {
        x: 0,
        y: 0,
        r: 50,
        mu: 12000000,
        soften: 1500
    };

    function resize() {
        canvas.width = innerWidth;
        canvas.height = innerHeight;
        gravityWell.x = canvas.width / 2;
        gravityWell.y = canvas.height / 2;
    }
    window.addEventListener("resize", resize);
    resize();

    const ship = {
        x: 200,
        y: canvas.height / 2,
        vx: 0,
        vy: 0,
        r: 12,
        angle: 0
    };

    const asteroid = {
        x: canvas.width - 200,
        y: Math.random() * (canvas.height - 200) + 100,
        r: 40
    };

    let charging = false;
    let power = 0;
    let shots = 0;
    let won = false;
    let lost = false;

    const MAX_POWER = 2.0;
    const POWER_RATE = 1.5;
    const SPEED_SCALE = 380;
    const FRICTION = 0.0;
    const STOP_EPS = 0.05;

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
        if (Math.hypot(ship.vx, ship.vy) > 0.1) return;
        charging = true;
        power = 0;
    });

    window.addEventListener("mouseup", () => {
        if (!charging || won || lost) return;
        charging = false;
        const speed = power * SPEED_SCALE;
        ship.vx = Math.cos(ship.angle) * speed;
        ship.vy = Math.sin(ship.angle) * speed;
        shots++;
        hudShots.textContent = shots;
        power = 0;
    });

    canvas.addEventListener("mousemove", (e) => {
        const rect = canvas.getBoundingClientRect();
        const mx = (e.clientX - rect.left) * (canvas.width / rect.width);
        const my = (e.clientY - rect.top) * (canvas.height / rect.height);
        ship.angle = Math.atan2(my - ship.y, mx - ship.x);
    });

    function drawShip() {
        ctx.save();
        ctx.translate(ship.x, ship.y);
        ctx.rotate(ship.angle);
        ctx.beginPath();
        ctx.moveTo(ship.r, 0);
        ctx.lineTo(-ship.r * 0.8, ship.r * 0.6);
        ctx.lineTo(-ship.r * 0.8, -ship.r * 0.6);
        ctx.closePath();
        ctx.fillStyle = "#00ffff";
        ctx.fill();
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
        const grad = ctx.createRadialGradient(
            asteroid.x - 10, asteroid.y - 10, asteroid.r * 0.2,
            asteroid.x, asteroid.y, asteroid.r
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
        ctx.restore();
    }

    function drawGravityWell() {
        ctx.save();
        const g = ctx.createRadialGradient(
            gravityWell.x - 6, gravityWell.y - 6, 6,
            gravityWell.x, gravityWell.y, gravityWell.r
        );
        g.addColorStop(0, "#ffe680");
        g.addColorStop(1, "#b38f00");
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(gravityWell.x, gravityWell.y, gravityWell.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "#ffd24d";
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();
    }

    function applyGravity(dtMs) {
        const dx = gravityWell.x - ship.x;
        const dy = gravityWell.y - ship.y;
        const r2 = dx * dx + dy * dy + gravityWell.soften;
        const r = Math.sqrt(r2);
        const a = gravityWell.mu / r2;
        const ax = (dx / r) * a;
        const ay = (dy / r) * a;
        const dt = dtMs / 1000;
        ship.vx += ax * dt;
        ship.vy += ay * dt;
    }

    function computeTrajectory(angle, powerValue) {
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
            const dx = gravityWell.x - x;
            const dy = gravityWell.y - y;
            const r2 = dx * dx + dy * dy + gravityWell.soften;
            const r = Math.sqrt(r2);
            const a = gravityWell.mu / r2;
            const ax = (dx / r) * a;
            const ay = (dy / r) * a;
            vx += ax * dt;
            vy += ay * dt;
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
        const deg = ((ship.angle * 180) / Math.PI + 360) % 360;
        hudAngle.textContent = Math.round(deg) + "°";

        if (!won && !lost && (ship.vx !== 0 || ship.vy !== 0)) {
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
                ship.vx *= s; ship.vy *= s;
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
            msg.innerHTML = `🚀 Direct hit in ${shots} ${shots === 1 ? "shot" : "shots"}!<br><small>Press [Space] to reset.</small>`;
        }
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
        drawGravityWell();
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
        if (e.code === "Space") resetGame();
    });

    function resetGame() {
        placeStart();
        shots = 0;
        power = 0;
        won = false;
        lost = false;
        msg.innerHTML = "";
        hudShots.textContent = "0";
    }

    placeStart();
})();
