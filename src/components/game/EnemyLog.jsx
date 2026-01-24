import React from 'react';

const ENEMY_INFO = {
    // Basic
    basic: { name: 'BASIC', threat: 'LOW', desc: 'STANDARD COMBAT UNIT' },
    runner: { name: 'RUNNER', threat: 'LOW', desc: 'HIGH MOBILITY / LOW ARMOR' },

    // Tanky
    brute: { name: 'BRUTE', threat: 'MEDIUM', desc: 'HEAVY ARMOR / MELEE SPECIALIST' },
    heavy: { name: 'HEAVY', threat: 'HIGH', desc: 'MAXIMUM ARMOR / HIGH DAMAGE OUTPUT' },
    juggernaut: { name: 'JUGGERNAUT', threat: 'HIGH', desc: 'UNSTOPPABLE MASS / EXTREME DURABILITY' },
    goliath: { name: 'GOLIATH', threat: 'HIGH', desc: 'REGENERATIVE PLATING / SELF-REPAIR ACTIVE' },
    ironclad: { name: 'IRONCLAD', threat: 'MEDIUM', desc: 'EXPLOSION RESISTANT / HARDENED SHELL' },

    // Speed
    speeder: { name: 'SPEEDER', threat: 'MEDIUM', desc: 'EXTREME VELOCITY UNIT' },
    blitzer: { name: 'BLITZER', threat: 'MEDIUM', desc: 'AFTERBURNER TRAIL / MAXIMUM SPEED' },
    phantom: { name: 'PHANTOM', threat: 'MEDIUM', desc: 'PHASE SHIFTER / IGNORES COLLISIONS' },
    striker: { name: 'STRIKER', threat: 'HIGH', desc: 'DAMAGE ACCELERATOR / SPEEDS WHEN HIT' },
    dasher: { name: 'DASHER', threat: 'MEDIUM', desc: 'DASH ATTACK PATTERN DETECTED' },

    // Explosion
    bloater: { name: 'BLOATER', threat: 'HIGH', desc: 'SELF-DESTRUCT PROTOCOL ACTIVE' },
    nuke: { name: 'NUKE', threat: 'CRITICAL', desc: 'CATASTROPHIC EXPLOSIVE THREAT' },
    cluster: { name: 'CLUSTER', threat: 'HIGH', desc: 'MULTI-WARHEAD SYSTEM / SPAWNS MINI-BOMBS' },
    volatile: { name: 'VOLATILE', threat: 'HIGH', desc: 'UNSTABLE CORE / EXPLODES ON CONTACT' },
    inferno: { name: 'INFERNO', threat: 'HIGH', desc: 'FIRE TRAIL / SCORCHED EARTH PROTOCOL' },
    detonator: { name: 'DETONATOR', threat: 'MEDIUM', desc: 'RAPID FUSE / QUICK DETONATION' },
    megaton: { name: 'MEGATON', threat: 'CRITICAL', desc: 'MASSIVE PAYLOAD / CITY-LEVELING BLAST' },

    // Ranged
    spitter: { name: 'SPITTER', threat: 'MEDIUM', desc: 'RANGED PROJECTILE THREAT' },
    shambler: { name: 'SHAMBLER', threat: 'MEDIUM', desc: 'TOXIC CLOUD DEPLOYMENT SYSTEM' },
    sniper: { name: 'SNIPER', threat: 'HIGH', desc: 'PRECISION TARGETING / HIGH DAMAGE SHOTS' },
    gunner: { name: 'GUNNER', threat: 'MEDIUM', desc: 'RAPID FIRE SUPPRESSION / BULLET STORM' },
    mortar: { name: 'MORTAR', threat: 'HIGH', desc: 'ARTILLERY SYSTEM / AREA DENIAL' },

    // Boss
    boss: { name: 'BOSS', threat: 'CRITICAL', desc: 'ELITE COMBAT UNIT' }
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

                {/* Enemy list */}
                <div className="space-y-3 max-h-96 overflow-y-auto mb-6">
                    {Object.entries(ENEMY_INFO).map(([type, info]) => (
                        <div 
                            key={type}
                            onClick={() => sandboxMode && onSpawnEnemy && onSpawnEnemy(type)}
                            className={`bg-red-950/20 border-l-4 border-red-500 p-3 hover:bg-red-950/40 transition-colors ${
                                sandboxMode ? 'cursor-pointer hover:border-green-500' : ''
                            }`}
                        >
                            <div className="flex justify-between items-start mb-1">
                                <span className="text-red-400 font-bold text-lg">
                                    &gt; {info.name}
                                </span>
                                <span className={`text-xs px-2 py-1 border ${
                                    info.threat === 'CRITICAL' ? 'text-red-500 border-red-500 bg-red-500/10' :
                                    info.threat === 'HIGH' ? 'text-orange-500 border-orange-500 bg-orange-500/10' :
                                    info.threat === 'MEDIUM' ? 'text-yellow-500 border-yellow-500 bg-yellow-500/10' :
                                    'text-green-500 border-green-500 bg-green-500/10'
                                }`}>
                                    THREAT: {info.threat}
                                </span>
                            </div>
                            <p className="text-green-400 text-sm">
                                {info.desc}
                            </p>
                        </div>
                    ))}
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

            <style jsx>{`
                @keyframes scanline {
                    0% { background-position: 0 0; }
                    100% { background-position: 0 100%; }
                }
            `}</style>
        </div>
    );
}