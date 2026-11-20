/* Neon Coastal Trophy Guide — tracker logic, written fresh for this entry.
   No libraries, no network: it reads data/trophies.json from its own folder,
   keeps progress in localStorage, and renders everything from that data. */

const STORAGE_KEY = "neon-coastal-trophy-guide-v3";
const DATA_URL = "data/trophies.json";

const KIND_LABELS = {
  story: "Story",
  missable: "Missable",
  collectibles: "Collectibles",
  activities: "Activities",
};
const KIND_ORDER = ["story", "missable", "collectibles", "activities"];

const FLAG_LABELS = {
  missable: "Possibly missable",
  watch: "Watch",
  unconfirmed: "Unconfirmed",
  disagree: "Sources disagree",
};

const GRADE_LABELS = {
  platinum: "Platinum",
  gold: "Gold",
  silver: "Silver",
  bronze: "Bronze",
};

/* A small sample save used only when the page is opened with ?demo=1,
   so screenshots can show the tracker mid-hunt. Never linked from the UI. */
const DEMO_SEED = {
  earned: { "just-like-paradise": true, "paradise-lost": true, "trust": true },
  progress: { "positive-mental-attitude": 6, "cunning-stunts": 120, "whip-it-good": 45 },
  notes: {
    "positive-mental-attitude":
      "Do the balcony meditation with Lucia in Chapter 1 first — it never comes back.",
  },
};

let DATA = null;
let state = blankState();
let filter = { q: "", kind: "", grade: "" };
let selectedId = null;
let activeTab = "checklist";

function blankState() {
  return { earned: {}, progress: {}, notes: {}, spoilerHide: false };
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return blankState();
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return blankState();
    return {
      earned: parsed.earned && typeof parsed.earned === "object" ? parsed.earned : {},
      progress: parsed.progress && typeof parsed.progress === "object" ? parsed.progress : {},
      notes: parsed.notes && typeof parsed.notes === "object" ? parsed.notes : {},
      spoilerHide: parsed.spoilerHide === true,
    };
  } catch {
    return blankState();
  }
}

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    /* Storage full or blocked: the in-memory state still works for the session. */
  }
}

function trophyById(id) {
  return DATA.trophies.find((t) => t.id === id) || null;
}

function isEarned(t) {
  return state.earned[t.id] === true;
}

function progressOf(t) {
  const v = state.progress[t.id];
  return typeof v === "number" && Number.isFinite(v) ? Math.max(0, v) : 0;
}

function noteOf(t) {
  return typeof state.notes[t.id] === "string" ? state.notes[t.id] : "";
}

/* Spoiler masking: story trophies stay hidden until earned when the
   toggle is on. Only the name and description are masked; the guide
   stays reachable so the player can still find the mission. */
function isMasked(t) {
  return state.spoilerHide && t.spoiler && !isEarned(t);
}

function displayName(t) {
  return isMasked(t) ? "Hidden Story Trophy" : t.name;
}

function displayDesc(t) {
  return isMasked(t) ? "A story trophy. Earn it to reveal its name and description." : t.desc;
}

function fmtCount(value, target, unit) {
  if (unit === "$") {
    const k = (n) => (n >= 1000 ? "$" + Math.round(n / 1000) + "k" : "$" + n);
    return k(value) + " / " + k(target);
  }
  if (unit === "%") return value + "% / " + target + "%";
  return value + " / " + target;
}

function esc(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function sourceById(id) {
  return DATA.sources.find((s) => s.id === id) || null;
}

function sourceLink(s) {
  if (!s) return "";
  if (s.live && s.url) {
    return (
      '<a href="' + esc(s.url) + '" target="_blank" rel="noopener noreferrer">' +
      esc(s.name) + "</a>"
    );
  }
  return esc(s.name) + ' <span class="source-text-only">text only</span>';
}

/* ---------- Audit pills ---------- */

function citedShare() {
  const cited = DATA.trophies.filter(
    (t) => t.steps.length > 0 && t.steps.every((s) => Array.isArray(s.src) && s.src.length > 0),
  ).length;
  return Math.round((cited / DATA.trophies.length) * 100);
}

function renderPills() {
  const missWatch = DATA.trophies.filter(
    (t) => t.flags.includes("missable") || t.flags.includes("watch"),
  ).length;
  const disputes = DATA.trophies.filter((t) => t.flags.includes("disagree")).length;
  const pills = [
    { value: String(DATA.trophies.length), label: "Official trophies" },
    { value: citedShare() + "%", label: "Guides cited" },
    { value: String(missWatch), label: "Missable / Watch" },
    { value: String(disputes), label: "Source disputes" },
    { value: String(DATA.sources.length), label: "Sources cited" },
  ];
  document.getElementById("auditPills").innerHTML = pills
    .map(
      (p) =>
        '<span class="pill"><b>' + esc(p.value) + "</b>" +
        '<span class="pill-label">' + esc(p.label) + "</span></span>",
    )
    .join("");
}

/* ---------- Trophy list ---------- */

function kindCounts() {
  const counts = {};
  for (const t of DATA.trophies) counts[t.kind] = (counts[t.kind] || 0) + 1;
  return counts;
}

function renderKindChips() {
  const counts = kindCounts();
  const chips = [{ kind: "", label: "All " + DATA.trophies.length }];
  for (const kind of KIND_ORDER) {
    if (counts[kind]) chips.push({ kind, label: KIND_LABELS[kind] + " " + counts[kind] });
  }
  document.getElementById("kindChips").innerHTML = chips
    .map(
      (c) =>
        '<button type="button" class="chip' + (filter.kind === c.kind ? " active" : "") +
        '" data-kind="' + esc(c.kind) + '">' + esc(c.label) + "</button>",
    )
    .join("");
  document.querySelectorAll("#kindChips .chip").forEach((btn) => {
    btn.addEventListener("click", () => {
      filter.kind = btn.dataset.kind;
      renderKindChips();
      renderList();
    });
  });
}

function filteredTrophies() {
  const q = filter.q.trim().toLowerCase();
  return DATA.trophies.filter((t) => {
    if (filter.kind && t.kind !== filter.kind) return false;
    if (filter.grade && t.grade !== filter.grade) return false;
    if (q) {
      const hay = (t.name + " " + t.desc).toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

function rowHtml(t) {
  const earned = isEarned(t);
  const masked = isMasked(t);
  const prog = progressOf(t);
  const note = noteOf(t);
  const badges = [];
  if (t.counter) {
    const done = prog >= t.counter.target;
    badges.push(
      '<span class="counter-badge' + (done ? " done" : "") + '">' +
        esc(fmtCount(prog, t.counter.target, t.counter.unit)) + "</span>",
    );
  }
  for (const f of t.flags) {
    badges.push('<span class="flag-dot flag-' + f + '">' + esc(FLAG_LABELS[f]) + "</span>");
  }
  if (note) badges.push('<span class="note-mark" title="Has a personal note">&#9998;</span>');
  return (
    '<li class="trophy-row' + (earned ? " earned" : "") +
    (selectedId === t.id ? " selected" : "") + '" data-id="' + esc(t.id) +
    '" tabindex="0" role="button" aria-label="' + esc(displayName(t)) + '">' +
    '<button type="button" class="trophy-check" data-check="' + esc(t.id) +
    '" role="checkbox" aria-checked="' + earned + '" aria-label="Mark ' +
    esc(displayName(t)) + ' as earned"></button>' +
    '<span class="trophy-main">' +
    '<span class="trophy-name">' + esc(displayName(t)) + "</span>" +
    '<span class="trophy-sub">' + esc(GRADE_LABELS[t.grade]) + " &middot; " +
    esc(KIND_LABELS[t.kind]) + " &middot; " + esc(t.stage) +
    (t.hidden ? ' &middot; <span class="hidden-mark">Hidden</span>' : "") + "</span>" +
    (badges.length ? '<span class="trophy-badges">' + badges.join("") + "</span>" : "") +
    "</span>" +
    '<span class="trophy-side"><span class="grade-badge grade-' + t.grade + '">' +
    esc(GRADE_LABELS[t.grade]) + "</span></span>" +
    "</li>"
  );
}

function renderList() {
  const list = filteredTrophies();
  const el = document.getElementById("trophyList");
  el.innerHTML = list.map(rowHtml).join("");
  document.getElementById("listCount").textContent =
    list.length + " of " + DATA.trophies.length + " trophies shown";
  el.querySelectorAll(".trophy-row").forEach((row) => {
    row.addEventListener("click", (ev) => {
      if (ev.target.closest("[data-check]")) return;
      selectTrophy(row.dataset.id);
    });
    row.addEventListener("keydown", (ev) => {
      if (ev.key === "Enter" || ev.key === " ") {
        ev.preventDefault();
        selectTrophy(row.dataset.id);
      }
    });
  });
  el.querySelectorAll("[data-check]").forEach((btn) => {
    btn.addEventListener("click", (ev) => {
      ev.stopPropagation();
      toggleEarned(btn.dataset.check);
    });
  });
}

function selectTrophy(id) {
  selectedId = id;
  renderList();
  renderDetail();
  renderSourcesPanel();
  const row = document.querySelector('.trophy-row[data-id="' + CSS.escape(id) + '"]');
  if (row) row.scrollIntoView({ block: "nearest" });
}

function toggleEarned(id) {
  const t = trophyById(id);
  if (!t) return;
  state.earned[id] = !isEarned(t);
  if (!state.earned[id] && t.counter) {
    /* Unchecking a staged trophy leaves its counter alone; the counter
       only drives the checkbox upward when it reaches its target. */
  }
  saveState();
  renderAll();
}

/* ---------- Detail panel ---------- */

function renderDetail() {
  const panel = document.getElementById("detailPanel");
  const t = selectedId ? trophyById(selectedId) : null;
  if (!t) {
    panel.innerHTML =
      '<p class="detail-empty">Pick a trophy on the left to see its guide, its sources, its counter and your notes.</p>';
    return;
  }
  const masked = isMasked(t);
  const prog = progressOf(t);
  const note = noteOf(t);
  const earned = isEarned(t);

  let flagHtml = "";
  if (t.flags.includes("missable")) {
    flagHtml +=
      '<div class="flag-note"><b>Possibly missable.</b> This is the one trophy that might be missable: the first meditation, at Jason&rsquo;s house in Chapter 1, disappears after that chapter, and nobody has confirmed yet whether the trophy needs it. Do it to be safe.</div>';
  }
  if (t.flags.includes("unconfirmed")) {
    flagHtml +=
      '<div class="flag-note"><b>Unconfirmed.</b> No guide has pinned the exact trigger down yet. What is written here is the best current report — treat it as a lead, not a fact, and re-check the guides once players crack it.</div>';
  }
  if (t.flags.includes("disagree")) {
    flagHtml +=
      '<div class="flag-note"><b>Sources disagree.</b> One guide reports a concrete method and another still lists the trigger as unconfirmed. Both versions are shown in the steps below — read them before you commit to a route.</div>';
  }
  if (t.flags.includes("watch")) {
    flagHtml +=
      '<div class="flag-note"><b>Watch out.</b> There is a catch here — a character restriction, a partner requirement, or a permanent consequence. Read the steps before you start.</div>';
  }

  let counterHtml = "";
  if (t.counter) {
    const c = t.counter;
    const pct = Math.min(100, Math.round((prog / c.target) * 100));
    const done = prog >= c.target;
    counterHtml =
      '<h3 class="detail-section-title">Sub-progress</h3>' +
      '<div class="counter-box">' +
      '<div class="counter-head"><span class="counter-label">Progress: ' + esc(c.label) + "</span>" +
      '<span class="counter-value">' + esc(fmtCount(prog, c.target, c.unit)) + "</span></div>" +
      '<div class="counter-bar"><div class="counter-fill" style="width:' + pct + '%"></div></div>' +
      '<div class="counter-controls">' +
      '<button type="button" class="counter-btn" data-counter="-1" aria-label="Decrease progress">&minus;</button>' +
      '<input type="number" class="counter-input" id="counterInput" min="0" max="' + c.target +
      '" value="' + prog + '" aria-label="Progress count">' +
      '<button type="button" class="counter-btn" data-counter="1" aria-label="Increase progress">+</button>' +
      '<span class="counter-note">' + (done
        ? '<span class="counter-done">Target reached — trophy earned.</span>'
        : "Target: " + esc(fmtCount(c.target, c.target, c.unit)) + ". Reaching it marks the trophy earned.") +
      "</span></div></div>";
  }

  const stepsHtml = t.steps
    .map((s) => {
      const links = s.src
        .map((id) => sourceById(id))
        .filter(Boolean)
        .map((src) => sourceLink(src))
        .join(", ");
      return "<li>" + esc(s.text) + '<div class="step-sources">Source: ' + links + "</div></li>";
    })
    .join("");

  panel.innerHTML =
    '<p class="detail-kicker"><span>' + esc(GRADE_LABELS[t.grade]) + "</span><span>&middot;</span>" +
    "<span>" + esc(KIND_LABELS[t.kind]) + "</span><span>&middot;</span>" +
    "<span>Stage " + esc(t.stage) + "</span>" +
    (t.hidden ? '<span>&middot;</span><span class="hidden-mark">Hidden on PSN</span>' : "") + "</p>" +
    '<h2 class="detail-title">' + esc(displayName(t)) + "</h2>" +
    '<p class="detail-desc">' + esc(displayDesc(t)) + "</p>" +
    '<div class="detail-meta">' +
    '<span class="meta-tag">' + (earned ? "Earned ✓" : "Not earned yet") + "</span>" +
    '<span class="meta-tag">Stage ' + esc(t.stage) + "</span>" +
    (t.counter ? '<span class="meta-tag">Counter: ' + esc(fmtCount(prog, t.counter.target, t.counter.unit)) + "</span>" : "") +
    "</div>" +
    flagHtml +
    '<p class="detail-guide">' + esc(t.guide) + "</p>" +
    '<h3 class="detail-section-title">How to earn it</h3>' +
    '<ol class="step-list">' + stepsHtml + "</ol>" +
    counterHtml +
    '<h3 class="detail-section-title">My notes</h3>' +
    '<label class="notes-label" for="notesBox">Your own note for this trophy</label>' +
    '<textarea class="notes-box" id="notesBox" placeholder="e.g. where you left off, a route that worked, a spot to come back to…">' +
    esc(note) + "</textarea>" +
    '<p class="notes-hint">Notes save automatically in this browser and travel with Export / Import. A &#9998; appears beside the trophy in the list while a note exists.</p>';

  panel.querySelectorAll("[data-counter]").forEach((btn) => {
    btn.addEventListener("click", () => bumpCounter(t, Number(btn.dataset.counter)));
  });
  const input = panel.querySelector("#counterInput");
  if (input) {
    input.addEventListener("change", () => setCounter(t, Number(input.value)));
  }
  const notesBox = panel.querySelector("#notesBox");
  let noteTimer = null;
  notesBox.addEventListener("input", () => {
    clearTimeout(noteTimer);
    noteTimer = setTimeout(() => {
      const value = notesBox.value.trim();
      if (value) state.notes[t.id] = value;
      else delete state.notes[t.id];
      saveState();
      renderList();
    }, 300);
  });
}

function bumpCounter(t, delta) {
  const c = t.counter;
  if (!c) return;
  setCounter(t, progressOf(t) + delta);
}

function setCounter(t, value) {
  const c = t.counter;
  if (!c) return;
  const prev = progressOf(t);
  const clamped = Math.max(0, Math.min(c.target, Math.floor(Number(value) || 0)));
  state.progress[t.id] = clamped;
  if (clamped >= c.target) state.earned[t.id] = true;
  else if (prev >= c.target) state.earned[t.id] = false;
  /* Dropping below the target only un-earns a trophy the counter itself
     had earned; a manual check made while the counter sits below its
     target is left alone. */
  saveState();
  renderAll();
}

/* ---------- Sources panel (right column) ---------- */

function renderSourcesPanel() {
  const panel = document.getElementById("sourcesPanel");
  const t = selectedId ? trophyById(selectedId) : null;
  if (!t) {
    panel.innerHTML =
      "<h3>Sources</h3>" +
      '<p class="sources-sub">Pick a trophy to see the sources behind its guide.</p>' +
      '<p class="sources-foot">Every guide here is written in fresh words. A source is cited beside each trophy — named or linked, never copied.</p>';
    return;
  }
  const usedIds = [];
  for (const s of t.steps) {
    for (const id of s.src) if (!usedIds.includes(id)) usedIds.push(id);
  }
  const items = usedIds
    .map((id) => sourceById(id))
    .filter(Boolean)
    .map(
      (s) =>
        '<div class="source-item"><div class="source-name">' + sourceLink(s) +
        (s.live ? '<span class="source-live">Live link</span>' : "") +
        '</div><div class="source-title">' + esc(s.title) + "</div>" +
        '<div class="source-role">' + esc(s.role) + "</div></div>",
    )
    .join("");
  panel.innerHTML =
    "<h3>Sources</h3>" +
    '<p class="sources-sub">For &ldquo;' + esc(displayName(t)) + "&rdquo; — read " +
    esc(DATA.meta.readOn) + ".</p>" +
    items +
    '<p class="sources-foot">A link opens only when you follow it; the app itself makes no network request. Sources marked &ldquo;text only&rdquo; block automated checks, so they are named here without a link.</p>';
}

/* ---------- Roadmap ---------- */

function renderRoadmap() {
  const list = document.getElementById("stageList");
  list.innerHTML = DATA.stages
    .map((st) => {
      const trophies = st.trophies.map((id) => trophyById(id)).filter(Boolean);
      const earned = trophies.filter((t) => isEarned(t)).length;
      const total = trophies.length;
      const pct = total ? Math.round((earned / total) * 100) : 0;
      const chips = trophies
        .map(
          (t) =>
            '<button type="button" class="stage-trophy' + (isEarned(t) ? " earned" : "") +
            '" data-jump="' + esc(t.id) + '">' + esc(displayName(t)) + "</button>",
        )
        .join("");
      return (
        '<li class="stage-card' + (earned === total && total > 0 ? " done" : "") + '">' +
        '<div class="stage-head"><span class="stage-id">' + esc(st.id) + "</span>" +
        '<span class="stage-title">' + esc(st.title) + "</span>" +
        '<span class="stage-hours">' + esc(st.hours) + "</span></div>" +
        '<p class="stage-blurb">' + esc(st.blurb) + "</p>" +
        '<div class="stage-progress"><div class="stage-bar"><div class="stage-fill" style="width:' +
        pct + '%"></div></div><span class="stage-count">' + earned + " / " + total + "</span></div>" +
        '<div class="stage-trophies">' + chips + "</div></li>"
      );
    })
    .join("");
  list.querySelectorAll("[data-jump]").forEach((btn) => {
    btn.addEventListener("click", () => {
      setTab("checklist");
      selectTrophy(btn.dataset.jump);
    });
  });
}

/* ---------- Sources & audit view ---------- */

function sourceTrophyCount(id) {
  if (DATA.meta.listSources.includes(id)) return DATA.trophies.length;
  return DATA.trophies.filter((t) =>
    t.steps.some((s) => s.src.includes(id)),
  ).length;
}

function renderSourcesView() {
  const rows = DATA.sources
    .map((s) => {
      const n = sourceTrophyCount(s.id);
      return (
        '<div class="source-row"><div class="source-row-main">' +
        '<div class="source-name">' + sourceLink(s) +
        (s.live ? '<span class="source-live">Live link</span>' : "") +
        '</div><div class="source-title">' + esc(s.title) + "</div>" +
        '<div class="source-role">' + esc(s.role) + "</div></div>" +
        '<div class="source-count"><b>' + n + "</b><span>trophies cited</span></div></div>"
      );
    })
    .join("");
  document.getElementById("sourcesTable").innerHTML = rows;

  const flagged = (flag) =>
    DATA.trophies.filter((t) => t.flags.includes(flag)).map((t) => t.name);
  const missable = flagged("missable");
  const unconfirmed = flagged("unconfirmed");
  const disputes = flagged("disagree");
  const watch = flagged("watch");
  const listItems = (arr) =>
    arr.length ? arr.map((n) => "<li>" + esc(n) + "</li>").join("") : "<li>None.</li>";
  document.getElementById("flagBox").innerHTML =
    "<h3>Flag summary</h3>" +
    '<p class="flag-sub">Honest flags, counted from the data — no banner repeated here.</p>' +
    '<div class="flag-line"><span>Possibly missable</span><b>' + missable.length + "</b></div>" +
    '<div class="flag-line"><span>Watch</span><b>' + watch.length + "</b></div>" +
    '<div class="flag-line"><span>Unconfirmed</span><b>' + unconfirmed.length + "</b></div>" +
    '<div class="flag-line"><span>Sources disagree</span><b>' + disputes.length + "</b></div>" +
    "<h3 class=\"detail-section-title\">Possibly missable</h3><ul class=\"flag-list\">" + listItems(missable) + "</ul>" +
    "<h3 class=\"detail-section-title\">Unconfirmed</h3><ul class=\"flag-list\">" + listItems(unconfirmed) + "</ul>" +
    "<h3 class=\"detail-section-title\">Sources disagree</h3><ul class=\"flag-list\">" + listItems(disputes) + "</ul>" +
    "<h3 class=\"detail-section-title\">Watch</h3><ul class=\"flag-list\">" + listItems(watch) + "</ul>";
}

/* ---------- Header meter & tabs ---------- */

function updateMeter() {
  const earned = DATA.trophies.filter((t) => isEarned(t)).length;
  const total = DATA.trophies.length;
  const pct = Math.round((earned / total) * 100);
  document.getElementById("platinumCount").textContent = earned + " / " + total;
  document.getElementById("platinumPct").textContent = pct + "%";
  document.getElementById("platinumFill").style.width = pct + "%";
}

function setTab(tab) {
  activeTab = tab;
  document.querySelectorAll(".tab").forEach((b) => {
    b.classList.toggle("active", b.dataset.tab === tab);
  });
  document.getElementById("viewChecklist").hidden = tab !== "checklist";
  document.getElementById("viewRoadmap").hidden = tab !== "roadmap";
  document.getElementById("viewSources").hidden = tab !== "sources";
  if (tab === "roadmap") renderRoadmap();
  if (tab === "sources") renderSourcesView();
}

function renderAll() {
  renderPills();
  renderKindChips();
  renderList();
  renderDetail();
  renderSourcesPanel();
  renderRoadmap();
  renderSourcesView();
  updateMeter();
}

/* ---------- Export / import ---------- */

function exportJSON() {
  return JSON.stringify(
    {
      app: "neon-coastal-trophy-guide-v3",
      version: 1,
      exportedAt: new Date().toISOString(),
      state: state,
    },
    null,
    2,
  );
}

function importJSON(text) {
  const parsed = JSON.parse(text);
  const incoming = parsed && parsed.state ? parsed.state : parsed;
  if (!incoming || typeof incoming !== "object") throw new Error("Not a save file.");
  const next = blankState();
  if (incoming.earned && typeof incoming.earned === "object") next.earned = incoming.earned;
  if (incoming.progress && typeof incoming.progress === "object") next.progress = incoming.progress;
  if (incoming.notes && typeof incoming.notes === "object") next.notes = incoming.notes;
  next.spoilerHide = incoming.spoilerHide === true;
  state = next;
  saveState();
  renderAll();
  return true;
}

function wireChrome() {
  document.querySelectorAll(".tab").forEach((b) => {
    b.addEventListener("click", () => setTab(b.dataset.tab));
  });
  document.getElementById("spoilerToggle").addEventListener("change", (ev) => {
    state.spoilerHide = ev.target.checked;
    saveState();
    renderList();
    renderDetail();
  });
  document.getElementById("searchBox").addEventListener("input", (ev) => {
    filter.q = ev.target.value;
    renderList();
  });
  document.getElementById("gradeSelect").addEventListener("change", (ev) => {
    filter.grade = ev.target.value;
    renderList();
  });
  document.getElementById("exportBtn").addEventListener("click", () => {
    const blob = new Blob([exportJSON()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "neon-coastal-trophy-guide-save.json";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
  document.getElementById("importBtn").addEventListener("click", () => {
    document.getElementById("importFile").click();
  });
  document.getElementById("importFile").addEventListener("change", (ev) => {
    const file = ev.target.files && ev.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        importJSON(String(reader.result));
      } catch {
        alert("That file is not a Neon Coastal Trophy Guide save.");
      }
      ev.target.value = "";
    };
    reader.readAsText(file);
  });
}

/* ---------- Boot ---------- */

async function boot() {
  const res = await fetch(DATA_URL);
  if (!res.ok) throw new Error("Could not load " + DATA_URL);
  DATA = await res.json();

  const params = new URLSearchParams(location.search);
  state = loadState();
  if (params.get("demo") === "1") {
    state = blankState();
    state.earned = { ...DEMO_SEED.earned };
    state.progress = { ...DEMO_SEED.progress };
    state.notes = { ...DEMO_SEED.notes };
  }
  if (params.get("kind") && KIND_LABELS[params.get("kind")]) filter.kind = params.get("kind");
  if (params.get("grade") && GRADE_LABELS[params.get("grade")]) filter.grade = params.get("grade");
  if (params.get("q")) {
    filter.q = params.get("q");
    document.getElementById("searchBox").value = filter.q;
  }
  document.getElementById("spoilerToggle").checked = state.spoilerHide;

  wireChrome();
  renderAll();

  if (params.get("tab") === "roadmap" || params.get("tab") === "sources") {
    setTab(params.get("tab"));
  }
  if (params.get("select") && trophyById(params.get("select"))) {
    selectTrophy(params.get("select"));
  } else if (DATA.trophies.length) {
    selectedId = DATA.trophies[0].id;
    renderList();
    renderDetail();
    renderSourcesPanel();
  }
  const scroll = Number(params.get("scroll"));
  if (Number.isFinite(scroll) && scroll !== 0) {
    document.getElementById("trophyList").scrollTop = scroll;
  }
}

window.NeonGuide = {
  version: 1,
  getState: () => JSON.parse(JSON.stringify(state)),
  exportJSON,
  importJSON,
  data: () => DATA,
};

boot().catch((err) => {
  document.getElementById("detailPanel").innerHTML =
    "<p class=\"detail-empty\">The guide could not load its trophy data: " + esc(err.message) + "</p>";
});
