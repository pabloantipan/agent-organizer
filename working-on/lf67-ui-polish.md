---
title: "The run report, Usage and header say plainly what presses and what is not his"
status: now
repos: [organizer]
branch: lf67-ui-polish
seat: l67-ui
reviewer: l67-ui-rev, l67-ui-ui
stage:
updated: 2026-11-02
next: "build: l67-ui launched by sup111 2026-11-02, worktree .wt/lf67-ui-polish from origin/main 83056a1"
depends_on: []
boundary: ["frontend/src/components/RunReport.tsx", "frontend/src/components/RunTracks.tsx", "frontend/src/components/SpecReader.tsx", "frontend/src/components/UsageTable.tsx", "frontend/src/components/Home.tsx", "frontend/src/lib/runReport.ts", "frontend/src/lib/specReader.ts", "frontend/src/styles/runreport.css", "frontend/src/styles/spec-reader.css", "frontend/src/styles/shell.css", "frontend/src/styles/usage.css", "frontend/src/components/RunReport.lf64.test.tsx", "frontend/src/components/RunReport.test.tsx", "frontend/src/components/SpecReader.test.tsx", "frontend/src/components/Usage.rejected.test.tsx", "frontend/src/lib/runReport.test.ts", "frontend/src/lib/specReader.test.ts"]
spec: "docs/specs/leftovers-67.md (FR-8 to FR-14)"
gate: "docs/specs/leftovers-67.md#Acceptance → gate"
ui_review: true
touches: []
change_order: {add: [], change: [], retire: []}
autonomy: unattended
---

## Goal
No look promises a press that is not there, and the header sits evenly at every width.

## Gate
docs/specs/leftovers-67.md, rows V4, V5, AR27-AR30, U9, R53 and X0.

## Pre-answered
- Base: origin/main at the card's start.
- Merge target: `main` through talos-lab's PR.
- Tests: vitest beside each file (`cd frontend && npm test`); UI rows in the review build.
- Design: Aglaea's amendments named in the spec; anything else to the FSE, which asks the judge-design subagent while Pablo is away.
- Short-sample fallback: a state the fixture lacks is added to the fixture; never the real home.
- Data shape across states: as the fixtures give it.
- Screen locked: UI rows may render offscreen, and the card says which.
- Evidence: shots under `.wt-notes/<seat>/`.
- Retention: n/a.
