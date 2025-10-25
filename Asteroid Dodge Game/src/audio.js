// === Audio === //
export const sounds = { bg: new Audio('./sounds/spaceship.mp3'), 
start: new Audio('./sounds/game-start.mp3'), 
gameover: new Audio('./sounds/game-over.mp3')
};

let muted = false;

export function toggleMute() {
    muted = !muted;
    Object.values(sounds).forEach(s => s.muted = muted);
}

Object.values(sounds).forEach(s => s.load());
sounds.bg.loop = true;
sounds.bg.volume = 0.4;

