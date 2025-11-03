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

export function drawMenuOverlay(ctx) {
    if (!showMenu) return;

    const W = ctx.canvas.width;
    const H = ctx.canvas.height;

    ctx.save();

    ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

    ctx.fillStyle = 'white';
    ctx.font = '36px Segoe UI';
    ctx.textAlign = 'center';
    ctx.fillText('Controls', ctx.canvas.width / 2, 100);

    ctx.fillText("Left", W / 2 - 150, 150);
    ctx.drawImage(controlLeftArrow, W / 2 -250, 160);
    ctx.drawImage(controlAKey, W / 2 -150, 160);
    ctx.fillText("Right", W / 2 + 150, 150);
    ctx.drawImage(controlRightArrow, W / 2 + 50, 160);
    ctx.drawImage(controlDKey, W / 2 + 150, 160);

    let mute_icon = isMuted? unmuteIcon : muteIcon;
    let mute_aspect = mute_icon.width / mute_icon.height;

    const mute_height = 48;
    const mute_width = mute_height * mute_aspect;

    const mute_x = W - mute_width - MUTE_ICON_PADDING;
    const mute_y = H - mute_height - MUTE_ICON_PADDING;

    muteButtonBounds = {mute_x, mute_y, mute_width, mute_height};

    const credit_height = 144;
    const credit_width = 192;
    const credit_pad = 10;
    const credit_x = credit_pad;
    const credit_y = H - credit_pad - credit_height;

    creditsButtonBounds = {credit_height, credit_width, credit_x, credit_y};

    ctx.drawImage(mute_icon, mute_x, mute_y, mute_width, mute_height);

    ctx.fillStyle = 'rgba(106, 106, 106, 0.9)';
    ctx.fillRect(credit_x, credit_y, credit_width, credit_height);



    ctx.restore();
}