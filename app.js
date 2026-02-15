// app.js
import { skillLinks, raceDB, hindranceDB, edgeDB, gearDB } from './data.js';

const dice = [4, 6, 8, 10, 12];
let char = {
    name: "", race: "Human",
    attributes: { strength: 4, agility: 4, vigor: 4, smarts: 4, spirit: 4 },
    skills: {}, chosenEdges: [], hindrances: [],
    chosenGear: [], 
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
	document.getElementById('char-name').oninput = (e) => { char.name = e.target.value; };
    handleRaceChange("Human");
}

function handleRaceChange(newRace) {
    char.race = newRace;
    char.chosenEdges = [];
    char.hindrances = [];
    char.chosenGear = [];
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
        if (sVal <= 0) return; 
        const linkVal = char.attributes[skillLinks[sName].link];
        let cost = skillLinks[sName].core ? 0 : 1;
        let temp = 4;
        while (temp < sVal) { cost += (temp < linkVal ? 1 : 2); temp = dice[dice.indexOf(temp)+1]; }
        skillSpent += cost;
    });

    return { attr: (5 + char.rewards.attr) - attrSpent, skill: (12 + char.rewards.skill) - skillSpent, bank, edgeLimit: (rData.freeEdge || 0) + char.rewards.edge };
}

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
    let current = char.skills[s] || 0;
    let i = current === 0 ? (d > 0 ? 0 : -1) : dice.indexOf(current) + d;
    if (i === -1 && d < 0) {
        if (!skillLinks[s].core && s !== 'fighting') delete char.skills[s]; 
        else char.skills[s] = 0;
    } else if (i >= 0 && i < dice.length) {
        char.skills[s] = dice[i];
    }
    render();
};

window.remSkill = (s) => { delete char.skills[s]; render(); };
window.toggleEdge = (n) => {
    const i = char.chosenEdges.indexOf(n);
    if(i === -1) char.chosenEdges.push(n); else char.chosenEdges.splice(i, 1);
    render();
};
window.toggleGear = (n) => {
    const i = char.chosenGear.indexOf(n);
    if(i === -1) char.chosenGear.push(n); else char.chosenGear.splice(i, 1);
    render();
};

// UI Highlighting Helpers
window.highlight = (id) => { document.getElementById(id)?.classList.add('highlight-link'); };
window.clearHighlight = () => { document.querySelectorAll('.stat-box, .row').forEach(el => el.classList.remove('highlight-link')); };

window.exportStatblock = () => {
    const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
    
    // 1. Calculate Armor
    let maxArmor = 0;
    char.chosenGear.forEach(gName => {
        const g = gearDB.find(x => x.name === gName);
        if(g && g.armor > maxArmor) maxArmor = g.armor;
    });

    // 2. Base Derived Stats from Stats/Race
    let toughBase = 2 + (char.attributes.vigor / 2);
    let currentPace = raceDB[char.race].pace || 6;
    const parry = 2 + ((char.skills.fighting || 0) / 2);

    // 3. Apply Edge Bonuses (Fix: Added Pace here)
    char.chosenEdges.forEach(eName => {
        const e = edgeDB.find(x => x.name === eName);
        if (e?.bonus?.toughness) toughBase += e.bonus.toughness;
        if (e?.bonus?.pace) currentPace += e.bonus.pace; // Correctly adds Fleet-Footed bonus
    });

    const toughnessStr = `${toughBase + maxArmor}${maxArmor > 0 ? ` (${maxArmor})` : ''}`;

    const block = [
        `**${char.name || 'Unnamed Hero'}** (${char.race})`,
        `**Attributes**: Agility d${char.attributes.agility}, Smarts d${char.attributes.smarts}, Spirit d${char.attributes.spirit}, Strength d${char.attributes.strength}, Vigor d${char.attributes.vigor}`,
        `**Skills**: ` + Object.entries(char.skills).filter(([_, v]) => v > 0).map(([n, v]) => `${cap(n)} d${v}`).join(', '),
        `**Pace**: ${currentPace}; **Parry**: ${parry}; **Toughness**: ${toughnessStr}`,
        `**Hindrances**: ` + char.hindrances.join(', '),
        `**Edges**: ` + char.chosenEdges.join(', '),
        `**Gear**: ` + char.chosenGear.join(', ')
    ].join('\n');

    const output = document.getElementById('export-output');
    output.value = block;
    output.style.display = 'block';
    output.select();
    document.execCommand('copy');
    alert("Statblock copied to clipboard!");
};

function render() {
    const pts = calculatePoints();
    const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);

    const spiritVal = char.attributes.spirit;
    const recoverChance = Math.round((1 - (3/spiritVal * 0.5)) * 100);

    if (char.skills['fighting'] === undefined) char.skills['fighting'] = 0;

    let totalSpent = 0, totalWeight = 0, maxArmor = 0;
    char.chosenGear.forEach(gName => {
        const g = gearDB.find(x => x.name === gName);
        if(g) { totalSpent += g.cost; totalWeight += g.weight; if(g.armor > maxArmor) maxArmor = g.armor; }
    });

    const maxWeight = char.attributes.strength * 5;
    document.getElementById('attr-tracker').innerText = `Points: ${pts.attr}`;
    document.getElementById('attr-tracker').className = pts.attr < 0 ? 'stat-pill overspent' : 'stat-pill';
    document.getElementById('skill-tracker').innerText = `Points: ${pts.skill}`;
    document.getElementById('skill-tracker').className = pts.skill < 0 ? 'stat-pill overspent' : 'stat-pill';
	document.getElementById('char-name').value = char.name;
    document.getElementById('gold-tracker').innerText = `$${500 - totalSpent}`;
    document.getElementById('gold-tracker').className = (500-totalSpent) < 0 ? 'stat-pill overspent' : 'stat-pill';
    document.getElementById('stat-weight').innerText = `${totalWeight} / ${maxWeight}`;
    document.getElementById('stat-weight').parentElement.className = totalWeight > maxWeight ? 'stat-box overspent' : 'stat-box';
    document.getElementById('hind-bank').innerText = `Bank: ${pts.bank}`;
    document.getElementById('reward-ui').style.display = char.hindrances.length > 0 ? 'block' : 'none';

    // Attributes with linked hints and IDs for Skill-highlighting
    document.getElementById('attr-list').innerHTML = Object.keys(char.attributes).map(a => {
        let hint = "", hover = "";
        if (a === 'spirit') hint = `<div style="font-size:9px; color:var(--accent)">Unshake: ${recoverChance}%</div>`;
        if (a === 'vigor') { 
            hint = `<div style="font-size:9px; color:var(--accent)">Base Toughness</div>`; 
            hover = `onmouseover="window.highlight('stat-box-tough')" onmouseout="window.clearHighlight()"`; 
        }
        return `<div class="row" id="attr-row-${a}" ${hover}><span><strong>${cap(a)}</strong>${hint}</span><div class="control-group"><button onclick="window.modAttr('${a}',-1)">-</button><span class="die-val">d${char.attributes[a]}</span><button onclick="window.modAttr('${a}',1)">+</button></div></div>`;
    }).join('');

    // Skills with hover logic to highlight linked attributes
    document.getElementById('active-skills').innerHTML = Object.keys(char.skills).map(s => {
        const isFighting = s === 'fighting';
		const link = skillLinks[s].link;
		const val = char.skills[s];
		const linkVal = char.attributes[link];
        // Highlights linked attribute row, plus Parry box if it's Fighting
        // Logic: If current die is >= linked attribute, the NEXT click is expensive
		const isExpensive = val >= linkVal;
		const expensiveClass = isExpensive ? 'expensive' : '';

		const hover = `onmouseover="window.highlight('attr-row-${link}'); ${isFighting ? "window.highlight('stat-box-parry');" : ""}" onmouseout="window.clearHighlight()"`;
		
		return `
			<div class="row" ${hover}>
				<span>
					<strong>${cap(s)}</strong><br>
					<small style="color:#999">Link: ${cap(link)}</small>
				</span>
				<div style="display: flex; align-items: center; gap: 5px;">
					<div class="control-group">
						<button onclick="window.modSkill('${s}',-1)">-</button>
						<span class="die-val">${val === 0 ? "d0" : "d"+val}</span>
						<button class="${expensiveClass}" onclick="window.modSkill('${s}',1)">+</button>
					</div>
					${(skillLinks[s].core || isFighting) ? '' : `<button class="remove-btn" onclick="window.remSkill('${s}')">×</button>`}
				</div>
			</div>`;
	}).join('');

    // Locate this section inside your render() function
	document.getElementById('active-hindrances').innerHTML = char.hindrances.map(hName => {
		const h = hindranceDB.find(x => x.name === hName);
		return `
			<div class="hind-item">
				<div class="hind-header">
					<strong>${h.name} (${h.type})</strong>
					<button class="remove-btn" onclick="window.remHind('${hName}')">×</button>
				</div>
				<div class="hind-desc">${h.desc}</div>
			</div>`;
	}).join('');
    
    const der = { pace: raceDB[char.race].pace || 6, tough: 2 + (char.attributes.vigor/2), parry: 2 + ((char.skills.fighting||0)/2) };
    char.chosenEdges.forEach(eName => {
        const e = edgeDB.find(x => x.name === eName);
        if(e?.bonus?.toughness) der.tough += e.bonus.toughness;
        if(e?.bonus?.pace) der.pace += e.bonus.pace;
    });

    document.getElementById('stat-pace').innerText = der.pace;
    document.getElementById('stat-parry').innerText = der.parry;
    document.getElementById('stat-tough').innerText = `${der.tough + maxArmor}${maxArmor > 0 ? ` (${maxArmor})` : ''}`;

    const meet = (req) => Object.entries(req).every(([k, v]) => (char.attributes[k] || char.skills[k] || 0) >= v);
    document.getElementById('edge-tracker').innerText = `${char.chosenEdges.length} / ${pts.edgeLimit}`;
    document.getElementById('edge-tracker').className = char.chosenEdges.length > pts.edgeLimit ? 'stat-pill overspent' : 'stat-pill';
    document.getElementById('edge-list').innerHTML = edgeDB.filter(e => meet(e.req)).map(e => `<div class="card ${char.chosenEdges.includes(e.name)?'selected':''}" onclick="window.toggleEdge('${e.name}')"><span class="card-title">${e.name}</span><div style="font-size:12px">${e.desc}</div></div>`).join('');
    document.getElementById('gear-list').innerHTML = gearDB.filter(g => meet(g.req)).map(g => `<div class="card ${char.chosenGear.includes(g.name)?'selected':''}" style="border-left-color:var(--gear)" onclick="window.toggleGear('${g.name}')"><span class="card-title" style="color:var(--gear)">${g.name} ($${g.cost})</span><div style="font-size:12px">${g.desc} <br><strong>Weight:</strong> ${g.weight} lbs</div></div>`).join('') || '<div style="color:#999; font-size:12px;">No gear meets requirements.</div>';

    const availSkills = Object.keys(skillLinks).filter(s => char.skills[s] === undefined);
    document.getElementById('skill-add').innerHTML = `<option value="">+ Add Skill</option>` + availSkills.map(s => `<option value="${s}">${cap(s)}</option>`).join('');

    const availHind = hindranceDB.filter(h => !char.hindrances.includes(h.name));
    document.getElementById('hindrance-add').innerHTML = `<option value="">+ Add Hindrance</option>` + availHind.map(h => `<option value="${h.name}">${h.name} (${h.type})</option>`).join('');
}

init();