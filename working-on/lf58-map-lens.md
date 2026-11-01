---
title: "Roadmap gains Map: levels, status, drift and each node's grounding"
status: next
repos: [organizer]
branch: lf58-map-lens
seat:
stage:
updated: 2026-11-01
next: "sup103 runs it (0174 ruled 2026-11-01, autonomous mode)"
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
