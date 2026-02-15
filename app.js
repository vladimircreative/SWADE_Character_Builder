// app.js
import { skillLinks, raceDB, hindranceDB, edgeDB, gearDB } from './data.js';

const dice = [4, 6, 8, 10, 12];

let char = {
    name: "",
    race: "Human",
    attributes: { strength: 4, agility: 4, vigor: 4, smarts: 4, spirit: 4 },
    skills: {},
    chosenEdges: [],
    hindrances: [],
    chosenGear: [],
    rewards: { attr: 0, edge: 0, skill: 0 }
};

const cap = s => s.charAt(0).toUpperCase() + s.slice(1);

/* ──────────────────────────────────────────────────────────────
   Helper calculations (extracted so they are used in both render
   and exportStatblock – no duplication, consistent results)
   ────────────────────────────────────────────────────────────── */

function calculatePoints() {
    const rData = raceDB[char.race];
    let hPoints = 0;
    char.hindrances.forEach(hName => {
        const h = hindranceDB.find(x => x.name === hName);
        if (h) hPoints += (h.type === "Major" ? 2 : 1);
    });

    const bank = Math.min(4, hPoints) - (char.rewards.attr * 2 + char.rewards.edge * 2 + char.rewards.skill);

    let attrSpent = 0;
    Object.entries(char.attributes).forEach(([a, v]) => {
        const start = rData.modifiers?.[a] || 4;
        attrSpent += (dice.indexOf(v) - dice.indexOf(start));
    });

    let skillSpent = 0;
    Object.entries(char.skills).forEach(([sName, sVal]) => {
        if (sVal <= 0) return;
        const linkVal = char.attributes[skillLinks[sName].link];
        let cost = skillLinks[sName].core ? 0 : 1;
        let temp = 4;
        while (temp < sVal) {
            cost += (temp < linkVal ? 1 : 2);
            temp = dice[dice.indexOf(temp) + 1];
        }
        skillSpent += cost;
    });

    return {
        attr: (5 + char.rewards.attr) - attrSpent,
        skill: (12 + char.rewards.skill) - skillSpent,
        bank,
        edgeLimit: (rData.freeEdge || 0) + char.rewards.edge
    };
}

function calculateGearStats() {
    let totalSpent = 0, totalWeight = 0, maxArmor = 0;
    char.chosenGear.forEach(gName => {
        const g = gearDB.find(x => x.name === gName);
        if (g) {
            totalSpent += g.cost;
            totalWeight += g.weight;
            if (g.armor > maxArmor) maxArmor = g.armor;
        }
    });
    return { totalSpent, totalWeight, maxArmor };
}

function calculateDerivedStats() {
    const rData = raceDB[char.race];
    let pace = rData.pace || 6;
    let parry = 2 + ((char.skills.fighting || 0) / 2);
    let toughnessBase = 2 + (char.attributes.vigor / 2);
    let size = rData.size || 0;

    char.chosenEdges.forEach(eName => {
        const e = edgeDB.find(x => x.name === eName);
        if (e?.bonus) {
            if (e.bonus.pace) pace += e.bonus.pace;
            if (e.bonus.size) size += e.bonus.size;
            if (e.bonus.parry) parry += e.bonus.parry;
            if (e.bonus.toughness) toughnessBase += e.bonus.toughness;
        }
    });

    return { pace, parry, toughnessBase, size };
}

/* ──────────────────────────────────────────────────────────────
   Window-exposed functions (kept for the existing inline onclicks)
   ────────────────────────────────────────────────────────────── */

window.addHind = name => {
    if (!char.hindrances.includes(name)) {
        char.hindrances.push(name);
        render();
    }
};

window.remHind = name => {
    char.hindrances = char.hindrances.filter(h => h !== name);
    render();
};

window.spendPoints = type => {
    const pts = calculatePoints();
    const cost = type === 'skill' ? 1 : 2;
    if (pts.bank >= cost) {
        char.rewards[type]++;
        render();
    }
};

window.resetRewards = () => {
    char.rewards = { attr: 0, edge: 0, skill: 0 };
    render();
};

window.modAttr = (a, d) => {
    const min = raceDB[char.race].modifiers?.[a] || 4;
    let i = dice.indexOf(char.attributes[a]) + d;
    if (i >= dice.indexOf(min) && i < dice.length) {
        char.attributes[a] = dice[i];
		pruneInvalidSelections();
        render();
    }
};

window.modSkill = (s, d) => {
    let current = char.skills[s] || 0;
    let i = current === 0 ? (d > 0 ? 0 : -1) : dice.indexOf(current) + d;

    if (i === -1 && d < 0) {
        if (!skillLinks[s].core && s !== 'fighting') {
            delete char.skills[s];
        } else {
            char.skills[s] = 0;
        }
    } else if (i >= 0 && i < dice.length) {
        char.skills[s] = dice[i];
    }
	
	pruneInvalidSelections();
    render();
};

window.remSkill = s => {
    delete char.skills[s];
    render();
};

window.toggleEdge = n => {
    const i = char.chosenEdges.indexOf(n);
    if (i === -1) char.chosenEdges.push(n);
    else char.chosenEdges.splice(i, 1);
    render();
};

window.toggleGear = n => {
    const i = char.chosenGear.indexOf(n);
    if (i === -1) char.chosenGear.push(n);
    else char.chosenGear.splice(i, 1);
    render();
};

window.highlight = id => document.getElementById(id)?.classList.add('highlight-link');
window.clearHighlight = () => document.querySelectorAll('.stat-box, .row').forEach(el => el.classList.remove('highlight-link'));

/* ──────────────────────────────────────────────────────────────
   Export
   ────────────────────────────────────────────────────────────── */

window.exportStatblock = () => {
    const gear = calculateGearStats();
    const der = calculateDerivedStats();

    const toughnessStr = `${der.toughnessBase + der.size + gear.maxArmor}${gear.maxArmor > 0 ? ` (${gear.maxArmor})` : ''}`;

    const block = [
        `**${char.name || 'Unnamed Hero'}** (${char.race})`,
        `**Attributes**: Agility d${char.attributes.agility}, Smarts d${char.attributes.smarts}, Spirit d${char.attributes.spirit}, Strength d${char.attributes.strength}, Vigor d${char.attributes.vigor}`,
        `**Skills**: ` + Object.entries(char.skills)
            .filter(([, v]) => v > 0)
            .map(([n, v]) => `${cap(n)} d${v}`)
            .join(', '),
        `**Pace**: ${der.pace}; **Parry**: ${der.parry}; **Toughness**: ${toughnessStr}`,
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

/* ──────────────────────────────────────────────────────────────
   Render (now much shorter and uses the helpers)
   ────────────────────────────────────────────────────────────── */

function render() {
    const pts = calculatePoints();
    const rData = raceDB[char.race];

    // Unshake probability (kept exactly as before)
    const spiritVal = char.attributes.spirit;
    const hasCombatReflexes = char.chosenEdges.includes("Combat Reflexes");
    const failTrait = 1 / spiritVal;
    const failWild = 1 / 6;
    const failTraitBase = 3 / spiritVal;
    const failWildBase = 3 / 6;
    let prob = hasCombatReflexes
        ? 1 - (failTrait * failWild)
        : 1 - (failTraitBase * failWildBase);
    const recoverChance = Math.round(prob * 100);

    if (char.skills.fighting === undefined) char.skills.fighting = 0;

    const gear = calculateGearStats();
    const der = calculateDerivedStats();
    const maxWeight = char.attributes.strength * 5;
    const finalToughness = der.toughnessBase + der.size + gear.maxArmor;

    // Basic trackers
    document.getElementById('attr-tracker').innerText = `Points: ${pts.attr}`;
    document.getElementById('attr-tracker').className = pts.attr < 0 ? 'stat-pill overspent' : 'stat-pill';

    document.getElementById('skill-tracker').innerText = `Points: ${pts.skill}`;
    document.getElementById('skill-tracker').className = pts.skill < 0 ? 'stat-pill overspent' : 'stat-pill';

    document.getElementById('char-name').value = char.name;
    document.getElementById('race-desc').innerText = rData.desc || "";

    document.getElementById('gold-tracker').innerText = `$${500 - gear.totalSpent}`;
    document.getElementById('gold-tracker').className = (500 - gear.totalSpent) < 0 ? 'stat-pill overspent' : 'stat-pill';

    document.getElementById('stat-weight').innerText = `${gear.totalWeight} / ${maxWeight}`;
    document.getElementById('stat-weight').parentElement.className = gear.totalWeight > maxWeight ? 'stat-box overspent' : 'stat-box';

    document.getElementById('hind-bank').innerText = `Bank: ${pts.bank}`;
    document.getElementById('reward-ui').style.display = char.hindrances.length > 0 ? 'block' : 'none';

    // Attributes
    document.getElementById('attr-list').innerHTML = Object.keys(char.attributes).map(a => {
        let hint = "", hover = "";
        if (a === 'spirit') {
            hint = `<div style="font-size:9px; color:var(--accent)">Unshake: ${recoverChance}% ${hasCombatReflexes ? '(Combat Reflexes)' : ''}</div>`;
        }
        if (a === 'vigor') {
            hint = `<div style="font-size:9px; color:var(--accent)">Base Toughness</div>`;
            hover = `onmouseover="window.highlight('stat-box-tough')" onmouseout="window.clearHighlight()"`;
        }
        return `<div class="row" id="attr-row-${a}" ${hover}>
            <span><strong>${cap(a)}</strong>${hint}</span>
            <div class="control-group">
                <button onclick="window.modAttr('${a}',-1)">-</button>
                <span class="die-val">d${char.attributes[a]}</span>
                <button onclick="window.modAttr('${a}',1)">+</button>
            </div>
        </div>`;
    }).join('');

    // Skills
    document.getElementById('active-skills').innerHTML = Object.keys(char.skills).map(s => {
        const isFighting = s === 'fighting';
        const link = skillLinks[s].link;
        const val = char.skills[s];
        const linkVal = char.attributes[link];
        const isExpensive = val >= linkVal;
        const hover = `onmouseover="window.highlight('attr-row-${link}'); ${isFighting ? "window.highlight('stat-box-parry');" : ""}" onmouseout="window.clearHighlight()"`;

        return `
            <div class="row" ${hover}>
                <span>
                    <strong>${cap(s)}</strong><br>
                    <small style="color:#999">Link: ${cap(link)}</small>
                </span>
                <div style="display:flex;align-items:center;gap:5px;">
                    <div class="control-group">
                        <button onclick="window.modSkill('${s}',-1)">-</button>
                        <span class="die-val">${val === 0 ? "d0" : "d" + val}</span>
                        <button class="${isExpensive ? 'expensive' : ''}" onclick="window.modSkill('${s}',1)">+</button>
                    </div>
                    ${(skillLinks[s].core || isFighting) ? '' : `<button class="remove-btn" onclick="window.remSkill('${s}')">×</button>`}
                </div>
            </div>`;
    }).join('');

    // Hindrances
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

    // Derived stats
    document.getElementById('stat-pace').innerText = der.pace;
    document.getElementById('stat-parry').innerText = der.parry;
    document.getElementById('stat-tough').innerText = `${finalToughness}${gear.maxArmor > 0 ? ` (${gear.maxArmor})` : ''}`;
    document.getElementById('stat-size').innerText = (der.size >= 0 ? " " : "") + der.size;

    // Edges & Gear
    const meetsReq = req => Object.entries(req || {}).every(([k, v]) =>
        (char.attributes[k] || char.skills[k] || 0) >= v
    );

    document.getElementById('edge-tracker').innerText = `${char.chosenEdges.length} / ${pts.edgeLimit}`;
    document.getElementById('edge-tracker').className = char.chosenEdges.length > pts.edgeLimit ? 'stat-pill overspent' : 'stat-pill';

    document.getElementById('edge-list').innerHTML = edgeDB
        .filter(e => meetsReq(e.req))
        .map(e => `<div class="card ${char.chosenEdges.includes(e.name) ? 'selected' : ''}" onclick="window.toggleEdge('${e.name}')">
            <span class="card-title">${e.name}</span>
            <div style="font-size:12px">${e.desc}</div>
        </div>`).join('');

    document.getElementById('gear-list').innerHTML = gearDB
        .filter(g => meetsReq(g.req))
        .map(g => `<div class="card ${char.chosenGear.includes(g.name) ? 'selected' : ''}" style="border-left-color:var(--gear)" onclick="window.toggleGear('${g.name}')">
            <span class="card-title" style="color:var(--gear)">${g.name} ($${g.cost})</span>
            <div style="font-size:12px">${g.desc} <br><strong>Weight:</strong> ${g.weight} lbs</div>
        </div>`).join('') ||
        '<div style="color:#999; font-size:12px;">No gear meets requirements.</div>';

    // Populate dropdowns
    const availSkills = Object.keys(skillLinks).filter(s => char.skills[s] === undefined);
    document.getElementById('skill-add').innerHTML =
        `<option value="">+ Add Skill</option>` +
        availSkills.map(s => `<option value="${s}">${cap(s)}</option>`).join('');

    const availHind = hindranceDB.filter(h => !char.hindrances.includes(h.name));
    document.getElementById('hindrance-add').innerHTML =
        `<option value="">+ Add Hindrance</option>` +
        availHind.map(h => `<option value="${h.name}">${h.name} (${h.type})</option>`).join('');
}

/* ──────────────────────────────────────────────────────────────
   Init
   ────────────────────────────────────────────────────────────── */

function init() {
    const rSel = document.getElementById('race-select');
    Object.keys(raceDB).forEach(r => rSel.add(new Option(r, r)));
    rSel.addEventListener('change', e => handleRaceChange(e.target.value));

    document.getElementById('hindrance-add').addEventListener('change', e => {
        if (e.target.value) {
            window.addHind(e.target.value);
            e.target.value = "";
        }
    });

    document.getElementById('skill-add').addEventListener('change', e => {
        if (e.target.value) {
            char.skills[e.target.value] = 4;
            render();
        }
    });

    document.getElementById('char-name').addEventListener('input', e => {
        char.name = e.target.value;
    });

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
        Object.entries(raceDB[newRace].modifiers).forEach(([a, v]) => {
            char.attributes[a] = v;
        });
    }

    char.skills = {};
    Object.entries(skillLinks).forEach(([n, d]) => {
        if (d.core) char.skills[n] = 4;
    });

    render();
}

function pruneInvalidSelections() {
    const meets = (req) => Object.entries(req || {}).every(([k, v]) =>
        (char.attributes[k] || char.skills[k] || 0) >= v
    );

    // Remove edges that no longer qualify
    char.chosenEdges = char.chosenEdges.filter(name => {
        const edge = edgeDB.find(e => e.name === name);
        return edge && meets(edge.req);
    });

    // Remove gear that no longer qualifies
    char.chosenGear = char.chosenGear.filter(name => {
        const item = gearDB.find(g => g.name === name);
        return item && meets(item.req);
    });
}

init();