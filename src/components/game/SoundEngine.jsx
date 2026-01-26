// Procedural sound effects using Web Audio API
export function createSFX() {
    let audioContext = null;

    const getContext = () => {
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }
        return audioContext;
    };

    const playTone = (frequency, duration, type = 'square', volume = 0.1, decay = true) => {
        try {
            const ctx = getContext();
            const oscillator = ctx.createOscillator();
            const gainNode = ctx.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(ctx.destination);

            oscillator.type = type;
            oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);

            gainNode.gain.setValueAtTime(volume, ctx.currentTime);
            if (decay) {
                gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
            }

            oscillator.start(ctx.currentTime);
            oscillator.stop(ctx.currentTime + duration);
        } catch (e) {
            // Audio not available
        }
    };

    // Play tone with frequency sweep (great for lasers, power-ups)
    const playSweep = (startFreq, endFreq, duration, type = 'sine', volume = 0.1) => {
        try {
            const ctx = getContext();
            const oscillator = ctx.createOscillator();
            const gainNode = ctx.createGain();

            oscillator.connect(gainNode);
            gainNode.connect(ctx.destination);

            oscillator.type = type;
            oscillator.frequency.setValueAtTime(startFreq, ctx.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(endFreq, ctx.currentTime + duration);

            gainNode.gain.setValueAtTime(volume, ctx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

            oscillator.start(ctx.currentTime);
            oscillator.stop(ctx.currentTime + duration);
        } catch (e) {
            // Audio not available
        }
    };

    const playNoise = (duration, volume = 0.1, filterFreq = 1000, filterType = 'lowpass') => {
        try {
            const ctx = getContext();
            const bufferSize = ctx.sampleRate * duration;
            const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
            const data = buffer.getChannelData(0);

            for (let i = 0; i < bufferSize; i++) {
                data[i] = Math.random() * 2 - 1;
            }

            const source = ctx.createBufferSource();
            const gainNode = ctx.createGain();
            const filter = ctx.createBiquadFilter();

            source.buffer = buffer;
            filter.type = filterType;
            filter.frequency.setValueAtTime(filterFreq, ctx.currentTime);

            source.connect(filter);
            filter.connect(gainNode);
            gainNode.connect(ctx.destination);

            gainNode.gain.setValueAtTime(volume, ctx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

            source.start(ctx.currentTime);
        } catch (e) {
            // Audio not available
        }
    };

    // Play explosion with rumble (layered noise + low tones)
    const playExplosion = (size = 1, volume = 0.2) => {
        try {
            const ctx = getContext();
            const duration = 0.3 + size * 0.2;

            // Low rumble
            playTone(60 / size, duration, 'sine', volume * 0.8);
            playTone(40, duration * 1.5, 'sine', volume * 0.5);

            // Mid crunch
            playNoise(duration * 0.5, volume * 0.6, 800);

            // High sizzle
            setTimeout(() => playNoise(duration * 0.3, volume * 0.3, 3000, 'highpass'), 50);
        } catch (e) {
            // Audio not available
        }
    };

    return {
        // === WEAPON SOUNDS ===
        shoot: () => {
            playTone(800, 0.05, 'square', 0.08);
            playTone(400, 0.08, 'sawtooth', 0.05);
        },

        // Melee sounds
        meleeSwing: () => {
            playSweep(300, 800, 0.12, 'sawtooth', 0.1);
            playNoise(0.08, 0.06, 2000, 'highpass');
        },

        meleeHit: () => {
            playTone(200, 0.08, 'square', 0.12);
            playNoise(0.06, 0.1, 600);
            playTone(100, 0.1, 'sawtooth', 0.08);
        },

        meleeHeavy: () => {
            playTone(80, 0.15, 'sawtooth', 0.15);
            playNoise(0.1, 0.12, 400);
            playTone(60, 0.2, 'sine', 0.1);
        },

        chainsaw: () => {
            // Aggressive buzzing chainsaw sound
            playTone(80 + Math.random() * 20, 0.04, 'sawtooth', 0.12);
            playTone(120 + Math.random() * 30, 0.03, 'square', 0.08);
            playNoise(0.03, 0.06, 1500);
        },

        shootFlamethrower: () => {
            playTone(200, 0.03, 'sawtooth', 0.06);
            playNoise(0.02, 0.04, 2000);
        },

        shootSniper: () => {
            playSweep(2000, 400, 0.08, 'sawtooth', 0.12);
            playNoise(0.04, 0.1, 500);
        },

        shootLightning: () => {
            playNoise(0.08, 0.15, 4000, 'highpass');
            playSweep(3000, 800, 0.1, 'sine', 0.08);
        },

        shootGrenade: () => {
            playTone(400, 0.08, 'triangle', 0.1);
            playTone(200, 0.1, 'square', 0.08);
        },

        shootShotgun: () => {
            playNoise(0.08, 0.18, 600);
            playTone(150, 0.1, 'square', 0.12);
            playTone(100, 0.15, 'sawtooth', 0.08);
        },

        shootRailgun: () => {
            playSweep(100, 2000, 0.15, 'sawtooth', 0.15);
            playNoise(0.1, 0.12, 3000, 'highpass');
            setTimeout(() => playTone(80, 0.2, 'sine', 0.1), 100);
        },

        shootMinigun: () => {
            playTone(600 + Math.random() * 200, 0.02, 'square', 0.06);
            playNoise(0.015, 0.04, 2000);
        },

        shootRocket: () => {
            playSweep(200, 800, 0.15, 'sawtooth', 0.1);
            playNoise(0.1, 0.08, 1500);
        },

        shootPlasma: () => {
            playSweep(600, 1200, 0.08, 'sine', 0.1);
            playTone(400, 0.1, 'triangle', 0.08);
        },

        // === IMPACT SOUNDS ===
        hit: () => {
            playTone(200, 0.1, 'square', 0.15);
            playNoise(0.05, 0.1, 800);
        },

        enemyHit: () => {
            playTone(300 + Math.random() * 100, 0.05, 'square', 0.06);
        },

        criticalHit: () => {
            playTone(800, 0.05, 'square', 0.12);
            playTone(1200, 0.08, 'sine', 0.1);
            playNoise(0.04, 0.08, 2000, 'highpass');
        },

        // === EXPLOSION SOUNDS ===
        explosion: () => {
            playExplosion(1, 0.2);
        },

        explosionSmall: () => {
            playExplosion(0.5, 0.15);
        },

        explosionBig: () => {
            playExplosion(2, 0.25);
        },

        explosionMega: () => {
            playExplosion(4, 0.3);
            setTimeout(() => playExplosion(2, 0.2), 100);
            setTimeout(() => playExplosion(1.5, 0.15), 200);
        },

        // === KILL SOUNDS ===
        kill: () => {
            playTone(150, 0.15, 'sawtooth', 0.12);
            playTone(100, 0.2, 'square', 0.08);
            playNoise(0.1, 0.08, 600);
        },

        killBoss: () => {
            playExplosion(3, 0.25);
            setTimeout(() => {
                playSweep(200, 800, 0.3, 'sine', 0.12);
                playSweep(400, 1000, 0.3, 'sine', 0.1);
            }, 150);
        },

        death: () => {
            playTone(200, 0.3, 'sawtooth', 0.2);
            playTone(150, 0.4, 'square', 0.15);
            playTone(100, 0.5, 'sawtooth', 0.1);
            playNoise(0.3, 0.15, 500);
        },

        // === ABILITY SOUNDS ===
        dash: () => {
            playSweep(400, 1200, 0.1, 'sine', 0.1);
            playNoise(0.05, 0.06, 3000, 'highpass');
        },

        nitroBoost: () => {
            playSweep(200, 1000, 0.2, 'sawtooth', 0.12);
            playNoise(0.15, 0.1, 2000);
        },

        combatRoll: () => {
            playSweep(800, 400, 0.15, 'sine', 0.08);
            playNoise(0.08, 0.06, 1500);
        },

        orbitalStrike: () => {
            playSweep(2000, 100, 0.4, 'sawtooth', 0.15);
            setTimeout(() => playExplosion(3, 0.25), 350);
        },

        gravityWell: () => {
            playSweep(100, 50, 0.5, 'sine', 0.15);
            playTone(80, 0.6, 'triangle', 0.1);
        },

        shockwave: () => {
            playExplosion(1.5, 0.18);
            playSweep(400, 100, 0.2, 'sine', 0.12);
        },

        chronosphere: () => {
            playSweep(1000, 200, 0.3, 'sine', 0.1);
            playTone(150, 0.4, 'triangle', 0.08);
        },

        droneShoot: () => {
            playTone(1000, 0.03, 'square', 0.04);
        },

        // === SHIELD SOUNDS ===
        shieldHit: () => {
            playTone(600, 0.08, 'sine', 0.1);
            playTone(800, 0.06, 'triangle', 0.08);
        },

        shieldBreak: () => {
            playSweep(1000, 200, 0.2, 'sawtooth', 0.15);
            playNoise(0.15, 0.12, 2000, 'highpass');
        },

        shieldRecharge: () => {
            playSweep(400, 800, 0.15, 'sine', 0.08);
        },

        // === STATUS EFFECT SOUNDS ===
        freeze: () => {
            playSweep(2000, 800, 0.1, 'sine', 0.1);
            playTone(1500, 0.15, 'triangle', 0.06);
        },

        poison: () => {
            playTone(200, 0.1, 'sawtooth', 0.06);
            playNoise(0.08, 0.04, 400);
        },

        burn: () => {
            playNoise(0.1, 0.08, 1500);
            playTone(300, 0.08, 'sawtooth', 0.06);
        },

        // === PICKUP SOUNDS ===
        healthPickup: () => {
            playSweep(400, 800, 0.15, 'sine', 0.1);
            setTimeout(() => playTone(1000, 0.1, 'sine', 0.08), 100);
        },

        ammoPickup: () => {
            playTone(600, 0.05, 'square', 0.08);
            setTimeout(() => playTone(800, 0.05, 'square', 0.08), 50);
        },

        powerup: () => {
            playSweep(300, 1200, 0.2, 'sine', 0.12);
            setTimeout(() => playTone(1400, 0.15, 'sine', 0.1), 150);
        },

        // === ENEMY SOUNDS ===
        enemyShoot: () => {
            playTone(400, 0.06, 'square', 0.06);
            playTone(300, 0.08, 'sawtooth', 0.04);
        },

        sniperCharge: () => {
            playSweep(200, 1500, 0.8, 'sine', 0.06);
        },

        mortarLaunch: () => {
            playSweep(300, 150, 0.15, 'triangle', 0.1);
            playNoise(0.08, 0.08, 800);
        },

        bossSpawn: () => {
            playTone(80, 0.5, 'sawtooth', 0.15);
            playTone(60, 0.6, 'sine', 0.12);
            setTimeout(() => playSweep(100, 400, 0.3, 'sawtooth', 0.1), 400);
        },

        bossHit: () => {
            playTone(150, 0.1, 'square', 0.1);
            playNoise(0.06, 0.08, 500);
        },

        // === UI SOUNDS ===
        upgrade: () => {
            playTone(400, 0.1, 'sine', 0.1);
            setTimeout(() => playTone(600, 0.1, 'sine', 0.1), 50);
            setTimeout(() => playTone(800, 0.15, 'sine', 0.1), 100);
        },

        waveComplete: () => {
            playTone(300, 0.1, 'sine', 0.1);
            setTimeout(() => playTone(400, 0.1, 'sine', 0.1), 100);
            setTimeout(() => playTone(500, 0.1, 'sine', 0.1), 200);
            setTimeout(() => playTone(700, 0.2, 'sine', 0.12), 300);
        },

        waveStart: () => {
            playTone(500, 0.1, 'square', 0.08);
            setTimeout(() => playTone(600, 0.1, 'square', 0.08), 80);
            setTimeout(() => playTone(700, 0.15, 'sawtooth', 0.1), 160);
        },

        start: () => {
            playTone(200, 0.15, 'square', 0.1);
            setTimeout(() => playTone(300, 0.15, 'square', 0.1), 100);
            setTimeout(() => playTone(400, 0.2, 'sawtooth', 0.1), 200);
        },

        pause: () => {
            playSweep(600, 300, 0.15, 'sine', 0.08);
        },

        unpause: () => {
            playSweep(300, 600, 0.15, 'sine', 0.08);
        },

        menuSelect: () => {
            playTone(800, 0.05, 'sine', 0.06);
        },

        menuBack: () => {
            playTone(400, 0.08, 'sine', 0.06);
        },

        // === WARNING SOUNDS ===
        lowHealth: () => {
            playTone(200, 0.15, 'square', 0.1);
            setTimeout(() => playTone(200, 0.15, 'square', 0.1), 200);
        },

        danger: () => {
            playTone(300, 0.1, 'sawtooth', 0.08);
            setTimeout(() => playTone(250, 0.1, 'sawtooth', 0.08), 150);
        },

        // === CHAIN/COMBO SOUNDS ===
        chainLightning: () => {
            playNoise(0.05, 0.1, 4000, 'highpass');
            playSweep(2000, 1000, 0.06, 'sine', 0.06);
        },

        combo: (level = 1) => {
            const baseFreq = 400 + level * 100;
            playTone(baseFreq, 0.08, 'sine', 0.08);
            setTimeout(() => playTone(baseFreq * 1.25, 0.08, 'sine', 0.08), 40);
        }
    };
}