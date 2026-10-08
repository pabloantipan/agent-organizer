---
title: A RAM indicator in Deltagos - scope
status: ruled
raised: 2026-10-07
raised_by: fse
owner: pablo
ruled: 2026-10-07
ruled_by: pablo
options: ["memory pressure and free GB with the biggest agents; in the top bar and on the floating icon; this Mac only; a warning at high pressure"]
chosen: "memory pressure and free GB with the biggest agents; in the top bar and on the floating icon; this Mac only; a warning at high pressure"
cards: []
threads: []
supersedes: []
superseded_by:
---

## Question

Pablo, 2026-10-07, in the FSE session on lodestar: "Due we're having heavy
ram usage in other laptop, we need a ram monitoring indicator for lease
ram".

## Ruling

pablo, 2026-10-07, in the FSE session on lodestar, answering the FSE's form:

- What: "Free memory and pressure" (the Mac's memory pressure as Activity
  Monitor shows it, free GB, and which agents use the most).
- Where: "Top bar", "Floating icon".
- Which machine: "The Mac it runs on" (each laptop's Deltagos shows its own).
- Warn: "Show, and warn at high pressure" (a notification when pressure
  turns red, naming the biggest agent sessions).

## Consequences

Aglaea designs the indicator's states in the top bar and on the floating
icon, and the warning's words; the FSE specs the sampling (the app's 10 s
agents tick, no daemon) and the cards, with an accept record and a forecast.
The other laptop gets it by pulling and reinstalling.
