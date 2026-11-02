---
title: "The map stays legible, keeps its place and tells picked from focus"
status: now
repos: [organizer]
branch: lf67-map-polish
seat: l67-map
reviewer: l67-map-rev, l67-map-ui
stage:
updated: 2026-11-02
next: "build: l67-map launched by sup111 2026-11-02, worktree .wt/lf67-map-polish from origin/main 83056a1"
depends_on: []
boundary: ["frontend/src/components/MapView.tsx", "frontend/src/components/MapPanel.tsx", "frontend/src/components/MapFigure.tsx", "frontend/src/lib/mapSvg.ts", "frontend/src/styles/map.css", "frontend/src/stores/board.store.ts", "frontend/src/components/MapView.test.tsx", "frontend/src/components/MapFigure.test.tsx", "frontend/src/lib/mapSvg.test.ts", "frontend/src/stores/board.store.test.ts"]
spec: "docs/specs/leftovers-67.md (FR-1 to FR-7)"
gate: "docs/specs/leftovers-67.md#Acceptance → gate"
ui_review: true
touches: []
change_order: {add: [], change: [], retire: []}
autonomy: unattended
---

## Goal
Every map label is readable at 1024, and the map is where Pablo left it.

## Gate
docs/specs/leftovers-67.md, rows V1-V3, M8-M14 and X0.

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
