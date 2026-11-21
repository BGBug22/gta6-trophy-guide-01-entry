# Neon Coastal — GTA VI Trophy Guide & Tracker

[![make.fun](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/c/gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/BGBug22/gta6-trophy-guide-01-entry/rank.svg)](https://make.fun/c/gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/BGBug22/gta6-trophy-guide-01-entry/reward.svg)](https://make.fun/c/gta6-trophy-guide-01)

An offline guide and tracker for all **55 official PlayStation 5 trophies** of Grand Theft Auto VI — 1 platinum, 2 gold, 6 silver and 46 bronze, 28 of them hidden — built for the [gta6-trophy-guide-01 bounty](https://make.fun/c/gta6-trophy-guide-01) on make.fun.

## What it is

A static web app (`app/`, no build step) that runs entirely offline:

- **Checklist** of all 55 trophies with their official names, descriptions and grades, plus a cited guide for every one — written in our own words, with steps and named sources.
- **Tracker** — progress saves in localStorage and exports to / imports from a JSON file; 20 sub-progress counters with −/+ buttons and auto-earn when a counter fills; My Notes on every trophy (✎).
- **Spoiler shield** — hides the names and descriptions of the 28 hidden story trophies until they are earned.
- **Filters & search** — story, missable, collectibles, activities, crime, odd ones, platinum, online (there are none: all 55 are offline single-player).
- **Roadmap S1–S7** — seven stages in order to the platinum, with a chip for every trophy.
- **Sources & Audit** — 10 sources, 7 verified HTTP 200 (linked, LIVE LINK badge) and 3 HTTP 403 (text only); a flag summary and an audit list.

The one trophy that can be missed — **Positive Mental Attitude** (meditate at every spot; the first meditation, at Jason's house in Chapter 1, is gone once the chapter ends) — is flagged in the list, in its guide, and in stage S2 of the roadmap.

## Design

Dark editorial Vice twilight: deep violet night, serif headlines in white and gold, five clean audit pills. No Rockstar logo, no official artwork, no game screenshots — the look is our own.

## Run it

Serve `app/` with any static server and open `index.html`:

```sh
cd app && python3 -m http.server 8123
```

Then open http://localhost:8123. It works with the network off.

## Hand it in

`main.ts` (Node 22, standard library only) copies `app/` and `screenshots/` to the output directory and writes `dossier.json` with the vendored make.fun library:

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

## Sources

PowerPyx, PlanetGTA6, Insider Gaming, GameMapa, EGamers, Push Square, CryptoGames (linked), Exophase, PSNProfiles, KeenGamer (text only — they return HTTP 403 to automated checks). Trophy names and descriptions are shown as PlayStation publishes them; every guide is written in our own words.
