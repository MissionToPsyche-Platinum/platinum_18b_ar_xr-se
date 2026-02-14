import { toggleMute } from "./audio.js";
import { audioState } from "./audio.js";
import { powerUpDescriptions } from "./powerups.js";

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

const MUTE_ICON_SIZE = 48;
const MUTE_ICON_PADDING = 20;

controlLeftArrow.src = './resources/leftkey.svg';
controlRightArrow.src = './resources/rightkey.svg';
controlAKey.src = './resources/a_key.svg';
controlDKey.src = './resources/d_key.svg';
muteIcon.src = './resources/mute.svg';
unmuteIcon.src = './resources/unmute.svg';

let isMuted = {
    master: false,
    music: false,
    sfx: false
};

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
    <div class="overlay-center">
        <div id="menu-content"></div>
    </div>
    `;
    return menu;
}

function percentage(value) {
    return `${Math.round(value * 100)}%`
}

function renderControlsMenu() {
    const container = document.createElement("div");
    container.className = "controls-container";
    container.innerHTML = `
    <h2 class="panel-title">Audio</h2>
    <div class="audio-layout">
        <div class="audio-row">
            <label for="master-vol">Master</label>
            <div class="mute-container">
                <img id="mute-master" src="./resources/mute.svg" alt = "Mute toggle" />
            </div>
            <input id="master-vol" type="range" min="0" max="100" value="${Math.round(audioState.master * 100)}">
            <span id="master-val" class="audio-val">${percentage(audioState.master)}</span>
        </div>
        <div class="audio-row">
            <label for="music-vol">Music</label>
            <div class="mute-container">
                <img id="mute-music" src="./resources/mute.svg" alt = "Mute toggle" />
            </div>
            <input id="music-vol" type="range" min="0" max="100" value="${Math.round(audioState.music * 100)}">
            <span id="music-val" class="audio-val">${percentage(audioState.music)}</span>
        </div>
        <div class="audio-row">
            <label for="sfx-vol">Sound Effects</label>
            <div class="mute-container">
                <img id="mute-sfx" src="./resources/mute.svg" alt = "Mute toggle" />
            </div>
            <input id="sfx-vol" type="range" min="0" max="100" value="${Math.round(audioState.sfx * 100)}">
            <span id = "sfx-val" class="audio-val">${percentage(audioState.sfx)}</span>
        </div>
    </div>

    <h2 class="panel-title">Controls</h2>
    <div class="two-col">
        <div class="control-item">
            <span class="control-label">Move Left</span>
            <div class="keys">
                <img id="left-key" class="key-img" src="./resources/leftkey.svg" alt="Left Arrow Key" />
                <img id="a-key" class="key-img" src="./resources/a_key.svg" alt="A Key" />
            </div>
        </div>

        <div class="control-item">
            <span class="control-label">Move Right</span>
            <div class="keys">
                <img id="right-key" class="key-img" src="./resources/rightkey.svg" alt="Right Arrow Key" />
                <img id="d-key" class="key-img" src="./resources/d_key.svg" alt="D Key" />
            </div>
        </div>
    </div>

    <h2 class="panel-title">Powerups</h2>
    ${powerupsHTML(powerUpDescriptions)}

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

    const master_mute = container.querySelector("#mute-master");
    const music_mute = container.querySelector("#mute-music");
    const sfx_mute = container.querySelector("#mute-sfx");

    master.addEventListener("input", () => {
        audioState.master = Number(master.value) / 100;
        masterVal.textContent = percentage(audioState.master);
        audioState.applyAudio();
    });

    music.addEventListener("input", () => {
        audioState.music = Number(music.value) / 100;
        musicVal.textContent = percentage(audioState.music);
        audioState.applyAudio();
    });

    sfx.addEventListener("input", () => {
        audioState.sfx = Number(sfx.value) / 100;
        sfxVal.textContent = percentage(audioState.sfx);
        audioState.applyAudio();
    });

    master_mute.addEventListener("click", () => {
        isMuted.master = !isMuted.master;
        master_mute.src = isMuted.master ? './resources/unmute.svg' : './resources/mute.svg';

    });

    music_mute.addEventListener("click", () => {
        isMuted.music = !isMuted.music;
        music_mute.src = isMuted.music ? './resources/unmute.svg' : './resources/mute.svg';

    });

    sfx_mute.addEventListener("click", () => {
        isMuted.sfx = !isMuted.sfx;
        sfx_mute.src = isMuted.sfx ? './resources/unmute.svg' : './resources/mute.svg';

    })

    updateMenuContent(container);
}

function renderMainMenu() {
    const container = document.createElement("div");
    container.className = "menu-container";
    container.innerHTML = `
    <div class="menu-buttons">
        <button id="controls-btn">Options</button>
        <button id="credits-btn">Credits</button>
        <button id="exit-btn">Exit</button>
    </div>
    `;

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
        <div class="credits-content">
            <p>
                Developers
                John Sullins
                Brayden Brown
            </p>
        </div>
        <div class="credits-disclaimer"> 
            <p>
                This is not an accurate representation of the Mission to Psyche<br>
                The Mission to Psyche will not travel through the asteroid belt and will not be dodging asteroids nor meteroids<br>
                This game is simply for your enjoyment<br>
            </p>
            <p>
                This work was created in partial fulfillment of Arizona State University Capstone Course SER 401/402.<br>
                The work is a result of the Psyche Student Collaborations component of NASA’s Psyche Mission (https://psyche.ssl.berkeley.edu). “Psyche: A Journey to a Metal World” [Contract number NNM16AA09C] <br>
                is part of the NASA Discovery Program mission to solar system targets. Trade names and trademarks of ASU and NASA are used in this work for identification only. <br>
                Their usage does not constitute an official endorsement, either expressed or implied, by Arizona State University or National Aeronautics and Space Administration. <br>
                The content is solely the responsibility of the authors and does not necessarily represent the official views of ASU or NASA.
            </p>
        </div>
        <div class="credits-footer">
            <button id="cr-return-btn" class="cr-return-btn">Return</button>
        </div>
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

function powerupsHTML(items) {
    return `
    <div class="powerups-grid">
        ${items.map(p => `
            <div class="powerup-card" data-powerup="${p.id}">
                <img class="powerup-icon" src="${p.img}" alt="${p.name}" />
                <div class="powerup-meta">
                    <div class="powerup-name">${p.name}</div>
                    <div class="powerup-desc">${p.desc}</div>
                </div>
            </div>
        `).join("")}
    </div>
    `;
}