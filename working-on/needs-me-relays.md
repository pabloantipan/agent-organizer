---
title: Needs me leaves out '[for <role>]' relays
status: next
repos: [organizer]
branch: needs-me-relays
updated: 2026-10-04
next: "review: needs-me-relays, R1 and R0 pass at 755b5e1"
depends_on: []
boundary: ["frontend/src/lib/queue.ts (needsMeThread only)", "frontend/src/lib/queue.test.ts", "not: components, Go, the discuss server"]
spec: "docs/specs/needs-me-relays.md; ruling 0079"
gate: "docs/specs/needs-me-relays.md Acceptance, rows R1 and R0"
ui_review: false
seat: nmr-build
---

## Goal
Relays to a transversal role stop counting as the human's.

## Gate
- [x] R1: see `docs/specs/needs-me-relays.md`, Acceptance
- [x] R0: see `docs/specs/needs-me-relays.md`, Acceptance

## Done
- 2026-10-04 nmr-build: needsMeThread leaves out `[for <role>]` subjects (755b5e1, rebased on main); five queue.test.ts cases; npm test 185 pass, make test and npm run build pass
- 2026-10-04 sup34: worktree .wt/needs-me-relays from 027b1c7, seat nmr-build launched
- 2026-10-04 sup34 launched by the FSE; forecast 15-30 min
- 2026-10-04 cut by the FSE from 0079

## Next

## Blockers

## Notes
Disjoint from layers-focus-and-words (queue.ts is not in its boundary).
A fresh worktree fails `make test` (go vet: `frontend/dist` missing for the embed) until `npm run build` has run once; run the build first.
