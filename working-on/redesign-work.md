---
title: Work shows five columns, the wave strip and who is on each card
status: next
repos: [organizer]
branch: main
updated: 2026-09-26
next: "Turn Board into Work: Next, Now, Blocked, In review (a lane from next: review:), Done; the wave strip; each card's agent line or nobody on it"
depends_on: ["redesign-shell-home"]
boundary: ["frontend/src/components/Board.tsx", "frontend/src/components/CardItem.tsx", "frontend/src/components/WaveStrip.tsx (new)", "frontend/src/styles/work.css (new)"]
spec: "docs/specs/redesign.md (FR-23, FR-19); visual: docs/specs/redesign-mockups.html; values: docs/design-system.md"
gate: "docs/specs/redesign.md Acceptance, rows G13, G18; the Gate section below"
---

## Goal
The redesign, wave 2 of 2: FR-19 of `docs/specs/redesign.md`. Decisions 0013–0020.

## Gate
- [ ] G13: see `docs/specs/redesign.md`, Acceptance
- [ ] G18: see `docs/specs/redesign.md`, Acceptance

## Done
- 2026-09-26 cut from the redesign spec by the FSE

## Next
1. Turn Board into Work: Next, Now, Blocked, In review (a lane from next: review:), Done; the wave strip; each card's agent line or nobody on it

## Blockers
none

## Notes
- `stage:` is left out: the organizer has no roadmap yet (it waits on Pablo's intake); the FSE adds it once one is ruled
- 2026-09-27 sup3 runs this card (organizer-probe-sup3), spawned by the FSE after wave 1 passed
