import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const ENEMY_TYPES = [
    { id: 'basic', name: 'Basic', color: '#ff4444', health: 20, size: 15 },
    { id: 'fast', name: 'Fast', color: '#ffff00', health: 15, size: 12 },
    { id: 'tank', name: 'Tank', color: '#4444ff', health: 80, size: 25 },
    { id: 'swarm', name: 'Swarm', color: '#00ff00', health: 8, size: 8 },
    { id: 'shooter', name: 'Shooter', color: '#ff00ff', health: 30, size: 18 },
    { id: 'exploder', name: 'Exploder', color: '#ff8800', health: 25, size: 20 },
    { id: 'dasher', name: 'Dasher', color: '#00ffff', health: 35, size: 16 },
    { id: 'splitter', name: 'Splitter', color: '#88ff88', health: 40, size: 22 },
    { id: 'healer', name: 'Healer', color: '#ff88ff', health: 45, size: 18 },
    { id: 'shielder', name: 'Shielder', color: '#8888ff', health: 60, size: 20 },
    { id: 'boss', name: 'Boss', color: '#ff0000', health: 500, size: 40 },
    { id: 'miniboss', name: 'Mini Boss', color: '#ff4400', health: 200, size: 30 },
];

const OBSTACLE_TYPES = [
    { id: 'wall', name: 'Wall', color: '#666666', width: 100, height: 20 },
    { id: 'pillar', name: 'Pillar', color: '#888888', width: 30, height: 30 },
    { id: 'barrier', name: 'Barrier', color: '#4488ff', width: 80, height: 15 },
    { id: 'crate', name: 'Crate', color: '#aa8844', width: 40, height: 40 },
    { id: 'spike', name: 'Spike Trap', color: '#ff4444', width: 50, height: 50, damage: true },
    { id: 'slow', name: 'Slow Zone', color: '#44aaff', width: 80, height: 80, slow: true },
    { id: 'heal', name: 'Heal Zone', color: '#44ff44', width: 60, height: 60, heal: true },
    { id: 'bounce', name: 'Bounce Pad', color: '#ffaa00', width: 50, height: 50, bounce: true },
];

const TOOLS = [
    { id: 'select', name: 'Select', icon: 'SEL', desc: 'Select and move objects' },
    { id: 'spawn', name: 'Spawn Enemy', icon: 'ENM', desc: 'Click to spawn enemies' },
    { id: 'obstacle', name: 'Place Obstacle', icon: 'OBS', desc: 'Click to place obstacles' },
    { id: 'delete', name: 'Delete', icon: 'DEL', desc: 'Click to delete objects' },
    { id: 'player', name: 'Move Player', icon: 'PLR', desc: 'Click to teleport player' },
    { id: 'wave', name: 'Wave Control', icon: 'WAV', desc: 'Control wave spawning' },
];

export default function SandboxUI({
    onSpawnEnemy,
    onPlaceObstacle,
    onDeleteAt,
    onMovePlayer,
    onClearAll,
    onToggleGodMode,
    onSetWave,
    onSpawnWave,
    onTogglePause,
    godMode,
    isPaused,
    currentWave,
    enemyCount,
    obstacleCount
}) {
    const [selectedTool, setSelectedTool] = useState('spawn');
    const [selectedEnemy, setSelectedEnemy] = useState('basic');
    const [selectedObstacle, setSelectedObstacle] = useState('wall');
    const [showPanel, setShowPanel] = useState(true);
    const [spawnCount, setSpawnCount] = useState(1);
    const [waveInput, setWaveInput] = useState(1);

    const handleCanvasClick = (e) => {
        const rect = e.target.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        switch (selectedTool) {
            case 'spawn':
                for (let i = 0; i < spawnCount; i++) {
                    const offsetX = (Math.random() - 0.5) * 50;
                    const offsetY = (Math.random() - 0.5) * 50;
                    onSpawnEnemy?.(selectedEnemy, x + offsetX, y + offsetY);
                }
                break;
            case 'obstacle':
                onPlaceObstacle?.(selectedObstacle, x, y);
                break;
            case 'delete':
                onDeleteAt?.(x, y);
                break;
            case 'player':
                onMovePlayer?.(x, y);
                break;
            default:
                break;
        }
    };

    return (
        <>
            {/* Canvas click overlay */}
            <div
                className="absolute inset-0 z-20"
                onClick={handleCanvasClick}
                style={{ cursor: selectedTool === 'spawn' ? 'crosshair' : selectedTool === 'delete' ? 'not-allowed' : 'pointer' }}
            />

            {/* Toggle Panel Button */}
            <button
                onClick={() => setShowPanel(!showPanel)}
                className="absolute top-4 left-4 z-40 bg-purple-600 text-white px-3 py-2 font-bold text-sm hover:bg-purple-500"
            >
                {showPanel ? 'HIDE' : 'SHOW'} TOOLS
            </button>

            {/* Main Sandbox Panel */}
            <AnimatePresence>
                {showPanel && (
                    <motion.div
                        initial={{ x: -300, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -300, opacity: 0 }}
                        className="absolute left-4 top-16 bottom-4 w-72 bg-[#0a0a0f]/95 border-2 border-purple-500/50 z-40 overflow-y-auto"
                    >
                        {/* Header */}
                        <div className="bg-purple-600 px-4 py-3 sticky top-0">
                            <h2 className="text-white font-black text-lg tracking-wider">SANDBOX MODE</h2>
                            <p className="text-purple-200 text-xs">Build and test your arena</p>
                        </div>

                        {/* Stats Bar */}
                        <div className="bg-[#12121a] px-4 py-2 border-b border-purple-500/30 flex gap-4 text-xs">
                            <div>
                                <span className="text-gray-500">Enemies:</span>
                                <span className="text-red-400 font-bold ml-1">{enemyCount || 0}</span>
                            </div>
                            <div>
                                <span className="text-gray-500">Obstacles:</span>
                                <span className="text-blue-400 font-bold ml-1">{obstacleCount || 0}</span>
                            </div>
                            <div>
                                <span className="text-gray-500">Wave:</span>
                                <span className="text-yellow-400 font-bold ml-1">{currentWave || 1}</span>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="p-4 border-b border-purple-500/30">
                            <h3 className="text-gray-400 text-xs uppercase tracking-wider mb-2">Quick Actions</h3>
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    onClick={onToggleGodMode}
                                    className={`px-3 py-2 text-xs font-bold border-2 transition-colors ${
                                        godMode
                                            ? 'bg-yellow-500/20 border-yellow-500 text-yellow-400'
                                            : 'bg-gray-800 border-gray-600 text-gray-400 hover:border-yellow-500'
                                    }`}
                                >
                                    GOD MODE {godMode ? 'ON' : 'OFF'}
                                </button>
                                <button
                                    onClick={onTogglePause}
                                    className={`px-3 py-2 text-xs font-bold border-2 transition-colors ${
                                        isPaused
                                            ? 'bg-blue-500/20 border-blue-500 text-blue-400'
                                            : 'bg-gray-800 border-gray-600 text-gray-400 hover:border-blue-500'
                                    }`}
                                >
                                    {isPaused ? 'RESUME' : 'PAUSE'}
                                </button>
                                <button
                                    onClick={onClearAll}
                                    className="px-3 py-2 text-xs font-bold bg-red-900/30 border-2 border-red-600 text-red-400 hover:bg-red-600 hover:text-white transition-colors"
                                >
                                    CLEAR ALL
                                </button>
                                <button
                                    onClick={() => onSpawnWave?.()}
                                    className="px-3 py-2 text-xs font-bold bg-green-900/30 border-2 border-green-600 text-green-400 hover:bg-green-600 hover:text-white transition-colors"
                                >
                                    SPAWN WAVE
                                </button>
                            </div>
                        </div>

                        {/* Wave Control */}
                        <div className="p-4 border-b border-purple-500/30">
                            <h3 className="text-gray-400 text-xs uppercase tracking-wider mb-2">Wave Control</h3>
                            <div className="flex gap-2">
                                <input
                                    type="number"
                                    min="1"
                                    max="100"
                                    value={waveInput}
                                    onChange={(e) => setWaveInput(parseInt(e.target.value) || 1)}
                                    className="flex-1 bg-[#1a1a24] border border-gray-600 px-2 py-1 text-white text-sm focus:outline-none focus:border-purple-500"
                                />
                                <button
                                    onClick={() => onSetWave?.(waveInput)}
                                    className="px-3 py-1 bg-purple-600 text-white text-xs font-bold hover:bg-purple-500"
                                >
                                    SET
                                </button>
                            </div>
                        </div>

                        {/* Tools */}
                        <div className="p-4 border-b border-purple-500/30">
                            <h3 className="text-gray-400 text-xs uppercase tracking-wider mb-2">Tools</h3>
                            <div className="grid grid-cols-3 gap-1">
                                {TOOLS.map(tool => (
                                    <button
                                        key={tool.id}
                                        onClick={() => setSelectedTool(tool.id)}
                                        title={tool.desc}
                                        className={`p-2 text-center border-2 transition-colors ${
                                            selectedTool === tool.id
                                                ? 'bg-cyan-500/20 border-cyan-500 text-cyan-400'
                                                : 'bg-[#1a1a24] border-gray-700 text-gray-400 hover:border-gray-500'
                                        }`}
                                    >
                                        <div className="text-sm font-black">{tool.icon}</div>
                                        <div className="text-[8px] mt-0.5">{tool.name}</div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Enemy Spawner */}
                        {selectedTool === 'spawn' && (
                            <div className="p-4 border-b border-purple-500/30">
                                <h3 className="text-gray-400 text-xs uppercase tracking-wider mb-2">Enemy Type</h3>
                                <div className="grid grid-cols-3 gap-1 mb-3">
                                    {ENEMY_TYPES.map(enemy => (
                                        <button
                                            key={enemy.id}
                                            onClick={() => setSelectedEnemy(enemy.id)}
                                            className={`p-2 text-center border-2 transition-colors ${
                                                selectedEnemy === enemy.id
                                                    ? 'border-white'
                                                    : 'border-gray-700 hover:border-gray-500'
                                            }`}
                                            style={{ backgroundColor: enemy.color + '30' }}
                                        >
                                            <div
                                                className="w-4 h-4 mx-auto rounded-full mb-1"
                                                style={{ backgroundColor: enemy.color }}
                                            />
                                            <div className="text-[8px] text-gray-300">{enemy.name}</div>
                                        </button>
                                    ))}
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-gray-400 text-xs">Spawn Count:</span>
                                    <input
                                        type="number"
                                        min="1"
                                        max="50"
                                        value={spawnCount}
                                        onChange={(e) => setSpawnCount(parseInt(e.target.value) || 1)}
                                        className="w-16 bg-[#1a1a24] border border-gray-600 px-2 py-1 text-white text-sm focus:outline-none focus:border-purple-500"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Obstacle Placer */}
                        {selectedTool === 'obstacle' && (
                            <div className="p-4 border-b border-purple-500/30">
                                <h3 className="text-gray-400 text-xs uppercase tracking-wider mb-2">Obstacle Type</h3>
                                <div className="grid grid-cols-2 gap-1">
                                    {OBSTACLE_TYPES.map(obs => (
                                        <button
                                            key={obs.id}
                                            onClick={() => setSelectedObstacle(obs.id)}
                                            className={`p-2 text-left border-2 transition-colors ${
                                                selectedObstacle === obs.id
                                                    ? 'border-white bg-white/10'
                                                    : 'border-gray-700 hover:border-gray-500 bg-[#1a1a24]'
                                            }`}
                                        >
                                            <div className="flex items-center gap-2">
                                                <div
                                                    className="w-6 h-4"
                                                    style={{ backgroundColor: obs.color }}
                                                />
                                                <span className="text-xs text-gray-300">{obs.name}</span>
                                            </div>
                                            {obs.damage && <span className="text-[8px] text-red-400">Damages</span>}
                                            {obs.slow && <span className="text-[8px] text-blue-400">Slows</span>}
                                            {obs.heal && <span className="text-[8px] text-green-400">Heals</span>}
                                            {obs.bounce && <span className="text-[8px] text-yellow-400">Bounces</span>}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Tool Description */}
                        <div className="p-4">
                            <div className="bg-[#1a1a24] border border-gray-700 p-3">
                                <div className="text-cyan-400 font-bold text-sm mb-1">
                                    {TOOLS.find(t => t.id === selectedTool)?.name}
                                </div>
                                <p className="text-gray-400 text-xs">
                                    {TOOLS.find(t => t.id === selectedTool)?.desc}
                                </p>
                            </div>
                        </div>

                        {/* Keybinds */}
                        <div className="p-4 border-t border-purple-500/30">
                            <h3 className="text-gray-400 text-xs uppercase tracking-wider mb-2">Keybinds</h3>
                            <div className="text-[10px] text-gray-500 space-y-1">
                                <div><span className="text-gray-300">1-6</span> - Select tool</div>
                                <div><span className="text-gray-300">G</span> - Toggle god mode</div>
                                <div><span className="text-gray-300">P</span> - Pause/Resume</div>
                                <div><span className="text-gray-300">C</span> - Clear all</div>
                                <div><span className="text-gray-300">Click</span> - Use selected tool</div>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Current Tool Indicator */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-40 bg-[#0a0a0f]/90 border-2 border-purple-500/50 px-6 py-2">
                <div className="flex items-center gap-4">
                    <span className="text-gray-400 text-xs">Tool:</span>
                    <span className="text-cyan-400 font-bold">{TOOLS.find(t => t.id === selectedTool)?.name}</span>
                    {selectedTool === 'spawn' && (
                        <>
                            <span className="text-gray-600">|</span>
                            <span className="text-gray-400 text-xs">Enemy:</span>
                            <span className="text-red-400 font-bold">{ENEMY_TYPES.find(e => e.id === selectedEnemy)?.name}</span>
                        </>
                    )}
                    {selectedTool === 'obstacle' && (
                        <>
                            <span className="text-gray-600">|</span>
                            <span className="text-gray-400 text-xs">Obstacle:</span>
                            <span className="text-blue-400 font-bold">{OBSTACLE_TYPES.find(o => o.id === selectedObstacle)?.name}</span>
                        </>
                    )}
                </div>
            </div>
        </>
    );
}

export { ENEMY_TYPES, OBSTACLE_TYPES };
