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
review: pass
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

## Review
Pass: R1 and X0 met at 18e4fcf.
- R1 — fresh clone at 18e4fcf, `wails build` then `scripts/review-build.sh`, launched by saved pid on the fixture (`--memory critical`, so `ORGANIZER_MEMORY_FAKE` set), `FLOAT_SHOW_ICON=1`, 56 pt. 30 shots of the icon window (`screencapture -x -o -l`, ~0.1 s apart) measured with my own per-pixel solve (premultiplied red and alpha, amber against keyline): trough 2.99 px, peak 4.47 px, peaks 1.60 s apart; amber pixels at alpha 255 in every frame, keyline an opaque #19151f pixel at the trough and anti-aliased over two pixels at the peak. Composited over #ffffff and #1a1523: amber with its dark edge in both frames. `FLOAT_REDUCE_MOTION=1`: 20/20 frames 2.99 px, log `amber #ffb020 3 pt, steady (reduce motion)`. Diff: only `floaticon_darwin.m`, the ring and keyline animation (path + lineWidth group, opacity animation removed); in boundary. Evidence: `.wt-notes/lr-review/` (`widths.txt`, `composite-R1-critical-{trough,peak}.png`, `burst/`, `reduce/`, `float-*.log`).
- X0 — same clean clone: `XDG_DATA_HOME=$(mktemp -d) test-lease run -- make test` exit 0 (16 Go packages ok, 418 vitest), `npm install && test-lease run -- npm run build` exit 0, `test-lease run -- wails build` exit 0. Evidence: `.wt-notes/lr-review/x0-*.out`.
- Unmet: none.
- Reviewer lr-review, 2026-10-09, commit 18e4fcf6ced46228edec4e79dea95d12838a5811. UI review not written yet: status and place left alone.
