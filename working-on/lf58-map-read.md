---
title: "Deltagos reads an initiative's C4 map.json and each level's mermaid source"
status: next
repos: [organizer]
branch: lf58-map-read
seat:
stage:
updated: 2026-11-01
next: "the FSE launches its supervisor once 0174 is ruled"
depends_on: []
boundary: ["internal/service/map.go", "internal/service/map_test.go", "app.go", "frontend/wailsjs/", "testdata/fixture-map/", "CLAUDE.md"]
spec: "docs/specs/leftovers-58.md (FR-1 to FR-3)"
gate: "docs/specs/leftovers-58.md#Acceptance → gate"
ui_review: false
autonomy: unattended
---

## Goal
The map lens has one reader, refusing any map it cannot draw whole.

## Gate
docs/specs/leftovers-58.md, rows R1, R2 and X0.

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
