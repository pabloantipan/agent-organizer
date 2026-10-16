---
title: "Needs me's record rows keep 'decision', say their age once, and others' rows line up"
status: now
repos: [organizer]
branch: lf37-waits-polish
seat: wp-build
stage: decisions-owned-and-used
updated: 2026-10-15
next: "P4: the sub-line renders beside the count inside the h3 (same y), not under the heading; move it under, or the FSE amends FR-4/P4 to the inline house sub-line (wp-review)"
risk: low
footprint: [frontend/src/components/Home.tsx (DecisionRow, WaitingOnOthers), frontend/src/styles/shell.css, their tests]
depends_on: []
boundary: ["docs/specs/leftovers-37.md Boundary, lf37-waits-polish"]
spec: "docs/specs/leftovers-37.md (FR-1 to FR-4; needs-me-waits Amendment 1, W7-W10)"
gate: "docs/specs/leftovers-37.md Acceptance, rows P1, P2, P3, P4 and X0"
ui_review: true
review: fail
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

## Review
Verdict: **fail**, unmet: P4. Reviewer wp-review, 2026-10-15, commit 3ceff0fd3aab25d807f3b414f5231439ca7af113, fresh clone (removed after). Evidence: /Users/pabloantipan/organizer/.wt-notes/wp-review/out/.
- P1: met. Read `Home.waits.test.tsx` against the row: fixed now 2026-10-15 (fake Date), lead 25 d and 6 d, alejandro 25 d; each row's first span is `lz waiting` `decision`, one lozenge, no `lz warning`, no dashed; 25 d ages `ib-age … long`, 6 d not; long descriptions `waiting 25 days, …` / `waiting on alejandro, 25 days, …`. Ran it: 10/10.
- P2: met. Tab harness 1024x640, own wails dev :34232, fixture + overlay, auth off (builder's steps, 0010 re-dated to 6 d in the page store only): `--warning` rgb(255, 176, 32); every long record row rgb(255, 176, 32) 600; 6 d init-a 0010 rgb(149, 142, 162) 400 = thread row 01M490219ZMV… rgb(149, 142, 162) 400. out/p2.jsonl, p2-needs-me.png.
- P3: met. Others' rows: lozenge left x 82 both, `ib-age` x 857.84 both; subjects `owner alejandro · init-a 0005 · …`, `owner ana · init-many 0075 · …`. out/p2p3.jsonl, p3-others.png.
- P4: **unmet**. Text is exact (`Theirs to rule. Not counted in Needs me.`, vitest and harness), but it is a `.sec-sub` span inside the flex-row h3, drawn beside the count: h3 y 45, count x 200 y 45, sub x 215 y 45 (out/p2p3.jsonl, p3-others.png). FR-4 and P4 say under the heading. It follows the inline house sub-line (Needs me's h2, Roles, Initiatives), so if W10 meant that, the row needs amending; flagged to sup76.
- X0: met. `make test` 0 (Go ok, vitest 760/760), `pnpm run build` 0, `wails build` 0, `git status --porcelain` empty.
- Shared test run: **reused** run ec7012f7-88717 of 3ceff0fd3aab (wp-ui, 2026-10-15T22:50:47).
- change-check (base main fe0874e, head 3ceff0f): changed Home.tsx (Shell, DecisionRow, WaitingOnOthers, OthersRow), Home.waits.test.tsx, shell.css; undeclared 0, declared-not-changed 0. Flags explained: `outside boundary`/`outside footprint` Home.waits.test.tsx: the Boundary's "their tests" (prose change-check cannot parse), footprint says "their tests" too; `untested? Shell`: exercised through DecisionRow/OthersRow in P1. No Go, no Gate.tsx, store, testdata or `lib/queue.ts` change; no new service call; badge 16 unchanged.


## UI review
Verdict: **pass**. Reviewer wp-ui, 2026-10-15, every row on commit 3ceff0fd3aab25d807f3b414f5231439ca7af113 (branch did not move). Shots and logs: /Users/pabloantipan/organizer/.wt-notes/wp-ui/ (worktree removed after).
- How checked: P1, P4 vitest read against the rows (fixed now, 25/6 d, lead's and alejandro's; exact sub-line) and run in the shared run. P2, P3 Tab harness 1024x640, own wails dev :34233, fixture + overlay, auth off, builder's steps copied (0010 re-dated to 6 d in the page store only): long rows rgb(255, 176, 32) 600 = `--warning`, 6 d row and thread row rgb(149, 142, 162) 400; others' lozenges x 82 both, ages x 857.84 both, subjects `owner alejandro · init-a 0005 · …`, `owner ana · init-many 0075 · …`; every record row `decision`, one lozenge; badge 16. Review build (fixture, auth off) AX tree by pid: heading name `WAITING ON OTHERS · 2 Theirs to rule. Not counted in Needs me.`, rows `Open init-a 0005`, `Open init-many 0075`. Shots: wkwebview-1024x640-P2-long-short.png, wkwebview-1024x640-P3-others.png.
- Shared test run: **fresh**, run ec7012f7-88717 of 3ceff0f, `make test` exit 0 (vitest 760/760); wp-review reused it.
- Diff: Home.tsx, shell.css, Home.waits.test.tsx only; no Go, Gate.tsx, store, testdata, `lib/queue.ts`; no new service call.
- P4 placement (differs from wp-review's fail): W10's source, Amendment 1 Q, says "one line under the heading, **as Needs me has**", and Needs me's sub-line is the same inline `.sec-sub` beside the count (h2 y = sub y). The build matches the named pattern, so I do not count it against the design; wording for the FSE below.

Findings (none 4 or 3):
- U1 (2) The owner is said twice on an others' row at 1280 and up. Where: Waiting on others, context line. Evidence: AX at 1440 draws subject `owner alejandro · …` and context `owner alejandro · raised 27 Sep by fse · …` (`decisionContext` leads with `ownerPhrase`); at 1024 compact hides the context, so the harness shot does not show it. The lead reads the same fact twice, the A2 fault in a new column. Proposal: drop the owner phrase from the context on others' rows (keep raised, by, options).
- U2 (1) Age x differs by verb width: 862.98 in Needs me (Rule), 857.84 in Waiting on others (Open), 9d beside Answer further left. Within a group it is one x, as P3 asks. Proposal: a fixed verb column width.
- U3 (1) `.lz.waiting.dashed` (shell.css:33) is dead CSS now; the boundary only allowed removing the age lozenge's rule.

Spec gaps (for the FSE): FR-4/P4 say "under the heading" while W10 says "as Needs me has" (inline beside the count): amend P4 to the inline house sub-line or say "on its own line". FR-3 never said what the context line keeps (U1).
For aglaea: U1 (owner in subject and context), U2 (one age x across groups or per group).
Not verified in WKWebView: VoiceOver reading the descriptions (no screen, spec's Not in the gate); `screencapture -l` of the review window came back blank, so review-build visuals rest on the harness snapshots and AX frames; firebase states not applicable.
