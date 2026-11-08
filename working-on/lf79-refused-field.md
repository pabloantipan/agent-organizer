---
title: "A refused rename shows, says the way out, and is heard every time"
status: now
repos: [organizer]
branch: lf79-refused-field
seat: l79-build
reviewer:
review:
stage:
updated: 2026-11-08
next: "l79-build builds it (sup121, 0192)"
depends_on: [lf78-group-names]
boundary: ["frontend/src/components/Rail.tsx", "frontend/src/lib/railGroup.ts", "frontend/src/lib/", "frontend/src/styles/global.css", "frontend/src/components/"]
spec: "docs/specs/leftovers-79.md (FR-1 to FR-3)"
gate: "docs/specs/leftovers-79.md#Acceptance → gate"
ui_review: true
touches: []
change_order: {add: [], change: [], retire: []}
autonomy: unattended
---

## Goal
A refused group rename is marked, says how to leave, and is announced every time.

## Gate
docs/specs/leftovers-79.md, rows V1-V3, AR46-AR48 and X0.

## Pre-answered
- Base: origin/main at the card's start (includes #74).
- Merge target: `main` through talos-lab's PR.
- Tests: vitest beside each file (`cd frontend && npm test`), fake timers for V3; there is no DOM test library, so "stays open" and "Escape closes" are UI rows; a test outside the named files may change only where it asserts the old line.
- Design: Aglaea's fa0d4ca0 and the design system's "Refused field"; the words are FR-2's; anything else to the FSE.
- Short-sample fallback: the existing fixtures with two groups; never the real home.
- Data shape across states: as the fixtures give it.
- Screen locked: UI rows may render offscreen, and the card says which.
- Evidence: shots and output under `.wt-notes/<seat>/`.
- Retention: n/a.
- No AXPress on the floating icon; stop the fixture's stand-ins with `scripts/fixture-home.sh stop "$FIXTURE_DIR"` before removing its dir.
