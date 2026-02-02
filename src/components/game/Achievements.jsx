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
    },

    // New achievements
    aoe_multikill_6: {
        id: 'aoe_multikill_6',
        name: 'Discombobulate²',
        description: 'Kill 6 enemies in one AOE attack.',
        icon: '💥',
        rarity: 'rare'
    },
    equip_orbital: {
        id: 'equip_orbital',
        name: 'War crimes.',
        description: 'Equip the orbital laser.',
        icon: '🛰️',
        rarity: 'rare'
    },
    bare_hands_kill: {
        id: 'bare_hands_kill',
        name: 'Get slapped bozo',
        description: 'Kill an enemy with "Bare hands".',
        icon: '✋',
        rarity: 'uncommon'
    },
    fan_hammer_melee: {
        id: 'fan_hammer_melee',
        name: 'Okay. seriously. HOW-',
        description: 'Use fan the hammer with a melee weapon.',
        icon: '🤯',
        rarity: 'legendary'
    },
    use_flamethrower: {
        id: 'use_flamethrower',
        name: 'Arson',
        description: 'Use the flamethrower.',
        icon: '🔥',
        rarity: 'common'
    },
    jackhammer_kill: {
        id: 'jackhammer_kill',
        name: 'RAAAA-',
        description: 'Kill an enemy with the jackhammer.',
        icon: '🔨',
        rarity: 'uncommon'
    },
    friendly_fire: {
        id: 'friendly_fire',
        name: 'Friendly fire',
        description: 'Cause a bloater to explode a fellow enemy.',
        icon: '💣',
        rarity: 'uncommon'
    },
    acid_kill: {
        id: 'acid_kill',
        name: 'Schloppity schlop',
        description: 'Kill an enemy with acid.',
        icon: '🧪',
        rarity: 'common'
    },
    get_homing: {
        id: 'get_homing',
        name: 'Smarter',
        description: 'Get homing bullets.',
        icon: '🎯',
        rarity: 'uncommon'
    },
    use_afterimage: {
        id: 'use_afterimage',
        name: 'Duplication',
        description: 'Use afterimage.',
        icon: '👻',
        rarity: 'uncommon'
    },
    drift: {
        id: 'drift',
        name: 'VREEEEEE-',
        description: 'Drift.',
        icon: '🚗',
        rarity: 'uncommon'
    },
    die_as_juggernaut: {
        id: 'die_as_juggernaut',
        name: 'Irony',
        description: 'Die as the juggernaut.',
        icon: '😔',
        rarity: 'uncommon'
    },
    kill_juggernaut_as_juggernaut: {
        id: 'kill_juggernaut_as_juggernaut',
        name: 'Same same, but different.',
        description: 'Kill the juggernaut enemy as the juggernaut class, or vice versa.',
        icon: '🦏',
        rarity: 'rare'
    },
    blood_drain_kill: {
        id: 'blood_drain_kill',
        name: 'Juice box',
        description: 'Kill an enemy with Blood drain.',
        icon: '🧃',
        rarity: 'uncommon'
    },
    kill_titan_as_titan: {
        id: 'kill_titan_as_titan',
        name: 'Same same, actually wait-',
        description: 'Kill the titan enemy as the titan class.',
        icon: '🗿',
        rarity: 'rare'
    },
    countersnipe: {
        id: 'countersnipe',
        name: 'Countersniped',
        description: 'Kill the sniper enemy with the sniper weapon.',
        icon: '🎯',
        rarity: 'uncommon'
    },

    // === NEW KILL COUNT ACHIEVEMENTS ===
    kill_100: {
        id: 'kill_100',
        name: 'Centurion',
        description: 'Kill 100 enemies in a single run.',
        icon: '💯',
        rarity: 'uncommon'
    },
    kill_500: {
        id: 'kill_500',
        name: 'Annihilator',
        description: 'Kill 500 enemies in a single run.',
        icon: '☠️',
        rarity: 'rare'
    },
    kill_1000: {
        id: 'kill_1000',
        name: 'Genocide',
        description: 'Kill 1000 enemies in a single run.',
        icon: '💀',
        rarity: 'legendary'
    },
    kill_streak_10: {
        id: 'kill_streak_10',
        name: 'Rampage',
        description: 'Kill 10 enemies within 3 seconds.',
        icon: '🔥',
        rarity: 'uncommon'
    },
    kill_streak_25: {
        id: 'kill_streak_25',
        name: 'UNSTOPPABLE',
        description: 'Kill 25 enemies within 5 seconds.',
        icon: '💥',
        rarity: 'rare'
    },

    // === NEW WEAPON ACHIEVEMENTS ===
    equip_scythe: {
        id: 'equip_scythe',
        name: 'Grim Reaper',
        description: 'Equip the scythe.',
        icon: '💀',
        rarity: 'uncommon'
    },
    equip_warhammer: {
        id: 'equip_warhammer',
        name: 'BONK',
        description: 'Equip the warhammer.',
        icon: '🔨',
        rarity: 'uncommon'
    },
    equip_golden_gun: {
        id: 'equip_golden_gun',
        name: 'Goldeneye',
        description: 'Equip the golden gun.',
        icon: '🔫',
        rarity: 'legendary'
    },
    equip_annihilator: {
        id: 'equip_annihilator',
        name: 'DELETED',
        description: 'Equip the annihilator.',
        icon: '⚡',
        rarity: 'legendary'
    },
    equip_rubber_chicken: {
        id: 'equip_rubber_chicken',
        name: 'Comedy Gold',
        description: 'Equip the rubber chicken.',
        icon: '🐔',
        rarity: 'legendary'
    },
    equip_black_hole: {
        id: 'equip_black_hole',
        name: 'Event Horizon',
        description: 'Equip the black hole gun.',
        icon: '🕳️',
        rarity: 'rare'
    },
    equip_infinity_blade: {
        id: 'equip_infinity_blade',
        name: 'Perfectly Balanced',
        description: 'Equip the infinity blade.',
        icon: '⚔️',
        rarity: 'legendary'
    },
    equip_toilet_plunger: {
        id: 'equip_toilet_plunger',
        name: 'The Plumber',
        description: 'Equip the toilet plunger.',
        icon: '🪠',
        rarity: 'rare'
    },
    equip_galaxy_gun: {
        id: 'equip_galaxy_gun',
        name: 'Star Lord',
        description: 'Equip the galaxy gun.',
        icon: '🌌',
        rarity: 'legendary'
    },

    // === WAVE ACHIEVEMENTS ===
    reach_wave_5: {
        id: 'reach_wave_5',
        name: 'Warming Up',
        description: 'Reach wave 5.',
        icon: '5️⃣',
        rarity: 'common'
    },
    reach_wave_10: {
        id: 'reach_wave_10',
        name: 'Getting Serious',
        description: 'Reach wave 10.',
        icon: '🔟',
        rarity: 'uncommon'
    },
    reach_wave_20: {
        id: 'reach_wave_20',
        name: 'Veteran',
        description: 'Reach wave 20.',
        icon: '⭐',
        rarity: 'rare'
    },
    reach_wave_50: {
        id: 'reach_wave_50',
        name: 'Legend',
        description: 'Reach wave 50.',
        icon: '🏆',
        rarity: 'legendary'
    },

    // === SURVIVAL ACHIEVEMENTS ===
    no_damage_wave: {
        id: 'no_damage_wave',
        name: 'Untouchable',
        description: 'Complete a wave without taking damage.',
        icon: '🛡️',
        rarity: 'uncommon'
    },
    no_damage_5_waves: {
        id: 'no_damage_5_waves',
        name: 'Ghost',
        description: 'Complete 5 waves in a row without taking damage.',
        icon: '👻',
        rarity: 'legendary'
    },
    survive_10min: {
        id: 'survive_10min',
        name: 'Marathon Runner',
        description: 'Survive in a wave for longer than 10 minutes.',
        icon: '🏃',
        rarity: 'legendary'
    },
    clutch_kill: {
        id: 'clutch_kill',
        name: 'Clutch Master',
        description: 'Kill the last enemy with less than 5 HP.',
        icon: '😅',
        rarity: 'rare'
    },

    // === DEATH ACHIEVEMENTS ===
    ten_deaths: {
        id: 'ten_deaths',
        name: 'Persistence',
        description: 'Die 10 times.',
        icon: '💪',
        rarity: 'uncommon'
    },
    fifty_deaths: {
        id: 'fifty_deaths',
        name: 'Determination',
        description: 'Die 50 times.',
        icon: '🔄',
        rarity: 'rare'
    },
    hundred_deaths: {
        id: 'hundred_deaths',
        name: 'Immortal Spirit',
        description: 'Die 100 times. You never give up.',
        icon: '♾️',
        rarity: 'legendary'
    },
    die_instantly: {
        id: 'die_instantly',
        name: 'Speedrun',
        description: 'Die within 5 seconds of starting.',
        icon: '⏱️',
        rarity: 'uncommon'
    },
    die_to_own_explosion: {
        id: 'die_to_own_explosion',
        name: 'Friendly Fire',
        description: 'Kill yourself with your own explosive.',
        icon: '💣',
        rarity: 'uncommon'
    },

    // === COMBO ACHIEVEMENTS ===
    melee_only_wave: {
        id: 'melee_only_wave',
        name: 'Close Quarters',
        description: 'Complete a wave using only melee weapons.',
        icon: '⚔️',
        rarity: 'rare'
    },
    explosive_only_wave: {
        id: 'explosive_only_wave',
        name: 'Demolition Expert',
        description: 'Complete a wave using only explosives.',
        icon: '💥',
        rarity: 'rare'
    },
    pistol_only_wave: {
        id: 'pistol_only_wave',
        name: 'Old School',
        description: 'Complete wave 5+ using only the pistol.',
        icon: '🔫',
        rarity: 'rare'
    },

    // === GEAR ACHIEVEMENTS ===
    max_speed: {
        id: 'max_speed',
        name: 'Gotta Go Fast',
        description: 'Stack 3+ speed upgrades.',
        icon: '💨',
        rarity: 'uncommon'
    },
    full_build: {
        id: 'full_build',
        name: 'Fully Loaded',
        description: 'Have 10+ gear items equipped.',
        icon: '🎒',
        rarity: 'rare'
    },
    glass_cannon: {
        id: 'glass_cannon',
        name: 'Glass Cannon',
        description: 'Have max damage but less than 50 HP.',
        icon: '🔮',
        rarity: 'rare'
    },
    tank_build: {
        id: 'tank_build',
        name: 'Walking Fortress',
        description: 'Have 300+ max HP.',
        icon: '🏰',
        rarity: 'rare'
    },

    // === ENEMY ACHIEVEMENTS ===
    kill_boss: {
        id: 'kill_boss',
        name: 'Boss Slayer',
        description: 'Kill any boss enemy.',
        icon: '👑',
        rarity: 'uncommon'
    },
    kill_50_bosses: {
        id: 'kill_50_bosses',
        name: 'Boss Hunter',
        description: 'Kill 50 boss enemies total.',
        icon: '🎖️',
        rarity: 'rare'
    },
    kill_bloater_chain: {
        id: 'kill_bloater_chain',
        name: 'Chain Reaction',
        description: 'Cause 3 bloaters to explode from one explosion.',
        icon: '💥',
        rarity: 'rare'
    },
    encounter_all_enemies: {
        id: 'encounter_all_enemies',
        name: 'Bestiary Complete',
        description: 'Encounter every enemy type.',
        icon: '📖',
        rarity: 'legendary'
    },

    // === MISC ACHIEVEMENTS ===
    shop_skip: {
        id: 'shop_skip',
        name: 'No Thanks',
        description: 'Skip the shop without buying anything.',
        icon: '🚫',
        rarity: 'common'
    },
    spend_10000: {
        id: 'spend_10000',
        name: 'Big Spender',
        description: 'Spend 10000 gold in one run.',
        icon: '💰',
        rarity: 'rare'
    },
    reroll_10: {
        id: 'reroll_10',
        name: 'Picky',
        description: 'Reroll shop items 10 times in one run.',
        icon: '🎲',
        rarity: 'uncommon'
    },
    lightning_kill_5: {
        id: 'lightning_kill_5',
        name: 'Zeus',
        description: 'Kill 5 enemies with one lightning chain.',
        icon: '⚡',
        rarity: 'rare'
    },
    freeze_10: {
        id: 'freeze_10',
        name: 'Ice Age',
        description: 'Have 10 enemies frozen at once.',
        icon: '❄️',
        rarity: 'uncommon'
    },
    overkill: {
        id: 'overkill',
        name: 'Overkill',
        description: 'Deal 10x an enemy\'s HP in one hit.',
        icon: '💢',
        rarity: 'uncommon'
    },
    pacifist: {
        id: 'pacifist',
        name: 'Pacifist',
        description: 'Survive 30 seconds without killing anything.',
        icon: '☮️',
        rarity: 'rare'
    },
    speed_demon: {
        id: 'speed_demon',
        name: 'Speed Demon',
        description: 'Move at 500% speed or more.',
        icon: '👹',
        rarity: 'rare'
    },
    richochet_kill: {
        id: 'richochet_kill',
        name: 'Calculated',
        description: 'Kill an enemy with a ricocheted bullet.',
        icon: '🎱',
        rarity: 'uncommon'
    },
    behind_you: {
        id: 'behind_you',
        name: 'Nothing Personnel',
        description: 'Kill an enemy from behind with backstab.',
        icon: '🗡️',
        rarity: 'uncommon'
    },
    whip_it_good: {
        id: 'whip_it_good',
        name: 'Whip It Good',
        description: 'Get 50 kills with the whip.',
        icon: '🦹',
        rarity: 'rare'
    },
    nunchuck_master: {
        id: 'nunchuck_master',
        name: 'Nunchuck Master',
        description: 'Complete a full combo with nunchucks.',
        icon: '🥋',
        rarity: 'uncommon'
    },
    black_hole_suck: {
        id: 'black_hole_suck',
        name: 'Into the Void',
        description: 'Pull 10 enemies with one black hole.',
        icon: '🌀',
        rarity: 'rare'
    },
    boomerang_catch: {
        id: 'boomerang_catch',
        name: 'Catch!',
        description: 'Hit the same enemy twice with one boomerang.',
        icon: '🪃',
        rarity: 'uncommon'
    },

    // === NEW ENEMY ACHIEVEMENTS ===
    encounter_c4: {
        id: 'encounter_c4',
        name: 'BOMB HAS BEEN PLANTED',
        description: 'Encounter the C4 enemy.',
        icon: '💣',
        rarity: 'uncommon'
    },
    encounter_bacteria: {
        id: 'encounter_bacteria',
        name: 'Infection',
        description: 'Encounter the bacteria enemy.',
        icon: '🦠',
        rarity: 'uncommon'
    },
    encounter_virus: {
        id: 'encounter_virus',
        name: 'Pandemic',
        description: 'Encounter the virus enemy.',
        icon: '🧬',
        rarity: 'rare'
    },
    encounter_imploder: {
        id: 'encounter_imploder',
        name: 'Implosion',
        description: 'Encounter the imploder enemy.',
        icon: '🌀',
        rarity: 'uncommon'
    },
    encounter_plague: {
        id: 'encounter_plague',
        name: 'The End Times',
        description: 'Encounter the plague enemy. Good luck.',
        icon: '☠️',
        rarity: 'legendary'
    },

    // === NEW WEAPON ACHIEVEMENTS ===
    equip_holy_grenade: {
        id: 'equip_holy_grenade',
        name: 'One... Two... FIVE!',
        description: 'Equip the Holy Hand Grenade.',
        icon: '✝️',
        rarity: 'legendary'
    },
    equip_neptunes_rain: {
        id: 'equip_neptunes_rain',
        name: 'DIAMONDS',
        description: 'Equip Neptune\'s Rain.',
        icon: '💎',
        rarity: 'legendary'
    },
    equip_bomb_knife: {
        id: 'equip_bomb_knife',
        name: 'Surprise!',
        description: 'Equip the bomb knife.',
        icon: '🔪',
        rarity: 'uncommon'
    },
    equip_toxin_jar: {
        id: 'equip_toxin_jar',
        name: 'Why did they get this?',
        description: 'Equip the toxin gas jar.',
        icon: '🫙',
        rarity: 'rare'
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
