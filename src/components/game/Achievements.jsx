import React, { useState, useEffect, useCallback, useRef, createContext, useContext } from 'react';
import { Trophy, X } from 'lucide-react';

// Achievement definitions
export const ACHIEVEMENTS = {
    // Basic progression
    baby_steps: {
        id: 'baby_steps',
        name: 'Baby steps',
        description: 'Start your first run.',
        icon: '👶',
        rarity: 'common'
    },
    first_blood: {
        id: 'first_blood',
        name: 'Wake and cause violence',
        description: 'Kill your first enemy.',
        icon: '💀',
        rarity: 'common'
    },
    sprint_used: {
        id: 'sprint_used',
        name: 'Why are you running?',
        description: 'Use the sprint key.',
        icon: '🏃',
        rarity: 'common'
    },

    // Enemy kills
    kill_runner: {
        id: 'kill_runner',
        name: 'WHY IS IT RUNNING',
        description: 'Kill the runner.',
        icon: '💨',
        rarity: 'common'
    },
    kill_brute: {
        id: 'kill_brute',
        name: 'What is that.',
        description: 'Find and kill the brute.',
        icon: '👊',
        rarity: 'common'
    },
    kill_cerberus: {
        id: 'kill_cerberus',
        name: 'Stone man hahahah',
        description: 'Find and kill the cerberus.',
        icon: '🐕',
        rarity: 'uncommon'
    },
    kill_blitzer: {
        id: 'kill_blitzer',
        name: 'Here comes the sun.',
        description: 'Find and kill the blitzer.',
        icon: '☀️',
        rarity: 'common'
    },
    kill_duplicator: {
        id: 'kill_duplicator',
        name: 'WHY IS THERE SO FCKING MANY OF THEM?',
        description: 'Find and kill the duplicator.',
        icon: '🪞',
        rarity: 'uncommon'
    },

    // Weapon equips
    equip_nuclear_sword: {
        id: 'equip_nuclear_sword',
        name: 'oh.',
        description: 'Equip the nuclear sword.',
        icon: '☢️',
        rarity: 'rare'
    },
    equip_nuke_launcher: {
        id: 'equip_nuke_launcher',
        name: 'oh²',
        description: 'Equip the nuke launcher.',
        icon: '💥',
        rarity: 'rare'
    },
    equip_fish: {
        id: 'equip_fish',
        name: 'The holy mackerel',
        description: 'Equip the fish.',
        icon: '🐟',
        rarity: 'legendary'
    },
    equip_disintegrator: {
        id: 'equip_disintegrator',
        name: 'woah',
        description: 'Equip the disintegrator.',
        icon: '✨',
        rarity: 'rare'
    },

    // Dash modules
    dash_v1: {
        id: 'dash_v1',
        name: 'VROOM VROOM',
        description: 'Get the dash module V1.',
        icon: '💨',
        rarity: 'common'
    },
    dash_v2: {
        id: 'dash_v2',
        name: 'VROOM VROOM²',
        description: 'Get the dash module V2.',
        icon: '⚡',
        rarity: 'uncommon'
    },
    dash_blitz: {
        id: 'dash_blitz',
        name: 'VROOM VROOOOOOM',
        description: 'Get the "BLITZ" dash module V3.',
        icon: '💀',
        rarity: 'rare'
    },

    // Iai Strike
    iai_strike_used: {
        id: 'iai_strike_used',
        name: 'Way of the blade',
        description: 'Use iai strike.',
        icon: '⚔️',
        rarity: 'uncommon'
    },
    iai_strike_boss: {
        id: 'iai_strike_boss',
        name: 'Diced',
        description: 'Use the Iai strike on a boss or tanky enemy.',
        icon: '🎯',
        rarity: 'rare'
    },
    iai_strike_ranged: {
        id: 'iai_strike_ranged',
        name: 'How-',
        description: 'Use Iai strike with a non melee weapon.',
        icon: '🤔',
        rarity: 'rare'
    },

    // Combat
    aoe_multikill: {
        id: 'aoe_multikill',
        name: 'Discombobulate',
        description: 'Kill at least 3 enemies with an AOE attack.',
        icon: '💥',
        rarity: 'uncommon'
    },
    melee_kill: {
        id: 'melee_kill',
        name: 'Shredded',
        description: 'Kill an enemy with a melee weapon.',
        icon: '🔪',
        rarity: 'common'
    },
    wave_wipe: {
        id: 'wave_wipe',
        name: 'whered everything go',
        description: 'Kill the entire wave with one attack.',
        icon: '🌪️',
        rarity: 'legendary'
    },

    // Encounters
    encounter_toxic: {
        id: 'encounter_toxic',
        name: 'WHAT THE HELL IS THAT-',
        description: 'Encounter the toxin, tumor, or shambler.',
        icon: '☠️',
        rarity: 'common'
    },
    encounter_hivemind: {
        id: 'encounter_hivemind',
        name: 'what.',
        description: 'Encounter the hive mind.',
        icon: '🧠',
        rarity: 'rare'
    },
    encounter_wraith: {
        id: 'encounter_wraith',
        name: 'huh wuh',
        description: 'Encounter the Wraith.',
        icon: '👻',
        rarity: 'uncommon'
    },
    encounter_tumor: {
        id: 'encounter_tumor',
        name: 'Cancer',
        description: 'Encounter the tumor.',
        icon: '🦠',
        rarity: 'common'
    },
    encounter_parasite: {
        id: 'encounter_parasite',
        name: 'I hate mosquitos.',
        description: 'Encounter the parasite.',
        icon: '🦟',
        rarity: 'common'
    },
    encounter_sticker: {
        id: 'encounter_sticker',
        name: 'Super glue',
        description: 'Encounter the sticker.',
        icon: '🏷️',
        rarity: 'common'
    },
    encounter_apocalypse: {
        id: 'encounter_apocalypse',
        name: 'Goodluck brother.',
        description: 'Encounter the Apocalypse enemy.',
        icon: '☠️',
        rarity: 'rare'
    },
    sticker_attached: {
        id: 'sticker_attached',
        name: 'GET IT OFF',
        description: 'Have a sticker attach to you.',
        icon: '😱',
        rarity: 'uncommon'
    },

    // Survival
    many_enemies: {
        id: 'many_enemies',
        name: 'We are so cooked.',
        description: 'Encounter at least 32 enemies in one wave.',
        icon: '😰',
        rarity: 'uncommon'
    },
    survive_1hp: {
        id: 'survive_1hp',
        name: 'Halfway to hell',
        description: 'Survive a wave on 1 HP.',
        icon: '💔',
        rarity: 'rare'
    },
    survive_5min: {
        id: 'survive_5min',
        name: 'Its been a while.',
        description: 'Survive in a wave for longer than 5 minutes.',
        icon: '⏰',
        rarity: 'rare'
    },

    // Deaths
    first_death: {
        id: 'first_death',
        name: 'Learning opportunity',
        description: 'Die for the first time.',
        icon: '📚',
        rarity: 'common'
    },
    five_deaths: {
        id: 'five_deaths',
        name: 'Skill issue',
        description: 'Die 5 times.',
        icon: '💀',
        rarity: 'uncommon'
    }
};

// Rarity colors
const RARITY_COLORS = {
    common: { bg: 'bg-gray-700', border: 'border-gray-500', text: 'text-gray-300', glow: '' },
    uncommon: { bg: 'bg-green-900', border: 'border-green-500', text: 'text-green-400', glow: 'shadow-[0_0_15px_rgba(34,197,94,0.3)]' },
    rare: { bg: 'bg-blue-900', border: 'border-blue-500', text: 'text-blue-400', glow: 'shadow-[0_0_15px_rgba(59,130,246,0.3)]' },
    legendary: { bg: 'bg-yellow-900', border: 'border-yellow-500', text: 'text-yellow-400', glow: 'shadow-[0_0_20px_rgba(234,179,8,0.4)]' }
};

// Storage key
const STORAGE_KEY = 'chaos_arena_achievements';
const DEATHS_KEY = 'chaos_arena_deaths';

// Load achievements from localStorage
export function loadAchievements() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        return saved ? JSON.parse(saved) : {};
    } catch {
        return {};
    }
}

// Save achievements to localStorage
export function saveAchievements(achievements) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(achievements));
    } catch {
        // Ignore storage errors
    }
}

// Load death count
export function loadDeaths() {
    try {
        return parseInt(localStorage.getItem(DEATHS_KEY) || '0', 10);
    } catch {
        return 0;
    }
}

// Save death count
export function saveDeaths(count) {
    try {
        localStorage.setItem(DEATHS_KEY, count.toString());
    } catch {
        // Ignore storage errors
    }
}

// Achievement notification component
function AchievementNotification({ achievement, onClose }) {
    const rarity = RARITY_COLORS[achievement.rarity] || RARITY_COLORS.common;

    useEffect(() => {
        const timer = setTimeout(onClose, 4000);
        return () => clearTimeout(timer);
    }, [onClose]);

    return (
        <div className={`
            fixed top-20 left-1/2 -translate-x-1/2 z-50
            ${rarity.bg} ${rarity.border} ${rarity.glow}
            border-2 px-6 py-4 min-w-[300px]
            animate-slide-down
        `}>
            <div className="flex items-center gap-4">
                <Trophy className={`w-8 h-8 ${rarity.text}`} />
                <div className="flex-1">
                    <div className="text-xs text-gray-400 uppercase tracking-wider mb-1">
                        Achievement Unlocked!
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-2xl">{achievement.icon}</span>
                        <span className={`font-bold ${rarity.text}`}>{achievement.name}</span>
                    </div>
                    <div className="text-xs text-gray-400 mt-1">{achievement.description}</div>
                </div>
            </div>
        </div>
    );
}

// Achievement viewer panel
export function AchievementPanel({ isOpen, onClose }) {
    const [unlocked, setUnlocked] = useState({});

    useEffect(() => {
        if (isOpen) {
            setUnlocked(loadAchievements());
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const achievementList = Object.values(ACHIEVEMENTS);
    const unlockedCount = Object.keys(unlocked).length;
    const totalCount = achievementList.length;

    // Group by rarity
    const byRarity = {
        legendary: achievementList.filter(a => a.rarity === 'legendary'),
        rare: achievementList.filter(a => a.rarity === 'rare'),
        uncommon: achievementList.filter(a => a.rarity === 'uncommon'),
        common: achievementList.filter(a => a.rarity === 'common')
    };

    return (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 pointer-events-auto">
            <div className="bg-[#0a0a0f] border-2 border-yellow-500/50 w-[700px] max-h-[80vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-yellow-500/30">
                    <div className="flex items-center gap-3">
                        <Trophy className="w-6 h-6 text-yellow-400" />
                        <h2 className="text-2xl font-bold text-yellow-400">Achievements</h2>
                        <span className="text-sm text-gray-400">
                            {unlockedCount} / {totalCount}
                        </span>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Progress bar */}
                <div className="px-4 py-2 border-b border-yellow-500/20">
                    <div className="w-full h-2 bg-gray-800 overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-yellow-600 to-yellow-400 transition-all duration-500"
                            style={{ width: `${(unlockedCount / totalCount) * 100}%` }}
                        />
                    </div>
                </div>

                {/* Achievement list */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {Object.entries(byRarity).map(([rarity, achievements]) => {
                        if (achievements.length === 0) return null;
                        const colors = RARITY_COLORS[rarity];
                        return (
                            <div key={rarity}>
                                <h3 className={`text-sm font-bold uppercase tracking-wider mb-2 ${colors.text}`}>
                                    {rarity} ({achievements.filter(a => unlocked[a.id]).length}/{achievements.length})
                                </h3>
                                <div className="grid grid-cols-2 gap-2">
                                    {achievements.map(achievement => {
                                        const isUnlocked = unlocked[achievement.id];
                                        return (
                                            <div
                                                key={achievement.id}
                                                className={`
                                                    p-3 border transition-all
                                                    ${isUnlocked
                                                        ? `${colors.bg} ${colors.border} ${colors.glow}`
                                                        : 'bg-gray-900/50 border-gray-700 opacity-50'
                                                    }
                                                `}
                                            >
                                                <div className="flex items-start gap-2">
                                                    <span className={`text-xl ${!isUnlocked && 'grayscale'}`}>
                                                        {isUnlocked ? achievement.icon : '🔒'}
                                                    </span>
                                                    <div className="flex-1 min-w-0">
                                                        <div className={`font-bold text-sm truncate ${isUnlocked ? colors.text : 'text-gray-500'}`}>
                                                            {achievement.name}
                                                        </div>
                                                        <div className="text-xs text-gray-500 line-clamp-2">
                                                            {achievement.description}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

// Achievement manager hook
export function useAchievements() {
    const [unlocked, setUnlocked] = useState(() => loadAchievements());
    const [notifications, setNotifications] = useState([]);
    const notificationIdRef = useRef(0);

    const unlock = useCallback((achievementId) => {
        if (unlocked[achievementId]) return; // Already unlocked

        const achievement = ACHIEVEMENTS[achievementId];
        if (!achievement) return;

        // Update state
        setUnlocked(prev => {
            const updated = { ...prev, [achievementId]: Date.now() };
            saveAchievements(updated);
            return updated;
        });

        // Show notification
        const notifId = notificationIdRef.current++;
        setNotifications(prev => [...prev, { id: notifId, achievement }]);
    }, [unlocked]);

    const dismissNotification = useCallback((id) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    }, []);

    const isUnlocked = useCallback((achievementId) => {
        return !!unlocked[achievementId];
    }, [unlocked]);

    return {
        unlock,
        isUnlocked,
        notifications,
        dismissNotification,
        unlockedCount: Object.keys(unlocked).length,
        totalCount: Object.keys(ACHIEVEMENTS).length
    };
}

// Achievement notifications renderer
export function AchievementNotifications({ notifications, onDismiss }) {
    return (
        <>
            {notifications.map((notif, index) => (
                <div
                    key={notif.id}
                    style={{ transform: `translateY(${index * 100}px)` }}
                >
                    <AchievementNotification
                        achievement={notif.achievement}
                        onClose={() => onDismiss(notif.id)}
                    />
                </div>
            ))}
        </>
    );
}

// Context for global achievement access
const AchievementContext = createContext(null);

export function AchievementProvider({ children }) {
    const achievements = useAchievements();
    return (
        <AchievementContext.Provider value={achievements}>
            {children}
        </AchievementContext.Provider>
    );
}

export function useAchievementContext() {
    return useContext(AchievementContext);
}

export default AchievementPanel;
