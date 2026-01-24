import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Target, Flame, ChevronLeft, ChevronRight } from 'lucide-react';

const CLASSES = [
    {
        id: 'bruiser',
        name: 'BRUISER',
        icon: Shield,
        color: 'from-blue-600 to-cyan-500',
        desc: 'Tank class with high health and melee resistance',
        stats: {
            health: 150,
            damage: 8,
            speed: 4,
            fireRate: 200,
            weapon: 'shotgun'
        },
        ability: {
            name: 'IRON SHIELD',
            desc: 'Gain temporary invulnerability and increased melee damage',
            cooldown: 15
        }
    },
    {
        id: 'gunslinger',
        name: 'GUNSLINGER',
        icon: Target,
        color: 'from-red-600 to-orange-500',
        desc: 'High DPS with critical hits and mobility',
        stats: {
            health: 80,
            damage: 12,
            speed: 6,
            fireRate: 120,
            weapon: 'pistol'
        },
        ability: {
            name: 'DODGE ROLL',
            desc: 'Quick dash that makes you invulnerable briefly',
            cooldown: 5
        }
    },
    {
        id: 'artillery',
        name: 'ARTILLERY',
        icon: Flame,
        color: 'from-purple-600 to-pink-500',
        desc: 'Massive damage with explosive area attacks',
        stats: {
            health: 100,
            damage: 20,
            speed: 4.5,
            fireRate: 300,
            weapon: 'rocket'
        },
        ability: {
            name: 'BOMBARDMENT',
            desc: 'Call down explosive strikes around you',
            cooldown: 20
        }
    },
    {
        id: 'berserker',
        name: 'BERSERKER',
        icon: Flame,
        color: 'from-red-700 to-red-500',
        desc: 'Gains power from killing, high risk high reward',
        stats: {
            health: 90,
            damage: 15,
            speed: 5.5,
            fireRate: 150,
            weapon: 'minigun'
        },
        ability: {
            name: 'BLOOD RAGE',
            desc: 'Each kill increases damage and speed temporarily',
            cooldown: 0
        }
    },
    {
        id: 'sniper',
        name: 'SNIPER',
        icon: Target,
        color: 'from-green-600 to-teal-500',
        desc: 'Long range precision with massive critical damage',
        stats: {
            health: 70,
            damage: 30,
            speed: 5,
            fireRate: 400,
            weapon: 'pistol'
        },
        ability: {
            name: 'FOCUS SHOT',
            desc: 'Next shot deals 5x damage and pierces everything',
            cooldown: 10
        }
    },
    {
        id: 'engineer',
        name: 'ENGINEER',
        icon: Shield,
        color: 'from-yellow-600 to-orange-500',
        desc: 'Deploys turrets and gains shield regeneration',
        stats: {
            health: 100,
            damage: 10,
            speed: 4.5,
            fireRate: 180,
            weapon: 'pistol'
        },
        ability: {
            name: 'DEPLOY TURRET',
            desc: 'Place an auto-turret that shoots enemies',
            cooldown: 18
        }
    },
    {
        id: 'assassin',
        name: 'ASSASSIN',
        icon: Target,
        color: 'from-indigo-600 to-purple-500',
        desc: 'Extreme speed and damage, but very fragile',
        stats: {
            health: 60,
            damage: 18,
            speed: 7,
            fireRate: 100,
            weapon: 'pistol'
        },
        ability: {
            name: 'SHADOW STRIKE',
            desc: 'Teleport to cursor and gain brief invulnerability',
            cooldown: 8
        }
    },
    {
        id: 'medic',
        name: 'MEDIC',
        icon: Shield,
        color: 'from-pink-500 to-rose-400',
        desc: 'Sustain specialist with healing and regeneration',
        stats: {
            health: 110,
            damage: 9,
            speed: 5,
            fireRate: 160,
            weapon: 'shotgun'
        },
        ability: {
            name: 'HEAL PULSE',
            desc: 'Instantly heal 30% of max health',
            cooldown: 12
        }
    }
];

export default function ClassSelection({ onSelect }) {
    const [selectedIndex, setSelectedIndex] = useState(0);
    
    useEffect(() => {
        const handleWheel = (e) => {
            if (e.deltaY > 0) {
                setSelectedIndex(prev => Math.min(CLASSES.length - 1, prev + 1));
            } else if (e.deltaY < 0) {
                setSelectedIndex(prev => Math.max(0, prev - 1));
            }
        };
        
        const handleKeyboard = (e) => {
            if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
                setSelectedIndex(prev => Math.max(0, prev - 1));
            } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
                setSelectedIndex(prev => Math.min(CLASSES.length - 1, prev + 1));
            } else if (e.key === 'Enter' || e.key === ' ') {
                onSelect(CLASSES[selectedIndex]);
            }
        };
        
        window.addEventListener('wheel', handleWheel);
        window.addEventListener('keydown', handleKeyboard);
        return () => {
            window.removeEventListener('wheel', handleWheel);
            window.removeEventListener('keydown', handleKeyboard);
        };
    }, [selectedIndex, onSelect]);
    
    const selectedClass = CLASSES[selectedIndex];
    const Icon = selectedClass.icon;
    
    return (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-30 bg-gradient-to-b from-[#0a0a0f] via-[#1a0a1f] to-[#0a0a0f]">
            <motion.div
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-center mb-8"
            >
                <h1 className="text-4xl font-black text-white mb-2 tracking-wider">CHOOSE YOUR CLASS</h1>
                <p className="text-gray-500 uppercase tracking-widest text-xs">Scroll or use arrow keys</p>
            </motion.div>

            {/* Character carousel */}
            <div className="relative w-full max-w-5xl flex items-center justify-center mb-8">
                <button
                    onClick={() => setSelectedIndex(prev => Math.max(0, prev - 1))}
                    disabled={selectedIndex === 0}
                    className="absolute left-4 z-20 bg-gray-900/80 hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed border border-gray-700 p-3 transition-all"
                >
                    <ChevronLeft className="w-6 h-6 text-white" />
                </button>

                <div className="flex items-center gap-4 overflow-hidden px-16">
                    {CLASSES.map((cls, index) => {
                        const offset = index - selectedIndex;
                        const isSelected = index === selectedIndex;
                        const ClassIcon = cls.icon;
                        
                        return (
                            <motion.button
                                key={cls.id}
                                onClick={() => {
                                    if (isSelected) {
                                        onSelect(cls);
                                    } else {
                                        setSelectedIndex(index);
                                    }
                                }}
                                animate={{
                                    x: offset * 140,
                                    scale: isSelected ? 1.3 : Math.max(0.6, 1 - Math.abs(offset) * 0.2),
                                    opacity: Math.abs(offset) > 2 ? 0 : Math.max(0.3, 1 - Math.abs(offset) * 0.3),
                                    filter: isSelected ? 'brightness(1)' : 'brightness(0.5)'
                                }}
                                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                className={`flex-shrink-0 w-28 h-28 rounded-full border-4 ${
                                    isSelected ? 'border-white' : 'border-gray-700'
                                } bg-gradient-to-b from-gray-800 to-gray-900 flex items-center justify-center transition-colors`}
                            >
                                <ClassIcon className={`w-12 h-12 ${isSelected ? 'text-white' : 'text-gray-500'}`} />
                            </motion.button>
                        );
                    })}
                </div>

                <button
                    onClick={() => setSelectedIndex(prev => Math.min(CLASSES.length - 1, prev + 1))}
                    disabled={selectedIndex === CLASSES.length - 1}
                    className="absolute right-4 z-20 bg-gray-900/80 hover:bg-gray-800 disabled:opacity-30 disabled:cursor-not-allowed border border-gray-700 p-3 transition-all"
                >
                    <ChevronRight className="w-6 h-6 text-white" />
                </button>
            </div>

            {/* Selected class info */}
            <motion.div
                key={selectedIndex}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-2xl px-4"
            >
                <div className="bg-gradient-to-b from-gray-900/90 to-black/90 border-2 border-gray-700 p-8">
                    <div className={`absolute inset-0 bg-gradient-to-b ${selectedClass.color} opacity-10`} />
                    
                    <div className="relative z-10">
                        <h2 className={`text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r ${selectedClass.color} mb-3 text-center tracking-wider`}>
                            {selectedClass.name}
                        </h2>
                        
                        <p className="text-gray-400 text-center text-sm mb-6">
                            {selectedClass.desc}
                        </p>

                        <div className="grid grid-cols-2 gap-4 mb-6">
                            <div className="bg-black/40 p-3 border border-gray-800">
                                <div className="text-gray-500 text-xs uppercase tracking-wider mb-1">Health</div>
                                <div className="text-white font-bold text-xl">{selectedClass.stats.health}</div>
                            </div>
                            <div className="bg-black/40 p-3 border border-gray-800">
                                <div className="text-gray-500 text-xs uppercase tracking-wider mb-1">Damage</div>
                                <div className="text-white font-bold text-xl">{selectedClass.stats.damage}</div>
                            </div>
                            <div className="bg-black/40 p-3 border border-gray-800">
                                <div className="text-gray-500 text-xs uppercase tracking-wider mb-1">Speed</div>
                                <div className="text-white font-bold text-xl">{selectedClass.stats.speed}</div>
                            </div>
                            <div className="bg-black/40 p-3 border border-gray-800">
                                <div className="text-gray-500 text-xs uppercase tracking-wider mb-1">Weapon</div>
                                <div className="text-white font-bold text-xl uppercase">{selectedClass.stats.weapon}</div>
                            </div>
                        </div>

                        <div className="border-t border-gray-700 pt-4">
                            <div className={`text-sm uppercase tracking-widest mb-2 font-bold bg-gradient-to-r ${selectedClass.color} bg-clip-text text-transparent`}>
                                {selectedClass.ability.name}
                            </div>
                            <p className="text-gray-400 text-sm mb-2">{selectedClass.ability.desc}</p>
                            <p className="text-gray-600 text-xs">Cooldown: {selectedClass.ability.cooldown}s</p>
                        </div>

                        <button
                            onClick={() => onSelect(selectedClass)}
                            className={`w-full mt-6 bg-gradient-to-r ${selectedClass.color} hover:opacity-90 text-white font-black text-xl py-4 uppercase tracking-wider transition-all hover:scale-105`}
                        >
                            Select {selectedClass.name}
                        </button>
                    </div>
                </div>
            </motion.div>

            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-6 text-gray-600 text-xs"
            >
                Press Enter or Space to confirm
            </motion.p>
        </div>
    );
}

export { CLASSES };