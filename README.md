# Neon Coastal Trophy Guide

[![make.fun](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/c/gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/BGBug22/gta6-trophy-guide-01-entry/rank.svg)](https://make.fun/c/gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/BGBug22/gta6-trophy-guide-01-entry/reward.svg)](https://make.fun/c/gta6-trophy-guide-01)

An offline guide and tracker for the 55 PlayStation 5 trophies of Grand Theft Auto VI, built for the **gta6-trophy-guide-01** bounty on [make.fun](https://make.fun/c/gta6-trophy-guide-01).

An editorial Vice dark coastal look: a sunset beach city, warm sand and sea-glass accents on deep navy, clear typography, and generous space — the audit is five scannable figures up top, with the full detail in the Sources tab.

## What it does

- **Checklist** of all 55 official trophies with their official names, descriptions and grades, each with a guide in our own words that cites its sources by number — and every source with a verified page is linked by name (links open in a new tab; the app itself fetches nothing).
- **Tracker**: progress saved in the browser, export to a file and import back.
- **My Notes**: a private note box on every trophy, saved automatically, with a small ✎ mark in the list when a trophy has a note; notes travel with export/import.
- **Sub-progress counters**: for every staged or collectible trophy (18 of them, from the official descriptions — 18 meditation spots, 250 stunts, 42 shooting challenges, 3 shops, and more), − / + buttons, a mini progress bar and an exact-number field in the detail panel, plus a compact `n/N` badge in the list. Reaching the target marks the trophy earned — it can still be unmarked by hand.
- **Filters** by kind (story, missable, collectibles, activities, side, crime, mystery, money) and a **spoiler setting** that hides story trophy names and descriptions until earned.
- **Roadmap** to the platinum in seven stages (S1 First Light through S7 Open Water) with **missable flags** and a flag summary, built from the official descriptions.
- **Sources panel**: every one of the 122 guide steps cites its sources — 122/122 steps cited. The audit strip shows five figures: 55 Official, 122/122 Cited, 1 Missable · 6 Watch, 4 Source Disputes, 7 Sources · 20 Nov 2026.

## Run it

Serve `app/` with any static HTTP server and open `app/index.html` in desktop Chrome. It works with the network off — every file it loads lives under `app/`.

`main.ts` copies `app/` and `screenshots/` to `/output` and writes `/output/dossier.json`.
