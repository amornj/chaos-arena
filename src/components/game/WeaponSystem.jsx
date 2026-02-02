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
        explosionRadius: 50,
        plasma: true
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
        damage: 0.4,
        fireRate: 0.12,
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
        damage: 0.5,
        fireRate: 0.18,
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
        damage: 0.8,
        fireRate: 0.15,
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

    // === EXPLOSIVE WEAPONS ===
    cluster_bomb: {
        name: 'Cluster Bomb',
        damage: 2,
        fireRate: 2.5,
        spread: 0,
        projectiles: 1,
        piercing: 0,
        color: '#ff6600',
        speed: 10,
        explosive: true,
        explosionRadius: 60,
        cluster: true,
        clusterCount: 6,
        clusterDamage: 1.5,
        clusterRadius: 40
    },
    sticky_bomb: {
        name: 'Sticky Launcher',
        damage: 4,
        fireRate: 1.5,
        spread: 0.1,
        projectiles: 1,
        piercing: 0,
        color: '#88ff00',
        speed: 12,
        explosive: true,
        explosionRadius: 70,
        sticky: true,
        fuseTime: 1500
    },
    napalm: {
        name: 'Napalm Launcher',
        damage: 1.5,
        fireRate: 2,
        spread: 0,
        projectiles: 1,
        piercing: 0,
        color: '#ff4400',
        speed: 9,
        explosive: true,
        explosionRadius: 90,
        napalm: true,
        burnDuration: 4000,
        burnDamage: 3
    },
    mine_layer: {
        name: 'Mine Layer',
        damage: 5,
        fireRate: 1,
        spread: 0.3,
        projectiles: 3,
        piercing: 0,
        color: '#ffff00',
        speed: 8,
        explosive: true,
        explosionRadius: 55,
        mine: true,
        mineLifetime: 10000,
        triggerRadius: 50
    },
    nuke_launcher: {
        name: 'Nuke Launcher',
        damage: 15,
        fireRate: 5,
        spread: 0,
        projectiles: 1,
        piercing: 0,
        color: '#00ff00',
        speed: 6,
        explosive: true,
        explosionRadius: 200,
        nuke: true
    },
    firework: {
        name: 'Firework Cannon',
        damage: 1,
        fireRate: 0.8,
        spread: 0.2,
        projectiles: 3,
        piercing: 0,
        color: '#ff00ff',
        speed: 14,
        explosive: true,
        explosionRadius: 45,
        firework: true,
        sparkCount: 8
    },
    dynamite: {
        name: 'Dynamite Toss',
        damage: 6,
        fireRate: 2,
        spread: 0,
        projectiles: 1,
        piercing: 0,
        color: '#ff0000',
        speed: 7,
        grenade: true,
        bounces: 1,
        fuseTime: 2000,
        explosive: true,
        explosionRadius: 100,
        dynamite: true
    },
    barrel_launcher: {
        name: 'Barrel Launcher',
        damage: 4,
        fireRate: 1.8,
        spread: 0,
        projectiles: 1,
        piercing: 0,
        color: '#8B4513',
        speed: 8,
        explosive: true,
        explosionRadius: 85,
        barrel: true
    },
    bomb_drone: {
        name: 'Bomb Drone',
        damage: 3,
        fireRate: 3,
        spread: 0,
        projectiles: 1,
        piercing: 0,
        color: '#444444',
        speed: 4,
        homing: true,
        homingStrength: 0.08,
        explosive: true,
        explosionRadius: 75,
        drone: true
    },
    impact_grenade: {
        name: 'Impact Grenade',
        damage: 3.5,
        fireRate: 1.2,
        spread: 0.1,
        projectiles: 1,
        piercing: 0,
        color: '#00ffff',
        speed: 18,
        explosive: true,
        explosionRadius: 65,
        impact: true
    },

    // === HITSCAN WEAPONS ===
    laser_rifle: {
        name: 'Laser Rifle',
        damage: 2.5,
        fireRate: 0.8,
        spread: 0,
        piercing: 2,
        color: '#ff0000',
        hitscan: true,
        range: 800,
        beamWidth: 3
    },
    railgun_instant: {
        name: 'Instant Railgun',
        damage: 12,
        fireRate: 2.5,
        spread: 0,
        piercing: 99,
        color: '#00ffff',
        hitscan: true,
        range: 2000,
        beamWidth: 6,
        screenShake: 0.4
    },
    death_ray: {
        name: 'Death Ray',
        damage: 1.2,
        fireRate: 0.1,
        spread: 0,
        piercing: 99,
        color: '#ff00ff',
        hitscan: true,
        range: 600,
        beamWidth: 8,
        continuous: true
    },
    antimatter_beam: {
        name: 'Antimatter Beam',
        damage: 6,
        fireRate: 1.5,
        spread: 0,
        piercing: 5,
        color: '#8800ff',
        hitscan: true,
        range: 1000,
        beamWidth: 10,
        explosive: true,
        explosionRadius: 40,
        screenShake: 0.3
    },
    sniper_hitscan: {
        name: 'Marksman Rifle',
        damage: 15,
        fireRate: 2,
        spread: 0,
        piercing: 3,
        color: '#00ff88',
        hitscan: true,
        range: 1500,
        beamWidth: 2,
        headshotMultiplier: 3,
        screenShake: 0.2
    },
    particle_beam: {
        name: 'Particle Beam',
        damage: 1.5,
        fireRate: 0.15,
        spread: 0.05,
        piercing: 1,
        color: '#ffff00',
        hitscan: true,
        range: 500,
        beamWidth: 4,
        chain: true,
        chainRange: 100,
        chainCount: 3
    },
    disintegrator: {
        name: 'Disintegrator',
        damage: 20,
        fireRate: 4,
        spread: 0,
        piercing: 1,
        color: '#ff4400',
        hitscan: true,
        range: 400,
        beamWidth: 15,
        disintegrate: true,
        screenShake: 0.5
    },
    photon_lance: {
        name: 'Photon Lance',
        damage: 4,
        fireRate: 1,
        spread: 0,
        piercing: 10,
        color: '#ffffff',
        hitscan: true,
        range: 1200,
        beamWidth: 5,
        burn: true,
        burnDamage: 2,
        burnDuration: 2000
    },
    gauss_cannon: {
        name: 'Gauss Cannon',
        damage: 8,
        fireRate: 1.8,
        spread: 0,
        piercing: 4,
        color: '#4488ff',
        hitscan: true,
        range: 900,
        beamWidth: 7,
        knockback: 15,
        screenShake: 0.35
    },
    tracer_gun: {
        name: 'Tracer Gun',
        damage: 1.2,
        fireRate: 0.15,
        spread: 0.15,
        piercing: 0,
        color: '#ffaa00',
        hitscan: true,
        range: 600,
        beamWidth: 2,
        multishot: 2
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
        range: 80,
        swingArc: Math.PI * 0.4,
        color: '#ffaa00',
        knockback: 4,
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
        range: 85,
        swingArc: Math.PI * 0.5,
        color: '#ff8800',
        knockback: 12,
        cleave: true,
        overpump: true, // Press P to pump, up to 4 times
        desc: 'Press P to PUMP IT UP! (2+ pumps = explosion)'
    },
    chainsaw: {
        name: 'Chainsaw',
        damage: 0.8,
        fireRate: 0.05, // Very fast hits
        melee: true,
        range: 60,
        swingArc: Math.PI * 0.3,
        color: '#ff4444',
        knockback: 1,
        cleave: false,
        chainsaw: true, // Continuous damage while held
        bleed: true,
        bleedDamage: 4,
        bleedDuration: 2000,
        desc: 'BRRRRRRR! Shreds through enemies'
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
    katana: {
        name: 'Katana',
        damage: 5,
        fireRate: 0.4,
        melee: true,
        range: 110,
        swingArc: Math.PI * 0.7,
        color: '#ff4466',
        knockback: 8,
        cleave: true,
        samuraiExclusive: true, // Cannot be bought in shop
        desc: 'The way of the warrior'
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
    },

    // === NEW RANGED WEAPONS ===
    double_barrel: {
        name: 'Double Barrel',
        damage: 1.2,
        fireRate: 1.8,
        spread: 0.4,
        projectiles: 10,
        piercing: 0,
        color: '#cc8844',
        speed: 14,
        desc: 'Two barrels of pain'
    },
    assault_rifle: {
        name: 'Assault Rifle',
        damage: 0.7,
        fireRate: 0.12,
        spread: 0.08,
        projectiles: 1,
        piercing: 0,
        color: '#88cc44',
        speed: 22
    },
    revolver: {
        name: 'Revolver',
        damage: 3,
        fireRate: 0.8,
        spread: 0,
        projectiles: 1,
        piercing: 1,
        color: '#ffdd44',
        speed: 28
    },
    hand_cannon: {
        name: 'Hand Cannon',
        damage: 7,
        fireRate: 1.5,
        spread: 0,
        projectiles: 1,
        piercing: 2,
        color: '#ff8800',
        speed: 20,
        knockback: 8,
        screenShake: 0.3
    },
    ricochet_rifle: {
        name: 'Ricochet Rifle',
        damage: 1.5,
        fireRate: 0.6,
        spread: 0,
        projectiles: 1,
        piercing: 0,
        color: '#00ffaa',
        speed: 18,
        bouncer: true,
        maxBounces: 8
    },
    black_hole_gun: {
        name: 'Black Hole Gun',
        damage: 0.5,
        fireRate: 3,
        spread: 0,
        projectiles: 1,
        piercing: 0,
        color: '#440088',
        speed: 5,
        blackHole: true,
        pullRadius: 150,
        pullStrength: 12,
        lifetime: 180
    },
    gravity_gun: {
        name: 'Gravity Gun',
        damage: 2,
        fireRate: 1.2,
        spread: 0.1,
        projectiles: 1,
        piercing: 0,
        color: '#8800ff',
        speed: 12,
        gravity: true,
        pullStrength: 6
    },
    shrapnel_cannon: {
        name: 'Shrapnel Cannon',
        damage: 0.8,
        fireRate: 1.5,
        spread: 0.6,
        projectiles: 20,
        piercing: 0,
        color: '#888888',
        speed: 16
    },
    ice_shard: {
        name: 'Ice Shard Launcher',
        damage: 1.8,
        fireRate: 0.7,
        spread: 0.1,
        projectiles: 3,
        piercing: 1,
        color: '#aaeeff',
        speed: 20,
        cryo: true,
        slowAmount: 0.5,
        slowDuration: 2500
    },
    void_cannon: {
        name: 'Void Cannon',
        damage: 4,
        fireRate: 2,
        spread: 0,
        projectiles: 1,
        piercing: 3,
        color: '#220044',
        speed: 15,
        void: true,
        disintegrate: true
    },
    bubble_gun: {
        name: 'Bubble Gun',
        damage: 0.5,
        fireRate: 0.3,
        spread: 0.3,
        projectiles: 5,
        piercing: 0,
        color: '#88ddff',
        speed: 6,
        bubble: true,
        trapDuration: 2000
    },
    boomerang: {
        name: 'Boomerang',
        damage: 2.5,
        fireRate: 1.5,
        spread: 0,
        projectiles: 1,
        piercing: 5,
        color: '#ffaa44',
        speed: 12,
        boomerang: true,
        returnSpeed: 15
    },
    sonic_blaster: {
        name: 'Sonic Blaster',
        damage: 1.2,
        fireRate: 0.8,
        spread: 0.5,
        projectiles: 1,
        piercing: 10,
        color: '#ffff88',
        speed: 30,
        sonic: true,
        waveWidth: 60
    },
    flare_gun: {
        name: 'Flare Gun',
        damage: 1,
        fireRate: 1.5,
        spread: 0,
        projectiles: 1,
        piercing: 0,
        color: '#ff4400',
        speed: 10,
        flame: true,
        explosive: true,
        explosionRadius: 60,
        burnDuration: 3000,
        burnDamage: 2
    },
    needle_gun: {
        name: 'Needle Gun',
        damage: 0.3,
        fireRate: 0.05,
        spread: 0.15,
        projectiles: 1,
        piercing: 0,
        color: '#cccccc',
        speed: 35,
        needle: true
    },
    spore_launcher: {
        name: 'Spore Launcher',
        damage: 1,
        fireRate: 1.2,
        spread: 0.2,
        projectiles: 3,
        piercing: 0,
        color: '#88ff44',
        speed: 8,
        spore: true,
        dotDamage: 3,
        dotDuration: 4000,
        spreadOnHit: true
    },
    chain_gun: {
        name: 'Chain Gun',
        damage: 0.4,
        fireRate: 0.06,
        spread: 0.2,
        projectiles: 1,
        piercing: 0,
        color: '#ffcc00',
        speed: 24,
        spinUp: true
    },

    // === NEW EXPLOSIVE WEAPONS ===
    carpet_bomber: {
        name: 'Carpet Bomber',
        damage: 2,
        fireRate: 0.4,
        spread: 0.8,
        projectiles: 5,
        piercing: 0,
        color: '#ff6644',
        speed: 12,
        explosive: true,
        explosionRadius: 50,
        grenade: true,
        bounces: 0,
        fuseTime: 800
    },
    black_hole_bomb: {
        name: 'Black Hole Bomb',
        damage: 1,
        fireRate: 4,
        spread: 0,
        projectiles: 1,
        piercing: 0,
        color: '#220044',
        speed: 8,
        explosive: true,
        explosionRadius: 200,
        blackHoleBomb: true,
        pullDuration: 2000
    },
    bouncy_bomb: {
        name: 'Bouncy Bomb',
        damage: 3,
        fireRate: 1.8,
        spread: 0,
        projectiles: 1,
        piercing: 0,
        color: '#ff88ff',
        speed: 10,
        grenade: true,
        bounces: 6,
        fuseTime: 3000,
        explosive: true,
        explosionRadius: 70
    },
    molotov: {
        name: 'Molotov Cocktail',
        damage: 1,
        fireRate: 1.5,
        spread: 0,
        projectiles: 1,
        piercing: 0,
        color: '#ff6600',
        speed: 10,
        grenade: true,
        bounces: 0,
        fuseTime: 0,
        napalm: true,
        burnDuration: 5000,
        burnDamage: 4,
        explosionRadius: 80
    },
    cryo_bomb: {
        name: 'Cryo Bomb',
        damage: 2,
        fireRate: 2,
        spread: 0,
        projectiles: 1,
        piercing: 0,
        color: '#88ddff',
        speed: 12,
        explosive: true,
        explosionRadius: 100,
        cryoBomb: true,
        freezeDuration: 3000
    },
    shock_grenade: {
        name: 'Shock Grenade',
        damage: 2,
        fireRate: 1.5,
        spread: 0,
        projectiles: 1,
        piercing: 0,
        color: '#00ffff',
        speed: 14,
        grenade: true,
        bounces: 1,
        fuseTime: 1200,
        explosive: true,
        explosionRadius: 90,
        lightning: true,
        chainRange: 120,
        chains: 5
    },
    MIRV: {
        name: 'MIRV Launcher',
        damage: 1.5,
        fireRate: 3,
        spread: 0,
        projectiles: 1,
        piercing: 0,
        color: '#ff0044',
        speed: 8,
        cluster: true,
        clusterCount: 8,
        clusterDamage: 2,
        clusterRadius: 50,
        explosive: true,
        explosionRadius: 40
    },
    time_bomb: {
        name: 'Time Bomb',
        damage: 10,
        fireRate: 4,
        spread: 0,
        projectiles: 1,
        piercing: 0,
        color: '#ffff00',
        speed: 6,
        mine: true,
        mineLifetime: 30000,
        triggerRadius: 80,
        explosive: true,
        explosionRadius: 150,
        timeBomb: true
    },

    // === NEW HITSCAN WEAPONS ===
    plasma_beam: {
        name: 'Plasma Beam',
        damage: 0.8,
        fireRate: 0.08,
        spread: 0,
        piercing: 99,
        color: '#ff00ff',
        hitscan: true,
        range: 700,
        beamWidth: 12,
        continuous: true,
        plasma: true
    },
    freeze_ray: {
        name: 'Freeze Ray',
        damage: 0.5,
        fireRate: 0.1,
        spread: 0,
        piercing: 3,
        color: '#88eeff',
        hitscan: true,
        range: 500,
        beamWidth: 10,
        continuous: true,
        cryo: true,
        slowAmount: 0.8,
        slowDuration: 1000
    },
    gamma_ray: {
        name: 'Gamma Ray',
        damage: 3,
        fireRate: 0.5,
        spread: 0,
        piercing: 99,
        color: '#00ff00',
        hitscan: true,
        range: 2000,
        beamWidth: 4,
        radiation: true,
        dotDamage: 5,
        dotDuration: 5000
    },
    tractor_beam: {
        name: 'Tractor Beam',
        damage: 0.2,
        fireRate: 0.05,
        spread: 0,
        piercing: 1,
        color: '#8888ff',
        hitscan: true,
        range: 400,
        beamWidth: 20,
        continuous: true,
        pull: true,
        pullStrength: 10
    },
    pulse_laser: {
        name: 'Pulse Laser',
        damage: 2,
        fireRate: 0.3,
        spread: 0,
        piercing: 2,
        color: '#ff8800',
        hitscan: true,
        range: 600,
        beamWidth: 5,
        pulse: true,
        pulseRadius: 50
    },
    annihilator: {
        name: 'Annihilator',
        damage: 50,
        fireRate: 6,
        spread: 0,
        piercing: 99,
        color: '#ff0000',
        hitscan: true,
        range: 2000,
        beamWidth: 25,
        explosive: true,
        explosionRadius: 100,
        screenShake: 0.8,
        disintegrate: true,
        superRare: true,
        desc: 'Deletes everything.'
    },

    // === NEW MELEE WEAPONS ===
    scythe: {
        name: 'Scythe',
        damage: 4,
        fireRate: 0.8,
        melee: true,
        range: 120,
        swingArc: Math.PI * 0.9,
        color: '#880088',
        knockback: 6,
        cleave: true,
        lifesteal: 0.15,
        desc: 'Reap what you sow'
    },
    warhammer: {
        name: 'Warhammer',
        damage: 8,
        fireRate: 1.5,
        melee: true,
        range: 70,
        swingArc: Math.PI * 0.5,
        color: '#666666',
        knockback: 25,
        cleave: true,
        groundSlam: true,
        slamRadius: 100,
        stun: true,
        stunDuration: 1500,
        desc: 'BONK'
    },
    whip: {
        name: 'Whip',
        damage: 1.5,
        fireRate: 0.3,
        melee: true,
        range: 200,
        swingArc: Math.PI * 0.2,
        color: '#8B4513',
        knockback: 3,
        cleave: false,
        bleed: true,
        bleedDamage: 2,
        bleedDuration: 3000,
        desc: 'Crack!'
    },
    claws: {
        name: 'Claws',
        damage: 1.8,
        fireRate: 0.15,
        melee: true,
        range: 50,
        swingArc: Math.PI * 0.4,
        color: '#ff4444',
        knockback: 1,
        cleave: false,
        bleed: true,
        bleedDamage: 5,
        bleedDuration: 2000,
        comboHits: 3,
        comboWindow: 500,
        desc: 'Slash slash slash'
    },
    flail: {
        name: 'Flail',
        damage: 5,
        fireRate: 1,
        melee: true,
        range: 130,
        swingArc: Math.PI * 1,
        color: '#888888',
        knockback: 12,
        cleave: true,
        desc: 'Full 360 devastation'
    },
    spear: {
        name: 'Spear',
        damage: 3,
        fireRate: 0.5,
        melee: true,
        range: 160,
        swingArc: Math.PI * 0.15,
        color: '#bb8844',
        knockback: 4,
        cleave: false,
        thrust: true,
        desc: 'Long reach, precise strikes'
    },
    kunai: {
        name: 'Kunai',
        damage: 2,
        fireRate: 0.18,
        melee: true,
        range: 45,
        swingArc: Math.PI * 0.35,
        color: '#444444',
        knockback: 1,
        cleave: false,
        backstab: true,
        backstabMultiplier: 3,
        desc: 'Strike from behind for 3x damage'
    },
    battleaxe: {
        name: 'Battle Axe',
        damage: 7,
        fireRate: 1.1,
        melee: true,
        range: 90,
        swingArc: Math.PI * 0.7,
        color: '#aa4444',
        knockback: 10,
        cleave: true,
        bleed: true,
        bleedDamage: 6,
        bleedDuration: 2500,
        desc: 'Heavy cleaving strikes'
    },
    energy_fist: {
        name: 'Energy Fist',
        damage: 4,
        fireRate: 0.25,
        melee: true,
        range: 55,
        swingArc: Math.PI * 0.4,
        color: '#00ffff',
        knockback: 20,
        cleave: false,
        explosive: true,
        explosionRadius: 60,
        desc: 'Falcon PUNCH!'
    },
    plasma_blade: {
        name: 'Plasma Blade',
        damage: 3.5,
        fireRate: 0.3,
        melee: true,
        range: 80,
        swingArc: Math.PI * 0.55,
        color: '#ff00ff',
        knockback: 4,
        cleave: true,
        burn: true,
        burnDamage: 3,
        burnDuration: 2000,
        desc: 'Burns on contact'
    },
    ice_pick: {
        name: 'Ice Pick',
        damage: 2.5,
        fireRate: 0.35,
        melee: true,
        range: 55,
        swingArc: Math.PI * 0.35,
        color: '#aaeeff',
        knockback: 2,
        cleave: false,
        cryo: true,
        slowAmount: 0.7,
        slowDuration: 2500,
        desc: 'Chilling strikes'
    },
    nunchucks: {
        name: 'Nunchucks',
        damage: 1.5,
        fireRate: 0.1,
        melee: true,
        range: 60,
        swingArc: Math.PI * 0.5,
        color: '#bb8844',
        knockback: 3,
        cleave: false,
        comboHits: 5,
        comboWindow: 400,
        desc: 'Wataaaa!'
    },
    tesla_gauntlet: {
        name: 'Tesla Gauntlet',
        damage: 2,
        fireRate: 0.4,
        melee: true,
        range: 65,
        swingArc: Math.PI * 0.45,
        color: '#00ccff',
        knockback: 5,
        cleave: false,
        lightning: true,
        chainRange: 80,
        chains: 4,
        desc: 'Shocking punches'
    },

    // === SUPER RARE WEAPONS ===
    infinity_blade: {
        name: 'Infinity Blade',
        damage: 15,
        fireRate: 0.7,
        melee: true,
        range: 100,
        swingArc: Math.PI * 0.7,
        color: '#ffaa00',
        knockback: 8,
        cleave: true,
        superRare: true,
        scaleDamage: true, // Damage increases each kill
        desc: 'Power grows with each kill'
    },
    rubber_chicken: {
        name: 'Rubber Chicken',
        damage: 0.5,
        fireRate: 0.2,
        melee: true,
        range: 50,
        swingArc: Math.PI * 0.5,
        color: '#ffff00',
        knockback: 30,
        cleave: true,
        superRare: true,
        squeaky: true,
        desc: '*SQUEAK* *SQUEAK*'
    },
    galaxy_gun: {
        name: 'Galaxy Gun',
        damage: 3,
        fireRate: 0.5,
        spread: 0.3,
        projectiles: 8,
        piercing: 2,
        color: '#ff88ff',
        speed: 10,
        homing: true,
        homingStrength: 0.2,
        superRare: true,
        desc: 'Stars align to destroy'
    },
    golden_gun: {
        name: 'Golden Gun',
        damage: 100,
        fireRate: 2,
        spread: 0,
        projectiles: 1,
        piercing: 0,
        color: '#ffd700',
        speed: 40,
        superRare: true,
        oneShot: true,
        desc: 'One shot, one kill'
    },
    toilet_plunger: {
        name: 'Toilet Plunger',
        damage: 3,
        fireRate: 0.6,
        melee: true,
        range: 60,
        swingArc: Math.PI * 0.4,
        color: '#8b4513',
        knockback: 15,
        cleave: false,
        superRare: true,
        suck: true, // Pulls enemies closer
        desc: 'Plunges deep...'
    },

    // === REQUESTED SPECIAL WEAPONS ===
    holy_hand_grenade: {
        name: 'Holy Hand Grenade',
        damage: 5,
        fireRate: 2.5,
        spread: 0,
        projectiles: 1,
        piercing: 0,
        color: '#ffffaa',
        speed: 10,
        grenade: true,
        bounces: 1,
        fuseTime: 2000,
        holyGrenade: true,
        divineLight: true,
        divineRadius: 100, // Same as greatsword range
        divineDuration: 4000,
        burnDamage: 8,
        explosive: true,
        explosionRadius: 80,
        superRare: true,
        desc: 'One... Two... FIVE!'
    },
    neptunes_rain: {
        name: "Neptune's Rain",
        damage: 53,
        fireRate: 0.15,
        spread: 0.4,
        projectiles: 8,
        piercing: 99,
        color: '#88ddff',
        speed: 25,
        diamond: true,
        bleed: true,
        bleedDamage: 30,
        bleedDuration: 3000,
        superRare: true,
        desc: 'DIAMONDS DIAMONDS DIAMONDS'
    },
    peacekeeper: {
        name: 'Peacekeeper',
        damage: 4.5,
        fireRate: 0.6,
        spread: 0,
        projectiles: 1,
        piercing: 1,
        color: '#ddaa44',
        speed: 35,
        desc: 'A finely-tuned revolver'
    },
    toxin_jar: {
        name: 'Toxin Gas Jar',
        damage: 0.5,
        fireRate: 1.8,
        spread: 0,
        projectiles: 1,
        piercing: 0,
        color: '#88ff44',
        speed: 12,
        grenade: true,
        bounces: 0,
        fuseTime: 0,
        toxinJar: true,
        toxinParticles: 20,
        toxinDamage: 15,
        toxinDuration: 5000,
        explosionRadius: 120,
        superRare: true,
        desc: 'why did they get this?'
    },
    bomb_knife: {
        name: 'Bomb Knife',
        damage: 2,
        fireRate: 0.8,
        spread: 0,
        projectiles: 1,
        piercing: 0,
        color: '#cccccc',
        speed: 28,
        bombKnife: true,
        fuseTime: 1000,
        explosive: true,
        explosionRadius: 70,
        desc: 'Sticks and then... boom'
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
    },

    // ===== ADVANCED SPEED MODULES =====
    control_module: {
        name: 'Control Module',
        icon: '🎮',
        desc: 'Enables drifting and precise speed control',
        apply: (p) => p.hasControlModule = true
    },
    dash_v2: {
        name: 'Dash Module V2',
        icon: '⚡',
        desc: 'Press X: 10x speed dash with drift (Requires Dash V1)',
        apply: (p) => {
            if (p.hasDash) {
                p.hasDashV2 = true;
                p.hasControlModule = true; // Includes drift
            }
        },
        requires: 'dash'
    },
    afterburner: {
        name: 'Afterburner',
        icon: '🔥',
        desc: 'PASSIVE: Leave burning trail at 150%+ speed (5 dmg/sec)',
        apply: (p) => p.hasAfterburner = true
    },
    sandevistan: {
        name: 'Sandevistan',
        icon: '⏱️',
        desc: 'Press Z: Time slows 80%, you speed up 200% (10s, 30s CD)',
        apply: (p) => p.hasSandevistan = true
    },
    particle_accelerator: {
        name: 'Particle Accelerator',
        icon: '⚛️',
        desc: 'Press X: 10x speed, drifting, leaves fire trail',
        apply: (p) => {
            p.hasParticleAccelerator = true;
            p.hasControlModule = true;
            p.hasAfterburner = true;
        }
    },
    blitz: {
        name: '"BLITZ" Dash Module V3',
        icon: '💀',
        desc: '15x speed dash + all effects + projectile ricochet',
        apply: (p) => {
            p.hasBlitz = true;
            p.hasControlModule = true;
            p.hasAfterburner = true;
            p.hasDashV2 = true;
        },
        requires: 'dash_v2'
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

export function shootWeapon(weapon, player, targetX, targetY, createBullet, createMeleeAttack, createHitscan) {
    const weaponData = WEAPONS[weapon];
    const baseAngle = Math.atan2(targetY - player.y, targetX - player.x);
    const multishot = player.multishot || 1;

    // Hitscan weapon handling
    if (weaponData.hitscan) {
        if (createHitscan) {
            const shotCount = weaponData.multishot || 1;
            for (let s = 0; s < shotCount; s++) {
                const spreadAngle = baseAngle + (Math.random() - 0.5) * (weaponData.spread || 0);
                createHitscan({
                    x: player.x,
                    y: player.y,
                    angle: spreadAngle,
                    range: weaponData.range || 800,
                    damage: player.damage * weaponData.damage,
                    piercing: weaponData.piercing + (player.piercing || 0),
                    color: weaponData.color,
                    beamWidth: weaponData.beamWidth || 3,
                    screenShake: weaponData.screenShake || 0,
                    explosive: weaponData.explosive,
                    explosionRadius: weaponData.explosionRadius,
                    chain: weaponData.chain,
                    chainRange: weaponData.chainRange,
                    chainCount: weaponData.chainCount,
                    burn: weaponData.burn,
                    burnDamage: weaponData.burnDamage,
                    burnDuration: weaponData.burnDuration,
                    knockback: weaponData.knockback,
                    disintegrate: weaponData.disintegrate,
                    headshotMultiplier: weaponData.headshotMultiplier,
                    continuous: weaponData.continuous
                });
            }
        }
        return;
    }

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
                chainsaw: weaponData.chainsaw || false,
                spawnTime: Date.now(),
                duration: weaponData.chainsaw ? 100 : 200 // Chainsaw has shorter swing animation
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
                sniper: weaponData.sniper,
                // Visual weapon types
                saw: weaponData.saw,
                bouncer: weaponData.bouncer,
                maxBounces: weaponData.maxBounces,
                harpoon: weaponData.harpoon,
                cannonball: weaponData.cannonball,
                beam: weaponData.beam,
                orbitalLaser: weaponData.orbitalLaser,
                acid: weaponData.acid,
                cryo: weaponData.cryo,
                plasma: weaponData.plasma,
                pulse: weaponData.pulse,
                railgun: weaponData.railgun,
                homing: weaponData.homing,
                crossbow: weaponData.crossbow,
                // Explosive weapon types
                cluster: weaponData.cluster,
                clusterCount: weaponData.clusterCount,
                clusterDamage: weaponData.clusterDamage,
                clusterRadius: weaponData.clusterRadius,
                sticky: weaponData.sticky,
                napalm: weaponData.napalm,
                burnDuration: weaponData.burnDuration,
                burnDamage: weaponData.burnDamage,
                mine: weaponData.mine,
                mineLifetime: weaponData.mineLifetime,
                triggerRadius: weaponData.triggerRadius,
                nuke: weaponData.nuke,
                firework: weaponData.firework,
                sparkCount: weaponData.sparkCount,
                dynamite: weaponData.dynamite,
                barrel: weaponData.barrel,
                drone: weaponData.drone,
                impact: weaponData.impact
            };

            createBullet(bullet);
        }
    }
}