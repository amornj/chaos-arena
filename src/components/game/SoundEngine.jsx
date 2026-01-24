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

    const playNoise = (duration, volume = 0.1) => {
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
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(1000, ctx.currentTime);
            
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

    return {
        shoot: () => {
            playTone(800, 0.05, 'square', 0.08);
            playTone(400, 0.08, 'sawtooth', 0.05);
        },
        
        shootFlamethrower: () => {
            playTone(200, 0.03, 'sawtooth', 0.06);
            playNoise(0.02, 0.04);
        },
        
        shootSniper: () => {
            playTone(1200, 0.02, 'sine', 0.12);
            playTone(300, 0.05, 'square', 0.1);
            playNoise(0.03, 0.08);
        },
        
        shootLightning: () => {
            playNoise(0.08, 0.15);
            playTone(2000, 0.02, 'sine', 0.1);
        },
        
        shootGrenade: () => {
            playTone(400, 0.08, 'triangle', 0.1);
            playTone(200, 0.1, 'square', 0.08);
        },
        
        hit: () => {
            playTone(200, 0.1, 'square', 0.15);
            playNoise(0.05, 0.1);
        },
        
        enemyHit: () => {
            playTone(300 + Math.random() * 100, 0.05, 'square', 0.06);
        },
        
        kill: () => {
            playTone(150, 0.15, 'sawtooth', 0.12);
            playTone(100, 0.2, 'square', 0.08);
            playNoise(0.1, 0.08);
        },
        
        death: () => {
            playTone(200, 0.3, 'sawtooth', 0.2);
            playTone(150, 0.4, 'square', 0.15);
            playTone(100, 0.5, 'sawtooth', 0.1);
            playNoise(0.3, 0.15);
        },
        
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
        
        start: () => {
            playTone(200, 0.15, 'square', 0.1);
            setTimeout(() => playTone(300, 0.15, 'square', 0.1), 100);
            setTimeout(() => playTone(400, 0.2, 'sawtooth', 0.1), 200);
        }
    };
}