---
title: "Needs me says how long a record has waited; others' long waits get their own group"
status: now
repos: [organizer]
branch: lf36-needs-me-waits
seat: nw-build
stage: decisions-owned-and-used
updated: 2026-10-15
next: "review: lf36-needs-me-waits, gate met (N1-N6, X0; N4 per Amendment 1), 4a19ad3"
depends_on: []
boundary: ["docs/specs/leftovers-36.md Boundary, lf36-needs-me-waits"]
spec: "docs/specs/leftovers-36.md (FR-1 to FR-5; needs-me-waits W1-W6)"
gate: "docs/specs/leftovers-36.md Acceptance, rows N1, N2, N3, N4, N5, N6 and X0"
ui_review: true
review: pass
---

## Goal
A record waiting a week or more says so first on its Needs me row, and someone else's long wait shows apart under Waiting on others with Open (0134, exit 2 of decisions-owned-and-used).

## Gate
docs/specs/leftovers-36.md, rows N1, N2, N3, N4, N5, N6 and X0.

- [x] N1: .wt-notes/nw-build/out/vitest-n1-n6.txt
- [x] N2: .wt-notes/nw-build/out/vitest-n1-n6.txt
- [x] N3: .wt-notes/nw-build/out/vitest-n1-n6.txt
- [x] N4: .wt-notes/nw-build/out/n4n5.jsonl, out/n4-home.png (heading `· 2`, as Amendment 1 reads N4)
- [x] N5: .wt-notes/nw-build/out/n4n5.jsonl, out/n5-decisions.png
- [x] N6: .wt-notes/nw-build/out/vitest-n1-n6.txt
- [x] X0: .wt-notes/nw-build/out/x0-make-test.log, x0-pnpm-build.log, x0-wails-build.log, x0-status.txt (empty)

## Done
- 2026-10-15: nw-build built it on lf36-needs-me-waits (bdea474 queue, 4a19ad3 Home); gate met, unmerged, rebased on main after be39970.

## Notes
- 2026-10-15: run by sup73 (organizer-probe-sup73), spawned by the FSE.
- 2026-10-15: N4 reads `Waiting on others · 2`, not · 1: the overlay's init-a 0005 (alejandro, 18 d) is the record N4 asks for, so none was added, and the default fixture's init-many 0075 (ana, 14 d, testdata/fixture-many) also qualifies by FR-3. Asked sup73; the FSE amended N4 (leftovers-36 Amendment 1, be39970): n is what FR-3 selects from the fixture on the day. 0005 is the overlay record N4 and N5 use.

## Review
Pass: every gate row is met at 4a19ad3b3b5a7fe09fb1882b8c8085e515cc9e9d, checked from a fresh clone of the branch (`.wt-notes/nw-review/clean`, removed after). Evidence: `.wt-notes/nw-review/lf36/`.
- N1: met. `queue.test.ts` "N1" uses a fixed now and the lead's records at 8, 6, 9, 18 days plus a 2-day thread. Order 18, 9, 8, then the 6-day record and the thread; ages 18, 9, 8; the 6-day one is null. Run: `vitest-n.txt` (63/63). In the diff, `needsMeRows` only adds `waited` and a stable partition after the existing sort, so membership and count are unchanged. The test's own count check compares the rows with themselves, so it proves less than its name says; the diff proves the count.
- N2: met. `Home.waits.test.tsx` "N2": `<span class="lz warning">waiting 7 days</span>` comes before the id and Rule stays the verb. The test feeds `waited: 7` directly; that 7 days counts as 7 is covered by the `waitDays` test and the `>= LONG_WAIT_DAYS` check in `longWait`.
- N3: met. `queue.test.ts` "N3": alejandro 18, fse 9, alejandro 3, alejandro undated, alejandro on a paused initiative, the lead's own 18. The group holds 18 then 9 only and is `[]` when only the rest remain. `WaitingOnOthers rows=[]` renders nothing, and none of the group is in `needsMeRows`.
- N4: met as amended (Amendment 1). Tab harness at 1024×640 against my own `wails dev -devserver localhost:34222`, fixture plus overlay, auth off, probe stub (`n4n5.jsonl`, `n4-home.png`). An h3 `Waiting on others · 2` sits after the Needs me rows. FR-3 selects init-a 0005 (alejandro, 18) and init-many 0075 (ana, 14). The row title reads `waiting on alejandro · 18 days · init-a 0005 · Where the fixture's logs go`, with the dashed fuchsia lozenge (rgb 232,121,249) and the amber age. Badge 16 = `needsMeRows` 16, and none of the group's records is among them.
- N5: met. Same harness: Open on init-a 0005, focused and pressed with Return. Lands on screen initiative, sub decisions, init-a, decisionFocus init-a/0005. The row is `dec proposed expanded focused` (background rgb 47,27,85, focus inside the row), and Rule 0005 is offered (`n5-decisions.png`).
- N6: met. `Home.waits.test.tsx` "N6": `Rule camp 0007` is described by `waiting 18 days, camp 0007, Pick the store`, and `Open camp 0005` by `waiting on alejandro, 18 days, camp 0005, Who owns QA`. In the live harness, `Open init-a 0005` is described by its line too.
- X0: met. `make test` passed: all Go packages ok, vitest 757/757. `pnpm run build` exit 0, `wails build` exit 0, `git status --porcelain` empty (`x0-*.log`, `x0-status.txt`). It was also empty after `wails build` again following the dev run.
- Boundary and no-gos: the diff touches only `queue.ts`, `Home.tsx`, `shell.css` (`.lz.waiting.dashed`) and their tests. No Go, `Gate.tsx`, store or badge change, no service call, no new field. No date is computed: `waitDays` only counts days from `raised`. Who may rule is unchanged.
- Unmet: none.
- Shared test run: reused, run c1a0ee72-8534 of 4a19ad3b3b5a, by organizer-probe-nw-ui, exit 0.
- `## UI review` is missing at the time of writing, so status and place are left alone.
- Reviewer nw-review, 2026-10-15, commit 4a19ad3b3b5a7fe09fb1882b8c8085e515cc9e9d.
