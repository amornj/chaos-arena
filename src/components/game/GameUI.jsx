import React from 'react';
import { Heart, Shield, Skull, Zap } from 'lucide-react';

export default function GameUI({ health, maxHealth, wave, score, kills, combo, shield }) {
    const healthPercent = (health / maxHealth) * 100;
    
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

            {/* Bottom stats */}
            <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                {/* Kills */}
                <div className="flex items-center gap-2">
                    <Skull className="w-5 h-5 text-gray-400" />
                    <span className="text-xl font-bold text-gray-300">{kills}</span>
                    <span className="text-xs text-gray-500 uppercase">kills</span>
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

                {/* Difficulty indicator */}
                <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 uppercase">Difficulty</span>
                    <div className="flex gap-1">
                        {[...Array(Math.min(5, Math.ceil(wave / 2)))].map((_, i) => (
                            <div 
                                key={i}
                                className="w-2 h-4 bg-gradient-to-t from-red-600 to-orange-400"
                                style={{ 
                                    opacity: 0.5 + (i / 10),
                                    boxShadow: wave > 8 ? '0 0 10px rgba(255,0,0,0.5)' : 'none'
                                }}
                            />
                        ))}
                    </div>
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