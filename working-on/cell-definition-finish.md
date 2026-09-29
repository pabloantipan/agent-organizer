---
title: A cell in definition reads as one on the rail, and its buttons say why
status: next
repos: [organizer]
branch: main
updated: 2026-09-29
next: "sup16: after cell-draft (0050 ruled 2026-09-29)"
depends_on: ["cell-draft"]
boundary: ["frontend/src/components/Rail.tsx (the mark)", "frontend/src/components/Crew.tsx (the Bring crew up and Retire buttons only)", "internal/service/crew.go (Retirable only)", "FR-7's files, only if 0051 is ruled before launch", "testdata/", "tests", "CSS"]
spec: "docs/specs/discovery-in-a-cell.md (FR-1 rail, FR-5, FR-6, amendment 1); values: docs/design-system.md"
gate: "docs/specs/discovery-in-a-cell.md Acceptance, rows G6, G5; the Gate section below"
stage: discovery-in-a-cell
seat:
---

## Goal
Roadmap stage discovery-in-a-cell: sup15's closing points 1, 2 and 4 of
`runs/2026-09-28-discovery-in-a-cell.md`, as FR-1 (rail), FR-5 and FR-6 of
`docs/specs/discovery-in-a-cell.md`, amendment 1.

## Gate
- [ ] G6: see `docs/specs/discovery-in-a-cell.md`, Acceptance
- [ ] G5: see `docs/specs/discovery-in-a-cell.md`, Acceptance

## Done
- 2026-09-29 cut from amendment 1 by the FSE

## Next
1. sup16 runs this card

## Blockers
none

## Notes
- 2026-09-29 sup16 runs this card (organizer-probe-sup16), spawned by the FSE after 0050; FR-7 stays out (0051 open)
- After cell-draft: both touch `Crew.tsx` and `crew.go`; FR-6 also disables
  the button on a draft, which cell-draft introduces.
