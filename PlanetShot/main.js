(() => {
    const canvas = document.getElementById("game");
    const ctx = canvas.getContext("2d");
    const hudAngle = document.getElementById("angle");
    const hudPower = document.getElementById("power");
    const hudShots = document.getElementById("shots");
    const msg = document.getElementById("msg");

    function resize() {
        canvas.width = innerWidth;
        canvas.height = innerHeight;
    }
    window.addEventListener("resize", resize);
    resize();

    const ship = {
        x: 200,
        y: canvas.height / 2,
        vx: 0,
        vy: 0,
        r: 12,
        angle: 0,
    };

    const asteroid = {
        x: canvas.width - 200,
        y: canvas.height / 2,
        r: 40,
    };

    let charging = false;
    let power = 0;
    let shots = 0;
    let won = false;
    const MAX_POWER = 1.0;
    const POWER_RATE = 0.6;
    const FRICTION = 0.007;
    const SPEED_SCALE = 1000;
    const STOP_EPS = 0.05;

    canvas.addEventListener("mousedown", (e) => {
        if (won) return;
        if (Math.hypot(ship.vx, ship.vy) > 0.1) return;
        charging = true;
        power = 0;
    });
    window.addEventListener("mouseup", () => {
        if (!charging || won) return;
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
        ctx.restore();
    }

    function step(dt) {
        if (charging && !won) {
        power += POWER_RATE * (dt / 1000);
        power = Math.min(power, MAX_POWER);
        }
        hudPower.textContent = Math.round(power * 100) + "%";
        const deg = ((ship.angle * 180) / Math.PI + 360) % 360;
        hudAngle.textContent = Math.round(deg) + "°";

        if (!won && (ship.vx !== 0 || ship.vy !== 0)) {
        ship.x += ship.vx * (dt / 1000);
        ship.y += ship.vy * (dt / 1000);
        const speed = Math.hypot(ship.vx, ship.vy);
        if (speed > STOP_EPS) {
            const slow = FRICTION * dt * speed;
            const newSpeed = Math.max(0, speed - slow);
            const s = newSpeed / speed;
            ship.vx *= s;
            ship.vy *= s;
        } else {
            ship.vx = ship.vy = 0;
        }
        if (ship.x < ship.r || ship.x > canvas.width - ship.r) {
            ship.vx *= -0.8;
            ship.x = Math.min(Math.max(ship.x, ship.r), canvas.width - ship.r);
        }
        if (ship.y < ship.r || ship.y > canvas.height - ship.r) {
            ship.vy *= -0.8;
            ship.y = Math.min(Math.max(ship.y, ship.r), canvas.height - ship.r);
        }
        }

        const d = Math.hypot(ship.x - asteroid.x, ship.y - asteroid.y);
        if (!won && d < asteroid.r - ship.r / 2) {
        won = true;
        msg.innerHTML = `🚀 Direct hit in ${shots} ${
            shots === 1 ? "shot" : "shots"
        }!<br><small>Press [Space] to reset.</small>`;
        }
    }

    function draw(dt) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.save();
        ctx.fillStyle = "#ffffff10";
        for (let i = 0; i < 150; i++) {
        const x = (i * 137) % canvas.width;
        const y = ((i * 61) % canvas.height);
        ctx.fillRect(x, y, 2, 2);
        }
        ctx.restore();

        drawAsteroid();
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
        draw(dt);
        requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);

    window.addEventListener("keydown", (e) => {
        if (e.code === "Space") {
        resetGame();
        }
    });

    function resetGame() {
        ship.x = 200;
        ship.y = canvas.height / 2;
        ship.vx = ship.vy = 0;
        asteroid.x = canvas.width - 200;
        asteroid.y = Math.random() * (canvas.height - 200) + 100;
        shots = 0;
        power = 0;
        won = false;
        msg.innerHTML = "";
        hudShots.textContent = "0";
    }
})();