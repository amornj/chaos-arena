import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const CLASSES = [
    // ===== TANK CLASSES =====
    {
        id: 'bruiser',
        name: 'BRUISER',
        category: 'TANK',
        symbol: 'BRS',
        bgColor: 'bg-blue-600',
        accentColor: 'text-blue-400',
        borderColor: 'border-blue-500',
        desc: 'The unstoppable wall',
        stats: { health: 150, damage: 8, speed: 4, fireRate: 200, weapon: 'shotgun' },
        passives: [
            { text: '+50% Max Health', positive: true },
            { text: '-50% Explosion damage taken', positive: true },
            { text: '-20% Movement Speed', positive: false },
        ],
        ability: { name: 'IRON SHIELD', desc: 'Become invulnerable for 3s and reflect damage', cooldown: 15, type: 'active' }
    },
    {
        id: 'juggernaut',
        name: 'JUGGERNAUT',
        category: 'TANK',
        symbol: 'JGR',
        bgColor: 'bg-slate-600',
        accentColor: 'text-slate-400',
        borderColor: 'border-slate-500',
        desc: 'Immovable force',
        stats: { health: 200, damage: 6, speed: 3, fireRate: 250, weapon: 'minigun' },
        passives: [
            { text: '+100% Max Health', positive: true },
            { text: 'Cannot be knocked back', positive: true },
            { text: '-40% Movement Speed', positive: false },
            { text: '-25% Fire Rate', positive: false },
        ],
        ability: { name: 'UNSTOPPABLE', desc: 'Immune to slows and damage for 4s', cooldown: 20, type: 'active' }
    },
    {
        id: 'fortress',
        name: 'FORTRESS',
        category: 'TANK',
        symbol: 'FRT',
        bgColor: 'bg-amber-600',
        accentColor: 'text-amber-400',
        borderColor: 'border-amber-500',
        desc: 'Shield specialist',
        stats: { health: 120, damage: 7, speed: 4, fireRate: 180, weapon: 'pistol' },
        passives: [
            { text: '+50 Starting Shield', positive: true },
            { text: 'Shield regenerates over time', positive: true },
            { text: '-15% Damage dealt', positive: false },
        ],
        ability: { name: 'BARRIER', desc: 'Create a damage-absorbing shield zone', cooldown: 12, type: 'active' }
    },
    {
        id: 'colossus',
        name: 'COLOSSUS',
        category: 'TANK',
        symbol: 'COL',
        bgColor: 'bg-stone-600',
        accentColor: 'text-stone-400',
        borderColor: 'border-stone-500',
        desc: 'Living mountain',
        stats: { health: 250, damage: 5, speed: 2.5, fireRate: 300, weapon: 'minigun' },
        passives: [
            { text: '+150% Max Health', positive: true },
            { text: 'Enemies bounce off you', positive: true },
            { text: '-50% Movement Speed', positive: false },
            { text: '-40% Fire Rate', positive: false },
        ],
        ability: { name: 'EARTHQUAKE', desc: 'Stomp to stun all nearby enemies', cooldown: 18, type: 'active' }
    },
    {
        id: 'guardian',
        name: 'GUARDIAN',
        category: 'TANK',
        symbol: 'GRD',
        bgColor: 'bg-cyan-700',
        accentColor: 'text-cyan-400',
        borderColor: 'border-cyan-500',
        desc: 'Protector of all',
        stats: { health: 140, damage: 9, speed: 4.5, fireRate: 170, weapon: 'shotgun' },
        passives: [
            { text: '+40% Max Health', positive: true },
            { text: 'Thorns: Reflect 30% melee damage', positive: true },
            { text: '-10% Damage dealt', positive: false },
        ],
        ability: { name: 'SANCTUARY', desc: 'Create healing zone that blocks projectiles', cooldown: 20, type: 'active' }
    },

    // ===== SPEED CLASSES =====
    {
        id: 'speedster',
        name: 'SPEEDSTER',
        category: 'SPEED',
        symbol: 'SPD',
        bgColor: 'bg-yellow-500',
        accentColor: 'text-yellow-400',
        borderColor: 'border-yellow-400',
        desc: 'Fastest in the arena',
        stats: { health: 60, damage: 10, speed: 9, fireRate: 140, weapon: 'pistol' },
        passives: [
            { text: '+80% Movement Speed', positive: true },
            { text: '+25% Evasion chance', positive: true },
            { text: '-40% Max Health', positive: false },
        ],
        ability: { name: 'AFTERBURNER', desc: '+100% speed for 5s, leave damaging trail', cooldown: 8, type: 'active' }
    },
    {
        id: 'ghost',
        name: 'GHOST',
        category: 'SPEED',
        symbol: 'GHO',
        bgColor: 'bg-purple-500',
        accentColor: 'text-purple-400',
        borderColor: 'border-purple-400',
        desc: 'Phase through everything',
        stats: { health: 50, damage: 12, speed: 7, fireRate: 160, weapon: 'pistol' },
        passives: [
            { text: '+40% Movement Speed', positive: true },
            { text: 'Phase through enemies while moving', positive: true },
            { text: '-50% Max Health', positive: false },
        ],
        ability: { name: 'PHASE SHIFT', desc: 'Become intangible for 3s', cooldown: 10, type: 'active' }
    },
    {
        id: 'runner',
        name: 'RUNNER',
        category: 'SPEED',
        symbol: 'RUN',
        bgColor: 'bg-green-500',
        accentColor: 'text-green-400',
        borderColor: 'border-green-400',
        desc: 'Never stop moving',
        stats: { health: 70, damage: 9, speed: 8, fireRate: 150, weapon: 'pistol' },
        passives: [
            { text: '+60% Movement Speed', positive: true },
            { text: '+30% Damage while moving', positive: true },
            { text: '-50% Damage while standing still', positive: false },
        ],
        ability: { name: 'MOMENTUM', desc: 'Speed increases damage (passive)', cooldown: 0, type: 'passive' }
    },
    {
        id: 'dasher',
        name: 'DASHER',
        category: 'SPEED',
        symbol: 'DSH',
        bgColor: 'bg-cyan-500',
        accentColor: 'text-cyan-400',
        borderColor: 'border-cyan-400',
        desc: 'Master of quick dashes',
        stats: { health: 75, damage: 11, speed: 6, fireRate: 160, weapon: 'pistol' },
        passives: [
            { text: '+30% Movement Speed', positive: true },
            { text: 'Dash cooldown reduced by 50%', positive: true },
            { text: 'Invulnerable during dash', positive: true },
        ],
        ability: { name: 'BLINK DASH', desc: 'Instant dash to cursor location', cooldown: 3, type: 'active' }
    },
    {
        id: 'blur',
        name: 'BLUR',
        category: 'SPEED',
        symbol: 'BLR',
        bgColor: 'bg-indigo-400',
        accentColor: 'text-indigo-300',
        borderColor: 'border-indigo-400',
        desc: 'Too fast to see',
        stats: { health: 55, damage: 13, speed: 8.5, fireRate: 130, weapon: 'pistol' },
        passives: [
            { text: '+70% Movement Speed', positive: true },
            { text: '+40% Evasion while moving', positive: true },
            { text: '-45% Max Health', positive: false },
        ],
        ability: { name: 'VANISH', desc: 'Become invisible and invulnerable for 2s', cooldown: 12, type: 'active' }
    },

    // ===== DPS CLASSES =====
    {
        id: 'gunslinger',
        name: 'GUNSLINGER',
        category: 'DPS',
        symbol: 'GUN',
        bgColor: 'bg-red-600',
        accentColor: 'text-red-400',
        borderColor: 'border-red-500',
        desc: 'Crit machine',
        stats: { health: 80, damage: 12, speed: 6, fireRate: 120, weapon: 'pistol' },
        passives: [
            { text: '+25% Critical Hit Chance', positive: true },
            { text: '+50% Critical Damage', positive: true },
            { text: '-20% Max Health', positive: false },
        ],
        ability: { name: 'FAN THE HAMMER', desc: 'Fire 6 shots instantly', cooldown: 5, type: 'active' }
    },
    {
        id: 'sniper',
        name: 'SNIPER',
        category: 'DPS',
        symbol: 'SNP',
        bgColor: 'bg-teal-600',
        accentColor: 'text-teal-400',
        borderColor: 'border-teal-500',
        desc: 'One shot, one kill',
        stats: { health: 70, damage: 35, speed: 5, fireRate: 600, weapon: 'sniper' },
        passives: [
            { text: '+200% Damage', positive: true },
            { text: '+100% Range', positive: true },
            { text: '-70% Fire Rate', positive: false },
            { text: '-30% Max Health', positive: false },
        ],
        ability: { name: 'FOCUS SHOT', desc: 'Next shot deals 5x damage and pierces', cooldown: 10, type: 'active' }
    },
    {
        id: 'berserker',
        name: 'BERSERKER',
        category: 'DPS',
        symbol: 'BRK',
        bgColor: 'bg-red-700',
        accentColor: 'text-red-500',
        borderColor: 'border-red-600',
        desc: 'Gains power from carnage',
        stats: { health: 90, damage: 15, speed: 5.5, fireRate: 150, weapon: 'minigun' },
        passives: [
            { text: '+5% Damage per kill (max +100%)', positive: true },
            { text: '+2% Speed per kill (max +40%)', positive: true },
            { text: 'Bonuses reset on taking damage', positive: false },
        ],
        ability: { name: 'BLOOD RAGE', desc: 'Kills grant stacking damage (passive)', cooldown: 0, type: 'passive' }
    },
    {
        id: 'pyromaniac',
        name: 'PYROMANIAC',
        category: 'DPS',
        symbol: 'PYR',
        bgColor: 'bg-orange-600',
        accentColor: 'text-orange-400',
        borderColor: 'border-orange-500',
        desc: 'Watch the world burn',
        stats: { health: 85, damage: 8, speed: 5, fireRate: 80, weapon: 'flamethrower' },
        passives: [
            { text: 'Attacks set enemies on fire', positive: true },
            { text: '+50% Damage over time', positive: true },
            { text: 'Immune to fire damage', positive: true },
        ],
        ability: { name: 'INFERNO', desc: 'Create a massive fire explosion', cooldown: 15, type: 'active' }
    },
    {
        id: 'artillery',
        name: 'ARTILLERY',
        category: 'DPS',
        symbol: 'ART',
        bgColor: 'bg-purple-600',
        accentColor: 'text-purple-400',
        borderColor: 'border-purple-500',
        desc: 'Explosive specialist',
        stats: { health: 100, damage: 20, speed: 4.5, fireRate: 300, weapon: 'rocket' },
        passives: [
            { text: '+100% Explosion Radius', positive: true },
            { text: '+50% Explosion Damage', positive: true },
            { text: '-25% Movement Speed', positive: false },
        ],
        ability: { name: 'BOMBARDMENT', desc: 'Call down 5 explosive strikes', cooldown: 20, type: 'active' }
    },
    {
        id: 'commando',
        name: 'COMMANDO',
        category: 'DPS',
        symbol: 'CMD',
        bgColor: 'bg-green-700',
        accentColor: 'text-green-400',
        borderColor: 'border-green-600',
        desc: 'Tactical precision',
        stats: { health: 95, damage: 14, speed: 5.5, fireRate: 110, weapon: 'burst' },
        passives: [
            { text: '+40% Headshot damage', positive: true },
            { text: '+20% Fire Rate', positive: true },
            { text: '+15% Accuracy', positive: true },
        ],
        ability: { name: 'TACTICAL RELOAD', desc: 'Instant reload + 50% damage for 3s', cooldown: 8, type: 'active' }
    },
    {
        id: 'reaper',
        name: 'REAPER',
        category: 'DPS',
        symbol: 'RPR',
        bgColor: 'bg-gray-800',
        accentColor: 'text-gray-400',
        borderColor: 'border-gray-600',
        desc: 'Executioner of the weak',
        stats: { health: 75, damage: 16, speed: 6, fireRate: 140, weapon: 'shotgun' },
        passives: [
            { text: '+100% Damage to enemies below 25% HP', positive: true },
            { text: 'Kills reset ability cooldown', positive: true },
            { text: '-25% Max Health', positive: false },
        ],
        ability: { name: 'EXECUTE', desc: 'Instantly kill enemies below 15% HP', cooldown: 10, type: 'active' }
    },

    // ===== ASSASSIN CLASSES =====
    {
        id: 'assassin',
        name: 'ASSASSIN',
        category: 'ASSASSIN',
        symbol: 'ASN',
        bgColor: 'bg-indigo-600',
        accentColor: 'text-indigo-400',
        borderColor: 'border-indigo-500',
        desc: 'Strike from the shadows',
        stats: { health: 60, damage: 18, speed: 7, fireRate: 100, weapon: 'pistol' },
        passives: [
            { text: '+100% Damage from behind', positive: true },
            { text: '+40% Movement Speed', positive: true },
            { text: '-40% Max Health', positive: false },
        ],
        ability: { name: 'SHADOW STRIKE', desc: 'Teleport behind nearest enemy', cooldown: 8, type: 'active' }
    },
    {
        id: 'ninja',
        name: 'NINJA',
        category: 'ASSASSIN',
        symbol: 'NIN',
        bgColor: 'bg-gray-700',
        accentColor: 'text-gray-400',
        borderColor: 'border-gray-500',
        desc: 'Master of stealth',
        stats: { health: 65, damage: 14, speed: 7, fireRate: 120, weapon: 'pistol' },
        passives: [
            { text: '+35% Evasion Chance', positive: true },
            { text: 'Become invisible when not shooting', positive: true },
            { text: '-35% Max Health', positive: false },
        ],
        ability: { name: 'SMOKE BOMB', desc: 'Vanish and confuse enemies for 3s', cooldown: 10, type: 'active' }
    },
    {
        id: 'hunter',
        name: 'HUNTER',
        category: 'ASSASSIN',
        symbol: 'HNT',
        bgColor: 'bg-emerald-700',
        accentColor: 'text-emerald-400',
        borderColor: 'border-emerald-600',
        desc: 'Tracker of prey',
        stats: { health: 80, damage: 16, speed: 6, fireRate: 150, weapon: 'pistol' },
        passives: [
            { text: 'Mark enemies for +50% damage', positive: true },
            { text: '+25% Damage to marked targets', positive: true },
            { text: 'Marks spread on kill', positive: true },
        ],
        ability: { name: 'HUNTER\'S MARK', desc: 'Mark all visible enemies', cooldown: 15, type: 'active' }
    },
    {
        id: 'shade',
        name: 'SHADE',
        category: 'ASSASSIN',
        symbol: 'SHD',
        bgColor: 'bg-violet-800',
        accentColor: 'text-violet-400',
        borderColor: 'border-violet-600',
        desc: 'One with darkness',
        stats: { health: 55, damage: 20, speed: 6.5, fireRate: 160, weapon: 'pistol' },
        passives: [
            { text: '+80% Damage from stealth', positive: true },
            { text: 'Kills extend invisibility', positive: true },
            { text: '-45% Max Health', positive: false },
        ],
        ability: { name: 'SHADOW WALK', desc: 'Enter stealth for 5s, next hit crits', cooldown: 12, type: 'active' }
    },

    // ===== SUPPORT/UTILITY CLASSES =====
    {
        id: 'vampire',
        name: 'VAMPIRE',
        category: 'SUPPORT',
        symbol: 'VMP',
        bgColor: 'bg-red-800',
        accentColor: 'text-red-400',
        borderColor: 'border-red-700',
        desc: 'Drain life from enemies',
        stats: { health: 80, damage: 10, speed: 5.5, fireRate: 160, weapon: 'pistol' },
        passives: [
            { text: '+20% Lifesteal', positive: true },
            { text: 'Heal on kill', positive: true },
            { text: 'No natural health regen', positive: false },
        ],
        ability: { name: 'BLOOD DRAIN', desc: 'Drain all nearby enemies, healing you', cooldown: 12, type: 'active' }
    },
    {
        id: 'engineer',
        name: 'ENGINEER',
        category: 'SUPPORT',
        symbol: 'ENG',
        bgColor: 'bg-yellow-600',
        accentColor: 'text-yellow-400',
        borderColor: 'border-yellow-500',
        desc: 'Build your army',
        stats: { health: 100, damage: 8, speed: 4.5, fireRate: 180, weapon: 'pistol' },
        passives: [
            { text: 'Start with 2 drones', positive: true },
            { text: '+50% Drone damage', positive: true },
            { text: '-20% Personal damage', positive: false },
        ],
        ability: { name: 'DEPLOY TURRET', desc: 'Place an auto-targeting turret', cooldown: 18, type: 'active' }
    },
    {
        id: 'medic',
        name: 'MEDIC',
        category: 'SUPPORT',
        symbol: 'MED',
        bgColor: 'bg-pink-500',
        accentColor: 'text-pink-400',
        borderColor: 'border-pink-400',
        desc: 'Sustain specialist',
        stats: { health: 110, damage: 7, speed: 5, fireRate: 160, weapon: 'pistol' },
        passives: [
            { text: '+100% Health Regeneration', positive: true },
            { text: '+30% Max Health', positive: true },
            { text: '-30% Damage dealt', positive: false },
        ],
        ability: { name: 'HEAL PULSE', desc: 'Instantly heal 40% of max health', cooldown: 12, type: 'active' }
    },
    {
        id: 'alchemist',
        name: 'ALCHEMIST',
        category: 'SUPPORT',
        symbol: 'ALC',
        bgColor: 'bg-lime-600',
        accentColor: 'text-lime-400',
        borderColor: 'border-lime-500',
        desc: 'Master of potions',
        stats: { health: 90, damage: 9, speed: 5, fireRate: 170, weapon: 'acid' },
        passives: [
            { text: 'Attacks apply random debuffs', positive: true },
            { text: '+40% Status effect duration', positive: true },
            { text: 'Can heal with ability', positive: true },
        ],
        ability: { name: 'ELIXIR', desc: 'Throw healing/damage potion', cooldown: 10, type: 'active' }
    },

    // ===== LUCK/GAMBLE CLASSES =====
    {
        id: 'lucky',
        name: 'LUCKY',
        category: 'LUCK',
        symbol: 'LCK',
        bgColor: 'bg-green-500',
        accentColor: 'text-green-400',
        borderColor: 'border-green-400',
        desc: 'Fortune favors the bold',
        stats: { health: 90, damage: 10, speed: 5.5, fireRate: 150, weapon: 'pistol' },
        passives: [
            { text: '+30% Chance for double damage', positive: true },
            { text: '+25% Better upgrade rolls', positive: true },
            { text: '+15% Dodge chance', positive: true },
        ],
        ability: { name: 'LUCKY ROLL', desc: 'Random powerful effect (passive)', cooldown: 0, type: 'passive' }
    },
    {
        id: 'gambler',
        name: 'GAMBLER',
        category: 'LUCK',
        symbol: 'GMB',
        bgColor: 'bg-yellow-500',
        accentColor: 'text-yellow-400',
        borderColor: 'border-yellow-400',
        desc: 'High risk, high reward',
        stats: { health: 85, damage: 12, speed: 5, fireRate: 140, weapon: 'pistol' },
        passives: [
            { text: 'Damage varies from 50% to 300%', positive: true },
            { text: '+50% Score multiplier', positive: true },
            { text: 'Can randomly take self-damage', positive: false },
        ],
        ability: { name: 'ALL IN', desc: 'Double or nothing on next 10 shots', cooldown: 15, type: 'active' }
    },
    {
        id: 'trickster',
        name: 'TRICKSTER',
        category: 'LUCK',
        symbol: 'TRK',
        bgColor: 'bg-fuchsia-600',
        accentColor: 'text-fuchsia-400',
        borderColor: 'border-fuchsia-500',
        desc: 'Chaos incarnate',
        stats: { health: 80, damage: 11, speed: 6, fireRate: 145, weapon: 'pistol' },
        passives: [
            { text: 'Random weapon each wave', positive: true },
            { text: '+20% All stats randomly', positive: true },
            { text: 'Stats change every 30s', positive: false },
        ],
        ability: { name: 'WILD CARD', desc: 'Trigger a random ability', cooldown: 8, type: 'active' }
    },

    // ===== HYBRID/SPECIAL CLASSES =====
    {
        id: 'paladin',
        name: 'PALADIN',
        category: 'HYBRID',
        symbol: 'PAL',
        bgColor: 'bg-yellow-400',
        accentColor: 'text-yellow-300',
        borderColor: 'border-yellow-300',
        desc: 'Holy warrior',
        stats: { health: 120, damage: 11, speed: 5, fireRate: 170, weapon: 'shotgun' },
        passives: [
            { text: '+20% Max Health', positive: true },
            { text: '+20% Damage', positive: true },
            { text: 'Heal nearby on kill', positive: true },
        ],
        ability: { name: 'DIVINE SHIELD', desc: 'Block all damage for 2s, then heal', cooldown: 16, type: 'active' }
    },
    {
        id: 'necromancer',
        name: 'NECROMANCER',
        category: 'HYBRID',
        symbol: 'NEC',
        bgColor: 'bg-purple-800',
        accentColor: 'text-purple-400',
        borderColor: 'border-purple-700',
        desc: 'Command the dead',
        stats: { health: 70, damage: 8, speed: 4.5, fireRate: 200, weapon: 'pistol' },
        passives: [
            { text: 'Killed enemies become allies', positive: true },
            { text: '+5% of enemy HP as minion', positive: true },
            { text: '-30% Max Health', positive: false },
        ],
        ability: { name: 'RAISE DEAD', desc: 'Revive all recent kills as minions', cooldown: 25, type: 'active' }
    },
    {
        id: 'elemental',
        name: 'ELEMENTAL',
        category: 'HYBRID',
        symbol: 'ELE',
        bgColor: 'bg-gradient-to-r from-blue-500 to-red-500',
        accentColor: 'text-cyan-400',
        borderColor: 'border-cyan-400',
        desc: 'Master of elements',
        stats: { health: 85, damage: 12, speed: 5, fireRate: 160, weapon: 'pistol' },
        passives: [
            { text: 'Attacks randomly burn, freeze, or shock', positive: true },
            { text: '+30% Status effect duration', positive: true },
        ],
        ability: { name: 'ELEMENTAL BURST', desc: 'Unleash all elements at once', cooldown: 14, type: 'active' }
    },
    {
        id: 'titan',
        name: 'TITAN',
        category: 'HYBRID',
        symbol: 'TTN',
        bgColor: 'bg-stone-600',
        accentColor: 'text-stone-400',
        borderColor: 'border-stone-500',
        desc: 'Grow stronger over time',
        stats: { health: 100, damage: 8, speed: 4, fireRate: 180, weapon: 'minigun' },
        passives: [
            { text: '+1% All stats per wave', positive: true },
            { text: '+5 Max HP per wave', positive: true },
            { text: 'Starts weaker than others', positive: false },
        ],
        ability: { name: 'TITAN\'S GROWTH', desc: 'Permanently grow stronger (passive)', cooldown: 0, type: 'passive' }
    },
    {
        id: 'glass_cannon',
        name: 'GLASS CANNON',
        category: 'HYBRID',
        symbol: 'GLS',
        bgColor: 'bg-pink-400',
        accentColor: 'text-pink-300',
        borderColor: 'border-pink-300',
        desc: 'Maximum damage, zero defense',
        stats: { health: 40, damage: 30, speed: 5, fireRate: 100, weapon: 'pistol' },
        passives: [
            { text: '+200% Damage', positive: true },
            { text: '+50% Fire Rate', positive: true },
            { text: '-60% Max Health', positive: false },
            { text: 'Die in one hit from bosses', positive: false },
        ],
        ability: { name: 'OVERLOAD', desc: '+100% damage for 5s, then stunned', cooldown: 20, type: 'active' }
    },
    {
        id: 'rogue',
        name: 'ROGUE',
        category: 'HYBRID',
        symbol: 'ROG',
        bgColor: 'bg-teal-600',
        accentColor: 'text-teal-400',
        borderColor: 'border-teal-500',
        desc: 'Opportunistic striker',
        stats: { health: 75, damage: 14, speed: 6.5, fireRate: 130, weapon: 'pistol' },
        passives: [
            { text: '+50% Damage to slowed enemies', positive: true },
            { text: '+30% Movement Speed', positive: true },
            { text: 'Attacks apply slow', positive: true },
        ],
        ability: { name: 'CHEAP SHOT', desc: 'Next hit stuns and deals 3x damage', cooldown: 8, type: 'active' }
    },
    {
        id: 'chrono',
        name: 'CHRONOMANCER',
        category: 'HYBRID',
        symbol: 'CHR',
        bgColor: 'bg-blue-700',
        accentColor: 'text-blue-400',
        borderColor: 'border-blue-600',
        desc: 'Master of time',
        stats: { health: 75, damage: 11, speed: 5.5, fireRate: 155, weapon: 'pistol' },
        passives: [
            { text: 'Time slow lasts 50% longer', positive: true },
            { text: '+20% Speed during time slow', positive: true },
            { text: '-25% Max Health', positive: false },
        ],
        ability: { name: 'TIME STOP', desc: 'Freeze all enemies for 3s', cooldown: 25, type: 'active' }
    },
    {
        id: 'warden',
        name: 'WARDEN',
        category: 'HYBRID',
        symbol: 'WRD',
        bgColor: 'bg-emerald-600',
        accentColor: 'text-emerald-400',
        borderColor: 'border-emerald-500',
        desc: 'Nature\'s defender',
        stats: { health: 110, damage: 9, speed: 5, fireRate: 165, weapon: 'pistol' },
        passives: [
            { text: '+10% Max Health', positive: true },
            { text: 'Thorns damage attackers', positive: true },
            { text: 'Regenerate while standing still', positive: true },
        ],
        ability: { name: 'ENTANGLE', desc: 'Root all nearby enemies', cooldown: 14, type: 'active' }
    },
    {
        id: 'harbinger',
        name: 'HARBINGER',
        category: 'HYBRID',
        symbol: 'HRB',
        bgColor: 'bg-gray-900',
        accentColor: 'text-gray-300',
        borderColor: 'border-gray-700',
        desc: 'Bringer of doom',
        stats: { health: 65, damage: 22, speed: 5, fireRate: 180, weapon: 'pistol' },
        passives: [
            { text: 'Enemies explode on death', positive: true },
            { text: '+60% Damage', positive: true },
            { text: '-35% Max Health', positive: false },
            { text: 'Explosions can hurt you', positive: false },
        ],
        ability: { name: 'DOOM', desc: 'Mark enemy to explode violently', cooldown: 10, type: 'active' }
    },
];

const CATEGORIES = ['ALL', 'TANK', 'SPEED', 'DPS', 'ASSASSIN', 'SUPPORT', 'LUCK', 'HYBRID'];

export default function ClassSelection({ onSelect, onSandbox }) {
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [hoveredIndex, setHoveredIndex] = useState(null);
    const [category, setCategory] = useState('ALL');
    const [searchTerm, setSearchTerm] = useState('');

    const filteredClasses = CLASSES.filter(cls => {
        const matchesCategory = category === 'ALL' || cls.category === category;
        const matchesSearch = cls.name.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    useEffect(() => {
        const handleKeyboard = (e) => {
            const cols = 6;

            if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
                setSelectedIndex(prev => Math.max(0, prev - 1));
            } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
                setSelectedIndex(prev => Math.min(filteredClasses.length - 1, prev + 1));
            } else if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
                const newIndex = selectedIndex - cols;
                if (newIndex >= 0) setSelectedIndex(newIndex);
            } else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') {
                const newIndex = selectedIndex + cols;
                if (newIndex < filteredClasses.length) setSelectedIndex(newIndex);
            } else if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                if (filteredClasses[selectedIndex]) {
                    onSelect(filteredClasses[selectedIndex]);
                }
            }
        };

        window.addEventListener('keydown', handleKeyboard);
        return () => window.removeEventListener('keydown', handleKeyboard);
    }, [selectedIndex, filteredClasses, onSelect]);

    // Reset selection when filter changes
    useEffect(() => {
        setSelectedIndex(0);
    }, [category, searchTerm]);

    const displayIndex = hoveredIndex !== null ? hoveredIndex : selectedIndex;
    const selectedClass = filteredClasses[displayIndex] || filteredClasses[0];

    return (
        <div className="absolute inset-0 flex flex-col z-30 bg-[#0a0a0f] overflow-hidden">
            {/* Header */}
            <div className="bg-[#12121a] border-b-2 border-[#2a2a3a] px-6 py-4">
                <div className="flex items-center justify-between max-w-7xl mx-auto">
                    <div>
                        <h1 className="text-3xl font-black text-white tracking-wider">SELECT CHARACTER</h1>
                        <p className="text-gray-500 text-sm">{filteredClasses.length} characters available</p>
                    </div>
                    <div className="flex items-center gap-4">
                        {/* Search */}
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-[#1a1a24] border border-[#3a3a4a] px-3 py-2 text-white text-sm focus:outline-none focus:border-cyan-500 w-40"
                        />
                        {/* Sandbox Button */}
                        {onSandbox && (
                            <button
                                onClick={onSandbox}
                                className="bg-purple-600/20 border-2 border-purple-500 text-purple-400 px-4 py-2 font-bold text-sm hover:bg-purple-600 hover:text-white transition-colors"
                            >
                                SANDBOX MODE
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Category Tabs */}
            <div className="bg-[#0d0d14] border-b border-[#2a2a3a] px-6 py-2">
                <div className="flex gap-1 max-w-7xl mx-auto">
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setCategory(cat)}
                            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors ${
                                category === cat
                                    ? 'bg-cyan-500/20 text-cyan-400 border-b-2 border-cyan-500'
                                    : 'text-gray-500 hover:text-gray-300'
                            }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Main Content */}
            <div className="flex flex-1 overflow-hidden">
                {/* Character Grid */}
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="grid grid-cols-6 gap-2 max-w-4xl">
                        {filteredClasses.map((cls, index) => {
                            const isSelected = index === selectedIndex;
                            const isHovered = index === hoveredIndex;

                            return (
                                <motion.button
                                    key={cls.id}
                                    onClick={() => {
                                        setSelectedIndex(index);
                                        onSelect(cls);
                                    }}
                                    onMouseEnter={() => setHoveredIndex(index)}
                                    onMouseLeave={() => setHoveredIndex(null)}
                                    whileTap={{ scale: 0.95 }}
                                    className={`
                                        relative aspect-square flex flex-col items-center justify-center
                                        border-2 transition-all duration-150 p-1
                                        ${isSelected
                                            ? 'border-yellow-400 shadow-[0_0_20px_rgba(250,204,21,0.4)] z-10'
                                            : isHovered
                                                ? 'border-gray-500 bg-[#1a1a24]'
                                                : 'border-[#2a2a3a] bg-[#12121a] hover:border-gray-600'
                                        }
                                    `}
                                >
                                    {/* Character Symbol */}
                                    <div className={`
                                        w-10 h-10 flex items-center justify-center
                                        ${cls.bgColor} text-white font-black text-xs
                                        ${isSelected ? '' : 'opacity-80'}
                                    `}>
                                        {cls.symbol}
                                    </div>
                                    {/* Character Name */}
                                    <div className={`
                                        text-[9px] font-bold mt-1 text-center leading-tight
                                        ${isSelected ? 'text-yellow-400' : 'text-gray-400'}
                                    `}>
                                        {cls.name}
                                    </div>
                                    {/* Category indicator */}
                                    <div className={`absolute top-0.5 right-0.5 w-2 h-2 rounded-full ${cls.bgColor}`} />
                                </motion.button>
                            );
                        })}
                    </div>

                    <p className="text-gray-600 text-xs mt-4 text-center">
                        WASD / Arrow Keys to navigate | Enter / Space to select | Click to pick
                    </p>
                </div>

                {/* Character Info Panel */}
                <div className="w-96 bg-[#12121a] border-l-2 border-[#2a2a3a] overflow-y-auto">
                    {selectedClass && (
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={selectedClass.id}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.15 }}
                                className="p-6"
                            >
                                {/* Header */}
                                <div className="flex items-center gap-4 mb-6 pb-4 border-b border-[#2a2a3a]">
                                    <div className={`w-16 h-16 flex items-center justify-center ${selectedClass.bgColor} text-white font-black text-2xl`}>
                                        {selectedClass.symbol}
                                    </div>
                                    <div>
                                        <h2 className={`text-2xl font-black ${selectedClass.accentColor}`}>
                                            {selectedClass.name}
                                        </h2>
                                        <div className="flex items-center gap-2">
                                            <span className={`text-xs px-2 py-0.5 ${selectedClass.bgColor} text-white font-bold`}>
                                                {selectedClass.category}
                                            </span>
                                            <span className="text-gray-500 text-sm">{selectedClass.desc}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Stats */}
                                <div className="grid grid-cols-2 gap-2 mb-6">
                                    <div className="bg-[#0a0a0f] border border-[#2a2a3a] p-3">
                                        <div className="text-gray-500 text-[10px] uppercase tracking-wider">Health</div>
                                        <div className="text-white font-black text-xl">{selectedClass.stats.health}</div>
                                        <div className="h-1 bg-[#2a2a3a] mt-1">
                                            <div className="h-full bg-red-500" style={{ width: `${Math.min(100, selectedClass.stats.health / 2.5)}%` }} />
                                        </div>
                                    </div>
                                    <div className="bg-[#0a0a0f] border border-[#2a2a3a] p-3">
                                        <div className="text-gray-500 text-[10px] uppercase tracking-wider">Damage</div>
                                        <div className="text-white font-black text-xl">{selectedClass.stats.damage}</div>
                                        <div className="h-1 bg-[#2a2a3a] mt-1">
                                            <div className="h-full bg-orange-500" style={{ width: `${Math.min(100, selectedClass.stats.damage * 3)}%` }} />
                                        </div>
                                    </div>
                                    <div className="bg-[#0a0a0f] border border-[#2a2a3a] p-3">
                                        <div className="text-gray-500 text-[10px] uppercase tracking-wider">Speed</div>
                                        <div className="text-white font-black text-xl">{selectedClass.stats.speed}</div>
                                        <div className="h-1 bg-[#2a2a3a] mt-1">
                                            <div className="h-full bg-green-500" style={{ width: `${Math.min(100, selectedClass.stats.speed * 10)}%` }} />
                                        </div>
                                    </div>
                                    <div className="bg-[#0a0a0f] border border-[#2a2a3a] p-3">
                                        <div className="text-gray-500 text-[10px] uppercase tracking-wider">Weapon</div>
                                        <div className="text-white font-bold text-sm uppercase">{selectedClass.stats.weapon}</div>
                                    </div>
                                </div>

                                {/* Passives */}
                                <div className="mb-6">
                                    <div className="text-gray-500 text-xs uppercase tracking-wider mb-2">Passives</div>
                                    <div className="space-y-1">
                                        {selectedClass.passives.map((passive, idx) => (
                                            <div
                                                key={idx}
                                                className={`text-sm font-medium flex items-center gap-2 ${
                                                    passive.positive ? 'text-green-400' : 'text-red-400'
                                                }`}
                                            >
                                                <span className={`w-4 h-4 flex items-center justify-center text-xs ${
                                                    passive.positive ? 'bg-green-500/20' : 'bg-red-500/20'
                                                }`}>
                                                    {passive.positive ? '+' : '-'}
                                                </span>
                                                {passive.text}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Ability */}
                                <div className={`border-2 ${selectedClass.borderColor} bg-[#0a0a0f] p-4 mb-6`}>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className={`text-lg font-black ${selectedClass.accentColor}`}>
                                            {selectedClass.ability.name}
                                        </span>
                                        <span className={`text-[10px] px-2 py-1 font-bold uppercase ${
                                            selectedClass.ability.type === 'passive'
                                                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/50'
                                                : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/50'
                                        }`}>
                                            {selectedClass.ability.type === 'passive' ? 'PASSIVE' : 'SPACE'}
                                        </span>
                                    </div>
                                    <p className="text-gray-400 text-sm">{selectedClass.ability.desc}</p>
                                    {selectedClass.ability.cooldown > 0 && (
                                        <p className="text-gray-600 text-xs mt-2">Cooldown: {selectedClass.ability.cooldown}s</p>
                                    )}
                                </div>

                                {/* Select Button */}
                                <button
                                    onClick={() => onSelect(selectedClass)}
                                    className={`w-full ${selectedClass.bgColor} hover:brightness-110 text-white font-black text-lg py-4 uppercase tracking-wider transition-all`}
                                >
                                    SELECT {selectedClass.name}
                                </button>
                            </motion.div>
                        </AnimatePresence>
                    )}
                </div>
            </div>
        </div>
    );
}

export { CLASSES };
