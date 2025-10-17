// Canvas setup
const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

const W = canvas.width;
const H = canvas.height;

// Player setup
const player = {
  w: 40,
  h: 40,
  x: W / 2 - 20,         
  y: H - 60,             
  speed: 300    
};    

// === Audio === //
const sounds = { bg: new Audio('../sounds/spaceship.mp3'), 
start: new Audio('../sounds/game-start.mp3'), 
gameover: new Audio('../sounds/game-over.mp3')
};


// creates an array of asteroid rather than a single one
let asteroids = [];
let spawnTimer = 0;             // control asteroid spawn timing
const spawnInterval = 0.8;      // seconds between spawns

// an array of stars to travel down the canvas
let stars = [];
const numStars = 300; //number of stars in the array
const speed = 0.8; //speed the stars travel across the canvas

// === Power-ups ===
let powerUps = []; 
const powerUpInterval = 10; // seconds between power-up spawns
let powerUpTimer = 0;

let activePowerUps = { shield: false, scoreBoost: false };
let powerupDuration = 5; // seconds active
let powerupTimers = { shield: 0, scoreBoost: 0 };




// === Game state ===
let gameState = "start"
let score = 0;           // optional: we'll use this soon
let elapsedTime = 0;     // for tracking survival time
let difficulty = 1; // starts easy, scales up


// Simple input state
const keys = {
  left: false,
  right: false
};



// Input Handlers 
window.addEventListener('keydown', (e) => {
  if (e.code === 'ArrowLeft' || e.code === 'KeyA') keys.left = true;
  if (e.code === 'ArrowRight' || e.code === 'KeyD') keys.right = true;

  if (e.code === 'Space') {
    if (gameState === "start") startGame();
    else if (gameState === "gameover") restartGame();
  }
});

window.addEventListener('keyup', (e) => {
  if (e.code === 'ArrowLeft' || e.code === 'KeyA') keys.left = false;
  if (e.code === 'ArrowRight' || e.code === 'KeyD') keys.right = false;
});

//  Game Loop 
let lastTime = performance.now();

function loop(now) {
  const dt = (now - lastTime) / 1000; 
  lastTime = now;

  update(dt);
  draw();

  requestAnimationFrame(loop);
}


// detects collision
function isColliding(a, b) {
  return (
    a.x < b.x + b.w &&
    a.x + a.w > b.x &&
    a.y < b.y + b.h &&
    a.y + a.h > b.y
  );
}


function update(dt) {
  if (gameState !== "playing") return; // freeze updates unless in play mode

  elapsedTime += dt;
  score = Math.floor(elapsedTime * (activePowerUps.scoreBoost ? 2 : 1));

  difficulty = 1 + Math.min(elapsedTime / 10, 4);


  // === Player movement ===
  let vx = 0;
  if (keys.left)  vx -= player.speed;
  if (keys.right) vx += player.speed;
  player.x += vx * dt;
  if (player.x < 0) player.x = 0;
  if (player.x + player.w > W) player.x = W - player.w;

  updateStars();

  // === Asteroid spawning ===
  spawnTimer += dt;
  if (spawnTimer > spawnInterval / difficulty) {
  spawnTimer = 0;
  asteroids.push({
    w: 40,
    h: 40,
    x: Math.random() * (W - 40),
    y: -40,
    speed: (100 + Math.random() * 150) * difficulty
  });
}

// ==== Power-up spawning ====
powerUpTimer += dt;
if (powerUpTimer > powerUpInterval) {
  powerUpTimer = 0;
  const type = Math.random() < 0.5 ? 'shield' : 'scoreBoost';
  powerUps.push({
    w: 30,
    h: 30,
    x: Math.random() * (W - 30),
    y: -30,
    speed: 100 + Math.random() * 50
  });
}


  // === Asteroid movement + collision ===
  for (let i = asteroids.length - 1; i >= 0; i--) {
    const a = asteroids[i];
    a.y += a.speed * dt;

   if (isColliding(a, player)) {
  if (activePowerUps.shield) {
    // consume shield instead of dying
    activePowerUps.shield = false;
    powerupTimers.shield = 0;
    asteroids.splice(i, 1); // destroy the asteroid
    continue;
  } else {
    sounds.bg.pause();
    sounds.gameover.currentTime = 0;
    sounds.gameover.play();
    gameState = "gameover";
    break;
  }
}
if (a.y > H) asteroids.splice(i, 1);
  
}
    

  // === Power-up movement + collision ===
  for (let i = powerUps.length - 1; i >= 0; i--) {
    const p = powerUps[i];
    p.y += p.speed * dt;

    if (isColliding(p, player)) {
      if (p.type === 'shield') {
        activePowerUps.shield = true;
        powerupTimers.shield = powerupDuration
      } else if (p.type === 'scoreBoost') {
        activePowerUps.scoreBoost = true;
        powerupTimers.scoreBoost = powerupDuration;
      }
      powerUps.splice(i, 1);
      continue;
    }
    if (p.y > H) powerUps.splice(i, 1);
}
// === Power-up timers ===
for (const key in powerupTimers) {
  if (activePowerUps[key]) {
    powerupTimers[key] -= dt;
    if (powerupTimers[key] <= 0) {
      activePowerUps[key] = false;
    }
  }
}
}



function draw() {
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = 'midnightblue';
  ctx.fillRect(0, 0, W, H);

  // Draw Start Screen 
  if (gameState === "start") {
    ctx.fillStyle = "white";
    ctx.font = "48px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("ASTEROID DODGE", W / 2, H / 2 - 40);
    ctx.font = "24px sans-serif";
    ctx.fillText("Press SPACE to Start", W / 2, H / 2 + 20);
    return;
  }

  // Draw stars
  ctx.fillStyle = "white";
  for (const star of stars) {
    ctx.beginPath();
    ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
    ctx.fill();
  }

  // Draw power-ups
for (const p of powerUps) {
  if (p.type === "shield") ctx.fillStyle = "cyan";
  else if (p.type === "scoreBoost") ctx.fillStyle = "gold";
  ctx.fillRect(p.x, p.y, p.w, p.h);
}


  // Draw gameplay
  ctx.fillStyle = "#fff";
  ctx.fillRect(player.x, player.y, player.w, player.h);

  ctx.fillStyle = "#f00";
  for (const a of asteroids) {
    ctx.fillRect(a.x, a.y, a.w, a.h);
  }

  // Score display
  ctx.fillStyle = "white";
  ctx.font = "24px monospace";
  ctx.textAlign = "left";
  ctx.fillText(`Score: ${score}`, 20, 40);

  // Power-up indicators
let y = 70;
if (activePowerUps.shield) {
  ctx.fillStyle = "cyan";
  ctx.fillText("🛡️ Shield Active", 20, y);
  y += 30;
}
if (activePowerUps.scoreBoost) {
  ctx.fillStyle = "gold";
  ctx.fillText("💫 Score x2", 20, y);
}

  // Game Over screen
  if (gameState === "gameover") {
    ctx.fillStyle = "white";
    ctx.font = "48px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("GAME OVER", W / 2, H / 2);
    ctx.font = "24px sans-serif";
    ctx.fillText("Press SPACE to Restart", W / 2, H / 2 + 40);
  }
}

function initStars() {
  stars = [];
  for (let i = 0; i < numStars; i++) {
    stars.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      radius: Math.random() * 1.5,
      velocity: Math.random() * 1.0 + 1.0,
    });
  }
}

function updateStars() {
  for (const star of stars) {
    star.y += star.velocity * speed;
    if (star.y > canvas.height) {
      star.y = 0;
      star.x = Math.random() * canvas.width;
    }
  }
}


function startGame() {
  gameState = "playing";
  elapsedTime = 0;
  score = 0;
  difficulty = 1;
  asteroids = [];
  spawnTimer = 0;
  player.x = W / 2 - player.w / 2;
  player.y = H - 60;
  initStars();

  //plays sounds
  sounds.start.currentTime = 0;
  sounds.start.play();
  sounds.bg.currentTime = 0;
  sounds.bg.play();

}

function restartGame() {
  startGame(); // reuse same logic
  sounds.bg.play();
}


// Start!
requestAnimationFrame(loop);
