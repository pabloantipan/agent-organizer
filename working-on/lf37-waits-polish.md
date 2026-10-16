---
title: "Needs me's record rows keep 'decision', say their age once, and others' rows line up"
status: now
repos: [organizer]
branch: lf37-waits-polish
seat: wp-build
stage: decisions-owned-and-used
updated: 2026-10-15
next: "review: lf37-waits-polish, gate met (P1, P2, P3, P4, X0), 3ceff0f"
risk: low
footprint: [frontend/src/components/Home.tsx (DecisionRow, WaitingOnOthers), frontend/src/styles/shell.css, their tests]
depends_on: []
boundary: ["docs/specs/leftovers-37.md Boundary, lf37-waits-polish"]
spec: "docs/specs/leftovers-37.md (FR-1 to FR-4; needs-me-waits Amendment 1, W7-W10)"
gate: "docs/specs/leftovers-37.md Acceptance, rows P1, P2, P3, P4 and X0"
ui_review: true
---

## Goal
Needs me's long-wait rows read cleanly: the kind of row in its column, the age once in amber, others' rows aligned with their owner up front (needs-me-waits Amendment 1).

## Gate
docs/specs/leftovers-37.md, rows P1, P2, P3, P4 and X0.
- [x] P1: vitest `frontend/src/components/Home.waits.test.tsx` (fixed now 2026-10-15, the lead's 25- and 6-day rows, alejandro's 25-day row), 10/10 — /Users/pabloantipan/organizer/.wt-notes/wp-build/out/x0-make-test.log
- [x] P2: Tab harness 1024x640, fixture, auth off: long rgb(255, 176, 32) at 600; 6-day row rgb(149, 142, 162) 400 = thread row's — /Users/pabloantipan/organizer/.wt-notes/wp-build/out/p2.jsonl, out/p2-needs-me.png
- [x] P3: Tab harness 1024: lozenges x 82 both, ages x 857.84 both, `owner alejandro ·`, `owner ana ·` — /Users/pabloantipan/organizer/.wt-notes/wp-build/out/p2p3.jsonl, out/p3-others.png
- [x] P4: vitest, sub-line exactly `Theirs to rule. Not counted in Needs me.` under the h3 — /Users/pabloantipan/organizer/.wt-notes/wp-build/out/x0-make-test.log
- [x] X0: clean clone at 1a5b921: make test 0, pnpm run build 0, wails build 0, `git status --porcelain` empty — /Users/pabloantipan/organizer/.wt-notes/wp-build/out/x0-*.log, out/x0-status.txt

## Done
- 2026-10-15 wp-build: record rows keep `decision`, age once in an amber `ib-age long` column, others' rows `owner <name> · …` with the group's sub-line; gate met, head 3ceff0f (rebased on main; X0 ran at 1a5b921, main moved by docs only). Reproduce: /Users/pabloantipan/organizer/.wt-notes/wp-build/progress.md.

## Declared changes
- modified `frontend/src/components/Home.tsx:Shell`: optional `long` prop adds the `long` class to `ib-age`
- modified `frontend/src/components/Home.tsx:DecisionRow`: always the `decision` lozenge; long waits pass `long` instead of an age lozenge
- modified `frontend/src/components/Home.tsx:OthersRow`: `decision` lozenge, subject starts with `ownerPhrase`, no dashed or age lozenge, `long` age column
- modified `frontend/src/components/Home.tsx:WaitingOnOthers`: sub-line `Theirs to rule. Not counted in Needs me.` in the h3
- modified `frontend/src/styles/shell.css`: `.ib-age.long` in `--warning` at 600
- modified `frontend/src/components/Home.waits.test.tsx`: P1, P4; leftovers-36 N2, N3, N6 rewritten to the new rows
Risky:
- `WaitingOnOthers`: the h3's accessible name now includes the sub-line, as Needs me's h2 does
Not changed, on purpose:
- `lib/queue.ts`: membership and sort untouched
- `.lz.waiting.dashed` (shell.css): now unused, outside the boundary's removal clause

## Notes
- The fixture has no record under 7 days; P2's short row was made by re-dating init-a 0010 in the page's store only (progress.md).
- `.lz.waiting.dashed` is now dead CSS; age x differs ~5 px between the two groups (Rule wider than Open in the `auto` verb column); within each group it is one x.
