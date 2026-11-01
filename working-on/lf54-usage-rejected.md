---
title: "The usage post reads the record's rejected rows, stops resending them, shows them, and sends zero times as null"
status: now
repos: [organizer]
branch: lf54-usage-rejected
seat: l54-usage
stage:
updated: 2026-11-01
next: "PR with talos-lab (4f33b33, review pass, X0 on the rebased head). Findings (usage --json / Usage view, rejected rows kept forever, doctor blank line): filed to the FSE (bitácora, next leftovers)"
depends_on: [lf53-usage-contract]
boundary: ["docs/specs/leftovers-54.md Boundary, lf54-usage-rejected"]
spec: "docs/specs/leftovers-54.md (FR-3 to FR-5)"
gate: "docs/specs/leftovers-54.md#Acceptance → gate"
ui_review: false
review: pass
reviewer: l54-usage-rev
---

## Goal
Every refused usage row is visible with its reason, and none is resent until it changes.

## Gate
docs/specs/leftovers-54.md, rows G3, G4 and X0.

## Done
- 2026-11-01 l54-usage: built on branch lf54-usage-rejected (e084d5d, 4c78439, rebased on origin/main 6b6e349). G3 and G4 fail on 076eb5c and pass on the branch; X0 from a clean clone: wails build ok, porcelain empty, vitest 1306 passed, make test fails only TestWorkingOnContract/decisions and /problems, identical on 076eb5c. Detail: .wt-notes/l54-usage/progress.md.

## Declared changes
- modified `internal/record/usage.go:PostUsage`: returns the record's 200 answer (`UsageResult`) besides the error (FR-3)
- added `internal/record/usage.go:UsageResult`, `UsageRejected`: the contract's `response` and `rejected` rows
- modified `internal/record/usage.go:UsageRow`: `First`, `Last` are `*string`, null when unknown (FR-5)
- modified `internal/service/usagepost.go:postUsage`: accepts only landed rows, keeps rejected ones with reason and hash, logs each once, skips a row whose hash matches its rejection (FR-3)
- added `internal/service/usagepost.go:RejectedUsageRow`, `UsageRejected`, `rejectedIn`, `rfc3339OrNull`, `cutKey`: state entry, reader for the CLI, index→row match, null times, key cut from reasons
- modified `internal/service/usagepost.go:usagePostState`, `usagePostOutcome`, `usageRow`, `usagePostReason`, `UsagePostStatus`, `logUsagePost`: `rejected` map and `rejected_rows` in the state; null times; doctor line `ok …, n rows, m rejected`; log creates the data dir first
- modified `internal/cli/usage.go:usageCmd`: prints the rejected rows after the bounded wait (FR-4)
- added `internal/cli/usage.go:writeUsageRejected`: count line, then session, day, reason per row
- modified `internal/cli/cli.go:doctor`: lists the rejected rows after the usage post line (FR-4)
- modified `internal/record/usage_test.go`, `internal/service/usagepost_test.go`: new signature; G3, G4 tests; the sample's `first and last null` case
- added `internal/service/usagepost_rejected_test.go`, `internal/cli/usage_rejected_test.go`: G3 re-rejection and G4 output tests
Risky:
- `rejectedIn`: a rejection whose index and key both miss the batch is dropped and that row counts as landed, as the record says of every row it does not name
- `usageCmd`: the text report's rejected section prints after the post's wait (at most 10 s), so on an unreachable record it trails the report
Not changed, on purpose:
- `organizer usage --json` and the app's Usage view: `usage.View` is the bound `App.Usage` type and the view is frontend, outside the boundary (Notes)
- `TestWorkingOnContract`: lf54-decision-states'

## Notes
- Found, not asked: the rejected rows are not in `usage --json` or the app's Usage view (bound type and frontend, outside this boundary); a later card can add them.

## Review
Verdict: **pass** at 4c78439. Unmet gate items: none (G3, G4, X0 met).
Reviewer l54-usage-rev, 2026-11-01. X0 ran on the branch alone (4c78439) and on its merge with lf54-decision-states 1df5001 (merge 0f38d10, parents 4c78439 + 1df5001). Both runs were fresh (`test-lease run --share` queued and ran them; neither was a replay). CONTRACTS_DIR was specs 54cf10d.

change-check (clean clone, base origin/main, head 4c78439): 8 files, 20 flags: outside boundary 1, undeclared 12, declared, not changed 0, untested? 7.
- undeclared (12: `UsageRejected` in record; `usagePostOutcome`, `rejectedIn`, `usageRow`, `rfc3339OrNull`, `usagePostReason`, `cutKey`, `logUsagePost`, `UsagePostStatus`, `UsageRejected` in usagepost.go; `usagepost_test.go`; `usage_rejected_test.go`): each is named in a Declared changes bullet, but the bullets list several symbols each and change-check reads only the first. Explained. Note: the bullets break the one-symbol-per-bullet format.
- outside boundary (`internal/service/usagepost_rejected_test.go`): the Boundary includes "and their tests", and this file tests usagepost.go. Explained.
- untested? (7): `usageCmd`, `writeUsageRejected` (TestG4UsageAndDoctorListRejectedRows via runWith); `rejectedIn`, `logUsagePost` (TestG3RejectedRowKeptNotResent, TestRejectedRowRejectedAgain); `rfc3339OrNull` (TestG4ZeroTimesAreNull); `usagePostReason`, `cutKey` (the existing key-redaction tests; G3 asserts the state carries no key). Explained.

- G3: met. On 4c78439, TestG3RejectedRowKeptNotResent, TestRejectedRowRejectedAgain and TestPostUsageReturnsTheResponse pass. Run with the branch's tests on 076eb5c, TestG3RejectedRowKeptNotResent fails on behaviour: `accepted map[... s-0001 ...], want only the two landed rows` and `rejected map[], want s-0001`. The record tests do not build there (`PostUsage returns 1 value`).
- G4: met. On 4c78439, TestG4UsageAndDoctorListRejectedRows (usage and doctor), TestG4ZeroTimesAreNull and TestUsageRowsMatchTheSample/first_and_last_null pass. All three fail on 076eb5c (`first = "0001-01-01T00:00:00Z" ..., want null`; no rejected lines).
- X0, branch alone: `make test` fails only TestWorkingOnContract/decisions and /problems (internal/scan), with messages identical to 076eb5c (Amendment 4, not counted); wails build ok; porcelain empty.
- X0 on merge 0f38d10: `make test` exit 0 (19 Go packages ok, vitest 87 files and 1385 tests passed); wails build ok; porcelain empty against the merge commit.
- FR-3 to FR-5 read against the diff: no finding.
- Note: a rejected row that leaves the ledger stays in the post state's `rejected` and is listed forever.
- Note: when rows are rejected, doctor prints a blank line between its lines (`writeUsageRejected` starts with "\n").
- Note: the gate has no row for `usage --json`, so the Found, not asked above was never in scope.
- Found, not asked (builder): the rejected rows are not in `usage --json` or the Usage view. Not filed yet: `next` says so.
- 2026-11-01, X0 on 4f33b33 (4c78439 rebased on origin/main 29e7d2c, with lf54-decision-states merged; range-diff shows both commits unchanged, and `git diff 4c78439 4f33b33` equals `git diff 6b6e349 29e7d2c`): `make test` exit 0, fresh run (19 Go packages ok, vitest 87 files and 1397 tests passed); wails build ok; porcelain empty. Verdict stays pass. (Also run on merge 04df964 = 4c78439 + ae0d9c6: make test passed, 1397 vitest tests.)
