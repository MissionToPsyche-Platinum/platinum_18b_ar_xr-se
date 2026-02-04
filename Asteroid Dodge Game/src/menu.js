import { toggleMute } from "./audio.js";

let showMenu = false;

// Control images
const controlLeftArrow = new Image();
const controlRightArrow = new Image();
const controlAKey = new Image();
const controlDKey = new Image();
const muteIcon = new Image();
const unmuteIcon = new Image();

let muteButtonBounds;
let creditsButtonBounds;

let masterVol = 100;
let musicVol = 100;
let sfxVol = 100;

const MUTE_ICON_SIZE = 48;
const MUTE_ICON_PADDING = 20;

controlLeftArrow.src = './resources/leftkey.svg';
controlRightArrow.src = './resources/rightkey.svg';
controlAKey.src = './resources/a_key.svg';
controlDKey.src = './resources/d_key.svg';
muteIcon.src = './resources/mute.svg';
unmuteIcon.src = './resources/unmute.svg';

let isMuted = false;

export function handleClick(mouseX, mouseY) {
    console.log("Mouse X: ", mouseX, "Mouse Y", mouseY);
    console.log(muteButtonBounds);
    console.log(creditsButtonBounds);
    if( muteButtonBounds &&
        mouseX >= muteButtonBounds.mute_x && mouseX <= muteButtonBounds.mute_x + muteButtonBounds.mute_width &&
        mouseY >= muteButtonBounds.mute_y && mouseY <= muteButtonBounds.mute_y + muteButtonBounds.mute_height ) {
            isMuted = !isMuted;
            toggleMute();
    } else if ( creditsButtonBounds &&
        mouseX >= creditsButtonBounds.credit_x && mouseX <= creditsButtonBounds.credit_x + creditsButtonBounds.credit_width &&
        mouseY >= creditsButtonBounds.credit_y && mouseY <= creditsButtonBounds.credit_y + creditsButtonBounds.credit_height ) {
            console.log("Credits clicked");
    } else {
        console.log("No Button Pressed");
    }
}

export function toggleMenu() {
    showMenu = !showMenu;
    let menu = document.getElementById("game-overlay");
    if (menu) {
        renderMainMenu();
        menu.classList.toggle("hidden", !showMenu);
    } else if (showMenu) {
        const newMenu = buildMenuDOM();
        document.body.appendChild(newMenu);
        renderMainMenu();
    }
}

export function isMenuVisible() {
    return showMenu;
}

//Rewrite to use HTML elements instead of draw on the canvas
export function drawMenuOverlay(ctx) {
}

function buildMenuDOM() {
    const menu = document.createElement("div");
    menu.id = "game-overlay";
    menu.className = "game-overlay";
    menu.innerHTML = `
    <div class="paused-label">Paused</div>
    <div id="menu-content"></div>
    `;
    return menu;
}

function renderControlsMenu() {
    const container = document.createElement("div");
    container.className = "controls-container";
    container.innerHTML = `
    <h2>Controls</h2>
    <div class="controls-layout">
        <div class="controls-section">
            <div class="control-item">
                <span>Move Left</span>
                <div class="keys">
                    <img id="left-key" class="left-key" src="./resources/leftkey.svg" alt="Left Arrow Key" />
                    <img id="a-key" class="a-key" src="./resources/a_key.svg" alt="A Key" />
                </div>
            </div>
            <div class="control-item">
                <span>Move Right</span>
                <div class="keys">
                    <img id="right-key" class="right-key" src="./resources/rightkey.svg" alt="Right Arrow Key" />
                    <img id="d-key" class="d-key" src="./resources/d_key.svg" alt="D Key" />
                </div>
            </div>
        </div>
        <div class="powerups-section">
            <h3>Powerups</h3>
            <p>WIP</p>
        </div>
    </div>
    <h2>Audio</h2>
    <div class="audio-layout">
        <div class="audio-row">
            <label for="master-vol">Master</label>
            <input id="master-vol" type="range" min="0" max="100" value="${masterVol}">
            <span id="master-val" class="audio-val">${masterVol}%</span>
        </div>
        <div class="audio-row">
            <label for="music-vol">Music</label>
            <input id="music-vol" type="range" min="0" max="100" value="${musicVol}">
            <span id="music-val" class="audio-val">${musicVol}%</span>
        </div>
        <div class="audio-row">
            <label for="sfx-vol">SFX</label>
            <input id="sfx-vol" type="range" min="0" max="100" value="${sfxVol}">
            <span id = "sfx-val" class="audio-val">${sfxVol}%</span>
    </div>
    <div class="controls-footer">
        <button id="c-return-btn" class="c-return-btn">Return</button>
    </div>
    `;

    container.querySelector("#c-return-btn").addEventListener("click", () => {
        renderMainMenu();
    });

    const master = container.querySelector("#master-vol");
    const music = container.querySelector("#music-vol");
    const sfx = container.querySelector("#sfx-vol");

    const masterVal = container.querySelector("#master-val");
    const musicVal = container.querySelector("#music-val");
    const sfxVal = container.querySelector("#sfx-val");

    master.addEventListener("input", () => {
        masterVol = Number(master.value);
        masterVal.textContent = masterVol + "%";
    });

    music.addEventListener("input", () => {
        musicVol = Number(music.value);
        musicVal.textContent = musicVol + "%";
    });

    sfx.addEventListener("input", () => {
        sfxVol = Number(sfx.value);
        sfxVal.textContent = sfxVol + "%";
    });

    updateMenuContent(container);
}

function renderMainMenu() {
    const container = document.createElement("div");
    container.className = "menu-container";
    container.innerHTML = `
    <div class="menu-buttons">
        <button id="controls-btn">Controls</button>
        <button id="credits-btn">Credits</button>
        <button id="exit-btn">Exit</button>
    </div>
    <div class="mute-container">
        <img id="mute-icon" src="./resources/mute.svg" alt = "Mute toggle" />
    </div>
    `;

    
    const muteIcon = container.querySelector("#mute-icon");
    muteIcon.addEventListener("click", () => {
        isMuted = !isMuted
        toggleMute();
        muteIcon.src = isMuted ? "./resources/unmute.svg" : "./resources/mute.svg";
    });

    container.querySelector("#controls-btn").addEventListener("click", () => {
        renderControlsMenu();
    });

    container.querySelector("#credits-btn").addEventListener("click", () => {
        renderCreditsMenu();
    });

    container.querySelector("#exit-btn").addEventListener("click", () => {
        alert("Return to hub page");
    });

    updateMenuContent(container);
    
}

function renderCreditsMenu() {
    const container = document.createElement("div");
    container.className = "credits-container";
    container.innerHTML = `
    <h2>Credits</h2>
    <div class="credits-layout">
        <p>
            Developers
            John Sullins
            Brayden Brown
        </p>
    <div class="credits-disclaimer"> 
        <p>
            This is not an accurate representation of the Mission to Psyche<br>
            The Mission to Psyche will not travel through the asteroid belt and will not be dodging asteroids nor meteroids<br>
            This game is simply for your enjoyment<br>
        </p>
    <div class="credits-footer">
        <button id="cr-return-btn" class="cr-return-btn">Return</button>
    </div>
    `;

    container.querySelector("#cr-return-btn").addEventListener("click", () => {
        renderMainMenu();
    })
    
    updateMenuContent(container);
}

function updateMenuContent(newContent) {
    const menuContent = document.getElementById("menu-content");
    menuContent.innerHTML = '';
    menuContent.appendChild(newContent);
    console.log("Updating Menu Content");
}