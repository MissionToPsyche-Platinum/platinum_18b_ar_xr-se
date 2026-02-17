// === Audio === //
export const sounds = { bg: new Audio('./sounds/spaceship.mp3'), 
start: new Audio('./sounds/game-start.mp3'), 
gameover: new Audio('./sounds/game-over.mp3'),
powerupShield: new Audio('./sounds/powerup_shield.mp3'),
powerupScore: new Audio('./sounds/powerup_scoreboost.mp3'),
};

export const audioState = {
    master: 1.0,
    music: 1.0,
    sfx: 1.0,

    applyAudio() {
        // Temporary solution: Should categorize sounds in the sounds constant (SFX, Music)
        sounds.bg.volume = this.master * this.music * 0.4;
        sounds.start.volume = this.master * this.sfx;
        sounds.gameover.volume = this.master * this.sfx;
        sounds.powerupScore.volume = this.master * this.sfx;
        sounds.powerupShield.volume = this.master * this.sfx;

        localStorage.setItem("master-vol", this.master);
        localStorage.setItem("music-vol", this.music);
        localStorage.setItem("sfx-vol", this.sfx);

        console.log(localStorage.getItem("master-vol"));
    }

}

export const isMuted = {
    master: false,
    music: false,
    sfx: false
};

export function toggleMaster(val) {
    Object.values(sounds).forEach(s => s.muted = val);
    localStorage.setItem("master-mute", val);
}

export function toggleMusic(val) {
    sounds.bg.muted = val;
    localStorage.setItem("music-mute", val);
}

export function toggleSfx(val) {
    sounds.gameover.muted = val;
    sounds.powerupShield.muted = val;
    sounds.powerupScore.muted = val;
    sounds.start.muted = val;
    localStorage.setItem("sfx-mute", val);
}

Object.values(sounds).forEach(s => s.load());
sounds.bg.loop = true;
sounds.bg.volume = 0.4;

function loadNumber(key, defaultVol) {
    const data = localStorage.getItem(key);
    if (data === null) return defaultVol;
    const num = Number(data);
    console.log(num);
    return Number.isFinite(num) ? num : defaultVol;
} 

audioState.master = loadNumber("master-vol", 1.0)
audioState.music = loadNumber("music-vol", 1.0)
audioState.sfx = loadNumber("sfx-vol", 1.0)
audioState.applyAudio();

isMuted.master = (localStorage.getItem("master-mute") == "true");
isMuted.music = (localStorage.getItem("music-mute") == "true");
isMuted.sfx = (localStorage.getItem("sfx-mute") == "true");

console.log(isMuted);

toggleMaster(isMuted.master);
toggleMusic(isMuted.music);
toggleSfx(isMuted.sfx);

