import React from 'react';
import { motion } from 'framer-motion';
import { Shield, Target, Flame } from 'lucide-react';

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
    }
];

export default function ClassSelection({ onSelect }) {
    return (
        <div className="absolute inset-0 flex flex-col items-center justify-center z-30 bg-gradient-to-b from-[#0a0a0f] via-[#1a0a1f] to-[#0a0a0f]">
            <motion.div
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="text-center mb-12"
            >
                <h1 className="text-5xl font-black text-white mb-2 tracking-wider">CHOOSE YOUR CLASS</h1>
                <p className="text-gray-500 uppercase tracking-widest text-sm">Each class has unique abilities</p>
            </motion.div>

            <div className="flex flex-col md:flex-row gap-6 px-4 max-w-6xl">
                {CLASSES.map((cls, index) => {
                    const Icon = cls.icon;
                    return (
                        <motion.button
                            key={cls.id}
                            initial={{ y: 50, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: index * 0.15 }}
                            onClick={() => onSelect(cls)}
                            className="group relative w-full md:w-80 bg-gradient-to-b from-gray-900/90 to-black/90 border-2 border-gray-700 hover:border-transparent p-8 transition-all duration-300 hover:scale-105"
                        >
                            <div className={`absolute inset-0 bg-gradient-to-b ${cls.color} opacity-0 group-hover:opacity-20 transition-opacity`} />
                            
                            <Icon className="w-16 h-16 mx-auto mb-4 text-gray-400 group-hover:text-white transition-colors" />
                            
                            <h3 className="text-2xl font-black text-white mb-3 tracking-wider">
                                {cls.name}
                            </h3>
                            
                            <p className="text-gray-400 text-sm mb-6">
                                {cls.desc}
                            </p>

                            <div className="space-y-2 mb-6 text-left text-xs">
                                <div className="flex justify-between text-gray-500">
                                    <span>HEALTH</span>
                                    <span className="text-white font-bold">{cls.stats.health}</span>
                                </div>
                                <div className="flex justify-between text-gray-500">
                                    <span>DAMAGE</span>
                                    <span className="text-white font-bold">{cls.stats.damage}</span>
                                </div>
                                <div className="flex justify-between text-gray-500">
                                    <span>SPEED</span>
                                    <span className="text-white font-bold">{cls.stats.speed}</span>
                                </div>
                                <div className="flex justify-between text-gray-500">
                                    <span>WEAPON</span>
                                    <span className="text-white font-bold uppercase">{cls.stats.weapon}</span>
                                </div>
                            </div>

                            <div className="border-t border-gray-700 pt-4">
                                <div className={`text-xs uppercase tracking-widest mb-1 font-bold bg-gradient-to-r ${cls.color} bg-clip-text text-transparent`}>
                                    {cls.ability.name}
                                </div>
                                <p className="text-gray-500 text-xs">{cls.ability.desc}</p>
                                <p className="text-gray-600 text-xs mt-1">CD: {cls.ability.cooldown}s</p>
                            </div>

                            <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${cls.color} transform scale-x-0 group-hover:scale-x-100 transition-transform`} />
                        </motion.button>
                    );
                })}
            </div>

            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="mt-8 text-gray-600 text-sm"
            >
                Click to select your class
            </motion.p>
        </div>
    );
}

export { CLASSES };