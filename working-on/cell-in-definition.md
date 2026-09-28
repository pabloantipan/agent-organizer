---
title: A cell being defined reads as in definition
status: next
repos: [organizer]
branch: main
updated: 2026-09-28
next: "Derive in definition for a cell whose seats never ran, and show it on Crew, the Agents tab and Home (0030)"
depends_on: []
boundary: ["internal/service/crew.go (the derived state; not CreateCrew)", "internal/model/model.go (Cell: state)", "frontend/src/components/Crew.tsx", "frontend/src/components/AgentsView.tsx", "frontend/src/components/Home.tsx (the signal only)", "testdata/ (a cell with no sessions)", "internal/service/crew_test.go", "frontend/src/styles/ (those components' CSS only)"]
spec: "docs/specs/discovery-in-a-cell.md (FR-1); values: docs/design-system.md"
gate: "docs/specs/discovery-in-a-cell.md Acceptance, rows G1, G5; the Gate section below"
stage: discovery-in-a-cell
seat: cell-indef
---

## Goal
Roadmap stage discovery-in-a-cell: FR-1 of `docs/specs/discovery-in-a-cell.md`.

## Gate
- [ ] G1: see `docs/specs/discovery-in-a-cell.md`, Acceptance
- [ ] G5: see `docs/specs/discovery-in-a-cell.md`, Acceptance

## Done
- 2026-09-28 cut from the spec by the FSE

## Next
1. Derive in definition for a cell whose seats never ran, and show it on Crew, the Agents tab and Home (0030)

## Blockers
none

## Notes
- 2026-09-28 sup15 runs this card (organizer-probe-sup15), spawned by the FSE after 0048
