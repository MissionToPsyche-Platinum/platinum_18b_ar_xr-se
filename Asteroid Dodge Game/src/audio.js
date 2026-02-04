// === Audio === //
export const sounds = { bg: new Audio('./sounds/spaceship.mp3'), 
start: new Audio('./sounds/game-start.mp3'), 
gameover: new Audio('./sounds/game-over.mp3'),
powerupShield: new Audio('./sounds/powerup_shield.mp3'),
powerupScore: new Audio('./sounds/powerup_scoreboost.mp3'),
};

let muted = false;

export const audioState = {
    master: 1.0,
    music: 1.0,
    sfx: 1.0,

    applyAudio() {
        // Temporary solution: Should categorize sounds in the sounds constant (SFX, Music)
        sounds.bg.volume = this.master * this.music;
        sounds.gameover.volume = this.master * this.sfx;
        sounds.powerupScore.volume = this.master * this.sfx;
        sounds.powerupShield.volume = this.master * this.sfx;
    }
}

export function toggleMute() {
    muted = !muted;
    Object.values(sounds).forEach(s => s.muted = muted);
}

Object.values(sounds).forEach(s => s.load());
sounds.bg.loop = true;
sounds.bg.volume = 0.4;

