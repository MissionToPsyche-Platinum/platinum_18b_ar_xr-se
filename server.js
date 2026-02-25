const express = require("express");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Folder that contains index.html for the game
const GAME_DIR = path.join(__dirname, "Asteroid Dodge Game");

// Serve all static files (html, js, css, images, audio) from that folder
app.use(express.static(GAME_DIR));

// When someone hits "/", return the index.html in that folder
app.get("/", (req, res) => {
  res.sendFile(path.join(GAME_DIR, "index.html"));
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running: http://localhost:${PORT}`);
});