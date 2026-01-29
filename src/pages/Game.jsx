import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import GameUI from '@/components/game/GameUI';
import UpgradeModal from '@/components/game/UpgradeModal';
import GameOverScreen from '@/components/game/GameOverScreen';
import ClassSelection from '@/components/game/ClassSelection';
import EnemyLog from '@/components/game/EnemyLog';
import WeaponLog from '@/components/game/WeaponLog';
import EnemyCounter from '@/components/game/EnemyCounter';
import CheatPopup from '@/components/game/CheatPopup';
import SandboxUI, { OBSTACLE_TYPES } from '@/components/game/SandboxUI';
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
    const [upgradeHistory, setUpgradeHistory] = useState([]);
    const [showLog, setShowLog] = useState(false);
    const [showWeaponLog, setShowWeaponLog] = useState(false);
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
            difficultyMultiplier: 1,
            sandboxMode: false,
            obstacles: []
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
        // Boss selection based on wave
        const earlyBosses = ['boss_warlord', 'boss_spitter', 'boss_berserker'];
        const midBosses = ['boss_titan', 'boss_overlord', 'boss_shambler', 'boss_inferno', 'boss_swarm'];
        const lateBosses = ['boss_destroyer', 'boss_nuclear', 'boss_phantom', 'boss_sniper', 'boss_frost', 'boss_lightning'];
        const endgameBosses = ['boss_juggernaut', 'boss_summoner', 'boss_executioner', 'boss_hivemind'];

        let bossPool = earlyBosses;
        if (wave >= 10) bossPool = [...earlyBosses, ...midBosses];
        if (wave >= 15) bossPool = [...midBosses, ...lateBosses];
        if (wave >= 20) bossPool = [...lateBosses, ...endgameBosses];
        if (wave >= 30) bossPool = endgameBosses;

        const bossType = bossPool[Math.floor(Math.random() * bossPool.length)];

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
            boss_destroyer: { health: 350 * wave, speed: 2.0, damage: 25, size: 50, color: '#00ff88', points: 175 * wave, bossType: 'destroyer', charges: true, explosiveAttack: true },
            // New boss types
            boss_spitter: { health: 320 * wave, speed: 1.4, damage: 10, size: 50, color: '#44ff00', points: 120 * wave, bossType: 'spitter', shoots: true, acidShot: true, createsAcidPools: true },
            boss_nuclear: { health: 450 * wave, speed: 0.8, damage: 30, size: 65, color: '#00ff00', points: 200 * wave, bossType: 'nuclear', explodes: true, bigExplosion: true, hugeExplosion: true, radiationAura: true },
            boss_shambler: { health: 380 * wave, speed: 1.2, damage: 8, size: 55, color: '#8844ff', points: 140 * wave, bossType: 'shambler', cloudShooter: true, megaCloud: true },
            boss_swarm: { health: 280 * wave, speed: 1.6, damage: 8, size: 45, color: '#ff44ff', points: 130 * wave, bossType: 'swarm', spawnsMinions: true, spawnRate: 3000 },
            boss_phantom: { health: 250 * wave, speed: 2.5, damage: 15, size: 40, color: '#aa00ff', points: 160 * wave, bossType: 'phantom', phasing: true, teleports: true, invisible: true },
            boss_inferno: { health: 350 * wave, speed: 1.5, damage: 18, size: 50, color: '#ff4400', points: 145 * wave, bossType: 'inferno', leavesFireTrail: true, napalmAttack: true },
            boss_sniper: { health: 200 * wave, speed: 1.0, damage: 35, size: 42, color: '#00ffaa', points: 155 * wave, bossType: 'sniper', shoots: true, sniperShot: true, tripleSnipe: true },
            boss_juggernaut: { health: 800 * wave, speed: 0.6, damage: 40, size: 75, color: '#660066', points: 250 * wave, bossType: 'juggernaut', armor: 0.4, regenerates: true },
            boss_berserker: { health: 300 * wave, speed: 1.8, damage: 15, size: 48, color: '#ff2222', points: 165 * wave, bossType: 'berserker', enrages: true, enrageMultiplier: 3 },
            boss_summoner: { health: 350 * wave, speed: 1.0, damage: 5, size: 50, color: '#ffff00', points: 180 * wave, bossType: 'summoner', spawnsMinions: true, spawnRate: 2000, summonsBosses: wave >= 25 },
            boss_lightning: { health: 320 * wave, speed: 2.0, damage: 12, size: 45, color: '#00ffff', points: 170 * wave, bossType: 'lightning', shoots: true, lightningAttack: true, chainLightning: true },
            boss_frost: { health: 400 * wave, speed: 1.3, damage: 14, size: 55, color: '#88ddff', points: 150 * wave, bossType: 'frost', shoots: true, freezeAttack: true, frostAura: true },
            boss_executioner: { health: 280 * wave, speed: 2.2, damage: 50, size: 52, color: '#880000', points: 190 * wave, bossType: 'executioner', charges: true, executeThreshold: 0.3 },
            boss_hivemind: { health: 500 * wave, speed: 0.9, damage: 10, size: 60, color: '#ffaa00', points: 220 * wave, bossType: 'hivemind', spawnsMinions: true, spawnRate: 1500, controlsMinions: true }
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

        // Play melee sound (chainsaw has unique sound)
        if (attackData.chainsaw) {
            sfxRef.current?.chainsaw();
        } else {
            sfxRef.current?.meleeSwing();
        }

        // Create swing particles (more for chainsaw)
        const particleCount = attackData.chainsaw ? 12 : 8;
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

    const createHitscan = useCallback((hitscanData) => {
        const gs = gameStateRef.current;
        if (!gs) return;

        const { player, enemies, canvas, ctx } = gs;
        const { x, y, angle, range, damage, piercing, color, beamWidth, screenShake,
                explosive, explosionRadius, chain, chainRange, chainCount,
                burn, burnDamage, burnDuration, knockback, disintegrate, headshotMultiplier } = hitscanData;

        // Calculate end point
        const endX = x + Math.cos(angle) * range;
        const endY = y + Math.sin(angle) * range;

        // Store hitscan beam for rendering
        gs.hitscanBeams = gs.hitscanBeams || [];
        gs.hitscanBeams.push({
            x1: x,
            y1: y,
            x2: endX,
            y2: endY,
            color,
            width: beamWidth,
            life: 1,
            decay: 0.15
        });

        // Screen shake
        if (screenShake && screenShake > 0) {
            gs.screenShake.intensity = Math.max(gs.screenShake.intensity, screenShake);
        }

        // Play sound based on weapon characteristics
        if (disintegrate) {
            sfxRef.current?.shootRailgun();
        } else if (explosive) {
            sfxRef.current?.shootPlasma();
        } else {
            sfxRef.current?.shootSniper();
        }

        // Find all enemies along the line (sorted by distance)
        const hitEnemies = [];
        enemies.forEach((e, idx) => {
            // Point-to-line distance calculation
            const dx = endX - x;
            const dy = endY - y;
            const len = Math.hypot(dx, dy);
            const nx = dx / len;
            const ny = dy / len;

            // Vector from ray start to enemy center
            const ex = e.x - x;
            const ey = e.y - y;

            // Project enemy onto ray
            const dot = ex * nx + ey * ny;

            // Check if projection is within ray length
            if (dot < 0 || dot > len) return;

            // Closest point on ray to enemy center
            const closestX = x + nx * dot;
            const closestY = y + ny * dot;

            // Distance from closest point to enemy center
            const dist = Math.hypot(e.x - closestX, e.y - closestY);

            // Check if beam hits enemy (beam width + enemy size)
            if (dist < e.size + beamWidth / 2) {
                hitEnemies.push({ enemy: e, index: idx, distance: dot });
            }
        });

        // Sort by distance (closest first)
        hitEnemies.sort((a, b) => a.distance - b.distance);

        // Apply damage to hit enemies (respecting piercing)
        let enemiesHit = 0;
        const maxHits = piercing + 1;
        const chainTargets = [];

        for (const hit of hitEnemies) {
            if (enemiesHit >= maxHits) break;

            const e = hit.enemy;
            let finalDamage = damage;

            // Headshot multiplier (random chance for "critical" on hitscan)
            let isCrit = false;
            if (headshotMultiplier && Math.random() < 0.15) {
                finalDamage *= headshotMultiplier;
                isCrit = true;
            }

            // Apply player crit
            if (!isCrit && player.critChance && Math.random() < player.critChance) {
                finalDamage *= player.critMultiplier || 2;
                isCrit = true;
            }

            // Armor reduction
            if (e.armor) {
                finalDamage *= (1 - e.armor);
            }

            e.health -= finalDamage;
            e.hitFlash = 5;
            createDamageNumber(e.x, e.y - e.size, finalDamage, isCrit);

            // Impact particles
            const hitX = x + Math.cos(angle) * hit.distance;
            const hitY = y + Math.sin(angle) * hit.distance;
            gs.particles.push({
                x: hitX,
                y: hitY,
                vx: -Math.cos(angle) * 3 + (Math.random() - 0.5) * 4,
                vy: -Math.sin(angle) * 3 + (Math.random() - 0.5) * 4,
                life: 1,
                decay: 0.1,
                size: 6,
                color: color,
                type: 'spark'
            });

            // Knockback
            if (knockback && knockback > 0) {
                e.x += Math.cos(angle) * knockback;
                e.y += Math.sin(angle) * knockback;
            }

            // Burn effect
            if (burn) {
                e.burning = true;
                e.burnDamage = burnDamage || 2;
                e.burnEnd = Date.now() + (burnDuration || 2000);
            }

            // Explosive hit
            if (explosive && explosionRadius) {
                createParticles(e.x, e.y, '#ff8800', 15, 8);
                createRingExplosion(e.x, e.y, color, explosionRadius);
                // Damage nearby enemies
                enemies.forEach(other => {
                    if (other !== e) {
                        const d = Math.hypot(other.x - e.x, other.y - e.y);
                        if (d < explosionRadius) {
                            const splashDmg = finalDamage * 0.5 * (1 - d / explosionRadius);
                            other.health -= splashDmg;
                            other.hitFlash = 3;
                            createDamageNumber(other.x, other.y - other.size, splashDmg, false);
                        }
                    }
                });
            }

            // Disintegrate effect (instant kill low health enemies)
            if (disintegrate && e.health <= e.maxHealth * 0.3) {
                e.health = 0;
                createParticles(e.x, e.y, '#ff4400', 30, 12);
                sfxRef.current?.criticalHit();
            }

            // Chain lightning tracking
            if (chain) {
                chainTargets.push(e);
            }

            // Lifesteal
            if (player.lifesteal > 0) {
                player.health = Math.min(player.maxHealth, player.health + finalDamage * player.lifesteal);
            }

            enemiesHit++;

            // Create beam termination point at hit location (shorten beam visually)
            if (enemiesHit >= maxHits && gs.hitscanBeams.length > 0) {
                const beam = gs.hitscanBeams[gs.hitscanBeams.length - 1];
                beam.x2 = hitX;
                beam.y2 = hitY;
            }
        }

        // Chain lightning effect
        if (chain && chainTargets.length > 0 && chainCount > 0) {
            let lastTarget = chainTargets[chainTargets.length - 1];
            let chainsRemaining = chainCount;

            while (chainsRemaining > 0 && lastTarget) {
                let nearestEnemy = null;
                let nearestDist = chainRange || 100;

                enemies.forEach(e => {
                    if (e !== lastTarget && !chainTargets.includes(e)) {
                        const d = Math.hypot(e.x - lastTarget.x, e.y - lastTarget.y);
                        if (d < nearestDist) {
                            nearestDist = d;
                            nearestEnemy = e;
                        }
                    }
                });

                if (nearestEnemy) {
                    // Draw chain beam
                    gs.hitscanBeams.push({
                        x1: lastTarget.x,
                        y1: lastTarget.y,
                        x2: nearestEnemy.x,
                        y2: nearestEnemy.y,
                        color: '#ffff00',
                        width: 2,
                        life: 1,
                        decay: 0.2
                    });

                    // Chain damage (reduced)
                    const chainDamage = damage * 0.5;
                    nearestEnemy.health -= chainDamage;
                    nearestEnemy.hitFlash = 3;
                    createDamageNumber(nearestEnemy.x, nearestEnemy.y - nearestEnemy.size, chainDamage, false);

                    chainTargets.push(nearestEnemy);
                    lastTarget = nearestEnemy;
                    chainsRemaining--;

                    sfxRef.current?.chainLightning();
                } else {
                    break;
                }
            }
        }

        // Muzzle flash
        gs.particles.push({
            x: x + Math.cos(angle) * 25,
            y: y + Math.sin(angle) * 25,
            vx: 0,
            vy: 0,
            life: 1,
            decay: 0.3,
            size: beamWidth * 3,
            color: color,
            type: 'default'
        });
    }, [createParticles, createDamageNumber, createRingExplosion]);

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
            // Filter out current weapon, exclusive weapons, and super rare weapons
            const weaponKeys = Object.keys(WEAPONS).filter(w => {
                const weapon = WEAPONS[w];
                return w !== gs?.player?.currentWeapon && !weapon.samuraiExclusive && !weapon.superRare;
            });
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
            const player = gs?.player;
            gearKeys.forEach(key => {
                const gear = GEAR[key];

                // Check gear requirements
                if (gear.requires) {
                    const reqKey = gear.requires;
                    // Check if player has the required gear
                    if (reqKey === 'dash' && !player?.hasDash) return;
                    if (reqKey === 'dash_v2' && !player?.hasDashV2) return;
                }

                // Don't offer gear the player already has
                if (key === 'dash' && player?.hasDash) return;
                if (key === 'dash_v2' && player?.hasDashV2) return;
                if (key === 'blitz' && player?.hasBlitz) return;
                if (key === 'sandevistan' && player?.hasSandevistan) return;
                if (key === 'particle_accelerator' && player?.hasParticleAccelerator) return;
                if (key === 'afterburner' && player?.hasAfterburner) return;
                if (key === 'control_module' && player?.hasControlModule) return;

                const gearUpgrade = createGearUpgrade(key);
                // Assign rarity based on gear type
                const legendaryGear = ['orbital', 'time_slow', 'second_wind', 'sandevistan', 'blitz'];
                const epicGear = ['chain_lightning', 'homing', 'teleport', 'gravity_well', 'overcharge', 'particle_accelerator', 'dash_v2'];
                const rareGear = ['drone', 'dash', 'shield_gen', 'fortress', 'executioner', 'afterburner', 'control_module'];
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

        return selectWeighted(allUpgrades, 4);
    }, []);

    const applyUpgrade = useCallback((upgrade) => {
        const gs = gameStateRef.current;
        if (gs) {
            upgrade.apply(gs.player);
            sfxRef.current?.upgrade();
            // Track upgrade history
            setUpgradeHistory(prev => [...prev, {
                id: upgrade.id,
                name: upgrade.name,
                icon: upgrade.icon,
                rarity: upgrade.rarity,
                wave: gs.wave - 1
            }]);
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

        // Draw obstacles
        if (gs.obstacles && gs.obstacles.length > 0) {
            gs.obstacles.forEach(obs => {
                ctx.fillStyle = obs.color;
                ctx.globalAlpha = obs.slow || obs.heal ? 0.4 : 0.8;
                ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
                ctx.globalAlpha = 1;

                // Border
                ctx.strokeStyle = obs.damage ? '#ff0000' : obs.slow ? '#00ffff' : obs.heal ? '#00ff00' : obs.bounce ? '#ffaa00' : '#ffffff';
                ctx.lineWidth = 2;
                ctx.strokeRect(obs.x, obs.y, obs.width, obs.height);

                // Effects
                if (obs.damage && Math.random() > 0.7) {
                    ctx.fillStyle = '#ff4444';
                    ctx.beginPath();
                    ctx.arc(
                        obs.x + Math.random() * obs.width,
                        obs.y + Math.random() * obs.height,
                        2 + Math.random() * 3,
                        0, Math.PI * 2
                    );
                    ctx.fill();
                }
                if (obs.heal && Math.random() > 0.8) {
                    ctx.fillStyle = '#44ff44';
                    ctx.font = '12px monospace';
                    ctx.fillText('+', obs.x + Math.random() * obs.width, obs.y + Math.random() * obs.height);
                }
            });
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
        
        // Dash handling (supports V1, V2, Particle Accelerator, and BLITZ)
        if (keys.x && (player.hasDash || player.hasParticleAccelerator) && !player.dashActive) {
            if (!player.lastDash || now - player.lastDash > 5000) {
                player.dashActive = true;
                player.dashEndTime = now + 2000;
                player.lastDash = now;

                // Determine dash power based on module
                if (player.hasBlitz) {
                    player.dashPower = 15; // BLITZ: 15x speed
                    player.blitzActive = true;
                    createParticles(player.x, player.y, '#ff0000', 40, 12);
                    sfxRef.current?.dash();
                    triggerScreenShake(0.6);
                } else if (player.hasParticleAccelerator || player.hasDashV2) {
                    player.dashPower = 10; // V2/Particle: 10x speed
                    createParticles(player.x, player.y, '#ff6600', 30, 10);
                    sfxRef.current?.dash();
                } else {
                    player.dashPower = 4; // V1: 4x speed
                    createParticles(player.x, player.y, '#00ffff', 20, 8);
                    sfxRef.current?.dash();
                }
            }
        }

        if (player.dashActive && now < player.dashEndTime) {
            // Different trail colors based on module
            const trailColor = player.hasBlitz ? '#ff0000' :
                              (player.hasParticleAccelerator || player.hasDashV2) ? '#ff6600' : '#00ffff';
            createParticles(player.x, player.y, trailColor, 3, 3);

            // Afterburner fire trail for Particle Accelerator and BLITZ
            if ((player.hasParticleAccelerator || player.hasBlitz) && !player.lastFireTrail || now - player.lastFireTrail > 100) {
                player.lastFireTrail = now;
                gs.fireZones = gs.fireZones || [];
                gs.fireZones.push({
                    x: player.x,
                    y: player.y,
                    radius: 25,
                    damage: 5,
                    endTime: now + 3000,
                    color: player.hasBlitz ? '#ff2200' : '#ff6600'
                });
            }
        } else if (player.dashActive) {
            player.dashActive = false;
            player.blitzActive = false;
            player.dashPower = 1;
        }

        // Sandevistan (Z key) - Time slows, player speeds up
        if (keys.z && player.hasSandevistan && !player.sandevistanActive) {
            if (!player.lastSandevistan || now - player.lastSandevistan > 30000) {
                player.sandevistanActive = true;
                player.sandevistanEndTime = now + 10000; // Active for 10 seconds
                player.lastSandevistan = now;
                gs.timeSlowUntil = now + 20000; // Time slows for 20 seconds
                gs.sandevistanTimeMultiplier = 0.2; // 80% slow
                createParticles(player.x, player.y, '#ff00ff', 50, 20);
                triggerScreenShake(0.4);
                sfxRef.current?.chronosphere();
            }
        }

        // Update Sandevistan state
        if (player.sandevistanActive) {
            if (now < player.sandevistanEndTime) {
                // Player is sped up during Sandevistan
                player.sandevistanBonus = 3; // 200% extra speed (3x total)
                createParticles(player.x, player.y, '#ff00ff', 1, 2);
            } else {
                player.sandevistanActive = false;
                player.sandevistanBonus = 1;
            }
        }

        // Passive Afterburner trail when at 150%+ speed (not during dash - that has its own trail)
        const currentSpeedPercent = (player.isSprinting ? 1.5 : 1) * (player.momentumBonus || 1);
        if (player.hasAfterburner && currentSpeedPercent >= 1.5 && !player.dashActive && (dx !== 0 || dy !== 0)) {
            if (!player.lastAfterburnerTrail || now - player.lastAfterburnerTrail > 150) {
                player.lastAfterburnerTrail = now;
                gs.fireZones = gs.fireZones || [];
                gs.fireZones.push({
                    x: player.x,
                    y: player.y,
                    radius: 20,
                    damage: 5,
                    endTime: now + 2000,
                    color: '#ff4400'
                });
            }
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
        const frostSlowPenalty = (player.frostSlowed && player.frostSlowUntil > now) ? 0.5 : 1;
        const dashBonus = player.dashActive ? (player.dashPower || 4) : 1;
        const sandevistanBonus = player.sandevistanBonus || 1;
        const obstacleSlowFactor = player.obstacleSlowed ? (player.obstacleSlowFactor || 0.4) : 1;
        const speedMultiplier = (player.dashActive ? dashBonus : (player.isSprinting ? 1.5 : 1))
            * momentumBonus * quickstepBonus * slipstreamBonus * (nitroActive ? 2 : 1) * afterburnerBonus * frostSlowPenalty * sandevistanBonus * obstacleSlowFactor;

        // Store current speed for afterburner check
        player.momentumBonus = momentumBonus;

        // Initialize velocity for drifting
        if (!player.velocityX) player.velocityX = 0;
        if (!player.velocityY) player.velocityY = 0;

        // Drifting mechanics (Control Module / Dash V2 / Particle Accelerator / BLITZ)
        const hasDriftCapability = player.hasControlModule || player.hasDashV2 || player.hasParticleAccelerator || player.hasBlitz;
        const isDrifting = hasDriftCapability && (player.dashActive || speedMultiplier > 3);

        if (dx !== 0 || dy !== 0) {
            const len = Math.sqrt(dx * dx + dy * dy);
            dx /= len; dy /= len;

            if (isDrifting) {
                // Drift physics: gradual acceleration, maintains momentum
                const acceleration = 0.15;
                const targetVX = dx * player.speed * speedMultiplier;
                const targetVY = dy * player.speed * speedMultiplier;

                player.velocityX += (targetVX - player.velocityX) * acceleration;
                player.velocityY += (targetVY - player.velocityY) * acceleration;

                player.x += player.velocityX;
                player.y += player.velocityY;

                // Drift particles
                if (Math.abs(player.velocityX) > 5 || Math.abs(player.velocityY) > 5) {
                    const driftAngle = Math.atan2(player.velocityY, player.velocityX);
                    const inputAngle = Math.atan2(dy, dx);
                    const angleDiff = Math.abs(driftAngle - inputAngle);
                    if (angleDiff > 0.3) {
                        createParticles(player.x, player.y, '#ffaa00', 2, 4);
                    }
                }
            } else {
                // Normal movement
                player.x += dx * player.speed * speedMultiplier;
                player.y += dy * player.speed * speedMultiplier;
                player.velocityX = dx * player.speed * speedMultiplier;
                player.velocityY = dy * player.speed * speedMultiplier;
            }

            // Create trail effect when moving fast
            if (speedMultiplier > 1.5 || nitroActive) {
                createParticles(player.x, player.y, nitroActive ? '#ff6600' : '#00ffff', 1, 2);
            }
        } else if (isDrifting) {
            // Continue drifting when not pressing keys
            const friction = 0.95;
            player.velocityX *= friction;
            player.velocityY *= friction;
            player.x += player.velocityX;
            player.y += player.velocityY;

            // Stop drifting when velocity is low
            if (Math.abs(player.velocityX) < 0.5) player.velocityX = 0;
            if (Math.abs(player.velocityY) < 0.5) player.velocityY = 0;
        }
        
        // Keep player in bounds
        player.x = Math.max(PLAYER_SIZE, Math.min(canvas.width - PLAYER_SIZE, player.x));
        player.y = Math.max(PLAYER_SIZE, Math.min(canvas.height - PLAYER_SIZE, player.y));

        // Obstacle collision effects
        if (gs.obstacles && gs.obstacles.length > 0) {
            // Reset slow flag before checking obstacles
            player.obstacleSlowed = false;

            gs.obstacles.forEach(obs => {
                // Check if player is inside obstacle
                if (player.x > obs.x - PLAYER_SIZE && player.x < obs.x + obs.width + PLAYER_SIZE &&
                    player.y > obs.y - PLAYER_SIZE && player.y < obs.y + obs.height + PLAYER_SIZE) {

                    // Solid wall collision
                    if (!obs.slow && !obs.heal && !obs.bounce && !obs.damage) {
                        // Push player out
                        const centerX = obs.x + obs.width / 2;
                        const centerY = obs.y + obs.height / 2;
                        const obsDx = player.x - centerX;
                        const obsDy = player.y - centerY;

                        if (Math.abs(obsDx) > Math.abs(obsDy)) {
                            player.x = obsDx > 0 ? obs.x + obs.width + PLAYER_SIZE : obs.x - PLAYER_SIZE;
                        } else {
                            player.y = obsDy > 0 ? obs.y + obs.height + PLAYER_SIZE : obs.y - PLAYER_SIZE;
                        }
                    }

                    // Damage zone
                    if (obs.damage && !player.invulnerable) {
                        if (!player.lastObstacleDamage || now - player.lastObstacleDamage > 500) {
                            player.lastObstacleDamage = now;
                            player.health -= 10;
                            createDamageNumber(player.x, player.y - 20, 10, false);
                            createParticles(player.x, player.y, '#ff0000', 10, 6);
                        }
                    }

                    // Slow zone
                    if (obs.slow) {
                        player.obstacleSlowed = true;
                        player.obstacleSlowFactor = 0.4;
                    }

                    // Heal zone
                    if (obs.heal) {
                        if (!player.lastObstacleHeal || now - player.lastObstacleHeal > 1000) {
                            player.lastObstacleHeal = now;
                            player.health = Math.min(player.maxHealth, player.health + 5);
                            createParticles(player.x, player.y, '#00ff00', 5, 4);
                        }
                    }

                    // Bounce pad
                    if (obs.bounce) {
                        if (!player.lastBounce || now - player.lastBounce > 500) {
                            player.lastBounce = now;
                            const bounceDir = Math.atan2(player.y - (obs.y + obs.height / 2), player.x - (obs.x + obs.width / 2));
                            player.velocityX = Math.cos(bounceDir) * 20;
                            player.velocityY = Math.sin(bounceDir) * 20;
                            createParticles(player.x, player.y, '#ffaa00', 15, 8);
                            sfxRef.current?.dash();
                        }
                    }
                }
            });
        }

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

        // Time slow effect (Sandevistan uses 80% slow, regular time slow uses 50%)
        const timeSlowActive = gs.timeSlowUntil && now < gs.timeSlowUntil;
        const sandevistanSlowMultiplier = gs.sandevistanTimeMultiplier || 0.5;
        const timeMultiplier = timeSlowActive ? (player.sandevistanActive ? sandevistanSlowMultiplier : 0.5) : 1;

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

        // Process Iai Strike (Samurai ability) - GAME PAUSES DURING THIS
        if (gs.iaiStrike && gs.iaiStrike.active) {
            const iai = gs.iaiStrike;
            const elapsed = now - iai.startTime;
            const target = iai.target;

            // Check if target still exists and is alive
            if (!target || target.health <= 0 || !enemies.includes(target)) {
                // Enemy died - shatter effect
                iai.phase = 'shatter';
                if (!iai.shatterTime) {
                    iai.shatterTime = now;
                    // Create glass shatter particles (black shards on white)
                    for (let i = 0; i < 80; i++) {
                        const angle = Math.random() * Math.PI * 2;
                        const speed = 5 + Math.random() * 20;
                        particles.push({
                            x: target.x,
                            y: target.y,
                            vx: Math.cos(angle) * speed,
                            vy: Math.sin(angle) * speed,
                            life: 90,
                            maxLife: 90,
                            color: '#000000',
                            size: 2 + Math.random() * 10,
                            type: 'glass'
                        });
                    }
                    // Sword sheathe sound
                    sfxRef.current?.meleeHeavy();
                    triggerScreenShake(1.2);
                }

                // Pause for 1 second then end
                if (now - iai.shatterTime > 1000) {
                    gs.iaiStrike = null;
                }

                // Draw shatter phase
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, canvas.width, canvas.height);

                // Draw player as black sphere during shatter
                ctx.fillStyle = '#000000';
                ctx.beginPath();
                ctx.arc(player.x, player.y, PLAYER_SIZE, 0, Math.PI * 2);
                ctx.fill();

                // Draw shatter particles
                particles.forEach(p => {
                    if (p.type === 'glass') {
                        ctx.fillStyle = p.color;
                        ctx.globalAlpha = p.life / p.maxLife;
                        ctx.fillRect(p.x - p.size/2, p.y - p.size/2, p.size, p.size * 0.3);
                        ctx.globalAlpha = 1;
                        p.x += p.vx;
                        p.y += p.vy;
                        p.vy += 0.3; // gravity
                        p.life--;
                    }
                });

                // Skip rest of game loop during Iai Strike
                ctx.restore();
                animationRef.current = requestAnimationFrame(gameLoop);
                return;
            } else {
                // Iai Strike phases
                if (iai.phase === 'whiteout') {
                    // White screen for 1 second
                    if (elapsed > 1000) {
                        iai.phase = 'slashing';
                        iai.slashStartTime = now;
                    }

                    // Draw whiteout
                    ctx.fillStyle = '#ffffff';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);

                    // Draw player as black sphere
                    ctx.fillStyle = '#000000';
                    ctx.beginPath();
                    ctx.arc(player.x, player.y, PLAYER_SIZE, 0, Math.PI * 2);
                    ctx.fill();

                    // Draw target as black sphere
                    ctx.beginPath();
                    ctx.arc(target.x, target.y, target.size, 0, Math.PI * 2);
                    ctx.fill();

                } else if (iai.phase === 'slashing' || iai.phase === 'execution') {
                    const slashElapsed = now - iai.slashStartTime;

                    // After 8 seconds, switch to execution mode
                    if (slashElapsed > 8000 && iai.phase === 'slashing') {
                        iai.phase = 'execution';
                        sfxRef.current?.criticalHit();
                    }

                    // Spawn slash every 70ms (faster!)
                    if (now - iai.lastSlash > 70) {
                        iai.lastSlash = now;
                        iai.slashCount++;

                        // Create slash line
                        const slashAngle = Math.random() * Math.PI * 2;
                        const slashLength = target.size * 4;
                        iai.slashLines.push({
                            x: target.x,
                            y: target.y,
                            angle: slashAngle,
                            length: slashLength,
                            life: 0.3,
                            maxLife: 0.3,
                            color: iai.phase === 'execution' ? '#ff0000' : '#000000'
                        });

                        // Deal damage
                        const damage = iai.phase === 'execution' ? 9999 : 20;
                        target.health -= damage;

                        // Crossfire damage to other enemies (applied even though not visible)
                        enemies.forEach(e => {
                            if (e !== target) {
                                const dist = Math.hypot(e.x - target.x, e.y - target.y);
                                if (dist < 150) {
                                    e.health -= damage * 0.3;
                                }
                            }
                        });

                        // Sword slash sound - alternate between two sounds
                        if (iai.slashCount % 2 === 0) {
                            sfxRef.current?.meleeSwing();
                        } else {
                            sfxRef.current?.meleeHit();
                        }

                        // Small screen shake per slash
                        triggerScreenShake(0.15);
                    }

                    // Update slash lines
                    iai.slashLines = iai.slashLines.filter(slash => {
                        slash.life -= 0.016;
                        return slash.life > 0;
                    });

                    // Draw slashing phase - pure white background
                    ctx.fillStyle = '#ffffff';
                    ctx.fillRect(0, 0, canvas.width, canvas.height);

                    // Draw player as black sphere
                    ctx.fillStyle = '#000000';
                    ctx.beginPath();
                    ctx.arc(player.x, player.y, PLAYER_SIZE, 0, Math.PI * 2);
                    ctx.fill();

                    // Draw target as black sphere
                    ctx.beginPath();
                    ctx.arc(target.x, target.y, target.size, 0, Math.PI * 2);
                    ctx.fill();

                    // Draw slash lines
                    iai.slashLines.forEach(slash => {
                        const alpha = slash.life / slash.maxLife;
                        ctx.strokeStyle = slash.color;
                        ctx.globalAlpha = alpha;
                        ctx.lineWidth = 2 + (1 - alpha) * 6;
                        ctx.beginPath();
                        ctx.moveTo(
                            slash.x + Math.cos(slash.angle) * slash.length,
                            slash.y + Math.sin(slash.angle) * slash.length
                        );
                        ctx.lineTo(
                            slash.x - Math.cos(slash.angle) * slash.length,
                            slash.y - Math.sin(slash.angle) * slash.length
                        );
                        ctx.stroke();
                        ctx.globalAlpha = 1;
                    });

                    // Draw damage numbers on white background
                    if (iai.slashCount > 0 && now - iai.lastSlash < 50) {
                        const damage = iai.phase === 'execution' ? 9999 : 20;
                        ctx.fillStyle = iai.phase === 'execution' ? '#ff0000' : '#333333';
                        ctx.font = iai.phase === 'execution' ? 'bold 32px monospace' : 'bold 18px monospace';
                        ctx.fillText(damage.toString(), target.x + (Math.random() - 0.5) * 40, target.y - target.size - 20);
                    }
                }

                // Skip rest of game loop during Iai Strike - game is paused
                ctx.restore();
                animationRef.current = requestAnimationFrame(gameLoop);
                return;
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
            shootWeapon(player.currentWeapon, player, mouse.x, mouse.y, shootBullet, createMeleeAttack, createHitscan);
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

                // Reset rerolls to 3 every wave (bonus +1 every 5 waves)
                const bonusRerolls = Math.floor(gs.wave / 5);
                setRerolls(maxRerolls + bonusRerolls);

                // Start next wave
                gs.wave++;
                gs.difficultyMultiplier = 1 + (gs.wave - 1) * 0.15;
                gs.enemiesThisWave = Math.floor(5 + gs.wave * 2 + Math.pow(gs.wave, 1.3));
                gs.enemiesSpawned = 0;
                gs.waveComplete = false;
            }, 1000);
        }

        // Update and draw fire zones (napalm)
        gs.fireZones = gs.fireZones || [];
        for (let i = gs.fireZones.length - 1; i >= 0; i--) {
            const zone = gs.fireZones[i];
            const elapsed = now - zone.spawnTime;

            // Remove expired zones
            if (elapsed > zone.duration) {
                gs.fireZones.splice(i, 1);
                continue;
            }

            const fadeProgress = elapsed / zone.duration;
            const currentRadius = zone.radius * (1 - fadeProgress * 0.3);

            // Draw fire zone
            ctx.globalAlpha = 0.4 * (1 - fadeProgress);
            ctx.fillStyle = zone.color;
            ctx.shadowColor = zone.color;
            ctx.shadowBlur = 20;
            ctx.beginPath();
            ctx.arc(zone.x, zone.y, currentRadius, 0, Math.PI * 2);
            ctx.fill();

            // Inner flames
            ctx.fillStyle = '#ffff00';
            ctx.globalAlpha = 0.3 * (1 - fadeProgress);
            ctx.beginPath();
            ctx.arc(zone.x, zone.y, currentRadius * 0.6, 0, Math.PI * 2);
            ctx.fill();

            ctx.shadowBlur = 0;
            ctx.globalAlpha = 1;

            // Spawn fire particles
            if (Math.random() < 0.3) {
                gs.particles.push({
                    x: zone.x + (Math.random() - 0.5) * currentRadius * 2,
                    y: zone.y + (Math.random() - 0.5) * currentRadius * 2,
                    vx: (Math.random() - 0.5) * 2,
                    vy: -2 - Math.random() * 3,
                    life: 1,
                    decay: 0.04,
                    size: 3 + Math.random() * 4,
                    color: Math.random() > 0.5 ? '#ff4400' : '#ffaa00',
                    type: 'default',
                    gravity: -0.1,
                    shrink: true
                });
            }

            // Damage enemies in zone
            enemies.forEach(e => {
                const dist = Math.hypot(e.x - zone.x, e.y - zone.y);
                if (dist < currentRadius) {
                    // Tick damage every 500ms
                    if (!e.lastFireDamage || now - e.lastFireDamage > 500) {
                        e.lastFireDamage = now;
                        e.health -= zone.damage;
                        e.hitFlash = 3;
                        e.burning = true;
                        e.burnUntil = now + 1000;
                        createDamageNumber(e.x, e.y - e.size, zone.damage, false);
                    }
                }
            });
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

            // Mine behavior - slow down and arm
            if (b.mine) {
                // Slow down over time
                b.vx *= 0.95;
                b.vy *= 0.95;

                // Check for mine lifetime
                const mineAge = now - b.spawnTime;
                if (mineAge > (b.mineLifetime || 10000)) {
                    bullets.splice(i, 1);
                    continue;
                }

                // Check if armed (stopped moving)
                const speed = Math.hypot(b.vx, b.vy);
                if (speed < 1) {
                    b.vx = 0;
                    b.vy = 0;
                    b.armed = true;

                    // Check for enemies in trigger radius
                    const triggerDist = b.triggerRadius || 50;
                    let triggered = false;
                    enemies.forEach(e => {
                        if (!triggered) {
                            const dist = Math.hypot(e.x - b.x, e.y - b.y);
                            if (dist < triggerDist + e.size) {
                                triggered = true;
                            }
                        }
                    });

                    if (triggered) {
                        // EXPLODE!
                        const radius = b.explosionRadius || 55;
                        sfxRef.current?.explosion();
                        triggerScreenShake(0.5);
                        createParticles(b.x, b.y, '#ffff00', 25, 10);
                        createRingExplosion(b.x, b.y, '#ffff00', radius);

                        // Damage all enemies in radius
                        enemies.forEach(e => {
                            const dist = Math.hypot(e.x - b.x, e.y - b.y);
                            if (dist < radius) {
                                let mineDamage = b.damage * (1 - dist / radius);
                                if (e.explosionResist) mineDamage *= 0.3;
                                e.health -= mineDamage;
                                e.hitFlash = 5;
                                createDamageNumber(e.x, e.y - e.size, mineDamage, false);
                            }
                        });

                        bullets.splice(i, 1);
                        continue;
                    }
                }
            }

            // Sticky bomb behavior - stick to first enemy hit
            if (b.sticky && !b.stuckTo) {
                enemies.forEach((e, idx) => {
                    if (!b.stuckTo) {
                        const dist = Math.hypot(e.x - b.x, e.y - b.y);
                        if (dist < e.size + b.size) {
                            b.stuckTo = idx;
                            b.stuckOffset = { x: b.x - e.x, y: b.y - e.y };
                            sfxRef.current?.hit();
                        }
                    }
                });
            }

            // Update sticky bomb position if stuck
            if (b.sticky && b.stuckTo !== undefined) {
                const target = enemies[b.stuckTo];
                if (target) {
                    b.x = target.x + b.stuckOffset.x;
                    b.y = target.y + b.stuckOffset.y;
                    b.vx = 0;
                    b.vy = 0;
                }

                // Check fuse
                if (now - b.spawnTime > (b.fuseTime || 1500)) {
                    // EXPLODE!
                    const radius = b.explosionRadius || 70;
                    sfxRef.current?.explosionBig();
                    triggerScreenShake(0.6);
                    createParticles(b.x, b.y, '#88ff00', 30, 12);
                    createRingExplosion(b.x, b.y, '#88ff00', radius);

                    // Damage all enemies in radius
                    enemies.forEach(e => {
                        const dist = Math.hypot(e.x - b.x, e.y - b.y);
                        if (dist < radius) {
                            let stickyDamage = b.damage * (1 - dist / radius * 0.5);
                            if (e.explosionResist) stickyDamage *= 0.3;
                            e.health -= stickyDamage;
                            e.hitFlash = 5;
                            createDamageNumber(e.x, e.y - e.size, stickyDamage, false);
                        }
                    });

                    bullets.splice(i, 1);
                    continue;
                }
            }

            // Impact grenade - explode on any hit
            if (b.impact && !b.isEnemy) {
                let hitSomething = false;
                enemies.forEach(e => {
                    if (!hitSomething) {
                        const dist = Math.hypot(e.x - b.x, e.y - b.y);
                        if (dist < e.size + b.size) {
                            hitSomething = true;
                        }
                    }
                });

                if (hitSomething) {
                    // Immediate explosion
                    const radius = b.explosionRadius || 65;
                    sfxRef.current?.explosion();
                    triggerScreenShake(0.4);
                    createParticles(b.x, b.y, bulletColor, 20, 10);
                    createRingExplosion(b.x, b.y, bulletColor, radius);

                    // Damage all enemies in radius
                    enemies.forEach(e => {
                        const dist = Math.hypot(e.x - b.x, e.y - b.y);
                        if (dist < radius) {
                            let impactDamage = b.damage * (1 - dist / radius * 0.3);
                            if (e.explosionResist) impactDamage *= 0.3;
                            e.health -= impactDamage;
                            e.hitFlash = 5;
                            createDamageNumber(e.x, e.y - e.size, impactDamage, false);
                        }
                    });

                    bullets.splice(i, 1);
                    continue;
                }
            }

            // Bouncer bullet - bounce off walls
            if (b.bouncer && b.maxBounces > 0) {
                if (b.x < 5) {
                    b.x = 5;
                    b.vx *= -1;
                    b.maxBounces--;
                    createParticles(b.x, b.y, b.color || '#ffff00', 5, 4);
                    sfxRef.current?.shieldHit();
                } else if (b.x > canvas.width - 5) {
                    b.x = canvas.width - 5;
                    b.vx *= -1;
                    b.maxBounces--;
                    createParticles(b.x, b.y, b.color || '#ffff00', 5, 4);
                    sfxRef.current?.shieldHit();
                }
                if (b.y < 5) {
                    b.y = 5;
                    b.vy *= -1;
                    b.maxBounces--;
                    createParticles(b.x, b.y, b.color || '#ffff00', 5, 4);
                    sfxRef.current?.shieldHit();
                } else if (b.y > canvas.height - 5) {
                    b.y = canvas.height - 5;
                    b.vy *= -1;
                    b.maxBounces--;
                    createParticles(b.x, b.y, b.color || '#ffff00', 5, 4);
                    sfxRef.current?.shieldHit();
                }
            }

            // Check bounds (skip for mortar bullets and bouncers with bounces left)
            if (!b.isMortar && !(b.bouncer && b.maxBounces > 0) && (b.x < -50 || b.x > canvas.width + 50 || b.y < -50 || b.y > canvas.height + 50)) {
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
            } else if (b.beam || b.orbitalLaser) {
                // BEAM WEAPON - Continuous laser effect
                ctx.save();
                ctx.translate(b.x, b.y);
                const beamAngle = Math.atan2(b.vy, b.vx);
                ctx.rotate(beamAngle);

                const beamLength = b.orbitalLaser ? 80 : 60;
                const beamWidth = b.orbitalLaser ? 6 : 4;

                // Outer glow
                ctx.globalAlpha = 0.3;
                ctx.fillStyle = bulletColor;
                ctx.shadowColor = bulletColor;
                ctx.shadowBlur = 30;
                ctx.fillRect(-beamLength, -beamWidth * 2, beamLength * 2, beamWidth * 4);

                // Middle layer
                ctx.globalAlpha = 0.6;
                ctx.fillRect(-beamLength, -beamWidth, beamLength * 2, beamWidth * 2);

                // Core (white hot)
                ctx.globalAlpha = 1;
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(-beamLength, -beamWidth * 0.5, beamLength * 2, beamWidth);

                // Flickering particles along beam
                ctx.fillStyle = bulletColor;
                for (let j = 0; j < 5; j++) {
                    const px = (Math.random() - 0.5) * beamLength * 2;
                    const py = (Math.random() - 0.5) * beamWidth * 2;
                    ctx.globalAlpha = 0.5 + Math.random() * 0.5;
                    ctx.beginPath();
                    ctx.arc(px, py, 2 + Math.random() * 3, 0, Math.PI * 2);
                    ctx.fill();
                }

                ctx.shadowBlur = 0;
                ctx.restore();

                // Spawn particles along the beam path
                if (Math.random() < 0.3) {
                    createParticles(b.x, b.y, bulletColor, 2, 3, 'spark');
                }
            } else if (b.flame) {
                // FLAMETHROWER - Expanding fire with multiple layers
                const age = (b.lifetime !== undefined) ? (30 - b.lifetime) / 30 : 0;
                const baseSize = b.size * (1 + age * 2); // Flames expand as they travel

                // Smoke layer (behind)
                ctx.globalAlpha = 0.2 * (1 - age);
                ctx.fillStyle = '#333333';
                ctx.beginPath();
                ctx.arc(b.x + (Math.random() - 0.5) * 5, b.y + (Math.random() - 0.5) * 5, baseSize * 1.5, 0, Math.PI * 2);
                ctx.fill();

                // Outer fire (red/orange)
                ctx.globalAlpha = 0.6 * (1 - age * 0.5);
                ctx.fillStyle = '#ff3300';
                ctx.shadowColor = '#ff6600';
                ctx.shadowBlur = 20;
                for (let j = 0; j < 3; j++) {
                    const offsetX = (Math.random() - 0.5) * baseSize;
                    const offsetY = (Math.random() - 0.5) * baseSize;
                    const flameSize = baseSize * (0.6 + Math.random() * 0.4);
                    ctx.beginPath();
                    ctx.arc(b.x + offsetX, b.y + offsetY, flameSize, 0, Math.PI * 2);
                    ctx.fill();
                }

                // Middle fire (orange/yellow)
                ctx.globalAlpha = 0.7 * (1 - age * 0.3);
                ctx.fillStyle = '#ff8800';
                ctx.beginPath();
                ctx.arc(b.x, b.y, baseSize * 0.7, 0, Math.PI * 2);
                ctx.fill();

                // Core (yellow/white hot)
                ctx.globalAlpha = 0.8 * (1 - age * 0.5);
                ctx.fillStyle = '#ffff00';
                ctx.beginPath();
                ctx.arc(b.x, b.y, baseSize * 0.4, 0, Math.PI * 2);
                ctx.fill();

                // White hot center
                ctx.globalAlpha = 0.6 * (1 - age);
                ctx.fillStyle = '#ffffff';
                ctx.beginPath();
                ctx.arc(b.x, b.y, baseSize * 0.2, 0, Math.PI * 2);
                ctx.fill();

                ctx.shadowBlur = 0;

                // Spawn ember particles
                if (Math.random() < 0.4) {
                    gs.particles.push({
                        x: b.x + (Math.random() - 0.5) * baseSize,
                        y: b.y + (Math.random() - 0.5) * baseSize,
                        vx: (Math.random() - 0.5) * 3,
                        vy: -1 - Math.random() * 2,
                        life: 1,
                        decay: 0.03,
                        size: 2 + Math.random() * 3,
                        color: Math.random() > 0.5 ? '#ff6600' : '#ffaa00',
                        type: 'spark',
                        gravity: -0.1,
                        shrink: true
                    });
                }
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
            } else if (b.acid) {
                // ACID - Bubbling toxic blob
                ctx.shadowColor = '#00ff00';
                ctx.shadowBlur = 15;

                // Main blob with wobble
                const wobble = Math.sin(now * 0.02 + b.x) * 2;
                ctx.globalAlpha = 0.8;
                ctx.fillStyle = '#44ff44';
                ctx.beginPath();
                ctx.arc(b.x, b.y, b.size + wobble, 0, Math.PI * 2);
                ctx.fill();

                // Darker core
                ctx.fillStyle = '#00aa00';
                ctx.beginPath();
                ctx.arc(b.x, b.y, b.size * 0.6, 0, Math.PI * 2);
                ctx.fill();

                // Bubbles
                ctx.fillStyle = '#88ff88';
                ctx.globalAlpha = 0.6;
                for (let j = 0; j < 3; j++) {
                    const bubbleAngle = (now * 0.01 + j * 2) % (Math.PI * 2);
                    const bubbleDist = b.size * 0.5;
                    ctx.beginPath();
                    ctx.arc(
                        b.x + Math.cos(bubbleAngle) * bubbleDist,
                        b.y + Math.sin(bubbleAngle) * bubbleDist,
                        2 + Math.random() * 2,
                        0, Math.PI * 2
                    );
                    ctx.fill();
                }

                // Dripping trail
                ctx.globalAlpha = 0.5;
                ctx.fillStyle = '#44ff44';
                ctx.beginPath();
                ctx.arc(b.x - b.vx * 0.5, b.y - b.vy * 0.5 + 5, b.size * 0.3, 0, Math.PI * 2);
                ctx.fill();

                ctx.shadowBlur = 0;

                // Spawn acid drip particles
                if (Math.random() < 0.2) {
                    gs.particles.push({
                        x: b.x,
                        y: b.y,
                        vx: (Math.random() - 0.5) * 2,
                        vy: 1 + Math.random() * 2,
                        life: 1,
                        decay: 0.05,
                        size: 3,
                        color: '#44ff44',
                        type: 'default',
                        gravity: 0.2,
                        shrink: true
                    });
                }
            } else if (b.cryo) {
                // CRYO - Icy crystal with frost
                ctx.shadowColor = '#88ddff';
                ctx.shadowBlur = 20;

                // Outer frost aura
                ctx.globalAlpha = 0.3;
                ctx.fillStyle = '#aaeeff';
                ctx.beginPath();
                ctx.arc(b.x, b.y, b.size * 1.5, 0, Math.PI * 2);
                ctx.fill();

                // Crystal shape (hexagon-ish)
                ctx.globalAlpha = 0.8;
                ctx.fillStyle = '#66ccff';
                ctx.beginPath();
                for (let j = 0; j < 6; j++) {
                    const angle = (j / 6) * Math.PI * 2 + now * 0.005;
                    const dist = b.size * (j % 2 === 0 ? 1 : 0.7);
                    if (j === 0) {
                        ctx.moveTo(b.x + Math.cos(angle) * dist, b.y + Math.sin(angle) * dist);
                    } else {
                        ctx.lineTo(b.x + Math.cos(angle) * dist, b.y + Math.sin(angle) * dist);
                    }
                }
                ctx.closePath();
                ctx.fill();

                // Inner glow
                ctx.globalAlpha = 0.9;
                ctx.fillStyle = '#ffffff';
                ctx.beginPath();
                ctx.arc(b.x, b.y, b.size * 0.3, 0, Math.PI * 2);
                ctx.fill();

                // Ice sparkles
                ctx.fillStyle = '#ffffff';
                ctx.globalAlpha = 0.8;
                for (let j = 0; j < 4; j++) {
                    const sparkAngle = Math.random() * Math.PI * 2;
                    const sparkDist = b.size * (0.5 + Math.random() * 0.8);
                    ctx.beginPath();
                    ctx.arc(
                        b.x + Math.cos(sparkAngle) * sparkDist,
                        b.y + Math.sin(sparkAngle) * sparkDist,
                        1,
                        0, Math.PI * 2
                    );
                    ctx.fill();
                }

                ctx.shadowBlur = 0;

                // Spawn frost particles
                if (Math.random() < 0.15) {
                    gs.particles.push({
                        x: b.x + (Math.random() - 0.5) * b.size * 2,
                        y: b.y + (Math.random() - 0.5) * b.size * 2,
                        vx: (Math.random() - 0.5) * 1,
                        vy: -0.5 - Math.random(),
                        life: 1,
                        decay: 0.02,
                        size: 2,
                        color: '#aaeeff',
                        type: 'spark',
                        gravity: -0.05,
                        shrink: true
                    });
                }
            } else if (b.plasma || b.pulse) {
                // PLASMA - Pulsing energy orb
                const pulsePhase = Math.sin(now * 0.015) * 0.3;
                const plasmaSize = b.size * (1 + pulsePhase);

                ctx.shadowColor = bulletColor;
                ctx.shadowBlur = 25;

                // Outer energy ring
                ctx.globalAlpha = 0.4;
                ctx.strokeStyle = bulletColor;
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.arc(b.x, b.y, plasmaSize * 1.5, 0, Math.PI * 2);
                ctx.stroke();

                // Middle glow
                ctx.globalAlpha = 0.6;
                ctx.fillStyle = bulletColor;
                ctx.beginPath();
                ctx.arc(b.x, b.y, plasmaSize, 0, Math.PI * 2);
                ctx.fill();

                // Core
                ctx.globalAlpha = 1;
                ctx.fillStyle = '#ffffff';
                ctx.beginPath();
                ctx.arc(b.x, b.y, plasmaSize * 0.4, 0, Math.PI * 2);
                ctx.fill();

                // Energy tendrils
                ctx.strokeStyle = bulletColor;
                ctx.lineWidth = 1;
                ctx.globalAlpha = 0.6;
                for (let j = 0; j < 4; j++) {
                    const tendrilAngle = (j / 4) * Math.PI * 2 + now * 0.01;
                    ctx.beginPath();
                    ctx.moveTo(b.x, b.y);
                    ctx.lineTo(
                        b.x + Math.cos(tendrilAngle) * plasmaSize * 2,
                        b.y + Math.sin(tendrilAngle) * plasmaSize * 2
                    );
                    ctx.stroke();
                }

                ctx.shadowBlur = 0;
            } else if (b.saw) {
                // SAW BLADE - Spinning blade with teeth
                ctx.save();
                ctx.translate(b.x, b.y);
                const sawRotation = now * 0.03; // Fast spin
                ctx.rotate(sawRotation);

                const sawRadius = b.size * 1.5;
                const teeth = 8;

                ctx.shadowColor = bulletColor;
                ctx.shadowBlur = 15;

                // Outer saw teeth
                ctx.fillStyle = bulletColor;
                ctx.beginPath();
                for (let j = 0; j < teeth; j++) {
                    const angle = (j / teeth) * Math.PI * 2;
                    const nextAngle = ((j + 0.5) / teeth) * Math.PI * 2;
                    const outerDist = sawRadius;
                    const innerDist = sawRadius * 0.7;
                    if (j === 0) {
                        ctx.moveTo(Math.cos(angle) * outerDist, Math.sin(angle) * outerDist);
                    }
                    ctx.lineTo(Math.cos(nextAngle) * innerDist, Math.sin(nextAngle) * innerDist);
                    ctx.lineTo(Math.cos(((j + 1) / teeth) * Math.PI * 2) * outerDist, Math.sin(((j + 1) / teeth) * Math.PI * 2) * outerDist);
                }
                ctx.closePath();
                ctx.fill();

                // Center hole
                ctx.fillStyle = '#333333';
                ctx.beginPath();
                ctx.arc(0, 0, sawRadius * 0.2, 0, Math.PI * 2);
                ctx.fill();

                // Highlight
                ctx.fillStyle = '#ffffff';
                ctx.globalAlpha = 0.4;
                ctx.beginPath();
                ctx.arc(sawRadius * 0.3, -sawRadius * 0.3, sawRadius * 0.15, 0, Math.PI * 2);
                ctx.fill();

                ctx.shadowBlur = 0;
                ctx.restore();

                // Sparks trail
                if (Math.random() < 0.3) {
                    gs.particles.push({
                        x: b.x,
                        y: b.y,
                        vx: (Math.random() - 0.5) * 4,
                        vy: (Math.random() - 0.5) * 4,
                        life: 1,
                        decay: 0.08,
                        size: 2,
                        color: '#ffff88',
                        type: 'spark',
                        gravity: 0.1,
                        shrink: true
                    });
                }
            } else if (b.bouncer) {
                // BOUNCER - Rubber ball with squish effect
                const bouncePhase = Math.sin(now * 0.02 + b.x * 0.1) * 0.15;
                const squishX = 1 + bouncePhase;
                const squishY = 1 - bouncePhase;

                ctx.save();
                ctx.translate(b.x, b.y);
                ctx.scale(squishX, squishY);

                ctx.shadowColor = bulletColor;
                ctx.shadowBlur = 15;

                // Main ball
                ctx.fillStyle = bulletColor;
                ctx.beginPath();
                ctx.arc(0, 0, b.size, 0, Math.PI * 2);
                ctx.fill();

                // Highlight
                ctx.fillStyle = '#ffffff';
                ctx.globalAlpha = 0.7;
                ctx.beginPath();
                ctx.arc(-b.size * 0.3, -b.size * 0.3, b.size * 0.35, 0, Math.PI * 2);
                ctx.fill();

                // Inner ring
                ctx.globalAlpha = 0.5;
                ctx.strokeStyle = '#ffffff';
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.arc(0, 0, b.size * 0.6, 0, Math.PI * 2);
                ctx.stroke();

                ctx.shadowBlur = 0;
                ctx.restore();
            } else if (b.cluster) {
                // CLUSTER BOMB - Multi-segment bomb
                ctx.save();
                ctx.translate(b.x, b.y);
                const clusterAngle = Math.atan2(b.vy, b.vx);
                ctx.rotate(clusterAngle);

                ctx.shadowColor = bulletColor;
                ctx.shadowBlur = 15;

                // Main body
                ctx.fillStyle = bulletColor;
                ctx.fillRect(-8, -5, 16, 10);

                // Cluster segments (bumps)
                ctx.fillStyle = '#ff8800';
                for (let j = 0; j < 3; j++) {
                    ctx.beginPath();
                    ctx.arc(-4 + j * 4, -6, 3, 0, Math.PI * 2);
                    ctx.fill();
                    ctx.beginPath();
                    ctx.arc(-4 + j * 4, 6, 3, 0, Math.PI * 2);
                    ctx.fill();
                }

                // Warning stripes
                ctx.fillStyle = '#000000';
                ctx.fillRect(-2, -5, 2, 10);
                ctx.fillRect(4, -5, 2, 10);

                ctx.shadowBlur = 0;
                ctx.restore();
            } else if (b.sticky) {
                // STICKY BOMB - Gooey blob
                const wobble = Math.sin(now * 0.015) * 2;
                ctx.shadowColor = bulletColor;
                ctx.shadowBlur = 15;

                // Goo drips
                ctx.fillStyle = '#66cc00';
                ctx.globalAlpha = 0.6;
                for (let j = 0; j < 3; j++) {
                    const dripAngle = (j / 3) * Math.PI * 2 + now * 0.005;
                    ctx.beginPath();
                    ctx.arc(
                        b.x + Math.cos(dripAngle) * (b.size + 3),
                        b.y + Math.sin(dripAngle) * (b.size + 5 + Math.sin(now * 0.02 + j) * 3),
                        3, 0, Math.PI * 2
                    );
                    ctx.fill();
                }

                // Main blob
                ctx.globalAlpha = 1;
                ctx.fillStyle = bulletColor;
                ctx.beginPath();
                ctx.arc(b.x, b.y, b.size + wobble, 0, Math.PI * 2);
                ctx.fill();

                // Highlight
                ctx.fillStyle = '#ccff88';
                ctx.globalAlpha = 0.5;
                ctx.beginPath();
                ctx.arc(b.x - 3, b.y - 3, b.size * 0.4, 0, Math.PI * 2);
                ctx.fill();

                ctx.shadowBlur = 0;
            } else if (b.napalm) {
                // NAPALM - Flaming canister
                ctx.save();
                ctx.translate(b.x, b.y);
                const napalmAngle = Math.atan2(b.vy, b.vx);
                ctx.rotate(napalmAngle);

                // Fire trail
                ctx.fillStyle = '#ff4400';
                ctx.globalAlpha = 0.6;
                for (let j = 0; j < 4; j++) {
                    ctx.beginPath();
                    ctx.arc(-8 - j * 6, (Math.random() - 0.5) * 8, 4 + Math.random() * 3, 0, Math.PI * 2);
                    ctx.fill();
                }

                ctx.globalAlpha = 1;
                ctx.shadowColor = '#ff6600';
                ctx.shadowBlur = 20;

                // Canister body
                ctx.fillStyle = bulletColor;
                ctx.fillRect(-10, -4, 20, 8);

                // Cap
                ctx.fillStyle = '#aa2200';
                ctx.fillRect(8, -5, 4, 10);

                // Flame icon
                ctx.fillStyle = '#ffff00';
                ctx.beginPath();
                ctx.arc(-2, 0, 3, 0, Math.PI * 2);
                ctx.fill();

                ctx.shadowBlur = 0;
                ctx.restore();
            } else if (b.mine) {
                // MINE - Spiked orb (stationary when stopped)
                const isMoving = Math.hypot(b.vx, b.vy) > 1;
                const pulseSize = isMoving ? 0 : Math.sin(now * 0.01) * 3;

                ctx.shadowColor = bulletColor;
                ctx.shadowBlur = isMoving ? 10 : 20;

                // Danger ring when armed
                if (!isMoving) {
                    ctx.globalAlpha = 0.3 + Math.sin(now * 0.015) * 0.2;
                    ctx.strokeStyle = '#ff0000';
                    ctx.lineWidth = 2;
                    ctx.beginPath();
                    ctx.arc(b.x, b.y, b.triggerRadius || 50, 0, Math.PI * 2);
                    ctx.stroke();
                }

                // Main body
                ctx.globalAlpha = 1;
                ctx.fillStyle = bulletColor;
                ctx.beginPath();
                ctx.arc(b.x, b.y, b.size + pulseSize, 0, Math.PI * 2);
                ctx.fill();

                // Spikes
                ctx.fillStyle = '#cccccc';
                const spikes = 8;
                for (let j = 0; j < spikes; j++) {
                    const spikeAngle = (j / spikes) * Math.PI * 2 + (isMoving ? now * 0.01 : 0);
                    const spikeLen = b.size + pulseSize + 6;
                    ctx.beginPath();
                    ctx.moveTo(
                        b.x + Math.cos(spikeAngle) * (b.size + pulseSize),
                        b.y + Math.sin(spikeAngle) * (b.size + pulseSize)
                    );
                    ctx.lineTo(
                        b.x + Math.cos(spikeAngle) * spikeLen,
                        b.y + Math.sin(spikeAngle) * spikeLen
                    );
                    ctx.lineTo(
                        b.x + Math.cos(spikeAngle + 0.2) * (b.size + pulseSize),
                        b.y + Math.sin(spikeAngle + 0.2) * (b.size + pulseSize)
                    );
                    ctx.fill();
                }

                // Blinking light
                if (!isMoving && Math.sin(now * 0.02) > 0) {
                    ctx.fillStyle = '#ff0000';
                    ctx.beginPath();
                    ctx.arc(b.x, b.y, 3, 0, Math.PI * 2);
                    ctx.fill();
                }

                ctx.shadowBlur = 0;
            } else if (b.nuke) {
                // NUKE - Big warhead
                ctx.save();
                ctx.translate(b.x, b.y);
                const nukeAngle = Math.atan2(b.vy, b.vx);
                ctx.rotate(nukeAngle);

                ctx.shadowColor = '#00ff00';
                ctx.shadowBlur = 25;

                // Radiation glow
                ctx.fillStyle = '#00ff00';
                ctx.globalAlpha = 0.3 + Math.sin(now * 0.02) * 0.1;
                ctx.beginPath();
                ctx.arc(0, 0, 25, 0, Math.PI * 2);
                ctx.fill();

                ctx.globalAlpha = 1;

                // Main warhead body
                ctx.fillStyle = '#333333';
                ctx.fillRect(-15, -8, 25, 16);

                // Nose cone
                ctx.fillStyle = bulletColor;
                ctx.beginPath();
                ctx.moveTo(10, -8);
                ctx.lineTo(20, 0);
                ctx.lineTo(10, 8);
                ctx.closePath();
                ctx.fill();

                // Fins
                ctx.fillStyle = '#222222';
                ctx.fillRect(-15, -12, 8, 4);
                ctx.fillRect(-15, 8, 8, 4);

                // Radiation symbol
                ctx.fillStyle = '#ffff00';
                ctx.beginPath();
                ctx.arc(-2, 0, 4, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = '#000000';
                ctx.beginPath();
                ctx.arc(-2, 0, 2, 0, Math.PI * 2);
                ctx.fill();

                ctx.shadowBlur = 0;
                ctx.restore();
            } else if (b.firework) {
                // FIREWORK - Colorful rocket
                ctx.save();
                ctx.translate(b.x, b.y);
                const fwAngle = Math.atan2(b.vy, b.vx);
                ctx.rotate(fwAngle);

                // Sparkle trail
                const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];
                for (let j = 0; j < 5; j++) {
                    ctx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
                    ctx.globalAlpha = 0.7 - j * 0.1;
                    ctx.beginPath();
                    ctx.arc(-8 - j * 5 + Math.random() * 4, (Math.random() - 0.5) * 6, 2, 0, Math.PI * 2);
                    ctx.fill();
                }

                ctx.globalAlpha = 1;
                ctx.shadowColor = bulletColor;
                ctx.shadowBlur = 15;

                // Body with stripes
                for (let j = 0; j < 3; j++) {
                    ctx.fillStyle = colors[(j + Math.floor(now * 0.01)) % colors.length];
                    ctx.fillRect(-6 + j * 4, -3, 4, 6);
                }

                // Tip
                ctx.fillStyle = '#ffffff';
                ctx.beginPath();
                ctx.moveTo(6, -3);
                ctx.lineTo(10, 0);
                ctx.lineTo(6, 3);
                ctx.closePath();
                ctx.fill();

                ctx.shadowBlur = 0;
                ctx.restore();
            } else if (b.barrel) {
                // BARREL - Explosive barrel
                ctx.save();
                ctx.translate(b.x, b.y);
                const barrelRot = now * 0.02;
                ctx.rotate(barrelRot);

                ctx.shadowColor = '#ff6600';
                ctx.shadowBlur = 15;

                // Main barrel
                ctx.fillStyle = bulletColor;
                ctx.fillRect(-10, -12, 20, 24);

                // Metal bands
                ctx.fillStyle = '#444444';
                ctx.fillRect(-11, -10, 22, 3);
                ctx.fillRect(-11, 7, 22, 3);

                // Warning symbol
                ctx.fillStyle = '#ff0000';
                ctx.beginPath();
                ctx.moveTo(0, -5);
                ctx.lineTo(-4, 3);
                ctx.lineTo(4, 3);
                ctx.closePath();
                ctx.fill();
                ctx.fillStyle = '#000000';
                ctx.fillRect(-1, -3, 2, 4);
                ctx.fillRect(-1, 2, 2, 2);

                ctx.shadowBlur = 0;
                ctx.restore();
            } else if (b.drone && b.explosive) {
                // BOMB DRONE - Flying bomb
                ctx.save();
                ctx.translate(b.x, b.y);
                const droneAngle = Math.atan2(b.vy, b.vx);
                ctx.rotate(droneAngle);

                ctx.shadowColor = bulletColor;
                ctx.shadowBlur = 12;

                // Rotor blur
                ctx.fillStyle = '#888888';
                ctx.globalAlpha = 0.4;
                ctx.beginPath();
                ctx.ellipse(-6, -8, 8, 3, Math.sin(now * 0.1), 0, Math.PI * 2);
                ctx.fill();
                ctx.beginPath();
                ctx.ellipse(-6, 8, 8, 3, Math.cos(now * 0.1), 0, Math.PI * 2);
                ctx.fill();

                ctx.globalAlpha = 1;

                // Body
                ctx.fillStyle = bulletColor;
                ctx.fillRect(-10, -5, 15, 10);

                // Bomb attachment
                ctx.fillStyle = '#ff4444';
                ctx.beginPath();
                ctx.arc(8, 0, 6, 0, Math.PI * 2);
                ctx.fill();

                // Eye/sensor
                ctx.fillStyle = '#ff0000';
                ctx.beginPath();
                ctx.arc(-4, 0, 2, 0, Math.PI * 2);
                ctx.fill();

                ctx.shadowBlur = 0;
                ctx.restore();
            } else if (b.impact) {
                // IMPACT GRENADE - Sleek projectile
                ctx.save();
                ctx.translate(b.x, b.y);
                const impactAngle = Math.atan2(b.vy, b.vx);
                ctx.rotate(impactAngle);

                ctx.shadowColor = bulletColor;
                ctx.shadowBlur = 15;

                // Trail
                ctx.fillStyle = bulletColor;
                ctx.globalAlpha = 0.4;
                ctx.fillRect(-20, -2, 15, 4);

                ctx.globalAlpha = 1;

                // Body
                ctx.fillStyle = bulletColor;
                ctx.fillRect(-8, -4, 14, 8);

                // Tip (impact fuse)
                ctx.fillStyle = '#ff4444';
                ctx.beginPath();
                ctx.moveTo(6, -4);
                ctx.lineTo(12, 0);
                ctx.lineTo(6, 4);
                ctx.closePath();
                ctx.fill();

                // Bands
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(-4, -4, 2, 8);
                ctx.fillRect(2, -4, 2, 8);

                ctx.shadowBlur = 0;
                ctx.restore();
            } else if (b.dynamite) {
                // Already handled by grenade rendering, but add fuse spark
                // This will be drawn after the grenade render
            } else if (b.explosive && !b.homing && !b.grenade) {
                // ROCKET - Missile with exhaust
                ctx.save();
                ctx.translate(b.x, b.y);
                const rocketAngle = Math.atan2(b.vy, b.vx);
                ctx.rotate(rocketAngle);

                ctx.shadowColor = bulletColor;
                ctx.shadowBlur = 15;

                // Exhaust flame
                ctx.fillStyle = '#ff6600';
                ctx.globalAlpha = 0.8;
                ctx.beginPath();
                ctx.moveTo(-12, 0);
                ctx.lineTo(-20 - Math.random() * 8, -4);
                ctx.lineTo(-18 - Math.random() * 6, 0);
                ctx.lineTo(-20 - Math.random() * 8, 4);
                ctx.closePath();
                ctx.fill();

                // Inner exhaust
                ctx.fillStyle = '#ffff00';
                ctx.globalAlpha = 0.9;
                ctx.beginPath();
                ctx.moveTo(-12, 0);
                ctx.lineTo(-16 - Math.random() * 4, -2);
                ctx.lineTo(-14 - Math.random() * 3, 0);
                ctx.lineTo(-16 - Math.random() * 4, 2);
                ctx.closePath();
                ctx.fill();

                // Rocket body
                ctx.fillStyle = bulletColor;
                ctx.globalAlpha = 1;
                ctx.fillRect(-10, -4, 16, 8);

                // Nose cone
                ctx.beginPath();
                ctx.moveTo(6, -4);
                ctx.lineTo(12, 0);
                ctx.lineTo(6, 4);
                ctx.closePath();
                ctx.fill();

                // Fins
                ctx.fillStyle = '#ff8888';
                ctx.beginPath();
                ctx.moveTo(-10, -4);
                ctx.lineTo(-14, -8);
                ctx.lineTo(-6, -4);
                ctx.closePath();
                ctx.fill();
                ctx.beginPath();
                ctx.moveTo(-10, 4);
                ctx.lineTo(-14, 8);
                ctx.lineTo(-6, 4);
                ctx.closePath();
                ctx.fill();

                ctx.shadowBlur = 0;
                ctx.restore();

                // Smoke trail
                if (Math.random() < 0.4) {
                    gs.particles.push({
                        x: b.x - Math.cos(rocketAngle) * 15,
                        y: b.y - Math.sin(rocketAngle) * 15,
                        vx: (Math.random() - 0.5) * 2,
                        vy: (Math.random() - 0.5) * 2,
                        life: 1,
                        decay: 0.03,
                        size: 4 + Math.random() * 4,
                        color: '#888888',
                        type: 'smoke',
                        gravity: -0.05,
                        shrink: false
                    });
                }
            } else if (b.harpoon) {
                // HARPOON - Arrow/spear shape
                ctx.save();
                ctx.translate(b.x, b.y);
                const harpoonAngle = Math.atan2(b.vy, b.vx);
                ctx.rotate(harpoonAngle);

                ctx.shadowColor = bulletColor;
                ctx.shadowBlur = 12;

                // Shaft
                ctx.fillStyle = '#8888aa';
                ctx.fillRect(-15, -2, 20, 4);

                // Head
                ctx.fillStyle = bulletColor;
                ctx.beginPath();
                ctx.moveTo(5, -4);
                ctx.lineTo(15, 0);
                ctx.lineTo(5, 4);
                ctx.closePath();
                ctx.fill();

                // Barbs
                ctx.beginPath();
                ctx.moveTo(5, -4);
                ctx.lineTo(2, -6);
                ctx.lineTo(3, -4);
                ctx.closePath();
                ctx.fill();
                ctx.beginPath();
                ctx.moveTo(5, 4);
                ctx.lineTo(2, 6);
                ctx.lineTo(3, 4);
                ctx.closePath();
                ctx.fill();

                // Rope trail
                ctx.strokeStyle = '#886644';
                ctx.lineWidth = 1;
                ctx.globalAlpha = 0.6;
                ctx.beginPath();
                ctx.moveTo(-15, 0);
                for (let j = 0; j < 5; j++) {
                    ctx.lineTo(-15 - j * 8, Math.sin(j * 1.5 + now * 0.01) * 3);
                }
                ctx.stroke();

                ctx.shadowBlur = 0;
                ctx.restore();
            } else if (b.cannonball) {
                // CANNONBALL - Heavy metal ball
                ctx.shadowColor = bulletColor;
                ctx.shadowBlur = 10;

                // Main ball
                ctx.fillStyle = '#555555';
                ctx.beginPath();
                ctx.arc(b.x, b.y, b.size * 1.3, 0, Math.PI * 2);
                ctx.fill();

                // Metallic highlight
                ctx.fillStyle = '#888888';
                ctx.globalAlpha = 0.6;
                ctx.beginPath();
                ctx.arc(b.x - b.size * 0.3, b.y - b.size * 0.4, b.size * 0.5, 0, Math.PI * 2);
                ctx.fill();

                // Dark shadow
                ctx.fillStyle = '#222222';
                ctx.globalAlpha = 0.5;
                ctx.beginPath();
                ctx.arc(b.x + b.size * 0.2, b.y + b.size * 0.3, b.size * 0.6, 0, Math.PI * 2);
                ctx.fill();

                ctx.shadowBlur = 0;
            } else if (b.crossbow) {
                // CROSSBOW BOLT - Arrow shape
                ctx.save();
                ctx.translate(b.x, b.y);
                const boltAngle = Math.atan2(b.vy, b.vx);
                ctx.rotate(boltAngle);

                ctx.shadowColor = bulletColor;
                ctx.shadowBlur = 8;

                // Wooden shaft
                ctx.fillStyle = '#8b4513';
                ctx.fillRect(-12, -1.5, 18, 3);

                // Metal tip
                ctx.fillStyle = bulletColor;
                ctx.beginPath();
                ctx.moveTo(6, -3);
                ctx.lineTo(14, 0);
                ctx.lineTo(6, 3);
                ctx.closePath();
                ctx.fill();

                // Fletching (feathers)
                ctx.fillStyle = '#aa8866';
                ctx.beginPath();
                ctx.moveTo(-12, -1.5);
                ctx.lineTo(-16, -5);
                ctx.lineTo(-10, -1.5);
                ctx.closePath();
                ctx.fill();
                ctx.beginPath();
                ctx.moveTo(-12, 1.5);
                ctx.lineTo(-16, 5);
                ctx.lineTo(-10, 1.5);
                ctx.closePath();
                ctx.fill();

                ctx.shadowBlur = 0;
                ctx.restore();
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
                    // BLITZ projectile ricochet: bullets bounce back at 15x speed
                    if (player.blitzActive && player.dashActive) {
                        // Reverse bullet direction (180 degree turn)
                        b.vx = -b.vx * 2;
                        b.vy = -b.vy * 2;
                        b.isEnemy = false; // Now it's the player's bullet
                        b.damage = b.damage * 3; // Triple damage on ricochet
                        b.color = '#ff00ff'; // Change color to indicate ricochet
                        createParticles(b.x, b.y, '#ff00ff', 15, 8);
                        sfxRef.current?.shieldHit();
                        continue; // Don't damage player
                    }

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

                            // Special explosion effects based on weapon type
                            if (b.nuke) {
                                // NUKE - Massive explosion with mushroom cloud effect
                                sfxRef.current?.explosionMega();
                                triggerScreenShake(1.5);
                                createRingExplosion(b.x, b.y, '#00ff00', radius);
                                createRingExplosion(b.x, b.y, '#ffff00', radius * 0.7);
                                createParticles(b.x, b.y, '#00ff00', 50, 15);
                                createParticles(b.x, b.y, '#ffff00', 40, 12);
                                createParticles(b.x, b.y, '#ffffff', 30, 10);
                                // Screen flash
                                createScreenFlash('#ffffff', 0.8);
                            } else if (b.cluster) {
                                // CLUSTER - Spawn sub-bombs
                                sfxRef.current?.explosion();
                                triggerScreenShake(0.4);
                                createParticles(b.x, b.y, '#ff8800', 20, 10);
                                const clusterCount = b.clusterCount || 6;
                                for (let c = 0; c < clusterCount; c++) {
                                    const clusterAngle = (c / clusterCount) * Math.PI * 2 + Math.random() * 0.3;
                                    const clusterSpeed = 6 + Math.random() * 4;
                                    gs.bullets.push({
                                        x: b.x,
                                        y: b.y,
                                        vx: Math.cos(clusterAngle) * clusterSpeed,
                                        vy: Math.sin(clusterAngle) * clusterSpeed,
                                        damage: b.clusterDamage || b.damage * 0.5,
                                        piercing: 0,
                                        color: '#ff8800',
                                        size: 5,
                                        explosive: true,
                                        explosionRadius: b.clusterRadius || 40,
                                        isClusterChild: true,
                                        spawnTime: now
                                    });
                                }
                            } else if (b.napalm) {
                                // NAPALM - Create fire zone
                                sfxRef.current?.explosionBig();
                                triggerScreenShake(0.5);
                                createParticles(b.x, b.y, '#ff4400', 30, 12);
                                // Create fire zone (hazard area)
                                gs.fireZones = gs.fireZones || [];
                                gs.fireZones.push({
                                    x: b.x,
                                    y: b.y,
                                    radius: radius,
                                    damage: b.burnDamage || 3,
                                    duration: b.burnDuration || 4000,
                                    spawnTime: now,
                                    color: '#ff4400'
                                });
                            } else if (b.firework) {
                                // FIREWORK - Colorful multi-explosion
                                sfxRef.current?.explosion();
                                triggerScreenShake(0.3);
                                const fwColors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#ffffff'];
                                for (let fw = 0; fw < (b.sparkCount || 8); fw++) {
                                    const fwColor = fwColors[Math.floor(Math.random() * fwColors.length)];
                                    const fwAngle = (fw / 8) * Math.PI * 2;
                                    const fwDist = 20 + Math.random() * 30;
                                    createParticles(
                                        b.x + Math.cos(fwAngle) * fwDist,
                                        b.y + Math.sin(fwAngle) * fwDist,
                                        fwColor, 8, 6
                                    );
                                }
                                createRingExplosion(b.x, b.y, fwColors[Math.floor(Math.random() * fwColors.length)], radius * 0.8);
                            } else {
                                // Standard explosion
                                createParticles(b.x, b.y, '#ff8800', 15, 8);
                                triggerScreenShake(b.explosionRadius ? 0.4 : 0.2);
                                if (b.explosionRadius > 80) {
                                    sfxRef.current?.explosionBig();
                                } else {
                                    sfxRef.current?.explosion();
                                }
                            }

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

                                        // Napalm applies burn DOT
                                        if (b.napalm) {
                                            other.burning = true;
                                            other.burnDamage = b.burnDamage || 3;
                                            other.burnUntil = now + (b.burnDuration || 4000);
                                        }
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

            // Draw filled swing arc (like a pie slice)
            const startAngle = attack.angle - attack.swingArc / 2;
            const endAngle = startAngle + attack.swingArc * swingProgress;
            const fadeMultiplier = 1 - attack.progress * 0.3;

            // Outermost glow arc (very wide, faint)
            ctx.globalAlpha = 0.25 * fadeMultiplier;
            ctx.fillStyle = attack.color;
            ctx.shadowColor = attack.color;
            ctx.shadowBlur = 40;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.arc(0, 0, attack.range * 1.2, startAngle, endAngle);
            ctx.closePath();
            ctx.fill();

            // Outer colored arc
            ctx.globalAlpha = 0.6 * fadeMultiplier;
            ctx.shadowBlur = 25;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.arc(0, 0, attack.range, startAngle, endAngle);
            ctx.closePath();
            ctx.fill();

            // Middle bright arc
            ctx.globalAlpha = 0.8 * fadeMultiplier;
            const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, attack.range);
            gradient.addColorStop(0, '#ffffff');
            gradient.addColorStop(0.3, attack.color);
            gradient.addColorStop(1, attack.color);
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.arc(0, 0, attack.range * 0.85, startAngle, endAngle);
            ctx.closePath();
            ctx.fill();

            // Inner white hot arc
            ctx.globalAlpha = 0.9 * fadeMultiplier;
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.arc(0, 0, attack.range * 0.4, startAngle, endAngle);
            ctx.closePath();
            ctx.fill();

            // Draw leading edge blade (thick glowing line)
            ctx.globalAlpha = fadeMultiplier;
            ctx.strokeStyle = attack.color;
            ctx.lineWidth = 12;
            ctx.lineCap = 'round';
            ctx.shadowColor = attack.color;
            ctx.shadowBlur = 35;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(
                Math.cos(currentAngle) * attack.range,
                Math.sin(currentAngle) * attack.range
            );
            ctx.stroke();

            // White core of the blade
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 6;
            ctx.shadowBlur = 20;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(
                Math.cos(currentAngle) * attack.range,
                Math.sin(currentAngle) * attack.range
            );
            ctx.stroke();

            // Draw blade tip glow (larger)
            ctx.fillStyle = attack.color;
            ctx.globalAlpha = fadeMultiplier;
            ctx.beginPath();
            ctx.arc(
                Math.cos(currentAngle) * attack.range,
                Math.sin(currentAngle) * attack.range,
                18 * fadeMultiplier,
                0, Math.PI * 2
            );
            ctx.fill();

            // White hot tip center
            ctx.fillStyle = '#ffffff';
            ctx.globalAlpha = 0.9 * fadeMultiplier;
            ctx.beginPath();
            ctx.arc(
                Math.cos(currentAngle) * attack.range,
                Math.sin(currentAngle) * attack.range,
                8 * fadeMultiplier,
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

            // Universal death check - kill enemies with health < 1
            if (e.health < 1) {
                const scoreMultiplier = player.scoreMultiplier || 1;
                gs.score += (e.points || 10) * (1 + gs.combo * 0.1) * scoreMultiplier;
                gs.kills++;
                gs.totalKills++;
                gs.combo++;
                gs.comboTimer = 120;

                if (e.type === 'boss') {
                    sfxRef.current?.killBoss();
                    triggerScreenShake(1);
                } else {
                    sfxRef.current?.kill();
                    triggerScreenShake(0.2);
                }

                createDeathExplosion(e.x, e.y, e.color, e.size, e.type === 'boss');

                // Adrenaline heal on kill
                if (player.adrenalineHeal > 0) {
                    player.health = Math.min(player.maxHealth, player.health + player.adrenalineHeal);
                }

                // Lifesteal on kill
                if (player.lifesteal > 0) {
                    player.health = Math.min(player.maxHealth, player.health + player.lifesteal * 10);
                }

                // Chain lightning on kill
                if (player.hasChainLightning) {
                    const chainRange = 150;
                    const chainDamage = player.damage * 0.5;
                    enemies.forEach(other => {
                        if (other !== e) {
                            const dist = Math.hypot(other.x - e.x, other.y - e.y);
                            if (dist < chainRange) {
                                other.health -= chainDamage;
                                other.hitFlash = 5;
                                createParticles(other.x, other.y, '#88ffff', 8, 4);
                            }
                        }
                    });
                }

                // Quickstep speed boost
                if (player.hasQuickstep) {
                    player.quickstepUntil = now + 1000;
                }

                enemies.splice(i, 1);
                continue;
            }

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
            if (e.cloudShooter && now - e.lastShot > (e.megaCloud ? 2000 : 3000)) {
                e.lastShot = now;
                const angle = Math.atan2(player.y - e.y, player.x - e.x);
                const cloudCount = e.megaCloud ? 5 : 1;
                for (let c = 0; c < cloudCount; c++) {
                    const spreadAngle = angle + (c - Math.floor(cloudCount / 2)) * 0.3;
                    gs.bullets.push({
                        x: e.x,
                        y: e.y,
                        vx: Math.cos(spreadAngle) * 3,
                        vy: Math.sin(spreadAngle) * 3,
                        damage: e.damage * (e.megaCloud ? 0.8 : 0.5),
                        isEnemy: true,
                        piercing: 0,
                        size: e.megaCloud ? 25 : 15,
                        color: e.megaCloud ? '#aa44ff' : '#8888ff',
                        isCloud: true,
                        lifetime: e.megaCloud ? 300 : 180
                    });
                }
            }

            // === BOSS SPECIAL ABILITIES ===

            // Boss Spitter - creates acid pools on hit location
            if (e.createsAcidPools && e.shoots && now - (e.lastAcidPool || 0) > 4000) {
                e.lastAcidPool = now;
                const angle = Math.atan2(player.y - e.y, player.x - e.x);
                for (let a = 0; a < 3; a++) {
                    const spreadAngle = angle + (a - 1) * 0.4;
                    gs.bullets.push({
                        x: e.x,
                        y: e.y,
                        vx: Math.cos(spreadAngle) * 6,
                        vy: Math.sin(spreadAngle) * 6,
                        damage: e.damage,
                        isEnemy: true,
                        piercing: 0,
                        size: 12,
                        color: '#44ff00',
                        acid: true,
                        createsPool: true
                    });
                }
            }

            // Boss Nuclear - radiation aura damages nearby player
            if (e.radiationAura) {
                const radDist = Math.hypot(player.x - e.x, player.y - e.y);
                const radRadius = 150;
                if (radDist < radRadius && !player.invulnerable) {
                    // Tick radiation damage
                    if (!e.lastRadTick || now - e.lastRadTick > 500) {
                        e.lastRadTick = now;
                        const radDamage = 3 * (1 - radDist / radRadius);
                        player.health -= radDamage;
                        createDamageNumber(player.x, player.y - PLAYER_SIZE, radDamage, false);
                        createParticles(player.x, player.y, '#00ff00', 3, 3);
                    }
                }
                // Draw radiation aura
                ctx.globalAlpha = 0.15 + Math.sin(now * 0.005) * 0.05;
                ctx.fillStyle = '#00ff00';
                ctx.beginPath();
                ctx.arc(e.x, e.y, radRadius, 0, Math.PI * 2);
                ctx.fill();
                ctx.globalAlpha = 1;
            }

            // Boss Swarm/Summoner - spawns minions
            if (e.spawnsMinions && now - (e.lastSpawn || 0) > (e.spawnRate || 3000)) {
                e.lastSpawn = now;
                const spawnCount = e.summonsBosses ? 1 : 3;
                for (let s = 0; s < spawnCount; s++) {
                    const spawnAngle = Math.random() * Math.PI * 2;
                    const spawnDist = e.size + 30;
                    const minionTypes = e.summonsBosses ? ['brute', 'charger', 'bloater'] : ['basic', 'runner', 'crawler'];
                    const minionType = minionTypes[Math.floor(Math.random() * minionTypes.length)];
                    const minionConfig = {
                        basic: { health: 30, speed: 2, damage: 5, size: 18, color: '#ff4444', points: 10 },
                        runner: { health: 15, speed: 3, damage: 3, size: 14, color: '#ff6666', points: 12 },
                        crawler: { health: 20, speed: 2.5, damage: 4, size: 12, color: '#ff5555', points: 14 },
                        brute: { health: 60, speed: 1.5, damage: 12, size: 24, color: '#cc2222', points: 25 },
                        charger: { health: 50, speed: 2, damage: 15, size: 22, color: '#aa1111', points: 30, charges: true },
                        bloater: { health: 25, speed: 2, damage: 5, size: 20, color: '#ff8844', points: 20, explodes: true, fuseTime: 3 }
                    }[minionType];

                    enemies.push({
                        x: e.x + Math.cos(spawnAngle) * spawnDist,
                        y: e.y + Math.sin(spawnAngle) * spawnDist,
                        health: minionConfig.health * gs.difficultyMultiplier,
                        maxHealth: minionConfig.health * gs.difficultyMultiplier,
                        speed: minionConfig.speed,
                        baseSpeed: minionConfig.speed,
                        damage: minionConfig.damage * gs.difficultyMultiplier,
                        size: minionConfig.size,
                        color: minionConfig.color,
                        points: minionConfig.points,
                        type: minionType,
                        lastShot: 0,
                        lastMeleeHit: 0,
                        hitFlash: 0,
                        charges: minionConfig.charges,
                        explodes: minionConfig.explodes,
                        fuseTime: minionConfig.fuseTime,
                        spawnedByBoss: true
                    });
                    createParticles(e.x + Math.cos(spawnAngle) * spawnDist, e.y + Math.sin(spawnAngle) * spawnDist, e.color, 10, 5);
                }
                sfxRef.current?.bossSpawn();
            }

            // Boss Phantom - teleports periodically
            if (e.teleports && now - (e.lastTeleport || 0) > 5000) {
                e.lastTeleport = now;
                // Teleport to random position near player
                const teleAngle = Math.random() * Math.PI * 2;
                const teleDist = 150 + Math.random() * 100;
                const newX = player.x + Math.cos(teleAngle) * teleDist;
                const newY = player.y + Math.sin(teleAngle) * teleDist;
                // Clamp to canvas
                createParticles(e.x, e.y, '#aa00ff', 20, 8);
                e.x = Math.max(50, Math.min(canvas.width - 50, newX));
                e.y = Math.max(50, Math.min(canvas.height - 50, newY));
                createParticles(e.x, e.y, '#aa00ff', 20, 8);
                sfxRef.current?.dash();
            }

            // Boss Inferno - napalm attack
            if (e.napalmAttack && now - (e.lastNapalm || 0) > 6000) {
                e.lastNapalm = now;
                // Launch napalm projectiles
                for (let n = 0; n < 4; n++) {
                    const napalmAngle = (n / 4) * Math.PI * 2;
                    gs.bullets.push({
                        x: e.x,
                        y: e.y,
                        vx: Math.cos(napalmAngle) * 5,
                        vy: Math.sin(napalmAngle) * 5,
                        damage: e.damage * 0.5,
                        isEnemy: true,
                        piercing: 0,
                        size: 15,
                        color: '#ff4400',
                        napalm: true,
                        createsFireZone: true
                    });
                }
                sfxRef.current?.shootNapalm();
            }

            // Boss Sniper - triple snipe
            if (e.tripleSnipe && e.sniperShot && now - (e.lastTripleSnipe || 0) > 6000) {
                e.lastTripleSnipe = now;
                sfxRef.current?.sniperCharge();
                // Charge indicator
                e.charging = true;
                e.chargeUntil = now + 1500;
                setTimeout(() => {
                    if (e.health > 0) {
                        for (let s = 0; s < 3; s++) {
                            setTimeout(() => {
                                if (e.health > 0) {
                                    const angle = Math.atan2(player.y - e.y, player.x - e.x);
                                    gs.bullets.push({
                                        x: e.x,
                                        y: e.y,
                                        vx: Math.cos(angle) * 20,
                                        vy: Math.sin(angle) * 20,
                                        damage: e.damage * 2,
                                        isEnemy: true,
                                        piercing: 0,
                                        size: 10,
                                        color: '#00ffaa',
                                        sniper: true
                                    });
                                    sfxRef.current?.shootSniper();
                                }
                            }, s * 200);
                        }
                        e.charging = false;
                    }
                }, 1500);
            }

            // Boss Lightning - chain lightning attack
            if (e.lightningAttack && now - (e.lastLightning || 0) > 3000) {
                e.lastLightning = now;
                const angle = Math.atan2(player.y - e.y, player.x - e.x);
                gs.bullets.push({
                    x: e.x,
                    y: e.y,
                    vx: Math.cos(angle) * 12,
                    vy: Math.sin(angle) * 12,
                    damage: e.damage,
                    isEnemy: true,
                    piercing: 0,
                    size: 12,
                    color: '#00ffff',
                    lightning: true,
                    chainLightning: e.chainLightning,
                    chainRange: 100,
                    chains: 3
                });
                sfxRef.current?.shootLightning();
            }

            // Boss Frost - freeze attack and frost aura
            if (e.freezeAttack && now - (e.lastFreeze || 0) > 2500) {
                e.lastFreeze = now;
                const angle = Math.atan2(player.y - e.y, player.x - e.x);
                for (let f = 0; f < 3; f++) {
                    const frostAngle = angle + (f - 1) * 0.3;
                    gs.bullets.push({
                        x: e.x,
                        y: e.y,
                        vx: Math.cos(frostAngle) * 8,
                        vy: Math.sin(frostAngle) * 8,
                        damage: e.damage * 0.6,
                        isEnemy: true,
                        piercing: 0,
                        size: 10,
                        color: '#88ddff',
                        cryo: true,
                        freezesPlayer: true
                    });
                }
            }

            // Frost aura slows player
            if (e.frostAura) {
                const frostDist = Math.hypot(player.x - e.x, player.y - e.y);
                const frostRadius = 120;
                if (frostDist < frostRadius) {
                    player.frostSlowed = true;
                    player.frostSlowUntil = now + 500;
                }
                // Draw frost aura
                ctx.globalAlpha = 0.1 + Math.sin(now * 0.003) * 0.05;
                ctx.fillStyle = '#88ddff';
                ctx.beginPath();
                ctx.arc(e.x, e.y, frostRadius, 0, Math.PI * 2);
                ctx.fill();
                ctx.globalAlpha = 1;
            }

            // Boss Berserker - enrage when damaged
            if (e.enrages && e.enrageMultiplier) {
                const healthPercent = e.health / e.maxHealth;
                const enrageLevel = Math.floor((1 - healthPercent) * 4); // 0-4 levels
                if (enrageLevel > (e.currentEnrage || 0)) {
                    e.currentEnrage = enrageLevel;
                    e.speed = e.baseSpeed * (1 + enrageLevel * 0.3);
                    e.damage = e.damage * 1.2;
                    createParticles(e.x, e.y, '#ff0000', 15, 6);
                    // Visual indicator
                    e.enragedGlow = true;
                }
            }

            // Boss Executioner - execute low health players
            if (e.executeThreshold && e.charges) {
                const playerHealthPercent = player.health / player.maxHealth;
                if (playerHealthPercent < e.executeThreshold && !e.executeDash) {
                    e.executeDash = true;
                    e.speed = e.baseSpeed * 4; // Super fast dash
                    e.damage = e.damage * 3; // Triple damage
                    createParticles(e.x, e.y, '#880000', 20, 8);
                    sfxRef.current?.danger();
                }
            }

            // Boss Hivemind - controlled minions are stronger
            if (e.controlsMinions) {
                enemies.forEach(other => {
                    if (other.spawnedByBoss && other !== e) {
                        const distToBoss = Math.hypot(other.x - e.x, other.y - e.y);
                        if (distToBoss < 300) {
                            other.boosted = true;
                            other.speed = other.baseSpeed * 1.5;
                        }
                    }
                });
            }

            // Draw boss charging indicator
            if (e.charging && e.chargeUntil > now) {
                const chargeProgress = 1 - (e.chargeUntil - now) / 1500;
                ctx.strokeStyle = '#ff0000';
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.arc(e.x, e.y, e.size + 10, 0, Math.PI * 2 * chargeProgress);
                ctx.stroke();
            }

            // Draw enraged glow
            if (e.enragedGlow) {
                ctx.globalAlpha = 0.3 + Math.sin(now * 0.01) * 0.1;
                ctx.fillStyle = '#ff0000';
                ctx.beginPath();
                ctx.arc(e.x, e.y, e.size + 15, 0, Math.PI * 2);
                ctx.fill();
                ctx.globalAlpha = 1;
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

        // Update and draw hitscan beams
        gs.hitscanBeams = gs.hitscanBeams || [];
        for (let i = gs.hitscanBeams.length - 1; i >= 0; i--) {
            const beam = gs.hitscanBeams[i];
            beam.life -= beam.decay;

            if (beam.life <= 0) {
                gs.hitscanBeams.splice(i, 1);
                continue;
            }

            // Outer glow
            ctx.globalAlpha = beam.life * 0.3;
            ctx.strokeStyle = beam.color;
            ctx.lineWidth = beam.width * 3;
            ctx.shadowColor = beam.color;
            ctx.shadowBlur = 30;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(beam.x1, beam.y1);
            ctx.lineTo(beam.x2, beam.y2);
            ctx.stroke();

            // Middle layer
            ctx.globalAlpha = beam.life * 0.6;
            ctx.lineWidth = beam.width * 1.5;
            ctx.stroke();

            // Core (white hot)
            ctx.globalAlpha = beam.life;
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = beam.width * 0.5;
            ctx.shadowBlur = 15;
            ctx.beginPath();
            ctx.moveTo(beam.x1, beam.y1);
            ctx.lineTo(beam.x2, beam.y2);
            ctx.stroke();

            // Impact point flash
            ctx.fillStyle = beam.color;
            ctx.globalAlpha = beam.life * 0.8;
            ctx.beginPath();
            ctx.arc(beam.x2, beam.y2, beam.width * 2 * beam.life, 0, Math.PI * 2);
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
            abilityCooldown: abilityReady ? 0 : Math.ceil((player.ability.cooldown * 1000 - (now - player.ability.lastUsed)) / 1000),
            playerAbilities: {
                hasDash: player.hasDash,
                hasDashV2: player.hasDashV2,
                hasBlitz: player.hasBlitz,
                hasParticleAccelerator: player.hasParticleAccelerator,
                hasSandevistan: player.hasSandevistan,
                hasAfterburner: player.hasAfterburner,
                hasControlModule: player.hasControlModule,
                hasAfterimage: player.hasAfterimage,
                hasTeleport: player.hasTeleport,
                hasDaze: player.hasDaze,
                hasMedicine: player.hasMedicine,
                hasTimeSlow: player.hasTimeSlow,
                hasOrbital: player.hasOrbital,
                hasGravityWell: player.hasGravityWell,
                hasShockwave: player.hasShockwave,
                hasOvercharge: player.hasOvercharge,
                hasNitro: player.hasNitro,
                hasSword: player.hasSword,
                hasJackhammer: player.hasJackhammer,
                hasDecoy: player.hasDecoy,
                droneCount: player.droneCount || 0
            }
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
        setUpgradeHistory([]);

        // Wait for canvas to be visible before initializing
        setTimeout(() => {
            initGame(classData);
            const gs = gameStateRef.current;
            if (gs) {
                gs.startTime = Date.now();
                // Enable sandbox mode if selected
                if (classData.id === 'sandbox') {
                    gs.sandboxMode = true;
                    gs.player.invulnerable = true;
                    gs.player.health = 9999;
                    gs.player.maxHealth = 9999;
                    gs.player.damage = 100;
                }
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

    const handleSandboxMode = useCallback(() => {
        // Create a sandbox character with maxed stats
        const sandboxClass = {
            id: 'sandbox',
            name: 'SANDBOX',
            symbol: 'GOD',
            bgColor: 'bg-purple-600',
            accentColor: 'text-purple-400',
            borderColor: 'border-purple-500',
            desc: 'Unlimited power',
            stats: { health: 9999, damage: 100, speed: 8, fireRate: 50, weapon: 'pistol' },
            passives: [],
            ability: { name: 'GOD MODE', desc: 'Invulnerable and overpowered', cooldown: 0, type: 'passive' }
        };
        setSelectedClass(sandboxClass);
        setClassSelected(true);
        setSandboxMode(true);
        startGame(sandboxClass);
    }, [startGame]);

    // Sandbox mode callbacks
    const sandboxSpawnEnemy = useCallback((enemyType, x, y) => {
        const gs = gameStateRef.current;
        if (!gs) return;

        const enemyConfigs = {
            basic: { health: 30, speed: 2, damage: 5, size: 18, color: '#ff4444', points: 10 },
            fast: { health: 15, speed: 4, damage: 5, size: 16, color: '#ffff00', points: 25 },
            tank: { health: 80, speed: 1.5, damage: 15, size: 25, color: '#4444ff', points: 40 },
            swarm: { health: 8, speed: 3, damage: 3, size: 8, color: '#00ff00', points: 5 },
            shooter: { health: 30, speed: 1.5, damage: 6, size: 18, color: '#ff00ff', points: 15, shoots: true },
            exploder: { health: 25, speed: 2, damage: 20, size: 20, color: '#ff8800', points: 20, explodes: true, fuseTime: 3 },
            dasher: { health: 35, speed: 2, damage: 8, size: 16, color: '#00ffff', points: 22, dashes: true },
            splitter: { health: 40, speed: 1.8, damage: 8, size: 22, color: '#88ff88', points: 30 },
            healer: { health: 45, speed: 1.5, damage: 5, size: 18, color: '#ff88ff', points: 25, regenerates: true },
            shielder: { health: 60, speed: 1.5, damage: 10, size: 20, color: '#8888ff', points: 35, armor: 0.3 },
            boss: { health: 500, speed: 1.5, damage: 15, size: 40, color: '#ff0000', points: 100 },
            miniboss: { health: 200, speed: 1.8, damage: 12, size: 30, color: '#ff4400', points: 50 }
        };

        const config = enemyConfigs[enemyType];
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
            type: enemyType,
            shoots: config.shoots,
            lastShot: 0,
            lastMeleeHit: 0,
            hitFlash: 0,
            explodes: config.explodes,
            fuseTime: config.fuseTime,
            spawnTime: Date.now(),
            dashes: config.dashes,
            dashCooldown: 0,
            isDashing: false,
            dashAngle: 0,
            regenerates: config.regenerates,
            armor: config.armor,
            lastRegen: 0
        };

        gs.enemies.push(enemy);
    }, []);

    const sandboxPlaceObstacle = useCallback((obstacleType, x, y) => {
        const gs = gameStateRef.current;
        if (!gs) return;

        const typeConfig = OBSTACLE_TYPES.find(o => o.id === obstacleType);
        if (!typeConfig) return;

        // Initialize obstacles array if it doesn't exist
        if (!gs.obstacles) gs.obstacles = [];

        const obstacle = {
            id: Date.now() + Math.random(),
            type: obstacleType,
            x: x - typeConfig.width / 2,
            y: y - typeConfig.height / 2,
            width: typeConfig.width,
            height: typeConfig.height,
            color: typeConfig.color,
            damage: typeConfig.damage,
            slow: typeConfig.slow,
            heal: typeConfig.heal,
            bounce: typeConfig.bounce
        };

        gs.obstacles.push(obstacle);
    }, []);

    const sandboxDeleteAt = useCallback((x, y) => {
        const gs = gameStateRef.current;
        if (!gs) return;

        // Delete enemy at position
        if (gs.enemies) {
            gs.enemies = gs.enemies.filter(e => {
                const dist = Math.hypot(e.x - x, e.y - y);
                return dist > e.size + 20;
            });
        }

        // Delete obstacle at position
        if (gs.obstacles) {
            gs.obstacles = gs.obstacles.filter(o => {
                return !(x >= o.x && x <= o.x + o.width && y >= o.y && y <= o.y + o.height);
            });
        }
    }, []);

    const sandboxMovePlayer = useCallback((x, y) => {
        const gs = gameStateRef.current;
        if (!gs) return;
        gs.player.x = x;
        gs.player.y = y;
    }, []);

    const sandboxClearAll = useCallback(() => {
        const gs = gameStateRef.current;
        if (!gs) return;
        gs.enemies = [];
        gs.obstacles = [];
        gs.bullets = [];
        gs.particles = [];
    }, []);

    const sandboxToggleGodMode = useCallback(() => {
        const gs = gameStateRef.current;
        if (!gs) return;
        gs.player.invulnerable = !gs.player.invulnerable;
    }, []);

    const sandboxSetWave = useCallback((wave) => {
        const gs = gameStateRef.current;
        if (!gs) return;
        gs.wave = wave;
        gs.difficultyMultiplier = 1 + (wave - 1) * 0.1;
        setUiState(prev => ({ ...prev, wave }));
    }, []);

    const sandboxSpawnWave = useCallback(() => {
        const gs = gameStateRef.current;
        if (!gs) return;
        const count = 5 + gs.wave * 2;
        for (let i = 0; i < count; i++) {
            const side = Math.floor(Math.random() * 4);
            let x, y;
            switch (side) {
                case 0: x = Math.random() * gs.canvas.width; y = -30; break;
                case 1: x = gs.canvas.width + 30; y = Math.random() * gs.canvas.height; break;
                case 2: x = Math.random() * gs.canvas.width; y = gs.canvas.height + 30; break;
                default: x = -30; y = Math.random() * gs.canvas.height;
            }
            sandboxSpawnEnemy('basic', x, y);
        }
    }, [sandboxSpawnEnemy]);

    const sandboxTogglePause = useCallback(() => {
        setIsPaused(prev => !prev);
    }, []);

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
                        const newStacks = Math.min(4, (gs.player.overpumpStacks || 0) + 1);
                        gs.player.overpumpStacks = newStacks;
                        gs.player.pumpingUntil = Date.now() + 400; // Vibrate for 400ms
                        sfxRef.current?.meleeHeavy();
                        // Screen shake - intensity increases with pump level (ULTRAKILL style!)
                        gs.screenShake.intensity = Math.max(gs.screenShake.intensity, 0.4 + newStacks * 0.2);
                        // Visual feedback - more particles with each pump
                        createParticles(gs.player.x, gs.player.y, '#ff8800', 10 + newStacks * 5, 6 + newStacks * 2);
                        createParticles(gs.player.x, gs.player.y, '#ffff00', 5 + newStacks * 3, 4 + newStacks);
                        // Ring explosion effect
                        gs.ringEffects = gs.ringEffects || [];
                        gs.ringEffects.push({
                            x: gs.player.x,
                            y: gs.player.y,
                            color: '#ff8800',
                            radius: 0,
                            maxRadius: 40 + newStacks * 20,
                            life: 1,
                            lineWidth: 4 + newStacks * 2
                        });
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

                            case 'samurai':
                                // Iai Strike - Cinematic execution on strongest enemy
                                let strongestEnemy = null;
                                let highestHP = 0;
                                gs.enemies.forEach(en => {
                                    if (en.health > highestHP) {
                                        strongestEnemy = en;
                                        highestHP = en.health;
                                    }
                                });

                                if (strongestEnemy) {
                                    // Start the Iai Strike sequence
                                    gs.iaiStrike = {
                                        active: true,
                                        target: strongestEnemy,
                                        startTime: now,
                                        phase: 'whiteout', // whiteout -> slashing -> execution -> shatter
                                        slashCount: 0,
                                        lastSlash: now,
                                        totalDamage: 0,
                                        slashLines: [] // Store slash effects
                                    };
                                    // Freeze the target
                                    strongestEnemy.frozen = true;
                                    strongestEnemy.frozenUntil = now + 60000; // Long freeze during ability
                                    // Flash effect
                                    createScreenFlash('#ffffff', 0.8);
                                    sfxRef.current?.criticalHit();
                                }
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
                            [ENEMY LOG]
                        </Button>
                        <Button
                            onClick={() => setShowWeaponLog(true)}
                            className="bg-gray-800 hover:bg-gray-700 text-cyan-400 font-mono border border-cyan-500/30"
                        >
                            [ARSENAL]
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
                <ClassSelection onSelect={handleClassSelect} onSandbox={handleSandboxMode} />
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
                    {sandboxMode && (
                        <SandboxUI
                            onSpawnEnemy={sandboxSpawnEnemy}
                            onPlaceObstacle={sandboxPlaceObstacle}
                            onDeleteAt={sandboxDeleteAt}
                            onMovePlayer={sandboxMovePlayer}
                            onClearAll={sandboxClearAll}
                            onToggleGodMode={sandboxToggleGodMode}
                            onSetWave={sandboxSetWave}
                            onSpawnWave={sandboxSpawnWave}
                            onTogglePause={sandboxTogglePause}
                            godMode={gameStateRef.current?.player?.invulnerable || false}
                            isPaused={isPaused}
                            currentWave={uiState.wave}
                            enemyCount={gameStateRef.current?.enemies?.length || 0}
                            obstacleCount={gameStateRef.current?.obstacles?.length || 0}
                        />
                    )}
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
                    upgradeHistory={upgradeHistory}
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

            {showWeaponLog && (
                <WeaponLog onClose={() => setShowWeaponLog(false)} />
            )}
        </div>
    );
}