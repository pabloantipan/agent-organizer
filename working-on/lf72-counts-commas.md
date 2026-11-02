---
title: "Every count title through one piece, and commas that sit beside their names"
status: now
repos: [organizer]
branch: lf72-counts-commas
seat: l72-build
reviewer: l72-rev, l72-ui
stage:
updated: 2026-11-02
next: "l72-build builds it on lf72-counts-commas from origin/main 35992ed (sup116)"
depends_on: [lf71-count-look]
boundary: ["frontend/src/components/RunTracks.tsx", "frontend/src/components/UsageSessions.tsx", "frontend/src/components/Overview.tsx", "frontend/src/components/Rail.tsx", "frontend/src/components/RunReport.tsx", "frontend/src/components/SecCount.tsx", "frontend/src/styles/runreport.css", "frontend/src/styles/usage.css", "frontend/src/styles/overview.css", "frontend/src/styles/shell.css", "frontend/src/components/RunTracks.test.tsx", "frontend/src/components/RunReport.test.tsx", "frontend/src/components/RunReport.lf64.test.tsx", "frontend/src/components/SecCount.test.tsx", "frontend/src/components/"]
spec: "docs/specs/leftovers-72.md (FR-1 to FR-3)"
gate: "docs/specs/leftovers-72.md#Acceptance → gate"
ui_review: true
touches: []
change_order: {add: [], change: [], retire: []}
autonomy: unattended
---

## Goal
No count title left by hand, and no comma set apart from its name.

## Gate
docs/specs/leftovers-72.md, rows V1, V2, AR35, AR36 and X0.

## Pre-answered
- Base: origin/main at the card's start (includes #59, SecCount).
- Merge target: `main` through talos-lab's PR.
- Tests: vitest beside each file (`cd frontend && npm test`); a test outside the named files may change only where it asserts the old count or comma markup (the boundary's last entry, for that only).
- Design: Aglaea's f62790a; anything else to the FSE.
- Short-sample fallback: the existing fixtures; a state they lack (a `left` list of three) is added to the fixture; never the real home.
- Data shape across states: as the fixtures give it.
- Screen locked: UI rows may render offscreen, and the card says which.
- Evidence: shots under `.wt-notes/<seat>/`.
- Retention: n/a.
