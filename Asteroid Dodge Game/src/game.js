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

// creates an array of asteroid rather than a single one
let asteroids = [];
let spawnTimer = 0;             // control asteroid spawn timing
const spawnInterval = 0.8;      // seconds between spawns

// === Game state ===
let gameOver = false;
let score = 0;           // optional: we'll use this soon
let elapsedTime = 0;     // for tracking survival time






// Simple input state
const keys = {
  left: false,
  right: false
};

// Input Handlers 
window.addEventListener('keydown', (e) => {
  if (e.code === 'ArrowLeft' || e.code === 'KeyA') keys.left = true;
  if (e.code === 'ArrowRight' || e.code === 'KeyD') keys.right = true;
  if (e.code === 'Space' && gameOver) restartGame();
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
  if (gameOver) return;

  elapsedTime += dt;
  score = Math.floor(elapsedTime); // 1 point per second

  // === Player movement ===
  let vx = 0;
  if (keys.left)  vx -= player.speed;
  if (keys.right) vx += player.speed;
  player.x += vx * dt;
  if (player.x < 0) player.x = 0;
  if (player.x + player.w > W) player.x = W - player.w;

  // === Asteroid spawning ===
  spawnTimer += dt;
  if (spawnTimer > spawnInterval) {
    spawnTimer = 0;
    asteroids.push({
      w: 40,
      h: 40,
      x: Math.random() * (W - 40),
      y: -40,
      speed: 100 + Math.random() * 150
    });
  }

  // === Asteroid movement + collision ===
  for (let i = asteroids.length - 1; i >= 0; i--) {
    const a = asteroids[i];
    a.y += a.speed * dt;

    if (isColliding(a, player)) {
      gameOver = true;
      break;
    }

    if (a.y > H) asteroids.splice(i, 1);
  }
}

function draw() {
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, W, H);

  // Player
  ctx.fillStyle = '#fff';
  ctx.fillRect(player.x, player.y, player.w, player.h);

  // Asteroids
  ctx.fillStyle = '#f00';
  for (const a of asteroids) {
    ctx.fillRect(a.x, a.y, a.w, a.h);
  }

  // Score display
ctx.fillStyle = 'white';
ctx.font = '24px monospace';
ctx.textAlign = 'left';
ctx.fillText(`Score: ${score}`, 20, 40);

// Game Over screen
if (gameOver) {
  ctx.fillStyle = 'white';
  ctx.font = '48px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('GAME OVER', W / 2, H / 2);
  ctx.font = '24px sans-serif';
  ctx.fillText('Press SPACE to Restart', W / 2, H / 2 + 40);
}
}

function restartGame() {
  // reset everything
  gameOver = false;
  score = 0;
  elapsedTime = 0;
  asteroids = [];
  spawnTimer = 0;
  player.x = W / 2 - player.w / 2;
  player.y = H - 60;
}




// Start!
requestAnimationFrame(loop);
