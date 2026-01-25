import React from 'react';

const ENEMY_INFO = {
    // === BASIC VARIANTS ===
    basic: { name: 'BASIC', threat: 'LOW', desc: 'STANDARD COMBAT UNIT', category: 'Basic' },
    runner: { name: 'RUNNER', threat: 'LOW', desc: 'HIGH MOBILITY / LOW ARMOR', category: 'Basic' },
    grunt: { name: 'GRUNT', threat: 'LOW', desc: 'ARMORED FOOTSOLDIER / SLOW BUT TOUGH', category: 'Basic' },
    crawler: { name: 'CRAWLER', threat: 'LOW', desc: 'LOW PROFILE TARGET / HARD TO HIT', category: 'Basic' },

    // === TANK VARIANTS ===
    brute: { name: 'BRUTE', threat: 'MEDIUM', desc: 'HEAVY ARMOR / MELEE SPECIALIST', category: 'Tank' },
    heavy: { name: 'HEAVY', threat: 'HIGH', desc: 'MAXIMUM ARMOR / HIGH DAMAGE OUTPUT', category: 'Tank' },
    charger: { name: 'CHARGER', threat: 'HIGH', desc: 'BULL RUSH PROTOCOL / DEVASTATING CHARGE', category: 'Tank' },
    juggernaut: { name: 'JUGGERNAUT', threat: 'HIGH', desc: 'UNSTOPPABLE MASS / EXTREME DURABILITY', category: 'Tank' },
    goliath: { name: 'GOLIATH', threat: 'HIGH', desc: 'REGENERATIVE PLATING / SELF-REPAIR ACTIVE', category: 'Tank' },
    ironclad: { name: 'IRONCLAD', threat: 'MEDIUM', desc: 'EXPLOSION RESISTANT / HARDENED SHELL', category: 'Tank' },
    titan_enemy: { name: 'TITAN', threat: 'HIGH', desc: 'ARMORED COLOSSUS / 30% DAMAGE REDUCTION', category: 'Tank' },
    demolisher: { name: 'DEMOLISHER', threat: 'HIGH', desc: 'EXPLOSIVE MELEE / BLAST ON CONTACT', category: 'Tank' },

    // === SPEED VARIANTS ===
    speeder: { name: 'SPEEDER', threat: 'MEDIUM', desc: 'EXTREME VELOCITY UNIT', category: 'Speed' },
    blitzer: { name: 'BLITZER', threat: 'MEDIUM', desc: 'AFTERBURNER TRAIL / MAXIMUM SPEED', category: 'Speed' },
    phantom: { name: 'PHANTOM', threat: 'MEDIUM', desc: 'PHASE SHIFTER / IGNORES COLLISIONS', category: 'Speed' },
    striker: { name: 'STRIKER', threat: 'HIGH', desc: 'DAMAGE ACCELERATOR / SPEEDS WHEN HIT', category: 'Speed' },
    dasher: { name: 'DASHER', threat: 'MEDIUM', desc: 'DASH ATTACK PATTERN DETECTED', category: 'Speed' },
    wraith: { name: 'WRAITH', threat: 'HIGH', desc: 'INVISIBLE PHASER / STEALTH ASSAULT UNIT', category: 'Speed' },
    berserker_enemy: { name: 'BERSERKER', threat: 'HIGH', desc: 'RAGE MODE ACTIVE / ENRAGES WHEN DAMAGED', category: 'Speed' },

    // === EXPLOSION VARIANTS ===
    bloater: { name: 'BLOATER', threat: 'HIGH', desc: 'SELF-DESTRUCT PROTOCOL ACTIVE', category: 'Explosive' },
    nuke: { name: 'NUKE', threat: 'CRITICAL', desc: 'CATASTROPHIC EXPLOSIVE THREAT', category: 'Explosive' },
    cluster: { name: 'CLUSTER', threat: 'HIGH', desc: 'MULTI-WARHEAD SYSTEM / SPAWNS MINI-BOMBS', category: 'Explosive' },
    volatile: { name: 'VOLATILE', threat: 'HIGH', desc: 'UNSTABLE CORE / EXPLODES ON CONTACT', category: 'Explosive' },
    inferno: { name: 'INFERNO', threat: 'HIGH', desc: 'FIRE TRAIL / SCORCHED EARTH PROTOCOL', category: 'Explosive' },
    detonator: { name: 'DETONATOR', threat: 'MEDIUM', desc: 'RAPID FUSE / QUICK DETONATION', category: 'Explosive' },
    megaton: { name: 'MEGATON', threat: 'CRITICAL', desc: 'MASSIVE PAYLOAD / CITY-LEVELING BLAST', category: 'Explosive' },
    apocalypse: { name: 'APOCALYPSE', threat: 'CRITICAL', desc: 'EXTINCTION-LEVEL EVENT / WORLD ENDER', category: 'Explosive' },

    // === RANGED VARIANTS ===
    spitter: { name: 'SPITTER', threat: 'MEDIUM', desc: 'RANGED PROJECTILE THREAT', category: 'Ranged' },
    acid_spitter: { name: 'ACID SPITTER', threat: 'MEDIUM', desc: 'CORROSIVE ROUNDS / DOT DAMAGE', category: 'Ranged' },
    plasma_spitter: { name: 'PLASMA SPITTER', threat: 'HIGH', desc: 'HIGH ENERGY PLASMA / PIERCING SHOTS', category: 'Ranged' },
    shambler: { name: 'SHAMBLER', threat: 'MEDIUM', desc: 'TOXIC CLOUD DEPLOYMENT SYSTEM', category: 'Ranged' },
    sniper: { name: 'SNIPER', threat: 'HIGH', desc: 'PRECISION TARGETING / HIGH DAMAGE SHOTS', category: 'Ranged' },
    gunner: { name: 'GUNNER', threat: 'MEDIUM', desc: 'RAPID FIRE SUPPRESSION / BULLET STORM', category: 'Ranged' },
    mortar: { name: 'MORTAR', threat: 'HIGH', desc: 'ARTILLERY SYSTEM / AREA DENIAL', category: 'Ranged' },
    siege: { name: 'SIEGE', threat: 'HIGH', desc: 'HEAVY ARTILLERY / DOUBLE MORTAR BARRAGE', category: 'Ranged' },

    // === BOSS VARIANTS ===
    boss_warlord: { name: 'WARLORD', threat: 'CRITICAL', desc: 'ELITE COMMANDER / FAST & AGGRESSIVE', category: 'Boss' },
    boss_titan: { name: 'TITAN BOSS', threat: 'CRITICAL', desc: 'ARMORED BEHEMOTH / 25% DAMAGE REDUCTION', category: 'Boss' },
    boss_overlord: { name: 'OVERLORD', threat: 'CRITICAL', desc: 'RANGED SUPREMACY / RAPID FIRE BARRAGE', category: 'Boss' },
    boss_destroyer: { name: 'DESTROYER', threat: 'CRITICAL', desc: 'EXPLOSIVE CHARGER / DEVASTATING ASSAULT', category: 'Boss' }
};

export default function EnemyLog({ onClose, sandboxMode, onSpawnEnemy }) {
    return (
        <div 
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/90"
            onClick={onClose}
        >
            <div 
                className="relative w-full max-w-3xl bg-black border-4 border-red-500 p-8 font-mono shadow-[0_0_50px_rgba(255,0,0,0.5)]"
                onClick={(e) => e.stopPropagation()}
                style={{
                    boxShadow: '0 0 50px rgba(255,0,0,0.5), inset 0 0 50px rgba(255,0,0,0.1)',
                    animation: 'scanline 8s linear infinite'
                }}
            >
                {/* Scan lines effect */}
                <div 
                    className="absolute inset-0 pointer-events-none opacity-10"
                    style={{
                        background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, #ff0000 2px, #ff0000 4px)'
                    }}
                />
                
                {/* CRT glow */}
                <div className="absolute inset-0 pointer-events-none bg-gradient-radial from-red-500/5 to-transparent" />

                {/* Header */}
                <div className="mb-6 pb-4 border-b-2 border-red-500">
                    <h2 className="text-3xl font-black text-red-500 tracking-wider mb-1 animate-pulse">
                        === ENEMY DATABASE ===
                    </h2>
                    <p className="text-green-500 text-sm">
                        {sandboxMode ? 'SANDBOX MODE - CLICK TO SPAWN' : 'SYSTEM ACCESS GRANTED'}
                    </p>
                </div>

                {/* Enemy list grouped by category */}
                <div className="space-y-4 max-h-[500px] overflow-y-auto mb-6 pr-2">
                    {['Basic', 'Tank', 'Speed', 'Explosive', 'Ranged', 'Boss'].map(category => {
                        const categoryEnemies = Object.entries(ENEMY_INFO).filter(([, info]) => info.category === category);
                        const categoryColors = {
                            Basic: 'border-gray-500 text-gray-400',
                            Tank: 'border-blue-500 text-blue-400',
                            Speed: 'border-yellow-500 text-yellow-400',
                            Explosive: 'border-orange-500 text-orange-400',
                            Ranged: 'border-green-500 text-green-400',
                            Boss: 'border-purple-500 text-purple-400'
                        };
                        return (
                            <div key={category}>
                                <div className={`text-xs font-bold uppercase tracking-widest mb-2 pb-1 border-b ${categoryColors[category]}`}>
                                    [{category}] - {categoryEnemies.length} VARIANTS
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    {categoryEnemies.map(([type, info]) => (
                                        <div
                                            key={type}
                                            onClick={() => sandboxMode && onSpawnEnemy && onSpawnEnemy(type)}
                                            className={`bg-red-950/20 border-l-4 border-red-500 p-2 hover:bg-red-950/40 transition-colors ${
                                                sandboxMode ? 'cursor-pointer hover:border-green-500' : ''
                                            }`}
                                        >
                                            <div className="flex justify-between items-start mb-1">
                                                <span className="text-red-400 font-bold text-sm">
                                                    {info.name}
                                                </span>
                                                <span className={`text-[10px] px-1 py-0.5 border ${
                                                    info.threat === 'CRITICAL' ? 'text-red-500 border-red-500 bg-red-500/10' :
                                                    info.threat === 'HIGH' ? 'text-orange-500 border-orange-500 bg-orange-500/10' :
                                                    info.threat === 'MEDIUM' ? 'text-yellow-500 border-yellow-500 bg-yellow-500/10' :
                                                    'text-green-500 border-green-500 bg-green-500/10'
                                                }`}>
                                                    {info.threat}
                                                </span>
                                            </div>
                                            <p className="text-green-400 text-xs leading-tight">
                                                {info.desc}
                                            </p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Footer */}
                <div className="border-t-2 border-red-500 pt-4 flex justify-between items-center">
                    <div className="text-green-500 text-sm">
                        <span className="animate-pulse">█</span> READY
                    </div>
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-red-500/20 border-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-black font-bold transition-all"
                    >
                        [ESC] CLOSE
                    </button>
                </div>
            </div>

        </div>
    );
}