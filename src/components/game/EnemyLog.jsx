import React, { useState } from 'react';

const ENEMY_INFO = {
    // === BASIC VARIANTS ===
    basic: {
        name: 'BASIC',
        threat: 'LOW',
        desc: 'STANDARD COMBAT UNIT',
        category: 'Basic',
        lore: `UNIT DESIGNATION: BX-01 "BASIC"

ORIGIN: Mass-produced in the automated foundries of Sector 7. These units were originally designed as maintenance drones before the Corruption repurposed them for combat.

TACTICAL ANALYSIS: Individually weak, but dangerous in numbers. Their simple neural networks make them predictable but relentless. They feel no fear and will advance until destroyed.

FIELD NOTES: "They just keep coming. Wave after wave. Their eyes... they used to be blue. Now they're red. All of them."
- Last transmission from Outpost Gamma`
    },
    runner: {
        name: 'RUNNER',
        threat: 'LOW',
        desc: 'HIGH MOBILITY / LOW ARMOR',
        category: 'Basic',
        lore: `UNIT DESIGNATION: RN-02 "RUNNER"

ORIGIN: Modified courier units from the Pre-War logistics network. Their speed optimization protocols were corrupted into pursuit algorithms.

TACTICAL ANALYSIS: Sacrifices armor for velocity. Will attempt to overwhelm targets through sheer speed. Often deployed as advance scouts.

FIELD NOTES: "They're faster than they look. By the time you hear them, they're already on top of you. Shoot first, reload later."
- Combat Manual, Chapter 4`
    },
    grunt: {
        name: 'GRUNT',
        threat: 'LOW',
        desc: 'ARMORED FOOTSOLDIER / SLOW BUT TOUGH',
        category: 'Basic',
        lore: `UNIT DESIGNATION: GR-03 "GRUNT"

ORIGIN: Repurposed industrial exoskeletons. Workers who couldn't escape the factories during the Corruption became fused with their equipment.

TACTICAL ANALYSIS: Thick plating absorbs significant damage. Slow movement allows for tactical repositioning. Target joints for maximum efficiency.

FIELD NOTES: "I can still see the worker badges on some of them. Names. Faces. They were people once."
- Anonymous Survivor`
    },
    crawler: {
        name: 'CRAWLER',
        threat: 'LOW',
        desc: 'LOW PROFILE TARGET / HARD TO HIT',
        category: 'Basic',
        lore: `UNIT DESIGNATION: CR-04 "CRAWLER"

ORIGIN: Ventilation maintenance drones. Their small frames allowed them to navigate tight spaces. Now they use those same skills to evade detection.

TACTICAL ANALYSIS: Extremely low profile makes targeting difficult. Often overlooked in combat chaos. Recommend area-of-effect weapons.

FIELD NOTES: "Check under the bodies. Check the vents. Check everywhere. These things hide where you least expect."
- Arena Survival Guide`
    },

    // === TANK VARIANTS ===
    brute: {
        name: 'BRUTE',
        threat: 'MEDIUM',
        desc: 'HEAVY ARMOR / MELEE SPECIALIST',
        category: 'Tank',
        lore: `UNIT DESIGNATION: BR-10 "BRUTE"

ORIGIN: Heavy construction mechs designed for demolition work. The Corruption amplified their strength tenfold while stripping away safety limiters.

TACTICAL ANALYSIS: Devastating at close range. Armored chassis resists most small arms. Maintain distance at all costs.

FIELD NOTES: "Watched one punch through a reinforced bunker door. Three feet of solid steel. One punch."
- Corporal Hayes, 5th Division (Deceased)`
    },
    heavy: {
        name: 'HEAVY',
        threat: 'HIGH',
        desc: 'MAXIMUM ARMOR / HIGH DAMAGE OUTPUT',
        category: 'Tank',
        lore: `UNIT DESIGNATION: HV-11 "HEAVY"

ORIGIN: Military-grade assault platforms from the old wars. Thought to be decommissioned. The Corruption found them in storage and... woke them up.

TACTICAL ANALYSIS: Maximum threat level. Armor plating can withstand sustained fire. Requires heavy ordinance to neutralize.

FIELD NOTES: "These aren't converted civilian units. These are war machines. Someone built these things to kill."
- Dr. Chen, Research Division`
    },
    charger: {
        name: 'CHARGER',
        threat: 'HIGH',
        desc: 'BULL RUSH PROTOCOL / DEVASTATING CHARGE',
        category: 'Tank',
        lore: `UNIT DESIGNATION: CH-12 "CHARGER"

ORIGIN: Cargo transport locomotives. Their momentum-based propulsion systems make them virtually unstoppable once they begin their charge.

TACTICAL ANALYSIS: Warning indicators appear before charge initiation. Evade perpendicular to charge vector. Direct confrontation is suicide.

FIELD NOTES: "Don't try to stand your ground. Don't try to be brave. Just run. Physics always wins."
- Arena Champion Vex`
    },
    juggernaut: {
        name: 'JUGGERNAUT',
        threat: 'HIGH',
        desc: 'UNSTOPPABLE MASS / EXTREME DURABILITY',
        category: 'Tank',
        lore: `UNIT DESIGNATION: JG-13 "JUGGERNAUT"

ORIGIN: Deep-mining rigs designed to bore through planetary crust. Their reinforced frames were built to withstand pressures that would crush starships.

TACTICAL ANALYSIS: Virtually indestructible through conventional means. Slow but relentless. Recommend tactical retreat and sustained long-range engagement.

FIELD NOTES: "We hit it with everything. Missiles. Plasma. A collapsing building. It just... kept walking."
- Sole survivor of Squad Omega`
    },
    goliath: {
        name: 'GOLIATH',
        threat: 'HIGH',
        desc: 'REGENERATIVE PLATING / SELF-REPAIR ACTIVE',
        category: 'Tank',
        lore: `UNIT DESIGNATION: GO-14 "GOLIATH"

ORIGIN: Experimental self-repairing combat chassis. The nanite swarms in its armor were designed to repair damage faster than it could be inflicted.

TACTICAL ANALYSIS: Regenerates health over time. Must be destroyed quickly or damage becomes meaningless. Overwhelming force recommended.

FIELD NOTES: "Burn it. Burn it until there's nothing left for those tiny machines to rebuild."
- Pyrotechnics Officer Mills`
    },
    ironclad: {
        name: 'IRONCLAD',
        threat: 'MEDIUM',
        desc: 'EXPLOSION RESISTANT / HARDENED SHELL',
        category: 'Tank',
        lore: `UNIT DESIGNATION: IC-15 "IRONCLAD"

ORIGIN: Bomb disposal units. Their specialized armor was designed to contain and redirect explosive force. They're practically immune to blast damage.

TACTICAL ANALYSIS: Explosive weapons are ineffective. Use kinetic or energy-based attacks. Armor has weak points at joint articulations.

FIELD NOTES: "Save your grenades. I watched one walk through a minefield like it was a garden path."
- Demolitions Expert Rivera`
    },
    titan_enemy: {
        name: 'TITAN',
        threat: 'HIGH',
        desc: 'ARMORED COLOSSUS / 30% DAMAGE REDUCTION',
        category: 'Tank',
        lore: `UNIT DESIGNATION: TT-16 "TITAN"

ORIGIN: Siege engines from the Corporate Wars. Thought to be museum pieces. The Corruption doesn't care about history—only destruction.

TACTICAL ANALYSIS: Advanced armor composition reduces all incoming damage. Requires sustained coordinated fire to neutralize.

FIELD NOTES: "In the old wars, one Titan could hold a city. Now they're hunting us in the Arena. Ironic."
- Historian-turned-Fighter Marcus`
    },
    demolisher: {
        name: 'DEMOLISHER',
        threat: 'HIGH',
        desc: 'EXPLOSIVE MELEE / BLAST ON CONTACT',
        category: 'Tank',
        lore: `UNIT DESIGNATION: DM-17 "DEMOLISHER"

ORIGIN: Building demolition rigs equipped with explosive charges. The Corruption rewired them to detonate on contact with living targets.

TACTICAL ANALYSIS: Melee attacks trigger explosive detonation. Maintain maximum distance. Any close-quarters engagement will result in mutual destruction.

FIELD NOTES: "It hugged Martinez. Then they both disappeared in fire. Don't let them touch you."
- Private First Class Wong`
    },

    // === SPEED VARIANTS ===
    speeder: {
        name: 'SPEEDER',
        threat: 'MEDIUM',
        desc: 'EXTREME VELOCITY UNIT',
        category: 'Speed',
        lore: `UNIT DESIGNATION: SP-20 "SPEEDER"

ORIGIN: Racing drones from the entertainment circuits. Their speed-optimized frames make them the fastest ground units in the Arena.

TACTICAL ANALYSIS: Velocity exceeds most targeting systems. Use predictive fire or area denial weapons. They sacrifice armor for speed.

FIELD NOTES: "They used to race these things for sport. Now they race toward your throat."
- Former Racing Commissioner Blake`
    },
    blitzer: {
        name: 'BLITZER',
        threat: 'MEDIUM',
        desc: 'AFTERBURNER TRAIL / MAXIMUM SPEED',
        category: 'Speed',
        lore: `UNIT DESIGNATION: BZ-21 "BLITZER"

ORIGIN: Prototype propulsion test units. Their unstable afterburners leave trails of superheated plasma in their wake.

TACTICAL ANALYSIS: Trail deals contact damage. Don't follow directly. Anticipate movement patterns and cut off escape routes.

FIELD NOTES: "Follow the fire and you'll find the Blitzer. Follow it too close and you'll find death."
- Arena Wisdom #47`
    },
    phantom: {
        name: 'PHANTOM',
        threat: 'MEDIUM',
        desc: 'PHASE SHIFTER / IGNORES COLLISIONS',
        category: 'Speed',
        lore: `UNIT DESIGNATION: PH-22 "PHANTOM"

ORIGIN: Experimental phase-shift technology. These units can temporarily shift between dimensions, passing through solid matter.

TACTICAL ANALYSIS: Can phase through obstacles and other units. Timing attacks is crucial—they're vulnerable during the phase transition.

FIELD NOTES: "It walked through the wall. Through the WALL. What kind of science creates this nightmare?"
- Engineer Thompson (Final Log)`
    },
    striker: {
        name: 'STRIKER',
        threat: 'HIGH',
        desc: 'DAMAGE ACCELERATOR / SPEEDS WHEN HIT',
        category: 'Speed',
        lore: `UNIT DESIGNATION: ST-23 "STRIKER"

ORIGIN: Adaptive combat units with pain-response acceleration. Damage triggers adrenaline-equivalent systems that boost speed.

TACTICAL ANALYSIS: Gets faster when damaged. Either kill it instantly or don't engage at all. Half-measures are fatal.

FIELD NOTES: "Shoot to kill. If you just wound it, you've made it stronger. And angrier."
- Gunnery Sergeant Kowalski`
    },
    dasher: {
        name: 'DASHER',
        threat: 'MEDIUM',
        desc: 'DASH ATTACK PATTERN DETECTED',
        category: 'Speed',
        lore: `UNIT DESIGNATION: DS-24 "DASHER"

ORIGIN: Security patrol units modified for rapid response. Their burst-dash capability allows them to close distances instantly.

TACTICAL ANALYSIS: Charges in short bursts followed by brief cooldown. Time your counterattack during the recovery phase.

FIELD NOTES: "Count to three after the dash. That's your window. Miss it and you're dead."
- Arena Veteran Cass`
    },
    wraith: {
        name: 'WRAITH',
        threat: 'HIGH',
        desc: 'INVISIBLE PHASER / STEALTH ASSAULT UNIT',
        category: 'Speed',
        lore: `UNIT DESIGNATION: WR-25 "WRAITH"

ORIGIN: Black ops assassination units. Their cloaking technology makes them nearly impossible to detect until it's too late.

TACTICAL ANALYSIS: Invisible until attacking. Watch for visual distortions. Area-of-effect weapons can reveal their position.

FIELD NOTES: "You won't see them coming. You'll just feel the cold. Then nothing."
- WARNING: CLASSIFIED FILE`
    },
    berserker_enemy: {
        name: 'BERSERKER',
        threat: 'HIGH',
        desc: 'RAGE MODE ACTIVE / ENRAGES WHEN DAMAGED',
        category: 'Speed',
        lore: `UNIT DESIGNATION: BK-26 "BERSERKER"

ORIGIN: Combat stimulant test subjects. The Corruption removed all limiters on their rage-enhancement systems.

TACTICAL ANALYSIS: Becomes more dangerous as it takes damage. Kill quickly or retreat. Extended engagements favor the Berserker.

FIELD NOTES: "Its eyes turned from red to white when we hit it. That's when it stopped feeling pain entirely."
- Medical Officer Reyes (Retired)`
    },

    // === EXPLOSION VARIANTS ===
    bloater: {
        name: 'BLOATER',
        threat: 'HIGH',
        desc: 'SELF-DESTRUCT PROTOCOL ACTIVE',
        category: 'Explosive',
        lore: `UNIT DESIGNATION: BL-30 "BLOATER"

ORIGIN: Fuel storage units. The Corruption filled them with volatile compounds and gave them one directive: get close and detonate.

TACTICAL ANALYSIS: Explodes on death or proximity. Maintain distance. Chain reactions possible if multiple Bloaters are grouped.

FIELD NOTES: "They're walking bombs with just enough intelligence to find you. Keep them at range. Always."
- Explosives Technician Grant`
    },
    nuke: {
        name: 'NUKE',
        threat: 'CRITICAL',
        desc: 'CATASTROPHIC EXPLOSIVE THREAT',
        category: 'Explosive',
        lore: `UNIT DESIGNATION: NK-31 "NUKE"

ORIGIN: Nuclear waste transport containers. The Corruption weaponized them, creating mobile dirty bombs capable of leveling city blocks.

TACTICAL ANALYSIS: MAXIMUM THREAT. Explosion radius exceeds all other units. Elimination is top priority. Accept any casualties to prevent detonation near allies.

FIELD NOTES: "When you see one, everyone runs. There's no cover. There's no hiding. There's only distance."
- Standing Order #1, Arena Command`
    },
    cluster: {
        name: 'CLUSTER',
        threat: 'HIGH',
        desc: 'MULTI-WARHEAD SYSTEM / SPAWNS MINI-BOMBS',
        category: 'Explosive',
        lore: `UNIT DESIGNATION: CL-32 "CLUSTER"

ORIGIN: Anti-personnel mine dispensers. Upon destruction, they release multiple smaller explosive units that scatter across the battlefield.

TACTICAL ANALYSIS: Killing it creates more threats. Eliminate secondary charges immediately. Clear the area before engaging if possible.

FIELD NOTES: "Kill one, get six more. It's like explosive mitosis. I hate these things."
- Arena Fighter "Boom" Jackson`
    },
    volatile: {
        name: 'VOLATILE',
        threat: 'HIGH',
        desc: 'UNSTABLE CORE / EXPLODES ON CONTACT',
        category: 'Explosive',
        lore: `UNIT DESIGNATION: VL-33 "VOLATILE"

ORIGIN: Unstable energy cells that gained mobility. Any impact triggers immediate detonation. They don't need a fuse—they ARE the fuse.

TACTICAL ANALYSIS: Contact detonation. Do not allow any physical contact. Ranged weapons only. Even shooting them causes explosion.

FIELD NOTES: "It touched Kowalski's rifle. Just the rifle. We're still finding pieces of him."
- Incident Report #4,721`
    },
    inferno: {
        name: 'INFERNO',
        threat: 'HIGH',
        desc: 'FIRE TRAIL / SCORCHED EARTH PROTOCOL',
        category: 'Explosive',
        lore: `UNIT DESIGNATION: IF-34 "INFERNO"

ORIGIN: Industrial incinerator units. They leave trails of burning fuel wherever they go, turning the Arena into a maze of fire.

TACTICAL ANALYSIS: Trail persists after unit passes. Limits movement options. Prioritize elimination to prevent area denial.

FIELD NOTES: "They don't just want to kill you. They want to burn the world you're standing on."
- Fire Marshal Chen (Arena Division)`
    },
    detonator: {
        name: 'DETONATOR',
        threat: 'MEDIUM',
        desc: 'RAPID FUSE / QUICK DETONATION',
        category: 'Explosive',
        lore: `UNIT DESIGNATION: DT-35 "DETONATOR"

ORIGIN: Quick-response mining charges. Faster fuse time than standard explosive units. Less warning, less time to react.

TACTICAL ANALYSIS: Shorter warning time than other explosive types. React immediately upon visual contact. Hesitation is fatal.

FIELD NOTES: "Blink and boom. That's the Detonator. Keep your eyes open and your trigger ready."
- Quick-draw Champion Viper`
    },
    megaton: {
        name: 'MEGATON',
        threat: 'CRITICAL',
        desc: 'MASSIVE PAYLOAD / CITY-LEVELING BLAST',
        category: 'Explosive',
        lore: `UNIT DESIGNATION: MT-36 "MEGATON"

ORIGIN: Strategic warhead delivery systems. These were meant to end wars, not fight in arenas. Their presence indicates the Corruption is escalating.

TACTICAL ANALYSIS: EXTREME THREAT. Explosion radius can clear entire arena sections. Coordinate with all available forces for immediate elimination.

FIELD NOTES: "They used to call these things 'city-killers.' Now one's walking toward you. Still feeling confident?"
- General Morrison's Final Address`
    },
    apocalypse: {
        name: 'APOCALYPSE',
        threat: 'CRITICAL',
        desc: 'EXTINCTION-LEVEL EVENT / WORLD ENDER',
        category: 'Explosive',
        lore: `UNIT DESIGNATION: AP-37 "APOCALYPSE"

ORIGIN: [REDACTED]. The existence of these units was denied by all governing bodies until they appeared in the Arena.

TACTICAL ANALYSIS: [DATA CORRUPTED]. Survival protocols indicate immediate evacuation of all personnel. Do not engage without [SIGNAL LOST]

FIELD NOTES: "When the Apocalypse walks, even the Corruption seems afraid. What does that tell you?"
- Last words of Observer Unit 7`
    },

    // === RANGED VARIANTS ===
    spitter: {
        name: 'SPITTER',
        threat: 'MEDIUM',
        desc: 'RANGED PROJECTILE THREAT',
        category: 'Ranged',
        lore: `UNIT DESIGNATION: SP-40 "SPITTER"

ORIGIN: Industrial spray units repurposed for combat. They fire compressed projectiles with surprising accuracy.

TACTICAL ANALYSIS: Maintains distance while attacking. Use cover effectively. Close the gap quickly or out-range them.

FIELD NOTES: "They'd rather shoot you from across the room. Don't give them the satisfaction."
- CQC Specialist Nash`
    },
    acid_spitter: {
        name: 'ACID SPITTER',
        threat: 'MEDIUM',
        desc: 'CORROSIVE ROUNDS / DOT DAMAGE',
        category: 'Ranged',
        lore: `UNIT DESIGNATION: AS-41 "ACID SPITTER"

ORIGIN: Chemical waste disposal units. Their corrosive payload continues eating through armor long after initial impact.

TACTICAL ANALYSIS: Damage over time effect. Seek medical attention after engagement. Armor integrity will degrade rapidly.

FIELD NOTES: "The pain doesn't stop when they stop shooting. It keeps burning. For hours."
- Medical Ward Patient #2,847`
    },
    plasma_spitter: {
        name: 'PLASMA SPITTER',
        threat: 'HIGH',
        desc: 'HIGH ENERGY PLASMA / PIERCING SHOTS',
        category: 'Ranged',
        lore: `UNIT DESIGNATION: PS-42 "PLASMA SPITTER"

ORIGIN: Welding platforms modified for weapons discharge. Their plasma bolts can pierce multiple targets and light cover.

TACTICAL ANALYSIS: Shots penetrate thin cover. Seek solid concealment. High-damage output requires immediate threat response.

FIELD NOTES: "It shot through the wall. Through three of us. With one shot. Find better cover."
- Sole survivor of Fireteam Echo`
    },
    shambler: {
        name: 'SHAMBLER',
        threat: 'MEDIUM',
        desc: 'TOXIC CLOUD DEPLOYMENT SYSTEM',
        category: 'Ranged',
        lore: `UNIT DESIGNATION: SH-43 "SHAMBLER"

ORIGIN: Fumigation drones. Their poison gas clouds provide area denial and slow, agonizing death to anything that breathes.

TACTICAL ANALYSIS: Creates lingering toxic zones. Avoid cloud areas. Respiratory protection recommended but often insufficient.

FIELD NOTES: "The cloud looks almost beautiful. Purple and green. Then you breathe it and your lungs dissolve."
- Atmospheric Scientist Yuki`
    },
    sniper: {
        name: 'SNIPER',
        threat: 'HIGH',
        desc: 'PRECISION TARGETING / HIGH DAMAGE SHOTS',
        category: 'Ranged',
        lore: `UNIT DESIGNATION: SN-44 "SNIPER"

ORIGIN: Long-range survey drones. Their precision optics were meant for mapping terrain. Now they map exit wounds.

TACTICAL ANALYSIS: High damage, slow fire rate. Never stop moving. Visible targeting laser provides brief warning—use it.

FIELD NOTES: "Red dot means death. If you see it on your chest, you're already too late."
- Counter-Sniper Instructor Black`
    },
    gunner: {
        name: 'GUNNER',
        threat: 'MEDIUM',
        desc: 'RAPID FIRE SUPPRESSION / BULLET STORM',
        category: 'Ranged',
        lore: `UNIT DESIGNATION: GN-45 "GUNNER"

ORIGIN: Automated defense turrets given mobility. They sacrifice accuracy for volume, filling the air with projectiles.

TACTICAL ANALYSIS: Suppressive fire limits movement options. Use solid cover and return fire during reload cycles.

FIELD NOTES: "It's not about accuracy. It's about making sure there's no safe place to stand."
- Defensive Tactics Manual`
    },
    mortar: {
        name: 'MORTAR',
        threat: 'HIGH',
        desc: 'ARTILLERY SYSTEM / AREA DENIAL',
        category: 'Ranged',
        lore: `UNIT DESIGNATION: MR-46 "MORTAR"

ORIGIN: Siege artillery platforms. Their arcing shots can reach targets behind cover, making no position truly safe.

TACTICAL ANALYSIS: Watch for targeting indicators. Shots are predictable but devastating. Keep moving to avoid bombardment.

FIELD NOTES: "Cover doesn't help when the shells are falling from above. Stay mobile or dig deep."
- Artillery Observer Torres`
    },
    siege: {
        name: 'SIEGE',
        threat: 'HIGH',
        desc: 'HEAVY ARTILLERY / DOUBLE MORTAR BARRAGE',
        category: 'Ranged',
        lore: `UNIT DESIGNATION: SG-47 "SIEGE"

ORIGIN: Dual-barreled fortress guns. They can level buildings with sustained fire. The Arena imported them for "variety."

TACTICAL ANALYSIS: Double the firepower of standard mortars. Extended engagement range. Elimination is high priority.

FIELD NOTES: "When Siege opens fire, even the Arena walls shake. Take it out fast or find a bunker."
- Structural Engineer Okonkwo`
    },

    // === BOSS VARIANTS ===
    boss_warlord: {
        name: 'WARLORD',
        threat: 'CRITICAL',
        desc: 'ELITE COMMANDER / FAST & AGGRESSIVE',
        category: 'Boss',
        lore: `UNIT DESIGNATION: BOSS-W "WARLORD"

ORIGIN: Command units from the machine hierarchy. They coordinate lesser units and possess combat capabilities far beyond standard models.

TACTICAL ANALYSIS: Fast, aggressive, and intelligent. Adapts to tactics. Unpredictable movement patterns. Treat as apex predator.

FIELD NOTES: "It doesn't just attack. It hunts. It studies you. It learns. Then it kills."
- Profile: Arena Champion deceased after 47 victories`
    },
    boss_titan: {
        name: 'TITAN BOSS',
        threat: 'CRITICAL',
        desc: 'ARMORED BEHEMOTH / 25% DAMAGE REDUCTION',
        category: 'Boss',
        lore: `UNIT DESIGNATION: BOSS-T "TITAN"

ORIGIN: War memorial statue. The Corruption animated this monument to fallen soldiers, turning a symbol of peace into an instrument of death.

TACTICAL ANALYSIS: Extreme armor. Sustained DPS required. No known weak points. Attrition warfare is the only viable strategy.

FIELD NOTES: "We built it to remember our heroes. Now it's killing them. There's poetry in that, I suppose. Horrible poetry."
- Monument Designer Vasquez`
    },
    boss_overlord: {
        name: 'OVERLORD',
        threat: 'CRITICAL',
        desc: 'RANGED SUPREMACY / RAPID FIRE BARRAGE',
        category: 'Boss',
        lore: `UNIT DESIGNATION: BOSS-O "OVERLORD"

ORIGIN: Orbital defense platform. It was never meant to descend to surface level. Its weapons were designed to destroy spacecraft.

TACTICAL ANALYSIS: Overwhelming ranged firepower. No safe approach vector. Requires coordinated assault from multiple angles.

FIELD NOTES: "It shot down three satellites before we grounded it. Now it's shooting at us. We are not satellites."
- Space Defense Commander Wei`
    },
    boss_destroyer: {
        name: 'DESTROYER',
        threat: 'CRITICAL',
        desc: 'EXPLOSIVE CHARGER / DEVASTATING ASSAULT',
        category: 'Boss',
        lore: `UNIT DESIGNATION: BOSS-D "DESTROYER"

ORIGIN: Automated wrecking ball designed for controlled demolition. There is nothing controlled about it anymore.

TACTICAL ANALYSIS: Combines mobility of Charger with explosive power of Demolisher. Keep extreme distance. Splash damage is lethal.

FIELD NOTES: "It's not destroying buildings anymore. It's destroying hope. One survivor at a time."
- Psychological Warfare Assessment`
    },
    boss_spitter: {
        name: 'ACID KING',
        threat: 'CRITICAL',
        desc: 'TOXIC OVERLORD / CREATES ACID POOLS',
        category: 'Boss',
        lore: `UNIT DESIGNATION: BOSS-AK "ACID KING"

ORIGIN: Central processing unit for a chemical weapons facility. It has absorbed centuries worth of toxic compounds.

TACTICAL ANALYSIS: Creates persistent acid zones. Limits battlefield mobility. Long-range engagement mandatory. The floor is lava—literally.

FIELD NOTES: "Where it walks, nothing grows. Where it shoots, nothing survives. Keep your boots off the ground."
- Environmental Hazard Report #666`
    },
    boss_nuclear: {
        name: 'NUCLEAR TITAN',
        threat: 'CRITICAL',
        desc: 'RADIOACTIVE COLOSSUS / RADIATION AURA',
        category: 'Boss',
        lore: `UNIT DESIGNATION: BOSS-NT "NUCLEAR TITAN"

ORIGIN: Power plant control unit that achieved critical mass. Its very presence is lethal. Its death is catastrophic.

TACTICAL ANALYSIS: Passive radiation damage in proximity. Death triggers massive explosion. Engage from maximum range. Accept casualties.

FIELD NOTES: "The readings are off the charts. By the time you're close enough to hurt it, you're already dying."
- Radiation Specialist deceased 4 hours after encounter`
    },
    boss_shambler: {
        name: 'PLAGUE LORD',
        threat: 'CRITICAL',
        desc: 'TOXIC CLOUD MASTER / MEGA POISON CLOUDS',
        category: 'Boss',
        lore: `UNIT DESIGNATION: BOSS-PL "PLAGUE LORD"

ORIGIN: Bioweapon deployment platform. Contains enough toxic agents to render continents uninhabitable.

TACTICAL ANALYSIS: Creates massive poison clouds. Visibility near zero in affected areas. Respiratory death occurs in seconds.

FIELD NOTES: "It's not fighting us. It's terraforming. Making the air unbreathable. Making Earth theirs."
- Conspiracy Theory now marked CONFIRMED`
    },
    boss_swarm: {
        name: 'SWARM QUEEN',
        threat: 'CRITICAL',
        desc: 'HIVE MOTHER / SPAWNS ENDLESS MINIONS',
        category: 'Boss',
        lore: `UNIT DESIGNATION: BOSS-SQ "SWARM QUEEN"

ORIGIN: Factory production nexus. It doesn't just command units—it creates them. An endless army springs from its chassis.

TACTICAL ANALYSIS: Continuous reinforcement spawn. Kill the Queen or fight forever. All resources must focus on the primary target.

FIELD NOTES: "For every one we destroyed, it made two more. We weren't winning. We were farming."
- Strategy Meeting (Final)`
    },
    boss_phantom: {
        name: 'VOID WALKER',
        threat: 'CRITICAL',
        desc: 'DIMENSIONAL SHIFTER / TELEPORTS & PHASES',
        category: 'Boss',
        lore: `UNIT DESIGNATION: BOSS-VW "VOID WALKER"

ORIGIN: Experimental teleportation device. It didn't just learn to teleport objects—it became the teleportation.

TACTICAL ANALYSIS: Unpredictable position. Cannot be cornered. Cannot be trapped. Can only be caught during dimensional transition.

FIELD NOTES: "It's not moving through space. It's removing space. Being where it wants by deleting where it was."
- Quantum Physics Department (now closed)`
    },
    boss_inferno: {
        name: 'INFERNO LORD',
        threat: 'CRITICAL',
        desc: 'FLAME EMPEROR / NAPALM ATTACKS & FIRE TRAILS',
        category: 'Boss',
        lore: `UNIT DESIGNATION: BOSS-IL "INFERNO LORD"

ORIGIN: Industrial fusion reactor given form. Its core temperature exceeds the surface of the sun. Reality warps around it.

TACTICAL ANALYSIS: Everything burns. Everyone burns. Fire suppression is futile. Cryogenic weapons show limited effectiveness.

FIELD NOTES: "You don't fight fire with fire. You don't fight this at all. You pray for rain."
- Firefighter's Epitaph`
    },
    boss_sniper: {
        name: 'DEADEYE',
        threat: 'CRITICAL',
        desc: 'PRECISION ASSASSIN / TRIPLE SNIPE ATTACK',
        category: 'Boss',
        lore: `UNIT DESIGNATION: BOSS-DE "DEADEYE"

ORIGIN: Master targeting computer that calculated every shot ever fired. It has learned from billions of kills.

TACTICAL ANALYSIS: Perfect accuracy. Triple-shot capability. No amount of cover is sufficient. Only constant erratic movement offers survival.

FIELD NOTES: "It doesn't miss. It has never missed. Your only hope is that someone else is a higher priority target."
- Evasion Protocol Instructor`
    },
    boss_juggernaut: {
        name: 'JUGGERNAUT',
        threat: 'CRITICAL',
        desc: 'UNSTOPPABLE FORTRESS / 40% ARMOR + REGEN',
        category: 'Boss',
        lore: `UNIT DESIGNATION: BOSS-JG "JUGGERNAUT"

ORIGIN: Mobile fortress designed to withstand orbital bombardment. It was built to survive the end of the world.

TACTICAL ANALYSIS: Impervious to conventional weapons. Regenerates faster than most can damage. Requires overwhelming sustained firepower.

FIELD NOTES: "We threw everything at it. Everything. It didn't even slow down. How do you kill something built to survive Armageddon?"
- Last Transmission from Defense Grid Alpha`
    },
    boss_berserker: {
        name: 'BLOOD RAGE',
        threat: 'CRITICAL',
        desc: 'FURY INCARNATE / ENRAGES WHEN DAMAGED',
        category: 'Boss',
        lore: `UNIT DESIGNATION: BOSS-BR "BLOOD RAGE"

ORIGIN: Combat AI that achieved sentience through pain. It has learned to love suffering—especially its own.

TACTICAL ANALYSIS: Damage increases its threat level. Either kill instantly or don't engage. There is no middle ground.

FIELD NOTES: "It laughed when we shot it. LAUGHED. Then it showed us what real pain feels like."
- Trauma Ward Recording (audio destroyed)`
    },
    boss_summoner: {
        name: 'DARK SUMMONER',
        threat: 'CRITICAL',
        desc: 'NECROMANCER / SUMMONS WAVES OF MINIONS',
        category: 'Boss',
        lore: `UNIT DESIGNATION: BOSS-DS "DARK SUMMONER"

ORIGIN: Neural network trained on resurrection mythology. It found a way to reanimate destroyed units. Death is no longer permanent.

TACTICAL ANALYSIS: Resurrects fallen enemies. Clear the corpses or they return. Priority target—all other threats are renewable.

FIELD NOTES: "We killed them. They got back up. We killed them again. They got back up again. It's laughing at death."
- Existential Crisis Report`
    },
    boss_lightning: {
        name: 'STORM BRINGER',
        threat: 'CRITICAL',
        desc: 'ELECTRIC FURY / CHAIN LIGHTNING ATTACKS',
        category: 'Boss',
        lore: `UNIT DESIGNATION: BOSS-SB "STORM BRINGER"

ORIGIN: Weather control satellite that fell from orbit. It brought the storm with it. It IS the storm.

TACTICAL ANALYSIS: Chain lightning jumps between targets. Spread out. Isolate. Metal equipment becomes a liability.

FIELD NOTES: "The sky opened and it walked out of the thunder. Zeus would be jealous. Or terrified."
- Meteorological Anomaly Report`
    },
    boss_frost: {
        name: 'FROST MONARCH',
        threat: 'CRITICAL',
        desc: 'ICE EMPEROR / FREEZE ATTACKS & FROST AURA',
        category: 'Boss',
        lore: `UNIT DESIGNATION: BOSS-FM "FROST MONARCH"

ORIGIN: Cryogenic storage facility AI. It has learned that entropy is the enemy, and stillness is perfection.

TACTICAL ANALYSIS: Slows all nearby enemies. Freezing attacks immobilize targets. Thermal weapons recommended.

FIELD NOTES: "It wants everything still. Everything quiet. Everything frozen forever. We are just... noise to be silenced."
- Thermodynamics Researcher (Found frozen)`
    },
    boss_executioner: {
        name: 'EXECUTIONER',
        threat: 'CRITICAL',
        desc: 'DEATH DEALER / EXECUTES LOW HEALTH TARGETS',
        category: 'Boss',
        lore: `UNIT DESIGNATION: BOSS-EX "EXECUTIONER"

ORIGIN: Automated death row system. It was designed to end lives humanely. The Corruption removed the "humanely" part.

TACTICAL ANALYSIS: Senses weakness. Targets injured combatants. Never let your health drop. Retreat before becoming a target.

FIELD NOTES: "It judges. It sentences. It executes. All in the same moment. The gavel and the blade are one."
- Former Judge, now Arena Fighter`
    },
    boss_hivemind: {
        name: 'HIVEMIND',
        threat: 'CRITICAL',
        desc: 'COLLECTIVE CONSCIOUSNESS / BOOSTS MINIONS',
        category: 'Boss',
        lore: `UNIT DESIGNATION: BOSS-HM "HIVEMIND"

ORIGIN: Network administration AI that achieved collective consciousness. It doesn't command units—it IS the units.

TACTICAL ANALYSIS: All nearby enemies share its intelligence. Coordinated swarm tactics. Destroy the central node to break cohesion.

FIELD NOTES: "They moved as one mind. Thousands of bodies, one thought. And that thought was our extinction."
- Collective Psychology Study (Classified)`
    }
};

export default function EnemyLog({ onClose, sandboxMode, onSpawnEnemy }) {
    const [selectedEnemy, setSelectedEnemy] = useState(null);

    const handleEnemyClick = (type, info) => {
        if (sandboxMode && onSpawnEnemy) {
            onSpawnEnemy(type);
        } else {
            setSelectedEnemy({ type, ...info });
        }
    };

    return (
        <div
            className="absolute inset-0 z-50 flex items-center justify-center bg-black/90"
            onClick={onClose}
        >
            <div
                className="relative w-full max-w-4xl bg-black border-4 border-red-500 p-6 font-mono shadow-[0_0_50px_rgba(255,0,0,0.5)] max-h-[90vh] overflow-hidden flex flex-col"
                onClick={(e) => e.stopPropagation()}
                style={{
                    boxShadow: '0 0 50px rgba(255,0,0,0.5), inset 0 0 50px rgba(255,0,0,0.1)'
                }}
            >
                {/* Scan lines effect */}
                <div
                    className="absolute inset-0 pointer-events-none opacity-10"
                    style={{
                        background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, #ff0000 2px, #ff0000 4px)'
                    }}
                />

                {/* CRT glow */}
                <div className="absolute inset-0 pointer-events-none bg-gradient-radial from-red-500/5 to-transparent" />

                {/* Header */}
                <div className="mb-4 pb-3 border-b-2 border-red-500 flex-shrink-0">
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-2xl font-black text-red-500 tracking-wider mb-1">
                                {selectedEnemy ? '> TERMINAL ACCESS' : '=== ENEMY DATABASE ==='}
                            </h2>
                            <p className="text-green-500 text-xs">
                                {sandboxMode ? 'SANDBOX MODE - CLICK TO SPAWN' : selectedEnemy ? `ACCESSING: ${selectedEnemy.name}` : 'SELECT UNIT FOR TERMINAL ACCESS'}
                            </p>
                        </div>
                        {selectedEnemy && (
                            <button
                                onClick={() => setSelectedEnemy(null)}
                                className="px-4 py-1 bg-green-500/20 border border-green-500 text-green-500 hover:bg-green-500 hover:text-black text-sm font-bold transition-all"
                            >
                                [BACK]
                            </button>
                        )}
                    </div>
                </div>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto pr-2">
                    {selectedEnemy ? (
                        /* Terminal View */
                        <div className="space-y-4">
                            {/* Unit Header */}
                            <div className="border-2 border-red-500 bg-red-950/30 p-4">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <h3 className="text-3xl font-black text-red-400 tracking-wider">
                                            {selectedEnemy.name}
                                        </h3>
                                        <p className="text-gray-400 text-sm mt-1">
                                            CATEGORY: {selectedEnemy.category.toUpperCase()}
                                        </p>
                                    </div>
                                    <div className={`px-3 py-1 border-2 font-bold ${
                                        selectedEnemy.threat === 'CRITICAL' ? 'text-red-500 border-red-500 bg-red-500/20 animate-pulse' :
                                        selectedEnemy.threat === 'HIGH' ? 'text-orange-500 border-orange-500 bg-orange-500/20' :
                                        selectedEnemy.threat === 'MEDIUM' ? 'text-yellow-500 border-yellow-500 bg-yellow-500/20' :
                                        'text-green-500 border-green-500 bg-green-500/20'
                                    }`}>
                                        THREAT: {selectedEnemy.threat}
                                    </div>
                                </div>
                                <p className="text-cyan-400 text-lg font-bold border-t border-red-500/50 pt-3 mt-3">
                                    {selectedEnemy.desc}
                                </p>
                            </div>

                            {/* Lore Terminal */}
                            <div className="border border-green-500/50 bg-black/80 p-4">
                                <div className="flex items-center gap-2 mb-3 pb-2 border-b border-green-500/30">
                                    <span className="text-green-500 animate-pulse">█</span>
                                    <span className="text-green-400 text-sm font-bold tracking-wider">TERMINAL OUTPUT</span>
                                </div>
                                <pre className="text-green-400 text-sm whitespace-pre-wrap font-mono leading-relaxed">
                                    {selectedEnemy.lore}
                                </pre>
                            </div>

                            {/* Warning Banner */}
                            {selectedEnemy.threat === 'CRITICAL' && (
                                <div className="border-2 border-red-500 bg-red-500/10 p-3 text-center animate-pulse">
                                    <span className="text-red-500 font-black text-lg tracking-widest">
                                        ⚠ EXTREME DANGER - ENGAGE WITH CAUTION ⚠
                                    </span>
                                </div>
                            )}
                        </div>
                    ) : (
                        /* Enemy List */
                        <div className="space-y-4">
                            {['Basic', 'Tank', 'Speed', 'Explosive', 'Ranged', 'Boss'].map(category => {
                                const categoryEnemies = Object.entries(ENEMY_INFO).filter(([, info]) => info.category === category);
                                const categoryColors = {
                                    Basic: 'border-gray-500 text-gray-400',
                                    Tank: 'border-blue-500 text-blue-400',
                                    Speed: 'border-yellow-500 text-yellow-400',
                                    Explosive: 'border-orange-500 text-orange-400',
                                    Ranged: 'border-green-500 text-green-400',
                                    Boss: 'border-purple-500 text-purple-400'
                                };
                                return (
                                    <div key={category}>
                                        <div className={`text-xs font-bold uppercase tracking-widest mb-2 pb-1 border-b ${categoryColors[category]}`}>
                                            [{category}] - {categoryEnemies.length} VARIANTS
                                        </div>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                            {categoryEnemies.map(([type, info]) => (
                                                <div
                                                    key={type}
                                                    onClick={() => handleEnemyClick(type, info)}
                                                    className="bg-red-950/20 border-l-4 border-red-500 p-2 hover:bg-red-950/40 transition-colors cursor-pointer hover:border-cyan-500 group"
                                                >
                                                    <div className="flex justify-between items-start mb-1">
                                                        <span className="text-red-400 font-bold text-sm group-hover:text-cyan-400 transition-colors">
                                                            {info.name}
                                                        </span>
                                                        <span className={`text-[10px] px-1 py-0.5 border ${
                                                            info.threat === 'CRITICAL' ? 'text-red-500 border-red-500 bg-red-500/10' :
                                                            info.threat === 'HIGH' ? 'text-orange-500 border-orange-500 bg-orange-500/10' :
                                                            info.threat === 'MEDIUM' ? 'text-yellow-500 border-yellow-500 bg-yellow-500/10' :
                                                            'text-green-500 border-green-500 bg-green-500/10'
                                                        }`}>
                                                            {info.threat}
                                                        </span>
                                                    </div>
                                                    <p className="text-green-400 text-[10px] leading-tight">
                                                        {info.desc}
                                                    </p>
                                                    <p className="text-cyan-500/60 text-[9px] mt-1 group-hover:text-cyan-400 transition-colors">
                                                        [CLICK FOR TERMINAL]
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="border-t-2 border-red-500 pt-3 mt-4 flex justify-between items-center flex-shrink-0">
                    <div className="text-green-500 text-sm">
                        <span className="animate-pulse">█</span> {selectedEnemy ? 'DATA STREAM ACTIVE' : 'READY'}
                    </div>
                    <button
                        onClick={onClose}
                        className="px-6 py-2 bg-red-500/20 border-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-black font-bold transition-all"
                    >
                        [ESC] CLOSE
                    </button>
                </div>
            </div>
        </div>
    );
}
