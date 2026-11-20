# Neon Coastal Trophy Guide

[![make.fun](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/c/gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/BGBug22/gta6-trophy-guide-01-entry/rank.svg)](https://make.fun/c/gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/BGBug22/gta6-trophy-guide-01-entry/reward.svg)](https://make.fun/c/gta6-trophy-guide-01)

An offline guide and tracker for the 55 PlayStation 5 trophies of Grand Theft Auto VI, built for the **gta6-trophy-guide-01** bounty on [make.fun](https://make.fun/c/gta6-trophy-guide-01).

A neon coastal dusk theme: a sunset beach city, arcade racing achievements, stunt challenges, coastal exploration, and a Platinum / Gold / Silver / Bronze trophy collection — all in the app's own original look.

## What it does

- **Checklist** of all 55 official trophies with their official names, descriptions and grades, each with a guide in our own words that cites its sources by name.
- **Tracker**: progress saved in the browser, export to a file and import back.
- **Filters** by kind (story, missable, collectibles, activities, side, crime, mystery, money) and a **spoiler setting** that hides story trophy names and descriptions until earned.
- **Roadmap** to the platinum in seven stages (S1 First Light through S7 Open Water) with **missable flags** and a flag summary, built from the official descriptions.
- **Sources panel**: every one of the 122 guide steps cites its sources by name — no external links anywhere in the app. An audit strip up top shows the counts: 55 official, 1P 2G 6S 46B, 28 hidden, 0 online, 122/122 steps cited.

## Run it

Serve `app/` with any static HTTP server and open `app/index.html` in desktop Chrome. It works with the network off — every file it loads lives under `app/`.

`main.ts` copies `app/` and `screenshots/` to `/output` and writes `/output/dossier.json`.
