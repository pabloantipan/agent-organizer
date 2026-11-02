---
title: "Roadmap gains Map: levels, status, drift and each node's grounding"
status: now
repos: [organizer]
branch: lf58-map-lens
seat: l58-lens
stage:
updated: 2026-11-01
next: "review: lf58-map-lens, X0 pass; M1-M7 pass in WebKit (wails dev + offscreen harness), review-build window rows not run: screen locked; 1123beb"
depends_on: [lf58-map-read, lf58-map-render]
boundary: ["frontend/src/components/RoadmapView.tsx", "frontend/src/components/MapView.tsx", "frontend/src/components/MapPanel.tsx", "frontend/src/components/MapView.test.tsx", "frontend/src/styles/map.css"]
spec: "docs/specs/leftovers-58.md (FR-6 to FR-9)"
gate: "docs/specs/leftovers-58.md#Acceptance → gate"
ui_review: true
autonomy: unattended
---

## Goal
Pablo sees where the system is, what is planned and what has drifted, in the Roadmap he already reads.

## Gate
docs/specs/leftovers-58.md, rows M1-M7 and X0.

## Pre-answered
- Base: origin/main at the card's start.
- Merge target: `main` through talos-lab's PR.
- Fixture: `testdata/fixture-map/` from the contract's harbor files (specs 54cf10d or later), plus the three variants the spec names; lf58-map-read creates it, the others read it.
- Short-sample fallback: a state the fixture lacks is added as a variant beside it; never the real home, never skipped.
- Data shape across states: c4-map/1 as `contracts/c4-map/map.schema.json` gives it; Deltagos stores nothing but the diagram cache it already keeps.
- Tests: Go in `internal/service/map_test.go`; vitest beside the new lib and components (`cd frontend && npm test`).
- Design questions: Aglaea's map-and-roadmap Amendments 1 and 2 answer them; anything else to the FSE, which asks the judge-design subagent while Pablo is away.
- Evidence: test output and review-build shots under `.wt-notes/<seat>/`.
- Retention: n/a.

## Done
- Map on Roadmap's switch (Stages, Map, Cards, Calendar): L2 first, trail Context › Containers › container, L3 from the panel, `No module map for this container.`; lens classes ruled/retiring/ungrounded with words under nodes; MapPanel as the map's text, Grounding lines each an action or its reason; empty and refused states (ca224b5, 77b1505, 1123beb, rebased on origin/main 1bc2d44).
- X0 pass at 1123beb from `.wt-notes/l58-lens/clean`; vitest 1611 passed.
- M1-M7 pass at 1440x900 and 1024x640 in WebKit (wails dev of the branch + offscreen harness), fail on base e968fc1 (no Map); shots `.wt-notes/l58-lens/shots/{1440x900,1024x640}-m{1..7}-*.png`, `1440x900-base-roadmap.png`; recipe and numbers in `.wt-notes/l58-lens/progress.md`.

## Notes
- The screen was locked all session (CGSSessionScreenIsLocked): AX of the review build's window and `screencapture -l` return nothing, so M1-M7 ran in WebKit via wails dev + the offscreen harness (earlier seats' method). The review-build window pass is written as a recipe in progress.md, not run.
- repo/deploy not on this machine: a line with no press and its reason (`not on this machine: <repo> is not in this initiative's repos` / `has no checkout here`).
- curated: pages open only when `docs/architecture` is under `specs:` (ReadSpec's allow-list); otherwise the line says why. A Go card could let ReadSpec read the map's pages.
- c4-map/1 has no members field, so merged nodes list none.

## Declared changes
- modified `frontend/src/components/RoadmapView.tsx`: the switch gains Map and mounts MapView
- added `frontend/src/components/MapView.tsx`: reads App.Map, levels, trail, lens classes, the words under nodes, the states
- added `frontend/src/components/MapPanel.tsx`: the map as text, node facts, Grounding lines and their actions (OpenInEditor, record in the drawer, spec reader)
- added `frontend/src/components/MapView.test.tsx`: headless states, levels, classes, lines, actions against mocked bindings
- added `frontend/src/styles/map.css`: status looks, panel, legend, the node ring (tier-2 tokens)
Risky:
- `MapTags`: a portal into MapFigure's frame, keyed on its class hooks (`.map-figure-frame`, `button.map-node` styles)
- `openRecord`: sets useSpecReader directly; focus return by its own subscription
Not changed, on purpose:
- `MapFigure.tsx`, `lib/mapSvg.ts`, `SpecReader.tsx`, Go: outside the boundary
