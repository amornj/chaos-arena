// Weapon definitions and firing mechanics

export const WEAPONS = {
    pistol: {
        name: 'Pistol',
        damage: 1,
        fireRate: 1,
        spread: 0,
        projectiles: 1,
        piercing: 0,
        color: '#00ffff',
        speed: 15
    },
    shotgun: {
        name: 'Shotgun',
        damage: 0.6,
        fireRate: 1.5,
        spread: 0.3,
        projectiles: 6,
        piercing: 0,
        color: '#ffaa00',
        speed: 12
    },
    minigun: {
        name: 'Minigun',
        damage: 0.5,
        fireRate: 0.4,
        spread: 0.15,
        projectiles: 1,
        piercing: 1,
        color: '#ff4444',
        speed: 18
    },
    rocket: {
        name: 'Rocket Launcher',
        damage: 3,
        fireRate: 2.5,
        spread: 0,
        projectiles: 1,
        piercing: 0,
        color: '#ff0066',
        speed: 8,
        explosive: true,
        explosionRadius: 80
    },
    laser: {
        name: 'Laser Rifle',
        damage: 1.2,
        fireRate: 0.8,
        spread: 0,
        projectiles: 1,
        piercing: 3,
        color: '#00ff88',
        speed: 25
    },
    plasma: {
        name: 'Plasma Cannon',
        damage: 1.8,
        fireRate: 1.2,
        spread: 0.1,
        projectiles: 1,
        piercing: 2,
        color: '#8844ff',
        speed: 10,
        explosive: true,
        explosionRadius: 50
    },
    flamethrower: {
        name: 'Flamethrower',
        damage: 0.3,
        fireRate: 0.15,
        spread: 0.4,
        projectiles: 3,
        piercing: 0,
        color: '#ff6600',
        speed: 8,
        flame: true,
        lifetime: 30
    },
    sniper: {
        name: 'Sniper Rifle',
        damage: 5,
        fireRate: 2,
        spread: 0,
        projectiles: 1,
        piercing: 5,
        color: '#00ccff',
        speed: 30,
        sniper: true
    },
    burst: {
        name: 'Burst Rifle',
        damage: 0.8,
        fireRate: 1.5,
        spread: 0.05,
        projectiles: 3,
        piercing: 0,
        color: '#ffaa00',
        speed: 20,
        burst: true,
        burstDelay: 50
    },
    lightning: {
        name: 'Lightning Gun',
        damage: 1.5,
        fireRate: 1.8,
        spread: 0,
        projectiles: 1,
        piercing: 0,
        color: '#00ffff',
        speed: 35,
        lightning: true,
        chainRange: 150,
        chains: 3
    },
    grenade: {
        name: 'Grenade Launcher',
        damage: 2.5,
        fireRate: 2,
        spread: 0,
        projectiles: 1,
        piercing: 0,
        color: '#88ff44',
        speed: 10,
        grenade: true,
        bounces: 2,
        fuseTime: 1500
    }
};

export const GEAR = {
    speed_boots: {
        name: 'Speed Boots',
        icon: '👟',
        desc: '+30% Movement Speed',
        apply: (p) => p.speed *= 1.3
    },
    armor_vest: {
        name: 'Armor Vest',
        icon: '🦺',
        desc: '+50% Max Health',
        apply: (p) => { 
            const ratio = p.health / p.maxHealth;
            p.maxHealth *= 1.5; 
            p.health = p.maxHealth * ratio;
        }
    },
    damage_amp: {
        name: 'Damage Amplifier',
        icon: '⚡',
        desc: '+40% Damage',
        apply: (p) => p.damage *= 1.4
    },
    regen_core: {
        name: 'Regeneration Core',
        icon: '💚',
        desc: '+5 HP/sec Regeneration',
        apply: (p) => p.regen += 5
    },
    shield_gen: {
        name: 'Shield Generator',
        icon: '🛡️',
        desc: '+50 Shield Capacity',
        apply: (p) => { p.shield += 50; p.maxShield = (p.maxShield || 0) + 50; }
    },
    crit_scope: {
        name: 'Critical Scope',
        icon: '🎯',
        desc: '+20% Crit Chance',
        apply: (p) => p.critChance += 0.2
    },
    vampiric_amulet: {
        name: 'Vampiric Amulet',
        icon: '🧛',
        desc: '+10% Lifesteal',
        apply: (p) => p.lifesteal += 0.1
    },
    attack_speed: {
        name: 'Rapid-Fire Module',
        icon: '🔥',
        desc: '+30% Fire Rate',
        apply: (p) => p.fireRate *= 0.7
    },
    dash: {
        name: 'Dash Module',
        icon: '💨',
        desc: 'Press X: Dash at 400% speed (2s)',
        apply: (p) => p.hasDash = true
    },
    afterimage: {
        name: 'Afterimage',
        icon: '👻',
        desc: 'Press V: Invisible 10s, leave decoy',
        apply: (p) => p.hasAfterimage = true
    },
    decoy: {
        name: 'Combat Decoy',
        icon: '🤖',
        desc: 'Press B: Spawn fighting clone',
        apply: (p) => p.hasDecoy = true
    },
    sword: {
        name: 'Energy Sword',
        icon: '⚔️',
        desc: 'Click: Melee slash with bleed DOT',
        apply: (p) => p.hasSword = true
    },
    jackhammer: {
        name: 'Jackhammer',
        icon: '🔨',
        desc: 'Hold J: Charge massive knockback',
        apply: (p) => p.hasJackhammer = true
    },
    daze: {
        name: 'Daze Field',
        icon: '💫',
        desc: 'Press C: Stun nearby enemies',
        apply: (p) => p.hasDaze = true
    },
    ricochet: {
        name: 'Ricochet',
        icon: '🎱',
        desc: 'Bullets bounce off enemies (+1)',
        apply: (p) => p.ricochetCount = (p.ricochetCount || 0) + 1
    },
    teleport: {
        name: 'Teleporter',
        icon: '🌀',
        desc: 'Press T: Teleport to cursor',
        apply: (p) => p.hasTeleport = true
    },
    medicine: {
        name: 'Medicine Kit',
        icon: '💊',
        desc: 'Press M: Heal 25 HP (30s CD)',
        apply: (p) => p.hasMedicine = true
    },
    lifeblood: {
        name: 'Lifeblood Serum',
        icon: '🧪',
        desc: '+200 Overheal (decays 30s)',
        apply: (p) => {
            p.overheal = 200;
            p.overhealDecayStart = Date.now();
        }
    },

    // Offensive upgrades
    double_shot: {
        name: 'Double Shot',
        icon: '🔱',
        desc: '+1 Projectile per shot',
        apply: (p) => p.multishot = (p.multishot || 1) + 1
    },
    berserker: {
        name: 'Berserker Rage',
        icon: '😤',
        desc: '+50% damage when below 50% HP',
        apply: (p) => p.hasBerserker = true
    },
    executioner: {
        name: 'Executioner',
        icon: '🪓',
        desc: '+100% damage to enemies below 25% HP',
        apply: (p) => p.hasExecutioner = true
    },
    poison_rounds: {
        name: 'Poison Rounds',
        icon: '☠️',
        desc: 'Enemies take 3 DPS for 3 seconds',
        apply: (p) => p.hasPoisonRounds = true
    },
    freeze_rounds: {
        name: 'Cryo Rounds',
        icon: '❄️',
        desc: 'Slow enemies by 50% for 2 seconds',
        apply: (p) => p.hasFreezeRounds = true
    },
    armor_pierce: {
        name: 'Armor Piercing',
        icon: '🗡️',
        desc: '+30% damage to tanky enemies',
        apply: (p) => p.hasArmorPierce = true
    },
    homing: {
        name: 'Homing Rounds',
        icon: '🎯',
        desc: 'Bullets curve toward enemies',
        apply: (p) => p.hasHoming = true
    },
    chain_lightning: {
        name: 'Chain Lightning',
        icon: '⚡',
        desc: 'Kills chain to nearby enemies',
        apply: (p) => p.hasChainLightning = true
    },

    // Defensive upgrades
    second_wind: {
        name: 'Second Wind',
        icon: '💨',
        desc: 'Revive once at 50% HP',
        apply: (p) => p.hasSecondWind = true
    },
    adrenaline: {
        name: 'Adrenaline Rush',
        icon: '💉',
        desc: '+3 HP on kill',
        apply: (p) => p.adrenalineHeal = (p.adrenalineHeal || 0) + 3
    },
    evasion: {
        name: 'Evasion Matrix',
        icon: '🌀',
        desc: '15% chance to dodge attacks',
        apply: (p) => p.evasionChance = (p.evasionChance || 0) + 0.15
    },
    thorns: {
        name: 'Thorns Aura',
        icon: '🌹',
        desc: 'Reflect 50% melee damage',
        apply: (p) => p.thornsDamage = (p.thornsDamage || 0) + 0.5
    },
    fortress: {
        name: 'Fortress',
        icon: '🏰',
        desc: '-25% damage taken',
        apply: (p) => p.damageReduction = (p.damageReduction || 0) + 0.25
    },
    quick_shield: {
        name: 'Quick Shield',
        icon: '⚡',
        desc: 'Shield regens 5/sec after 2s',
        apply: (p) => p.shieldRegen = (p.shieldRegen || 0) + 5
    },
    absorb_shield: {
        name: 'Absorb Shield',
        icon: '🔮',
        desc: '10% damage absorbed as shield',
        apply: (p) => p.damageToShield = (p.damageToShield || 0) + 0.1
    },

    // Utility upgrades
    magnet: {
        name: 'Magnetic Field',
        icon: '🧲',
        desc: 'Attract score pickups',
        apply: (p) => p.hasMagnet = true
    },
    xp_boost: {
        name: 'Score Multiplier',
        icon: '✨',
        desc: '+50% score from kills',
        apply: (p) => p.scoreMultiplier = (p.scoreMultiplier || 1) * 1.5
    },
    time_slow: {
        name: 'Chronosphere',
        icon: '⏰',
        desc: 'Press F: Slow time 50% (5s)',
        apply: (p) => p.hasTimeSlow = true
    },
    drone: {
        name: 'Attack Drone',
        icon: '🛸',
        desc: 'Orbiting drone shoots enemies',
        apply: (p) => p.droneCount = (p.droneCount || 0) + 1
    },
    orbital: {
        name: 'Orbital Strike',
        icon: '🛰️',
        desc: 'Press G: Call orbital bombardment',
        apply: (p) => p.hasOrbital = true
    },
    gravity_well: {
        name: 'Gravity Well',
        icon: '🕳️',
        desc: 'Press R: Pull enemies together',
        apply: (p) => p.hasGravityWell = true
    },
    shockwave: {
        name: 'Shockwave',
        icon: '💥',
        desc: 'Press E: Knockback pulse',
        apply: (p) => p.hasShockwave = true
    },
    overcharge: {
        name: 'Overcharge',
        icon: '🔋',
        desc: 'Press Q: 3x damage for 5s (20s CD)',
        apply: (p) => p.hasOvercharge = true
    }
};

export function createWeaponUpgrade(weaponKey) {
    const weapon = WEAPONS[weaponKey];
    return {
        id: `weapon_${weaponKey}`,
        name: weapon.name.toUpperCase(),
        desc: `Switch to ${weapon.name}`,
        icon: '🔫',
        apply: (p) => {
            p.currentWeapon = weaponKey;
        }
    };
}

export function createGearUpgrade(gearKey) {
    const gear = GEAR[gearKey];
    return {
        id: `gear_${gearKey}`,
        name: gear.name.toUpperCase(),
        desc: gear.desc,
        icon: gear.icon,
        apply: gear.apply
    };
}

export function shootWeapon(weapon, player, targetX, targetY, createBullet) {
    const weaponData = WEAPONS[weapon];
    const baseAngle = Math.atan2(targetY - player.y, targetX - player.x);
    const multishot = player.multishot || 1;

    // Burst fire handling
    if (weaponData.burst) {
        for (let burst = 0; burst < weaponData.projectiles; burst++) {
            setTimeout(() => {
                const angle = baseAngle + (Math.random() - 0.5) * weaponData.spread;
                const startX = player.x + Math.cos(angle) * 25;
                const startY = player.y + Math.sin(angle) * 25;
                
                createBullet({
                    x: startX,
                    y: startY,
                    vx: Math.cos(angle) * weaponData.speed,
                    vy: Math.sin(angle) * weaponData.speed,
                    damage: player.damage * weaponData.damage,
                    piercing: weaponData.piercing + player.piercing,
                    color: weaponData.color,
                    size: 6
                });
            }, burst * weaponData.burstDelay);
        }
        return;
    }
    
    // Fire main projectiles + multishot extra projectiles
    for (let shot = 0; shot < multishot; shot++) {
        const multishotSpread = shot > 0 ? (shot * 0.15) * (shot % 2 === 0 ? 1 : -1) : 0;

        for (let i = 0; i < weaponData.projectiles; i++) {
            let angle = baseAngle + multishotSpread;

            if (weaponData.projectiles > 1) {
                const spreadRange = weaponData.spread;
                angle += (i - (weaponData.projectiles - 1) / 2) * (spreadRange / (weaponData.projectiles - 1));
            } else if (weaponData.spread > 0) {
                angle += (Math.random() - 0.5) * weaponData.spread;
            }

            const startX = player.x + Math.cos(angle) * 25;
            const startY = player.y + Math.sin(angle) * 25;

            const bullet = {
                x: startX,
                y: startY,
                vx: Math.cos(angle) * weaponData.speed,
                vy: Math.sin(angle) * weaponData.speed,
                damage: player.damage * weaponData.damage,
                piercing: weaponData.piercing + player.piercing,
                color: weaponData.color,
                size: weapon === 'rocket' ? 12 : (weapon === 'sniper' ? 10 : 8),
                explosive: weaponData.explosive,
                explosionRadius: weaponData.explosionRadius,
                flame: weaponData.flame,
                lifetime: weaponData.lifetime,
                lightning: weaponData.lightning,
                chainRange: weaponData.chainRange,
                chains: weaponData.chains,
                grenade: weaponData.grenade,
                bounces: weaponData.bounces,
                fuseTime: weaponData.fuseTime,
                spawnTime: Date.now(),
                sniper: weaponData.sniper
            };

            createBullet(bullet);
        }
    }
}