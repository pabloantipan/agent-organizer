---
title: "At critical the amber ring breathes in width at full opacity, not in opacity"
status: now
repos: [organizer]
branch: lf15-ring-breath
seat: lr-build
stage: one-window
updated: 2026-10-09
next: "review: lf15-ring-breath, gate met (R1, X0), 18e4fcf"
depends_on: []
boundary: ["floaticon_darwin.m (the ring layer's animation only)", "not: the mark's layers, activation paths, the frontend"]
spec: "docs/specs/leftovers-15.md (FR-15; docs/ux/specs/ram-indicator.md Amendment 2 as amended 56f0244)"
gate: "docs/specs/leftovers-15.md Acceptance, rows R1 and X0"
ui_review: true
---

## Goal
ram-ring-amber's UI review A1: at half opacity the critical ring all but
vanished on white. Aglaea: breathe in width instead.

## Gate
docs/specs/leftovers-15.md, R1 and X0.
- [x] R1 — review build, `ORGANIZER_MEMORY_FAKE=critical` on the fixture, icon window shot (`screencapture -o -l`) at trough and peak, composited over white and the ground #1a1523: full-opacity amber with its keyline in both frames, trough 3.00 px, peak 4.46 px (4.47 on a second run), period 1.61 s; Reduce motion (`FLOAT_REDUCE_MOTION=1`): 20/20 frames 3.00 px. Evidence: `.wt-notes/lr-build/native-136x136-R1-critical-{trough,peak,reduce-motion}.png`, `composite*-R1-*.png`, `breath-timed.txt`, `reduce-widths.txt`, `float-breath.log`, `float-reduce.log`.
- [x] X0 — clean clone at 18e4fcf: `XDG_DATA_HOME=$(mktemp -d) make test`, `cd frontend && npm run build`, `wails build` all exit 0. Evidence: `.wt-notes/lr-build/x0-exits.txt`, `x0-*.out`.

## Done
- 2026-10-09, lr-build: the critical ring breathes in width at full opacity, 3 to 4.5 pt over 1.6 s, inner edge fixed 2 pt from the tile, the keyline following its outer edge; steady 3 pt under Reduce motion (`floaticon_darwin.m`, 18e4fcf). Widths measured per frame; how to reproduce in `.wt-notes/lr-build/progress.md`.

## Notes
- 2026-10-09, lr-build: at 1x the 1 pt keyline falls on a half pixel at most widths and spreads over two pixels (anti-aliasing, stroke opacity stays 1); at the trough it is one full pixel.
