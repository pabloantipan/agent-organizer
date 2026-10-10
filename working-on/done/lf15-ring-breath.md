---
title: "At critical the amber ring breathes in width at full opacity, not in opacity"
status: done
repos: [organizer]
branch: lf15-ring-breath
seat: lr-build
stage: one-window
updated: 2026-10-09
next: "merged; A1 for aglaea via fse"
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

## UI review
Pass. lr-ui, 2026-10-09, everything checked on commit 18e4fcf6ced46228edec4e79dea95d12838a5811 (own detached worktree, `test-lease run -- make review-build`, `Deltagos Review` launched by saved pid on the fixture `--memory critical`, `FLOAT_SHOW_ICON=1`, 56 pt, display at 1x). Severity 4/3: none.

How each state was checked (evidence `.wt-notes/lr-ui/`):
- Critical, motion: 40 shots of the icon window (`screencapture -x -o -l`, ~0.1 s apart, timed) read by my own solve (per pixel, premultiplied R and G against amber #ffb020 and keyline #1a1523), left, top and right edges agreeing: trough 3.00 px, peak 4.51 px, troughs 1.61 s apart, inner edge fixed (gap kept), amber at alpha 255 in every frame (`breath-timed.txt`, `burst/`). Composited over #ffffff and #1a1523 at trough, peak and mid-breath (`composite-white-ground*-R1-critical-{trough,peak,midbreath}.png`): full-opacity amber with a dark outer edge in all three; the ring stays easy to find on white. Log names the breath (`float-breath.log`).
- Critical, Reduce motion (`FLOAT_REDUCE_MOTION=1`): 20/20 frames 3.00 px, log `steady (reduce motion)` (`reduce-widths.txt`, `native-136x136-R1-critical-reduce-motion.png`).
- Leaving critical without a restart (fixture file → high → normal): log `high … 2 pt`, `normal … tone 2 pt`; the ring's pixels identical across 6 frames at each level, so the breath stops (`walk-steady.txt`, `walk/`).

Findings:
- U1 (severity 1). What: between trough and peak the keyline does not read as one solid dark line at 1x. Where: `composite-white-ground4x-1088x544-native-136x136-R1-critical-midbreath.png`, the left edge. Evidence: over white the outer pixels read (153,120,83) then (158,156,160) instead of #1a1523; my solve gives the keyline 0.5–0.9 of a pixel's coverage mid-breath, 1.0–1.2 at the trough; ring and keyline are two layers, each anti-aliased at a half-pixel edge, so their seam lets the background through. The ring is still held off white in every frame and the trough is crisp; not against the spec (stroke opacity is 1). Proposal: none now; if it matters on the ultrawide, draw the keyline as a wider stroke under the ring in one layer so the two share no anti-aliased seam.

Spec gaps (for the FSE):
- G1: Amendment 2 as amended says 3 to 4.5 px but not which way the ring grows; built outward with the inner edge fixed 2 pt from the tile, which keeps the gap. Worth one line in the amendment so a later change does not centre it.
- G2: the spec's px are drawn as points (2 device px on Retina), as the ring was before; the amendment does not say which.

For aglaea:
- A1: is a 1.5 px swell at 56 pt enough to read as breathing in peripheral vision from another desktop on the 3440 ultrawide? It is clearly visible in the shots; whether it pulls the eye as the opacity breath did is a question for a look, not a measurement.

Not verified in WKWebView or on screen: the system Reduce motion setting toggled live (only the `FLOAT_REDUCE_MOTION` override; no system setting changed, per 0108's rules for this task); a Retina 2x display (this one shoots at 1x); a real white wallpaper (composited instead); the breath rebuilt after a resize (F12); the top bar and frontend (not touched by the card).
