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
}

export function isMenuVisible() {
    return showMenu;
}

//Rewrite to use HTML elements instead of draw on the canvas
export function drawMenuOverlay(ctx) {
    if (!showMenu) return;
    let menu = document.getElementById("game-menu");

    if (!menu) {
        menu = buildMenuDOM();
    }
}

function buildMenuDOM() {
    const menu = document.createElement("div");
    menu.id = "game-menu";
    menu.className = "overlay-menu";
    menu.innerHTML = `
    <div class=menuContent>
    Placeholder
    </div>
    `;
    return menu;
}