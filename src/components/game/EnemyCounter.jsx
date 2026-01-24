import React from 'react';
import { Skull } from 'lucide-react';

const ENEMY_INFO = {
    basic: { name: 'Basic', color: '#ff4444', icon: '👹' },
    runner: { name: 'Runner', color: '#ff6666', icon: '💨' },
    brute: { name: 'Brute', color: '#cc2222', icon: '💪' },
    bloater: { name: 'Bloater', color: '#ff8844', icon: '💥' },
    spitter: { name: 'Spitter', color: '#88ff44', icon: '🎯' },
    speeder: { name: 'Speeder', color: '#ffff44', icon: '⚡' },
    heavy: { name: 'Heavy', color: '#880022', icon: '🛡️' },
    shambler: { name: 'Shambler', color: '#8888ff', icon: '☁️' },
    nuke: { name: 'Nuke', color: '#ff00ff', icon: '☢️' },
    dasher: { name: 'Dasher', color: '#00ffff', icon: '🌀' },
    boss: { name: 'Boss', color: '#ff0066', icon: '👑' }
};

export default function EnemyCounter({ enemies }) {
    const enemyCounts = {};
    enemies.forEach(e => {
        enemyCounts[e.type] = (enemyCounts[e.type] || 0) + 1;
    });

    const uniqueTypes = Object.keys(enemyCounts);

    return (
        <div className="absolute top-4 right-4 w-64 bg-black/80 border border-gray-700 p-3 max-h-96 overflow-y-auto pointer-events-none">
            <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-700">
                <Skull className="w-4 h-4 text-red-500" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Enemies</h3>
            </div>
            
            <div className="space-y-2 text-xs">
                {uniqueTypes.length === 0 ? (
                    <div className="text-gray-500 text-center py-4">Clear</div>
                ) : (
                    uniqueTypes.map(type => {
                        const info = ENEMY_INFO[type];
                        if (!info) return null;
                        
                        return (
                            <div 
                                key={type}
                                className="flex items-center justify-between p-2 bg-gray-900/50 border border-gray-800"
                            >
                                <div className="flex items-center gap-2">
                                    <span className="text-lg">{info.icon}</span>
                                    <div className="font-bold" style={{ color: info.color }}>
                                        {info.name}
                                    </div>
                                </div>
                                <div className="text-white font-bold">
                                    ×{enemyCounts[type]}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            <div className="mt-3 pt-3 border-t border-gray-700 text-gray-400">
                <div className="flex justify-between text-[10px]">
                    <span>TOTAL</span>
                    <span className="text-white font-bold">{enemies.length}</span>
                </div>
            </div>
        </div>
    );
}