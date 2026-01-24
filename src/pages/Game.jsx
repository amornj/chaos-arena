import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import GameUI from '@/components/game/GameUI';
import UpgradeModal from '@/components/game/UpgradeModal';
import GameOverScreen from '@/components/game/GameOverScreen';
import { createSFX } from '@/components/game/SoundEngine';

// Game constants
const PLAYER_BASE_SPEED = 5;
const PLAYER_BASE_HEALTH = 100;
const PLAYER_BASE_DAMAGE = 10;
const PLAYER_SIZE = 20;
const BULLET_SPEED = 15;
const ENEMY_BASE_SPEED = 2;
const ENEMY_BASE_HEALTH = 30;
const ENEMY_BASE_DAMAGE = 10;

export default function Game() {
    const canvasRef = useRef(null);
    const gameStateRef = useRef(null);
    const animationRef = useRef(null);
    const sfxRef = useRef(null);
    
    const [gameStarted, setGameStarted] = useState(false);
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

    // Initialize sound effects
    useEffect(() => {
        sfxRef.current = createSFX();
    }, []);

    const initGame = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;

        gameStateRef.current = {
            ctx,
            canvas,
            player: {
                x: canvas.width / 2,
                y: canvas.height / 2,
                speed: PLAYER_BASE_SPEED,
                health: PLAYER_BASE_HEALTH,
                maxHealth: PLAYER_BASE_HEALTH,
                damage: PLAYER_BASE_DAMAGE,
                fireRate: 150,
                lastShot: 0,
                piercing: 0,
                lifesteal: 0,
                explosiveRounds: false,
                multishot: 1,
                critChance: 0.05,
                critMultiplier: 2,
                shield: 0,
                regen: 0,
                lastRegen: 0
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
        const types = ['basic'];
        if (wave >= 3) types.push('fast');
        if (wave >= 5) types.push('tank');
        if (wave >= 7) types.push('shooter');
        if (wave >= 10) types.push('boss');
        
        const type = wave % 5 === 0 && gs.enemiesSpawned === 0 ? 'boss' : 
                     types[Math.floor(Math.random() * (types.length - (wave % 5 === 0 ? 0 : 1)))];

        const enemyConfigs = {
            basic: { health: 30, speed: 2, damage: 10, size: 18, color: '#ff4444', points: 10 },
            fast: { health: 15, speed: 4.5, damage: 8, size: 14, color: '#ffaa00', points: 15 },
            tank: { health: 100, speed: 1, damage: 25, size: 30, color: '#8844ff', points: 25 },
            shooter: { health: 40, speed: 1.5, damage: 15, size: 20, color: '#44ff88', points: 20, shoots: true },
            boss: { health: 300 * wave, speed: 1.5, damage: 30, size: 50, color: '#ff0066', points: 100 * wave }
        };

        const config = enemyConfigs[type];
        const dm = difficultyMultiplier;

        gs.enemies.push({
            x, y,
            health: config.health * dm,
            maxHealth: config.health * dm,
            speed: config.speed * (1 + dm * 0.1),
            damage: config.damage * dm,
            size: config.size,
            color: config.color,
            points: config.points,
            type,
            shoots: config.shoots,
            lastShot: 0,
            hitFlash: 0
        });
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

    const shootBullet = useCallback((fromX, fromY, toX, toY, isEnemy = false, spread = 0) => {
        const gs = gameStateRef.current;
        if (!gs) return;

        const angle = Math.atan2(toY - fromY, toX - fromX) + (Math.random() - 0.5) * spread;
        const speed = isEnemy ? 8 : BULLET_SPEED;
        
        gs.bullets.push({
            x: fromX,
            y: fromY,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            damage: isEnemy ? gs.enemies[0]?.damage || 10 : gs.player.damage,
            isEnemy,
            piercing: isEnemy ? 0 : gs.player.piercing,
            size: isEnemy ? 6 : 8
        });

        if (!isEnemy) {
            sfxRef.current?.shoot();
            createParticles(fromX, fromY, '#ffff00', 3, 3);
        }
    }, [createParticles]);

    const triggerScreenShake = useCallback((intensity) => {
        const gs = gameStateRef.current;
        if (gs) {
            gs.screenShake.intensity = Math.max(gs.screenShake.intensity, intensity);
        }
    }, []);

    const generateUpgrades = useCallback(() => {
        const allUpgrades = [
            { id: 'damage', name: 'DAMAGE+', desc: '+20% Damage', icon: '💥', apply: (p) => p.damage *= 1.2 },
            { id: 'speed', name: 'VELOCITY', desc: '+15% Move Speed', icon: '⚡', apply: (p) => p.speed *= 1.15 },
            { id: 'health', name: 'VITALITY', desc: '+25 Max HP', icon: '❤️', apply: (p) => { p.maxHealth += 25; p.health += 25; }},
            { id: 'firerate', name: 'RAPIDFIRE', desc: '+20% Fire Rate', icon: '🔥', apply: (p) => p.fireRate *= 0.8 },
            { id: 'pierce', name: 'PIERCING', desc: '+1 Pierce', icon: '🎯', apply: (p) => p.piercing += 1 },
            { id: 'lifesteal', name: 'VAMPIRIC', desc: '+5% Lifesteal', icon: '🧛', apply: (p) => p.lifesteal += 0.05 },
            { id: 'crit', name: 'CRITICAL', desc: '+10% Crit Chance', icon: '💀', apply: (p) => p.critChance += 0.1 },
            { id: 'critdmg', name: 'EXECUTE', desc: '+50% Crit Damage', icon: '⚔️', apply: (p) => p.critMultiplier += 0.5 },
            { id: 'multi', name: 'MULTISHOT', desc: '+1 Projectile', icon: '🌟', apply: (p) => p.multishot += 1 },
            { id: 'regen', name: 'REGENERATE', desc: '+2 HP/sec', icon: '💚', apply: (p) => p.regen += 2 },
            { id: 'explosive', name: 'EXPLOSIVE', desc: 'Bullets Explode', icon: '💣', apply: (p) => p.explosiveRounds = true },
            { id: 'shield', name: 'BARRIER', desc: '+20 Shield', icon: '🛡️', apply: (p) => p.shield += 20 }
        ];
        
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
        
        if (dx !== 0 || dy !== 0) {
            const len = Math.sqrt(dx * dx + dy * dy);
            dx /= len; dy /= len;
            player.x += dx * player.speed;
            player.y += dy * player.speed;
        }
        
        // Keep player in bounds
        player.x = Math.max(PLAYER_SIZE, Math.min(canvas.width - PLAYER_SIZE, player.x));
        player.y = Math.max(PLAYER_SIZE, Math.min(canvas.height - PLAYER_SIZE, player.y));

        // Player regeneration
        if (player.regen > 0) {
            const now = Date.now();
            if (now - player.lastRegen > 1000) {
                player.health = Math.min(player.maxHealth, player.health + player.regen);
                player.lastRegen = now;
            }
        }

        // Auto-fire
        const now = Date.now();
        if (mouse.down && now - player.lastShot > player.fireRate) {
            player.lastShot = now;
            for (let i = 0; i < player.multishot; i++) {
                const spread = player.multishot > 1 ? (i - (player.multishot - 1) / 2) * 0.15 : 0;
                const angle = Math.atan2(mouse.y - player.y, mouse.x - player.x) + spread;
                shootBullet(
                    player.x + Math.cos(angle) * PLAYER_SIZE,
                    player.y + Math.sin(angle) * PLAYER_SIZE,
                    player.x + Math.cos(angle) * 100,
                    player.y + Math.sin(angle) * 100
                );
            }
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
            b.x += b.vx;
            b.y += b.vy;

            // Check bounds
            if (b.x < -50 || b.x > canvas.width + 50 || b.y < -50 || b.y > canvas.height + 50) {
                bullets.splice(i, 1);
                continue;
            }

            // Draw bullet
            ctx.fillStyle = b.isEnemy ? '#ff0066' : '#00ffff';
            ctx.shadowColor = b.isEnemy ? '#ff0066' : '#00ffff';
            ctx.shadowBlur = 10;
            ctx.beginPath();
            ctx.arc(b.x, b.y, b.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;

            // Collision detection
            if (b.isEnemy) {
                // Hit player
                const dist = Math.hypot(player.x - b.x, player.y - b.y);
                if (dist < PLAYER_SIZE + b.size) {
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
                    bullets.splice(i, 1);
                    
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
                        
                        createDamageNumber(e.x, e.y - e.size, damage, isCrit);
                        createParticles(b.x, b.y, e.color, 5, 3);
                        sfxRef.current?.enemyHit();
                        
                        // Lifesteal
                        if (player.lifesteal > 0) {
                            player.health = Math.min(player.maxHealth, player.health + damage * player.lifesteal);
                        }

                        // Explosive rounds
                        if (player.explosiveRounds) {
                            createParticles(b.x, b.y, '#ff8800', 15, 8);
                            triggerScreenShake(0.2);
                            // Damage nearby enemies
                            enemies.forEach(other => {
                                if (other !== e) {
                                    const d = Math.hypot(other.x - b.x, other.y - b.y);
                                    if (d < 60) {
                                        other.health -= damage * 0.5;
                                        other.hitFlash = 5;
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

                        if (b.piercing <= 0) {
                            bullets.splice(i, 1);
                        } else {
                            b.piercing--;
                        }
                        break;
                    }
                }
            }
        }

        // Update and draw enemies
        enemies.forEach(e => {
            // Move toward player
            const angle = Math.atan2(player.y - e.y, player.x - e.x);
            e.x += Math.cos(angle) * e.speed;
            e.y += Math.sin(angle) * e.speed;

            // Shooting enemies
            if (e.shoots && now - e.lastShot > 2000) {
                e.lastShot = now;
                shootBullet(e.x, e.y, player.x, player.y, true);
            }

            // Melee damage
            const dist = Math.hypot(player.x - e.x, player.y - e.y);
            if (dist < PLAYER_SIZE + e.size) {
                let damage = e.damage * 0.05;
                if (player.shield > 0) {
                    const absorbed = Math.min(player.shield, damage);
                    player.shield -= absorbed;
                    damage -= absorbed;
                }
                player.health -= damage;
                if (Math.random() < 0.1) {
                    triggerScreenShake(0.1);
                    createParticles(player.x, player.y, '#ff0000', 3, 2);
                }
            }

            // Draw enemy
            ctx.fillStyle = e.hitFlash > 0 ? '#ffffff' : e.color;
            if (e.hitFlash > 0) e.hitFlash--;
            ctx.shadowColor = e.color;
            ctx.shadowBlur = 15;
            ctx.beginPath();
            ctx.arc(e.x, e.y, e.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.shadowBlur = 0;

            // Health bar
            if (e.health < e.maxHealth) {
                ctx.fillStyle = '#333';
                ctx.fillRect(e.x - e.size, e.y - e.size - 10, e.size * 2, 4);
                ctx.fillStyle = e.color;
                ctx.fillRect(e.x - e.size, e.y - e.size - 10, (e.health / e.maxHealth) * e.size * 2, 4);
            }
        });

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

        // Draw player
        const playerAngle = Math.atan2(mouse.y - player.y, mouse.x - player.x);
        
        // Player glow
        ctx.shadowColor = '#00ffff';
        ctx.shadowBlur = 20;
        ctx.fillStyle = '#00ffff';
        ctx.beginPath();
        ctx.arc(player.x, player.y, PLAYER_SIZE, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

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
        setUiState({
            health: Math.max(0, Math.round(player.health)),
            maxHealth: player.maxHealth,
            wave: gs.wave,
            score: Math.round(gs.score),
            kills: gs.totalKills,
            combo: gs.combo,
            shield: player.shield
        });

        if (!gameOver) {
            animationRef.current = requestAnimationFrame(gameLoop);
        }
    }, [isPaused, gameOver, shootBullet, spawnEnemy, createParticles, createDamageNumber, triggerScreenShake, generateUpgrades]);

    const startGame = useCallback(() => {
        initGame();
        const gs = gameStateRef.current;
        if (gs) {
            gs.startTime = Date.now();
        }
        setGameStarted(true);
        setGameOver(false);
        setIsPaused(false);
        sfxRef.current?.start();
        animationRef.current = requestAnimationFrame(gameLoop);
    }, [initGame, gameLoop]);

    const restartGame = useCallback(() => {
        cancelAnimationFrame(animationRef.current);
        setGameOver(false);
        setFinalStats(null);
        startGame();
    }, [startGame]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (gameStateRef.current) {
                gameStateRef.current.keys[e.key.toLowerCase()] = true;
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
                canvasRef.current.width = canvasRef.current.offsetWidth;
                canvasRef.current.height = canvasRef.current.offsetHeight;
                gameStateRef.current.canvas = canvasRef.current;
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return (
        <div className="w-full h-screen bg-[#0a0a0f] overflow-hidden relative">
            {!gameStarted ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center z-20 bg-gradient-to-b from-[#0a0a0f] via-[#1a0a1f] to-[#0a0a0f]">
                    <div className="relative">
                        <h1 className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-pink-500 to-red-500 tracking-tighter mb-2 animate-pulse">
                            CARNAGE
                        </h1>
                        <div className="absolute -inset-4 bg-gradient-to-r from-cyan-500/20 via-pink-500/20 to-red-500/20 blur-3xl -z-10" />
                    </div>
                    <p className="text-gray-400 text-lg tracking-widest mb-12 uppercase">Arena Roguelike</p>
                    
                    <Button 
                        onClick={startGame}
                        className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-500 hover:to-pink-500 text-white font-bold text-xl px-12 py-6 rounded-none border-2 border-white/20 transition-all duration-300 hover:scale-105 hover:border-white/50"
                    >
                        START CARNAGE
                    </Button>

                    <div className="mt-16 text-gray-500 text-center">
                        <p className="mb-2"><span className="text-gray-300">WASD</span> - Move</p>
                        <p className="mb-2"><span className="text-gray-300">MOUSE</span> - Aim</p>
                        <p><span className="text-gray-300">HOLD CLICK</span> - Shoot</p>
                    </div>
                </div>
            ) : null}

            <canvas 
                ref={canvasRef}
                className="w-full h-full"
                style={{ display: gameStarted ? 'block' : 'none' }}
            />

            {gameStarted && !gameOver && (
                <GameUI {...uiState} />
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
        </div>
    );
}