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
    },
    railgun: {
        name: 'Railgun',
        damage: 8,
        fireRate: 3,
        spread: 0,
        projectiles: 1,
        piercing: 99,
        color: '#00ffff',
        speed: 50,
        railgun: true
    },
    crossbow: {
        name: 'Crossbow',
        damage: 4,
        fireRate: 1.8,
        spread: 0,
        projectiles: 1,
        piercing: 2,
        color: '#8b4513',
        speed: 22,
        crossbow: true,
        stickDuration: 3000
    },
    acid: {
        name: 'Acid Sprayer',
        damage: 0.4,
        fireRate: 0.2,
        spread: 0.35,
        projectiles: 2,
        piercing: 0,
        color: '#00ff00',
        speed: 9,
        acid: true,
        dotDamage: 5,
        dotDuration: 3000
    },
    cryo: {
        name: 'Cryo Cannon',
        damage: 0.6,
        fireRate: 0.3,
        spread: 0.25,
        projectiles: 1,
        piercing: 0,
        color: '#88ddff',
        speed: 12,
        cryo: true,
        slowAmount: 0.6,
        slowDuration: 2000
    },
    beam: {
        name: 'Beam Cannon',
        damage: 0.2,
        fireRate: 0.05,
        spread: 0,
        projectiles: 1,
        piercing: 5,
        color: '#ff00ff',
        speed: 40,
        beam: true,
        beamWidth: 8
    },
    bouncer: {
        name: 'Bouncer',
        damage: 1.5,
        fireRate: 1,
        spread: 0.1,
        projectiles: 1,
        piercing: 0,
        color: '#ffff00',
        speed: 14,
        bouncer: true,
        maxBounces: 5
    },
    pulse: {
        name: 'Pulse Rifle',
        damage: 1,
        fireRate: 0.6,
        spread: 0,
        projectiles: 1,
        piercing: 1,
        color: '#ff88ff',
        speed: 20,
        pulse: true,
        pulseRadius: 40
    },
    scattergun: {
        name: 'Scattergun',
        damage: 0.4,
        fireRate: 1.2,
        spread: 0.5,
        projectiles: 12,
        piercing: 0,
        color: '#ff8844',
        speed: 16
    },
    smg: {
        name: 'SMG',
        damage: 0.4,
        fireRate: 0.12,
        spread: 0.2,
        projectiles: 1,
        piercing: 0,
        color: '#ffcc00',
        speed: 20
    },
    cannon: {
        name: 'Cannon',
        damage: 6,
        fireRate: 3,
        spread: 0,
        projectiles: 1,
        piercing: 3,
        color: '#666666',
        speed: 8,
        explosive: true,
        explosionRadius: 100,
        cannonball: true
    },
    tesla: {
        name: 'Tesla Coil',
        damage: 0.8,
        fireRate: 0.8,
        spread: 0.3,
        projectiles: 3,
        piercing: 0,
        color: '#00ccff',
        speed: 25,
        lightning: true,
        chainRange: 100,
        chains: 2
    },
    saw: {
        name: 'Saw Launcher',
        damage: 2,
        fireRate: 1.5,
        spread: 0,
        projectiles: 1,
        piercing: 3,
        color: '#cccccc',
        speed: 10,
        saw: true,
        sawDuration: 3000
    },
    harpoon: {
        name: 'Harpoon Gun',
        damage: 3.5,
        fireRate: 2,
        spread: 0,
        projectiles: 1,
        piercing: 1,
        color: '#4488ff',
        speed: 28,
        harpoon: true,
        pullStrength: 8
    },
    orbital_laser: {
        name: 'Orbital Laser',
        damage: 0.5,
        fireRate: 0.08,
        spread: 0,
        projectiles: 1,
        piercing: 99,
        color: '#ff0000',
        speed: 60,
        orbitalLaser: true
    },
    swarm: {
        name: 'Swarm Missiles',
        damage: 0.8,
        fireRate: 0.4,
        spread: 0.8,
        projectiles: 5,
        piercing: 0,
        color: '#ff4488',
        speed: 6,
        homing: true,
        homingStrength: 0.15,
        explosive: true,
        explosionRadius: 30
    },

    // === MELEE WEAPONS ===
    sword: {
        name: 'Sword',
        damage: 2.5,
        fireRate: 0.5,
        melee: true,
        range: 75,
        swingArc: Math.PI * 0.6,
        color: '#aaaaff',
        knockback: 5,
        cleave: true,
        desc: 'A trusty blade'
    },
    dagger: {
        name: 'Dagger',
        damage: 1.2,
        fireRate: 0.2,
        melee: true,
        range: 45,
        swingArc: Math.PI * 0.4,
        color: '#44ffaa',
        knockback: 2,
        cleave: false,
        desc: 'Quick stabs, low damage'
    },
    bayonet: {
        name: 'Bayonet',
        damage: 3.5,
        fireRate: 0.3,
        melee: true,
        range: 70,
        swingArc: Math.PI * 0.3,
        color: '#888888',
        knockback: 4,
        cleave: false,
        thrust: true,
        desc: 'Fast and deadly thrust'
    },
    greatsword: {
        name: 'Greatsword',
        damage: 6,
        fireRate: 1.2,
        melee: true,
        range: 100,
        swingArc: Math.PI * 0.8,
        color: '#ff6644',
        knockback: 15,
        cleave: true,
        desc: 'Slow but devastating'
    },
    jackhammer: {
        name: 'Jackhammer',
        damage: 1,
        fireRate: 0.08,
        melee: true,
        range: 50,
        swingArc: Math.PI * 0.3,
        color: '#ffaa00',
        knockback: 2,
        cleave: false,
        speedScaling: true, // damage = speed
        desc: 'Damage scales with your speed!'
    },
    laser_sword: {
        name: 'Laser Sword',
        damage: 4,
        fireRate: 0.35,
        melee: true,
        range: 85,
        swingArc: Math.PI * 0.5,
        color: '#00ffff',
        knockback: 3,
        cleave: true,
        desc: 'Elegant weapon for a civilized age'
    },
    laser_dagger: {
        name: 'Laser Dagger',
        damage: 2.5,
        fireRate: 0.12,
        melee: true,
        range: 50,
        swingArc: Math.PI * 0.4,
        color: '#ff00ff',
        knockback: 1,
        cleave: false,
        desc: 'Blindingly fast energy blade'
    },
    overpump_jackhammer: {
        name: 'Overpump Jackhammer',
        damage: 2,
        fireRate: 0.5,
        melee: true,
        range: 55,
        swingArc: Math.PI * 0.4,
        color: '#ff8800',
        knockback: 8,
        cleave: true,
        overpump: true, // Press P to pump, up to 4 times
        desc: 'Press P to PUMP IT UP! (2+ pumps = explosion)'
    },
    rapier: {
        name: 'Rapier',
        damage: 2,
        fireRate: 0.4,
        melee: true,
        range: 180, // LOOOOONG
        swingArc: Math.PI * 0.15,
        color: '#ddddff',
        knockback: 2,
        cleave: false,
        thrust: true,
        desc: 'Looooooooooong reach'
    },

    // === SUPER RARE MELEE ===
    fish: {
        name: 'Fish',
        damage: 999999,
        fireRate: 0.5,
        melee: true,
        range: 60,
        swingArc: Math.PI * 0.5,
        color: '#3399ff',
        knockback: 50,
        cleave: true,
        superRare: true,
        rarity: 0.0000001,
        desc: '...how did you get this?'
    },
    nuclear_sword: {
        name: 'Nuclear Sword',
        damage: 8,
        fireRate: 0.6,
        melee: true,
        range: 90,
        swingArc: Math.PI * 0.6,
        color: '#00ff00',
        knockback: 10,
        cleave: true,
        nuclear: true, // Explodes on hit
        explosionRadius: 120,
        superRare: true,
        desc: 'Uh oh...'
    },
    bare_hands: {
        name: 'Bare Hands',
        damage: 6,
        fireRate: 0.01, // Basically no cooldown
        melee: true,
        range: 40,
        swingArc: Math.PI * 0.5,
        color: '#ffddaa',
        knockback: 3,
        cleave: false,
        superRare: true,
        desc: 'You toss your weapons away. Pure skill.'
    },
    pencil: {
        name: 'Pencil',
        damage: 10,
        fireRate: 0.25,
        melee: true,
        range: 35,
        swingArc: Math.PI * 0.3,
        color: '#ffcc00',
        knockback: 0,
        cleave: false,
        superRare: true,
        instantKillChance: 0.15, // 15% instant kill
        desc: 'John Wick time.'
    }
};

export const GEAR = {
    speed_boots: {
        name: 'Speed Boots',
        icon: '👟',
        desc: '+30% Movement Speed',
        apply: (p) => p.speed *= 1.3
    },
    nitro_boost: {
        name: 'Nitro Boost',
        icon: '🚀',
        desc: 'Press N: 200% speed for 3s (10s CD)',
        apply: (p) => p.hasNitro = true
    },
    momentum: {
        name: 'Momentum',
        icon: '💨',
        desc: 'Speed increases while moving (up to +50%)',
        apply: (p) => p.hasMomentum = true
    },
    combat_roll: {
        name: 'Combat Roll',
        icon: '🔄',
        desc: 'Double-tap direction to roll (invincible)',
        apply: (p) => p.hasCombatRoll = true
    },
    lightweight: {
        name: 'Lightweight',
        icon: '🪶',
        desc: '+20% Speed, -10% Max HP',
        apply: (p) => {
            p.speed *= 1.2;
            p.maxHealth *= 0.9;
            p.health = Math.min(p.health, p.maxHealth);
        }
    },
    sprint_mastery: {
        name: 'Sprint Mastery',
        icon: '🏃',
        desc: 'Sprinting uses no stamina',
        apply: (p) => p.infiniteSprint = true
    },
    blur: {
        name: 'Blur',
        icon: '👻',
        desc: '+20% evasion while moving',
        apply: (p) => p.hasBlur = true
    },
    slipstream: {
        name: 'Slipstream',
        icon: '🌊',
        desc: 'Moving through enemies boosts speed',
        apply: (p) => p.hasSlipstream = true
    },
    quickstep: {
        name: 'Quickstep',
        icon: '⚡',
        desc: '+50% speed for 1s after killing',
        apply: (p) => p.hasQuickstep = true
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
    },
    reflective_shield: {
        name: 'Reflective Shield',
        icon: '🛡️',
        desc: 'Reflects 20% of incoming damage back (ONE TIME PURCHASE)',
        apply: (p) => p.hasReflectiveShield = true,
        unique: true // Can only be purchased once
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

export function shootWeapon(weapon, player, targetX, targetY, createBullet, createMeleeAttack) {
    const weaponData = WEAPONS[weapon];
    const baseAngle = Math.atan2(targetY - player.y, targetX - player.x);
    const multishot = player.multishot || 1;

    // Melee weapon handling
    if (weaponData.melee) {
        if (createMeleeAttack) {
            createMeleeAttack({
                x: player.x,
                y: player.y,
                angle: baseAngle,
                range: weaponData.range,
                swingArc: weaponData.swingArc,
                damage: player.damage * weaponData.damage,
                color: weaponData.color,
                knockback: weaponData.knockback || 0,
                cleave: weaponData.cleave || false,
                bleed: weaponData.bleed || false,
                bleedDamage: weaponData.bleedDamage || 0,
                bleedDuration: weaponData.bleedDuration || 0,
                stun: weaponData.stun || false,
                stunDuration: weaponData.stunDuration || 0,
                groundSlam: weaponData.groundSlam || false,
                slamRadius: weaponData.slamRadius || 0,
                backstab: weaponData.backstab || false,
                backstabMultiplier: weaponData.backstabMultiplier || 1,
                thrust: weaponData.thrust || false,
                lifesteal: weaponData.lifesteal || 0,
                comboHits: weaponData.comboHits || 1,
                comboWindow: weaponData.comboWindow || 0,
                // New special properties
                speedScaling: weaponData.speedScaling || false,
                overpump: weaponData.overpump || false,
                overpumpStacks: player.overpumpStacks || 0,
                nuclear: weaponData.nuclear || false,
                explosionRadius: weaponData.explosionRadius || 0,
                instantKillChance: weaponData.instantKillChance || 0,
                spawnTime: Date.now(),
                duration: 200
            });
            // Reset overpump stacks after attack
            if (weaponData.overpump) {
                player.overpumpStacks = 0;
            }
        }
        return;
    }

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