---
title: "organizer review carries change-check's declared-change flags onto the map"
status: done
repos: [organizer]
branch: rm-v1-reconcile
seat: rr-build
stage: review-map
updated: 2026-10-17
next: "review: rm-v1-reconcile, R1 R2 R3 X0 met, c995111"
review: pass
risk: low
footprint: [internal/review/*, internal/cli/review.go, internal/review/testdata/*]
depends_on: [rm-v1-ts]
boundary: ["docs/specs/review-map.md v1 Boundary, rm-v1-reconcile"]
spec: "docs/specs/review-map.md (v1, FR-11, FR-12)"
gate: "docs/specs/review-map.md v1 Acceptance, rows R1 to R3 and X0"
ui_review: false
---

## Goal
With a card, the map flags what was changed but not declared, declared but not changed, and outside the footprint, exactly as change-check says.

## Gate
docs/specs/review-map.md v1, rows R1 to R3 and X0.

- [x] R1: `organizer review organizer 43c61fc --card lf40-verb-fit --json` carries change-check's three flags and nothing else: `internal/review/testdata/rm-v1-reconcile/change-check-lf40-verb-fit.json` (change-check's own output, `.exit`: exit 1 = flags), `r1-revmap.json` (mismatches: `outside_footprint` file-level on SpecReader.test.tsx, its two test nodes flagged; `changed_not_declared` file-level on shell.css; `declared_not_changed` node-less, symbol `frontend/src/styles/shell.css:.ib-row`), `r1-summary.txt` (1, 1, 1; untested 0)
- [x] R2: `TestReconcileFlagsOntoNodes` in `internal/review/reconcile_test.go` (fake change-check on the PATH; also `TestReconcileNodeless`, `TestChangeCheckFailures`)
- [x] R3: `TestReviewWithoutReconciliation` in `internal/cli/review_test.go`; real runs `internal/review/testdata/rm-v1-reconcile/r3-no-card.txt`, `r3-no-change-check.txt`, `r3-change-check-fails.txt`
- [x] X0: `internal/review/testdata/rm-v1-reconcile/x0.txt` (clean clone at 1602af1; rebased onto main 09c96f4, a card-only commit, as c995111)

## Declared changes
- added `internal/review/reconcile.go`: ChangeCheck runs change-check from the PATH; Reconcile maps its three flag words onto nodes and mismatches
- added `internal/review/reconcile_test.go`: R2, node-less mismatches, change-check failures
- modified `internal/review/review.go`: `Mismatches` typed as `[]Mismatch`, `Reconciled` and `Reconciliation` on RevMap, the summary's mismatch counts or why there are none
- modified `internal/cli/review.go:reviewCmd`: `--card`, runs change-check for a card, writes the map without it otherwise
- modified `internal/cli/review_test.go`: R3
- added `internal/review/testdata/rm-v1-reconcile/`: R1, R3, X0 evidence
Risky:
- `Reconcile`: a flag naming a symbol in several nodes flags each and is one node-less mismatch
Not changed, on purpose:
- `change-check`: its false flags are Hephaistos's
- `internal/cli/cli.go`: `--card` needed nothing there

## Notes
- Exit codes: change-check exits 0 nothing flagged, 1 flags, 2 cannot run (its docstring, line 73). Real R1 exits 1, so "failing" reads as an exit other than 0 or 1, or output that is not its JSON; R3's fake exiting 1 prints `broken`, so it fails on the second.
- One mismatch per change-check flag, so the summary's counts are change-check's `counts` for the three words. The mismatch has `node` when the flag lands on exactly one node; a path-only flag (no symbol) flags every changed node of the file and is one file-level mismatch (`node: null`, `file`). `outside_footprint` therefore also has a mismatch type, which FR-11 names only for the file-with-no-node case.
- revmap.json gains `reconciled` (bool) and `reconciliation` (the card, or why not); mismatches carry `file` and `symbol` only when `node` is null.
- change-check's other words (`outside boundary`, `untested?`, `new env var`, ...) have no place in FR-11 and are left out.
- Multi-repo: change-check runs once with the first repo's base and head (`rm.Base`, `rm.Head`); a card over several repos reconciles only that one. Not met here; a second card if needed. → sup80, to the FSE

## Done
- 2026-10-17 rr-build: change-check flags onto the map with --card (FR-11), map written with one why-line without it (FR-12); R1-R3, X0 met.

## Review
Verdict: **pass**. R1, R2, R3 and X0 met at c9951112b3aac4f54416989408695334c1cbeefa (branch `rm-v1-reconcile`), checked from a fresh clone under `.wt-notes/rr-review/clean` (removed after); notes and outputs in `.wt-notes/rr-review/rmr-*`.

change-check (`change-check organizer rm-v1-reconcile --base 09c96f41d72be0f28efe3dbcc1d6d49a3630f265 --head c9951112b3aac4f54416989408695334c1cbeefa`, base = merge base with main, exit 0):

```
| boundary unreadable | organizer | docs/specs/review-map.md: no section 'v1 Boundary' | boundary entry |
| outside boundary | organizer/internal/cli/review.go |  | modified |
| outside boundary | organizer/internal/cli/review_test.go |  | modified |
| outside boundary | organizer/internal/review/reconcile.go |  | added |
| outside boundary | organizer/internal/review/reconcile_test.go |  | added |
| outside boundary | organizer/internal/review/review.go |  | modified |
| outside boundary | organizer/internal/review/testdata/rm-v1-reconcile/{change-check-lf40-verb-fit.exit, change-check-lf40-verb-fit.json, r1-revmap.json, r1-summary.txt, r3-change-check-fails.txt, r3-no-card.txt, r3-no-change-check.txt, x0.txt} (8 rows) |  | added |
| outside footprint | organizer/internal/cli/review_test.go |  | modified |
| untested? | organizer/internal/cli/review.go | reviewCmd | no test file names it |
| untested? | organizer/internal/review/reconcile.go | symName | no test file names it |
17 flags: outside boundary 13, outside footprint 1, undeclared 0, declared, not changed 0, new env var 0, new dependency 0, new host 0, risk 0, untested? 2, could not read 0, boundary unreadable 1
```

- `boundary unreadable` and the 13 `outside boundary`: known false flag, the boundary entry is written with words after the path (`docs/specs/review-map.md v1 Boundary, rm-v1-reconcile`). By hand, all 13 files are inside the spec's rm-v1-reconcile Boundary (`internal/review`, `internal/cli` review.go and its test, testdata); no frontend, app.go, main.go, change-check, bound Wails method; the only absolute paths in the Go diff are `#!/bin/sh` in the tests' fake change-check.
- `outside footprint` on `internal/cli/review_test.go`: real, the card's footprint lists `internal/cli/review.go` and not its test; the file is declared and inside the spec Boundary ("their tests"). Note, not blocking.
- `untested? reviewCmd`: false, `TestReviewWithoutReconciliation` drives it through `runWith`. `untested? symName`: unexported helper exercised by `TestReconcileFlagsOntoNodes` and `TestReconcileNodeless`.
- No `undeclared` or `declared, not changed` lines.

Rows:
- **R1 met.** Built `organizer` from the clone, `XDG_DATA_HOME=$(mktemp -d) organizer review organizer 43c61fc --card lf40-verb-fit --json` (exit 0); `change-check organizer lf40-verb-fit --base 43c61fc^1 --head 43c61fc --json` (exit 1, 3 flags, identical to the committed evidence). Scripted comparison (`rmr-r1-compare.py`): change-check 3 flags, all three FR-11 words; map 3 mismatches, types match one for one; `outside_footprint` file-level on `SpecReader.test.tsx` (its 2 test nodes flagged `outside_footprint`), `changed_not_declared` file-level on `shell.css` (no node), `declared_not_changed` node-less with symbol `frontend/src/styles/shell.css:.ib-row`; node flags not from change-check: 0; untested 0; `reconciled: true`. Summary line: `mismatches (change-check lf40-verb-fit): changed_not_declared 1, declared_not_changed 1, outside_footprint 1`. The reviewed repo's `git status --porcelain` stayed empty.
- **R2 met.** Read `TestReconcileFlagsOntoNodes`: fake change-check on the PATH prints `undeclared` on D, `declared, not changed` on `p/a.go:B`, `outside footprint` on A (all with nodes), plus a node-less file flag and two out-of-scope words; asserts the args, each node's flags exactly and each mismatch's type and node exactly. `go test -count=1 -run 'TestReconcile|TestChangeCheckFailures' ./internal/review/`: PASS. In a scratch copy outside the clone, mapping `outside footprint` to `changed_not_declared` makes it FAIL at reconcile_test.go:83 (mismatch on p.A) and :89 (summary counts).
- **R3 met.** Real runs at 43c61fc: no card → exit 0, `no reconciliation: no card`, map written; `PATH` = temp dir of symlinks to go, git, tar, `--card lf40-verb-fit` → exit 0, `no reconciliation: change-check not on PATH`, map written (`reconciled: false`, mismatches []); same plus a fake `change-check` printing `broken`, exit 1 → exit 0, `no reconciliation: change-check failed: output is not its --json`, map written. Each why is one line. The summary counts each mismatch type (R1's line above; R2 asserts `changed_not_declared 2, declared_not_changed 1, outside_footprint 1`). `TestReviewWithoutReconciliation` PASS.
- **X0 met.** `XDG_DATA_HOME=$(mktemp -d) test-lease run --share -- make test` from the clone root: exit 0 (go all ok, vitest 71 files / 810 tests passed). `cd frontend && test-lease run -- pnpm run build` exit 0, `test-lease run -- wails build` exit 0, `git status --porcelain` empty.

Unmet rows: none.

Shared test run: **fresh**, run id `3b176e2c-59731` (saved for reuse).

Notes (not blocking):
- Footprint omits `internal/cli/review_test.go` (change-check's `outside footprint`). → sup80, to the FSE
- `organizer help`'s review line in cli.go does not mention `--card` (rr-build's "Found, not asked", outside the boundary). → sup80, to the FSE
- Multi-repo cards reconcile only the first repo (card Notes, rr-build). → sup80, to the FSE

Reviewer: rr-review, 2026-10-17, commit c9951112b3aac4f54416989408695334c1cbeefa.
