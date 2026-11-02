---
title: "Rings whole in the wait line, one gap at the dot, the runs paragraph current"
status: now
repos: [organizer]
branch: lf70-small
seat: l70-build
reviewer: l70-rev, l70-ui
stage:
updated: 2026-11-02
next: "l70-build builds it on branch lf70-small from origin/main 440d577 (sup114)"
depends_on: []
boundary: ["frontend/src/styles/runreport.css", "frontend/src/components/UsageTable.tsx", "frontend/src/styles/usage.css", "frontend/src/components/Usage.rejected.test.tsx", "frontend/src/components/RunReport.test.tsx", "CLAUDE.md"]
spec: "docs/specs/leftovers-70.md (FR-1 to FR-3)"
gate: "docs/specs/leftovers-70.md#Acceptance → gate"
ui_review: true
touches: []
change_order: {add: [], change: [], retire: []}
autonomy: unattended
---

## Goal
No ring cut in the run report, the Usage title evenly spaced, CLAUDE.md true about runs.

## Gate
docs/specs/leftovers-70.md, rows V1, V2, D1, AR32, U10 and X0.

## Pre-answered
- Base: origin/main at the card's start.
- Merge target: `main` through talos-lab's PR.
- Tests: vitest beside each file (`cd frontend && npm test`); UI rows in the review build.
- Design: Aglaea's 5a333ac; anything else to the FSE.
- Short-sample fallback: the existing run-report and Usage fixtures; never the real home.
- Data shape across states: as the fixtures give it.
- Screen locked: UI rows may render offscreen, and the card says which.
- Evidence: shots under `.wt-notes/<seat>/`.
- Retention: n/a.
