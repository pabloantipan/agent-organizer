---
title: Needs me leaves out '[for <role>]' relays
status: next
repos: [organizer]
branch: needs-me-relays
updated: 2026-10-04
next: "sup34 builds it (organizer-probe-sup34, launched 2026-10-04; 0079 ruled)"
depends_on: []
boundary: ["frontend/src/lib/queue.ts (needsMeThread only)", "frontend/src/lib/queue.test.ts", "not: components, Go, the discuss server"]
spec: "docs/specs/needs-me-relays.md; ruling 0079"
gate: "docs/specs/needs-me-relays.md Acceptance, rows R1 and R0"
ui_review: false
---

## Goal
Relays to a transversal role stop counting as the human's.

## Gate
- [ ] R1: see `docs/specs/needs-me-relays.md`, Acceptance
- [ ] R0: see `docs/specs/needs-me-relays.md`, Acceptance

## Done
- 2026-10-04 sup34 launched by the FSE; forecast 15-30 min
- 2026-10-04 cut by the FSE from 0079

## Next

## Blockers

## Notes
Disjoint from layers-focus-and-words (queue.ts is not in its boundary).
