---
title: "A C4 level draws as an inline, sanitized dark SVG with a real button over each node"
status: now
repos: [organizer]
branch: lf58-map-render
seat: l58-render
stage:
updated: 2026-11-01
next: "l58-render builds on lf58-map-render (sup103 launched 2026-11-01, wave 1)"
depends_on: []
boundary: ["frontend/src/lib/mapSvg.ts", "frontend/src/lib/mapSvg.test.ts", "frontend/src/components/MapFigure.tsx", "frontend/src/components/MapFigure.test.tsx", "frontend/package.json", "frontend/pnpm-lock.yaml", "frontend/src/lib/testdata/"]
spec: "docs/specs/leftovers-58.md (FR-4 and FR-5)"
gate: "docs/specs/leftovers-58.md#Acceptance → gate"
ui_review: false
autonomy: unattended
---

## Goal
A lens can recolour the map's nodes, and every node is reachable by keyboard.

## Gate
docs/specs/leftovers-58.md, rows V1, V2 and X0.

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
