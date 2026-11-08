---
title: "The last rename polish: no '….', a level head, cuts by grapheme"
status: next
repos: [organizer]
branch: lf82-rename-last
seat: l82-build
reviewer:
review:
stage:
updated: 2026-11-08
next: "waits on 0195 (accept leftovers 82)"
depends_on: [lf81-rename-edges]
boundary: ["frontend/src/lib/railGroup.ts", "frontend/src/lib/", "frontend/src/styles/global.css", "frontend/src/components/Rail.tsx", "frontend/src/components/"]
spec: "docs/specs/leftovers-82.md (FR-1 to FR-3)"
gate: "docs/specs/leftovers-82.md#Acceptance → gate"
ui_review: true
touches: []
change_order: {add: [], change: [], retire: []}
autonomy: unattended
---

## Goal
A cut name never reads '….' or splits a character, and a closed group head sits level.

## Gate
docs/specs/leftovers-82.md, rows V1-V3, AR53-AR55 and X0.

## Pre-answered
- Base: origin/main at the card's start (includes #80).
- Merge target: `main` through talos-lab's PR.
- Tests: vitest beside each file (`cd frontend && npm test`); there is no DOM test library; a test outside the named files may change only where it asserts the old line.
- Design: Aglaea's 6aa41021; graphemes through `Intl.Segmenter`; anything else to the FSE.
- Short-sample fallback: the existing fixtures with two groups, one renamed in the row to a 60-grapheme name with an emoji at 24; never the real home.
- Data shape across states: as the fixtures give it.
- Screen locked: UI rows may render offscreen, and the card says which.
- Evidence: shots and output under `.wt-notes/<seat>/`.
- Retention: n/a.
- No AXPress on the floating icon; stop the fixture's stand-ins with `scripts/fixture-home.sh stop "$FIXTURE_DIR"` before removing its dir.
