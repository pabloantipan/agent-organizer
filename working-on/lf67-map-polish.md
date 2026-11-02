---
title: "The map stays legible, keeps its place and tells picked from focus"
status: now
repos: [organizer]
branch: lf67-map-polish
seat: l67-map
reviewer: l67-map-rev, l67-map-ui
review: "l67-map-rev pass at 9af6568: V1, V2, V3, X0 met; M8-M14 are l67-map-ui's"
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


## Review
Verdict: **pass** at 9af6568 (on origin/main 83056a1). Unmet rows: none of V1, V2, V3, X0 (M8-M14 are l67-map-ui's). Reviewer l67-map-rev, 2026-11-02. Clean clone at 9af6568; logs in `.wt-notes/l67-map-rev/`.

change-check (`change-check organizer lf67-map-polish --base origin/main`):
```
10 files, 8 flags: outside boundary 0, outside footprint 0, undeclared 0, declared, not changed 0,
new env var 0, new dependency 0, new host 0, risk 0, untested? 8, could not read 0, boundary unreadable 0
untested?: MapFigure.tsx frameFit; MapView.tsx samePlaceState, useMapPlace, useMapEdges;
           mapSvg.ts declaredSize, sizeRules, compoundMatches, sizePx
```
The 8 `untested?` are private helpers run by named tests: the four mapSvg ones through `smallestTextSize` (V1, "an attribute, a style and an em size count"); `frameFit` through MapFigure.test "the frame's floor style"; `useMapPlace`, `samePlaceState` through V3 MapBody renders; `useMapEdges` is DOM-only, its CSS by "FR-1 (M8): the scroller's edges", its geometry M8's. No undeclared, outside-boundary or declared-not-changed line.

Rows:
- V1 (FR-1): mapSvg.test "V1: the legible floor" (3 tests: harbor L2 smallest 14 px; 16 px gives 0.6875; scale = max(fit, 11 ÷ smallest)), MapFigure.test frame style, MapView.test "FR-1 (M8): the scroller's edges". Pass.
- V2 (FR-2, 4, 7): MapView.test "V2: the trail at Context" (3), "V2: the panel's list in the roving set's order", "V2: an unknown fact reads unknown". Pass.
- V3 (FR-5): board.store.test "V3: mapPlace" (3), MapView.test "V3: the map's place kept per initiative" (4). Pass.
- On 83056a1 with the branch's four test files copied in: 22 failed, 105 passed (log `v-base.log`); every new V1-V3, FR-3 and FR-6 test fails there except the FR-4 order test, which passes (FR-4 landed in 8974fd6, inside 83056a1).
- X0: pnpm install --frozen-lockfile exit 0; `make test` exit 0 (go 19 packages ok, vitest 100 files / 1664 tests) **reused** test-lease run ca06037f-71826 of 9af6568 by l67-map-ui; `wails build` exit 0; `git status --porcelain` empty, wailsjs/runtime unchanged.

Inputs the builder's tests lack (scratch test, removed; output `review-extra.log`):
- FR-1, 20 px text at 400 wide in a 300 column: floor 0.55, scale 0.75 (fit wins), minWidth 220px. No text: smallest null, floor 0, no minWidth, scale = fit. Right.
- FR-2, Context entered fresh (map with only a context level): place `containersSeen:false`, trail `Context`. A kept Context place with containersSeen false on harbor: `Context`. Right.
- FR-5, harbor ↔ other ↔ harbor ↔ other ↔ harbor: trails alternate `Context › Containers › harbor-api` / `Context › harbor containers`, each identical on return. A reload dropping harbor_api (node, modules nodes and its level): restores to `containers`, picks `{}`, trail `Context › Containers`. Right.
- FR-6, picked = focused = harbor_api: one button with `map-node-picked`, `aria-current="true"`, `tabindex="0"`; the inset accent box-shadow and the `:focus-visible` outline at offset 2px are different properties, so the ring draws outside the edge. Right.
- board.store.ts adds only `mapPlace`, `setMapPlace`, `MapPlace`. map.css uses only tier-2 tokens (`--fg-subtle`, `--focus-ring`, `--accent`, `--accent-fg`, `--surface-selected` = violet-3 #2f1b55, the spec's `--selected`); no oklch, color-mix, nesting or @layer; `:not(g)` and `aspect-ratio` are within Safari 15.

Notes (none fail the card):
- Note: the spec's V2 "fails on main" is not true of FR-4: its test passes on 83056a1 because U5 landed in 8974fd6. Goes to: the FSE, a one-line amendment to leftovers-67's premises if it wants the table exact.
- Note: a map.json that keeps a container's modules level but drops the container node restores to that modules level (`{"level":"modules","container":"harbor_api"}`), the trail naming the id. c4-map/1 should not produce that. Goes to: the FSE, only if `c4-map check` does not already refuse it.
- Note: X0 as the spec writes it also runs `make review-build`; this review ran the prompt's X0 (no review build, as the prompt forbids launching one). Building it belongs to l67-map-ui's run. Goes to: sup111, the review prompt template.
- Note: the review prompt's `https://github.com/pabloantipan/organizer` does not exist; the remote is `git@github.com:pabloantipan/agent-organizer.git`, used instead. Goes to: sup111, the review prompt template.
