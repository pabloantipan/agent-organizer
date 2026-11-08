---
title: Accept leftovers 84 - the map reader picks each level's own diagram
status: proposed
raised: 2026-11-08
raised_by: fse
owner: pablo
options: ["accept as written", "send back"]
cards: [lf84-map-region]
forecast: 20-45m
supersedes: []
superseded_by:
---

## Question

lf83's builder found that the app's map reader takes the first diagram of
a page for every level, so once the modules page holds the React app's
region beside the Go one, the app would draw the Go modules for both.
Leftovers 84 (`docs/specs/leftovers-84.md`): the reader takes each level's
own marker region, as c4-map's spec defines them, falling back to the
first block for pages without markers. One small Go card, no UI review,
run beside lf83.

## Options

- **accept as written**: one card, in parallel with lf83.
- **send back**.

## Recommendation

accept as written.

## Forecast

forecast: 20-45m over 1 wave; basis: lf58-map-read (the reader), lf75 (20-ish min, a small Go/script card), this initiative.
