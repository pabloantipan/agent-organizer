---
title: "Current is a line, open is a surface, in the bar"
status: now
repos: [organizer]
branch: lf20-bar-marks
seat: bm-build
stage: one-window
updated: 2026-10-11
next: "review: lf20-bar-marks, B1 and X0 met, 2586950"
depends_on: []
boundary: ["docs/specs/leftovers-20.md Boundary, lf20-bar-marks"]
spec: "docs/specs/leftovers-20.md (FR-1, FR-2; initiatives-view Amendment 5, I35)"
gate: "docs/specs/leftovers-20.md Acceptance, rows B1 and X0"
ui_review: true
---

## Goal
The current gear and the open ? look different (Aglaea, 9a058c0, from sup56's close).

## Gate
docs/specs/leftovers-20.md, rows B1 and X0.

- [x] B1: vitest of the bar on Settings with and without Help, and offscreen WebKit computed styles: current gear `rgb(138, 63, 252) 0px -2px 0px 0px inset`, background transparent; open `?` background `--surface-selected` rgb(47, 27, 85), box-shadow none; over Settings the two differ. `.wt-notes/bm-build/b1-vitest.txt`, `.wt-notes/bm-build/b1-webkit.json`
- [x] X0: clean clone, `make test`, `pnpm run build`, `wails build` pass, `git status --porcelain` empty. `.wt-notes/bm-build/x0.txt`

## Done
- 2586950: `.gear.on` is the tabs' 2 px accent underline with no fill; `?` open is `.gear.open`, `--surface-selected`, no line (bm-build, 2026-10-11).
