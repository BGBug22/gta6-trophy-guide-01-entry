# Neon Coastal — GTA VI Trophy Guide & Tracker

[![make.fun](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/c/gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/BGBug22/gta6-trophy-guide-01-entry/rank.svg)](https://make.fun/c/gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/BGBug22/gta6-trophy-guide-01-entry/reward.svg)](https://make.fun/c/gta6-trophy-guide-01)

An offline web guide and tracker for all 55 PlayStation 5 trophies of Grand Theft Auto VI — every official name, description and grade as PlayStation publishes them, a cited guide for each one, a 7-stage roadmap to the platinum, and a checklist that saves in the browser.

## What it is

- **55 trophies, 1 platinum / 2 gold / 6 silver / 46 bronze, 28 hidden.** Names and descriptions are shown exactly as PlayStation publishes them (including "T**s Ass Drug Money", masked with asterisks by the game itself).
- **A cited guide for every trophy.** Each guide is written for this entry in its own words and names its sources — PowerPyx, Exophase, PSNProfiles, PlanetGTA6, Insider Gaming, GameMapa, EGamers, CryptoGames, GTASpotter and KeenGamer. Pages verified HTTP 200 are linked with a LIVE LINK badge; pages that returned HTTP 403 are named as text only.
- **A tracker that saves.** Checklist with localStorage, Export/Import JSON, 36 sub-progress counters (with auto-earn when a counter fills), My Notes per trophy, and a spoiler shield that hides hidden trophies until earned.
- **Filters and search.** By kind — Story, Missable, Collectibles, Activities, Crime, Odd ones, Platinum, Online — plus free-text search. There are no online trophies: all 55 are offline single-player.
- **Roadmap S1–S7.** Story first, then the one possibly missable trophy (Positive Mental Attitude — meditate at Jason's house in Chapter 1), character finales, activities, collectibles, crime and money, and finally 100% completion, the odd one-offs, and the platinum.
- **Offline by design.** Static files under `app/` with no build step. The app loads only its own files and makes no network request at run time.

## The one missable trophy

**Positive Mental Attitude** (meditate at every spot across Leonida) is the only trophy the guides flag as possibly missable: the first meditation, on the balcony at Jason's house in Chapter 1, is gone once that chapter ends. Do it before leaving Chapter 1. PowerPyx and GTABase both flag it; everything else stays available in free-roam after the story.

## Run it

Serve `app/` with any static file server and open `app/index.html` in desktop Chrome, or run `node serve.ts` and open http://localhost:8080. It works with the network off.

To hand the entry in: `mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts`, then `makefun check` and `makefun submit` per the kit's RULES.txt.

## Bounty

Built for the [gta6-trophy-guide-01](https://make.fun/c/gta6-trophy-guide-01) bounty on make.fun — $250, top 50. Neon Coastal is an unofficial fan guide; Grand Theft Auto, GTA and Rockstar Games are trademarks of their owners, and no logo, artwork or screenshot of the game is used here.
