---
title: "organizer review carries change-check's declared-change flags onto the map"
status: now
repos: [organizer]
branch: rm-v1-reconcile
seat: rr-build
stage: review-map
updated: 2026-10-17
next: "review: rm-v1-reconcile, R1 R2 R3 X0 met, c995111"
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
- Multi-repo: change-check runs once with the first repo's base and head (`rm.Base`, `rm.Head`); a card over several repos reconciles only that one. Not met here; a second card if needed.

## Done
- 2026-10-17 rr-build: change-check flags onto the map with --card (FR-11), map written with one why-line without it (FR-12); R1-R3, X0 met.
