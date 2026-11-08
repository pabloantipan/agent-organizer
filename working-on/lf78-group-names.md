---
title: "No rail group reads like another, and a blank client is no client"
status: now
repos: [organizer]
branch: lf78-group-names
seat: l78-build
reviewer:
review:
stage:
updated: 2026-11-08
next: "sup120: l78-build building on origin/main d832cc8a"
depends_on: [lf77-no-client]
boundary: ["frontend/src/lib/railGroup.ts", "frontend/src/lib/", "frontend/src/components/Rail.tsx", "frontend/src/components/FloatList.tsx", "frontend/src/components/", "frontend/src/styles/global.css", "internal/scan/scan.go", "internal/scan/", "testdata/fixture-overlay/"]
spec: "docs/specs/leftovers-78.md (FR-1 to FR-5)"
gate: "docs/specs/leftovers-78.md#Acceptance → gate"
ui_review: true
touches: []
change_order: {add: [], change: [], retire: []}
autonomy: unattended
---

## Goal
Two rail groups never read alike, a rename never stores a duplicate, and a blank client is no client.

## Gate
docs/specs/leftovers-78.md, rows G1, V1-V5, AR43-AR45 and X0.

## Pre-answered
- Base: origin/main at the card's start (includes #72).
- Merge target: `main` through talos-lab's PR.
- Tests: go test beside scan.go; vitest beside each file (`cd frontend && npm test`); a test outside the named files may change only where it asserts the old behaviour.
- Design: Aglaea's e7131dd6; the refusal line's words are `A group is already called <label>.`; anything else to the FSE.
- Short-sample fallback: the existing fixtures; a client `No client`, a client of spaces and an initiative with none are added to the fixture if missing; never the real home.
- Data shape across states: as the fixtures give it.
- Screen locked: UI rows may render offscreen, and the card says which.
- Evidence: shots and output under `.wt-notes/<seat>/`.
- Retention: n/a.
- No AXPress on the floating icon; stop the fixture's stand-ins with `scripts/fixture-home.sh stop "$FIXTURE_DIR"` before removing its dir.
