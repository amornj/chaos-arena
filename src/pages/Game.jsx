import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import GameUI from '@/components/game/GameUI';
import UpgradeModal from '@/components/game/UpgradeModal';
import GameOverScreen from '@/components/game/GameOverScreen';
import ClassSelection from '@/components/game/ClassSelection';
import EnemyLog from '@/components/game/EnemyLog';
import EnemyCounter from '@/components/game/EnemyCounter';
import CheatPopup from '@/components/game/CheatPopup';
import { createSFX } from '@/components/game/SoundEngine';
import { shootWeapon, createWeaponUpgrade, createGearUpgrade, WEAPONS, GEAR } from '@/components/game/WeaponSystem';

// Game constants
const PLAYER_BASE_SPEED = 5;
const PLAYER_BASE_HEALTH = 100;
const PLAYER_BASE_DAMAGE = 10;
const PLAYER_SIZE = 20;
const BULLET_SPEED = 15;
const ENEMY_BASE_SPEED = 2;
const ENEMY_BASE_HEALTH = 30;
const ENEMY_BASE_DAMAGE = 5;
const ENEMY_MELEE_DAMAGE = 5; // Damage per hit (with cooldown)
const ENEMY_MELEE_COOLDOWN = 500; // ms between melee hits

export default function Game() {
    const canvasRef = useRef(null);
    const gameStateRef = useRef(null);
    const animationRef = useRef(null);
    const sfxRef = useRef(null);
    
    const [gameStarted, setGameStarted] = useState(false);
    const [classSelected, setClassSelected] = useState(false);
    const [selectedClass, setSelectedClass] = useState(null);
    const [isPaused, setIsPaused] = useState(false);
    const [showUpgrades, setShowUpgrades] = useState(false);
    const [gameOver, setGameOver] = useState(false);
    const [uiState, setUiState] = useState({
        health: PLAYER_BASE_HEALTH,
        maxHealth: PLAYER_BASE_HEALTH,
        wave: 1,
        score: 0,
        kills: 0,
        combo: 0
    });
    const [finalStats, setFinalStats] = useState(null);
    const [availableUpgrades, setAvailableUpgrades] = useState([]);
    const [rerolls, setRerolls] = useState(3);
    const maxRerolls = 3;
    const [showLog, setShowLog] = useState(false);
    const [sandboxMode, setSandboxMode] = useState(false);
    const [showCheatPopup, setShowCheatPopup] = useState(false);
    const [cheatsEnabled, setCheatsEnabled] = useState(false);
    const [noWeaponCooldown, setNoWeaponCooldown] = useState(false);
    const [blindEnemies, setBlindEnemies] = useState(false);
    const konamiCodeRef = useRef([]);
    const konamiSequence = ['arrowup', 'arrowup', 'arrowdown', 'arrowdown', 'arrowleft', 'arrowright', 'arrowleft', 'arrowright', 'b', 'a'];

    // Initialize sound effects
    useEffect(() => {
        sfxRef.current = createSFX();
    }, []);

    const initGame = useCallback((classData) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        // Set explicit dimensions
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width || window.innerWidth;
        canvas.height = rect.height || window.innerHeight;

        // Apply class passives to base stats
        const classId = classData.id;
        let health = classData.stats.health;
        let damage = classData.stats.damage;
        let speed = classData.stats.speed;
        let critChance = 0.05;
        let critMultiplier = 2;
        let lifesteal = 0;
        let evasionChance = 0;
        let shield = 0;
        let regen = 0;
        let droneCount = 0;
        let scoreMultiplier = 1;

        // Class-specific stat modifiers
        if (classId === 'gunslinger') { critChance = 0.30; critMultiplier = 2.5; }
        if (classId === 'sniper') { critChance = 0.15; critMultiplier = 3; }
        if (classId === 'vampire') { lifesteal = 0.20; regen = 0; }
        if (classId === 'medic') { regen = 2; }
        if (classId === 'speedster') { evasionChance = 0.25; }
        if (classId === 'ghost') { evasionChance = 0.15; }
        if (classId === 'ninja') { evasionChance = 0.35; }
        if (classId === 'lucky') { evasionChance = 0.15; critChance = 0.30; scoreMultiplier = 1.25; }
        if (classId === 'gambler') { scoreMultiplier = 1.5; }
        if (classId === 'fortress') { shield = 50; }
        if (classId === 'engineer') { droneCount = 2; }
        if (classId === 'dasher') { evasionChance = 0.1; }

        gameStateRef.current = {
            ctx,
            canvas,
            player: {
                x: canvas.width / 2,
                y: canvas.height / 2,
                speed,
                baseSpeed: speed,
                health,
                maxHealth: health,
                damage,
                baseDamage: damage,
                fireRate: classData.stats.fireRate,
                lastShot: 0,
                piercing: 0,
                lifesteal,
                explosiveRounds: false,
                multishot: 1,
                critChance,
                critMultiplier,
                shield,
                maxShield: shield > 0 ? 100 : 0,
                regen,
                lastRegen: 0,
                currentWeapon: classData.stats.weapon,
                classId,
                ability: {
                    name: classData.ability.name,
                    cooldown: classData.ability.cooldown,
                    type: classData.ability.type,
                    ready: true,
                    lastUsed: 0
                },
                invulnerable: false,
                invulnerableUntil: 0,
                evasionChance,
                droneCount,
                scoreMultiplier,
                // Class-specific tracking
                berserkerStacks: 0,
                titanBonusWave: 0,
                runnerMoving: false,
                ghostPhasing: false,
                ninjaInvisible: false,
                gamblerAllIn: false,
                elementalLastType: 0
            },
            bullets: [],
            enemies: [],
            particles: [],
            damageNumbers: [],
            wave: 1,
            score: 0,
            kills: 0,
            totalKills: 0,
            combo: 0,
            comboTimer: 0,
            enemiesThisWave: 5,
            enemiesSpawned: 0,
            spawnTimer: 0,
            waveComplete: false,
            screenShake: { x: 0, y: 0, intensity: 0 },
            keys: {},
            mouse: { x: canvas.width / 2, y: canvas.height / 2, down: false },
            difficultyMultiplier: 1
        };
    }, []);

    const spawnEnemy = useCallback(() => {
        const gs = gameStateRef.current;
        if (!gs) return;
        
        const { canvas, wave, difficultyMultiplier } = gs;
        const side = Math.floor(Math.random() * 4);
        let x, y;
        
        switch(side) {
            case 0: x = Math.random() * canvas.width; y = -30; break;
            case 1: x = canvas.width + 30; y = Math.random() * canvas.height; break;
            case 2: x = Math.random() * canvas.width; y = canvas.height + 30; break;
            default: x = -30; y = Math.random() * canvas.height;
        }

        // Enemy types based on wave
        const types = ['basic', 'runner'];
        if (wave >= 2) types.push('brute', 'grunt');
        if (wave >= 3) types.push('bloater', 'spitter');
        if (wave >= 4) types.push('blitzer', 'detonator', 'acid_spitter');
        if (wave >= 5) types.push('speeder', 'heavy', 'crawler');
        if (wave >= 6) types.push('gunner', 'volatile', 'plasma_spitter');
        if (wave >= 7) types.push('shambler', 'striker', 'charger');
        if (wave >= 8) types.push('sniper', 'cluster', 'wraith');
        if (wave >= 9) types.push('dasher', 'phantom', 'berserker_enemy');
        if (wave >= 10) types.push('juggernaut', 'inferno', 'demolisher');
        if (wave >= 11) types.push('goliath', 'mortar', 'siege');
        if (wave >= 12) types.push('nuke', 'ironclad', 'titan_enemy');
        if (wave >= 15) types.push('megaton', 'apocalypse');

        // Boss variants based on wave number
        let bossType = 'boss_warlord';
        if (wave >= 10) bossType = ['boss_warlord', 'boss_titan'][Math.floor(Math.random() * 2)];
        if (wave >= 15) bossType = ['boss_warlord', 'boss_titan', 'boss_overlord'][Math.floor(Math.random() * 3)];
        if (wave >= 20) bossType = ['boss_titan', 'boss_overlord', 'boss_destroyer'][Math.floor(Math.random() * 3)];

        const type = wave % 5 === 0 && gs.enemiesSpawned === 0 ? bossType :
                     types[Math.floor(Math.random() * types.length)];

        const enemyConfigs = {
            // === BASIC VARIANTS ===
            basic: { health: 30, speed: 2, damage: 5, size: 18, color: '#ff4444', points: 10 },
            runner: { health: 15, speed: 2.4, damage: 2.5, size: 16, color: '#ff6666', points: 12 },
            grunt: { health: 40, speed: 1.6, damage: 8, size: 20, color: '#dd3333', points: 14 },
            crawler: { health: 20, speed: 2.8, damage: 4, size: 14, color: '#ff5555', points: 16, lowProfile: true },

            // === TANK VARIANTS ===
            brute: { health: 45, speed: 1.8, damage: 10, size: 22, color: '#cc2222', points: 18 },
            heavy: { health: 60, speed: 2, damage: 20, size: 36, color: '#880022', points: 35 },
            charger: { health: 55, speed: 1.5, damage: 18, size: 26, color: '#aa1111', points: 28, charges: true },
            juggernaut: { health: 200, speed: 0.8, damage: 25, size: 45, color: '#660000', points: 60 },
            goliath: { health: 120, speed: 1.4, damage: 15, size: 38, color: '#551122', points: 50, regenerates: true },
            ironclad: { health: 100, speed: 1.6, damage: 12, size: 30, color: '#444466', points: 45, explosionResist: true },
            titan_enemy: { health: 180, speed: 1.0, damage: 22, size: 42, color: '#553344', points: 70, armor: 0.3 },
            demolisher: { health: 90, speed: 1.8, damage: 15, size: 28, color: '#662244', points: 45, explosiveAttack: true },

            // === SPEED VARIANTS ===
            speeder: { health: 15, speed: 4, damage: 5, size: 16, color: '#ffff44', points: 25 },
            blitzer: { health: 12, speed: 5, damage: 4, size: 14, color: '#ffaa00', points: 30, leavesTrail: true },
            phantom: { health: 25, speed: 3.5, damage: 6, size: 16, color: '#aa44ff', points: 35, phasing: true },
            striker: { health: 20, speed: 3, damage: 7, size: 17, color: '#ff8888', points: 28, speedsWhenHurt: true },
            dasher: { health: 30, speed: 2, damage: 8, size: 18, color: '#00ffff', points: 22, dashes: true },
            wraith: { health: 18, speed: 4.5, damage: 5, size: 15, color: '#9944ff', points: 38, phasing: true, invisible: true },
            berserker_enemy: { health: 35, speed: 3.5, damage: 12, size: 19, color: '#ff4466', points: 35, enrages: true },

            // === EXPLOSION VARIANTS ===
            bloater: { health: 20, speed: 2.4, damage: 2.5, size: 22, color: '#ff8844', points: 20, explodes: true, fuseTime: 3 },
            nuke: { health: 100, speed: 0.8, damage: 50, size: 45, color: '#ff00ff', points: 100, explodes: true, fuseTime: 5, bigExplosion: true },
            cluster: { health: 35, speed: 1.8, damage: 8, size: 24, color: '#ff6600', points: 40, explodes: true, fuseTime: 4, spawnsMiniBombs: true },
            volatile: { health: 18, speed: 2.2, damage: 15, size: 20, color: '#ffcc00', points: 25, explodesOnHit: true },
            inferno: { health: 40, speed: 1.5, damage: 10, size: 22, color: '#ff3300', points: 45, leavesFireTrail: true, explodes: true, fuseTime: 6 },
            detonator: { health: 15, speed: 2.8, damage: 20, size: 18, color: '#ff0044', points: 30, explodes: true, fuseTime: 1.5 },
            megaton: { health: 250, speed: 0.5, damage: 80, size: 55, color: '#ff00aa', points: 150, explodes: true, fuseTime: 8, bigExplosion: true, hugeExplosion: true },
            apocalypse: { health: 300, speed: 0.4, damage: 100, size: 60, color: '#ff0088', points: 200, explodes: true, fuseTime: 10, bigExplosion: true, hugeExplosion: true, spawnsMiniBombs: true },

            // === RANGED VARIANTS ===
            spitter: { health: 25, speed: 1.5, damage: 6, size: 18, color: '#88ff44', points: 15, shoots: true },
            acid_spitter: { health: 28, speed: 1.4, damage: 5, size: 19, color: '#aaff22', points: 22, shoots: true, acidShot: true },
            plasma_spitter: { health: 22, speed: 1.6, damage: 10, size: 17, color: '#44ffff', points: 28, shoots: true, plasmaShot: true },
            shambler: { health: 40, speed: 1.2, damage: 3, size: 20, color: '#8888ff', points: 25, cloudShooter: true },
            sniper: { health: 30, speed: 1.0, damage: 18, size: 18, color: '#44ff88', points: 35, shoots: true, sniperShot: true },
            gunner: { health: 35, speed: 1.3, damage: 4, size: 20, color: '#44ffaa', points: 32, shoots: true, rapidFire: true },
            mortar: { health: 45, speed: 1.0, damage: 12, size: 24, color: '#88ffcc', points: 40, mortarShot: true },
            siege: { health: 60, speed: 0.8, damage: 18, size: 28, color: '#66ddaa', points: 55, mortarShot: true, doubleShot: true },

            // === BOSS VARIANTS ===
            boss_warlord: { health: 300 * wave, speed: 1.8, damage: 12, size: 45, color: '#ff0066', points: 100 * wave, bossType: 'warlord' },
            boss_titan: { health: 500 * wave, speed: 1.0, damage: 20, size: 60, color: '#8800ff', points: 150 * wave, bossType: 'titan', armor: 0.25 },
            boss_overlord: { health: 400 * wave, speed: 1.5, damage: 15, size: 55, color: '#ff8800', points: 125 * wave, bossType: 'overlord', shoots: true, rapidFire: true },
            boss_destroyer: { health: 350 * wave, speed: 2.0, damage: 25, size: 50, color: '#00ff88', points: 175 * wave, bossType: 'destroyer', charges: true, explosiveAttack: true }
        };

        const config = enemyConfigs[type];
        const dm = difficultyMultiplier;

        const enemy = {
            x, y,
            health: config.health * dm,
            maxHealth: config.health * dm,
            speed: config.speed * (1 + dm * 0.1),
            baseSpeed: config.speed * (1 + dm * 0.1),
            damage: config.damage * dm,
            size: config.size,
            color: config.color,
            points: config.points,
            type,
            shoots: config.shoots,
            cloudShooter: config.cloudShooter,
            lastShot: 0,
            lastMeleeHit: 0,
            hitFlash: 0,
            explodes: config.explodes,
            fuseTime: config.fuseTime,
            bigExplosion: config.bigExplosion,
            hugeExplosion: config.hugeExplosion,
            spawnTime: Date.now(),
            dashes: config.dashes,
            dashCooldown: 0,
            isDashing: false,
            dashAngle: 0,
            // New properties
            regenerates: config.regenerates,
            explosionResist: config.explosionResist,
            leavesTrail: config.leavesTrail,
            phasing: config.phasing,
            speedsWhenHurt: config.speedsWhenHurt,
            spawnsMiniBombs: config.spawnsMiniBombs,
            explodesOnHit: config.explodesOnHit,
            leavesFireTrail: config.leavesFireTrail,
            sniperShot: config.sniperShot,
            rapidFire: config.rapidFire,
            mortarShot: config.mortarShot,
            // Variant properties
            acidShot: config.acidShot,
            plasmaShot: config.plasmaShot,
            armor: config.armor || 0,
            charges: config.charges,
            enrages: config.enrages,
            invisible: config.invisible,
            lowProfile: config.lowProfile,
            doubleShot: config.doubleShot,
            explosiveAttack: config.explosiveAttack,
            bossType: config.bossType,
            lastTrail: 0,
            lastRegen: 0,
            lastCharge: 0,
            isCharging: false
        };

        gs.enemies.push(enemy);
    }, []);

    const createParticles = useCallback((x, y, color, count = 10, speed = 5, type = 'default') => {
        const gs = gameStateRef.current;
        if (!gs) return;

        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 / count) * i + Math.random() * 0.5;
            const speedMod = 0.5 + Math.random();
            gs.particles.push({
                x, y,
                vx: Math.cos(angle) * speed * speedMod,
                vy: Math.sin(angle) * speed * speedMod,
                life: 1,
                decay: 0.02 + Math.random() * 0.03,
                size: 3 + Math.random() * 4,
                color,
                type,
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.3,
                gravity: type === 'spark' ? 0.2 : (type === 'smoke' ? -0.05 : 0),
                shrink: type === 'smoke' ? false : true
            });
        }
    }, []);

    // Create ring explosion effect
    const createRingExplosion = useCallback((x, y, color, maxRadius = 100) => {
        const gs = gameStateRef.current;
        if (!gs) return;
        gs.ringEffects = gs.ringEffects || [];
        gs.ringEffects.push({
            x, y, color,
            radius: 0,
            maxRadius,
            life: 1,
            lineWidth: 8
        });
    }, []);

    // Create screen flash effect
    const createScreenFlash = useCallback((color, intensity = 0.3) => {
        const gs = gameStateRef.current;
        if (!gs) return;
        gs.screenFlash = { color, intensity, life: 1 };
    }, []);

    // Create bullet trail
    const createBulletTrail = useCallback((x, y, color, size = 4) => {
        const gs = gameStateRef.current;
        if (!gs) return;
        gs.bulletTrails = gs.bulletTrails || [];
        gs.bulletTrails.push({
            x, y, color, size,
            life: 1,
            decay: 0.15
        });
    }, []);

    // Create muzzle flash
    const createMuzzleFlash = useCallback((x, y, angle, color = '#ffff00') => {
        const gs = gameStateRef.current;
        if (!gs) return;
        gs.muzzleFlashes = gs.muzzleFlashes || [];
        gs.muzzleFlashes.push({
            x, y, angle, color,
            life: 1,
            size: 15 + Math.random() * 10
        });
    }, []);

    // Create impact sparks
    const createImpactSparks = useCallback((x, y, angle, color = '#ffffff') => {
        const gs = gameStateRef.current;
        if (!gs) return;

        // Directional sparks
        for (let i = 0; i < 8; i++) {
            const sparkAngle = angle + (Math.random() - 0.5) * 1.5;
            const speed = 5 + Math.random() * 8;
            gs.particles.push({
                x, y,
                vx: Math.cos(sparkAngle) * speed,
                vy: Math.sin(sparkAngle) * speed,
                life: 1,
                decay: 0.05 + Math.random() * 0.05,
                size: 2 + Math.random() * 2,
                color,
                type: 'spark',
                rotation: 0,
                rotationSpeed: 0,
                gravity: 0.3,
                shrink: true
            });
        }
    }, []);

    // Create death explosion (layered effect)
    const createDeathExplosion = useCallback((x, y, color, size = 20, isBoss = false) => {
        const gs = gameStateRef.current;
        if (!gs) return;

        // Core flash
        createScreenFlash(color, isBoss ? 0.4 : 0.15);

        // Ring effect
        createRingExplosion(x, y, color, size * (isBoss ? 8 : 4));

        // Main particles
        createParticles(x, y, color, isBoss ? 40 : 20, isBoss ? 12 : 8);

        // Secondary color burst
        createParticles(x, y, '#ffffff', isBoss ? 20 : 10, isBoss ? 10 : 6);

        // Smoke
        for (let i = 0; i < (isBoss ? 15 : 5); i++) {
            const angle = Math.random() * Math.PI * 2;
            const dist = Math.random() * size;
            gs.particles.push({
                x: x + Math.cos(angle) * dist,
                y: y + Math.sin(angle) * dist,
                vx: (Math.random() - 0.5) * 2,
                vy: -1 - Math.random() * 2,
                life: 1,
                decay: 0.01,
                size: 10 + Math.random() * 15,
                color: '#444444',
                type: 'smoke',
                rotation: Math.random() * Math.PI * 2,
                rotationSpeed: (Math.random() - 0.5) * 0.1,
                gravity: -0.05,
                shrink: false
            });
        }

        // Ember sparks
        for (let i = 0; i < (isBoss ? 30 : 12); i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 2 + Math.random() * 6;
            gs.particles.push({
                x, y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 2,
                life: 1,
                decay: 0.015 + Math.random() * 0.02,
                size: 2 + Math.random() * 3,
                color: '#ffaa00',
                type: 'spark',
                rotation: 0,
                rotationSpeed: 0,
                gravity: 0.15,
                shrink: true
            });
        }
    }, [createParticles, createRingExplosion, createScreenFlash]);

    // Create melee attack swing
    const createMeleeAttack = useCallback((attackData) => {
        const gs = gameStateRef.current;
        if (!gs) return;

        gs.meleeAttacks = gs.meleeAttacks || [];
        gs.meleeAttacks.push({
            ...attackData,
            progress: 0,
            hitEnemies: [] // Track which enemies were hit to prevent multi-hit
        });

        // Play melee sound
        sfxRef.current?.meleeSwing();

        // Create swing particles
        const particleCount = 8;
        for (let i = 0; i < particleCount; i++) {
            const t = i / particleCount;
            const particleAngle = attackData.angle - attackData.swingArc / 2 + attackData.swingArc * t;
            const dist = attackData.range * 0.8;
            gs.particles.push({
                x: attackData.x + Math.cos(particleAngle) * dist,
                y: attackData.y + Math.sin(particleAngle) * dist,
                vx: Math.cos(particleAngle) * 2,
                vy: Math.sin(particleAngle) * 2,
                life: 1,
                decay: 0.08,
                size: 4,
                color: attackData.color,
                type: 'spark',
                rotation: 0,
                rotationSpeed: 0,
                gravity: 0,
                shrink: true
            });
        }
    }, []);

    const createDamageNumber = useCallback((x, y, damage, isCrit = false) => {
        const gs = gameStateRef.current;
        if (!gs) return;
        
        gs.damageNumbers.push({
            x: x + (Math.random() - 0.5) * 20,
            y,
            damage: Math.round(damage),
            life: 1,
            vy: -3,
            isCrit
        });
    }, []);

    const shootBullet = useCallback((bulletData) => {
        const gs = gameStateRef.current;
        if (!gs) return;

        gs.bullets.push(bulletData);

        if (!bulletData.isEnemy) {
            sfxRef.current?.shoot();
            createParticles(bulletData.x, bulletData.y, bulletData.color || '#ffff00', 3, 3);
            // Muzzle flash
            const angle = Math.atan2(bulletData.vy, bulletData.vx);
            createMuzzleFlash(bulletData.x, bulletData.y, angle, bulletData.color || '#ffff00');
        }
    }, [createParticles, createMuzzleFlash]);

    const shootEnemyBullet = useCallback((fromX, fromY, toX, toY) => {
        const gs = gameStateRef.current;
        if (!gs) return;

        const angle = Math.atan2(toY - fromY, toX - fromX);
        const speed = 8;
        
        gs.bullets.push({
            x: fromX,
            y: fromY,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            damage: gs.enemies[0]?.damage || 10,
            isEnemy: true,
            piercing: 0,
            size: 6,
            color: '#ff0066'
        });
    }, []);

    const triggerScreenShake = useCallback((intensity) => {
        const gs = gameStateRef.current;
        if (gs) {
            gs.screenShake.intensity = Math.max(gs.screenShake.intensity, intensity);
        }
    }, []);

    const generateUpgrades = useCallback(() => {
        const gs = gameStateRef.current;
        const wave = gs?.wave || 1;

        // Common stat upgrades
        const commonUpgrades = [
            { id: 'damage', name: 'DAMAGE+', desc: '+20% Damage', icon: '💥', rarity: 'common', apply: (p) => p.damage *= 1.2 },
            { id: 'speed', name: 'VELOCITY', desc: '+15% Move Speed', icon: '⚡', rarity: 'common', apply: (p) => p.speed *= 1.15 },
            { id: 'health', name: 'VITALITY', desc: '+25 Max HP', icon: '❤️', rarity: 'common', apply: (p) => { p.maxHealth += 25; p.health += 25; }},
            { id: 'firerate', name: 'RAPIDFIRE', desc: '+20% Fire Rate', icon: '🔥', rarity: 'common', apply: (p) => p.fireRate *= 0.8 },
            { id: 'pierce', name: 'PIERCING', desc: '+1 Pierce', icon: '🎯', rarity: 'common', apply: (p) => p.piercing += 1 },
            { id: 'regen', name: 'REGENERATION', desc: '+2 HP/sec', icon: '💚', rarity: 'common', apply: (p) => p.regen = (p.regen || 0) + 2 },
        ];

        // Rare upgrades
        const rareUpgrades = [
            { id: 'lifesteal', name: 'VAMPIRIC', desc: '+8% Lifesteal', icon: '🧛', rarity: 'rare', apply: (p) => p.lifesteal += 0.08 },
            { id: 'crit', name: 'CRITICAL', desc: '+15% Crit Chance', icon: '💀', rarity: 'rare', apply: (p) => p.critChance += 0.15 },
            { id: 'critdmg', name: 'EXECUTE', desc: '+75% Crit Damage', icon: '⚔️', rarity: 'rare', apply: (p) => p.critMultiplier += 0.75 },
            { id: 'evasion', name: 'EVASION', desc: '+10% Dodge Chance', icon: '💨', rarity: 'rare', apply: (p) => p.evasionChance = (p.evasionChance || 0) + 0.10 },
            { id: 'armor', name: 'ARMOR', desc: '-15% Damage Taken', icon: '🛡️', rarity: 'rare', apply: (p) => p.damageReduction = (p.damageReduction || 0) + 0.15 },
            { id: 'multishot', name: 'MULTISHOT', desc: '+1 Projectile', icon: '🔱', rarity: 'rare', apply: (p) => p.multishot = (p.multishot || 1) + 1 },
        ];

        // Epic upgrades
        const epicUpgrades = [
            { id: 'explosive', name: 'EXPLOSIVE', desc: 'Bullets Explode on Hit', icon: '💣', rarity: 'epic', apply: (p) => p.explosiveRounds = true },
            { id: 'chain', name: 'CHAIN LIGHTNING', desc: 'Kills chain to nearby enemies', icon: '⚡', rarity: 'epic', apply: (p) => p.hasChainLightning = true },
            { id: 'homing', name: 'HOMING ROUNDS', desc: 'Bullets seek enemies', icon: '🎯', rarity: 'epic', apply: (p) => p.hasHoming = true },
            { id: 'thorns', name: 'THORNS', desc: 'Reflect 50% melee damage', icon: '🌹', rarity: 'epic', apply: (p) => p.thornsDamage = 0.5 },
            { id: 'secondwind', name: 'SECOND WIND', desc: 'Revive once at 50% HP', icon: '💫', rarity: 'epic', apply: (p) => p.hasSecondWind = true },
            { id: 'drone', name: 'ATTACK DRONE', desc: '+1 Orbiting combat drone', icon: '🛸', rarity: 'epic', apply: (p) => p.droneCount = (p.droneCount || 0) + 1 },
        ];

        // Legendary upgrades
        const legendaryUpgrades = [
            { id: 'godmode', name: 'INVINCIBILITY', desc: '3s immunity after taking damage', icon: '✨', rarity: 'legendary', apply: (p) => p.hasGodmode = true },
            { id: 'timestop', name: 'TIME STOP', desc: 'Slow time 80% for 5s (Press F)', icon: '⏰', rarity: 'legendary', apply: (p) => { p.hasTimeSlow = true; p.timeSlowAmount = 0.2; }},
            { id: 'infinity', name: 'INFINITE AMMO', desc: 'No fire rate cooldown for 3s on kill', icon: '♾️', rarity: 'legendary', apply: (p) => p.hasInfiniteAmmo = true },
            { id: 'reaper', name: 'REAPER', desc: 'Insta-kill enemies below 15% HP', icon: '💀', rarity: 'legendary', apply: (p) => p.hasReaper = true },
            { id: 'phoenix', name: 'PHOENIX', desc: 'Explode on death, revive full HP', icon: '🔥', rarity: 'legendary', apply: (p) => p.hasPhoenix = true },
            { id: 'double', name: 'DOUBLE DAMAGE', desc: '+100% Damage', icon: '⚔️', rarity: 'legendary', apply: (p) => p.damage *= 2 },
        ];

        // Calculate rarity chances based on wave
        const legendaryChance = Math.min(0.05 + wave * 0.01, 0.15);
        const epicChance = Math.min(0.10 + wave * 0.02, 0.25);
        const rareChance = Math.min(0.20 + wave * 0.02, 0.35);

        const allUpgrades = [];

        // Build weighted pool
        commonUpgrades.forEach(u => allUpgrades.push({ ...u, weight: 1 - legendaryChance - epicChance - rareChance }));
        rareUpgrades.forEach(u => allUpgrades.push({ ...u, weight: rareChance }));
        epicUpgrades.forEach(u => allUpgrades.push({ ...u, weight: epicChance }));
        legendaryUpgrades.forEach(u => allUpgrades.push({ ...u, weight: legendaryChance }));

        // Add weapon upgrades after wave 2
        if (wave >= 2) {
            const weaponKeys = Object.keys(WEAPONS).filter(w => w !== gs?.player?.currentWeapon);
            weaponKeys.forEach(key => {
                const weaponUpgrade = createWeaponUpgrade(key);
                // Assign rarity based on weapon power
                const powerfulWeapons = ['railgun', 'orbital_laser', 'swarm', 'cannon', 'beam'];
                const rareWeapons = ['lightning', 'plasma', 'sniper', 'tesla', 'harpoon'];
                let rarity = 'common';
                if (powerfulWeapons.includes(key)) rarity = 'epic';
                else if (rareWeapons.includes(key)) rarity = 'rare';
                allUpgrades.push({ ...weaponUpgrade, rarity, weight: rarity === 'epic' ? epicChance : rarity === 'rare' ? rareChance : 0.3 });
            });
        }

        // Add gear upgrades after wave 3
        if (wave >= 3) {
            const gearKeys = Object.keys(GEAR);
            gearKeys.forEach(key => {
                const gearUpgrade = createGearUpgrade(key);
                // Assign rarity based on gear type
                const legendaryGear = ['orbital', 'time_slow', 'second_wind'];
                const epicGear = ['chain_lightning', 'homing', 'teleport', 'gravity_well', 'overcharge'];
                const rareGear = ['drone', 'dash', 'shield_gen', 'fortress', 'executioner'];
                let rarity = 'common';
                if (legendaryGear.includes(key)) rarity = 'legendary';
                else if (epicGear.includes(key)) rarity = 'epic';
                else if (rareGear.includes(key)) rarity = 'rare';
                const weight = rarity === 'legendary' ? legendaryChance : rarity === 'epic' ? epicChance : rarity === 'rare' ? rareChance : 0.3;
                allUpgrades.push({ ...gearUpgrade, rarity, weight });
            });
        }

        // Weighted random selection
        const selectWeighted = (pool, count) => {
            const selected = [];
            const remaining = [...pool];

            for (let i = 0; i < count && remaining.length > 0; i++) {
                const totalWeight = remaining.reduce((sum, item) => sum + item.weight, 0);
                let random = Math.random() * totalWeight;

                for (let j = 0; j < remaining.length; j++) {
                    random -= remaining[j].weight;
                    if (random <= 0) {
                        selected.push(remaining[j]);
                        remaining.splice(j, 1);
                        break;
                    }
                }
            }

            return selected;
        };

        return selectWeighted(allUpgrades, 3);
    }, []);

    const applyUpgrade = useCallback((upgrade) => {
        const gs = gameStateRef.current;
        if (gs) {
            upgrade.apply(gs.player);
            sfxRef.current?.upgrade();
            setShowUpgrades(false);
            setIsPaused(false);
        }
    }, []);

    const handleReroll = useCallback(() => {
        if (rerolls > 0) {
            sfxRef.current?.menuSelect();
            setRerolls(prev => prev - 1);
            setAvailableUpgrades(generateUpgrades());
        }
    }, [rerolls, generateUpgrades]);

    const gameLoop = useCallback(() => {
        const gs = gameStateRef.current;
        if (!gs || isPaused) {
            animationRef.current = requestAnimationFrame(gameLoop);
            return;
        }

        const { ctx, canvas, player, bullets, enemies, particles, damageNumbers, keys, mouse } = gs;

        // Clear canvas
        ctx.fillStyle = '#0a0a0f';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Apply screen shake
        ctx.save();
        if (gs.screenShake.intensity > 0) {
            gs.screenShake.x = (Math.random() - 0.5) * gs.screenShake.intensity * 10;
            gs.screenShake.y = (Math.random() - 0.5) * gs.screenShake.intensity * 10;
            ctx.translate(gs.screenShake.x, gs.screenShake.y);
            gs.screenShake.intensity *= 0.9;
            if (gs.screenShake.intensity < 0.1) gs.screenShake.intensity = 0;
        }

        // Get current time once
        const now = Date.now();

        // Draw grid background
        ctx.strokeStyle = '#1a1a2e';
        ctx.lineWidth = 1;
        for (let x = 0; x < canvas.width; x += 50) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);
            ctx.stroke();
        }
        for (let y = 0; y < canvas.height; y += 50) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
            ctx.stroke();
        }

        // Player movement
        let dx = 0, dy = 0;
        if (keys['w'] || keys['arrowup']) dy -= 1;
        if (keys['s'] || keys['arrowdown']) dy += 1;
        if (keys['a'] || keys['arrowleft']) dx -= 1;
        if (keys['d'] || keys['arrowright']) dx += 1;
        
        // Sprint and stamina
        const isMoving = dx !== 0 || dy !== 0;
        const wantsSprint = keys.shift && isMoving;
        
        if (wantsSprint && player.stamina > 0) {
            player.isSprinting = true;
            player.stamina = Math.max(0, player.stamina - 0.5);
            player.lastStaminaUse = now;
        } else {
            player.isSprinting = false;
            if (now - player.lastStaminaUse > 1000) {
                player.stamina = Math.min(player.maxStamina, player.stamina + 0.3);
            }
        }
        
        // Dash handling
        if (keys.x && player.hasDash && !player.dashActive) {
            if (!player.lastDash || now - player.lastDash > 5000) {
                player.dashActive = true;
                player.dashEndTime = now + 2000;
                player.lastDash = now;
                createParticles(player.x, player.y, '#00ffff', 20, 8);
                sfxRef.current?.dash();
            }
        }
        
        if (player.dashActive && now < player.dashEndTime) {
            createParticles(player.x, player.y, '#00ffff', 2, 2);
        } else if (player.dashActive) {
            player.dashActive = false;
        }
        
        // Afterimage
        if (keys.v && player.hasAfterimage) {
            if (!player.lastAfterimage || now - player.lastAfterimage > 20000) {
                player.invisibleUntil = now + 10000;
                player.lastAfterimage = now;
                gs.decoy = { x: player.x, y: player.y, lifetime: 10000, spawnTime: now };
                createParticles(player.x, player.y, '#8844ff', 30, 8);
            }
        }
        
        // Teleport
        if (keys.t && player.hasTeleport) {
            if (!player.lastTeleport || now - player.lastTeleport > 8000) {
                createParticles(player.x, player.y, '#00ffff', 20, 10);
                player.x = mouse.x;
                player.y = mouse.y;
                createParticles(player.x, player.y, '#00ffff', 20, 10);
                player.lastTeleport = now;
                sfxRef.current?.dash();
            }
        }
        
        // Daze
        if (keys.c && player.hasDaze) {
            if (!player.lastDaze || now - player.lastDaze > 12000) {
                enemies.forEach(e => {
                    const dist = Math.hypot(e.x - player.x, e.y - player.y);
                    if (dist < 200) {
                        e.stunned = true;
                        e.stunEndTime = now + 3000;
                        createParticles(e.x, e.y, '#ffff00', 10, 5);
                    }
                });
                player.lastDaze = now;
                createParticles(player.x, player.y, '#ffff00', 40, 15);
                sfxRef.current?.upgrade();
            }
        }
        
        // Medicine
        if (keys.m && player.hasMedicine && player.medicineReady) {
            if (!player.lastMedicine || now - player.lastMedicine > 30000) {
                player.health = Math.min(player.maxHealth, player.health + 25);
                player.lastMedicine = now;
                player.medicineReady = false;
                setTimeout(() => { player.medicineReady = true; }, 30000);
                sfxRef.current?.healthPickup();
                createParticles(player.x, player.y, '#00ff00', 20, 8);
            }
        }

        // Time Slow (F key)
        if (keys.f && player.hasTimeSlow) {
            if (!player.lastTimeSlow || now - player.lastTimeSlow > 25000) {
                player.lastTimeSlow = now;
                gs.timeSlowUntil = now + 5000;
                createParticles(player.x, player.y, '#8888ff', 30, 15);
                sfxRef.current?.chronosphere();
            }
        }

        // Orbital Strike (G key)
        if (keys.g && player.hasOrbital) {
            if (!player.lastOrbital || now - player.lastOrbital > 30000) {
                player.lastOrbital = now;
                // Create orbital markers
                for (let i = 0; i < 5; i++) {
                    const ox = mouse.x + (Math.random() - 0.5) * 200;
                    const oy = mouse.y + (Math.random() - 0.5) * 200;
                    gs.orbitalStrikes = gs.orbitalStrikes || [];
                    gs.orbitalStrikes.push({ x: ox, y: oy, delay: i * 200, startTime: now });
                }
                sfxRef.current?.orbitalStrike();
            }
        }

        // Gravity Well (R key)
        if (keys.r && player.hasGravityWell) {
            if (!player.lastGravity || now - player.lastGravity > 15000) {
                player.lastGravity = now;
                gs.gravityWell = { x: mouse.x, y: mouse.y, endTime: now + 3000 };
                createParticles(mouse.x, mouse.y, '#8844ff', 30, 15);
                sfxRef.current?.gravityWell();
            }
        }

        // Shockwave (E key)
        if (keys.e && player.hasShockwave) {
            if (!player.lastShockwave || now - player.lastShockwave > 8000) {
                player.lastShockwave = now;
                enemies.forEach(e => {
                    const dist = Math.hypot(e.x - player.x, e.y - player.y);
                    if (dist < 250) {
                        const angle = Math.atan2(e.y - player.y, e.x - player.x);
                        const knockback = 200 * (1 - dist / 250);
                        e.x += Math.cos(angle) * knockback;
                        e.y += Math.sin(angle) * knockback;
                        e.health -= player.damage * 2;
                        e.hitFlash = 5;
                    }
                });
                createParticles(player.x, player.y, '#ffaa00', 50, 20);
                triggerScreenShake(0.8);
                sfxRef.current?.shockwave();
            }
        }

        // Overcharge (Q key)
        if (keys.q && player.hasOvercharge) {
            if (!player.lastOvercharge || now - player.lastOvercharge > 20000) {
                player.lastOvercharge = now;
                player.overchargeUntil = now + 5000;
                createParticles(player.x, player.y, '#ffff00', 40, 15);
                sfxRef.current?.upgrade();
            }
        }

        // Nitro Boost (N key)
        if (keys.n && player.hasNitro) {
            if (!player.lastNitro || now - player.lastNitro > 10000) {
                player.lastNitro = now;
                player.nitroUntil = now + 3000;
                createParticles(player.x, player.y, '#ff6600', 30, 12);
                sfxRef.current?.nitroBoost();
            }
        }
        const nitroActive = player.nitroUntil && now < player.nitroUntil;

        // Momentum - speed increases while moving
        if (player.hasMomentum) {
            if (dx !== 0 || dy !== 0) {
                player.momentumStacks = Math.min(50, (player.momentumStacks || 0) + 0.5);
            } else {
                player.momentumStacks = Math.max(0, (player.momentumStacks || 0) - 2);
            }
        }
        const momentumBonus = player.hasMomentum ? 1 + (player.momentumStacks || 0) / 100 : 1;

        // Quickstep - speed boost after kill
        const quickstepActive = player.hasQuickstep && player.quickstepUntil && now < player.quickstepUntil;
        const quickstepBonus = quickstepActive ? 1.5 : 1;

        // Slipstream - speed boost when near enemies
        let slipstreamBonus = 1;
        if (player.hasSlipstream) {
            enemies.forEach(e => {
                const dist = Math.hypot(e.x - player.x, e.y - player.y);
                if (dist < 100) {
                    slipstreamBonus = Math.max(slipstreamBonus, 1.3);
                }
            });
        }

        // Sprint mastery - infinite stamina
        if (player.infiniteSprint && player.isSprinting) {
            player.stamina = player.maxStamina;
        }

        // === CLASS PASSIVE EFFECTS ===
        // (isMoving already defined above)

        // Speedster: Afterburner trail
        if (player.classId === 'speedster' && player.afterburnerUntil && now < player.afterburnerUntil) {
            createParticles(player.x, player.y, '#ffaa00', 2, 4);
            // Damage enemies in trail
            enemies.forEach(e => {
                const d = Math.hypot(e.x - player.x, e.y - player.y);
                if (d < 40) {
                    e.health -= player.damage * 0.1;
                    e.hitFlash = 2;
                }
            });
        }

        // Runner: damage modifier based on movement
        let runnerDamageMultiplier = 1;
        if (player.classId === 'runner') {
            runnerDamageMultiplier = isMoving ? 1.3 : 0.5;
        }

        // Ghost: phase through enemies while moving
        if (player.classId === 'ghost') {
            player.ghostPhasing = isMoving;
        }

        // Ninja: invisible when not shooting recently
        if (player.classId === 'ninja') {
            if (now - player.lastShot > 1000) {
                player.ninjaInvisible = true;
            } else {
                player.ninjaInvisible = false;
            }
        }

        // Berserker: stacking damage on kills (handled in kill section)
        // Reset stacks when taking damage (handled in damage section)

        // Titan: grow stronger each wave
        if (player.classId === 'titan' && gs.wave > player.titanBonusWave) {
            player.titanBonusWave = gs.wave;
            const waveBonus = gs.wave - 1;
            player.damage = player.baseDamage * (1 + waveBonus * 0.01);
            player.speed = player.baseSpeed * (1 + waveBonus * 0.01);
            player.maxHealth += 5;
            player.health = Math.min(player.health + 5, player.maxHealth);
        }

        // Lucky: random effects
        if (player.classId === 'lucky' && Math.random() < 0.001) {
            // Small chance for random buff each frame
            const effects = ['heal', 'speed', 'damage'];
            const effect = effects[Math.floor(Math.random() * effects.length)];
            if (effect === 'heal') player.health = Math.min(player.maxHealth, player.health + 5);
            if (effect === 'speed') player.quickstepUntil = now + 2000;
        }

        // Fortress: shield regen
        if (player.classId === 'fortress' && player.shield < player.maxShield) {
            player.shield = Math.min(player.maxShield, player.shield + 0.05);
        }

        // Glass Cannon: overload damage boost
        const overloadBonus = (player.classId === 'glass_cannon' && player.overloadUntil && now < player.overloadUntil) ? 2 : 1;

        // Calculate final speed multiplier
        const afterburnerBonus = (player.afterburnerUntil && now < player.afterburnerUntil) ? 2 : 1;
        const speedMultiplier = (player.dashActive ? 4 : (player.isSprinting ? 1.5 : 1))
            * momentumBonus * quickstepBonus * slipstreamBonus * (nitroActive ? 2 : 1) * afterburnerBonus;

        if (dx !== 0 || dy !== 0) {
            const len = Math.sqrt(dx * dx + dy * dy);
            dx /= len; dy /= len;
            player.x += dx * player.speed * speedMultiplier;
            player.y += dy * player.speed * speedMultiplier;

            // Create trail effect when moving fast
            if (speedMultiplier > 1.5 || nitroActive) {
                createParticles(player.x, player.y, nitroActive ? '#ff6600' : '#00ffff', 1, 2);
            }
        }
        
        // Keep player in bounds
        player.x = Math.max(PLAYER_SIZE, Math.min(canvas.width - PLAYER_SIZE, player.x));
        player.y = Math.max(PLAYER_SIZE, Math.min(canvas.height - PLAYER_SIZE, player.y));

        // Player regeneration
        if (player.regen > 0) {
            if (now - player.lastRegen > 1000) {
                player.health = Math.min(player.maxHealth, player.health + player.regen);
                player.lastRegen = now;
            }
        }

        // Overheal decay
        if (player.overheal > 0) {
            const decayTime = now - player.overhealDecayStart;
            if (decayTime < 30000) {
                player.overheal = 200 * (1 - decayTime / 30000);
            } else {
                player.overheal = 0;
            }
        }

        // Shield regeneration
        if (player.shieldRegen > 0 && player.maxShield > 0) {
            if (!player.lastShieldHit || now - player.lastShieldHit > 2000) {
                if (!player.lastShieldRegen || now - player.lastShieldRegen > 1000) {
                    player.lastShieldRegen = now;
                    player.shield = Math.min(player.maxShield, player.shield + player.shieldRegen);
                }
            }
        }

        // Time slow effect
        const timeSlowActive = gs.timeSlowUntil && now < gs.timeSlowUntil;
        const timeMultiplier = timeSlowActive ? 0.5 : 1;

        // Overcharge active
        const overchargeActive = player.overchargeUntil && now < player.overchargeUntil;

        // Process orbital strikes
        if (gs.orbitalStrikes) {
            for (let i = gs.orbitalStrikes.length - 1; i >= 0; i--) {
                const strike = gs.orbitalStrikes[i];
                if (now - strike.startTime > strike.delay) {
                    // Create explosion
                    createParticles(strike.x, strike.y, '#ff4400', 30, 15);
                    triggerScreenShake(0.5);

                    // Damage enemies
                    enemies.forEach(e => {
                        const dist = Math.hypot(e.x - strike.x, e.y - strike.y);
                        if (dist < 100) {
                            e.health -= player.damage * 5;
                            e.hitFlash = 5;
                            createDamageNumber(e.x, e.y - e.size, player.damage * 5, true);
                        }
                    });

                    gs.orbitalStrikes.splice(i, 1);
                }
            }
        }

        // Process gravity well
        if (gs.gravityWell && now < gs.gravityWell.endTime) {
            const gw = gs.gravityWell;
            enemies.forEach(e => {
                const dist = Math.hypot(e.x - gw.x, e.y - gw.y);
                if (dist < 300 && dist > 20) {
                    const angle = Math.atan2(gw.y - e.y, gw.x - e.x);
                    const pullStrength = 3 * (1 - dist / 300);
                    e.x += Math.cos(angle) * pullStrength;
                    e.y += Math.sin(angle) * pullStrength;
                }
            });
            // Draw gravity well
            ctx.globalAlpha = 0.3;
            ctx.fillStyle = '#8844ff';
            ctx.beginPath();
            ctx.arc(gw.x, gw.y, 300 * (1 - (now - (gw.endTime - 3000)) / 3000), 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1;
        }

        // Update drones
        if (player.droneCount > 0) {
            gs.drones = gs.drones || [];
            while (gs.drones.length < player.droneCount) {
                gs.drones.push({ angle: Math.random() * Math.PI * 2, lastShot: 0 });
            }

            gs.drones.forEach((drone, idx) => {
                drone.angle += 0.03;
                const droneX = player.x + Math.cos(drone.angle) * 60;
                const droneY = player.y + Math.sin(drone.angle) * 60;

                // Draw drone
                ctx.fillStyle = '#00ffff';
                ctx.shadowColor = '#00ffff';
                ctx.shadowBlur = 10;
                ctx.beginPath();
                ctx.arc(droneX, droneY, 8, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;

                // Drone shoots
                if (now - drone.lastShot > 500) {
                    // Find nearest enemy
                    let nearest = null;
                    let nearestDist = 300;
                    enemies.forEach(e => {
                        const dist = Math.hypot(e.x - droneX, e.y - droneY);
                        if (dist < nearestDist) {
                            nearest = e;
                            nearestDist = dist;
                        }
                    });

                    if (nearest) {
                        drone.lastShot = now;
                        const angle = Math.atan2(nearest.y - droneY, nearest.x - droneX);
                        bullets.push({
                            x: droneX,
                            y: droneY,
                            vx: Math.cos(angle) * 12,
                            vy: Math.sin(angle) * 12,
                            damage: player.damage * 0.3,
                            piercing: 0,
                            color: '#00ffff',
                            size: 5
                        });
                        sfxRef.current?.droneShoot();
                    }
                }
            });
        }

        // Check invulnerability and invisibility
        if (player.invulnerable && now > player.invulnerableUntil) {
            player.invulnerable = false;
        }
        const isInvisible = now < player.invisibleUntil;

        // Auto-fire
        const weaponFireRate = noWeaponCooldown ? 0 : player.fireRate * (WEAPONS[player.currentWeapon]?.fireRate || 1);
        if (mouse.down && now - player.lastShot > weaponFireRate) {
            player.lastShot = now;

            // Weapon-specific sounds
            if (player.currentWeapon === 'flamethrower') {
                sfxRef.current?.shootFlamethrower();
            } else if (player.currentWeapon === 'sniper') {
                sfxRef.current?.shootSniper();
            } else if (player.currentWeapon === 'lightning') {
                sfxRef.current?.shootLightning();
            } else if (player.currentWeapon === 'grenade') {
                sfxRef.current?.shootGrenade();
            }

            // Use weapon system
            shootWeapon(player.currentWeapon, player, mouse.x, mouse.y, shootBullet, createMeleeAttack);
        }

        // Spawn enemies
        if (!gs.waveComplete && gs.enemiesSpawned < gs.enemiesThisWave) {
            gs.spawnTimer++;
            const spawnRate = Math.max(30, 60 - gs.wave * 2);
            if (gs.spawnTimer >= spawnRate) {
                gs.spawnTimer = 0;
                // Play boss spawn sound on boss waves
                if (gs.wave % 5 === 0 && gs.enemiesSpawned === 0) {
                    sfxRef.current?.bossSpawn();
                    triggerScreenShake(0.8);
                }
                spawnEnemy();
                gs.enemiesSpawned++;
            }
        }

        // Check wave complete
        if (gs.enemiesSpawned >= gs.enemiesThisWave && enemies.length === 0 && !gs.waveComplete) {
            gs.waveComplete = true;
            sfxRef.current?.waveComplete();
            triggerScreenShake(0.5);

            // Show upgrades
            setTimeout(() => {
                setAvailableUpgrades(generateUpgrades());
                setShowUpgrades(true);
                setIsPaused(true);

                // Bonus reroll every 5 waves
                if (gs.wave % 5 === 0) {
                    setRerolls(prev => Math.min(prev + 1, maxRerolls + 2));
                }

                // Start next wave
                gs.wave++;
                gs.difficultyMultiplier = 1 + (gs.wave - 1) * 0.15;
                gs.enemiesThisWave = Math.floor(5 + gs.wave * 2 + Math.pow(gs.wave, 1.3));
                gs.enemiesSpawned = 0;
                gs.waveComplete = false;
            }, 1000);
        }

        // Update and draw bullets
        for (let i = bullets.length - 1; i >= 0; i--) {
            const b = bullets[i];

            // Grenade bouncing
            if (b.grenade) {
                b.x += b.vx;
                b.y += b.vy;
                b.vy += 0.3; // Gravity

                // Bounce off edges
                if ((b.x < 10 || b.x > canvas.width - 10) && b.bounces > 0) {
                    b.vx *= -0.7;
                    b.bounces--;
                    b.x = Math.max(10, Math.min(canvas.width - 10, b.x));
                }
                if ((b.y < 10 || b.y > canvas.height - 10) && b.bounces > 0) {
                    b.vy *= -0.7;
                    b.bounces--;
                    b.y = Math.max(10, Math.min(canvas.height - 10, b.y));
                }

                // Explode after fuse time
                if (now - b.spawnTime > b.fuseTime) {
                    createParticles(b.x, b.y, '#ff8800', 30, 12);
                    triggerScreenShake(0.4);

                    // Damage enemies in radius
                    enemies.forEach(e => {
                        const dist = Math.hypot(e.x - b.x, e.y - b.y);
                        if (dist < 100) {
                            const dmg = b.damage * (1 - dist / 100);
                            e.health -= dmg;
                            e.hitFlash = 5;
                            createDamageNumber(e.x, e.y - e.size, dmg, false);
                        }
                    });

                    bullets.splice(i, 1);
                    continue;
                }
            } else if (b.isMortar) {
                // Mortar bullet arcing movement
                b.mortarProgress += 0.02;
                if (b.mortarProgress >= 1) {
                    // Mortar lands - create explosion
                    createParticles(b.targetX, b.targetY, '#88ffcc', 20, 10);
                    triggerScreenShake(0.5);
                    sfxRef.current?.explosion();

                    // Damage player if in range
                    const mortarRadius = 70;
                    const distToPlayer = Math.hypot(player.x - b.targetX, player.y - b.targetY);
                    if (distToPlayer < mortarRadius && !player.invulnerable) {
                        let mortarDamage = b.damage * 1.5;
                        if (player.classId === 'bruiser') mortarDamage *= 0.5;
                        if (player.shield > 0) {
                            const absorbed = Math.min(player.shield, mortarDamage);
                            player.shield -= absorbed;
                            mortarDamage -= absorbed;
                        }
                        player.health -= mortarDamage;
                        createDamageNumber(player.x, player.y - PLAYER_SIZE, mortarDamage, false);
                    }
                    bullets.splice(i, 1);
                    continue;
                }
                // Arc trajectory
                const arcHeight = 100;
                const progress = b.mortarProgress;
                b.x = b.startX + (b.targetX - b.startX) * progress;
                b.y = b.startY + (b.targetY - b.startY) * progress - Math.sin(progress * Math.PI) * arcHeight;
            } else {
                // Homing bullets curve toward enemies
                if (player.hasHoming && !b.isEnemy) {
                    let nearest = null;
                    let nearestDist = 200;
                    enemies.forEach(e => {
                        const dist = Math.hypot(e.x - b.x, e.y - b.y);
                        if (dist < nearestDist) {
                            nearest = e;
                            nearestDist = dist;
                        }
                    });
                    if (nearest) {
                        const targetAngle = Math.atan2(nearest.y - b.y, nearest.x - b.x);
                        const currentAngle = Math.atan2(b.vy, b.vx);
                        let angleDiff = targetAngle - currentAngle;
                        // Normalize angle difference
                        while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
                        while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
                        const turnSpeed = 0.1;
                        const newAngle = currentAngle + angleDiff * turnSpeed;
                        const speed = Math.hypot(b.vx, b.vy);
                        b.vx = Math.cos(newAngle) * speed;
                        b.vy = Math.sin(newAngle) * speed;
                    }
                }
                b.x += b.vx;
                b.y += b.vy;

                // Create bullet trail for fast/special bullets
                if (!b.isEnemy && (b.sniper || b.lightning || b.railgun || b.beam || Math.hypot(b.vx, b.vy) > 20)) {
                    createBulletTrail(b.x, b.y, b.color || '#00ffff', b.size * 0.6);
                }
            }

            // Lifetime bullets (flame, cloud)
            if (b.flame || b.isCloud) {
                b.lifetime = (b.lifetime || 180) - 1;
                if (b.lifetime <= 0) {
                    bullets.splice(i, 1);
                    continue;
                }
                // Flame slows down
                if (b.flame) {
                    b.vx *= 0.96;
                    b.vy *= 0.96;
                }
            }

            // Check bounds (skip for mortar bullets)
            if (!b.isMortar && (b.x < -50 || b.x > canvas.width + 50 || b.y < -50 || b.y > canvas.height + 50)) {
                bullets.splice(i, 1);
                continue;
            }

            // Draw mortar landing indicator
            if (b.isMortar) {
                ctx.globalAlpha = 0.3 + b.mortarProgress * 0.4;
                ctx.strokeStyle = '#ff4444';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(b.targetX, b.targetY, 70, 0, Math.PI * 2);
                ctx.stroke();
                ctx.globalAlpha = 1;
            }

            // Draw bullet
            const bulletColor = b.color || (b.isEnemy ? '#ff0066' : '#00ffff');
            ctx.fillStyle = bulletColor;
            ctx.shadowColor = bulletColor;
            ctx.shadowBlur = b.flame ? 25 : (b.isCloud ? 20 : (b.sniper ? 20 : (b.lightning ? 30 : (b.railgun ? 35 : (b.beam ? 25 : 12)))));
            ctx.globalAlpha = b.flame ? 0.8 : (b.isCloud ? 0.6 : 1);

            if (b.isCloud) {
                // Draw cloud as multiple overlapping circles
                ctx.globalAlpha = 0.4;
                for (let j = 0; j < 5; j++) {
                    const angle = (Math.PI * 2 / 5) * j;
                    const cloudX = b.x + Math.cos(angle) * (b.size * 0.5);
                    const cloudY = b.y + Math.sin(angle) * (b.size * 0.5);
                    ctx.beginPath();
                    ctx.arc(cloudX, cloudY, b.size * 0.8, 0, Math.PI * 2);
                    ctx.fill();
                }
                ctx.beginPath();
                ctx.arc(b.x, b.y, b.size, 0, Math.PI * 2);
                ctx.fill();
                ctx.globalAlpha = 1;
            } else if (b.grenade) {
                // Draw grenade as rotating square with glow
                const rotation = (now - b.spawnTime) * 0.01;
                ctx.save();
                ctx.translate(b.x, b.y);
                ctx.rotate(rotation);
                ctx.fillRect(-b.size, -b.size, b.size * 2, b.size * 2);
                // Inner highlight
                ctx.fillStyle = '#ffffff';
                ctx.globalAlpha = 0.5;
                ctx.fillRect(-b.size * 0.5, -b.size * 0.5, b.size, b.size);
                ctx.restore();
            } else if (b.sniper || b.railgun) {
                // Draw sniper/railgun bullet as elongated tracer with trail
                ctx.save();
                ctx.translate(b.x, b.y);
                const angle = Math.atan2(b.vy, b.vx);
                ctx.rotate(angle);
                // Trail glow
                const trailLength = b.railgun ? 40 : 25;
                const gradient = ctx.createLinearGradient(-trailLength, 0, trailLength, 0);
                gradient.addColorStop(0, 'rgba(255,255,255,0)');
                gradient.addColorStop(0.5, bulletColor);
                gradient.addColorStop(1, bulletColor);
                ctx.fillStyle = gradient;
                ctx.fillRect(-trailLength, -3, trailLength * 2, 6);
                // Core
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, -2, 10, 4);
                ctx.restore();
            } else if (b.lightning) {
                // Draw lightning as sparking circle with electric arcs
                ctx.beginPath();
                ctx.arc(b.x, b.y, b.size, 0, Math.PI * 2);
                ctx.fill();
                // Electric arcs
                ctx.strokeStyle = bulletColor;
                ctx.lineWidth = 2;
                for (let j = 0; j < 4; j++) {
                    const startAngle = Math.random() * Math.PI * 2;
                    const dist = b.size + Math.random() * 15;
                    ctx.beginPath();
                    ctx.moveTo(b.x, b.y);
                    // Jagged line
                    let px = b.x, py = b.y;
                    for (let k = 0; k < 3; k++) {
                        const t = (k + 1) / 3;
                        const nx = b.x + Math.cos(startAngle) * dist * t + (Math.random() - 0.5) * 8;
                        const ny = b.y + Math.sin(startAngle) * dist * t + (Math.random() - 0.5) * 8;
                        ctx.lineTo(nx, ny);
                        px = nx; py = ny;
                    }
                    ctx.stroke();
                }
            } else if (b.beam) {
                // Beam weapon - bright line
                ctx.save();
                ctx.translate(b.x, b.y);
                ctx.rotate(Math.atan2(b.vy, b.vx));
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(-20, -2, 40, 4);
                ctx.fillStyle = bulletColor;
                ctx.fillRect(-25, -4, 50, 8);
                ctx.restore();
            } else if (b.flame) {
                // Flame with flickering effect
                ctx.globalAlpha = 0.6 + Math.random() * 0.3;
                const flameSize = b.size * (0.8 + Math.random() * 0.4);
                ctx.beginPath();
                ctx.arc(b.x, b.y, flameSize, 0, Math.PI * 2);
                ctx.fill();
                // Inner bright core
                ctx.fillStyle = '#ffff00';
                ctx.globalAlpha = 0.4;
                ctx.beginPath();
                ctx.arc(b.x, b.y, flameSize * 0.5, 0, Math.PI * 2);
                ctx.fill();
            } else if (b.homing) {
                // Homing missile with fins
                ctx.save();
                ctx.translate(b.x, b.y);
                ctx.rotate(Math.atan2(b.vy, b.vx));
                // Body
                ctx.fillRect(-6, -3, 12, 6);
                // Fins
                ctx.fillStyle = '#ff6666';
                ctx.beginPath();
                ctx.moveTo(-6, -3);
                ctx.lineTo(-10, -6);
                ctx.lineTo(-6, 0);
                ctx.fill();
                ctx.beginPath();
                ctx.moveTo(-6, 3);
                ctx.lineTo(-10, 6);
                ctx.lineTo(-6, 0);
                ctx.fill();
                // Exhaust
                ctx.fillStyle = '#ffaa00';
                ctx.globalAlpha = 0.7;
                ctx.fillRect(-12, -2, 6, 4);
                ctx.restore();
            } else if (b.acid || b.cryo) {
                // Acid/Cryo blob with dripping effect
                ctx.beginPath();
                ctx.arc(b.x, b.y, b.size, 0, Math.PI * 2);
                ctx.fill();
                // Drip
                ctx.beginPath();
                ctx.arc(b.x + b.vx * 0.3, b.y + b.vy * 0.3 + b.size * 0.5, b.size * 0.4, 0, Math.PI * 2);
                ctx.fill();
            } else {
                // Default bullet with core highlight
                ctx.beginPath();
                ctx.arc(b.x, b.y, b.size, 0, Math.PI * 2);
                ctx.fill();
                // Bright core
                ctx.fillStyle = '#ffffff';
                ctx.globalAlpha = 0.6;
                ctx.beginPath();
                ctx.arc(b.x, b.y, b.size * 0.4, 0, Math.PI * 2);
                ctx.fill();
            }

            ctx.shadowBlur = 0;
            ctx.globalAlpha = 1;

            // Collision detection (skip mortar bullets - they handle damage on landing)
            if (b.isEnemy && !b.isMortar) {
                // Hit player
                const dist = Math.hypot(player.x - b.x, player.y - b.y);
                if (dist < PLAYER_SIZE + b.size && !player.invulnerable) {
                    // Evasion check (blur adds +20% while moving)
                    const blurBonus = (player.hasBlur && (gs.keys.w || gs.keys.a || gs.keys.s || gs.keys.d)) ? 0.2 : 0;
                    const totalEvasion = (player.evasionChance || 0) + blurBonus;
                    if (totalEvasion > 0 && Math.random() < totalEvasion) {
                        createParticles(player.x, player.y, '#ffffff', 5, 6);
                        if (!b.isCloud) bullets.splice(i, 1);
                        continue; // Dodged!
                    }

                    let damage = b.damage;

                    // Fortress: damage reduction
                    if (player.damageReduction > 0) {
                        damage *= (1 - player.damageReduction);
                    }

                    if (player.shield > 0) {
                        const absorbed = Math.min(player.shield, damage);
                        player.shield -= absorbed;
                        damage -= absorbed;
                        if (absorbed > 0) {
                            sfxRef.current?.shieldHit();
                            if (player.shield <= 0) sfxRef.current?.shieldBreak();
                        }
                    }

                    // Absorb shield: convert damage to shield
                    if (player.damageToShield > 0 && damage > 0) {
                        player.shield = Math.min((player.maxShield || 50), player.shield + damage * player.damageToShield);
                    }

                    // Reflective Shield: reflect 20% damage back to nearest enemy
                    if (player.hasReflectiveShield && damage > 0) {
                        const reflectDamage = damage * 0.2;
                        let nearestEnemy = null;
                        let nearestDist = 300; // Max reflect range
                        enemies.forEach(en => {
                            const d = Math.hypot(en.x - player.x, en.y - player.y);
                            if (d < nearestDist) {
                                nearestDist = d;
                                nearestEnemy = en;
                            }
                        });
                        if (nearestEnemy) {
                            nearestEnemy.health -= reflectDamage;
                            nearestEnemy.hitFlash = 5;
                            createParticles(nearestEnemy.x, nearestEnemy.y, '#4488ff', 8, 5);
                            createDamageNumber(nearestEnemy.x, nearestEnemy.y - nearestEnemy.size, reflectDamage, false);
                        }
                    }

                    player.health -= damage;
                    if (damage > 0) {
                        sfxRef.current?.hit();
                        // Berserker: reset stacks on taking damage
                        if (player.classId === 'berserker') {
                            player.berserkerStacks = 0;
                            player.speed = player.baseSpeed;
                        }
                    }
                    triggerScreenShake(0.3);
                    createParticles(player.x, player.y, '#ff0000', 8, 4);
                    createDamageNumber(player.x, player.y - PLAYER_SIZE, damage, false);

                    // Cloud bullets don't get removed (DOT effect)
                    if (!b.isCloud) {
                        bullets.splice(i, 1);
                    }

                    if (player.health <= 0) {
                        // Second Wind: revive once
                        if (player.hasSecondWind && !player.usedSecondWind) {
                            player.usedSecondWind = true;
                            player.health = player.maxHealth * 0.5;
                            player.invulnerable = true;
                            player.invulnerableUntil = now + 2000;
                            createParticles(player.x, player.y, '#00ff00', 30, 10);
                            sfxRef.current?.powerup();
                        } else {
                            setFinalStats({
                                wave: gs.wave,
                                score: gs.score,
                                kills: gs.totalKills,
                                time: Math.floor((Date.now() - gs.startTime) / 1000)
                            });
                            sfxRef.current?.death();
                            setGameOver(true);
                        }
                    }
                }
            } else {
                // Hit enemies
                for (let j = enemies.length - 1; j >= 0; j--) {
                    const e = enemies[j];
                    const dist = Math.hypot(e.x - b.x, e.y - b.y);
                    if (dist < e.size + b.size) {
                        const isCrit = Math.random() < player.critChance;
                        let damage = b.damage * (isCrit ? player.critMultiplier : 1);

                        // Berserker upgrade: +50% damage when below 50% HP
                        if (player.hasBerserker && player.health < player.maxHealth * 0.5) {
                            damage *= 1.5;
                        }

                        // Executioner: +100% damage to enemies below 25% HP
                        if (player.hasExecutioner && e.health < e.maxHealth * 0.25) {
                            damage *= 2;
                        }

                        // Armor Pierce: +30% damage to tanky enemies
                        if (player.hasArmorPierce && e.maxHealth >= 60) {
                            damage *= 1.3;
                        }

                        // Overcharge: 3x damage
                        if (overchargeActive) {
                            damage *= 3;
                        }

                        // === CLASS DAMAGE MODIFIERS ===
                        // Runner: +30% while moving, -50% while still
                        if (player.classId === 'runner') {
                            const isMoving = gs.keys.w || gs.keys.a || gs.keys.s || gs.keys.d;
                            damage *= isMoving ? 1.3 : 0.5;
                        }

                        // Berserker class: kill stacks
                        if (player.classId === 'berserker' && player.berserkerStacks > 0) {
                            damage *= 1 + (player.berserkerStacks * 0.05);
                        }

                        // Glass Cannon: overload bonus
                        if (player.classId === 'glass_cannon' && player.overloadUntil && now < player.overloadUntil) {
                            damage *= 2;
                        }

                        // Gambler: random damage 50%-300%, all-in doubles
                        if (player.classId === 'gambler') {
                            damage *= 0.5 + Math.random() * 2.5;
                            if (player.gamblerAllIn && player.gamblerAllInShots > 0) {
                                if (Math.random() > 0.5) {
                                    damage *= 2;
                                } else {
                                    damage = 0;
                                }
                                player.gamblerAllInShots--;
                            }
                        }

                        // Lucky: 30% chance for double damage
                        if (player.classId === 'lucky' && Math.random() < 0.3) {
                            damage *= 2;
                            createParticles(e.x, e.y, '#44ff44', 5, 4);
                        }

                        // Rogue: +50% to slowed/frozen enemies, cheap shot 3x
                        if (player.classId === 'rogue') {
                            if (e.frozen || e.slowed) damage *= 1.5;
                            if (player.cheapShot) {
                                damage *= 3;
                                e.stunned = true;
                                e.stunEndTime = now + 1500;
                                player.cheapShot = false;
                            }
                            // Attacks apply slow
                            e.slowed = true;
                            e.slowedEnd = now + 1000;
                            if (!e.originalSpeed) e.originalSpeed = e.speed;
                            e.speed = e.originalSpeed * 0.7;
                        }

                        // Sniper: focus shot 5x + pierce
                        if (player.classId === 'sniper' && player.focusShot) {
                            damage *= 5;
                            b.piercing = 999;
                            player.focusShot = false;
                        }

                        // Elemental: random status effect
                        if (player.classId === 'elemental') {
                            const elementType = Math.floor(Math.random() * 3);
                            if (elementType === 0 && !e.burning) {
                                e.burning = true;
                                e.burnDamage = player.damage * 0.3;
                                e.burnEnd = now + 3000;
                            } else if (elementType === 1 && !e.frozen) {
                                e.frozen = true;
                                e.frozenEnd = now + 2000;
                                if (!e.originalSpeed) e.originalSpeed = e.speed;
                                e.speed *= 0.5;
                            } else if (elementType === 2) {
                                // Lightning - chain to nearby
                                enemies.forEach(other => {
                                    if (other !== e) {
                                        const d = Math.hypot(other.x - e.x, other.y - e.y);
                                        if (d < 100) {
                                            other.health -= damage * 0.3;
                                            other.hitFlash = 3;
                                        }
                                    }
                                });
                            }
                        }

                        // Pyromaniac: always burn
                        if (player.classId === 'pyromaniac' && !e.burning) {
                            e.burning = true;
                            e.burnDamage = player.damage * 0.5;
                            e.burnEnd = now + 4000;
                        }

                        e.health -= damage;
                        e.hitFlash = 5;

                        // Poison rounds: DOT effect
                        if (player.hasPoisonRounds && !e.poisoned) {
                            e.poisoned = true;
                            e.poisonDamage = 3;
                            e.poisonEnd = now + 3000;
                            sfxRef.current?.poison();
                        }

                        // Freeze rounds: slow effect
                        if (player.hasFreezeRounds && !e.frozen) {
                            e.frozen = true;
                            e.frozenEnd = now + 2000;
                            e.originalSpeed = e.speed;
                            e.speed *= 0.5;
                            createParticles(e.x, e.y, '#88ddff', 8, 4);
                            sfxRef.current?.freeze();
                        }

                        // Striker speeds up when hurt
                        if (e.speedsWhenHurt) {
                            e.speed = Math.min(e.baseSpeed * 2, e.speed * 1.15);
                            createParticles(e.x, e.y, '#ff8888', 3, 4);
                        }

                        // Volatile explodes when hit
                        if (e.explodesOnHit && !e.hasExploded) {
                            e.hasExploded = true;
                            const volatileRadius = 60;
                            createParticles(e.x, e.y, '#ffcc00', 20, 10);
                            triggerScreenShake(0.4);
                            sfxRef.current?.explosionSmall();

                            // Damage player if in range
                            const distToPlayer = Math.hypot(player.x - e.x, player.y - e.y);
                            if (distToPlayer < volatileRadius && !player.invulnerable) {
                                let volatileDamage = e.damage;
                                if (player.classId === 'bruiser') volatileDamage *= 0.5;
                                if (player.shield > 0) {
                                    const absorbed = Math.min(player.shield, volatileDamage);
                                    player.shield -= absorbed;
                                    volatileDamage -= absorbed;
                                }
                                player.health -= volatileDamage;
                                createDamageNumber(player.x, player.y - PLAYER_SIZE, volatileDamage, false);
                            }
                            // Kill the volatile enemy
                            e.health = 0;
                        }

                        createDamageNumber(e.x, e.y - e.size, damage, isCrit);
                        // Impact sparks in direction of bullet travel
                        const impactAngle = Math.atan2(b.vy, b.vx) + Math.PI;
                        createImpactSparks(b.x, b.y, impactAngle, e.color);
                        if (isCrit) {
                            sfxRef.current?.criticalHit();
                            // Extra flash for crits
                            createParticles(e.x, e.y, '#ffff00', 8, 6, 'spark');
                        } else {
                            sfxRef.current?.enemyHit();
                        }
                        
                        // Lightning chain effect
                        if (b.lightning && b.chains > 0) {
                            let nearest = null;
                            let nearestDist = 999999;
                            enemies.forEach(other => {
                                if (other !== e && !other.lightningHit) {
                                    const d = Math.hypot(other.x - e.x, other.y - e.y);
                                    if (d < nearestDist && d < b.chainRange) {
                                        nearest = other;
                                        nearestDist = d;
                                    }
                                }
                            });

                            if (nearest) {
                                // Draw lightning arc
                                ctx.strokeStyle = '#00ffff';
                                ctx.lineWidth = 3;
                                ctx.shadowColor = '#00ffff';
                                ctx.shadowBlur = 20;
                                ctx.beginPath();
                                ctx.moveTo(e.x, e.y);
                                ctx.lineTo(nearest.x, nearest.y);
                                ctx.stroke();
                                ctx.shadowBlur = 0;

                                // Damage chained enemy
                                nearest.health -= damage * 0.5;
                                nearest.hitFlash = 5;
                                nearest.lightningHit = true;
                                createDamageNumber(nearest.x, nearest.y - nearest.size, damage * 0.5, false);
                                b.chains--;
                            }
                        }

                        // Flame DOT effect
                        if (b.flame && !e.burning) {
                            e.burning = true;
                            e.burnDamage = b.damage * 0.5;
                            e.burnEnd = now + 2000;
                        }

                        // Lifesteal
                        if (player.lifesteal > 0) {
                            player.health = Math.min(player.maxHealth, player.health + damage * player.lifesteal);
                        }

                        // Clear lightning hit flag
                        e.lightningHit = false;

                        // Explosive rounds or explosive weapons
                        if (player.explosiveRounds || b.explosive) {
                            const radius = b.explosionRadius || 60;
                            createParticles(b.x, b.y, '#ff8800', 15, 8);
                            triggerScreenShake(b.explosionRadius ? 0.4 : 0.2);
                            // Damage nearby enemies (ironclad resists explosions)
                            enemies.forEach(other => {
                                if (other !== e) {
                                    const d = Math.hypot(other.x - b.x, other.y - b.y);
                                    if (d < radius) {
                                        let explosionDamage = damage * (b.explosionRadius ? 0.7 : 0.5);
                                        if (other.explosionResist) explosionDamage *= 0.3; // Ironclad takes 70% less explosion damage
                                        other.health -= explosionDamage;
                                        other.hitFlash = 5;
                                        createDamageNumber(other.x, other.y - other.size, explosionDamage, false);
                                    }
                                }
                            });
                        }

                        if (e.health <= 0) {
                            // Score multiplier upgrade
                            const scoreMultiplier = player.scoreMultiplier || 1;
                            gs.score += e.points * (1 + gs.combo * 0.1) * scoreMultiplier;
                            gs.kills++;
                            gs.totalKills++;
                            gs.combo++;
                            gs.comboTimer = 120;
                            // Play different sounds for boss vs regular kills
                            if (e.type === 'boss') {
                                sfxRef.current?.killBoss();
                            } else {
                                sfxRef.current?.kill();
                            }
                            triggerScreenShake(e.type === 'boss' ? 1 : 0.15);
                            // Enhanced death explosion
                            createDeathExplosion(e.x, e.y, e.color, e.size, e.type === 'boss');

                            // Adrenaline: heal on kill
                            if (player.adrenalineHeal > 0) {
                                player.health = Math.min(player.maxHealth, player.health + player.adrenalineHeal);
                            }

                            // === CLASS KILL BONUSES ===
                            // Berserker: stack damage on kills (max 20 stacks = +100%)
                            if (player.classId === 'berserker') {
                                player.berserkerStacks = Math.min(20, (player.berserkerStacks || 0) + 1);
                                player.speed = player.baseSpeed * (1 + player.berserkerStacks * 0.02);
                            }

                            // Vampire: heal on kill
                            if (player.classId === 'vampire') {
                                player.health = Math.min(player.maxHealth, player.health + 5);
                            }

                            // Paladin: heal nearby (self)
                            if (player.classId === 'paladin') {
                                player.health = Math.min(player.maxHealth, player.health + 3);
                            }

                            // Necromancer: track recent kills
                            if (player.classId === 'necromancer') {
                                gs.recentKills = gs.recentKills || [];
                                gs.recentKills.push({ x: e.x, y: e.y, health: e.maxHealth });
                                if (gs.recentKills.length > 10) gs.recentKills.shift();
                            }

                            // Chain lightning on kill
                            if (player.hasChainLightning) {
                                let chainedAny = false;
                                enemies.forEach(other => {
                                    if (other !== e) {
                                        const d = Math.hypot(other.x - e.x, other.y - e.y);
                                        if (d < 150) {
                                            other.health -= player.damage * 0.5;
                                            other.hitFlash = 5;
                                            createParticles(other.x, other.y, '#00ffff', 5, 4);
                                            chainedAny = true;
                                            // Draw lightning arc
                                            ctx.strokeStyle = '#00ffff';
                                            ctx.lineWidth = 2;
                                            ctx.beginPath();
                                            ctx.moveTo(e.x, e.y);
                                            ctx.lineTo(other.x, other.y);
                                            ctx.stroke();
                                        }
                                    }
                                });
                                if (chainedAny) sfxRef.current?.chainLightning();
                            }

                            // Quickstep: speed boost on kill
                            if (player.hasQuickstep) {
                                player.quickstepUntil = now + 1000;
                            }

                            enemies.splice(j, 1);
                        }

                        // Ricochet handling
                        if (player.ricochetCount > 0 && b.ricochets === undefined) {
                            b.ricochets = player.ricochetCount;
                        }
                        
                        if (b.ricochets && b.ricochets > 0) {
                            // Bounce to nearest enemy
                            let nearest = null;
                            let nearestDist = 999999;
                            enemies.forEach(other => {
                                if (other !== e) {
                                    const d = Math.hypot(other.x - e.x, other.y - e.y);
                                    if (d < nearestDist && d < 400) {
                                        nearest = other;
                                        nearestDist = d;
                                    }
                                }
                            });
                            if (nearest) {
                                const angle = Math.atan2(nearest.y - e.y, nearest.x - e.x);
                                b.vx = Math.cos(angle) * 15;
                                b.vy = Math.sin(angle) * 15;
                                b.ricochets--;
                                createParticles(e.x, e.y, '#ffff00', 5, 5);
                            } else {
                                bullets.splice(i, 1);
                            }
                        } else if (b.piercing <= 0 && !b.flame && !b.lightning) {
                            bullets.splice(i, 1);
                        } else {
                            b.piercing--;
                        }

                        // Flame and lightning don't get removed on hit
                        if (!b.flame && !b.lightning) {
                            break;
                        }
                    }
                }
            }
        }

        // Update and process melee attacks
        gs.meleeAttacks = gs.meleeAttacks || [];
        for (let i = gs.meleeAttacks.length - 1; i >= 0; i--) {
            const attack = gs.meleeAttacks[i];
            const elapsed = now - attack.spawnTime;
            attack.progress = Math.min(1, elapsed / attack.duration);

            // Remove finished attacks
            if (attack.progress >= 1) {
                gs.meleeAttacks.splice(i, 1);
                continue;
            }

            // Calculate current swing angle
            const swingProgress = attack.progress;
            const currentAngle = attack.angle - attack.swingArc / 2 + attack.swingArc * swingProgress;

            // Draw melee swing arc
            ctx.save();
            ctx.translate(attack.x, attack.y);

            // Draw swing trail (fading arc)
            const trailSegments = 12;
            for (let t = 0; t < trailSegments; t++) {
                const trailProgress = Math.max(0, swingProgress - (t / trailSegments) * 0.5);
                const trailAngle = attack.angle - attack.swingArc / 2 + attack.swingArc * trailProgress;
                const alpha = (1 - t / trailSegments) * (1 - attack.progress) * 0.8;

                ctx.globalAlpha = alpha;
                ctx.strokeStyle = attack.color;
                ctx.lineWidth = 8 - t * 0.5;
                ctx.shadowColor = attack.color;
                ctx.shadowBlur = 15;
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.lineTo(
                    Math.cos(trailAngle - Math.PI / 2 + attack.angle) * attack.range,
                    Math.sin(trailAngle - Math.PI / 2 + attack.angle) * attack.range
                );
                ctx.stroke();
            }

            // Draw main swing blade
            ctx.globalAlpha = 1 - attack.progress * 0.5;
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 4;
            ctx.shadowColor = attack.color;
            ctx.shadowBlur = 25;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(
                Math.cos(currentAngle) * attack.range,
                Math.sin(currentAngle) * attack.range
            );
            ctx.stroke();

            // Draw arc edge glow
            ctx.fillStyle = attack.color;
            ctx.beginPath();
            ctx.arc(
                Math.cos(currentAngle) * attack.range,
                Math.sin(currentAngle) * attack.range,
                8 * (1 - attack.progress),
                0, Math.PI * 2
            );
            ctx.fill();

            ctx.shadowBlur = 0;
            ctx.globalAlpha = 1;
            ctx.restore();

            // Hit detection for enemies in the swing arc
            for (let j = enemies.length - 1; j >= 0; j--) {
                const e = enemies[j];

                // Skip if already hit this enemy with this attack
                if (attack.hitEnemies.includes(j)) continue;

                // Check if enemy is in range
                const dist = Math.hypot(e.x - attack.x, e.y - attack.y);
                if (dist > attack.range + e.size) continue;

                // Check if enemy is within the swing arc
                const angleToEnemy = Math.atan2(e.y - attack.y, e.x - attack.x);
                let angleDiff = angleToEnemy - attack.angle;
                // Normalize angle difference
                while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
                while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;

                // Check if within current swing progress
                const swingStart = -attack.swingArc / 2;
                const swingEnd = swingStart + attack.swingArc * attack.progress;
                const inArc = angleDiff >= swingStart && angleDiff <= swingEnd;

                if (!inArc && !attack.cleave) continue;
                if (!inArc && attack.cleave && Math.abs(angleDiff) > attack.swingArc / 2) continue;

                // Hit! Mark as hit
                attack.hitEnemies.push(j);

                // Calculate damage
                let damage = attack.damage;
                let isCrit = false;

                // Speed scaling for jackhammer (damage = speed, no caps!)
                if (attack.speedScaling) {
                    damage = player.speed * 2; // Speed directly becomes damage
                }

                // Overpump bonus damage
                if (attack.overpumpStacks) {
                    damage += attack.overpumpStacks * 2.5; // Up to +10 damage at 4 stacks
                }

                // Pencil instant kill chance (John Wick mode)
                if (attack.instantKillChance && Math.random() < attack.instantKillChance) {
                    damage = e.health + 100; // Instant kill
                    isCrit = true;
                    createParticles(e.x, e.y, '#ff0000', 20, 10, 'spark');
                    createScreenFlash('#ff0000', 0.3);
                    sfxRef.current?.criticalHit();
                }

                // Backstab bonus (if enemy is facing away)
                if (attack.backstab) {
                    const enemyFacing = Math.atan2(player.y - e.y, player.x - e.x);
                    const behindAngle = Math.abs(angleToEnemy - enemyFacing);
                    if (behindAngle > Math.PI * 0.6) {
                        damage *= attack.backstabMultiplier;
                        isCrit = true;
                        createParticles(e.x, e.y, '#ffff00', 15, 8, 'spark');
                        sfxRef.current?.criticalHit();
                    }
                }

                // Apply damage
                e.health -= damage;
                e.hitFlash = 8;
                triggerScreenShake(attack.nuclear ? 0.6 : 0.15);
                createDamageNumber(e.x, e.y - e.size, damage, isCrit);
                createImpactSparks(e.x, e.y, angleToEnemy + Math.PI, attack.color);

                // Nuclear explosion on hit!
                if (attack.nuclear) {
                    createRingExplosion(e.x, e.y, '#00ff00', attack.explosionRadius);
                    createParticles(e.x, e.y, '#00ff00', 30, 15);
                    createParticles(e.x, e.y, '#ffff00', 20, 12);
                    createScreenFlash('#00ff00', 0.4);
                    sfxRef.current?.explosionBig();

                    // Damage all enemies in nuclear radius
                    enemies.forEach((other, idx) => {
                        if (idx === j) return;
                        const nukeDist = Math.hypot(other.x - e.x, other.y - e.y);
                        if (nukeDist < attack.explosionRadius) {
                            const nukeDamage = damage * 0.8 * (1 - nukeDist / attack.explosionRadius);
                            other.health -= nukeDamage;
                            other.hitFlash = 10;
                            createDamageNumber(other.x, other.y - other.size, nukeDamage, false);
                            const knockAngle = Math.atan2(other.y - e.y, other.x - e.x);
                            other.knockbackVx = Math.cos(knockAngle) * 15;
                            other.knockbackVy = Math.sin(knockAngle) * 15;
                        }
                    });
                }

                // Overpump explosion (2+ pumps)
                if (attack.overpumpStacks && attack.overpumpStacks >= 2 && !attack.overpumpExploded) {
                    attack.overpumpExploded = true;
                    const explosionRadius = 60 + attack.overpumpStacks * 20;
                    createRingExplosion(e.x, e.y, '#ff8800', explosionRadius);
                    createParticles(e.x, e.y, '#ff8800', 25, 12);
                    sfxRef.current?.explosion();

                    enemies.forEach((other, idx) => {
                        if (idx === j) return;
                        const pumpDist = Math.hypot(other.x - e.x, other.y - e.y);
                        if (pumpDist < explosionRadius) {
                            const pumpDamage = attack.overpumpStacks * 3;
                            other.health -= pumpDamage;
                            other.hitFlash = 5;
                            createDamageNumber(other.x, other.y - other.size, pumpDamage, false);
                        }
                    });
                }

                // Knockback
                if (attack.knockback > 0) {
                    const knockAngle = Math.atan2(e.y - attack.y, e.x - attack.x);
                    e.knockbackVx = Math.cos(knockAngle) * attack.knockback;
                    e.knockbackVy = Math.sin(knockAngle) * attack.knockback;
                }

                // Stun
                if (attack.stun) {
                    e.stunned = true;
                    e.stunnedEnd = now + attack.stunDuration;
                }

                // Bleed DOT
                if (attack.bleed) {
                    e.bleeding = true;
                    e.bleedDamage = attack.bleedDamage;
                    e.bleedEnd = now + attack.bleedDuration;
                    e.lastBleedTick = now;
                }

                // Lifesteal
                if (attack.lifesteal > 0) {
                    const healAmount = damage * attack.lifesteal;
                    player.health = Math.min(player.maxHealth, player.health + healAmount);
                    createParticles(player.x, player.y, '#00ff00', 5, 4);
                }

                // Ground slam AoE
                if (attack.groundSlam && !attack.slamTriggered) {
                    attack.slamTriggered = true;
                    createRingExplosion(attack.x, attack.y, attack.color, attack.slamRadius);
                    triggerScreenShake(0.4);
                    sfxRef.current?.explosion();

                    // Damage all enemies in slam radius
                    enemies.forEach((other, idx) => {
                        if (idx === j) return;
                        const slamDist = Math.hypot(other.x - attack.x, other.y - attack.y);
                        if (slamDist < attack.slamRadius) {
                            other.health -= damage * 0.5;
                            other.hitFlash = 5;
                            const knockAngle = Math.atan2(other.y - attack.y, other.x - attack.x);
                            other.knockbackVx = Math.cos(knockAngle) * attack.knockback * 0.5;
                            other.knockbackVy = Math.sin(knockAngle) * attack.knockback * 0.5;
                            createDamageNumber(other.x, other.y - other.size, damage * 0.5, false);
                        }
                    });
                }

                // Check if enemy died
                if (e.health <= 0) {
                    const scoreMultiplier = player.scoreMultiplier || 1;
                    gs.score += e.points * (1 + gs.combo * 0.1) * scoreMultiplier;
                    gs.kills++;
                    gs.totalKills++;
                    gs.combo++;
                    gs.comboTimer = 120;

                    if (e.type === 'boss') {
                        sfxRef.current?.killBoss();
                    } else {
                        sfxRef.current?.kill();
                    }

                    triggerScreenShake(e.type === 'boss' ? 1 : 0.2);
                    createDeathExplosion(e.x, e.y, e.color, e.size, e.type === 'boss');

                    // Adrenaline heal
                    if (player.adrenalineHeal > 0) {
                        player.health = Math.min(player.maxHealth, player.health + player.adrenalineHeal);
                    }

                    enemies.splice(j, 1);
                }

                // If not cleave, stop after first hit
                if (!attack.cleave) break;
            }
        }

        // Update and draw enemies
        for (let i = enemies.length - 1; i >= 0; i--) {
            const e = enemies[i];

            // Apply knockback
            if (e.knockbackVx || e.knockbackVy) {
                e.x += e.knockbackVx || 0;
                e.y += e.knockbackVy || 0;
                e.knockbackVx = (e.knockbackVx || 0) * 0.85;
                e.knockbackVy = (e.knockbackVy || 0) * 0.85;
                if (Math.abs(e.knockbackVx) < 0.1) e.knockbackVx = 0;
                if (Math.abs(e.knockbackVy) < 0.1) e.knockbackVy = 0;
            }

            // Stun check
            if (e.stunned && now > e.stunnedEnd) {
                e.stunned = false;
            }

            // Bleed tick
            if (e.bleeding) {
                if (now > e.bleedEnd) {
                    e.bleeding = false;
                } else if (now - e.lastBleedTick > 500) {
                    e.lastBleedTick = now;
                    e.health -= e.bleedDamage;
                    createParticles(e.x, e.y, '#ff0000', 3, 3);
                    createDamageNumber(e.x, e.y - e.size, e.bleedDamage, false);
                    if (e.health <= 0) {
                        createDeathExplosion(e.x, e.y, e.color, e.size, false);
                        enemies.splice(i, 1);
                        gs.kills++;
                        gs.totalKills++;
                        continue;
                    }
                }
            }

            // Goliath regeneration
            if (e.regenerates && now - e.lastRegen > 500) {
                e.lastRegen = now;
                e.health = Math.min(e.maxHealth, e.health + 1);
            }

            // Poison DOT
            if (e.poisoned) {
                if (now > e.poisonEnd) {
                    e.poisoned = false;
                } else if (!e.lastPoisonTick || now - e.lastPoisonTick > 500) {
                    e.lastPoisonTick = now;
                    e.health -= e.poisonDamage;
                    createParticles(e.x, e.y, '#00ff00', 2, 2);
                    if (e.health <= 0) {
                        gs.score += e.points;
                        gs.kills++;
                        gs.totalKills++;
                        createParticles(e.x, e.y, e.color, 15, 6);
                        enemies.splice(i, 1);
                        continue;
                    }
                }
            }

            // Freeze effect expiration
            if (e.frozen && now > e.frozenEnd) {
                e.frozen = false;
                e.speed = e.originalSpeed || e.baseSpeed || 2;
            }

            // Blitzer and Inferno trail effects
            if ((e.leavesTrail || e.leavesFireTrail) && now - e.lastTrail > 100) {
                e.lastTrail = now;
                const trailColor = e.leavesFireTrail ? '#ff3300' : '#ffaa00';
                createParticles(e.x, e.y, trailColor, 3, 2);

                // Fire trail damages player
                if (e.leavesFireTrail) {
                    gs.fireTrails = gs.fireTrails || [];
                    gs.fireTrails.push({ x: e.x, y: e.y, damage: 2, lifetime: 120 });
                }
            }

            // Check if stunned
            if (e.stunned && now < e.stunEndTime) {
                // Don't move, skip to rendering
            } else {
                e.stunned = false;

                // Target decoy if player is invisible, or random spot if blind cheat is on
                let target;
                if (blindEnemies) {
                    target = { x: canvas.width / 2, y: canvas.height / 2 };
                } else if (isInvisible && gs.decoy) {
                    target = gs.decoy;
                } else {
                    target = player;
                }
                
                // Dasher logic
                if (e.dashes) {
                    if (e.isDashing) {
                        e.x += Math.cos(e.dashAngle) * e.speed * 4;
                        e.y += Math.sin(e.dashAngle) * e.speed * 4;
                        
                        if (now - e.dashStartTime > 1000) {
                            e.isDashing = false;
                            e.dashCooldown = now + 3000;
                        }
                    } else {
                        const angle = Math.atan2(target.y - e.y, target.x - e.x);
                        e.x += Math.cos(angle) * e.speed * timeMultiplier;
                        e.y += Math.sin(angle) * e.speed * timeMultiplier;

                        if (now > e.dashCooldown && Math.random() < 0.01) {
                            e.isDashing = true;
                            e.dashStartTime = now;
                            e.dashAngle = angle;
                        }
                    }
                } else {
                    // Normal movement toward target
                    const angle = Math.atan2(target.y - e.y, target.x - e.x);
                    e.x += Math.cos(angle) * e.speed * timeMultiplier;
                    e.y += Math.sin(angle) * e.speed * timeMultiplier;
                }
            }

            // Bloater/Nuke explosion timer
            if (e.explodes) {
                const timeSinceSpawn = (now - e.spawnTime) / 1000;
                const timeLeft = e.fuseTime - timeSinceSpawn;

                // Nuke dash attack before explosion
                if (e.bigExplosion && timeLeft < 0.8 && timeLeft > 0 && !e.finalDash) {
                    e.finalDash = true;
                    const angleToPlayer = Math.atan2(player.y - e.y, player.x - e.x);
                    e.dashVx = Math.cos(angleToPlayer) * 25;
                    e.dashVy = Math.sin(angleToPlayer) * 25;
                }

                if (e.finalDash) {
                    e.x += e.dashVx;
                    e.y += e.dashVy;
                    createParticles(e.x, e.y, '#ff00ff', 3, 6);
                }

                if (timeSinceSpawn >= e.fuseTime) {
                    const radius = e.hugeExplosion ? 250 : (e.bigExplosion ? 800 : 80);

                    // Create massive explosion effect for nuke
                    if (e.bigExplosion) {
                        gs.explosions = gs.explosions || [];
                        gs.explosions.push({
                            x: e.x,
                            y: e.y,
                            radius: 0,
                            maxRadius: radius,
                            life: 1,
                            color: '#ff00ff'
                        });
                        createParticles(e.x, e.y, '#ff00ff', 100, 20);
                        createParticles(e.x, e.y, '#ff8800', 80, 18);
                        createParticles(e.x, e.y, '#ffffff', 60, 15);
                    } else {
                        createParticles(e.x, e.y, '#ff8800', 25, 12);
                    }

                    triggerScreenShake(e.bigExplosion ? 3 : 0.6);
                    // Play appropriate explosion sound
                    if (e.hugeExplosion) {
                        sfxRef.current?.explosionMega();
                    } else if (e.bigExplosion) {
                        sfxRef.current?.explosionBig();
                    } else {
                        sfxRef.current?.explosion();
                    }

                    // Damage player if in range
                    const distToPlayer = Math.hypot(player.x - e.x, player.y - e.y);
                    if (distToPlayer < radius && !player.invulnerable) {
                        let damage = e.damage * 2;
                        if (player.classId === 'bruiser') damage *= 0.5;
                        if (player.shield > 0) {
                            const absorbed = Math.min(player.shield, damage);
                            player.shield -= absorbed;
                            damage -= absorbed;
                        }
                        player.health -= damage;
                        createDamageNumber(player.x, player.y - PLAYER_SIZE, damage, false);
                    }

                    // Damage other enemies in blast
                    if (e.bigExplosion || e.hugeExplosion) {
                        enemies.forEach(other => {
                            if (other !== e) {
                                const d = Math.hypot(other.x - e.x, other.y - e.y);
                                if (d < radius) {
                                    other.health -= e.damage * 3;
                                    other.hitFlash = 5;
                                    createDamageNumber(other.x, other.y - other.size, e.damage * 3, false);
                                }
                            }
                        });
                    }

                    // Cluster spawns mini bombs
                    if (e.spawnsMiniBombs) {
                        for (let m = 0; m < 4; m++) {
                            const angle = (Math.PI * 2 / 4) * m;
                            const spawnDist = 40;
                            gs.enemies.push({
                                x: e.x + Math.cos(angle) * spawnDist,
                                y: e.y + Math.sin(angle) * spawnDist,
                                health: 10,
                                maxHealth: 10,
                                speed: 2.5,
                                baseSpeed: 2.5,
                                damage: e.damage * 0.5,
                                size: 12,
                                color: '#ff9944',
                                points: 5,
                                type: 'minibomb',
                                lastShot: 0,
                                lastMeleeHit: 0,
                                hitFlash: 0,
                                explodes: true,
                                fuseTime: 1.5,
                                spawnTime: Date.now(),
                                lastTrail: 0,
                                lastRegen: 0
                            });
                        }
                    }

                    enemies.splice(i, 1);
                    continue;
                }
            }

            // Shooting enemies
            if (e.shoots) {
                // Sniper - slow but powerful shots
                const shootCooldown = e.sniperShot ? 4000 : (e.rapidFire ? 400 : 2000);
                if (now - e.lastShot > shootCooldown) {
                    e.lastShot = now;
                    const angle = Math.atan2(player.y - e.y, player.x - e.x);
                    const speed = e.sniperShot ? 15 : 8;
                    const damage = e.sniperShot ? e.damage * 1.5 : (e.rapidFire ? e.damage * 0.5 : e.damage);
                    const bulletSize = e.sniperShot ? 8 : 6;
                    const bulletColor = e.sniperShot ? '#44ff88' : (e.rapidFire ? '#44ffaa' : '#ff0066');

                    gs.bullets.push({
                        x: e.x,
                        y: e.y,
                        vx: Math.cos(angle) * speed,
                        vy: Math.sin(angle) * speed,
                        damage: damage,
                        isEnemy: true,
                        piercing: 0,
                        size: bulletSize,
                        color: bulletColor
                    });
                    // Play enemy shoot sound
                    sfxRef.current?.enemyShoot();
                }
            }

            // Mortar - arcing explosive shots
            if (e.mortarShot && now - e.lastShot > 3500) {
                e.lastShot = now;
                gs.bullets.push({
                    x: e.x,
                    y: e.y,
                    targetX: player.x,
                    targetY: player.y,
                    vx: 0,
                    vy: 0,
                    damage: e.damage,
                    isEnemy: true,
                    isMortar: true,
                    mortarProgress: 0,
                    startX: e.x,
                    startY: e.y,
                    piercing: 0,
                    size: 10,
                    color: '#88ffcc'
                });
                sfxRef.current?.mortarLaunch();
            }

            // Cloud shooter (Shambler)
            if (e.cloudShooter && now - e.lastShot > 3000) {
                e.lastShot = now;
                const angle = Math.atan2(player.y - e.y, player.x - e.x);
                gs.bullets.push({
                    x: e.x,
                    y: e.y,
                    vx: Math.cos(angle) * 3,
                    vy: Math.sin(angle) * 3,
                    damage: e.damage * 0.5,
                    isEnemy: true,
                    piercing: 0,
                    size: 15,
                    color: '#8888ff',
                    isCloud: true,
                    lifetime: 180
                });
            }

            // Player collision
            const distToPlayer = Math.hypot(player.x - e.x, player.y - e.y);
            const minDist = PLAYER_SIZE + e.size;
            if (distToPlayer < minDist) {
                // Push apart
                const angle = Math.atan2(e.y - player.y, e.x - player.x);
                const overlap = minDist - distToPlayer;
                e.x += Math.cos(angle) * overlap * 0.5;
                e.y += Math.sin(angle) * overlap * 0.5;
                player.x -= Math.cos(angle) * overlap * 0.5;
                player.y -= Math.sin(angle) * overlap * 0.5;
                
                // Melee damage with cooldown
                if (!player.invulnerable && now - e.lastMeleeHit > ENEMY_MELEE_COOLDOWN) {
                    // Evasion check
                    if (player.evasionChance > 0 && Math.random() < player.evasionChance) {
                        createParticles(player.x, player.y, '#ffffff', 5, 6);
                        e.lastMeleeHit = now;
                    } else {
                        e.lastMeleeHit = now;
                        let damage = e.damage;

                        // Bruiser has melee resistance
                        if (player.classId === 'bruiser') {
                            damage *= 0.5;
                        }

                        // Fortress damage reduction
                        if (player.damageReduction > 0) {
                            damage *= (1 - player.damageReduction);
                        }

                        if (player.shield > 0) {
                            const absorbed = Math.min(player.shield, damage);
                            player.shield -= absorbed;
                            damage -= absorbed;
                            player.lastShieldHit = now;
                            if (absorbed > 0) {
                                sfxRef.current?.shieldHit();
                                if (player.shield <= 0) sfxRef.current?.shieldBreak();
                            }
                        }

                        // Absorb shield
                        if (player.damageToShield > 0 && damage > 0) {
                            player.shield = Math.min((player.maxShield || 50), player.shield + damage * player.damageToShield);
                        }

                        player.health -= damage;
                        createDamageNumber(player.x, player.y - PLAYER_SIZE, damage, false);
                        if (damage > 0) sfxRef.current?.hit();
                        triggerScreenShake(0.15);
                        createParticles(player.x, player.y, '#ff0000', 5, 3);

                        // Thorns: reflect damage back to enemy
                        if (player.thornsDamage > 0) {
                            const thornsDmg = e.damage * player.thornsDamage;
                            e.health -= thornsDmg;
                            e.hitFlash = 5;
                            createParticles(e.x, e.y, '#ff00ff', 5, 4);
                            createDamageNumber(e.x, e.y - e.size, thornsDmg, false);
                        }
                    }
                }
            }
            
            // Burning DOT
            if (e.burning && now < e.burnEnd) {
                if (!e.lastBurnTick || now - e.lastBurnTick > 200) {
                    e.health -= e.burnDamage;
                    e.lastBurnTick = now;
                    createParticles(e.x, e.y, '#ff6600', 3, 3);
                }
            } else if (e.burning) {
                e.burning = false;
            }

            // Enemy-to-enemy collision (phantom enemies phase through)
            if (!e.phasing) {
                for (let j = i + 1; j < enemies.length; j++) {
                    const e2 = enemies[j];
                    if (e2.phasing) continue; // Skip collision with phantom enemies
                    const dist = Math.hypot(e.x - e2.x, e.y - e2.y);
                    const minDist = e.size + e2.size;
                    if (dist < minDist) {
                        const angle = Math.atan2(e2.y - e.y, e2.x - e.x);
                        const overlap = (minDist - dist) * 0.5;
                        e.x -= Math.cos(angle) * overlap;
                        e.y -= Math.sin(angle) * overlap;
                        e2.x += Math.cos(angle) * overlap;
                        e2.y += Math.sin(angle) * overlap;
                    }
                }
            }

            // Draw enemy
            ctx.fillStyle = e.hitFlash > 0 ? '#ffffff' : e.color;
            if (e.hitFlash > 0) e.hitFlash--;
            ctx.shadowColor = e.color;
            ctx.shadowBlur = e.isDashing ? 25 : 15;
            ctx.beginPath();
            ctx.arc(e.x, e.y, e.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;

            // Explosion timer for bloater/nuke
            if (e.explodes) {
                const timeSinceSpawn = (now - e.spawnTime) / 1000;
                const timeLeft = Math.max(0, e.fuseTime - timeSinceSpawn);
                
                // Timer bar
                ctx.fillStyle = '#000';
                ctx.fillRect(e.x - e.size, e.y - e.size - 18, e.size * 2, 6);
                ctx.fillStyle = timeLeft < 1 ? '#ff0000' : '#ffaa00';
                ctx.fillRect(e.x - e.size, e.y - e.size - 18, (timeLeft / e.fuseTime) * e.size * 2, 6);
                
                // Timer text
                ctx.fillStyle = '#fff';
                ctx.font = 'bold 12px Inter';
                ctx.textAlign = 'center';
                ctx.fillText(timeLeft.toFixed(1), e.x, e.y - e.size - 22);
            }

            // Health bar
            if (e.health < e.maxHealth) {
                ctx.fillStyle = '#333';
                ctx.fillRect(e.x - e.size, e.y - e.size - 10, e.size * 2, 4);
                ctx.fillStyle = e.color;
                ctx.fillRect(e.x - e.size, e.y - e.size - 10, (e.health / e.maxHealth) * e.size * 2, 4);
            }
        }

        // Update and draw explosions
        gs.explosions = gs.explosions || [];
        for (let i = gs.explosions.length - 1; i >= 0; i--) {
            const exp = gs.explosions[i];
            exp.radius += (exp.maxRadius - exp.radius) * 0.15;
            exp.life -= 0.02;

            if (exp.life <= 0) {
                gs.explosions.splice(i, 1);
                continue;
            }

            // Draw expanding shockwave
            ctx.globalAlpha = exp.life * 0.6;
            ctx.strokeStyle = exp.color;
            ctx.lineWidth = 8;
            ctx.shadowColor = exp.color;
            ctx.shadowBlur = 40;
            ctx.beginPath();
            ctx.arc(exp.x, exp.y, exp.radius, 0, Math.PI * 2);
            ctx.stroke();

            // Inner glow
            ctx.fillStyle = exp.color;
            ctx.shadowBlur = 60;
            ctx.beginPath();
            ctx.arc(exp.x, exp.y, exp.radius * 0.3, 0, Math.PI * 2);
            ctx.fill();

            ctx.globalAlpha = 1;
            ctx.shadowBlur = 0;
        }

        // Update and draw bullet trails
        gs.bulletTrails = gs.bulletTrails || [];
        for (let i = gs.bulletTrails.length - 1; i >= 0; i--) {
            const t = gs.bulletTrails[i];
            t.life -= t.decay;

            if (t.life <= 0) {
                gs.bulletTrails.splice(i, 1);
                continue;
            }

            ctx.globalAlpha = t.life * 0.6;
            ctx.fillStyle = t.color;
            ctx.shadowColor = t.color;
            ctx.shadowBlur = 10;
            ctx.beginPath();
            ctx.arc(t.x, t.y, t.size * t.life, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
            ctx.globalAlpha = 1;
        }

        // Update and draw muzzle flashes
        gs.muzzleFlashes = gs.muzzleFlashes || [];
        for (let i = gs.muzzleFlashes.length - 1; i >= 0; i--) {
            const m = gs.muzzleFlashes[i];
            m.life -= 0.2;

            if (m.life <= 0) {
                gs.muzzleFlashes.splice(i, 1);
                continue;
            }

            ctx.save();
            ctx.translate(m.x, m.y);
            ctx.rotate(m.angle);
            ctx.globalAlpha = m.life;
            ctx.fillStyle = m.color;
            ctx.shadowColor = m.color;
            ctx.shadowBlur = 20;
            // Draw flash as elongated triangle
            ctx.beginPath();
            ctx.moveTo(0, -m.size * 0.3 * m.life);
            ctx.lineTo(m.size * m.life, 0);
            ctx.lineTo(0, m.size * 0.3 * m.life);
            ctx.closePath();
            ctx.fill();
            ctx.shadowBlur = 0;
            ctx.globalAlpha = 1;
            ctx.restore();
        }

        // Update and draw ring effects
        gs.ringEffects = gs.ringEffects || [];
        for (let i = gs.ringEffects.length - 1; i >= 0; i--) {
            const r = gs.ringEffects[i];
            r.radius += (r.maxRadius - r.radius) * 0.2;
            r.life -= 0.03;
            r.lineWidth = Math.max(1, r.lineWidth * 0.95);

            if (r.life <= 0) {
                gs.ringEffects.splice(i, 1);
                continue;
            }

            ctx.globalAlpha = r.life * 0.7;
            ctx.strokeStyle = r.color;
            ctx.lineWidth = r.lineWidth;
            ctx.shadowColor = r.color;
            ctx.shadowBlur = 20;
            ctx.beginPath();
            ctx.arc(r.x, r.y, r.radius, 0, Math.PI * 2);
            ctx.stroke();
            ctx.shadowBlur = 0;
            ctx.globalAlpha = 1;
        }

        // Update particles (enhanced with types)
        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.vx *= 0.95;
            p.vy *= 0.95;
            p.vy += p.gravity || 0;
            p.life -= p.decay;
            p.rotation = (p.rotation || 0) + (p.rotationSpeed || 0);

            if (p.life <= 0) {
                particles.splice(i, 1);
                continue;
            }

            const size = p.shrink !== false ? p.size * p.life : p.size;
            ctx.globalAlpha = p.type === 'smoke' ? p.life * 0.5 : p.life;
            ctx.fillStyle = p.color;

            if (p.type === 'smoke') {
                // Smoke: soft circle with blur
                ctx.shadowColor = p.color;
                ctx.shadowBlur = 10;
                ctx.beginPath();
                ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;
            } else if (p.type === 'spark') {
                // Spark: small bright dot with trail
                ctx.shadowColor = p.color;
                ctx.shadowBlur = 8;
                ctx.beginPath();
                ctx.arc(p.x, p.y, size * 0.5, 0, Math.PI * 2);
                ctx.fill();
                // Trail
                ctx.globalAlpha = p.life * 0.5;
                ctx.beginPath();
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(p.x - p.vx * 3, p.y - p.vy * 3);
                ctx.strokeStyle = p.color;
                ctx.lineWidth = size * 0.3;
                ctx.stroke();
                ctx.shadowBlur = 0;
            } else {
                // Default: rotating square
                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate(p.rotation || 0);
                ctx.shadowColor = p.color;
                ctx.shadowBlur = 5;
                ctx.fillRect(-size/2, -size/2, size, size);
                ctx.shadowBlur = 0;
                ctx.restore();
            }
            ctx.globalAlpha = 1;
        }

        // Update and draw fire trails (from Inferno enemies)
        if (gs.fireTrails) {
            for (let i = gs.fireTrails.length - 1; i >= 0; i--) {
                const trail = gs.fireTrails[i];
                trail.lifetime--;

                if (trail.lifetime <= 0) {
                    gs.fireTrails.splice(i, 1);
                    continue;
                }

                // Draw fire trail
                ctx.globalAlpha = trail.lifetime / 120;
                ctx.fillStyle = '#ff3300';
                ctx.shadowColor = '#ff6600';
                ctx.shadowBlur = 15;
                ctx.beginPath();
                ctx.arc(trail.x, trail.y, 12, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;
                ctx.globalAlpha = 1;

                // Damage player if touching fire trail
                const distToPlayer = Math.hypot(player.x - trail.x, player.y - trail.y);
                if (distToPlayer < PLAYER_SIZE + 12 && !player.invulnerable && !trail.hitThisFrame) {
                    trail.hitThisFrame = true;
                    let fireDamage = trail.damage;
                    if (player.classId === 'bruiser') fireDamage *= 0.5;
                    if (player.shield > 0) {
                        const absorbed = Math.min(player.shield, fireDamage);
                        player.shield -= absorbed;
                        fireDamage -= absorbed;
                    }
                    player.health -= fireDamage;
                }
            }
            // Reset hit tracking each frame
            gs.fireTrails.forEach(t => t.hitThisFrame = false);
        }

        // Update damage numbers
        for (let i = damageNumbers.length - 1; i >= 0; i--) {
            const d = damageNumbers[i];
            d.y += d.vy;
            d.vy *= 0.95; // Slow down over time
            d.life -= 0.02;
            // Add slight horizontal drift
            d.x += (d.drift || 0);
            if (!d.drift) d.drift = (Math.random() - 0.5) * 0.5;

            if (d.life <= 0) {
                damageNumbers.splice(i, 1);
                continue;
            }

            // Scale effect for crits
            const scale = d.isCrit ? 1 + (1 - d.life) * 0.3 : 1;
            const fontSize = d.isCrit ? 24 * scale : 18;

            ctx.save();
            ctx.globalAlpha = d.life;
            ctx.font = `bold ${Math.round(fontSize)}px Inter`;
            ctx.textAlign = 'center';

            // Glow/shadow effect
            if (d.isCrit) {
                ctx.shadowColor = '#ffaa00';
                ctx.shadowBlur = 15;
                ctx.fillStyle = '#ffff00';
            } else {
                ctx.shadowColor = 'rgba(0,0,0,0.8)';
                ctx.shadowBlur = 4;
                ctx.fillStyle = '#ffffff';
            }

            // Draw outline for better visibility
            ctx.strokeStyle = d.isCrit ? '#ff6600' : '#000000';
            ctx.lineWidth = d.isCrit ? 3 : 2;
            ctx.strokeText(d.damage.toString(), d.x, d.y);
            ctx.fillText(d.damage.toString(), d.x, d.y);

            ctx.shadowBlur = 0;
            ctx.restore();
        }

        // Combo timer
        if (gs.comboTimer > 0) {
            gs.comboTimer--;
            if (gs.comboTimer === 0) {
                gs.combo = 0;
            }
        }

        // Draw decoy
        if (gs.decoy && now < gs.decoy.spawnTime + gs.decoy.lifetime) {
            ctx.globalAlpha = 0.5;
            ctx.fillStyle = '#8844ff';
            ctx.shadowColor = '#8844ff';
            ctx.shadowBlur = 20;
            ctx.beginPath();
            ctx.arc(gs.decoy.x, gs.decoy.y, PLAYER_SIZE, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;
            ctx.globalAlpha = 1;
        } else if (gs.decoy) {
            gs.decoy = null;
        }
        
        // Draw player
        const playerAngle = Math.atan2(mouse.y - player.y, mouse.x - player.x);

        // Overpump vibration effect
        let vibrateX = 0, vibrateY = 0;
        const isPumping = player.pumpingUntil && now < player.pumpingUntil;
        if (isPumping || (player.overpumpStacks > 0 && player.currentWeapon === 'overpump_jackhammer')) {
            const intensity = (player.overpumpStacks || 1) * 2;
            vibrateX = (Math.random() - 0.5) * intensity;
            vibrateY = (Math.random() - 0.5) * intensity;
        }

        // Player invisible effect
        const playerVisible = !isInvisible;
        ctx.globalAlpha = playerVisible ? 1 : 0.2;

        // Player glow (orange when pumped up)
        const pumpedUp = player.overpumpStacks > 0 && player.currentWeapon === 'overpump_jackhammer';
        const playerColor = player.invulnerable ? '#ffff00' : (pumpedUp ? '#ff8800' : (player.dashActive ? '#00ffff' : '#00ffff'));
        ctx.shadowColor = playerColor;
        ctx.shadowBlur = player.invulnerable ? 30 : (pumpedUp ? 35 + player.overpumpStacks * 5 : (player.dashActive ? 40 : 20));
        ctx.fillStyle = playerColor;
        ctx.beginPath();
        ctx.arc(player.x + vibrateX, player.y + vibrateY, PLAYER_SIZE, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;

        // Overpump stack indicator
        if (pumpedUp) {
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 14px Inter';
            ctx.textAlign = 'center';
            ctx.fillText(`PUMP x${player.overpumpStacks}`, player.x, player.y - PLAYER_SIZE - 25);
        }

        // Player direction indicator
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(player.x, player.y);
        ctx.lineTo(
            player.x + Math.cos(playerAngle) * PLAYER_SIZE * 1.5,
            player.y + Math.sin(playerAngle) * PLAYER_SIZE * 1.5
        );
        ctx.stroke();

        // Shield indicator
        if (player.shield > 0) {
            ctx.strokeStyle = '#4488ff';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(player.x, player.y, PLAYER_SIZE + 8, 0, Math.PI * 2);
            ctx.stroke();
        }

        ctx.restore();

        // Screen flash effect (drawn last as overlay)
        if (gs.screenFlash && gs.screenFlash.life > 0) {
            ctx.globalAlpha = gs.screenFlash.life * gs.screenFlash.intensity;
            ctx.fillStyle = gs.screenFlash.color;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.globalAlpha = 1;
            gs.screenFlash.life -= 0.1;
        }

        // Low health vignette effect
        if (player.health > 0 && player.health < player.maxHealth * 0.3) {
            const vignetteIntensity = 1 - (player.health / (player.maxHealth * 0.3));
            const gradient = ctx.createRadialGradient(
                canvas.width / 2, canvas.height / 2, canvas.width * 0.3,
                canvas.width / 2, canvas.height / 2, canvas.width * 0.8
            );
            gradient.addColorStop(0, 'rgba(255, 0, 0, 0)');
            gradient.addColorStop(1, `rgba(255, 0, 0, ${vignetteIntensity * 0.4})`);
            ctx.fillStyle = gradient;
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }

        // Low health warning sound
        if (player.health > 0 && player.health < player.maxHealth * 0.25) {
            if (!player.lastLowHealthWarning || now - player.lastLowHealthWarning > 2000) {
                player.lastLowHealthWarning = now;
                sfxRef.current?.lowHealth();
            }
        }

        // Update UI
        const abilityReady = player.ability.ready || (now - player.ability.lastUsed > player.ability.cooldown * 1000);
        setUiState({
            health: Math.max(0, Math.round(player.health)),
            maxHealth: player.maxHealth,
            wave: gs.wave,
            score: Math.round(gs.score),
            kills: gs.totalKills,
            combo: gs.combo,
            shield: Math.round(player.shield),
            weapon: WEAPONS[player.currentWeapon]?.name || 'Pistol',
            abilityReady,
            abilityName: player.ability.name,
            abilityCooldown: abilityReady ? 0 : Math.ceil((player.ability.cooldown * 1000 - (now - player.ability.lastUsed)) / 1000)
        });

        if (!gameOver) {
            animationRef.current = requestAnimationFrame(gameLoop);
        }
    }, [isPaused, gameOver, shootBullet, spawnEnemy, createParticles, createDamageNumber, triggerScreenShake, generateUpgrades, createBulletTrail, createDeathExplosion, createImpactSparks, createRingExplosion, createScreenFlash, createMeleeAttack]);

    const startGame = useCallback((classData) => {
        setGameStarted(true);
        setGameOver(false);
        setIsPaused(false);
        setRerolls(maxRerolls);

        // Wait for canvas to be visible before initializing
        setTimeout(() => {
            initGame(classData);
            const gs = gameStateRef.current;
            if (gs) {
                gs.startTime = Date.now();
                console.log('Game initialized:', gs.canvas.width, 'x', gs.canvas.height);
            }
            sfxRef.current?.start();
            animationRef.current = requestAnimationFrame(gameLoop);
        }, 50);
    }, [initGame, gameLoop]);

    const restartGame = useCallback(() => {
        cancelAnimationFrame(animationRef.current);
        setGameOver(false);
        setFinalStats(null);
        setClassSelected(false);
        setSelectedClass(null);
        setGameStarted(false);
    }, []);

    const handleClassSelect = useCallback((classData) => {
        setSelectedClass(classData);
        setClassSelected(true);
        startGame(classData);
    }, [startGame]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (gameStateRef.current) {
                gameStateRef.current.keys[e.key.toLowerCase()] = true;

                // Konami code detection
                if (gameStarted && !gameOver) {
                    konamiCodeRef.current.push(e.key.toLowerCase());
                    if (konamiCodeRef.current.length > konamiSequence.length) {
                        konamiCodeRef.current.shift();
                    }

                    if (konamiCodeRef.current.length === konamiSequence.length &&
                        konamiCodeRef.current.every((key, i) => key === konamiSequence[i])) {
                        setShowCheatPopup(true);
                        konamiCodeRef.current = [];
                        return;
                    }
                }

                // Overpump Jackhammer - P to pump (only when holding the weapon)
                if (gameStarted && !gameOver && !cheatsEnabled) {
                    const gs = gameStateRef.current;
                    if (gs && e.key.toLowerCase() === 'p' && gs.player.currentWeapon === 'overpump_jackhammer') {
                        e.preventDefault();
                        gs.player.overpumpStacks = Math.min(4, (gs.player.overpumpStacks || 0) + 1);
                        gs.player.pumpingUntil = Date.now() + 300; // Vibrate for 300ms
                        sfxRef.current?.meleeHeavy();
                        // Visual feedback
                        createParticles(gs.player.x, gs.player.y, '#ff8800', 8, 5);
                        return;
                    }
                }

                // Cheat keys
                if (cheatsEnabled && gameStarted && !gameOver) {
                    if (e.key.toLowerCase() === 'p') {
                        e.preventDefault();
                        setShowLog(prev => !prev);
                        setSandboxMode(true);
                        return;
                    }
                    if (e.key.toLowerCase() === 'c') {
                        e.preventDefault();
                        setNoWeaponCooldown(prev => !prev);
                        return;
                    }
                    if (e.key.toLowerCase() === 'm') {
                        e.preventDefault();
                        setBlindEnemies(prev => !prev);
                        return;
                    }
                    if (e.key.toLowerCase() === 'n') {
                        e.preventDefault();
                        if (gameStateRef.current) {
                            gameStateRef.current.enemies.forEach(enemy => {
                                createParticles(enemy.x, enemy.y, enemy.color, 20, 8);
                            });
                            gameStateRef.current.enemies = [];
                            sfxRef.current?.waveComplete();
                        }
                        return;
                    }
                }

                // Ability activation
                if ((e.key === ' ' || e.key === 'Spacebar') && gameStateRef.current.player) {
                    const player = gameStateRef.current.player;
                    const gs = gameStateRef.current;
                    const now = Date.now();

                    // Skip if passive ability
                    if (player.ability.type === 'passive') return;

                    if (player.ability.ready || now - player.ability.lastUsed > player.ability.cooldown * 1000) {
                        player.ability.ready = false;
                        player.ability.lastUsed = now;

                        // Execute class ability based on classId
                        switch (player.classId) {
                            case 'bruiser':
                                // Iron Shield - invulnerability + damage reflect
                                player.invulnerable = true;
                                player.invulnerableUntil = now + 3000;
                                player.reflectDamage = true;
                                setTimeout(() => { player.reflectDamage = false; }, 3000);
                                sfxRef.current?.shieldHit();
                                triggerScreenShake(0.5);
                                createParticles(player.x, player.y, '#4488ff', 30, 10);
                                break;

                            case 'juggernaut':
                                // Unstoppable - immune to everything for 4s
                                player.invulnerable = true;
                                player.invulnerableUntil = now + 4000;
                                player.unstoppable = true;
                                setTimeout(() => { player.unstoppable = false; }, 4000);
                                sfxRef.current?.powerup();
                                createParticles(player.x, player.y, '#888888', 40, 12);
                                break;

                            case 'fortress':
                                // Barrier - shield zone
                                gs.barrier = { x: player.x, y: player.y, endTime: now + 5000, radius: 120 };
                                sfxRef.current?.shieldRecharge();
                                createParticles(player.x, player.y, '#ffaa00', 30, 15);
                                break;

                            case 'speedster':
                                // Afterburner - speed boost + damaging trail
                                player.afterburnerUntil = now + 5000;
                                sfxRef.current?.nitroBoost();
                                createParticles(player.x, player.y, '#ffff00', 30, 12);
                                break;

                            case 'ghost':
                                // Phase Shift - intangible
                                player.phasing = true;
                                player.invulnerable = true;
                                player.invulnerableUntil = now + 3000;
                                setTimeout(() => { player.phasing = false; }, 3000);
                                sfxRef.current?.dash();
                                createParticles(player.x, player.y, '#aa44ff', 25, 10);
                                break;

                            case 'dasher':
                                // Blink Dash - instant teleport
                                createParticles(player.x, player.y, '#00ffff', 20, 8);
                                player.x = gs.mouse.x;
                                player.y = gs.mouse.y;
                                player.invulnerable = true;
                                player.invulnerableUntil = now + 300;
                                sfxRef.current?.dash();
                                createParticles(player.x, player.y, '#00ffff', 20, 8);
                                break;

                            case 'gunslinger':
                                // Fan the Hammer - 6 rapid shots
                                for (let i = 0; i < 6; i++) {
                                    setTimeout(() => {
                                        const spread = (i - 2.5) * 0.15;
                                        const angle = Math.atan2(gs.mouse.y - player.y, gs.mouse.x - player.x) + spread;
                                        gs.bullets.push({
                                            x: player.x, y: player.y,
                                            vx: Math.cos(angle) * 15,
                                            vy: Math.sin(angle) * 15,
                                            damage: player.damage * 1.5,
                                            piercing: 0, size: 6, color: '#ff6600'
                                        });
                                        sfxRef.current?.shoot();
                                    }, i * 50);
                                }
                                break;

                            case 'sniper':
                                // Focus Shot - 5x damage piercing
                                player.focusShot = true;
                                sfxRef.current?.sniperCharge();
                                createParticles(player.x, player.y, '#44ff88', 20, 8);
                                break;

                            case 'pyromaniac':
                                // Inferno - massive fire explosion
                                const infernoRadius = 200;
                                createParticles(player.x, player.y, '#ff4400', 60, 20);
                                triggerScreenShake(1);
                                sfxRef.current?.explosionBig();
                                gs.enemies.forEach(en => {
                                    const d = Math.hypot(en.x - player.x, en.y - player.y);
                                    if (d < infernoRadius) {
                                        en.health -= player.damage * 3;
                                        en.burning = true;
                                        en.burnDamage = player.damage * 0.5;
                                        en.burnEnd = now + 5000;
                                        en.hitFlash = 10;
                                    }
                                });
                                break;

                            case 'artillery':
                                // Bombardment - 5 explosive strikes
                                for (let i = 0; i < 5; i++) {
                                    const bx = gs.mouse.x + (Math.random() - 0.5) * 150;
                                    const by = gs.mouse.y + (Math.random() - 0.5) * 150;
                                    setTimeout(() => {
                                        createParticles(bx, by, '#ff8800', 25, 12);
                                        triggerScreenShake(0.4);
                                        sfxRef.current?.explosion();
                                        gs.enemies.forEach(en => {
                                            const d = Math.hypot(en.x - bx, en.y - by);
                                            if (d < 100) {
                                                en.health -= player.damage * 4;
                                                en.hitFlash = 5;
                                            }
                                        });
                                    }, i * 150);
                                }
                                sfxRef.current?.orbitalStrike();
                                break;

                            case 'assassin':
                                // Shadow Strike - teleport behind nearest enemy
                                let nearestEnemy = null;
                                let nearestDist = Infinity;
                                gs.enemies.forEach(en => {
                                    const d = Math.hypot(en.x - player.x, en.y - player.y);
                                    if (d < nearestDist) { nearestEnemy = en; nearestDist = d; }
                                });
                                if (nearestEnemy) {
                                    const behindAngle = Math.atan2(player.y - nearestEnemy.y, player.x - nearestEnemy.x);
                                    createParticles(player.x, player.y, '#6644ff', 15, 8);
                                    player.x = nearestEnemy.x + Math.cos(behindAngle) * 50;
                                    player.y = nearestEnemy.y + Math.sin(behindAngle) * 50;
                                    player.invulnerable = true;
                                    player.invulnerableUntil = now + 500;
                                    // Backstab damage
                                    nearestEnemy.health -= player.damage * 3;
                                    nearestEnemy.hitFlash = 10;
                                    createDamageNumber(nearestEnemy.x, nearestEnemy.y - nearestEnemy.size, player.damage * 3, true);
                                    sfxRef.current?.criticalHit();
                                }
                                break;

                            case 'ninja':
                                // Smoke Bomb - vanish and confuse
                                player.invisibleUntil = now + 3000;
                                gs.smokeBomb = { x: player.x, y: player.y, endTime: now + 3000 };
                                gs.enemies.forEach(en => {
                                    const d = Math.hypot(en.x - player.x, en.y - player.y);
                                    if (d < 150) {
                                        en.confused = true;
                                        en.confusedUntil = now + 3000;
                                    }
                                });
                                sfxRef.current?.dash();
                                createParticles(player.x, player.y, '#666666', 40, 15);
                                break;

                            case 'vampire':
                                // Blood Drain - AoE lifesteal
                                const drainRadius = 150;
                                let totalDrained = 0;
                                gs.enemies.forEach(en => {
                                    const d = Math.hypot(en.x - player.x, en.y - player.y);
                                    if (d < drainRadius) {
                                        const drainDmg = player.damage * 2;
                                        en.health -= drainDmg;
                                        en.hitFlash = 10;
                                        totalDrained += drainDmg;
                                        createParticles(en.x, en.y, '#ff0044', 10, 6);
                                    }
                                });
                                player.health = Math.min(player.maxHealth, player.health + totalDrained * 0.5);
                                sfxRef.current?.healthPickup();
                                createParticles(player.x, player.y, '#ff0044', 30, 12);
                                break;

                            case 'engineer':
                                // Deploy Turret
                                gs.turrets = gs.turrets || [];
                                gs.turrets.push({
                                    x: player.x,
                                    y: player.y,
                                    health: 100,
                                    lastShot: 0,
                                    damage: player.damage * 0.8
                                });
                                sfxRef.current?.powerup();
                                createParticles(player.x, player.y, '#ffaa00', 20, 10);
                                break;

                            case 'medic':
                                // Heal Pulse - heal 40%
                                player.health = Math.min(player.maxHealth, player.health + player.maxHealth * 0.4);
                                sfxRef.current?.healthPickup();
                                createParticles(player.x, player.y, '#00ff88', 30, 15);
                                break;

                            case 'gambler':
                                // All In - double or nothing
                                player.gamblerAllIn = true;
                                player.gamblerAllInShots = 10;
                                sfxRef.current?.powerup();
                                createParticles(player.x, player.y, '#ffcc00', 25, 10);
                                break;

                            case 'paladin':
                                // Divine Shield - block then heal
                                player.invulnerable = true;
                                player.invulnerableUntil = now + 2000;
                                setTimeout(() => {
                                    player.health = Math.min(player.maxHealth, player.health + player.maxHealth * 0.2);
                                    createParticles(player.x, player.y, '#ffff88', 20, 10);
                                    sfxRef.current?.healthPickup();
                                }, 2000);
                                sfxRef.current?.shieldHit();
                                createParticles(player.x, player.y, '#ffdd44', 30, 12);
                                break;

                            case 'necromancer':
                                // Raise Dead - spawn minions from recent kills
                                gs.minions = gs.minions || [];
                                const maxMinions = 5;
                                for (let i = 0; i < maxMinions && gs.recentKills && gs.recentKills.length > 0; i++) {
                                    const kill = gs.recentKills.pop();
                                    gs.minions.push({
                                        x: kill.x + (Math.random() - 0.5) * 50,
                                        y: kill.y + (Math.random() - 0.5) * 50,
                                        health: 30,
                                        damage: player.damage * 0.5,
                                        speed: 3,
                                        size: 15
                                    });
                                }
                                sfxRef.current?.bossSpawn();
                                createParticles(player.x, player.y, '#8844aa', 30, 12);
                                break;

                            case 'elemental':
                                // Elemental Burst - all elements
                                const burstRadius = 180;
                                gs.enemies.forEach(en => {
                                    const d = Math.hypot(en.x - player.x, en.y - player.y);
                                    if (d < burstRadius) {
                                        en.health -= player.damage * 2;
                                        en.burning = true; en.burnDamage = 3; en.burnEnd = now + 3000;
                                        en.frozen = true; en.frozenEnd = now + 2000;
                                        if (!en.originalSpeed) en.originalSpeed = en.speed;
                                        en.speed *= 0.5;
                                        en.hitFlash = 15;
                                    }
                                });
                                sfxRef.current?.explosionBig();
                                triggerScreenShake(0.8);
                                createParticles(player.x, player.y, '#ff4400', 20, 15);
                                createParticles(player.x, player.y, '#44aaff', 20, 15);
                                createParticles(player.x, player.y, '#ffff00', 20, 15);
                                break;

                            case 'rogue':
                                // Cheap Shot - stun + 3x damage
                                player.cheapShot = true;
                                sfxRef.current?.criticalHit();
                                createParticles(player.x, player.y, '#44ffaa', 20, 10);
                                break;

                            case 'glass_cannon':
                                // Overload - 100% damage then stun
                                player.overloadUntil = now + 5000;
                                setTimeout(() => {
                                    player.stunned = true;
                                    setTimeout(() => { player.stunned = false; }, 1500);
                                }, 5000);
                                sfxRef.current?.powerup();
                                createParticles(player.x, player.y, '#ff44ff', 30, 15);
                                break;
                        }
                    }
                }
            }
        };
        
        const handleKeyUp = (e) => {
            if (gameStateRef.current) {
                gameStateRef.current.keys[e.key.toLowerCase()] = false;
            }
        };

        const handleMouseMove = (e) => {
            if (gameStateRef.current && canvasRef.current) {
                const rect = canvasRef.current.getBoundingClientRect();
                gameStateRef.current.mouse.x = e.clientX - rect.left;
                gameStateRef.current.mouse.y = e.clientY - rect.top;
            }
        };

        const handleMouseDown = () => {
            if (gameStateRef.current) {
                gameStateRef.current.mouse.down = true;
            }
        };

        const handleMouseUp = () => {
            if (gameStateRef.current) {
                gameStateRef.current.mouse.down = false;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mousedown', handleMouseDown);
        window.addEventListener('mouseup', handleMouseUp);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mousedown', handleMouseDown);
            window.removeEventListener('mouseup', handleMouseUp);
            cancelAnimationFrame(animationRef.current);
        };
    }, []);

    useEffect(() => {
        const handleResize = () => {
            if (canvasRef.current && gameStateRef.current) {
                const rect = canvasRef.current.getBoundingClientRect();
                canvasRef.current.width = rect.width || window.innerWidth;
                canvasRef.current.height = rect.height || window.innerHeight;
                gameStateRef.current.canvas = canvasRef.current;
            }
        };

        window.addEventListener('resize', handleResize);
        // Initial size
        handleResize();
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <div className="w-full h-screen bg-[#0a0a0f] overflow-hidden relative touch-none">
            {!gameStarted && !classSelected ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center z-20 bg-gradient-to-b from-[#0a0a0f] via-[#1a0a1f] to-[#0a0a0f] pointer-events-auto">
                    <div className="relative">
                        <h1 className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-pink-500 to-red-500 tracking-tighter mb-2 animate-pulse">
                            CARNAGE
                        </h1>
                        <div className="absolute -inset-4 bg-gradient-to-r from-cyan-500/20 via-pink-500/20 to-red-500/20 blur-3xl -z-10" />
                    </div>
                    <p className="text-gray-400 text-lg tracking-widest mb-12 uppercase">Arena Roguelike</p>
                    
                    <Button 
                        onClick={() => setClassSelected(true)}
                        className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-500 hover:to-pink-500 text-white font-bold text-xl px-12 py-6 rounded-none border-2 border-white/20 transition-all duration-300 hover:scale-105 hover:border-white/50"
                    >
                        START CARNAGE
                    </Button>

                    <div className="mt-12 flex gap-4">
                        <Button 
                            onClick={() => setShowLog(true)}
                            className="bg-gray-800 hover:bg-gray-700 text-green-400 font-mono border border-green-500/30"
                        >
                            [LOG]
                        </Button>
                    </div>

                    <div className="mt-8 text-gray-500 text-center">
                        <p className="mb-2"><span className="text-gray-300">WASD</span> - Move</p>
                        <p className="mb-2"><span className="text-gray-300">MOUSE</span> - Aim</p>
                        <p><span className="text-gray-300">HOLD CLICK</span> - Shoot</p>
                    </div>
                </div>
            ) : null}

            {classSelected && !gameStarted && (
                <ClassSelection onSelect={handleClassSelect} />
            )}

            <canvas 
                ref={canvasRef}
                className="absolute inset-0 w-full h-full"
                style={{ 
                    display: gameStarted ? 'block' : 'none',
                    backgroundColor: '#0a0a0f'
                }}
            />

            {gameStarted && !gameOver && (
                <>
                    <GameUI {...uiState} />
                    <EnemyCounter enemies={gameStateRef.current?.enemies || []} />
                </>
            )}

            {showUpgrades && (
                <UpgradeModal
                    upgrades={availableUpgrades}
                    onSelect={applyUpgrade}
                    wave={uiState.wave}
                    rerolls={rerolls}
                    maxRerolls={maxRerolls}
                    onReroll={handleReroll}
                />
            )}

            {gameOver && finalStats && (
                <GameOverScreen 
                    stats={finalStats}
                    onRestart={restartGame}
                />
            )}

            {showCheatPopup && (
                <CheatPopup 
                    onActivate={() => {
                        setCheatsEnabled(true);
                        setShowCheatPopup(false);
                    }}
                    onCancel={() => setShowCheatPopup(false)}
                />
            )}

            {showLog && (
                <EnemyLog 
                    onClose={() => { setShowLog(false); setSandboxMode(false); }}
                    sandboxMode={sandboxMode}
                    onSpawnEnemy={(type) => {
                        const gs = gameStateRef.current;
                        if (!gs || !sandboxMode) return;

                        const player = gs.player;
                        const angle = Math.random() * Math.PI * 2;
                        const dist = 200 + Math.random() * 100;
                        const x = player.x + Math.cos(angle) * dist;
                        const y = player.y + Math.sin(angle) * dist;

                        const enemyConfigs = {
                            // Basic enemies
                            basic: { health: 30, speed: 2, damage: 5, size: 18, color: '#ff4444', points: 10 },
                            runner: { health: 15, speed: 2.4, damage: 2.5, size: 16, color: '#ff6666', points: 12 },

                            // Tanky enemies
                            brute: { health: 45, speed: 1.8, damage: 10, size: 22, color: '#cc2222', points: 18 },
                            heavy: { health: 60, speed: 2, damage: 20, size: 36, color: '#880022', points: 35 },
                            juggernaut: { health: 200, speed: 0.8, damage: 25, size: 45, color: '#660000', points: 60 },
                            goliath: { health: 120, speed: 1.4, damage: 15, size: 38, color: '#551122', points: 50, regenerates: true },
                            ironclad: { health: 100, speed: 1.6, damage: 12, size: 30, color: '#444466', points: 45, explosionResist: true },

                            // Speed enemies
                            speeder: { health: 15, speed: 4, damage: 5, size: 16, color: '#ffff44', points: 25 },
                            blitzer: { health: 12, speed: 5, damage: 4, size: 14, color: '#ffaa00', points: 30, leavesTrail: true },
                            phantom: { health: 25, speed: 3.5, damage: 6, size: 16, color: '#aa44ff', points: 35, phasing: true },
                            striker: { health: 20, speed: 3, damage: 7, size: 17, color: '#ff8888', points: 28, speedsWhenHurt: true },
                            dasher: { health: 30, speed: 2, damage: 8, size: 18, color: '#00ffff', points: 22, dashes: true },

                            // Explosion enemies
                            bloater: { health: 20, speed: 2.4, damage: 2.5, size: 22, color: '#ff8844', points: 20, explodes: true, fuseTime: 3 },
                            nuke: { health: 100, speed: 0.8, damage: 50, size: 45, color: '#ff00ff', points: 100, explodes: true, fuseTime: 5, bigExplosion: true },
                            cluster: { health: 35, speed: 1.8, damage: 8, size: 24, color: '#ff6600', points: 40, explodes: true, fuseTime: 4, spawnsMiniBombs: true },
                            volatile: { health: 18, speed: 2.2, damage: 15, size: 20, color: '#ffcc00', points: 25, explodesOnHit: true },
                            inferno: { health: 40, speed: 1.5, damage: 10, size: 22, color: '#ff3300', points: 45, leavesFireTrail: true, explodes: true, fuseTime: 6 },
                            detonator: { health: 15, speed: 2.8, damage: 20, size: 18, color: '#ff0044', points: 30, explodes: true, fuseTime: 1.5 },
                            megaton: { health: 250, speed: 0.5, damage: 80, size: 55, color: '#ff00aa', points: 150, explodes: true, fuseTime: 8, bigExplosion: true, hugeExplosion: true },

                            // Ranged enemies
                            spitter: { health: 25, speed: 1.5, damage: 6, size: 18, color: '#88ff44', points: 15, shoots: true },
                            shambler: { health: 40, speed: 1.2, damage: 3, size: 20, color: '#8888ff', points: 25, cloudShooter: true },
                            sniper: { health: 30, speed: 1.0, damage: 18, size: 18, color: '#44ff88', points: 35, shoots: true, sniperShot: true },
                            gunner: { health: 35, speed: 1.3, damage: 4, size: 20, color: '#44ffaa', points: 32, shoots: true, rapidFire: true },
                            mortar: { health: 45, speed: 1.0, damage: 12, size: 24, color: '#88ffcc', points: 40, mortarShot: true },

                            // Boss
                            boss: { health: 300, speed: 1.5, damage: 15, size: 50, color: '#ff0066', points: 100 }
                        };

                        const config = enemyConfigs[type];
                        if (!config) return;

                        const enemy = {
                            x, y,
                            health: config.health,
                            maxHealth: config.health,
                            speed: config.speed,
                            baseSpeed: config.speed,
                            damage: config.damage,
                            size: config.size,
                            color: config.color,
                            points: config.points,
                            type,
                            shoots: config.shoots,
                            cloudShooter: config.cloudShooter,
                            lastShot: 0,
                            lastMeleeHit: 0,
                            hitFlash: 0,
                            explodes: config.explodes,
                            fuseTime: config.fuseTime,
                            bigExplosion: config.bigExplosion,
                            hugeExplosion: config.hugeExplosion,
                            spawnTime: Date.now(),
                            dashes: config.dashes,
                            dashCooldown: 0,
                            isDashing: false,
                            dashAngle: 0,
                            // New properties
                            regenerates: config.regenerates,
                            explosionResist: config.explosionResist,
                            leavesTrail: config.leavesTrail,
                            phasing: config.phasing,
                            speedsWhenHurt: config.speedsWhenHurt,
                            spawnsMiniBombs: config.spawnsMiniBombs,
                            explodesOnHit: config.explodesOnHit,
                            leavesFireTrail: config.leavesFireTrail,
                            sniperShot: config.sniperShot,
                            rapidFire: config.rapidFire,
                            mortarShot: config.mortarShot,
                            lastTrail: 0,
                            lastRegen: 0
                        };

                        gs.enemies.push(enemy);
                        createParticles(x, y, config.color, 15, 8);
                    }}
                />
            )}
        </div>
    );
}