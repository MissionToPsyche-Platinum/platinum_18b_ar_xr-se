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
        menu.classList.toggle("hidden", !showMenu);
    } else if (showMenu) {
        const newMenu = buildMenuDOM();
        document.body.appendChild(newMenu);
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
    <div id="menu-container" class="menu-container">
        <div class="menu-buttons">
            <button id="controls-btn">Controls</button>
            <button id="credits-btn">Credits</button>
            <button id="exit-btn">Exit</button>
        </div>
        <div class="mute-container">
            <img id="mute-icon" src="./resources/mute.svg" alt = "Mute toggle" />
        </div>
    </div>
    `;

    const muteIcon = menu.querySelector("#mute-icon");
    muteIcon.addEventListener("click", () => {
        isMuted = !isMuted
        toggleMute();
        muteIcon.src = isMuted ? "./resources/unmute.svg" : "./resources/mute.svg";
    });

    menu.querySelector("#controls-btn").addEventListener("click", () => {
        alert("open controls menu");
    });

    menu.querySelector("#credits-btn").addEventListener("click", () => {
        alert("Open credits page");
    });

    menu.querySelector("#exit-btn").addEventListener("click", () => {
        alert("Return to hub page");
    });
    
    return menu;
}