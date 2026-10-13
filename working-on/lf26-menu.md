---
title: "The group menu opens the right way"
status: now
repos: [organizer]
branch: lf26-menu
seat: mn-build
stage: one-window
updated: 2026-10-13
next: "review: lf26-menu, gate met (M1, X0), 6889465"
depends_on: []
boundary: ["docs/specs/leftovers-26.md Boundary, lf26-menu"]
spec: "docs/specs/leftovers-26.md (FR-8)"
gate: "docs/specs/leftovers-26.md Acceptance, rows M1 and X0"
ui_review: true
---

## Goal
The group menu opens the right way (Aglaea, 70a43e9, from sup61's close).

## Gate
docs/specs/leftovers-26.md, rows M1 and X0.
- [x] M1: vitest `frontend/src/components/Rail.lf26.test.tsx` (4 tests, Rail* 40/40); harness case d (AXPress) at 1024x640: ⋯ 1077 when pressed, menu `up: false` 463-551 below the ⋯ 437-461, 179 px below; cases a, b, c, e as rl-ui found them. Evidence `.wt-notes/mn-build/m1.txt`, `m1.jsonl`, `progress.md`.
- [x] X0: clean clone of lf26-menu at f075b6d: make test (603 vitest, go ok), pnpm run build, wails build exit 0, `git status --porcelain` empty. Evidence `.wt-notes/mn-build/x0-*.log`, `x0-status.txt`; rebased on main after (docs only), head 6889465.

## Done
- `GroupActions` scrolls a ⋯ pressed out of view to the rail's middle before it measures (`placeInView`), so the AXPress case opens downward; in view nothing moves (mn-build, 2026-10-13).

## Notes
- FR-8 read literally (measure after the first item's focus) would still open up: that focus leaves the ⋯ at the rail's bottom edge. The fix centers the ⋯ first; progress.md says why.
- A fresh fixture has no rail groups; the harness steps press Group by client first (lf26-fixture owns the fixture).
