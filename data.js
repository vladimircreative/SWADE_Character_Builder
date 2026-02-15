export const skillLinks = {
    // Core Skills (Start at d4 for free)
    "athletics": { link: "agility", core: true },
    "common knowledge": { link: "smarts", core: true },
    "notice": { link: "smarts", core: true },
    "persuasion": { link: "spirit", core: true },
    "stealth": { link: "agility", core: true },
    // Non-Core Skills
    "academics": { link: "smarts", core: false },
    "battle": { link: "smarts", core: false },
    "boating": { link: "agility", core: false },
    "driving": { link: "agility", core: false },
    "electronics": { link: "smarts", core: false },
    "fighting": { link: "agility", core: false },
    "healing": { link: "smarts", core: false },
    "intimidation": { link: "spirit", core: false },
    "investigation": { link: "smarts", core: false },
    "language": { link: "smarts", core: false },
    "occult": { link: "smarts", core: false },
    "performance": { link: "spirit", core: false },
    "piloting": { link: "agility", core: false },
    "repair": { link: "smarts", core: false },
    "research": { link: "smarts", core: false },
    "riding": { link: "agility", core: false },
    "science": { link: "smarts", core: false },
    "shooting": { link: "agility", core: false },
    "survival": { link: "smarts", core: false },
    "taunt": { link: "smarts", core: false },
    "thievery": { link: "agility", core: false }
};

export const raceDB = {
    "Human": { desc: "Adaptable: Starts with 1 free Edge.", freeEdge: 1, modifiers: {}, pace: 6 },
    "Dwarf": { desc: "Low Light Vision, Pace 5, Tough, Vigor starts at d6.", freeEdge: 0, modifiers: { vigor: 6 }, pace: 5 },
    "Elf": { desc: "Low Light Vision, Agile, Agility starts at d6.", freeEdge: 0, modifiers: { agility: 6 }, pace: 6 },
    "Rakashan": { desc: "Agile, Low Light Vision, Pounce, Bloodthirsty.", freeEdge: 0, modifiers: { agility: 6 }, pace: 6 },
    "Saurian": { desc: "Armor +2, Keen Senses, Environmental Weakness (Cold).", freeEdge: 0, modifiers: {}, pace: 6 }
};

export const hindranceDB = [
    { name: "Allergic", type: "Minor", desc: "-2 to Vigor rolls to resist allergens." },
    { name: "Anemic", type: "Minor", desc: "-2 to Vigor rolls to resist fatigue/poison." },
    { name: "Arrogant", type: "Major", desc: "Must humiliate opponent; seeks out the leader." },
    { name: "Bad Luck", type: "Major", desc: "The character has one less Benny per session." },
    { name: "Big Mouth", type: "Minor", desc: "Unable to keep a secret; blabs at the worst time." },
    { name: "Blind", type: "Major", desc: "-6 to all tasks involving vision." },
    { name: "Bloodthirsty", type: "Major", desc: "Never takes prisoners." },
    { name: "Cantankerous", type: "Minor", desc: "Grumpy and rude; -2 to Persuasion rolls." },
    { name: "Clumsy", type: "Major", desc: "-2 to all Agility-based rolls." },
    { name: "Curious", type: "Major", desc: "Hero wants to know about everything." },
    { name: "Death Wish", type: "Minor", desc: "The hero wants to die in a blaze of glory." },
    { name: "Elderly", type: "Major", desc: "-1 to Pace, Strength, and Agility; +5 Skill points." },
    { name: "Heroic", type: "Major", desc: "Always helps those in need." },
    { name: "Loyal", type: "Minor", desc: "The hero is loyal to his friends and allies." },
    { name: "Mean", type: "Minor", desc: "Ill-tempered; -2 to Persuasion rolls." },
    { name: "Pacifist", type: "Minor", desc: "Fights only in self-defense." },
    { name: "Phobia", type: "Minor", desc: "-2 to trait rolls when near the object of fear." },
    { name: "Ruthless", type: "Minor", desc: "Does whatever it takes to get the job done." },
    { name: "Ugly", type: "Minor", desc: "Unattractive; -2 to Persuasion rolls." }
];

export const edgeDB = [
    // Background Edges
    { name: "Alertness", req: {}, desc: "+2 to Notice rolls." },
    { name: "Ambidextrous", req: { agility: 6 }, desc: "Ignore -2 penalty when using off-hand." },
    { name: "Brawny", req: { strength: 6, vigor: 6 }, desc: "Size +1, x4 Encumbrance, and +1 Toughness.", bonus: { size: 1, toughness: 1, encumbranceMult: 4 } },
    { name: "Fast Healer", req: { vigor: 8 }, desc: "+2 to Vigor rolls when checking for natural healing." },
    { name: "Luck", req: {}, desc: "+1 Benny per session." },
    // Combat Edges
    { name: "Block", req: { fighting: 8 }, desc: "+1 Parry, ignore 1 point of Gang Up bonus.", bonus: { parry: 1 } },
    { name: "Combat Reflexes", req: {}, desc: "+2 to recover from Shaken." },
    { name: "Dodge", req: { agility: 8 }, desc: "-2 to be hit by ranged attacks." },
    { name: "First Strike", req: { agility: 8 }, desc: "Free Fighting attack against one foe who moves adjacent." },
    { name: "Frenzy", req: { fighting: 8 }, desc: "Roll a second Fighting die with one melee attack." },
    { name: "Fleet-Footed", req: { agility: 6 }, desc: "+2 Pace and d10 running die.", bonus: { pace: 2 } },
    { name: "Hard to Kill", req: { spirit: 8 }, desc: "Ignore Wound penalties when making Vigor rolls to stay alive." },
    { name: "Level Headed", req: { smarts: 8 }, desc: "Draw an additional Action Card and keep the best." },
    { name: "Marksman", req: { shooting: 8 }, desc: "Ignore up to 2 points of penalties if the hero doesn't move." },
    { name: "Nerves of Steel", req: { vigor: 8 }, desc: "Ignore 1 point of Wound penalties." },
    { name: "Sweep", req: { strength: 8, fighting: 8 }, desc: "Attack all adjacent foes at -2 penalty." },
    { name: "Two-Fisted", req: { agility: 8 }, desc: "Make one attack with each hand with no Multi-Action penalty." },
    // Professional Edges
    { name: "Ace", req: { agility: 8 }, desc: "+2 to Boating, Driving, and Piloting; may spend Bennies to Soak for vehicle." },
    { name: "Healer", req: { spirit: 8 }, desc: "+2 to Healing rolls." },
    { name: "Scholar", req: { smarts: 8 }, desc: "+2 to any two different 'knowledge' skills." },
    { name: "Woodsman", req: { spirit: 6, survival: 8 }, desc: "+2 to Survival and Stealth in the wild." }
];

export const gearDB = [
    { name: "Shield, Medium", req: { strength: 6 }, cost: 50, weight: 8, armor: 0, desc: "+2 Parry, +2 Armor vs Ranged." },
    { name: "Leather Armor", req: {}, cost: 100, weight: 8, armor: 2, desc: "Covers Torso." },
    { name: "Plate Armor", req: { strength: 10 }, cost: 500, weight: 30, armor: 4, desc: "Covers Torso, Arms, Legs." },
    { name: "Long Sword", req: { strength: 6 }, cost: 300, weight: 4, armor: 0, desc: "Damage Str+d8." },
    { name: "Dagger", req: {}, cost: 25, weight: 1, armor: 0, desc: "Damage Str+d4." },
    { name: "Short Sword", req: { strength: 6 }, cost: 200, weight: 3, armor: 0, desc: "Damage Str+d6." },
    { name: "Battle Axe", req: { strength: 8 }, cost: 300, weight: 4, armor: 0, desc: "Damage Str+d8." },
    { name: "Bow", req: { strength: 6 }, cost: 250, weight: 3, armor: 0, desc: "Range 12/24/48, Damage d6." },
    { name: "Pistol, 9mm", req: {}, cost: 200, weight: 3, armor: 0, desc: "Range 12/24/48, Damage 2d6, AP 1." }
];