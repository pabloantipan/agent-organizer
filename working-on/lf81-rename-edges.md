---
title: "Collapsing closes the rename, the head's tools sit at the top, long names are cut in the line"
status: now
repos: [organizer]
branch: lf81-rename-edges
seat: l81-build
reviewer:
review:
stage:
updated: 2026-11-08
next: "l81-build builds it (sup123, launched 2026-11-08)"
depends_on: [lf80-refusal-close]
boundary: ["frontend/src/components/Rail.tsx", "frontend/src/lib/railGroup.ts", "frontend/src/lib/liveRegion.ts", "frontend/src/lib/", "frontend/src/styles/global.css", "frontend/src/components/"]
spec: "docs/specs/leftovers-81.md (FR-1 to FR-3)"
gate: "docs/specs/leftovers-81.md#Acceptance → gate"
ui_review: true
touches: []
change_order: {add: [], change: [], retire: []}
autonomy: unattended
---

## Goal
No refusal outlives a collapsed rail, the head's tools stay at its top, and a long name never stretches the line past four lines.

## Gate
docs/specs/leftovers-81.md, rows V1-V3, AR51-AR53 and X0.

## Pre-answered
- Base: origin/main at the card's start (includes #78).
- Merge target: `main` through talos-lab's PR.
- Tests: vitest beside each file (`cd frontend && npm test`); there is no DOM test library; a test outside the named files may change only where it asserts the old behaviour.
- Design: Aglaea's 8cb87888; the cut is at 24 characters plus `…`; anything else to the FSE.
- Short-sample fallback: the existing fixtures with two groups, one renamed to a 60-character name in the row; never the real home.
- Data shape across states: as the fixtures give it.
- Screen locked: UI rows may render offscreen, and the card says which.
- Evidence: shots and output under `.wt-notes/<seat>/`.
- Retention: n/a.
- No AXPress on the floating icon; stop the fixture's stand-ins with `scripts/fixture-home.sh stop "$FIXTURE_DIR"` before removing its dir.
