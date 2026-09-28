---
title: Bring crew up refuses a seat without its persona file
status: next
repos: [organizer]
branch: main
updated: 2026-09-28
next: "Refuse organizer crew and Bring crew up when agents/<seat>.md is missing, naming each file; mark the seat row"
depends_on: ["cell-in-definition"]
boundary: ["internal/service/crew.go (CreateCrew's preflight only)", "internal/cli/crew.go", "frontend/src/components/Crew.tsx (the seat row only)", "testdata/ (a seat without its file)", "internal/service/crew_test.go"]
spec: "docs/specs/discovery-in-a-cell.md (FR-2); values: docs/design-system.md"
gate: "docs/specs/discovery-in-a-cell.md Acceptance, rows G2, G5; the Gate section below"
stage: discovery-in-a-cell
seat: cell-persona
---

## Goal
Roadmap stage discovery-in-a-cell: FR-2 of `docs/specs/discovery-in-a-cell.md`.

## Gate
- [ ] G2: see `docs/specs/discovery-in-a-cell.md`, Acceptance
- [ ] G5: see `docs/specs/discovery-in-a-cell.md`, Acceptance

## Done
- 2026-09-28 cut from the spec by the FSE

## Next
1. Refuse organizer crew and Bring crew up when agents/<seat>.md is missing, naming each file; mark the seat row

## Blockers
none

## Notes
- 2026-09-28 sup15 runs this card (organizer-probe-sup15), spawned by the FSE after 0048
