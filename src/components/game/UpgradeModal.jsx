import React, { useState } from 'react';
import { motion } from 'framer-motion';

export default function UpgradeModal({ upgrades, onSelect, wave, rerolls, maxRerolls, onReroll, credits, rerollCost, upgradeHistory }) {
    const canReroll = rerolls > 0 && credits >= rerollCost;
    const [showHistory, setShowHistory] = useState(false);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-black/90 backdrop-blur-sm flex flex-col items-center justify-center z-30 overflow-auto py-8"
        >
            {/* Credits display */}
            <motion.div
                initial={{ y: -30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                className="absolute top-4 right-4 flex items-center gap-2 bg-yellow-500/10 border border-yellow-500/50 px-4 py-2"
            >
                <span className="text-2xl">$</span>
                <span className="text-2xl font-black text-yellow-400">{credits}</span>
                <span className="text-yellow-600 text-sm">CREDITS</span>
            </motion.div>

            {/* History toggle */}
            <motion.button
                initial={{ y: -30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                onClick={() => setShowHistory(!showHistory)}
                className="absolute top-4 left-4 bg-purple-500/10 border border-purple-500/50 px-4 py-2 text-purple-400 hover:bg-purple-500/20 transition-colors"
            >
                {showHistory ? 'HIDE' : 'SHOW'} UPGRADES ({upgradeHistory?.length || 0})
            </motion.button>

            {/* Upgrade History Panel */}
            {showHistory && upgradeHistory && upgradeHistory.length > 0 && (
                <motion.div
                    initial={{ x: -100, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    className="absolute left-4 top-20 bottom-4 w-64 bg-black/90 border border-purple-500/30 overflow-y-auto"
                >
                    <div className="p-3 border-b border-purple-500/30 sticky top-0 bg-black">
                        <h3 className="text-purple-400 font-bold tracking-wider">UPGRADE HISTORY</h3>
                    </div>
                    <div className="p-2 space-y-1">
                        {upgradeHistory.map((upgrade, index) => (
                            <div
                                key={index}
                                className={`p-2 border-l-2 bg-gray-900/50 ${
                                    upgrade.rarity === 'legendary' ? 'border-yellow-400' :
                                    upgrade.rarity === 'epic' ? 'border-purple-400' :
                                    upgrade.rarity === 'rare' ? 'border-blue-400' :
                                    'border-gray-600'
                                }`}
                            >
                                <div className="flex items-center gap-2">
                                    <span className="text-lg">{upgrade.icon}</span>
                                    <span className={`text-sm font-bold ${
                                        upgrade.rarity === 'legendary' ? 'text-yellow-400' :
                                        upgrade.rarity === 'epic' ? 'text-purple-400' :
                                        upgrade.rarity === 'rare' ? 'text-blue-400' :
                                        'text-gray-300'
                                    }`}>{upgrade.name}</span>
                                </div>
                                <div className="text-[10px] text-gray-500 mt-1">Wave {upgrade.wave}</div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}

            <motion.div
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="text-center mb-6"
            >
                <h2 className="text-2xl font-bold text-green-400 tracking-widest uppercase mb-2">
                    Wave {wave - 1} Complete
                </h2>
                <p className="text-gray-400 uppercase tracking-wider">Choose Your Upgrade</p>
            </motion.div>

            {/* 4 upgrade slots in a row */}
            <div className="flex flex-wrap justify-center gap-3 px-4 max-w-6xl">
                {upgrades.map((upgrade, index) => (
                    <motion.button
                        key={upgrade.id}
                        initial={{ y: 50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.15 + index * 0.08 }}
                        onClick={() => onSelect(upgrade)}
                        className="group relative w-56 bg-gradient-to-b from-gray-900/90 to-black/90 border-2 border-gray-700 hover:border-cyan-500 p-4 transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(0,255,255,0.2)]"
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
                        <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">
                            {upgrade.icon}
                        </div>

                        {/* Title */}
                        <h3 className={`text-lg font-black mb-1 tracking-wider ${
                            upgrade.rarity === 'legendary' ? 'text-yellow-400' :
                            upgrade.rarity === 'epic' ? 'text-purple-400' :
                            upgrade.rarity === 'rare' ? 'text-blue-400' :
                            'text-white'
                        }`}>
                            {upgrade.name}
                        </h3>

                        {/* Description */}
                        <p className="text-gray-400 text-xs">
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
                className="mt-6 flex flex-col items-center gap-2"
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
                        <span className="text-xl">$</span>
                        Reroll
                        <span className={`px-2 py-0.5 text-xs ${canReroll ? 'bg-orange-500/30' : 'bg-gray-700/50'}`}>
                            {rerollCost} credits
                        </span>
                        <span className={`px-2 py-0.5 text-xs ${canReroll ? 'bg-orange-500/30' : 'bg-gray-700/50'}`}>
                            {rerolls} left
                        </span>
                    </span>
                </button>
                <p className="text-gray-500 text-xs">
                    {!canReroll && rerolls > 0 && credits < rerollCost
                        ? `Need ${rerollCost - credits} more credits`
                        : rerolls <= 0
                        ? 'No rerolls left this wave!'
                        : `${rerolls} reroll${rerolls !== 1 ? 's' : ''} available`}
                </p>
            </motion.div>

            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="mt-4 text-gray-500 text-sm"
            >
                Click an upgrade to select
            </motion.p>
        </motion.div>
    );
}
