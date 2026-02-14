// data.js
export const skillLinks = {
    "athletics": { link: "agility", core: true },
    "common knowledge": { link: "smarts", core: true },
    "notice": { link: "smarts", core: true },
    "persuasion": { link: "spirit", core: true },
    "stealth": { link: "agility", core: true },
    "fighting": { link: "agility", core: false },
    "shooting": { link: "agility", core: false },
    "thievery": { link: "agility", core: false },
    "occult": { link: "smarts", core: false },
    "survival": { link: "smarts", core: false }
};

export const raceDB = {
    "Human": { desc: "Adaptable: Starts with 1 free Edge.", freeEdge: 1, modifiers: {}, pace: 6 },
    "Dwarf": { desc: "Low Light Vision, Pace 5, Vigor starts at d6.", freeEdge: 0, modifiers: { vigor: 6 }, pace: 5 },
    "Elf": { desc: "Low Light Vision, Agile, Agility starts at d6.", freeEdge: 0, modifiers: { agility: 6 }, pace: 6 }
};

export const hindranceDB = [
    { name: "Anemic", type: "Minor", desc: "-2 to Vigor rolls to resist fatigue/poison." },
    { name: "Arrogant", type: "Major", desc: "Must humiliate opponent; seeks out the leader." },
    { name: "Blind", type: "Major", desc: "-6 to all tasks involving vision." },
    { name: "Curious", type: "Major", desc: "Hero wants to know about everything." },
    { name: "Loyal", type: "Minor", desc: "The hero is loyal to his friends and allies." }
];

export const edgeDB = [
    { name: "Brawny", req: { strength: 6, vigor: 6 }, desc: "Size +1, x4 Encumbrance, and +1 Toughness.", bonus: { toughness: 1 } },
    { name: "Frenzy", req: { fighting: 8 }, desc: "Roll a second Fighting die with one melee attack." },
    { name: "Fleet-Footed", req: { agility: 6 }, desc: "+2 Pace and d10 running die.", bonus: { pace: 2 } }
];

export const gearDB = [
    { name: "Shield, Medium", req: { strength: 6 }, cost: 50, weight: 8, armor: 0, desc: "+2 Parry, +2 Armor vs Ranged." },
    { name: "Leather Armor", req: {}, cost: 100, weight: 8, armor: 2, desc: "Covers Torso." },
    { name: "Plate Armor", req: { strength: 10 }, cost: 500, weight: 30, armor: 4, desc: "Covers Torso, Arms, Legs." },
    { name: "Long Sword", req: { strength: 6 }, cost: 300, weight: 4, armor: 0, desc: "Damage Str+d8." }
];