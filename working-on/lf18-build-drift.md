---
title: "A bare wails build leaves the tree clean; dead usage css removed"
status: now
repos: [organizer]
branch: lf18-build-drift
seat: bd-build
stage: one-window
updated: 2026-10-10
next: "review: lf18-build-drift, gate met (D1, D2, X0), 9eed8e6"
depends_on: []
boundary: ["docs/specs/leftovers-18.md Boundary, lf18-build-drift"]
spec: "docs/specs/leftovers-18.md (FR-11, FR-12)"
gate: "docs/specs/leftovers-18.md Acceptance, rows D1, D2 and X0"
ui_review: false
---

## Goal
lf15-build-drift fixed make install only; X0's bare wails build still dirties frontend/wailsjs/runtime/ (sup53).

## Gate
docs/specs/leftovers-18.md, rows D1, D2 and X0.

- [x] D1 (11): clean clone, `wails build`, `git status --porcelain` empty — .wt-notes/bd-build/d1.log
- [x] D2 (12): `grep -rn usage-btn frontend/src` prints nothing — .wt-notes/bd-build/d2.log
- [x] X0: make test (go ok, 486 vitest), npm run build, wails build all pass, then status empty, on a clean clone — .wt-notes/bd-build/x0.log

## Done
- 2026-10-10 bd-build: runtime files held 0644 as wails writes them, Makefile chmod dropped (6a064a1); `.usage-btn` removed (fb9ae35); make test's npm install no longer leaves a package-lock.json (9eed8e6). Gate met.

## Notes
- X0 from a clean clone also left an untracked frontend/package-lock.json (make test's npm install); the spec didn't anticipate it, fixed in the Makefile (9eed8e6).
