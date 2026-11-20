[![make.fun](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/c/gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/BGBug22/gta6-trophy-guide-01-entry/rank.svg)](https://make.fun/c/gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/BGBug22/gta6-trophy-guide-01-entry/reward.svg)](https://make.fun/c/gta6-trophy-guide-01)

# Neon Coastal Trophy Guide — GTA VI · PS5

An offline guide and tracker for all 55 PlayStation 5 trophies of **Grand Theft Auto VI**: 1 Platinum, 2 Gold, 6 Silver, 46 Bronze, 28 of them hidden. Every trophy is shown with its official name, description and grade as PlayStation publishes them, a guide written fresh for this entry, the sources behind it, and the road to the Platinum in seven stages.

## Run it

```sh
node serve.ts
# open http://localhost:8080
```

No build step, no install, no network. `app/` is plain static files; serve it from any static file server with `app/` at the root and `app/index.html` just works, even with the network off.

Deep links: `?tab=roadmap` or `?tab=sources` opens a section, `?select=<trophy-id>` opens one trophy, and `?demo=1` loads a small sample save so the tracker can be seen mid-hunt.

## What it does

- **Checklist** — all 55 trophies with search, kind filters (Story, Missable, Collectibles, Activities) and grade filter. Progress saves in the browser and survives a reload.
- **Sub-progress counters** — 27 staged and collectible trophies carry a counter with the official target (250 stunts, 42 shooting-range golds, 18 meditation spots, 8 garages, $250,000 laundered, and more). Buttons, a number field and a mini progress bar; reaching the target marks the trophy earned, and the list shows a live badge like `6/18`.
- **My Notes** — a personal note box on every trophy, saved automatically, with a ✎ mark in the list while a note exists.
- **Spoiler setting** — “Hide story spoilers until earned” masks the names and descriptions of the 12 story trophies until you earn them.
- **Roadmap** — seven stages in order (S1–S7), each with its own progress bar and the trophies it covers, ending at the Platinum.
- **Sources & Audit** — every guide cites its sources by name or live link (links open only when followed; the app fetches nothing). Ten sources, read 20 November 2026, with a count of how many trophies cite each one, plus an honest flag summary: 1 possibly missable, 2 unconfirmed, 4 where the sources disagree, 9 to watch.
- **Export / Import** — save the whole tracker (earned, counters, notes, spoiler setting) as JSON and load it back.

## The data

`app/data/trophies.json` holds the 55 trophies. Names, descriptions, grades and hidden flags are the official list as PSNProfiles and Exophase list it from PlayStation — the two agree on every entry. The guides are written fresh here, in the author's own words, and cite their sources: PowerPyx, GTA-Zone, eGamers, Push Square, Insider Gaming, GamesFuze, KeenGamer, plus the official PlayStation page. Two sources are shown as text only because they block automated checks (PSNProfiles, Exophase, KeenGamer); the rest are live links.

Where the guides disagree, the guide says so and shows both versions — four trophies carry a “Sources disagree” flag, and two more are marked “Unconfirmed” because no guide has pinned their trigger yet. Nothing here is guessed: an unconfirmed trophy is labelled unconfirmed.

## Files

- `app/index.html` — the page shell (header, pills, tabs, three-column checklist).
- `app/style.css` — the look: editorial Vice dark coastal, serif white-gold title, sunset strip, no web fonts or images.
- `app/app.js` — the tracker: rendering, filters, counters, notes, roadmap, export/import. No libraries.
- `app/data/trophies.json` — the 55 trophies, the 10 sources, and the 7 roadmap stages.
- `main.ts` — copies `app/` and `screenshots/` to `/output` and writes `dossier.json` (vendored make.fun library, unchanged).
- `screenshots/` — four renders of the app taken by its maker: checklist, checklist with counter and notes, roadmap, sources.

## Verify it

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
node /path/to/kit/cli/makefun.mjs check --repo . --commit <local-sha>
```

The app makes zero runtime network requests: the only fetch is `data/trophies.json` from its own folder, and the source links are plain anchors that load nothing until clicked.

## License

MIT — see `LICENSE`.
