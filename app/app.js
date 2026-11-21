// Neon Coastal — GTA VI Trophy Guide & Tracker (app.js).
// Static, offline, no network at run time. Loads its own data files only:
// data/trophies.json (the 55 official trophies + fresh guides) and
// data/sources.json (the 10 cited sources). Progress lives in localStorage
// and can be exported to a file and imported back.

const STORE_KEY = 'neon-coastal-gta6-guide-v4';
const KIND_LABELS = {
  all: 'All', story: 'Story', missable: 'Missable', collectibles: 'Collectibles',
  activities: 'Activities', crime: 'Crime', odd: 'Odd ones', platinum: 'Platinum', online: 'Online',
};
const KIND_ORDER = ['all', 'story', 'missable', 'collectibles', 'activities', 'crime', 'odd', 'platinum', 'online'];

const ROADMAP = [
  { id: 'S1', title: 'Story — Chapters 1 to 4 and the finale', body: 'Play the story in order. Keep a manual save at the start and end of every chapter: there is no mission replay. Finish Gone Fishing, the four chapters, and the final mission.', trophies: [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13] },
  { id: 'S2', title: 'The one missable — meditate in Chapter 1', body: 'Do the balcony meditation with Lucia at Jason\u2019s house in Chapter 1, right after Down to Earth, before the chapter ends. It is the only trophy the guides flag as possibly missable.', trophies: [28] },
  { id: 'S3', title: 'Character finales and strangers', body: 'Finish the final missions for Andy (Lucia-only), Kenton, Billy, Randy and Tyrone (Jason-only), plus Bret\u2019s hunt. Then clear 8 stranger mission strands across Leonida.', trophies: [22, 23, 24, 26, 27, 29, 25] },
  { id: 'S4', title: 'Activities and skills', body: 'Gold all 42 Shooting Range challenges, win drone races at all 14 Top Fun spots, win 20 different races, land 250 stunts, try all 9 activity types, beat Cal at fishing, finish an arcade game, and clear 50 challenges.', trophies: [17, 18, 19, 15, 16, 20, 21, 32] },
  { id: 'S5', title: 'Collectibles and the map', body: 'Scan 100 WAiNK spots, discover 100 vehicles, complete 3 card sets, explore all 52 areas of Leonida, buy all 8 garages, and register 10 vehicles in the Scooter Bros app. Meditate at the remaining 17 spots.', trophies: [31, 35, 30, 42, 54, 55, 28] },
  { id: 'S6', title: 'Crime and money', body: 'Rob 5 bank vaults, an armored truck and a jewelry store undetected; hit one illegal operation for each of the 9 gangs; lose a 4-star wanted level with your partner; rob 3 shops back-to-back; drop 5 enemies in one Combat Focus. Launder $250,000 in Marked Bills and spend $100,000 in shops.', trophies: [40, 41, 39, 43, 33, 34, 36, 52, 53] },
  { id: 'S7', title: '100%, the odd ones, and the platinum', body: 'Finish the 100% Completion checklist (70 of 80 challenges; every robbery, underwater discovery, shooting range, drone race and Bret quest). Then sweep the odd one-off trophies and watch the platinum pop.', trophies: [14, 44, 45, 46, 47, 48, 49, 50, 51, 1] },
];

let trophies = [];
let sources = [];
let state = { earned: {}, counts: {}, notes: {}, spoiler: true, filter: 'all', search: '', selected: null };

function loadState() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return;
    const saved = JSON.parse(raw);
    if (saved && typeof saved === 'object') {
      state.earned = saved.earned && typeof saved.earned === 'object' ? saved.earned : {};
      state.counts = saved.counts && typeof saved.counts === 'object' ? saved.counts : {};
      state.notes = saved.notes && typeof saved.notes === 'object' ? saved.notes : {};
      state.spoiler = saved.spoiler !== false;
    }
  } catch (e) { /* a corrupt save is ignored; the tracker starts fresh */ }
}
function saveState() {
  try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (e) { /* storage full or blocked; the page still works */ }
}
function trophyById(id) { return trophies.find(function (t) { return t.id === id; }); }
function isHidden(t) { return t.hidden === true; }
function isSpoilered(t) { return state.spoiler && isHidden(t) && !state.earned[t.id]; }
function gradeLabel(g) { return g.charAt(0).toUpperCase() + g.slice(1); }
function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
function fmtCount(n) { return Number(n).toLocaleString('en-US'); }

function visibleTrophies() {
  const q = state.search.trim().toLowerCase();
  return trophies.filter(function (t) {
    if (state.filter === 'online') return false;
    if (state.filter === 'missable') { if (!t.missable) return false; }
    else if (state.filter !== 'all' && t.kind !== state.filter) return false;
    if (q) {
      const hay = (t.name + ' ' + t.description + ' ' + (t.guide || '')).toLowerCase();
      if (hay.indexOf(q) === -1) return false;
    }
    return true;
  });
}

function renderPills() {
  const earned = trophies.filter(function (t) { return state.earned[t.id]; }).length;
  const hiddenCount = trophies.filter(isHidden).length;
  const missableCount = trophies.filter(function (t) { return t.missable; }).length;
  const counted = trophies.filter(function (t) { return typeof t.target === 'number'; }).length;
  const pills = [
    '55 official trophies',
    earned + ' earned',
    hiddenCount + ' hidden',
    missableCount + ' missable',
    counted + ' with counters',
  ];
  document.getElementById('auditPills').innerHTML = pills.map(function (p) {
    return '<span class="pill">' + esc(p) + '</span>';
  }).join('');
}

function renderProgress() {
  const earned = trophies.filter(function (t) { return state.earned[t.id]; }).length;
  const pct = trophies.length ? Math.round((earned / trophies.length) * 100) : 0;
  document.getElementById('progressFill').style.width = pct + '%';
  document.getElementById('progressText').textContent = earned + ' of ' + trophies.length + ' earned';
  document.getElementById('footCount').textContent = trophies.length + ' trophies · 1 platinum, 2 gold, 6 silver, 46 bronze · 28 hidden · 0 online';
}

function renderFilters() {
  const wrap = document.getElementById('filters');
  wrap.innerHTML = '';
  KIND_ORDER.forEach(function (kind) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'filter' + (state.filter === kind ? ' active' : '');
    if (kind === 'online') {
      btn.textContent = 'Online';
    } else if (kind === 'all') {
      btn.textContent = 'All (' + trophies.length + ')';
    } else if (kind === 'missable') {
      btn.textContent = 'Missable (' + trophies.filter(function (t) { return t.missable; }).length + ')';
    } else {
      btn.textContent = KIND_LABELS[kind] + ' (' + trophies.filter(function (t) { return t.kind === kind; }).length + ')';
    }
    btn.addEventListener('click', function () { state.filter = kind; saveState(); renderAll(); });
    wrap.appendChild(btn);
  });
  const note = document.getElementById('filterNote');
  if (state.filter === 'online') {
    note.textContent = 'No online trophies — all 55 are offline single-player, so there is nothing to list here.';
  } else if (state.filter === 'missable') {
    note.textContent = 'Only one trophy is flagged as possibly missable: Positive Mental Attitude. Do its Chapter 1 meditation before the chapter ends.';
  } else {
    note.textContent = '';
  }
}

function renderList() {
  const list = document.getElementById('trophyList');
  const empty = document.getElementById('emptyList');
  list.innerHTML = '';
  const shown = visibleTrophies();
  empty.hidden = shown.length !== 0 || state.filter === 'online';
  if (state.filter === 'online') {
    const li = document.createElement('li');
    li.className = 'trophy-row online-empty';
    li.textContent = 'All 55 trophies are offline single-player. There are no online trophies in this game.';
    list.appendChild(li);
    return;
  }
  shown.forEach(function (t) {
    const li = document.createElement('li');
    li.className = 'trophy-row' + (state.selected === t.id ? ' selected' : '') + (state.earned[t.id] ? ' earned' : '');
    li.dataset.id = t.id;
    const spoil = isSpoilered(t);
    const name = spoil ? 'Hidden trophy' : t.name;
    const desc = spoil ? 'Hidden until earned — turn off Hide story spoilers to reveal it.' : t.description;
    const counter = (typeof t.target === 'number')
      ? '<span class="row-count">' + fmtCount(state.counts[t.id] || 0) + ' / ' + fmtCount(t.target) + ' ' + esc(t.unit || '') + '</span>'
      : '';
    li.innerHTML =
      '<label class="row-check"><input type="checkbox" data-earn="' + t.id + '"' + (state.earned[t.id] ? ' checked' : '') + ' aria-label="Mark ' + esc(name) + ' earned"><span class="checkmark" aria-hidden="true"></span></label>' +
      '<span class="row-grade grade-' + esc(t.grade) + '">' + esc(gradeLabel(t.grade)) + '</span>' +
      '<span class="row-main"><span class="row-name">' + esc(name) + '</span>' +
      '<span class="row-desc">' + esc(desc) + '</span>' + counter + '</span>' +
      (t.missable ? '<span class="row-flag" title="Possibly missable">Missable</span>' : '') +
      (isHidden(t) ? '<span class="row-flag hidden-flag">Hidden</span>' : '');
    li.addEventListener('click', function (ev) {
      if (ev.target && ev.target.matches('input[data-earn]')) return;
      selectTrophy(t.id);
    });
    li.querySelector('input[data-earn]').addEventListener('change', function (ev) {
      setEarned(t.id, ev.target.checked);
    });
    list.appendChild(li);
  });
}

function setEarned(id, on) {
  state.earned[id] = !!on;
  if (!on) { /* un-earning keeps the counter so the count is not lost */ }
  saveState();
  renderProgress();
  renderPills();
  renderList();
  renderDetail();
}

function bumpCount(id, delta) {
  const t = trophyById(id);
  if (!t || typeof t.target !== 'number') return;
  const step = typeof t.step === 'number' && t.step > 0 ? t.step : 1;
  let v = (state.counts[id] || 0) + delta * step;
  if (v < 0) v = 0;
  if (v > t.target) v = t.target;
  state.counts[id] = v;
  if (v >= t.target) state.earned[id] = true; // auto-earn when the counter fills
  saveState();
  renderProgress();
  renderPills();
  renderList();
  renderDetail();
}

function selectTrophy(id) {
  state.selected = id;
  renderList();
  renderDetail();
  renderContextSources();
}

function sourceByName(name) {
  return sources.find(function (s) { return s.name === name; });
}

function renderDetail() {
  const box = document.getElementById('detail');
  const t = state.selected ? trophyById(state.selected) : null;
  if (!t) {
    box.innerHTML = '<p class="muted">Select a trophy on the left to see its guide, steps, counter and notes.</p>';
    return;
  }
  const spoil = isSpoilered(t);
  const note = state.notes[t.id] || '';
  let html = '';
  html += '<h3>' + esc(spoil ? 'Hidden trophy' : t.name) + '</h3>';
  html += '<p class="detail-meta"><span class="row-grade grade-' + esc(t.grade) + '">' + esc(gradeLabel(t.grade)) + '</span> ' +
    (isHidden(t) ? '<span class="row-flag hidden-flag">Hidden</span> ' : '') +
    (t.missable ? '<span class="row-flag">Missable</span> ' : '') +
    '<span class="muted">Stage ' + esc(t.stage || '') + ' &middot; ' + esc(KIND_LABELS[t.kind] || t.kind) + '</span></p>';
  if (spoil) {
    html += '<p>This trophy is hidden on PlayStation until earned. Turn off <strong>Hide story spoilers</strong> to reveal its name, description and guide, or earn it in the game.</p>';
  } else {
    html += '<p class="detail-desc">' + esc(t.description) + '</p>';
    html += '<p>' + esc(t.guide || '') + '</p>';
    if (Array.isArray(t.steps) && t.steps.length) {
      html += '<h4>Steps</h4><ol class="steps">' + t.steps.map(function (s) { return '<li>' + esc(s) + '</li>'; }).join('') + '</ol>';
    }
    if (Array.isArray(t.sources) && t.sources.length) {
      html += '<p class="muted">Sources: ' + t.sources.map(esc).join(', ') + '.</p>';
    }
  }
  if (typeof t.target === 'number') {
    const cur = state.counts[t.id] || 0;
    html += '<div class="counter"><span class="counter-label">Progress</span>' +
      '<button type="button" data-bump="-1" aria-label="Decrease count">&minus;</button>' +
      '<span class="counter-value">' + fmtCount(cur) + ' / ' + fmtCount(t.target) + ' ' + esc(t.unit || '') + '</span>' +
      '<button type="button" data-bump="1" aria-label="Increase count">+</button>' +
      (cur >= t.target ? '<span class="row-flag">Complete</span>' : '') + '</div>';
  }
  html += '<div class="notes"><label>My notes <span class="note-icon" aria-hidden="true">&#9998;</span>' +
    '<textarea id="noteBox" rows="3" placeholder="Your own note for this trophy…" aria-label="My notes for this trophy">' + esc(note) + '</textarea></label></div>';
  box.innerHTML = html;
  box.querySelectorAll('button[data-bump]').forEach(function (b) {
    b.addEventListener('click', function () { bumpCount(t.id, parseInt(b.dataset.bump, 10)); });
  });
  const noteBox = box.querySelector('#noteBox');
  noteBox.addEventListener('input', function () {
    state.notes[t.id] = noteBox.value;
    saveState();
  });
}

function renderContextSources() {
  const box = document.getElementById('contextSources');
  const t = state.selected ? trophyById(state.selected) : null;
  if (!t || !Array.isArray(t.sources) || !t.sources.length) {
    box.innerHTML = '<p class="muted">Sources for the selected trophy appear here.</p>';
    return;
  }
  box.innerHTML = '<ul class="mini-sources">' + t.sources.map(function (name) {
    const s = sourceByName(name);
    if (!s) return '<li>' + esc(name) + '</li>';
    if (s.link) return '<li><a href="' + esc(s.url) + '" target="_blank" rel="noopener noreferrer">' + esc(s.name) + '</a> <span class="live-badge">LIVE LINK</span></li>';
    return '<li>' + esc(s.name) + ' <span class="text-badge">TEXT ONLY</span></li>';
  }).join('') + '</ul>';
}

function renderRoadmap() {
  const ol = document.getElementById('roadmapList');
  ol.innerHTML = '';
  ROADMAP.forEach(function (stage) {
    const li = document.createElement('li');
    li.className = 'roadmap-stage';
    const chips = stage.trophies.map(function (id) {
      const t = trophyById(id);
      if (!t) return '';
      const spoil = isSpoilered(t);
      return '<span class="chip' + (state.earned[id] ? ' earned' : '') + '">' + esc(spoil ? 'Hidden trophy' : t.name) + '</span>';
    }).join('');
    li.innerHTML = '<h3><span class="stage-id">' + esc(stage.id) + '</span> ' + esc(stage.title) + '</h3>' +
      '<p>' + esc(stage.body) + '</p><div class="chips">' + chips + '</div>';
    ol.appendChild(li);
  });
}

function renderSourcesTab() {
  const list = document.getElementById('sourceList');
  list.innerHTML = '';
  sources.forEach(function (s) {
    const li = document.createElement('li');
    li.className = 'source-item';
    const link = s.link
      ? '<a href="' + esc(s.url) + '" target="_blank" rel="noopener noreferrer">' + esc(s.url) + '</a> <span class="live-badge">LIVE LINK</span>'
      : '<span class="muted">' + esc(s.url) + '</span> <span class="text-badge">TEXT ONLY</span>';
    li.innerHTML = '<strong>' + esc(s.name) + '</strong> ' + link + '<p class="muted">' + esc(s.role || '') + '</p>';
    list.appendChild(li);
  });
  const hiddenCount = trophies.filter(isHidden).length;
  const missableList = trophies.filter(function (t) { return t.missable; });
  const counted = trophies.filter(function (t) { return typeof t.target === 'number'; }).length;
  const earned = trophies.filter(function (t) { return state.earned[t.id]; }).length;
  document.getElementById('flagSummary').innerHTML =
    '<dt>Total trophies</dt><dd>55 (1 platinum, 2 gold, 6 silver, 46 bronze)</dd>' +
    '<dt>Hidden</dt><dd>' + hiddenCount + ' (spoiler shield hides them until earned)</dd>' +
    '<dt>Missable</dt><dd>' + missableList.length + ' — ' + missableList.map(function (t) { return esc(t.name); }).join(', ') + '</dd>' +
    '<dt>Online</dt><dd>0 — every trophy is offline single-player</dd>' +
    '<dt>With a counter</dt><dd>' + counted + ' trophies carry a sub-progress counter</dd>' +
    '<dt>Earned so far</dt><dd>' + earned + ' of 55</dd>';
  document.getElementById('auditList').innerHTML =
    '<li>55 official names, each with a guide that cites its sources.</li>' +
    '<li>10 sources: 7 verified HTTP 200 (linked) and 3 HTTP 403 (text only).</li>' +
    '<li>Offline by design: the app loads only its own files and makes no network request.</li>' +
    '<li>Progress saves in localStorage and exports to / imports from a JSON file.</li>' +
    '<li>Roadmap S1–S7 in order, with the one missable trophy flagged in S2.</li>';
}

function renderAll() {
  renderPills();
  renderProgress();
  renderFilters();
  renderList();
  renderDetail();
  renderContextSources();
  renderRoadmap();
  renderSourcesTab();
}

function wireTabs() {
  document.querySelectorAll('.tab').forEach(function (btn) {
    btn.addEventListener('click', function () {
      document.querySelectorAll('.tab').forEach(function (b) {
        b.classList.toggle('active', b === btn);
        b.setAttribute('aria-selected', b === btn ? 'true' : 'false');
      });
      document.querySelectorAll('.panel').forEach(function (p) { p.classList.remove('active'); p.hidden = true; });
      const panel = document.getElementById('tab-' + btn.dataset.tab);
      panel.classList.add('active');
      panel.hidden = false;
    });
  });
}

function wireToolbar() {
  document.getElementById('search').addEventListener('input', function (ev) {
    state.search = ev.target.value;
    renderList();
  });
  document.getElementById('spoiler').checked = state.spoiler;
  document.getElementById('spoiler').addEventListener('change', function (ev) {
    state.spoiler = ev.target.checked;
    saveState();
    renderAll();
  });
  document.getElementById('exportBtn').addEventListener('click', function () {
    const blob = new Blob([JSON.stringify({ earned: state.earned, counts: state.counts, notes: state.notes }, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'gta6-trophy-progress.json';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
  });
  document.getElementById('importFile').addEventListener('change', function (ev) {
    const file = ev.target.files && ev.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function () {
      try {
        const data = JSON.parse(String(reader.result));
        if (data && typeof data === 'object') {
          if (data.earned && typeof data.earned === 'object') state.earned = data.earned;
          if (data.counts && typeof data.counts === 'object') state.counts = data.counts;
          if (data.notes && typeof data.notes === 'object') state.notes = data.notes;
          saveState();
          renderAll();
        }
      } catch (e) { /* a bad file is ignored; the current progress stays */ }
      ev.target.value = '';
    };
    reader.readAsText(file);
  });
}

async function init() {
  loadState();
  const [tRes, sRes] = await Promise.all([fetch('data/trophies.json'), fetch('data/sources.json')]);
  const tData = await tRes.json();
  const sData = await sRes.json();
  trophies = Array.isArray(tData) ? tData : (tData.trophies || []);
  sources = Array.isArray(sData) ? sData : (sData.sources || []);
  if (!state.selected && trophies.length) state.selected = trophies[0].id;
  wireTabs();
  wireToolbar();
  renderAll();
}

init();
