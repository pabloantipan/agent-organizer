---
title: "The no-client group reads No client and is the app's by key, not by name"
status: now
repos: [organizer]
branch: lf77-no-client
seat: l77-build
reviewer:
review:
stage:
updated: 2026-11-08
next: "l77-build builds it (sup119)"
depends_on: [lf74-comma-other, lf75-fixture-stop]
boundary: ["internal/model/model.go", "internal/model/", "frontend/wailsjs/", "frontend/src/lib/", "frontend/src/components/Rail.tsx", "frontend/src/components/FloatList.tsx", "frontend/src/components/", "testdata/fixture-overlay/", "scripts/floating-icon-by-hand.sh"]
spec: "docs/specs/leftovers-77.md (FR-1 to FR-6)"
gate: "docs/specs/leftovers-77.md#Acceptance → gate"
ui_review: true
touches: []
change_order: {add: [], change: [], retire: []}
autonomy: unattended
---

## Goal
No client name ever joins or doubles the app's own No client group, and its rename field shows what its header shows.

## Gate
docs/specs/leftovers-77.md, rows G1, V1-V5, S1, AR40-AR42 and X0.

## Pre-answered
- Base: origin/main at the card's start (includes #66, #68, #70).
- Merge target: `main` through talos-lab's PR.
- Tests: go test beside model.go; vitest beside each file (`cd frontend && npm test`); a test outside the named files may change only where it asserts the old `Other` (the boundary's components entry, for that only).
- Design: Aglaea's 5958a02; anything else to the FSE.
- The field name and value are `seed: "no-client"`; no other value exists.
- Short-sample fallback: the existing fixtures; a client `other` and initiatives with no client are added to the fixture if missing; never the real home.
- Data shape across states: as the fixtures give it.
- Screen locked: UI rows may render offscreen, and the card says which.
- Evidence: shots and output under `.wt-notes/<seat>/`.
- Retention: n/a.
- No AXPress on the floating icon in the UI review.
