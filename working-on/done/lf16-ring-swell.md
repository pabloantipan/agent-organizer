---
title: "At critical the ring swells 3 to 6 px"
status: done
repos: [organizer]
branch: lf16-ring-swell
seat: s6-build
stage: one-window
updated: 2026-10-10
review: pass
next: "review: lf16-ring-swell, R1 and X0 met, 823b571"
depends_on: []
boundary: ["floaticon_darwin.m (the ring breath constants and animation only)", "not: the mark, activation paths, the frontend"]
spec: "docs/specs/leftovers-16.md (FR-1; docs/ux/specs/ram-indicator.md as amended b3295f2)"
gate: "docs/specs/leftovers-16.md Acceptance, rows R1 and X0"
ui_review: false
---

## Goal
lf15-ring-breath A1: a 1.5 px swell is too small to pull the eye from the ultrawide's edge (Aglaea, b3295f2).

## Gate
docs/specs/leftovers-16.md, rows R1 and X0.

- [x] R1: trough 3 px, peak 6 px, amber at full opacity with the 1 px keyline outside; Reduce motion 3 px in all 16 frames (.wt-notes/s6-build/r1/, progress.md)
- [x] X0: clean clone, make test (vitest 440), npm run build, wails build all exit 0 (.wt-notes/s6-build/x0-*.log)

## Done
- 2026-10-10 s6-build: kBreathPeak 4.5 → 6 in floaticon_darwin.m plus TestRingBreathWidths pinning the widths (823b571); R1 and X0 met.

## Notes
- The Go test `floaticon_darwin_test.go` reads the .m as text; the task prompt allowed a test beside the file, the card's boundary does not name it.

## Review
Pass: R1 and X0 met at 823b571.

- R1: `make review-build` in a clean clone at 823b571, fixture `--memory critical` (ORGANIZER_MEMORY_FAKE=@file holding critical), my own process, `screencapture -o -l` of the icon window (1x, 214 px), middle row measured: 32 motion frames span 3 to 6 px of opaque amber, inner edge fixed (gap kept), a 1 px ground keyline (25,21,31 at alpha 253–255) just outside at trough and peak; peak and trough composited over white and #1a1523 keep amber, keyline and gap; `FLOAT_REDUCE_MOTION=1`: 16 frames all 3 px, keyline 1, log "3 pt, steady (reduce motion)". Evidence: `.wt-notes/s6-review/r1/`, `float-*.log`.
- X0: same clean clone, `npm install`, `XDG_DATA_HOME=$(mktemp -d) make test` (go ok, vitest 440 passed), `npm run build`, `wails build`, all exit 0 (`.wt-notes/s6-review/x0-*.log`). Clone removed.

Unmet rows: none. Reviewer s6-review, 2026-10-10, commit 823b571.
