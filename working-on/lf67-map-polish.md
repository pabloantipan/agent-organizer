---
title: "The map stays legible, keeps its place and tells picked from focus"
status: now
repos: [organizer]
branch: lf67-map-polish
seat: l67-map
reviewer: l67-map-rev, l67-map-ui
stage:
updated: 2026-11-02
next: "review: lf67-map-polish, gate met (V1-V3 pass, fail on 83056a1; X0 pass; M8-M14 shown by AX at 1024x640, M13 ring keyboard-only), 9af6568"
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

## Done
- 2026-11-02 l67-map: FR-1 to FR-7 on `lf67-map-polish` (2349f5e, 3a07646, 9af6568), on origin/main 83056a1. New vitests: 22 fail on 83056a1, all pass on the branch (the FR-4 order test passes on main too: U5 landed in 8974fd6). X0 pass from a clean clone. M8-M14 put on screen by AX in the review build at 1024x640 (screen unlocked, window shots); how, in `.wt-notes/l67-map/progress.md`.

## Notes
- FR-6: `--selected` is `--surface-selected` (#2f1b55), the tier-2 name. The fill sits on the node's shape under its label (a filled button would hide the label); the 2 px accent edge is an inset box-shadow on the button, so the focus ring draws outside it.
- AX focus does not raise `:focus-visible` in WebKit: M13's ring shows only from the keyboard (the limit Amendment 3 records for M7); the css test proves it.
- RoadmapView resets its mode on an initiative change, so Map is pressed again after a rail switch; outside this card's boundary.

## Declared changes
- modified `frontend/src/stores/board.store.ts`: `mapPlace`, `setMapPlace` and type `MapPlace`, the map's place per initiative for the session (FR-5)
- added `frontend/src/stores/board.store.test.ts`: V3 at the store
- modified `frontend/src/lib/mapSvg.ts`: added `FLOOR_PX`, `smallestTextSize`, `floorScale`, `figureScale` (FR-1); `MapNode.ruledBy` and `nodeName` reads `ruled NNNN` (FR-3)
- modified `frontend/src/lib/mapSvg.test.ts`: V1, FR-3 name
- modified `frontend/src/components/MapFigure.tsx`: added `frameFit` (the floor as min-width); `picked` prop drawing `map-node-picked` and `aria-current` (FR-6); `data-floor` on the frame
- modified `frontend/src/components/MapView.tsx`: `MapBody` reads and writes the store place; added `restorePlace`, `figureNodes`, `useMapPlace`, `useMapEdges`; `trailOf` takes `containersSeen` and the trail is always drawn (FR-1, FR-2, FR-3, FR-5)
- modified `frontend/src/components/MapPanel.tsx`: added `UNKNOWN`; the kind and status facts read `unknown` (FR-7)
- modified `frontend/src/styles/map.css`: scroller edges and inset stop ring (FR-1); picked as `--surface-selected` fill plus inset `--accent` edge, no restroke (FR-6); an action's kind word inherits the accent (FR-3)
- modified `frontend/src/components/MapView.test.tsx`: V2, V3, FR-3, FR-6, FR-1 css rows; U4 regex loosened for the new borders
- modified `frontend/src/components/MapFigure.test.tsx`: the ruled name and the frame's floor style
Risky:
- `smallestTextSize`: a mermaid sheet with a new text rule shape (pseudo-class, attribute selector) is not counted; the floor would then come from the next smallest
- `MapBody`: the store write in an effect after restoring; a loop is avoided by comparing the restored place to the kept one
Not changed, on purpose:
- `RoadmapView.tsx`: its mode reset is outside the boundary; the place lives in the store whatever unmounts Map
- `lib/useScrollEdges.ts`: reused as is

