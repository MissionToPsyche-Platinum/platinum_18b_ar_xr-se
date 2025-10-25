let showMenu = false;

// Control images
const controlLeftArrow = new Image();
const controlRightArrow = new Image();
const controlAKey = new Image();
const controlDKey = new Image();
controlLeftArrow.src = './resources/leftkey.svg';
controlRightArrow.src = './resources/rightkey.svg';
controlAKey.src = './resources/a_key.svg';
controlDKey.src = './resources/d_key.svg';

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

    ctx.restore();
}