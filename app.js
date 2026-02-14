// app.js
import { skillLinks, raceDB, hindranceDB, edgeDB, gearDB } from './data.js';

const dice = [4, 6, 8, 10, 12];
let char = {
    name: "", race: "Human",
    attributes: { strength: 4, agility: 4, vigor: 4, smarts: 4, spirit: 4 },
    skills: {}, chosenEdges: [], hindrances: [],
    rewards: { attr: 0, edge: 0, skill: 0 }
};

function init() {
    const rSel = document.getElementById('race-select');
    Object.keys(raceDB).forEach(r => rSel.add(new Option(r, r)));
    
    rSel.onchange = (e) => handleRaceChange(e.target.value);
    
    document.getElementById('hindrance-add').onchange = (e) => {
        if(e.target.value) { window.addHind(e.target.value); e.target.value = ""; }
    };

    document.getElementById('skill-add').onchange = (e) => { 
        if(e.target.value) { char.skills[e.target.value] = 4; render(); } 
    };

    handleRaceChange("Human");
}

function handleRaceChange(newRace) {
    char.race = newRace;
    char.chosenEdges = [];
    char.hindrances = [];
    char.rewards = { attr: 0, edge: 0, skill: 0 };
    char.attributes = { strength: 4, agility: 4, vigor: 4, smarts: 4, spirit: 4 };
    if (raceDB[newRace].modifiers) {
        Object.entries(raceDB[newRace].modifiers).forEach(([a, v]) => char.attributes[a] = v);
    }
    char.skills = {};
    Object.entries(skillLinks).forEach(([n, d]) => { if (d.core) char.skills[n] = 4; });
    render();
}

function calculatePoints() {
    const rData = raceDB[char.race];
    let hPoints = 0;
    char.hindrances.forEach(hName => {
        const h = hindranceDB.find(x => x.name === hName);
        if(h) hPoints += (h.type === "Major" ? 2 : 1);
    });
    const bank = Math.min(4, hPoints) - (char.rewards.attr*2 + char.rewards.edge*2 + char.rewards.skill);

    let attrSpent = 0;
    Object.entries(char.attributes).forEach(([a, v]) => {
        const start = rData.modifiers[a] || 4;
        attrSpent += (dice.indexOf(v) - dice.indexOf(start));
    });

    let skillSpent = 0;
    Object.entries(char.skills).forEach(([sName, sVal]) => {
        const linkVal = char.attributes[skillLinks[sName].link];
        let cost = skillLinks[sName].core ? 0 : 1;
        let temp = 4;
        while (temp < sVal) { cost += (temp < linkVal ? 1 : 2); temp = dice[dice.indexOf(temp)+1]; }
        skillSpent += cost;
    });

    return { 
        attr: (5 + char.rewards.attr) - attrSpent, 
        skill: (12 + char.rewards.skill) - skillSpent, 
        bank, 
        edgeLimit: (rData.freeEdge || 0) + char.rewards.edge 
    };
}

// Global Helpers
window.addHind = (name) => { if(!char.hindrances.includes(name)) char.hindrances.push(name); render(); };
window.remHind = (name) => { char.hindrances = char.hindrances.filter(h => h !== name); render(); };
window.spendPoints = (type) => { if(calculatePoints().bank >= (type==='skill'?1:2)) { char.rewards[type]++; render(); } };
window.resetRewards = () => { char.rewards = { attr:0, edge:0, skill:0 }; render(); };
window.modAttr = (a, d) => {
    const min = raceDB[char.race].modifiers[a] || 4;
    let i = dice.indexOf(char.attributes[a]) + d;
    if(i >= dice.indexOf(min) && i < dice.length) { char.attributes[a] = dice[i]; render(); }
};
window.modSkill = (s, d) => {
    let i = dice.indexOf(char.skills[s]) + d;
    if(i >= 0 && i < dice.length) { char.skills[s] = dice[i]; render(); }
};
window.remSkill = (s) => { delete char.skills[s]; render(); };
window.toggleEdge = (n) => {
    const i = char.chosenEdges.indexOf(n);
    if(i === -1) char.chosenEdges.push(n); else char.chosenEdges.splice(i, 1);
    render();
};

function render() {
    const pts = calculatePoints();
    const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

    // Trackers
    document.getElementById('attr-tracker').innerText = `Points: ${pts.attr}`;
    document.getElementById('attr-tracker').className = pts.attr < 0 ? 'stat-pill overspent' : 'stat-pill';
    document.getElementById('skill-tracker').innerText = `Points: ${pts.skill}`;
    document.getElementById('skill-tracker').className = pts.skill < 0 ? 'stat-pill overspent' : 'stat-pill';
    document.getElementById('hind-bank').innerText = `Bank: ${pts.bank}`;
    document.getElementById('hind-bank').className = pts.bank < 0 ? 'stat-pill overspent' : 'stat-pill';
    document.getElementById('reward-ui').style.display = char.hindrances.length > 0 ? 'block' : 'none';

    // Lists: Attributes & Skills
    document.getElementById('attr-list').innerHTML = Object.keys(char.attributes).map(a => `
    <div class="row">
        <strong>${cap(a)}</strong>
        <div class="control-group">
            <button onclick="window.modAttr('${a}',-1)">-</button>
            <span class="die-val">d${char.attributes[a]}</span>
            <button onclick="window.modAttr('${a}',1)">+</button>
        </div>
    </div>
`).join('');

   document.getElementById('active-skills').innerHTML = Object.keys(char.skills).map(s => `
    <div class="row">
        <span><strong>${cap(s)}</strong><br><small style="color:#999">Link: ${cap(skillLinks[s].link)}</small></span>
        <div style="display: flex; align-items: center; gap: 5px;">
            <div class="control-group">
                <button onclick="window.modSkill('${s}',-1)">-</button>
                <span class="die-val">d${char.skills[s]}</span>
                <button onclick="window.modSkill('${s}',1)">+</button>
            </div>
            ${skillLinks[s].core ? '' : `<button class="remove-btn" onclick="window.remSkill('${s}')" style="margin-left:5px">×</button>`}
        </div>
    </div>
`).join('');

    // Active Hindrances
    document.getElementById('active-hindrances').innerHTML = char.hindrances.map(hName => {
		const h = hindranceDB.find(x => x.name === hName);
		return `
			<div class="hind-item">
				<div class="hind-header">
					<span>${h.name} (${h.type})</span>
					<button class="remove-btn" onclick="window.remHind('${hName}')">×</button>
				</div>
				<div class="hind-desc">${h.desc}</div>
			</div>
		`;
	}).join('');
	
	const hBank = document.getElementById('hind-bank');
	hBank.innerText = `Bank: ${pts.bank}`;
	if (pts.bank > 0) {
		hBank.style.background = "var(--edge)"; // Green if you have points to spend
		hBank.style.animation = "pulse 2s infinite"; // Optional: make it glow
	} else if (pts.bank < 0) {
		hBank.style.background = "var(--error)"; // Red if overspent
	} else {
		hBank.style.background = "var(--accent)"; // Orange if balanced at 0
	}

    // Derived Stats
    const der = { pace: raceDB[char.race].pace || 6, tough: 2 + (char.attributes.vigor/2), parry: 2 + ((char.skills.fighting||0)/2) };
    char.chosenEdges.forEach(eName => {
        const e = edgeDB.find(x => x.name === eName);
        if(e?.bonus?.toughness) der.tough += e.bonus.toughness;
        if(e?.bonus?.pace) der.pace += e.bonus.pace;
    });
    document.getElementById('stat-pace').innerText = der.pace;
    document.getElementById('stat-parry').innerText = der.parry;
    document.getElementById('stat-tough').innerText = der.tough;

    // Edges & Gear Requirement Logic
    const meet = (req) => Object.entries(req).every(([k, v]) => (char.attributes[k] || char.skills[k] || 0) >= v);

    document.getElementById('edge-tracker').innerText = `${char.chosenEdges.length} / ${pts.edgeLimit}`;
    document.getElementById('edge-tracker').className = char.chosenEdges.length > pts.edgeLimit ? 'stat-pill overspent' : 'stat-pill';

    document.getElementById('edge-list').innerHTML = edgeDB.filter(e => meet(e.req)).map(e => `
        <div class="card ${char.chosenEdges.includes(e.name)?'selected':''}" onclick="window.toggleEdge('${e.name}')">
            <span class="card-title">${e.name}</span><div style="font-size:12px">${e.desc}</div></div>
    `).join('');

    document.getElementById('gear-list').innerHTML = gearDB.filter(g => meet(g.req)).map(g => `
        <div class="card" style="border-left-color:var(--gear); cursor:default">
            <span class="card-title" style="color:var(--gear)">${g.name}</span><div style="font-size:12px">${g.desc}</div></div>
    `).join('') || '<div style="color:#999; font-size:12px;">No gear meets requirements.</div>';

    // Dynamic Dropdowns (Filter out already picked items)
    const availSkills = Object.keys(skillLinks).filter(s => !char.skills[s]);
    document.getElementById('skill-add').innerHTML = `<option value="">+ Add Skill</option>` + availSkills.map(s => `<option value="${s}">${cap(s)}</option>`).join('');

    const availHind = hindranceDB.filter(h => !char.hindrances.includes(h.name));
    document.getElementById('hindrance-add').innerHTML = `<option value="">+ Add Hindrance</option>` + availHind.map(h => `<option value="${h.name}">${h.name} (${h.type})</option>`).join('');
}
init();