// Neon Coastal Trophy Guide: offline checklist + tracker for the 55 GTA VI trophies.
// Progress, counters and notes live in localStorage; export/import moves them as JSON.
const KEY = 'neon-coastal-guide-v5';
const KIND_LABEL = { story: 'Story', collectibles: 'Collectibles', activities: 'Activities', crime: 'Crime', odd: 'Odd ones', platinum: 'Platinum' };
const STAGES = [
  ['S1', 'Story — Chapters 1 to 4 and the finale', 'Play the story in order. Keep a manual save at the start and end of every chapter: there is no mission replay. Finish Gone Fishing, the four chapters, and the final mission.'],
  ['S2', 'The one missable — meditate in Chapter 1', 'Do the balcony meditation with Lucia at Jason\u2019s house in Chapter 1, right after Down to Earth, before the chapter ends. It is the only trophy the guides flag as possibly missable.'],
  ['S3', 'Character finales and strangers', 'Finish the final missions for Andy (Lucia-only), Kenton, Billy, Randy and Tyrone (Jason-only), plus Bret\u2019s hunt. Then clear 8 stranger mission strands across Leonida.'],
  ['S4', 'Activities and skills', 'Gold all 42 Shooting Range challenges, win drone races at all 14 Top Fun spots, win 20 different races, land 250 stunts, try all 9 activity types, beat Cal at fishing, finish an arcade game, and clear 50 challenges.'],
  ['S5', 'Collectibles and the map', 'Scan 100 WAiNK spots, discover 100 vehicles, complete 3 card sets, explore all 52 areas of Leonida, buy all 8 garages, and register 10 vehicles in the Scooter Bros app. Meditate at the remaining 17 spots.'],
  ['S6', 'Crime and money', 'Rob 5 bank vaults, an armored truck and a jewelry store undetected; rob one illegal operation of each of the 9 gangs; take down 5 enemies in one Combat Focus; lose a 4-star wanted level with your partner; rob 3 shops in a row without losing the heat; launder $250,000 and spend $100,000.'],
  ['S7', 'Odd ones and the platinum', 'The quiet moments: a cocktail on Ocean Beach, smashing out of a showroom, bowling at Kolt & Associates, and the rest of the odd ones. Then clear the 100% Completion checklist (A Long Road) and the platinum pops.'],
];
const [trophiesDoc, sourcesDoc] = await Promise.all([
  (await fetch('data/trophies.json')).json(),
  (await fetch('data/sources.json')).json(),
]);
const TROPHIES = trophiesDoc.trophies;
const SOURCES = new Map(sourcesDoc.sources.map((s) => [s.key, s]));
const byId = new Map(TROPHIES.map((t) => [t.id, t]));
let store = { earned: [], counters: {}, notes: {}, spoiler: false };
try { Object.assign(store, JSON.parse(localStorage.getItem(KEY) ?? '{}')); } catch { /* fresh start */ }
let earned = new Set(store.earned);
let counters = store.counters || {};
let notes = store.notes || {};
let spoiler = !!store.spoiler;
let filter = 'all';
let query = '';
let selected = 1;

const $ = (id) => document.getElementById(id);
function save() {
  store = { earned: [...earned], counters, notes, spoiler };
  localStorage.setItem(KEY, JSON.stringify(store));
}
function fmt(n) { return n.toLocaleString('en-US'); }
function counterOf(t) { return t.counter ? (counters[t.id] ?? 0) : null; }
function setCounter(t, v) {
  const c = t.counter;
  if (!c) return;
  counters[t.id] = Math.max(0, Math.min(c.target, v));
  if (counters[t.id] >= c.target) earned.add(t.name);
  save();
}
function visibleName(t) {
  if (spoiler && t.hidden && !earned.has(t.name)) return 'Hidden trophy';
  return t.name;
}
function visibleDesc(t) {
  if (spoiler && t.hidden && !earned.has(t.name)) return 'Hidden until earned — turn off the spoiler shield to reveal it.';
  return t.description;
}
function gradeBadge(t) {
  return `<span class="badge">${t.grade}</span>`;
}
function renderPills() {
  const hidden = TROPHIES.filter((t) => t.hidden).length;
  const withCounters = TROPHIES.filter((t) => t.counter).length;
  $('pills').innerHTML = [
    `${TROPHIES.length} official trophies`,
    `${earned.size} earned`,
    `${hidden} hidden`,
    `1 missable`,
    `${withCounters} with counters`,
  ].map((p) => `<span class="pill">${p}</span>`).join('');
  $('progress').textContent = `${earned.size} of ${TROPHIES.length} earned`;
  $('barfill').style.width = `${(earned.size / TROPHIES.length) * 100}%`;
}
function renderFilters() {
  const counts = { all: TROPHIES.length };
  for (const t of TROPHIES) counts[t.kind] = (counts[t.kind] ?? 0) + 1;
  counts.missable = TROPHIES.filter((t) => t.missable).length;
  const defs = [
    ['all', `All (${counts.all})`], ['story', `Story (${counts.story})`],
    ['missable', `Missable (${counts.missable})`], ['collectibles', `Collectibles (${counts.collectibles})`],
    ['activities', `Activities (${counts.activities})`], ['crime', `Crime (${counts.crime})`],
    ['odd', `Odd ones (${counts.odd})`], ['platinum', `Platinum (${counts.platinum})`],
    ['online', 'Online'],
  ];
  $('filters').innerHTML = defs.map(([k, label]) =>
    `<button type="button" class="fbtn${filter === k ? ' on' : ''}" data-f="${k}">${label}</button>`).join('');
  $('filters').querySelectorAll('.fbtn').forEach((b) =>
    b.addEventListener('click', () => { filter = b.dataset.f; render(); }));
}
function matchFilter(t) {
  if (filter === 'all') return true;
  if (filter === 'missable') return !!t.missable;
  if (filter === 'online') return t.kind === 'online';
  return t.kind === filter;
}
function matchQuery(t) {
  if (!query) return true;
  const q = query.toLowerCase();
  return (t.name + ' ' + t.description + ' ' + t.guide).toLowerCase().includes(q);
}
function renderRows() {
  const list = TROPHIES.filter((t) => matchFilter(t) && matchQuery(t));
  const ul = $('rows');
  ul.replaceChildren();
  if (!list.length) {
    const li = document.createElement('li');
    li.textContent = filter === 'online'
      ? 'No online trophies — every one of the 55 is offline single-player.'
      : 'No trophies match this filter.';
    ul.append(li);
    return;
  }
  for (const t of list) {
    const li = document.createElement('li');
    if (t.id === selected) li.classList.add('sel');
    if (earned.has(t.name)) li.classList.add('done');
    const box = document.createElement('input');
    box.type = 'checkbox';
    box.checked = earned.has(t.name);
    box.setAttribute('aria-label', `Earned: ${t.name}`);
    box.addEventListener('change', (e) => {
      e.stopPropagation();
      if (box.checked) earned.add(t.name); else earned.delete(t.name);
      save(); render();
    });
    li.append(box, document.createTextNode(' '));
    const nm = document.createElement('span');
    nm.className = 'tname';
    nm.textContent = visibleName(t);
    li.append(nm);
    const badges = document.createElement('span');
    badges.innerHTML = ' ' + gradeBadge(t)
      + (t.hidden ? '<span class="badge hidden">Hidden</span>' : '')
      + (t.missable ? '<span class="badge miss">Missable</span>' : '');
    li.append(badges);
    const d = document.createElement('div');
    d.className = 'tdesc';
    d.textContent = visibleDesc(t);
    li.append(d);
    if (t.counter) {
      const c = document.createElement('div');
      c.className = 'counter';
      const v = counterOf(t);
      c.textContent = `${fmt(v)} / ${fmt(t.counter.target)} ${t.counter.unit} `;
      const minus = document.createElement('button');
      minus.type = 'button'; minus.textContent = '−';
      minus.addEventListener('click', (e) => { e.stopPropagation(); setCounter(t, v - 1); render(); });
      const plus = document.createElement('button');
      plus.type = 'button'; plus.textContent = '+';
      plus.addEventListener('click', (e) => { e.stopPropagation(); setCounter(t, v + 1); render(); });
      c.append(minus, plus);
      li.append(c);
    }
    li.addEventListener('click', () => { selected = t.id; render(); });
    ul.append(li);
  }
}
function renderDetail() {
  const t = byId.get(selected) || TROPHIES[0];
  const el = $('detail');
  el.replaceChildren();
  const h = document.createElement('h3');
  h.textContent = visibleName(t);
  const meta = document.createElement('p');
  meta.className = 'meta';
  meta.textContent = `${t.grade.toUpperCase()} · Stage ${t.stage} · ${KIND_LABEL[t.kind] ?? t.kind}`
    + (t.hidden ? ' · Hidden' : '') + (t.missable ? ' · MISSABLE' : '');
  const desc = document.createElement('p');
  desc.innerHTML = `<em>${visibleDesc(t).replace(/&/g, '&amp;').replace(/</g, '&lt;')}</em>`;
  const g = document.createElement('p');
  g.textContent = t.guide;
  const st = document.createElement('h4');
  st.textContent = 'Steps';
  const ol = document.createElement('ol');
  for (const s of t.steps) {
    const li = document.createElement('li');
    li.textContent = s;
    ol.append(li);
  }
  el.append(h, meta, desc, g, st, ol);
  if (t.counter) {
    const c = document.createElement('p');
    c.className = 'counter';
    const v = counterOf(t);
    c.textContent = `Progress: ${fmt(v)} / ${fmt(t.counter.target)} ${t.counter.unit} `;
    const minus = document.createElement('button');
    minus.type = 'button'; minus.textContent = '−';
    minus.addEventListener('click', () => { setCounter(t, v - 1); render(); });
    const plus = document.createElement('button');
    plus.type = 'button'; plus.textContent = '+';
    plus.addEventListener('click', () => { setCounter(t, v + 1); render(); });
    c.append(minus, plus);
    el.append(c);
  }
  const nb = document.createElement('div');
  nb.className = 'notebox';
  const lab = document.createElement('label');
  lab.textContent = '✎ My Notes';
  const ta = document.createElement('textarea');
  ta.value = notes[t.id] ?? '';
  ta.placeholder = 'Your own notes for this trophy…';
  ta.addEventListener('input', () => { notes[t.id] = ta.value; save(); });
  nb.append(lab, ta);
  el.append(nb);
}
function renderSrcPanel() {
  const t = byId.get(selected) || TROPHIES[0];
  const el = $('srcpanel');
  el.replaceChildren();
  for (const key of t.sources) {
    const s = SOURCES.get(key);
    if (!s) continue;
    const d = document.createElement('div');
    d.className = 'srcitem';
    if (s.status === 'live') {
      const a = document.createElement('a');
      a.href = s.url; a.target = '_blank'; a.rel = 'noopener noreferrer';
      a.textContent = s.name;
      const b = document.createElement('span');
      b.innerHTML = ' <span class="badge live">Live link</span>';
      d.append(a, b);
    } else {
      const b = document.createElement('b');
      b.textContent = s.name;
      const badge = document.createElement('span');
      badge.innerHTML = ' <span class="badge text">Text only</span>';
      d.append(b, badge);
    }
    const note = document.createElement('span');
    note.className = 'note';
    note.textContent = s.note;
    d.append(note);
    el.append(d);
  }
  const p = document.createElement('p');
  p.className = 'note';
  p.textContent = 'Sources: ' + t.sources.map((k) => SOURCES.get(k)?.name ?? k).join(', ') + '.';
  el.append(p);
}
function renderRoadmap() {
  const el = $('roadmap');
  el.replaceChildren();
  for (const [code, title, text] of STAGES) {
    const div = document.createElement('div');
    div.className = 'stage';
    const h = document.createElement('h3');
    h.innerHTML = `<span class="snum">${code}</span>`;
    h.append(document.createTextNode(title));
    const p = document.createElement('p');
    p.textContent = text;
    const chips = document.createElement('div');
    chips.className = 'chips';
    for (const t of TROPHIES.filter((x) => x.stage === code)) {
      const c = document.createElement('span');
      c.className = 'chip' + (earned.has(t.name) ? ' done' : '');
      c.textContent = visibleName(t);
      c.title = t.name;
      chips.append(c);
    }
    div.append(h, p, chips);
    el.append(div);
  }
}
function renderSourcesTab() {
  const el = $('srclist');
  el.replaceChildren();
  for (const s of sourcesDoc.sources) {
    const d = document.createElement('div');
    d.className = 'srcitem';
    if (s.status === 'live') {
      const a = document.createElement('a');
      a.href = s.url; a.target = '_blank'; a.rel = 'noopener noreferrer';
      a.textContent = s.name;
      const b = document.createElement('span');
      b.innerHTML = ' <span class="badge live">Live link</span>';
      d.append(a, b);
    } else {
      const b = document.createElement('b');
      b.textContent = s.name;
      const badge = document.createElement('span');
      badge.innerHTML = ' <span class="badge text">Text only</span>';
      d.append(b, badge);
    }
    const note = document.createElement('span');
    note.className = 'note';
    note.textContent = s.note;
    d.append(note);
    el.append(d);
  }
  const hidden = TROPHIES.filter((t) => t.hidden).length;
  const withCounters = TROPHIES.filter((t) => t.counter).length;
  $('flags').innerHTML = [
    ['Total trophies', `55 (1 platinum, 2 gold, 6 silver, 46 bronze)`],
    ['Hidden', `${hidden} (spoiler shield hides them until earned)`],
    ['Missable', `1 — Positive Mental Attitude`],
    ['Online', `0 — every trophy is offline single-player`],
    ['With a counter', `${withCounters} trophies carry a sub-progress counter`],
    ['Earned so far', `${earned.size} of 55`],
  ].map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join('');
  $('audit').innerHTML = [
    '55 official names, each with a guide that cites its sources.',
    '10 sources: 7 verified HTTP 200 (linked) and 3 HTTP 403 (text only).',
    'Offline by design: the app loads only its own files and makes no network request.',
    'Progress saves in localStorage and exports to / imports from a JSON file.',
    'Roadmap S1–S7 in order, with the one missable trophy flagged in S2.',
  ].map((x) => `<li>${x}</li>`).join('');
}
function render() {
  renderPills();
  renderFilters();
  renderRows();
  renderDetail();
  renderSrcPanel();
  renderRoadmap();
  renderSourcesTab();
}
function showTab(name) {
  for (const n of ['checklist', 'roadmap', 'sources']) {
    $('tab-' + n).classList.toggle('active', n === name);
    $('panel-' + n).hidden = n !== name;
  }
}
$('tab-checklist').addEventListener('click', () => showTab('checklist'));
$('tab-roadmap').addEventListener('click', () => showTab('roadmap'));
$('tab-sources').addEventListener('click', () => showTab('sources'));
$('search').addEventListener('input', (e) => { query = e.target.value.trim(); renderRows(); });
$('spoiler').checked = spoiler;
$('spoiler').addEventListener('change', (e) => { spoiler = e.target.checked; save(); render(); });
$('export').addEventListener('click', () => {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([JSON.stringify(store, null, 2)], { type: 'application/json' }));
  a.download = 'gta6-trophy-progress.json';
  a.click();
});
$('import').addEventListener('change', async (e) => {
  const file = e.target.files[0];
  if (!file) return;
  try {
    const data = JSON.parse(await file.text());
    earned = new Set(data.earned ?? []);
    counters = data.counters ?? {};
    notes = data.notes ?? {};
    spoiler = !!data.spoiler;
    $('spoiler').checked = spoiler;
    save(); render();
  } catch { /* keep current progress on a bad file */ }
  e.target.value = '';
});
render();
