import React from 'react';
import { Heart, Shield, Skull, Zap } from 'lucide-react';

// Enemy type display names and icons
const ENEMY_DISPLAY = {
    basic: { name: 'Basic', icon: '👤' },
    runner: { name: 'Runner', icon: '💨' },
    grunt: { name: 'Grunt', icon: '🛡️' },
    crawler: { name: 'Crawler', icon: '🕷️' },
    brute: { name: 'Brute', icon: '👊' },
    heavy: { name: 'Heavy', icon: '🦾' },
    charger: { name: 'Charger', icon: '🐂' },
    juggernaut: { name: 'Juggernaut', icon: '🏋️' },
    goliath: { name: 'Goliath', icon: '💚' },
    ironclad: { name: 'Ironclad', icon: '🔩' },
    titan_enemy: { name: 'Titan', icon: '🗿' },
    demolisher: { name: 'Demolisher', icon: '💣' },
    speeder: { name: 'Speeder', icon: '⚡' },
    blitzer: { name: 'Blitzer', icon: '🔥' },
    phantom: { name: 'Phantom', icon: '👻' },
    striker: { name: 'Striker', icon: '🎯' },
    dasher: { name: 'Dasher', icon: '💫' },
    wraith: { name: 'Wraith', icon: '🌑' },
    berserker_enemy: { name: 'Berserker', icon: '😤' },
    bloater: { name: 'Bloater', icon: '🎈' },
    nuke: { name: 'Nuke', icon: '☢️' },
    cluster: { name: 'Cluster', icon: '🧨' },
    volatile: { name: 'Volatile', icon: '⚠️' },
    inferno: { name: 'Inferno', icon: '🔥' },
    detonator: { name: 'Detonator', icon: '💥' },
    megaton: { name: 'Megaton', icon: '🌋' },
    apocalypse: { name: 'Apocalypse', icon: '☠️' },
    spitter: { name: 'Spitter', icon: '💦' },
    acid_spitter: { name: 'Acid Spitter', icon: '🧪' },
    plasma_spitter: { name: 'Plasma Spitter', icon: '🔮' },
    shambler: { name: 'Shambler', icon: '☁️' },
    sniper: { name: 'Sniper', icon: '🎯' },
    gunner: { name: 'Gunner', icon: '🔫' },
    mortar: { name: 'Mortar', icon: '💣' },
    siege: { name: 'Siege', icon: '🏰' },
    boss_warlord: { name: 'Warlord', icon: '👑' },
    boss_titan: { name: 'Titan Boss', icon: '🗿' },
    boss_overlord: { name: 'Overlord', icon: '👁️' },
    boss_destroyer: { name: 'Destroyer', icon: '💀' },
    boss_spitter: { name: 'Acid King', icon: '🤮' },
    boss_nuclear: { name: 'Nuclear Titan', icon: '☢️' },
    boss_shambler: { name: 'Plague Lord', icon: '☠️' },
    boss_swarm: { name: 'Swarm Queen', icon: '🐝' },
    boss_phantom: { name: 'Void Walker', icon: '🌀' },
    boss_inferno: { name: 'Inferno Lord', icon: '🔥' },
    boss_sniper: { name: 'Deadeye', icon: '🎯' },
    boss_juggernaut: { name: 'Juggernaut', icon: '🦏' },
    boss_berserker: { name: 'Blood Rage', icon: '🩸' },
    boss_summoner: { name: 'Dark Summoner', icon: '🧙' },
    boss_lightning: { name: 'Storm Bringer', icon: '⛈️' },
    boss_frost: { name: 'Frost Monarch', icon: '❄️' },
    boss_executioner: { name: 'Executioner', icon: '⚔️' },
    boss_hivemind: { name: 'Hivemind', icon: '🧠' },
};

// Ability definitions for display
const ABILITY_KEYS = {
    hasDash: { name: 'Dash', key: 'X', icon: '💨' },
    hasDashV2: { name: 'Dash V2', key: 'X', icon: '⚡' },
    hasBlitz: { name: 'BLITZ', key: 'X', icon: '💀' },
    hasParticleAccelerator: { name: 'Particle Accel', key: 'X', icon: '⚛️' },
    hasSandevistan: { name: 'Sandevistan', key: 'Z', icon: '⏱️' },
    hasAfterburner: { name: 'Afterburner', key: 'AUTO', icon: '🔥' },
    hasControlModule: { name: 'Control', key: 'AUTO', icon: '🎮' },
    hasAfterimage: { name: 'Afterimage', key: 'V', icon: '👻' },
    hasTeleport: { name: 'Teleport', key: 'T', icon: '🌀' },
    hasDaze: { name: 'Daze', key: 'C', icon: '💫' },
    hasMedicine: { name: 'Medicine', key: 'M', icon: '💊' },
    hasTimeSlow: { name: 'Time Slow', key: 'F', icon: '⏰' },
    hasOrbital: { name: 'Orbital', key: 'G', icon: '🛰️' },
    hasGravityWell: { name: 'Gravity Well', key: 'R', icon: '🕳️' },
    hasShockwave: { name: 'Shockwave', key: 'E', icon: '💥' },
    hasOvercharge: { name: 'Overcharge', key: 'Q', icon: '🔋' },
    hasNitro: { name: 'Nitro', key: 'N', icon: '🚀' },
    hasSword: { name: 'Sword', key: 'CLICK', icon: '⚔️' },
    hasJackhammer: { name: 'Jackhammer', key: 'J', icon: '🔨' },
    hasDecoy: { name: 'Decoy', key: 'B', icon: '🤖' },
    droneCount: { name: 'Drones', key: 'AUTO', icon: '🛸', isCount: true },
};

export default function GameUI({
    health, maxHealth, wave, score, kills, combo, shield, weapon,
    abilityReady, abilityName, abilityCooldown, playerAbilities, enemyCounts
}) {
    const healthPercent = (health / maxHealth) * 100;

    // Get active abilities from player state
    const activeAbilities = [];
    if (playerAbilities) {
        Object.entries(ABILITY_KEYS).forEach(([key, info]) => {
            if (info.isCount && playerAbilities[key] > 0) {
                activeAbilities.push({ ...info, count: playerAbilities[key] });
            } else if (playerAbilities[key]) {
                activeAbilities.push(info);
            }
        });
    }

    return (
        <div className="absolute inset-0 pointer-events-none">
            {/* Top bar */}
            <div className="absolute top-4 left-4 right-4 flex justify-between items-start">
                {/* Health */}
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-3">
                        <Heart className="w-6 h-6 text-red-500 drop-shadow-[0_0_10px_rgba(255,0,0,0.5)]" />
                        <div className="w-48 h-4 bg-black/60 border border-red-500/30 relative overflow-hidden">
                            <div
                                className="h-full bg-gradient-to-r from-red-700 to-red-500 transition-all duration-200"
                                style={{ width: `${healthPercent}%` }}
                            />
                            <div className="absolute inset-0 flex items-center justify-center">
                                <span className="text-xs font-bold text-white drop-shadow-md">
                                    {health} / {maxHealth}
                                </span>
                            </div>
                        </div>
                    </div>

                    {shield > 0 && (
                        <div className="flex items-center gap-3">
                            <Shield className="w-5 h-5 text-blue-400 drop-shadow-[0_0_10px_rgba(0,128,255,0.5)]" />
                            <div className="w-32 h-3 bg-black/60 border border-blue-500/30 relative overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-blue-700 to-blue-400"
                                    style={{ width: '100%' }}
                                />
                                <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-white">
                                    {Math.round(shield)}
                                </span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Wave & Score */}
                <div className="text-right">
                    <div className="flex items-center justify-end gap-2 mb-1">
                        <span className="text-gray-400 text-sm uppercase tracking-widest">Wave</span>
                        <span className="text-4xl font-black text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                            {wave}
                        </span>
                    </div>
                    <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">
                        {score.toLocaleString()}
                    </div>
                </div>
            </div>

            {/* Enemy Log Panel */}
            {enemyCounts && Object.keys(enemyCounts).length > 0 && (
                <div className="absolute top-28 left-4 bg-black/70 border border-red-500/50 p-3 min-w-[160px] max-w-[200px]">
                    {/* Header */}
                    <div className="flex items-center gap-2 mb-2 pb-2 border-b border-red-500/30">
                        <Skull className="w-4 h-4 text-red-500" />
                        <span className="text-xs font-bold text-red-500 uppercase tracking-wider">Enemies</span>
                    </div>

                    {/* Enemy List */}
                    <div className="space-y-1 max-h-[200px] overflow-y-auto">
                        {Object.entries(enemyCounts)
                            .sort((a, b) => b[1] - a[1]) // Sort by count descending
                            .map(([type, count]) => {
                                const display = ENEMY_DISPLAY[type] || { name: type, icon: '👤' };
                                return (
                                    <div key={type} className="flex items-center justify-between text-xs">
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-sm">{display.icon}</span>
                                            <span className="text-gray-300">{display.name}</span>
                                        </div>
                                        <span className="text-red-400 font-bold">×{count}</span>
                                    </div>
                                );
                            })}
                    </div>

                    {/* Total */}
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-red-500/30">
                        <span className="text-xs text-gray-500 uppercase">Total</span>
                        <span className="text-sm font-bold text-white">
                            {Object.values(enemyCounts).reduce((sum, c) => sum + c, 0)}
                        </span>
                    </div>
                </div>
            )}

            {/* Bottom stats */}
            <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                {/* Left side - Kills & Weapon */}
                <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                        <Skull className="w-5 h-5 text-gray-400" />
                        <span className="text-xl font-bold text-gray-300">{kills}</span>
                        <span className="text-xs text-gray-500 uppercase">kills</span>
                    </div>
                    {weapon && (
                        <div className="flex items-center gap-2 bg-black/40 px-3 py-1 border border-cyan-500/30">
                            <span className="text-xs text-gray-500">WEAPON</span>
                            <span className="text-sm font-bold text-cyan-400">{weapon}</span>
                        </div>
                    )}
                </div>

                {/* Combo */}
                {combo > 1 && (
                    <div className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center animate-pulse">
                        <div className="flex items-center gap-2">
                            <Zap className="w-6 h-6 text-yellow-400" />
                            <span className="text-3xl font-black text-yellow-400 drop-shadow-[0_0_15px_rgba(255,200,0,0.5)]">
                                {combo}x
                            </span>
                        </div>
                        <span className="text-xs text-yellow-500/70 uppercase tracking-widest">combo</span>
                    </div>
                )}

                {/* Right side - Class Ability & Player Abilities */}
                <div className="flex flex-col items-end gap-2">
                    {/* Player Abilities */}
                    {activeAbilities.length > 0 && (
                        <div className="flex flex-wrap justify-end gap-1 max-w-xs">
                            {activeAbilities.map((ability, idx) => (
                                <div
                                    key={idx}
                                    className="flex items-center gap-1 bg-black/60 border border-gray-600 px-2 py-1"
                                    title={`${ability.name} [${ability.key}]`}
                                >
                                    <span className="text-sm">{ability.icon}</span>
                                    <span className="text-[10px] text-gray-400 font-bold">{ability.key}</span>
                                    {ability.count && (
                                        <span className="text-[10px] text-cyan-400">x{ability.count}</span>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Class Ability */}
                    {abilityName && (
                        <div className={`px-4 py-2 border-2 transition-all ${
                            abilityReady
                                ? 'bg-green-500/20 border-green-500 animate-pulse'
                                : 'bg-gray-900/50 border-gray-700'
                        }`}>
                            <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">Ability (Space)</div>
                            <div className={`text-sm font-bold ${abilityReady ? 'text-green-400' : 'text-gray-500'}`}>
                                {abilityName}
                            </div>
                            {!abilityReady && abilityCooldown > 0 && (
                                <div className="text-xs text-gray-600 text-center mt-1">{abilityCooldown}s</div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Wave announcement */}
            {wave > 1 && (
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 pointer-events-none animate-fade-in">
                    {/* This fades out via CSS animation */}
                </div>
            )}
        </div>
    );
}
