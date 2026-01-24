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
    
    for (let i = 0; i < weaponData.projectiles; i++) {
        let angle = baseAngle;
        
        if (weaponData.projectiles > 1) {
            // Spread projectiles evenly
            const spreadRange = weaponData.spread;
            angle += (i - (weaponData.projectiles - 1) / 2) * (spreadRange / (weaponData.projectiles - 1));
        } else if (weaponData.spread > 0) {
            angle += (Math.random() - 0.5) * weaponData.spread;
        }
        
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
            size: weapon === 'rocket' ? 12 : 8,
            explosive: weaponData.explosive,
            explosionRadius: weaponData.explosionRadius
        });
    }
}