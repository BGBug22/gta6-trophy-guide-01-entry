# Neon Coastal Trophy Guide

[![make.fun](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/c/gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/BGBug22/gta6-trophy-guide-01-entry/rank.svg)](https://make.fun/c/gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/BGBug22/gta6-trophy-guide-01-entry/reward.svg)](https://make.fun/c/gta6-trophy-guide-01)

An offline guide and tracker for the 55 PlayStation 5 trophies of Grand Theft Auto VI, built for the **gta6-trophy-guide-01** bounty on [make.fun](https://make.fun/c/gta6-trophy-guide-01).

A neon coastal dusk theme: a sunset beach city, arcade racing achievements, stunt challenges, coastal exploration, and a Platinum / Gold / Silver / Bronze trophy collection — all in the app's own original look.

## What it does

- **Checklist** of all 55 official trophies with their official names, descriptions and grades, each with a guide in our own words that cites its sources.
- **Tracker**: progress saved in the browser, export to a file and import back.
- **Filters** by kind (story, missable, collectibles, activities, online) and a **spoiler setting** that hides story trophy names and descriptions until earned.
- **Roadmap** to the platinum and **missable flags**, built from the official descriptions.
- **Sources panel**: every guide step cites its sources by name.

## Run it

Serve `app/` with any static HTTP server and open `app/index.html` in desktop Chrome. It works with the network off — every file it loads lives under `app/`.

`main.ts` copies `app/` and `screenshots/` to `/output` and writes `/output/dossier.json`.
