import React from 'react';
import { motion } from 'framer-motion';

export default function UpgradeModal({ upgrades, onSelect, wave }) {
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

            <div className="flex flex-col md:flex-row gap-4 md:gap-6 px-4 max-w-4xl">
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
                        
                        {/* Icon */}
                        <div className="text-5xl mb-4 group-hover:scale-110 transition-transform">
                            {upgrade.icon}
                        </div>
                        
                        {/* Title */}
                        <h3 className="text-xl font-black text-white mb-2 tracking-wider">
                            {upgrade.name}
                        </h3>
                        
                        {/* Description */}
                        <p className="text-gray-400 text-sm">
                            {upgrade.desc}
                        </p>

                        {/* Selection indicator */}
                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-cyan-500 transform scale-x-0 group-hover:scale-x-100 transition-transform" />
                    </motion.button>
                ))}
            </div>

            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-8 text-gray-500 text-sm"
            >
                Click to select
            </motion.p>
        </motion.div>
    );
}