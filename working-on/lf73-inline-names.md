---
title: "Comma lists read as text, counts read one way, your names read as you wrote them"
status: next
repos: [organizer]
branch: lf73-inline-names
seat: l73-build
reviewer: l73-rev, l73-ui
stage:
updated: 2026-11-02
next: "launch on 0186's ruling"
depends_on: [lf72-counts-commas]
boundary: ["frontend/src/components/RunTracks.tsx", "frontend/src/components/Rail.tsx", "frontend/src/components/Review.tsx", "frontend/src/components/SecCount.tsx", "frontend/src/styles/runreport.css", "frontend/src/styles/global.css", "frontend/src/styles/review.css", "frontend/src/components/"]
spec: "docs/specs/leftovers-73.md (FR-1 to FR-4)"
gate: "docs/specs/leftovers-73.md#Acceptance → gate"
ui_review: true
touches: []
change_order: {add: [], change: [], retire: []}
autonomy: unattended
---

## Goal
No ring over a name, no "(N)", and no name of Pablo's shouted in capitals.

## Gate
docs/specs/leftovers-73.md, rows V1-V3, AR35, AR37, AR38 and X0.

## Pre-answered
- Base: origin/main at the card's start (includes #61).
- Merge target: `main` through talos-lab's PR.
- Tests: vitest beside each file (`cd frontend && npm test`); a test outside the named files may change only where it asserts the old markup (the boundary's last entry, for that only).
- Design: Aglaea's e729ecc; anything else to the FSE.
- Short-sample fallback: the existing fixtures; a named rail group and a not-cut item after a link are added to the fixture if missing; never the real home.
- Data shape across states: as the fixtures give it.
- Screen locked: UI rows may render offscreen, and the card says which.
- Evidence: shots under `.wt-notes/<seat>/`.
- Retention: n/a.
