---
title: "The Help header's mark moves 4.5 s, then stops; named once"
status: now
repos: [organizer]
branch: lf15-help-mark
seat: lh-build
stage: one-window
updated: 2026-10-09
next: "review: lf15-help-mark, gate met (H1, X0), 7add260"
depends_on: []
boundary: ["the spec's Boundary for this card"]
spec: "docs/specs/leftovers-15.md (FR-11)"
gate: "docs/specs/leftovers-15.md Acceptance, rows H1 and X0"
ui_review: false
---

## Goal
Leftovers from 2026-10-09's reviews (0111).

## Gate
docs/specs/leftovers-15.md, H1 and X0.
- [x] H1: vitest with fake timers; a headless check that the animation stops at 4.5 s; AX tree of the lockup — `.wt-notes/lh-build/h1-vitest.log`
- [x] X0: `XDG_DATA_HOME=$(mktemp -d) make test`, `cd frontend && npm run build`, `wails build` — `.wt-notes/lh-build/x0-make-test.log`, `x0-npm-build.log`, `x0-wails-build.log`

## Done
- 2026-10-09 lh-build: the mark moves 4.5 s, rests, hover plays 4.5 s more, never under Reduce motion; aria-hidden in the lockup (7add260); gate met from a clean clone.

## Notes
- The headless check is runMark under fake timers; the component's mount is not exercised (no jsdom in devDependencies). The frontend installs with pnpm, not npm ci.
