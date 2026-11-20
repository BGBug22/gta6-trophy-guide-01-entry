// Neon Coastal Trophy Guide — offline tracker for the 55 official PS5 trophies.
// Progress lives in localStorage; export/import moves it between browsers.
// Every guide is written in our own words; each step cites its sources by name.

const KEY_EARNED = 'neon-coastal-progress-v1';
const KEY_COUNTS = 'neon-coastal-counts-v1';
const KEY_SPOILER = 'neon-coastal-spoiler-v1';

const STAGES = {
  1: { name: 'S1 · First Light', note: 'Chapter 1' },
  2: { name: 'S2 · Rising Heat', note: 'Chapter 2' },
  3: { name: 'S3 · Neon Nights', note: 'Chapter 3' },
  4: { name: 'S4 · High Water', note: 'Chapter 4' },
  5: { name: 'S5 · Last Run', note: 'Finale' },
  6: { name: 'S6 · Side Currents', note: 'Strangers & activities' },
  7: { name: 'S7 · Open Water', note: 'Free-roam cleanup' },
};
const KIND_LABEL = { story: 'Story', activities: 'Activities', side: 'Side', collectibles: 'Collectibles', crime: 'Crime', mystery: 'Mystery', money: 'Money', goal: 'Goal' };
const CHIPS = [
  ['all', 'All 55'], ['story', 'Story'], ['missable', 'Missable'], ['collectibles', 'Collectibles'],
  ['activities', 'Activities'], ['side', 'Side'], ['crime', 'Crime'], ['mystery', 'Mystery'],
  ['money', 'Money'], ['online', 'Online'], ['unearned', 'Unearned only'],
];

const doc = await (await fetch('data/trophies.json')).json();
const trophies = doc.trophies;
const sources = doc.sources;

let earned = new Set(JSON.parse(localStorage.getItem(KEY_EARNED) ?? '[]'));
let counts = JSON.parse(localStorage.getItem(KEY_COUNTS) ?? '{}');
let spoiler = localStorage.getItem(KEY_SPOILER) === '1';
let filter = 'all';
let grade = 'all';
let query = '';
let selected = 28; // Positive Mental Attitude: the one possibly-missable trophy, open on load.

const $ = (id) => document.getElementById(id);
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const isHidden = (t) => spoiler && t.kind === 'story' && !earned.has(t.name);
const srcName = (n) => (sources.find((s) => s.n === n) || { name: 'Source ' + n }).name;
const cites = (src) => src.map((n) => `<span class="cite">[${n}]</span>`).join(' ');

function save() {
  localStorage.setItem(KEY_EARNED, JSON.stringify([...earned]));
  localStorage.setItem(KEY_COUNTS, JSON.stringify(counts));
  localStorage.setItem(KEY_SPOILER, spoiler ? '1' : '0');
}

function auditNumbers() {
  const steps = trophies.flatMap((t) => t.steps);
  const cited = steps.filter((s) => s.src && s.src.length).length;
  const single = trophies.filter((t) => {
    const used = new Set(t.steps.flatMap((s) => s.src));
    return used.size <= 1;
  }).length;
  return {
    steps: steps.length, cited,
    missable: trophies.filter((t) => t.missable).length,
    watch: trophies.filter((t) => t.watch).length,
    unconfirmed: trophies.filter((t) => t.unconfirmed).length,
    single,
    disagree: trophies.filter((t) => t.disagree).length,
  };
}

function renderHeader() {
  const n = earned.size;
  $('progress').textContent = `${n}/55 earned`;
  const g = (gr) => trophies.filter((t) => t.grade === gr && earned.has(t.name)).length;
  const tot = (gr) => trophies.filter((t) => t.grade === gr).length;
  $('gradeCounts').textContent = `P ${g('platinum')}/${tot('platinum')} · G ${g('gold')}/${tot('gold')} · S ${g('silver')}/${tot('silver')} · B ${g('bronze')}/${tot('bronze')}`;
  $('progressFill').style.width = `${Math.round((n / 55) * 100)}%`;
  $('spoilerToggle').checked = spoiler;
}

function renderAudit() {
  const a = auditNumbers();
  const html = `<b>AUDIT</b> 55 official · 1P 2G 6S 46B · 28 hidden · 55/55 guides cite a source · ${a.cited}/${a.steps} steps cited · 7 sources read 20 Nov 2026 · ${a.missable} possibly missable · ${a.watch} watch · ${a.unconfirmed} unconfirmed · ${a.single} single-source · ${a.disagree} disagree`;
  $('audit').innerHTML = html;
  const box = $('auditBox');
  if (box) box.innerHTML = html;
}

function chipCount(kind) {
  if (kind === 'all') return trophies.length;
  if (kind === 'missable') return trophies.filter((t) => t.missable || t.watch).length;
  if (kind === 'online') return 0;
  if (kind === 'unearned') return trophies.filter((t) => !earned.has(t.name)).length;
  return trophies.filter((t) => t.kind === kind).length;
}

function renderChips() {
  $('chips').innerHTML = CHIPS.map(([k, label]) =>
    `<button type="button" class="chip${filter === k ? ' active' : ''}" data-chip="${k}">${label} ${chipCount(k)}</button>`).join('');
  document.querySelectorAll('[data-chip]').forEach((b) =>
    b.addEventListener('click', () => { filter = b.dataset.chip; renderAll(); }));
}

function visibleTrophies() {
  return trophies.filter((t) => {
    if (grade !== 'all' && t.grade !== grade) return false;
    if (query && !t.name.toLowerCase().includes(query)) return false;
    if (filter === 'missable') return t.missable || t.watch;
    if (filter === 'online') return false;
    if (filter === 'unearned') return !earned.has(t.name);
    if (filter !== 'all' && t.kind !== filter) return false;
    return true;
  });
}

function flagHtml(t) {
  let h = '';
  if (t.missable) h += '<span class="flag miss">POSSIBLY MISSABLE</span>';
  if (t.watch) h += '<span class="flag watch">WATCH</span>';
  if (t.unconfirmed) h += '<span class="flag unconf">UNCONFIRMED</span>';
  if (t.disagree) h += '<span class="flag disagree">SOURCES DISAGREE</span>';
  return h;
}

function renderList() {
  const vis = visibleTrophies();
  $('shownCount').textContent = filter === 'online'
    ? 'No online trophies in the official list — all 55 are earned in single-player.'
    : `${vis.length} shown of 55.`;
  $('list').innerHTML = vis.map((t) => {
    const done = earned.has(t.name);
    const hidden = isHidden(t);
    const name = hidden ? 'Hidden story trophy' : esc(t.name);
    const desc = hidden ? 'Earn it to reveal its name and description.' : esc(t.description);
    return `<li class="${t.id === selected ? 'sel' : ''}">
      <label>
        <input type="checkbox" data-id="${t.id}" ${done ? 'checked' : ''}>
        <span>
          <span class="tName${done ? ' done' : ''} ${hidden ? 'hiddenName' : ''}">${name}</span>
          <span class="badge ${t.grade}">${t.grade.toUpperCase()}</span><br>
          <span class="tDesc">${desc}</span><br>${flagHtml(t)}
        </span>
      </label>
    </li>`;
  }).join('');
  document.querySelectorAll('#list input[type=checkbox]').forEach((box) =>
    box.addEventListener('change', () => {
      const t = trophies.find((x) => x.id === Number(box.dataset.id));
      if (box.checked) earned.add(t.name); else earned.delete(t.name);
      save(); renderAll();
    }));
  document.querySelectorAll('#list li').forEach((li) =>
    li.addEventListener('click', (e) => {
      if (e.target.tagName === 'INPUT') return;
      const box = li.querySelector('input');
      selected = Number(box.dataset.id);
      renderAll();
    }));
}

function renderDetail() {
  const t = trophies.find((x) => x.id === selected) || trophies[0];
  const done = earned.has(t.name);
  const hidden = isHidden(t);
  const used = [...new Set(t.steps.flatMap((s) => s.src))].sort((a, b) => a - b);
  const name = hidden ? 'Hidden story trophy' : esc(t.name);
  const desc = hidden ? 'Earn it to reveal its name and description.' : esc(t.description);
  const countHtml = t.count ? `<div class="countBox">
      <b>YOUR COUNT — <span id="countNow">${counts[t.id] ?? 0}</span> / ${t.count.n} ${esc(t.count.label)}</b><br>
      <input id="countInput" type="number" min="0" max="${t.count.n}" value="${counts[t.id] ?? 0}" aria-label="Your count">
      <span>of ${t.count.n} ${esc(t.count.label)}</span>
    </div>` : '';
  $('detail').innerHTML = `
    <h2>${name} <span class="badge ${t.grade}">${t.grade.toUpperCase()}</span></h2>
    <p>${flagHtml(t)} <span class="srcNote">${STAGES[t.stage].name} · ${STAGES[t.stage].note} · ${KIND_LABEL[t.kind]}</span></p>
    <p class="official"><b>OFFICIAL DESCRIPTION</b><br>${desc}</p>
    <h3>In short</h3>
    <p>${esc(t.guide)}</p>
    <h3>How to get it · in our own words</h3>
    <ol class="steps">${t.steps.map((s) => `<li>${esc(s.text)} ${cites(s.src)}</li>`).join('')}</ol>
    ${t.disagree ? `<div class="disBox"><b>Sources disagree — both versions shown.</b><br>Guides do not agree on this one; the steps above carry both readings so you can judge for yourself.</div>` : ''}
    ${countHtml}
    <button type="button" class="markBtn${done ? ' earned' : ''}" id="markBtn">${done ? '✓ Earned — click to unmark' : 'Mark earned'}</button>
    <p class="srcNote">Sources for this guide: ${used.map((n) => `[${n}] ${esc(srcName(n))}`).join(', ')}.</p>`;
  $('markBtn').addEventListener('click', () => {
    if (earned.has(t.name)) earned.delete(t.name); else earned.add(t.name);
    save(); renderAll();
  });
  const ci = $('countInput');
  if (ci) ci.addEventListener('change', () => {
    const v = Math.max(0, Math.min(t.count.n, Number(ci.value) || 0));
    counts[t.id] = v; save();
    $('countNow').textContent = String(v);
  });
}

function renderSources() {
  const html = sources.map((s) => {
    const n = trophies.filter((t) => t.steps.some((st) => st.src.includes(s.n))).length;
    return `<li><b>[${s.n}] ${esc(s.name)}</b> <span class="srcCount">— cited by ${n} of 55 guides</span></li>`;
  }).join('');
  $('sourcesList').innerHTML = html;
  $('sourcesFull').innerHTML = html;
}

function renderRoadmap() {
  const total = trophies.length;
  $('goalBar').innerHTML = `<p class="big">GOAL · 100% AND THE PLATINUM — ${earned.size}/${total} trophies</p>
    <div class="bar"><div class="fill" style="width:${Math.round((earned.size / total) * 100)}%"></div></div>
    <p>Platinum “Vice Got a Price!” unlocks when the other 54 are earned.</p>`;
  $('stages').innerHTML = Object.entries(STAGES).map(([num, st]) => {
    const inStage = trophies.filter((t) => t.stage === Number(num));
    const done = inStage.filter((t) => earned.has(t.name)).length;
    const pct = inStage.length ? Math.round((done / inStage.length) * 100) : 0;
    return `<div class="stage"><h3>${esc(st.name)} — ${esc(st.note)}</h3>
      <p>${done}/${inStage.length} earned</p>
      <div class="sbar"><div style="width:${pct}%"></div></div>
      <ul>${inStage.map((t) => `<li>${earned.has(t.name) ? '✓ ' : '○ '}${isHidden(t) ? 'Hidden story trophy' : esc(t.name)}${t.missable || t.watch ? ' ⚠' : ''}</li>`).join('')}</ul>
    </div>`;
  }).join('');
}

function renderAll() {
  renderHeader(); renderAudit(); renderChips(); renderList(); renderDetail(); renderSources(); renderRoadmap();
}

document.querySelectorAll('.tabs button').forEach((b) =>
  b.addEventListener('click', () => {
    document.querySelectorAll('.tabs button').forEach((x) => x.classList.toggle('active', x === b));
    document.querySelectorAll('.tabpage').forEach((p) => { p.hidden = p.id !== 'tab-' + b.dataset.tab; });
  }));

$('gradeSelect').addEventListener('change', (e) => { grade = e.target.value; renderAll(); });
$('searchInput').addEventListener('input', (e) => { query = e.target.value.trim().toLowerCase(); renderAll(); });
$('spoilerToggle').addEventListener('change', (e) => { spoiler = e.target.checked; save(); renderAll(); });
$('resetBtn').addEventListener('click', () => {
  earned = new Set(); counts = {}; save(); renderAll();
});
$('exportBtn').addEventListener('click', () => {
  const blob = new Blob([JSON.stringify({ earned: [...earned], counts }, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'neon-coastal-progress.json';
  a.click();
  URL.revokeObjectURL(a.href);
});
$('importFile').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  try {
    const data = JSON.parse(await file.text());
    const names = new Set(trophies.map((t) => t.name));
    earned = new Set((data.earned ?? []).filter((n) => names.has(n)));
    counts = {};
    for (const [k, v] of Object.entries(data.counts ?? {})) {
      const t = trophies.find((x) => x.id === Number(k));
      if (t && t.count) counts[k] = Math.max(0, Math.min(t.count.n, Number(v) || 0));
    }
    save(); renderAll();
  } catch { /* a bad file changes nothing */ }
  e.target.value = '';
});

renderAll();
