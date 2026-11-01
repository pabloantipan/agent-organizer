---
title: Accept leftovers 62 - today's review findings
status: proposed
raised: 2026-11-01
raised_by: fse
owner: pablo
options: ["accept as written", "send back"]
cards: [lf62-go, lf62-ui]
forecast: 90-180m
supersedes: []
superseded_by:
ruled:
ruled_by:
chosen:
---

## Question

Today's reviews filed seven findings outside their gates, and Aglaea
judged two of them. Leftovers 62 (`docs/specs/leftovers-62.md`) fixes them
in two cards:
- **lf62-go:** `organizer runs` attributes on read, so it matches
  `organizer usage`; a ruling no longer says "owner operator"; rejected
  usage rows reach the JSON and leave once their ledger row is gone; the Go
  side gets a status literal guard.
- **lf62-ui:** the header chip says both counts when they differ ("6
  decisions waiting · 5 on you"); the header follows a live resize; the
  Usage view lists rejected rows; a test helper bug fixed.

## Options

- **accept as written**: two cards, two waves.
- **send back**.

## Recommendation

accept as written.

## Forecast

forecast: 90-180m over 2 waves; basis: this initiative's small Go and
frontend leftovers today (lf56 38 min, lf61 55 min, lf54 wave 2 101 min).
