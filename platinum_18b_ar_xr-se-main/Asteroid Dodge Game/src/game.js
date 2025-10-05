// Get the canvas element and set up context
const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Satellite settings
const satWidth = 50;
const satHeight = 30;

// Start centered horizontally, near bottom of canvas
let satX = canvas.width / 2 - satWidth / 2;
let satY = canvas.height - satHeight - 20;

// Game loop
function gameLoop() {
  // Clear background
  ctx.fillStyle = "black";  // capital "S"!
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw satellite
  ctx.fillStyle = "white";
  ctx.fillRect(satX, satY, satWidth, satHeight);

  requestAnimationFrame(gameLoop);
}

// Start the game loop
gameLoop();
