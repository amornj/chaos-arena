import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import GameUI from '@/components/game/GameUI';
import UpgradeModal from '@/components/game/UpgradeModal';
import GameOverScreen from '@/components/game/GameOverScreen';
import ClassSelection, { CLASSES } from '@/components/game/ClassSelection';
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

    const initGame = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        // Set explicit dimensions
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width || window.innerWidth;
        canvas.height = rect.height || window.innerHeight;

        const classData = selectedClass || CLASSES[0];
        
        gameStateRef.current = {
            ctx,
            canvas,
            player: {
                x: canvas.width / 2,
                y: canvas.height / 2,
                speed: classData.stats.speed,
                health: classData.stats.health,
                maxHealth: classData.stats.health,
                damage: classData.stats.damage,
                fireRate: classData.stats.fireRate,
                lastShot: 0,
                piercing: 0,
                lifesteal: 0,
                explosiveRounds: false,
                multishot: 1,
                critChance: classData.id === 'gunslinger' ? 0.25 : 0.05,
                critMultiplier: 2,
                shield: 0,
                maxShield: 0,
                regen: 0,
                lastRegen: 0,
                currentWeapon: classData.stats.weapon,
                classId: classData.id,
                ability: {
                    name: classData.ability.name,
                    cooldown: classData.ability.cooldown,
                    ready: true,
                    lastUsed: 0
                },
                invulnerable: false,
                invulnerableUntil: 0
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
        if (wave >= 2) types.push('brute');
        if (wave >= 3) types.push('bloater', 'spitter');
        if (wave >= 4) types.push('blitzer', 'detonator');
        if (wave >= 5) types.push('speeder', 'heavy');
        if (wave >= 6) types.push('gunner', 'volatile');
        if (wave >= 7) types.push('shambler', 'striker');
        if (wave >= 8) types.push('sniper', 'cluster');
        if (wave >= 9) types.push('dasher', 'phantom');
        if (wave >= 10) types.push('juggernaut', 'inferno');
        if (wave >= 11) types.push('goliath', 'mortar');
        if (wave >= 12) types.push('nuke', 'ironclad');
        if (wave >= 15) types.push('megaton');

        const type = wave % 5 === 0 && gs.enemiesSpawned === 0 ? 'boss' :
                     types[Math.floor(Math.random() * types.length)];

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
            boss: { health: 300 * wave, speed: 1.5, damage: 15, size: 50, color: '#ff0066', points: 100 * wave }
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
            lastTrail: 0,
            lastRegen: 0
        };

        gs.enemies.push(enemy);
    }, []);

    const createParticles = useCallback((x, y, color, count = 10, speed = 5) => {
        const gs = gameStateRef.current;
        if (!gs) return;
        
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 / count) * i + Math.random() * 0.5;
            gs.particles.push({
                x, y,
                vx: Math.cos(angle) * speed * (0.5 + Math.random()),
                vy: Math.sin(angle) * speed * (0.5 + Math.random()),
                life: 1,
                decay: 0.02 + Math.random() * 0.03,
                size: 3 + Math.random() * 4,
                color
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
        }
    }, [createParticles]);

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
        
        const statUpgrades = [
            { id: 'damage', name: 'DAMAGE+', desc: '+20% Damage', icon: '💥', apply: (p) => p.damage *= 1.2 },
            { id: 'speed', name: 'VELOCITY', desc: '+15% Move Speed', icon: '⚡', apply: (p) => p.speed *= 1.15 },
            { id: 'health', name: 'VITALITY', desc: '+25 Max HP', icon: '❤️', apply: (p) => { p.maxHealth += 25; p.health += 25; }},
            { id: 'firerate', name: 'RAPIDFIRE', desc: '+20% Fire Rate', icon: '🔥', apply: (p) => p.fireRate *= 0.8 },
            { id: 'pierce', name: 'PIERCING', desc: '+1 Pierce', icon: '🎯', apply: (p) => p.piercing += 1 },
            { id: 'lifesteal', name: 'VAMPIRIC', desc: '+5% Lifesteal', icon: '🧛', apply: (p) => p.lifesteal += 0.05 },
            { id: 'crit', name: 'CRITICAL', desc: '+10% Crit Chance', icon: '💀', apply: (p) => p.critChance += 0.1 },
            { id: 'critdmg', name: 'EXECUTE', desc: '+50% Crit Damage', icon: '⚔️', apply: (p) => p.critMultiplier += 0.5 },
            { id: 'explosive', name: 'EXPLOSIVE', desc: 'Bullets Explode', icon: '💣', apply: (p) => p.explosiveRounds = true }
        ];
        
        const allUpgrades = [...statUpgrades];
        
        // Add weapon upgrades after wave 2
        if (wave >= 2) {
            const weaponKeys = Object.keys(WEAPONS).filter(w => w !== gs.player.currentWeapon);
            weaponKeys.forEach(key => {
                allUpgrades.push(createWeaponUpgrade(key));
            });
        }
        
        // Add gear upgrades after wave 3
        if (wave >= 3) {
            const gearKeys = Object.keys(GEAR);
            gearKeys.forEach(key => {
                allUpgrades.push(createGearUpgrade(key));
            });
        }
        
        const shuffled = allUpgrades.sort(() => Math.random() - 0.5);
        return shuffled.slice(0, 3);
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
                sfxRef.current?.upgrade();
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
                sfxRef.current?.upgrade();
                createParticles(player.x, player.y, '#00ff00', 20, 8);
            }
        }
        
        const speedMultiplier = player.dashActive ? 4 : (player.isSprinting ? 1.5 : 1);
        
        if (dx !== 0 || dy !== 0) {
            const len = Math.sqrt(dx * dx + dy * dy);
            dx /= len; dy /= len;
            player.x += dx * player.speed * speedMultiplier;
            player.y += dy * player.speed * speedMultiplier;
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
            shootWeapon(player.currentWeapon, player, mouse.x, mouse.y, shootBullet);
        }

        // Spawn enemies
        if (!gs.waveComplete && gs.enemiesSpawned < gs.enemiesThisWave) {
            gs.spawnTimer++;
            const spawnRate = Math.max(30, 60 - gs.wave * 2);
            if (gs.spawnTimer >= spawnRate) {
                gs.spawnTimer = 0;
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
                b.x += b.vx;
                b.y += b.vy;
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
            ctx.shadowBlur = b.flame ? 25 : (b.isCloud ? 20 : (b.sniper ? 15 : (b.lightning ? 30 : 10)));
            ctx.globalAlpha = b.flame ? 0.8 : (b.isCloud ? 0.6 : 1);

            if (b.grenade) {
                // Draw grenade as rotating square
                const rotation = (now - b.spawnTime) * 0.01;
                ctx.save();
                ctx.translate(b.x, b.y);
                ctx.rotate(rotation);
                ctx.fillRect(-b.size, -b.size, b.size * 2, b.size * 2);
                ctx.restore();
            } else if (b.sniper) {
                // Draw sniper bullet as elongated
                ctx.save();
                ctx.translate(b.x, b.y);
                ctx.rotate(Math.atan2(b.vy, b.vx));
                ctx.fillRect(-15, -3, 30, 6);
                ctx.restore();
            } else if (b.lightning) {
                // Draw lightning as sparking circle
                ctx.beginPath();
                ctx.arc(b.x, b.y, b.size, 0, Math.PI * 2);
                ctx.fill();
                // Add sparks
                for (let j = 0; j < 3; j++) {
                    const angle = Math.random() * Math.PI * 2;
                    const dist = b.size + Math.random() * 10;
                    ctx.beginPath();
                    ctx.arc(b.x + Math.cos(angle) * dist, b.y + Math.sin(angle) * dist, 2, 0, Math.PI * 2);
                    ctx.fill();
                }
            } else {
                ctx.beginPath();
                ctx.arc(b.x, b.y, b.size, 0, Math.PI * 2);
                ctx.fill();
            }

            ctx.shadowBlur = 0;
            ctx.globalAlpha = 1;

            // Collision detection (skip mortar bullets - they handle damage on landing)
            if (b.isEnemy && !b.isMortar) {
                // Hit player
                const dist = Math.hypot(player.x - b.x, player.y - b.y);
                if (dist < PLAYER_SIZE + b.size && !player.invulnerable) {
                    let damage = b.damage;
                    if (player.shield > 0) {
                        const absorbed = Math.min(player.shield, damage);
                        player.shield -= absorbed;
                        damage -= absorbed;
                    }
                    player.health -= damage;
                    sfxRef.current?.hit();
                    triggerScreenShake(0.3);
                    createParticles(player.x, player.y, '#ff0000', 8, 4);
                    createDamageNumber(player.x, player.y - PLAYER_SIZE, damage, false);
                    
                    // Cloud bullets don't get removed (DOT effect)
                    if (!b.isCloud) {
                        bullets.splice(i, 1);
                    }
                    
                    if (player.health <= 0) {
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
            } else {
                // Hit enemies
                for (let j = enemies.length - 1; j >= 0; j--) {
                    const e = enemies[j];
                    const dist = Math.hypot(e.x - b.x, e.y - b.y);
                    if (dist < e.size + b.size) {
                        const isCrit = Math.random() < player.critChance;
                        let damage = b.damage * (isCrit ? player.critMultiplier : 1);
                        e.health -= damage;
                        e.hitFlash = 5;

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
                        createParticles(b.x, b.y, e.color, 5, 3);
                        sfxRef.current?.enemyHit();
                        
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
                            gs.score += e.points * (1 + gs.combo * 0.1);
                            gs.kills++;
                            gs.totalKills++;
                            gs.combo++;
                            gs.comboTimer = 120;
                            sfxRef.current?.kill();
                            triggerScreenShake(e.type === 'boss' ? 1 : 0.15);
                            createParticles(e.x, e.y, e.color, e.type === 'boss' ? 30 : 15, e.type === 'boss' ? 10 : 6);
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

        // Update and draw enemies
        for (let i = enemies.length - 1; i >= 0; i--) {
            const e = enemies[i];

            // Goliath regeneration
            if (e.regenerates && now - e.lastRegen > 500) {
                e.lastRegen = now;
                e.health = Math.min(e.maxHealth, e.health + 1);
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
                        e.x += Math.cos(angle) * e.speed;
                        e.y += Math.sin(angle) * e.speed;
                        
                        if (now > e.dashCooldown && Math.random() < 0.01) {
                            e.isDashing = true;
                            e.dashStartTime = now;
                            e.dashAngle = angle;
                        }
                    }
                } else {
                    // Normal movement toward target
                    const angle = Math.atan2(target.y - e.y, target.x - e.x);
                    e.x += Math.cos(angle) * e.speed;
                    e.y += Math.sin(angle) * e.speed;
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
                    sfxRef.current?.kill();

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
                    e.lastMeleeHit = now;
                    let damage = e.damage;
                    
                    // Bruiser has melee resistance
                    if (player.classId === 'bruiser') {
                        damage *= 0.5;
                    }
                    
                    if (player.shield > 0) {
                        const absorbed = Math.min(player.shield, damage);
                        player.shield -= absorbed;
                        damage -= absorbed;
                    }
                    player.health -= damage;
                    createDamageNumber(player.x, player.y - PLAYER_SIZE, damage, false);
                    sfxRef.current?.hit();
                    triggerScreenShake(0.15);
                    createParticles(player.x, player.y, '#ff0000', 5, 3);
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

        // Update particles
        for (let i = particles.length - 1; i >= 0; i--) {
            const p = particles[i];
            p.x += p.vx;
            p.y += p.vy;
            p.vx *= 0.95;
            p.vy *= 0.95;
            p.life -= p.decay;

            if (p.life <= 0) {
                particles.splice(i, 1);
                continue;
            }

            ctx.globalAlpha = p.life;
            ctx.fillStyle = p.color;
            ctx.fillRect(p.x - p.size/2, p.y - p.size/2, p.size, p.size);
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
            d.life -= 0.02;
            
            if (d.life <= 0) {
                damageNumbers.splice(i, 1);
                continue;
            }

            ctx.globalAlpha = d.life;
            ctx.font = d.isCrit ? 'bold 24px Inter' : '18px Inter';
            ctx.fillStyle = d.isCrit ? '#ffff00' : '#ffffff';
            ctx.textAlign = 'center';
            ctx.fillText(d.damage.toString(), d.x, d.y);
            ctx.globalAlpha = 1;
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
        
        // Player invisible effect
        const playerVisible = !isInvisible;
        ctx.globalAlpha = playerVisible ? 1 : 0.2;
        
        // Player glow
        const playerColor = player.invulnerable ? '#ffff00' : (player.dashActive ? '#00ffff' : '#00ffff');
        ctx.shadowColor = playerColor;
        ctx.shadowBlur = player.invulnerable ? 30 : (player.dashActive ? 40 : 20);
        ctx.fillStyle = playerColor;
        ctx.beginPath();
        ctx.arc(player.x, player.y, PLAYER_SIZE, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;

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
    }, [isPaused, gameOver, shootBullet, spawnEnemy, createParticles, createDamageNumber, triggerScreenShake, generateUpgrades]);

    const startGame = useCallback(() => {
        setGameStarted(true);
        setGameOver(false);
        setIsPaused(false);
        
        // Wait for canvas to be visible before initializing
        setTimeout(() => {
            initGame();
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
        startGame();
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
                    const now = Date.now();
                    
                    if (player.ability.ready || now - player.ability.lastUsed > player.ability.cooldown * 1000) {
                        player.ability.ready = false;
                        player.ability.lastUsed = now;
                        
                        // Execute class ability
                        if (player.classId === 'bruiser') {
                            // Iron Shield - invulnerability for 3 seconds
                            player.invulnerable = true;
                            player.invulnerableUntil = now + 3000;
                            sfxRef.current?.upgrade();
                            triggerScreenShake(0.5);
                        } else if (player.classId === 'gunslinger') {
                            // Dodge Roll - quick dash
                            const dashDist = 150;
                            const angle = Math.atan2(
                                gameStateRef.current.mouse.y - player.y,
                                gameStateRef.current.mouse.x - player.x
                            );
                            player.x += Math.cos(angle) * dashDist;
                            player.y += Math.sin(angle) * dashDist;
                            player.invulnerable = true;
                            player.invulnerableUntil = now + 500;
                            sfxRef.current?.upgrade();
                            createParticles(player.x, player.y, '#00ffff', 20, 8);
                        } else if (player.classId === 'artillery') {
                            // Bombardment - explosions around player
                            for (let i = 0; i < 8; i++) {
                                const angle = (Math.PI * 2 / 8) * i;
                                const dist = 100 + Math.random() * 50;
                                const x = player.x + Math.cos(angle) * dist;
                                const y = player.y + Math.sin(angle) * dist;
                                
                                setTimeout(() => {
                                    createParticles(x, y, '#ff8800', 20, 10);
                                    triggerScreenShake(0.3);
                                    
                                    // Damage enemies in radius
                                    gameStateRef.current.enemies.forEach(e => {
                                        const d = Math.hypot(e.x - x, e.y - y);
                                        if (d < 80) {
                                            e.health -= player.damage * 5;
                                            e.hitFlash = 5;
                                            createDamageNumber(e.x, e.y - e.size, player.damage * 5, true);
                                        }
                                    });
                                }, i * 100);
                            }
                            sfxRef.current?.waveComplete();
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