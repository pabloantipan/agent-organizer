---
title: "One space after every comma, and the app's own group label as Other"
status: next
repos: [organizer]
branch: lf74-comma-other
seat: l74-build
reviewer:
review:
stage:
updated: 2026-11-08
next: "sup118 launch held: memory outage flag set 01:48 (swap 97%); the FSE relaunches when it clears"
depends_on: [lf73-inline-names]
boundary: ["frontend/src/styles/runreport.css", "frontend/src/components/Rail.tsx", "frontend/src/components/FloatList.tsx", "frontend/src/lib/", "frontend/src/components/RunTracks.test.tsx", "frontend/src/components/RunTracks.lf73.test.tsx", "frontend/src/components/FloatList.test.tsx", "frontend/src/components/"]
spec: "docs/specs/leftovers-74.md (FR-1 to FR-3)"
gate: "docs/specs/leftovers-74.md#Acceptance → gate"
ui_review: true
touches: []
change_order: {add: [], change: [], retire: []}
autonomy: unattended
---

## Goal
A comma list reads with one space after each comma, and the app's own group label reads Other.

## Gate
docs/specs/leftovers-74.md, rows V1-V4, AR39, AR40 and X0.

## Pre-answered
- Base: origin/main at the card's start (includes #64).
- Merge target: `main` through talos-lab's PR.
- A stored group named exactly `other` reads `Other`; the stored value is never rewritten (FR-2, accepted cost).
- Tests: vitest beside each file (`cd frontend && npm test`); a test outside the named files may change only where it asserts the old text or rules (the boundary's last entry, for that only).
- Design: Aglaea's 43ab477; anything else to the FSE.
- Short-sample fallback: the existing fixtures; a group named other, one named misc, and a left list of link, not-cut item, link are added to the fixture if missing; never the real home.
- Data shape across states: as the fixtures give it.
- Screen locked: UI rows may render offscreen, and the card says which.
- Evidence: shots and measurements under `.wt-notes/<seat>/`.
- Retention: n/a.
- No AXPress on the floating icon in the UI review: it activates the app over Pablo's work.
