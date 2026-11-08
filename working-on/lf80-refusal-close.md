---
title: "No stale refusal is heard, and the refusal line reads whole"
status: next
repos: [organizer]
branch: lf80-refusal-close
seat: l80-build
reviewer:
review:
stage:
updated: 2026-11-08
next: "waits on 0193 (accept leftovers 80)"
depends_on: [lf79-refused-field]
boundary: ["frontend/src/components/Rail.tsx", "frontend/src/lib/liveRegion.ts", "frontend/src/lib/", "frontend/src/styles/global.css", "frontend/src/components/"]
spec: "docs/specs/leftovers-80.md (FR-1, FR-2)"
gate: "docs/specs/leftovers-80.md#Acceptance → gate"
ui_review: true
touches: []
change_order: {add: [], change: [], retire: []}
autonomy: unattended
---

## Goal
Closing the rename field leaves nothing to be heard, and its refusal line reads whole without covering a row.

## Gate
docs/specs/leftovers-80.md, rows V1, V2, AR49, AR50 and X0.

## Pre-answered
- Base: origin/main at the card's start (includes #76).
- Merge target: `main` through talos-lab's PR.
- Tests: vitest beside each file (`cd frontend && npm test`), fake timers for V1; there is no DOM test library; a test outside the named files may change only where it asserts the old behaviour.
- Design: Aglaea's 66315c51; anything else to the FSE.
- Short-sample fallback: the existing fixtures with two groups; never the real home.
- Data shape across states: as the fixtures give it.
- Screen locked: UI rows may render offscreen, and the card says which.
- Evidence: shots and output under `.wt-notes/<seat>/`.
- Retention: n/a.
- No AXPress on the floating icon; stop the fixture's stand-ins with `scripts/fixture-home.sh stop "$FIXTURE_DIR"` before removing its dir.
