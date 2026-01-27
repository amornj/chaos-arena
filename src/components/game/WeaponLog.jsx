import React, { useState } from 'react';

const WEAPON_INFO = {
    // === BASIC WEAPONS ===
    pistol: {
        name: 'PISTOL',
        class: 'SIDEARM',
        manufacturer: 'STANDARD ISSUE',
        category: 'Basic',
        lore: `MODEL: SI-9 "PEACEKEEPER"

ORIGIN: The standard-issue sidearm for all Arena contestants. Mass-produced by Foundry Corp before the Corruption, these reliable weapons have become synonymous with survival.

TECHNICAL SPECS: Semi-automatic, energy-cell powered. Balanced accuracy and fire rate make it ideal for new combatants.

FIELD NOTES: "Everyone starts with a pistol. The ones who survive learn to make every shot count. The ones who don't... well, the Arena always needs more contestants."
- Arena Orientation Manual, Page 1`
    },
    shotgun: {
        name: 'SHOTGUN',
        class: 'CLOSE RANGE',
        manufacturer: 'DEVASTATOR ARMS',
        category: 'Basic',
        lore: `MODEL: DA-12 "CROWD CONTROL"

ORIGIN: Originally designed for riot suppression, the DA-12 found new purpose in the Arena's cramped corridors. Devastator Arms went bankrupt after the Corruption, but their weapons live on.

TECHNICAL SPECS: Spread-fire energy pellets. Devastating at close range, negligible at distance. Six-pellet burst pattern.

FIELD NOTES: "Nothing clears a room like a DA-12. Just make sure the room isn't too big, or you're the one getting cleared."
- Veteran Contestant "Buckshot" Barry`
    },
    minigun: {
        name: 'MINIGUN',
        class: 'HEAVY',
        manufacturer: 'VULCAN INDUSTRIES',
        category: 'Heavy',
        lore: `MODEL: VI-7 "LEAD RAIN"

ORIGIN: Stripped from decommissioned gunships, these rotary cannons were never meant for infantry use. The Arena doesn't care about "meant to."

TECHNICAL SPECS: High rate of fire, moderate accuracy. Sustained fire creates suppression zones. Overheating is a myth - these things were built for war.

FIELD NOTES: "The VI-7 doesn't ask questions. It doesn't negotiate. It just keeps spinning and everything in front of it stops existing."
- "Heavy" Hank, Minigun Champion (5 consecutive waves)`
    },

    // === EXPLOSIVE WEAPONS ===
    rocket: {
        name: 'ROCKET LAUNCHER',
        class: 'EXPLOSIVE',
        manufacturer: 'BOOM DYNAMICS',
        category: 'Explosive',
        lore: `MODEL: BD-X "PROBLEM SOLVER"

ORIGIN: Boom Dynamics' flagship product. Each rocket contains enough explosive compound to level a small building. Arena regulations require a minimum safe distance of 50 meters. Nobody follows it.

TECHNICAL SPECS: Single-shot explosive projectile. Massive area damage. Friendly fire is always on.

FIELD NOTES: "The BD-X solves problems. Big problems. Small problems. Problems you didn't even know you had. Just remember - if you can see the explosion, you're too close."
- Boom Dynamics Marketing (Posthumous)`
    },
    grenade_launcher: {
        name: 'GRENADE LAUNCHER',
        class: 'EXPLOSIVE',
        manufacturer: 'FRAG FOUNDRY',
        category: 'Explosive',
        lore: `MODEL: FF-40 "BOUNCING BETTY"

ORIGIN: Developed for clearing entrenched positions. The grenades bounce unpredictably before detonation, making them perfect for around-corner attacks.

TECHNICAL SPECS: Arcing projectiles with delayed fuse. Bounces off surfaces before detonation. Medium blast radius.

FIELD NOTES: "Bank shots. That's the secret. Learn the angles, learn the timing. Turn every wall into a weapon."
- Arena Trick Shot Champion 2547`
    },
    cluster_bomb: {
        name: 'CLUSTER BOMB',
        class: 'EXPLOSIVE',
        manufacturer: 'DEVASTATION INC',
        category: 'Explosive',
        lore: `MODEL: DI-CB7 "PARTY STARTER"

ORIGIN: Banned by seventeen interstellar treaties. The Arena isn't a signatory to any of them.

TECHNICAL SPECS: Primary payload releases multiple sub-munitions on impact. Each bomblet has independent targeting. Covers massive area.

FIELD NOTES: "One shot, twelve explosions. The math works out in your favor. Unless you're standing in the blast zone."
- Demolitions Expert (Anonymous)`
    },
    nuke_launcher: {
        name: 'NUKE LAUNCHER',
        class: 'EXTINCTION-LEVEL',
        manufacturer: 'LAST RESORT WEAPONS',
        category: 'Legendary',
        lore: `MODEL: LRW-1 "FINAL ARGUMENT"

ORIGIN: There are no records of who built this weapon. There are no records of how it got into the Arena. There is only the mushroom cloud and the silence that follows.

TECHNICAL SPECS: CLASSIFIED. Massive explosive yield. Radiation effects persist. User discretion advised. User survival not guaranteed.

FIELD NOTES: "They call it the Final Argument because after you use it, there's nothing left to argue about. I've seen one fired. Once. The Arena had to rebuild an entire sector."
- Arena Maintenance Chief`
    },

    // === ENERGY WEAPONS ===
    laser: {
        name: 'LASER RIFLE',
        class: 'PRECISION',
        manufacturer: 'PHOTON DYNAMICS',
        category: 'Energy',
        lore: `MODEL: PD-15 "STRAIGHT LINE"

ORIGIN: Photon Dynamics pioneered coherent light weaponry. Their laser rifles are known for pinpoint accuracy and clean kills. No mess, no fuss, no survivors.

TECHNICAL SPECS: Continuous beam emission. High penetration capability. Cauterizes wounds on contact.

FIELD NOTES: "Light travels in straight lines. So do laser bolts. Learn geometry or learn to die."
- Sniper Academy Graduation Speech`
    },
    plasma: {
        name: 'PLASMA CANNON',
        class: 'ENERGY/EXPLOSIVE',
        manufacturer: 'SOLAR FORGE',
        category: 'Energy',
        lore: `MODEL: SF-3000 "SUNSPOT"

ORIGIN: Solar Forge harnessed star-stuff and put it in a gun. Each shot is a miniature sun, complete with the heat and destruction you'd expect.

TECHNICAL SPECS: Superheated plasma projectiles. Explosive impact with area damage. Melts through armor like butter.

FIELD NOTES: "First time I saw a Sunspot fire, I thought someone had brought an actual star into the Arena. Then I realized what it was. Then I ran."
- Survivor's Account, Wave 15`
    },
    beam: {
        name: 'BEAM CANNON',
        class: 'CONTINUOUS',
        manufacturer: 'CONVERGENCE LABS',
        category: 'Energy',
        lore: `MODEL: CL-BEAM "DEATH RAY"

ORIGIN: Convergence Labs tried to create a cutting tool. They succeeded beyond their wildest dreams. And their worst nightmares.

TECHNICAL SPECS: Continuous damage beam. Hold trigger to maintain connection. Cuts through multiple targets. Power consumption is... significant.

FIELD NOTES: "It's not a gun. It's a continuous line of death between you and whatever you point it at. Don't cross the streams. Don't ask why."
- Beam Operator's Manual`
    },
    tesla: {
        name: 'TESLA COIL',
        class: 'CHAIN LIGHTNING',
        manufacturer: 'STORM WORKS',
        category: 'Energy',
        lore: `MODEL: SW-TESLA "LIGHTNING IN A BOTTLE"

ORIGIN: Storm Works captured lightning and taught it to jump. Their Tesla coils arc between targets, turning crowds into conductors.

TECHNICAL SPECS: Electrical discharge chains between nearby enemies. Damage splits on each jump. Water amplifies effect.

FIELD NOTES: "Electricity takes the path of least resistance. With the Tesla, YOU choose that path. Make sure it doesn't include you."
- Storm Works Safety Video (Ironic, given the product)`
    },
    orbital_laser: {
        name: 'ORBITAL LASER',
        class: 'SATELLITE',
        manufacturer: 'SKYFALL DEFENSE',
        category: 'Legendary',
        lore: `MODEL: SD-ORBITAL "FINGER OF GOD"

ORIGIN: Somewhere in orbit, a weapon platform waits. When you pull the trigger, it responds. Nobody knows who put it there. Nobody wants to find out.

TECHNICAL SPECS: Designator links to orbital weapons platform. Massive sustained damage beam from above. Cannot be dodged. Cannot be stopped.

FIELD NOTES: "Look up. See that star that shouldn't be there? That's not a star. That's the Finger of God, and it's pointed right at the Arena. Sleep well."
- Anonymous Arena Official`
    },

    // === SPECIAL WEAPONS ===
    flamethrower: {
        name: 'FLAMETHROWER',
        class: 'AREA DENIAL',
        manufacturer: 'INFERNO ARMS',
        category: 'Special',
        lore: `MODEL: IA-FLAME "PURIFIER"

ORIGIN: Inferno Arms believed fire solves all problems. They weren't wrong. Their Purifier has cleansed more Arena sectors than any other weapon.

TECHNICAL SPECS: Continuous flame projection. Leaves burning areas. Ignores most armor. Does not discriminate between friend and foe.

FIELD NOTES: "Fire doesn't care about armor. Fire doesn't care about shields. Fire just wants to burn. Be the one holding the lighter, not the one on fire."
- Pyrotechnician's Creed`
    },
    sniper: {
        name: 'SNIPER RIFLE',
        class: 'PRECISION',
        manufacturer: 'LONG REACH',
        category: 'Precision',
        lore: `MODEL: LR-50 "DISTANT THUNDER"

ORIGIN: Long Reach makes weapons for people who believe in solving problems from very far away. The LR-50 makes those solutions permanent.

TECHNICAL SPECS: Extreme damage per shot. High penetration. Long reload. One shot, one kill - if your aim is true.

FIELD NOTES: "The best fights are the ones your enemy never sees coming. The LR-50 specializes in those fights."
- Sniper's Handbook, Introduction`
    },
    railgun: {
        name: 'RAILGUN',
        class: 'MAGNETIC',
        manufacturer: 'VELOCITY SYSTEMS',
        category: 'Heavy',
        lore: `MODEL: VS-RAIL "THROUGH AND THROUGH"

ORIGIN: Velocity Systems asked a simple question: what if we accelerated a metal slug to a significant fraction of light speed? The answer was the railgun.

TECHNICAL SPECS: Electromagnetic acceleration. Penetrates all known armor types. Exit wounds are... substantial.

FIELD NOTES: "I shot a Brute with the railgun. The slug went through it, through the wall behind it, through three more walls, and we never found where it stopped. That's the railgun."
- Weapons Testing Report #4451`
    },
    swarm: {
        name: 'SWARM LAUNCHER',
        class: 'TRACKING',
        manufacturer: 'HIVE MIND TECH',
        category: 'Special',
        lore: `MODEL: HMT-SWARM "ANGRY BEES"

ORIGIN: Hive Mind Tech studied insect swarm behavior and weaponized it. Each missile thinks for itself, communicates with its siblings, and really, really wants to explode.

TECHNICAL SPECS: Multiple tracking missiles per shot. Swarm AI coordinates attacks. Difficult to evade, impossible to outrun.

FIELD NOTES: "You can't hide from the swarm. You can't outrun the swarm. You can only hope you're not what the swarm is angry at."
- Swarm Survivor (One of three)`
    },
    acid: {
        name: 'ACID CANNON',
        class: 'CORROSIVE',
        manufacturer: 'DISSOLVE DYNAMICS',
        category: 'Special',
        lore: `MODEL: DD-ACID "MELTDOWN"

ORIGIN: Dissolve Dynamics weaponized industrial solvents. Their acid eats through metal, ceramic, flesh, hope, and dreams with equal enthusiasm.

TECHNICAL SPECS: Corrosive projectiles leave damage pools. Armor degradation over time. Horrifying to witness.

FIELD NOTES: "The sound. That's what haunts me. The sizzling. The hissing. The screaming stops eventually. The sizzling doesn't."
- PTSD Counseling Session Transcript`
    },
    cryo: {
        name: 'CRYO BLASTER',
        class: 'FREEZE',
        manufacturer: 'ABSOLUTE ZERO',
        category: 'Special',
        lore: `MODEL: AZ-CRYO "WINTER'S WRATH"

ORIGIN: Absolute Zero took the coldest temperature in the universe and put it in a gun. Their Cryo Blaster makes liquid nitrogen look like a warm bath.

TECHNICAL SPECS: Cryogenic projectiles. Slows and eventually freezes targets. Frozen enemies shatter on impact.

FIELD NOTES: "They stop moving. Then they stop thinking. Then they stop being anything except ice sculptures. Beautiful, in a horrifying way."
- Arena Philosopher (Self-proclaimed)`
    },

    // === HITSCAN WEAPONS ===
    laser_rifle: {
        name: 'LASER RIFLE (HITSCAN)',
        class: 'INSTANT HIT',
        manufacturer: 'PHOTON DYNAMICS',
        category: 'Hitscan',
        lore: `MODEL: PD-20 "ZERO TRAVEL TIME"

ORIGIN: Photon Dynamics' next-generation laser rifle. No travel time. No bullet drop. What you see is what you vaporize.

TECHNICAL SPECS: Instantaneous hit registration. Light-based damage. What you aim at, you hit.

FIELD NOTES: "Point. Click. Dead. It's that simple. No leading targets, no calculating drop. Just pure, instant death."
- PD Marketing Department`
    },
    railgun_instant: {
        name: 'RAILGUN (INSTANT)',
        class: 'INSTANT HIT',
        manufacturer: 'VELOCITY SYSTEMS',
        category: 'Hitscan',
        lore: `MODEL: VS-RAIL MK2 "CERTAINTY"

ORIGIN: The second generation railgun. They fixed the "waiting for the slug" problem. Now you don't wait at all.

TECHNICAL SPECS: Near-lightspeed projectile. Effectively instant hit. Extreme penetration.

FIELD NOTES: "The Mk2 doesn't ask if you want something dead. It just makes it so. Before you can blink. Before they can move."
- Weapons Procurement Officer`
    },
    death_ray: {
        name: 'DEATH RAY',
        class: 'CONTINUOUS INSTANT',
        manufacturer: 'END TIMES WEAPONS',
        category: 'Hitscan',
        lore: `MODEL: ETW-DEATH "NO ESCAPE"

ORIGIN: End Times Weapons built a gun that doesn't miss. Ever. Because it doesn't fire projectiles. It fires death itself.

TECHNICAL SPECS: Continuous instant damage beam. Burns through anything. Anything.

FIELD NOTES: "They named it the Death Ray because that's exactly what it is. A ray. Of death. Truth in advertising."
- Arena Commentator`
    },
    disintegrator: {
        name: 'DISINTEGRATOR',
        class: 'MATTER ERASURE',
        manufacturer: 'VOID TECH',
        category: 'Legendary',
        lore: `MODEL: VT-VOID "CEASE TO EXIST"

ORIGIN: Void Tech looked at matter and decided it didn't need to exist anymore. Their Disintegrator agrees.

TECHNICAL SPECS: Molecular dissolution beam. Targets don't die - they simply cease to be. No remains. No evidence.

FIELD NOTES: "I watched a Heavy get hit by the Disintegrator. One moment it was there. The next, there was a Heavy-shaped absence of everything. Not even ash."
- Traumatized Witness`
    },
    gauss_cannon: {
        name: 'GAUSS CANNON',
        class: 'ELECTROMAGNETIC',
        manufacturer: 'VELOCITY SYSTEMS',
        category: 'Hitscan',
        lore: `MODEL: VS-GAUSS "OVERKILL"

ORIGIN: Velocity Systems' answer to "what if we made the railgun even more powerful?" The answer is the Gauss Cannon.

TECHNICAL SPECS: Maximum damage instant hit. Massive energy consumption. One shot can end waves.

FIELD NOTES: "The Gauss Cannon isn't a weapon. It's a statement. That statement is 'everything in this direction should stop existing.'"
- Heavy Weapons Specialist`
    },

    // === MELEE WEAPONS ===
    jackhammer: {
        name: 'JACKHAMMER',
        class: 'MELEE/KNOCKBACK',
        manufacturer: 'CONSTRUCTION CORE',
        category: 'Melee',
        lore: `MODEL: CC-JACK "DEMOLITION MAN"

ORIGIN: Construction Core made tools for breaking things. Turns out those tools work just as well on enemies as they do on concrete.

TECHNICAL SPECS: Charged strike attack. Massive knockback. Stuns on impact. Extremely satisfying.

FIELD NOTES: "You charge it up, you swing it, and whatever was in front of you is now somewhere else. Usually in pieces."
- Melee Combat Champion`
    },
    chainsaw: {
        name: 'CHAINSAW',
        class: 'MELEE/CONTINUOUS',
        manufacturer: 'BRUTAL TOOLS',
        category: 'Melee',
        lore: `MODEL: BT-SAW "RIP AND TEAR"

ORIGIN: Brutal Tools made this for aggressive lumber harvesting. The Arena found a different kind of tree to cut down.

TECHNICAL SPECS: Continuous damage on contact. Causes screen shake from the sheer violence. Fuel-efficient.

FIELD NOTES: "The chainsaw doesn't care about armor. The chainsaw doesn't care about shields. The chainsaw only cares about one thing: cutting."
- Chainsaw Enthusiast (Also a Therapist's Patient)`
    }
};

const GEAR_INFO = {
    // === SPEED MODULES ===
    dash: {
        name: 'DASH MODULE V1',
        class: 'MOBILITY',
        manufacturer: 'VELOCITY CORE',
        category: 'Speed',
        lore: `MODEL: VC-DASH "QUICK STEP"

ORIGIN: Velocity Core's entry-level mobility enhancement. Reliable, efficient, and won't rip your legs off. Probably.

TECHNICAL SPECS: 4x speed boost. 2 second duration. 5 second cooldown. Training wheels for the serious stuff.

FIELD NOTES: "Everyone starts with the V1. It's how you learn. How you survive. How you start to understand what real speed feels like."
- Speed Runner's Academy`
    },
    dash_v2: {
        name: 'DASH MODULE V2',
        class: 'ADVANCED MOBILITY',
        manufacturer: 'VELOCITY CORE',
        category: 'Speed',
        lore: `MODEL: VC-DASH MK2 "BLUR"

ORIGIN: The V2 was developed after contestants complained the V1 was "too slow." Velocity Core responded by increasing the speed tenfold. Several test subjects did not survive the testing phase.

TECHNICAL SPECS: 10x speed boost with drift capability. Requires V1 neural adaptation. Includes emergency drift stabilizers.

FIELD NOTES: "The V2 doesn't just make you fast. It makes you a blur. A streak of light. Just remember - walls don't care how fast you're going."
- V2 Survivor Support Group`
    },
    control_module: {
        name: 'CONTROL MODULE',
        class: 'STABILIZATION',
        manufacturer: 'PRECISION DYNAMICS',
        category: 'Speed',
        lore: `MODEL: PD-CTRL "STEADY HAND"

ORIGIN: Developed after too many Jackhammer/Dash combo users became permanent wall decorations. The Control Module was born from tragedy and engineering necessity.

TECHNICAL SPECS: Enables drifting. Allows complex maneuvers. Prevents... most accidents.

FIELD NOTES: "Scouts with Jackhammers kept dying. Crashing into walls at mach 2 tends to do that. The Control Module gives you a fighting chance at actually stopping."
- Arena Medical Chief (Overworked)`
    },
    afterburner: {
        name: 'AFTERBURNER',
        class: 'PASSIVE OFFENSE',
        manufacturer: 'INFERNO MOBILITY',
        category: 'Speed',
        lore: `MODEL: IM-BURN "TRAIL BLAZER"

ORIGIN: Inferno Mobility asked: what if your exhaust was hot enough to burn things? The Afterburner is the answer.

TECHNICAL SPECS: Passive activation at 150%+ speed. Leaves burning trail. 5 damage per second to anything following you.

FIELD NOTES: "The best part about the Afterburner? You don't have to turn around to kill what's chasing you. Just run faster."
- Speed-Based Combat Doctrine`
    },
    sandevistan: {
        name: 'SANDEVISTAN',
        class: 'TIME MANIPULATION',
        manufacturer: 'CHRONO TECH',
        category: 'Legendary',
        lore: `MODEL: CT-SANDY "BULLET TIME"

ORIGIN: Chrono Tech cracked the code on localized time dilation. The Sandevistan slows the world around you while speeding you up. The side effects are... manageable. Usually.

TECHNICAL SPECS: 80% time slow for 20 seconds. 200% user speed boost for 10 seconds. 30 second cooldown. Reality reasserts itself eventually.

FIELD NOTES: "You know that feeling when everything around you stops, and you can see every bullet, every enemy, every opportunity? The Sandevistan gives you that feeling. For real."
- Chrono Tech Marketing (Banned in 12 Systems)`
    },
    particle_accelerator: {
        name: 'PARTICLE ACCELERATOR',
        class: 'EXPERIMENTAL',
        manufacturer: 'QUANTUM MOBILITY',
        category: 'Epic',
        lore: `MODEL: QM-ACCEL "PHOTON DRIVE"

ORIGIN: Quantum Mobility shot photons through a layer that gave them mass, then strapped it to a person. The results were... spectacular.

TECHNICAL SPECS: 10x speed. Full drift capability. Automatic Afterburner trail. Questionable safety record.

FIELD NOTES: "The Particle Accelerator turns you into a comet. Complete with the fire trail and the destruction when you hit something."
- Quantum Mobility Test Pilot (Retired)`
    },
    blitz: {
        name: '"BLITZ" DASH MODULE V3',
        class: 'CORRUPTED TECH',
        manufacturer: 'UNKNOWN/SCAVENGED',
        category: 'Legendary',
        lore: `MODEL: BLITZ "TOTAL ANNIHILATION"

ORIGIN: Constructed after the Corruption took over. Built from spare parts, scrap metal, stolen equipment, and salvaged Blitzer afterburners. Nobody knows who made the first one. Everyone wants one.

TECHNICAL SPECS: 15x speed. All drift and afterburner effects. Projectile ricochet at full speed - bullets bounce off YOU and back at enemies.

FIELD NOTES: "The BLITZ isn't a mobility module. It's a weapon. You become the bullet. And bullets you hit? They become YOUR bullets. Running into enemy fire isn't suicide anymore - it's a combat strategy."
- BLITZ User (Only Known Survivor of 30 Consecutive Waves)

WARNING: BLITZ MODULE REQUIRES V2 ADAPTATION. UNADAPTED USERS EXPERIENCE SPONTANEOUS COMBUSTION.`
    }
};

export default function WeaponLog({ onClose }) {
    const [selectedItem, setSelectedItem] = useState(null);
    const [activeTab, setActiveTab] = useState('weapons');

    const allWeapons = Object.entries(WEAPON_INFO);
    const allGear = Object.entries(GEAR_INFO);

    const categories = activeTab === 'weapons'
        ? [...new Set(allWeapons.map(([, w]) => w.category))]
        : [...new Set(allGear.map(([, g]) => g.category))];

    const currentData = activeTab === 'weapons' ? WEAPON_INFO : GEAR_INFO;
    const currentEntries = activeTab === 'weapons' ? allWeapons : allGear;

    const getClassColor = (itemClass) => {
        if (itemClass?.includes('LEGENDARY') || itemClass?.includes('EXTINCTION')) return 'text-yellow-400 border-yellow-400';
        if (itemClass?.includes('EXPLOSIVE') || itemClass?.includes('CORRUPTED')) return 'text-red-400 border-red-400';
        if (itemClass?.includes('ENERGY') || itemClass?.includes('TIME')) return 'text-purple-400 border-purple-400';
        if (itemClass?.includes('HITSCAN') || itemClass?.includes('INSTANT')) return 'text-cyan-400 border-cyan-400';
        if (itemClass?.includes('MELEE')) return 'text-orange-400 border-orange-400';
        if (itemClass?.includes('SPEED') || itemClass?.includes('MOBILITY')) return 'text-green-400 border-green-400';
        return 'text-gray-400 border-gray-400';
    };

    return (
        <div className="fixed inset-0 bg-black/95 z-50 overflow-auto">
            {/* Header */}
            <div className="sticky top-0 bg-black/90 backdrop-blur border-b border-green-500/30 p-4 flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-green-400 tracking-widest">
                        ARSENAL DATABASE
                    </h1>
                    <p className="text-green-600 text-sm tracking-wider">CLASSIFIED WEAPONS & EQUIPMENT DOCUMENTATION</p>
                </div>
                <button
                    onClick={onClose}
                    className="text-red-500 hover:text-red-400 text-2xl font-bold px-4 py-2 border border-red-500/50 hover:border-red-400 transition-colors"
                >
                    [X] CLOSE
                </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-green-500/30">
                <button
                    onClick={() => { setActiveTab('weapons'); setSelectedItem(null); }}
                    className={`px-8 py-3 font-bold tracking-wider transition-colors ${
                        activeTab === 'weapons'
                            ? 'bg-green-500/20 text-green-400 border-b-2 border-green-500'
                            : 'text-gray-500 hover:text-green-400'
                    }`}
                >
                    WEAPONS
                </button>
                <button
                    onClick={() => { setActiveTab('gear'); setSelectedItem(null); }}
                    className={`px-8 py-3 font-bold tracking-wider transition-colors ${
                        activeTab === 'gear'
                            ? 'bg-green-500/20 text-green-400 border-b-2 border-green-500'
                            : 'text-gray-500 hover:text-green-400'
                    }`}
                >
                    SPEED MODULES
                </button>
            </div>

            <div className="flex">
                {/* Weapon List */}
                <div className="w-1/3 border-r border-green-500/30 p-4 max-h-[calc(100vh-140px)] overflow-y-auto">
                    {categories.map(category => (
                        <div key={category} className="mb-6">
                            <h2 className="text-green-600 text-sm font-bold tracking-widest mb-2 border-b border-green-500/20 pb-1">
                                // {category.toUpperCase()}
                            </h2>
                            {currentEntries
                                .filter(([, item]) => item.category === category)
                                .map(([key, item]) => (
                                    <button
                                        key={key}
                                        onClick={() => setSelectedItem(key)}
                                        className={`w-full text-left p-3 mb-1 border transition-all duration-200 ${
                                            selectedItem === key
                                                ? 'bg-green-500/20 border-green-500 text-green-400'
                                                : 'border-gray-700 hover:border-green-500/50 text-gray-400 hover:text-green-400'
                                        }`}
                                    >
                                        <div className="flex justify-between items-center">
                                            <span className="font-bold">{item.name}</span>
                                            <span className={`text-xs px-2 py-0.5 border ${getClassColor(item.class)}`}>
                                                {item.class?.split('/')[0]}
                                            </span>
                                        </div>
                                        <div className="text-xs text-gray-600 mt-1">
                                            {item.manufacturer}
                                        </div>
                                    </button>
                                ))}
                        </div>
                    ))}
                </div>

                {/* Detail Panel */}
                <div className="w-2/3 p-6 max-h-[calc(100vh-140px)] overflow-y-auto">
                    {selectedItem ? (
                        <div className="space-y-6">
                            {/* Header */}
                            <div className="border-b border-green-500/30 pb-4">
                                <div className="flex items-center gap-4 mb-2">
                                    <h2 className="text-3xl font-black text-green-400">
                                        {currentData[selectedItem].name}
                                    </h2>
                                    <span className={`px-3 py-1 border text-sm font-bold ${getClassColor(currentData[selectedItem].class)}`}>
                                        {currentData[selectedItem].class}
                                    </span>
                                </div>
                                <p className="text-green-600">
                                    MANUFACTURER: {currentData[selectedItem].manufacturer}
                                </p>
                            </div>

                            {/* Lore */}
                            <div className="bg-black/50 border border-green-500/30 p-6">
                                <div className="text-green-400 text-sm font-mono whitespace-pre-wrap leading-relaxed">
                                    {currentData[selectedItem].lore}
                                </div>
                            </div>

                            {/* CRT Effect Overlay */}
                            <div className="pointer-events-none fixed inset-0 bg-gradient-to-b from-transparent via-green-500/[0.02] to-transparent bg-[length:100%_4px] animate-pulse" />
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-600">
                            <div className="text-center">
                                <div className="text-6xl mb-4">{'>'}_</div>
                                <p className="text-lg tracking-wider">SELECT {activeTab === 'weapons' ? 'WEAPON' : 'MODULE'} TO VIEW DOCUMENTATION</p>
                                <p className="text-sm mt-2">CLEARANCE LEVEL: MAXIMUM</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Scanline Effect */}
            <div className="pointer-events-none fixed inset-0 bg-[repeating-linear-gradient(0deg,transparent,transparent_2px,rgba(0,255,0,0.03)_2px,rgba(0,255,0,0.03)_4px)]" />
        </div>
    );
}
