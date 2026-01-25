import React from 'react';
import { motion } from 'framer-motion';

export default function UpgradeModal({ upgrades, onSelect, wave, rerolls, maxRerolls, onReroll }) {
    const canReroll = rerolls > 0;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center z-30"
        >
            <motion.div
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="text-center mb-8"
            >
                <h2 className="text-2xl font-bold text-green-400 tracking-widest uppercase mb-2">
                    Wave {wave - 1} Complete
                </h2>
                <p className="text-gray-400 uppercase tracking-wider">Choose Your Upgrade</p>
            </motion.div>

            <div className="flex flex-col md:flex-row gap-4 md:gap-6 px-4 max-w-5xl">
                {upgrades.map((upgrade, index) => (
                    <motion.button
                        key={upgrade.id}
                        initial={{ y: 50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 + index * 0.1 }}
                        onClick={() => onSelect(upgrade)}
                        className="group relative w-full md:w-64 bg-gradient-to-b from-gray-900/90 to-black/90 border-2 border-gray-700 hover:border-cyan-500 p-6 transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(0,255,255,0.2)]"
                    >
                        {/* Glow effect */}
                        <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/0 to-cyan-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />

                        {/* Rarity indicator */}
                        {upgrade.rarity && (
                            <div className={`absolute top-2 right-2 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider border ${
                                upgrade.rarity === 'legendary' ? 'text-yellow-400 border-yellow-400 bg-yellow-400/10' :
                                upgrade.rarity === 'epic' ? 'text-purple-400 border-purple-400 bg-purple-400/10' :
                                upgrade.rarity === 'rare' ? 'text-blue-400 border-blue-400 bg-blue-400/10' :
                                'text-gray-400 border-gray-400 bg-gray-400/10'
                            }`}>
                                {upgrade.rarity}
                            </div>
                        )}

                        {/* Icon */}
                        <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">
                            {upgrade.icon}
                        </div>

                        {/* Title */}
                        <h3 className={`text-xl font-black mb-2 tracking-wider ${
                            upgrade.rarity === 'legendary' ? 'text-yellow-400' :
                            upgrade.rarity === 'epic' ? 'text-purple-400' :
                            upgrade.rarity === 'rare' ? 'text-blue-400' :
                            'text-white'
                        }`}>
                            {upgrade.name}
                        </h3>

                        {/* Description */}
                        <p className="text-gray-400 text-sm">
                            {upgrade.desc}
                        </p>

                        {/* Selection indicator */}
                        <div className={`absolute bottom-0 left-0 right-0 h-1 transform scale-x-0 group-hover:scale-x-100 transition-transform ${
                            upgrade.rarity === 'legendary' ? 'bg-yellow-400' :
                            upgrade.rarity === 'epic' ? 'bg-purple-400' :
                            upgrade.rarity === 'rare' ? 'bg-blue-400' :
                            'bg-cyan-500'
                        }`} />
                    </motion.button>
                ))}
            </div>

            {/* Reroll section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-8 flex flex-col items-center gap-2"
            >
                <button
                    onClick={onReroll}
                    disabled={!canReroll}
                    className={`px-6 py-3 font-bold uppercase tracking-wider border-2 transition-all duration-200 ${
                        canReroll
                            ? 'bg-orange-500/20 border-orange-500 text-orange-400 hover:bg-orange-500 hover:text-black hover:scale-105 cursor-pointer'
                            : 'bg-gray-800/50 border-gray-600 text-gray-600 cursor-not-allowed'
                    }`}
                >
                    <span className="flex items-center gap-2">
                        <span className="text-xl">🎲</span>
                        Reroll
                        <span className={`px-2 py-0.5 text-xs ${canReroll ? 'bg-orange-500/30' : 'bg-gray-700/50'}`}>
                            {rerolls}/{maxRerolls}
                        </span>
                    </span>
                </button>
                <p className="text-gray-500 text-xs">
                    {canReroll
                        ? `${rerolls} reroll${rerolls !== 1 ? 's' : ''} remaining`
                        : 'No rerolls left!'}
                </p>
            </motion.div>

            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="mt-6 text-gray-500 text-sm"
            >
                Click an upgrade to select
            </motion.p>
        </motion.div>
    );
}
