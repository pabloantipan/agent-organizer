---
title: Needs me leaves out '[for <role>]' relays
status: done
repos: [organizer]
branch: needs-me-relays
updated: 2026-10-04
next: "review: needs-me-relays, R1 and R0 pass at 755b5e1"
review: pass
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

## Review
- Verdict: pass
- Commit reviewed: 755b5e1 (branch needs-me-relays)
- Unmet gate items: none. R1: queue.test.ts has all five cases with the expected results; reverting queue.ts to main fails them. R0: `make test` and `npm run build` pass in a fresh detached worktree (185 vitest tests). Boundary: only queue.ts (`needsMeThread` plus a private `RELAY_RE`) and queue.test.ts changed.
- Not gated: the regex accepts any bracket text after `[for `, spaces included (`[for a b] x` counts as a relay); the repo has no frontend lockfile, so `npm ci` cannot run.
- Reviewer: nmr-review
- Date: 2026-10-04

## Notes
Disjoint from layers-focus-and-words (queue.ts is not in its boundary).
A fresh worktree fails `make test` (go vet: `frontend/dist` missing for the embed) until `npm run build` has run once; run the build first.
