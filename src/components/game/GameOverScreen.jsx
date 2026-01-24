import React from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { Skull, Clock, Target, Flame } from 'lucide-react';

export default function GameOverScreen({ stats, onRestart }) {
    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center z-40"
        >
            {/* Death text */}
            <motion.div
                initial={{ scale: 2, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="relative mb-12"
            >
                <h1 className="text-6xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-red-500 to-orange-500 tracking-tighter">
                    WASTED
                </h1>
                <div className="absolute inset-0 text-6xl md:text-8xl font-black text-red-500/20 blur-2xl -z-10">
                    WASTED
                </div>
            </motion.div>

            {/* Stats grid */}
            <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="grid grid-cols-2 gap-6 mb-12 px-4"
            >
                <div className="bg-gray-900/50 border border-gray-700 p-6 text-center min-w-[140px]">
                    <Flame className="w-8 h-8 text-orange-500 mx-auto mb-2" />
                    <div className="text-3xl font-black text-white">{stats.wave}</div>
                    <div className="text-xs text-gray-500 uppercase tracking-widest">Wave</div>
                </div>

                <div className="bg-gray-900/50 border border-gray-700 p-6 text-center min-w-[140px]">
                    <Target className="w-8 h-8 text-cyan-500 mx-auto mb-2" />
                    <div className="text-3xl font-black text-white">{stats.score.toLocaleString()}</div>
                    <div className="text-xs text-gray-500 uppercase tracking-widest">Score</div>
                </div>

                <div className="bg-gray-900/50 border border-gray-700 p-6 text-center min-w-[140px]">
                    <Skull className="w-8 h-8 text-red-500 mx-auto mb-2" />
                    <div className="text-3xl font-black text-white">{stats.kills}</div>
                    <div className="text-xs text-gray-500 uppercase tracking-widest">Kills</div>
                </div>

                <div className="bg-gray-900/50 border border-gray-700 p-6 text-center min-w-[140px]">
                    <Clock className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                    <div className="text-3xl font-black text-white">{formatTime(stats.time)}</div>
                    <div className="text-xs text-gray-500 uppercase tracking-widest">Time</div>
                </div>
            </motion.div>

            {/* Restart button */}
            <motion.div
                initial={{ y: 30, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
            >
                <Button 
                    onClick={onRestart}
                    className="bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-500 hover:to-pink-500 text-white font-bold text-xl px-12 py-6 rounded-none border-2 border-white/20 transition-all duration-300 hover:scale-105 hover:border-white/50"
                >
                    TRY AGAIN
                </Button>
            </motion.div>

            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="mt-6 text-gray-600 text-sm"
            >
                Press to restart
            </motion.p>
        </motion.div>
    );
}