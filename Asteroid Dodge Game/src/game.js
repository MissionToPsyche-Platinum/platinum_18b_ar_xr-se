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

// Single asteroid setup
let asteroid = {
  w: 40,
  h: 40,
  x: Math.random() * (W - 40), // random X
  y: -40,                     // start above screen
  speed: 150                  // pixels per second downward
};


// Simple input state
const keys = {
  left: false,
  right: false
};

// Input Handlers 
window.addEventListener('keydown', (e) => {
  if (e.code === 'ArrowLeft' || e.code === 'KeyA') keys.left = true;
  if (e.code === 'ArrowRight' || e.code === 'KeyD') keys.right = true;
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

function update(dt) {
  // Player movement
  let vx = 0;
  if (keys.left)  vx -= player.speed;
  if (keys.right) vx += player.speed;

  player.x += vx * dt;

  // Clamp player to screen bounds
  if (player.x < 0) player.x = 0;
  if (player.x + player.w > W) player.x = W - player.w;

  // === Asteroid movement ===
  asteroid.y += asteroid.speed * dt;

  // If it leaves the screen, reset it to top at random X
  if (asteroid.y > H) {
    asteroid.y = -asteroid.h;
    asteroid.x = Math.random() * (W - asteroid.w);
  }
}

function draw() {
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = '#000';
  ctx.fillRect(0, 0, W, H);

  // Player
  ctx.fillStyle = '#fff';
  ctx.fillRect(player.x, player.y, player.w, player.h);

  // Asteroid
  ctx.fillStyle = '#f00'; // red asteroid
  ctx.fillRect(asteroid.x, asteroid.y, asteroid.w, asteroid.h);
}


// Start!
requestAnimationFrame(loop);
