import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const CLASSES = [
    // TANK CLASSES
    {
        id: 'bruiser',
        name: 'BRUISER',
        icon: '🛡️',
        color: 'from-blue-600 to-cyan-500',
        desc: 'The unstoppable wall',
        stats: { health: 150, damage: 8, speed: 4, fireRate: 200, weapon: 'shotgun' },
        passives: [
            { text: '+50% Max Health', positive: true },
            { text: '-50% Damage taken from explosions', positive: true },
            { text: '-20% Movement Speed', positive: false },
        ],
        ability: {
            name: 'IRON SHIELD',
            desc: 'Become invulnerable for 3s and reflect damage',
            cooldown: 15,
            type: 'active'
        }
    },
    {
        id: 'juggernaut',
        name: 'JUGGERNAUT',
        icon: '🦾',
        color: 'from-gray-600 to-slate-500',
        desc: 'Immovable force',
        stats: { health: 200, damage: 6, speed: 3, fireRate: 250, weapon: 'minigun' },
        passives: [
            { text: '+100% Max Health', positive: true },
            { text: 'Cannot be knocked back', positive: true },
            { text: '-40% Movement Speed', positive: false },
            { text: '-25% Fire Rate', positive: false },
        ],
        ability: {
            name: 'UNSTOPPABLE',
            desc: 'Immune to slows and damage for 4s',
            cooldown: 20,
            type: 'active'
        }
    },
    {
        id: 'fortress',
        name: 'FORTRESS',
        icon: '🏰',
        color: 'from-amber-600 to-yellow-500',
        desc: 'Shield specialist',
        stats: { health: 120, damage: 7, speed: 4, fireRate: 180, weapon: 'pistol' },
        passives: [
            { text: '+50 Starting Shield', positive: true },
            { text: 'Shield regenerates over time', positive: true },
            { text: '-15% Damage dealt', positive: false },
        ],
        ability: {
            name: 'BARRIER',
            desc: 'Create a damage-absorbing shield zone',
            cooldown: 12,
            type: 'active'
        }
    },

    // SPEED CLASSES
    {
        id: 'speedster',
        name: 'SPEEDSTER',
        icon: '⚡',
        color: 'from-yellow-500 to-orange-400',
        desc: 'Fastest character in the arena',
        stats: { health: 60, damage: 10, speed: 9, fireRate: 140, weapon: 'pistol' },
        passives: [
            { text: '+80% Movement Speed', positive: true },
            { text: '+25% Evasion chance', positive: true },
            { text: '-40% Max Health', positive: false },
        ],
        ability: {
            name: 'AFTERBURNER',
            desc: '+100% speed for 5s, leave damaging trail',
            cooldown: 8,
            type: 'active'
        }
    },
    {
        id: 'ghost',
        name: 'GHOST',
        icon: '👻',
        color: 'from-purple-400 to-indigo-400',
        desc: 'Phase through everything',
        stats: { health: 50, damage: 12, speed: 7, fireRate: 160, weapon: 'pistol' },
        passives: [
            { text: '+40% Movement Speed', positive: true },
            { text: 'Phase through enemies while moving', positive: true },
            { text: '-50% Max Health', positive: false },
        ],
        ability: {
            name: 'PHASE SHIFT',
            desc: 'Become intangible for 3s',
            cooldown: 10,
            type: 'active'
        }
    },
    {
        id: 'runner',
        name: 'RUNNER',
        icon: '🏃',
        color: 'from-green-500 to-emerald-400',
        desc: 'Never stop moving',
        stats: { health: 70, damage: 9, speed: 8, fireRate: 150, weapon: 'pistol' },
        passives: [
            { text: '+60% Movement Speed', positive: true },
            { text: '+30% Damage while moving', positive: true },
            { text: '-50% Damage while standing still', positive: false },
        ],
        ability: {
            name: 'MOMENTUM',
            desc: 'Speed increases damage (passive)',
            cooldown: 0,
            type: 'passive'
        }
    },
    {
        id: 'dasher',
        name: 'DASHER',
        icon: '💨',
        color: 'from-cyan-400 to-blue-400',
        desc: 'Master of quick dashes',
        stats: { health: 75, damage: 11, speed: 6, fireRate: 160, weapon: 'pistol' },
        passives: [
            { text: '+30% Movement Speed', positive: true },
            { text: 'Dash cooldown reduced by 50%', positive: true },
            { text: 'Invulnerable during dash', positive: true },
        ],
        ability: {
            name: 'BLINK DASH',
            desc: 'Instant dash to cursor location',
            cooldown: 3,
            type: 'active'
        }
    },

    // DPS CLASSES
    {
        id: 'gunslinger',
        name: 'GUNSLINGER',
        icon: '🔫',
        color: 'from-red-600 to-orange-500',
        desc: 'Crit machine',
        stats: { health: 80, damage: 12, speed: 6, fireRate: 120, weapon: 'pistol' },
        passives: [
            { text: '+25% Critical Hit Chance', positive: true },
            { text: '+50% Critical Damage', positive: true },
            { text: '-20% Max Health', positive: false },
        ],
        ability: {
            name: 'FAN THE HAMMER',
            desc: 'Fire 6 shots instantly',
            cooldown: 5,
            type: 'active'
        }
    },
    {
        id: 'sniper',
        name: 'SNIPER',
        icon: '🎯',
        color: 'from-green-600 to-teal-500',
        desc: 'One shot, one kill',
        stats: { health: 70, damage: 35, speed: 5, fireRate: 600, weapon: 'pistol' },
        passives: [
            { text: '+200% Damage', positive: true },
            { text: '+100% Range', positive: true },
            { text: '-70% Fire Rate', positive: false },
            { text: '-30% Max Health', positive: false },
        ],
        ability: {
            name: 'FOCUS SHOT',
            desc: 'Next shot deals 5x damage and pierces',
            cooldown: 10,
            type: 'active'
        }
    },
    {
        id: 'berserker',
        name: 'BERSERKER',
        icon: '🪓',
        color: 'from-red-700 to-red-500',
        desc: 'Gains power from carnage',
        stats: { health: 90, damage: 15, speed: 5.5, fireRate: 150, weapon: 'minigun' },
        passives: [
            { text: '+5% Damage per kill (max +100%)', positive: true },
            { text: '+2% Speed per kill (max +40%)', positive: true },
            { text: 'Bonuses reset on taking damage', positive: false },
        ],
        ability: {
            name: 'BLOOD RAGE',
            desc: 'Kills grant stacking damage (passive)',
            cooldown: 0,
            type: 'passive'
        }
    },
    {
        id: 'pyromaniac',
        name: 'PYROMANIAC',
        icon: '🔥',
        color: 'from-orange-600 to-red-500',
        desc: 'Watch the world burn',
        stats: { health: 85, damage: 8, speed: 5, fireRate: 80, weapon: 'flamethrower' },
        passives: [
            { text: 'Attacks set enemies on fire', positive: true },
            { text: '+50% Damage over time', positive: true },
            { text: 'Immune to fire damage', positive: true },
        ],
        ability: {
            name: 'INFERNO',
            desc: 'Create a massive fire explosion',
            cooldown: 15,
            type: 'active'
        }
    },
    {
        id: 'artillery',
        name: 'ARTILLERY',
        icon: '💣',
        color: 'from-purple-600 to-pink-500',
        desc: 'Explosive specialist',
        stats: { health: 100, damage: 20, speed: 4.5, fireRate: 300, weapon: 'rocket' },
        passives: [
            { text: '+100% Explosion Radius', positive: true },
            { text: '+50% Explosion Damage', positive: true },
            { text: '-25% Movement Speed', positive: false },
        ],
        ability: {
            name: 'BOMBARDMENT',
            desc: 'Call down 5 explosive strikes',
            cooldown: 20,
            type: 'active'
        }
    },

    // ASSASSIN CLASSES
    {
        id: 'assassin',
        name: 'ASSASSIN',
        icon: '🗡️',
        color: 'from-indigo-600 to-purple-500',
        desc: 'Strike from the shadows',
        stats: { health: 60, damage: 18, speed: 7, fireRate: 100, weapon: 'pistol' },
        passives: [
            { text: '+100% Damage from behind', positive: true },
            { text: '+40% Movement Speed', positive: true },
            { text: '-40% Max Health', positive: false },
        ],
        ability: {
            name: 'SHADOW STRIKE',
            desc: 'Teleport behind nearest enemy',
            cooldown: 8,
            type: 'active'
        }
    },
    {
        id: 'ninja',
        name: 'NINJA',
        icon: '🥷',
        color: 'from-gray-700 to-gray-500',
        desc: 'Master of stealth',
        stats: { health: 65, damage: 14, speed: 7, fireRate: 120, weapon: 'pistol' },
        passives: [
            { text: '+35% Evasion Chance', positive: true },
            { text: 'Become invisible when not shooting', positive: true },
            { text: '-35% Max Health', positive: false },
        ],
        ability: {
            name: 'SMOKE BOMB',
            desc: 'Vanish and confuse enemies for 3s',
            cooldown: 10,
            type: 'active'
        }
    },

    // UTILITY CLASSES
    {
        id: 'vampire',
        name: 'VAMPIRE',
        icon: '🧛',
        color: 'from-red-800 to-purple-600',
        desc: 'Drain life from enemies',
        stats: { health: 80, damage: 10, speed: 5.5, fireRate: 160, weapon: 'pistol' },
        passives: [
            { text: '+20% Lifesteal', positive: true },
            { text: 'Heal on kill', positive: true },
            { text: 'No natural health regen', positive: false },
        ],
        ability: {
            name: 'BLOOD DRAIN',
            desc: 'Drain all nearby enemies, healing you',
            cooldown: 12,
            type: 'active'
        }
    },
    {
        id: 'engineer',
        name: 'ENGINEER',
        icon: '🔧',
        color: 'from-yellow-600 to-orange-500',
        desc: 'Build your army',
        stats: { health: 100, damage: 8, speed: 4.5, fireRate: 180, weapon: 'pistol' },
        passives: [
            { text: 'Start with 2 drones', positive: true },
            { text: '+50% Drone damage', positive: true },
            { text: '-20% Personal damage', positive: false },
        ],
        ability: {
            name: 'DEPLOY TURRET',
            desc: 'Place an auto-targeting turret',
            cooldown: 18,
            type: 'active'
        }
    },
    {
        id: 'medic',
        name: 'MEDIC',
        icon: '💊',
        color: 'from-pink-500 to-rose-400',
        desc: 'Sustain specialist',
        stats: { health: 110, damage: 7, speed: 5, fireRate: 160, weapon: 'pistol' },
        passives: [
            { text: '+100% Health Regeneration', positive: true },
            { text: '+30% Max Health', positive: true },
            { text: '-30% Damage dealt', positive: false },
        ],
        ability: {
            name: 'HEAL PULSE',
            desc: 'Instantly heal 40% of max health',
            cooldown: 12,
            type: 'active'
        }
    },
    {
        id: 'lucky',
        name: 'LUCKY',
        icon: '🍀',
        color: 'from-green-500 to-lime-400',
        desc: 'Fortune favors the bold',
        stats: { health: 90, damage: 10, speed: 5.5, fireRate: 150, weapon: 'pistol' },
        passives: [
            { text: '+30% Chance for double damage', positive: true },
            { text: '+25% Better upgrade rolls', positive: true },
            { text: '+15% Dodge chance', positive: true },
        ],
        ability: {
            name: 'LUCKY ROLL',
            desc: 'Random powerful effect (passive)',
            cooldown: 0,
            type: 'passive'
        }
    },
    {
        id: 'gambler',
        name: 'GAMBLER',
        icon: '🎲',
        color: 'from-yellow-500 to-red-500',
        desc: 'High risk, high reward',
        stats: { health: 85, damage: 12, speed: 5, fireRate: 140, weapon: 'pistol' },
        passives: [
            { text: 'Damage varies from 50% to 300%', positive: true },
            { text: '+50% Score multiplier', positive: true },
            { text: 'Can randomly take self-damage', positive: false },
        ],
        ability: {
            name: 'ALL IN',
            desc: 'Double or nothing on next 10 shots',
            cooldown: 15,
            type: 'active'
        }
    },

    // HYBRID CLASSES
    {
        id: 'paladin',
        name: 'PALADIN',
        icon: '⚔️',
        color: 'from-yellow-400 to-amber-300',
        desc: 'Holy warrior',
        stats: { health: 120, damage: 11, speed: 5, fireRate: 170, weapon: 'shotgun' },
        passives: [
            { text: '+20% Max Health', positive: true },
            { text: '+20% Damage', positive: true },
            { text: 'Heal nearby on kill', positive: true },
        ],
        ability: {
            name: 'DIVINE SHIELD',
            desc: 'Block all damage for 2s, then heal',
            cooldown: 16,
            type: 'active'
        }
    },
    {
        id: 'necromancer',
        name: 'NECROMANCER',
        icon: '💀',
        color: 'from-purple-800 to-gray-700',
        desc: 'Command the dead',
        stats: { health: 70, damage: 8, speed: 4.5, fireRate: 200, weapon: 'pistol' },
        passives: [
            { text: 'Killed enemies become allies', positive: true },
            { text: '+5% of enemy HP as minion', positive: true },
            { text: '-30% Max Health', positive: false },
        ],
        ability: {
            name: 'RAISE DEAD',
            desc: 'Revive all recent kills as minions',
            cooldown: 25,
            type: 'active'
        }
    },
    {
        id: 'elemental',
        name: 'ELEMENTAL',
        icon: '🌀',
        color: 'from-blue-500 to-red-500',
        desc: 'Master of elements',
        stats: { health: 85, damage: 12, speed: 5, fireRate: 160, weapon: 'pistol' },
        passives: [
            { text: 'Attacks randomly burn, freeze, or shock', positive: true },
            { text: '+30% Status effect duration', positive: true },
        ],
        ability: {
            name: 'ELEMENTAL BURST',
            desc: 'Unleash all elements at once',
            cooldown: 14,
            type: 'active'
        }
    },
    {
        id: 'rogue',
        name: 'ROGUE',
        icon: '🎭',
        color: 'from-teal-600 to-cyan-500',
        desc: 'Opportunistic striker',
        stats: { health: 75, damage: 14, speed: 6.5, fireRate: 130, weapon: 'pistol' },
        passives: [
            { text: '+50% Damage to slowed enemies', positive: true },
            { text: '+30% Movement Speed', positive: true },
            { text: 'Attacks apply slow', positive: true },
        ],
        ability: {
            name: 'CHEAP SHOT',
            desc: 'Next hit stuns and deals 3x damage',
            cooldown: 8,
            type: 'active'
        }
    },
    {
        id: 'titan',
        name: 'TITAN',
        icon: '🗿',
        color: 'from-stone-600 to-stone-400',
        desc: 'Grow stronger over time',
        stats: { health: 100, damage: 8, speed: 4, fireRate: 180, weapon: 'minigun' },
        passives: [
            { text: '+1% All stats per wave', positive: true },
            { text: '+5 Max HP per wave', positive: true },
            { text: 'Starts weaker than others', positive: false },
        ],
        ability: {
            name: 'TITAN\'S GROWTH',
            desc: 'Permanently grow stronger (passive)',
            cooldown: 0,
            type: 'passive'
        }
    },
    {
        id: 'glass_cannon',
        name: 'GLASS CANNON',
        icon: '💎',
        color: 'from-pink-400 to-purple-400',
        desc: 'Maximum damage, zero defense',
        stats: { health: 40, damage: 30, speed: 5, fireRate: 100, weapon: 'pistol' },
        passives: [
            { text: '+200% Damage', positive: true },
            { text: '+50% Fire Rate', positive: true },
            { text: '-60% Max Health', positive: false },
            { text: 'Die in one hit from bosses', positive: false },
        ],
        ability: {
            name: 'OVERLOAD',
            desc: '+100% damage for 5s, then stunned',
            cooldown: 20,
            type: 'active'
        }
    },
];

export default function ClassSelection({ onSelect }) {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [hoveredIndex, setHoveredIndex] = useState(null);

    useEffect(() => {
        const handleKeyboard = (e) => {
            const cols = 6;
            const currentRow = Math.floor(selectedIndex / cols);
            const currentCol = selectedIndex % cols;

            if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
                setSelectedIndex(prev => Math.max(0, prev - 1));
            } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
                setSelectedIndex(prev => Math.min(CLASSES.length - 1, prev + 1));
            } else if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
                const newIndex = selectedIndex - cols;
                if (newIndex >= 0) setSelectedIndex(newIndex);
            } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
                const newIndex = selectedIndex + cols;
                if (newIndex < CLASSES.length) setSelectedIndex(newIndex);
            } else if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onSelect(CLASSES[selectedIndex]);
            }
        };

        window.addEventListener('keydown', handleKeyboard);
        return () => window.removeEventListener('keydown', handleKeyboard);
    }, [selectedIndex, onSelect]);

    const displayIndex = hoveredIndex !== null ? hoveredIndex : selectedIndex;
    const selectedClass = CLASSES[displayIndex];

    return (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-30 bg-gradient-to-b from-[#1a1a24] via-[#0d0d14] to-[#1a1a24] overflow-auto py-8">
            {/* Title */}
            <motion.div
                initial={{ y: -30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-center mb-6"
            >
                <h1 className="text-4xl font-black text-white mb-1 tracking-wider">CHARACTER SELECTION</h1>
                <p className="text-gray-500 uppercase tracking-widest text-xs">Select your class</p>
            </motion.div>

            <div className="flex gap-6 max-w-6xl w-full px-4">
                {/* Character Grid */}
                <motion.div
                    initial={{ x: -30, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="flex-1"
                >
                    <div className="grid grid-cols-6 gap-2 bg-[#252530] p-3 border-2 border-[#3a3a4a]">
                        {CLASSES.map((cls, index) => {
                            const isSelected = index === selectedIndex;
                            const isHovered = index === hoveredIndex;

                            return (
                                <motion.button
                                    key={cls.id}
                                    onClick={() => {
                                        setSelectedIndex(index);
                                        onSelect(cls);
                                    }}
                                    onMouseEnter={() => setHoveredIndex(index)}
                                    onMouseLeave={() => setHoveredIndex(null)}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className={`
                                        aspect-square flex items-center justify-center text-3xl
                                        border-2 transition-all duration-150
                                        ${isSelected
                                            ? 'border-yellow-400 bg-yellow-400/20 shadow-[0_0_15px_rgba(250,204,21,0.4)]'
                                            : isHovered
                                                ? 'border-gray-500 bg-gray-700/50'
                                                : 'border-[#3a3a4a] bg-[#1a1a24] hover:border-gray-600'
                                        }
                                    `}
                                >
                                    <span className={isSelected ? '' : 'grayscale-[30%]'}>
                                        {cls.icon}
                                    </span>
                                </motion.button>
                            );
                        })}
                    </div>
                    <p className="text-gray-600 text-xs mt-2 text-center">
                        Use WASD or Arrow Keys to navigate • Enter/Space to select
                    </p>
                </motion.div>

                {/* Character Info Panel */}
                <motion.div
                    initial={{ x: 30, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="w-80"
                >
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={displayIndex}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.15 }}
                            className="bg-[#252530] border-2 border-[#4a4a5a] p-5"
                        >
                            {/* Header */}
                            <div className="flex items-center gap-3 mb-4 pb-3 border-b border-[#3a3a4a]">
                                <div className="text-4xl">{selectedClass.icon}</div>
                                <div>
                                    <h2 className={`text-xl font-black text-transparent bg-clip-text bg-gradient-to-r ${selectedClass.color}`}>
                                        {selectedClass.name}
                                    </h2>
                                    <p className="text-gray-500 text-xs">{selectedClass.desc}</p>
                                </div>
                            </div>

                            {/* Passives */}
                            <div className="mb-4 space-y-1">
                                {selectedClass.passives.map((passive, idx) => (
                                    <div
                                        key={idx}
                                        className={`text-sm font-medium ${
                                            passive.positive ? 'text-green-400' : 'text-red-400'
                                        }`}
                                    >
                                        {passive.text}
                                    </div>
                                ))}
                            </div>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-2 gap-2 mb-4">
                                <div className="bg-[#1a1a24] p-2 border border-[#3a3a4a]">
                                    <div className="text-gray-500 text-[10px] uppercase">Health</div>
                                    <div className="text-white font-bold">{selectedClass.stats.health}</div>
                                </div>
                                <div className="bg-[#1a1a24] p-2 border border-[#3a3a4a]">
                                    <div className="text-gray-500 text-[10px] uppercase">Damage</div>
                                    <div className="text-white font-bold">{selectedClass.stats.damage}</div>
                                </div>
                                <div className="bg-[#1a1a24] p-2 border border-[#3a3a4a]">
                                    <div className="text-gray-500 text-[10px] uppercase">Speed</div>
                                    <div className="text-white font-bold">{selectedClass.stats.speed}</div>
                                </div>
                                <div className="bg-[#1a1a24] p-2 border border-[#3a3a4a]">
                                    <div className="text-gray-500 text-[10px] uppercase">Weapon</div>
                                    <div className="text-white font-bold text-xs uppercase">{selectedClass.stats.weapon}</div>
                                </div>
                            </div>

                            {/* Ability */}
                            <div className="bg-[#1a1a24] border border-[#3a3a4a] p-3">
                                <div className="flex items-center justify-between mb-1">
                                    <span className={`text-sm font-black bg-gradient-to-r ${selectedClass.color} bg-clip-text text-transparent`}>
                                        {selectedClass.ability.name}
                                    </span>
                                    <span className={`text-[10px] px-2 py-0.5 font-bold uppercase ${
                                        selectedClass.ability.type === 'passive'
                                            ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50'
                                            : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50'
                                    }`}>
                                        {selectedClass.ability.type === 'passive' ? 'PASSIVE' : 'SPACE'}
                                    </span>
                                </div>
                                <p className="text-gray-400 text-xs mb-1">{selectedClass.ability.desc}</p>
                                {selectedClass.ability.cooldown > 0 && (
                                    <p className="text-gray-600 text-[10px]">Cooldown: {selectedClass.ability.cooldown}s</p>
                                )}
                            </div>

                            {/* Select Button */}
                            <button
                                onClick={() => onSelect(selectedClass)}
                                className={`w-full mt-4 bg-gradient-to-r ${selectedClass.color} hover:brightness-110 text-white font-black text-lg py-3 uppercase tracking-wider transition-all`}
                            >
                                SELECT
                            </button>
                        </motion.div>
                    </AnimatePresence>
                </motion.div>
            </div>
        </div>
    );
}

export { CLASSES };
