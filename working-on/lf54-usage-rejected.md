---
title: "The usage post reads the record's rejected rows, stops resending them, shows them, and sends zero times as null"
status: now
repos: [organizer]
branch: lf54-usage-rejected
seat: l54-usage
stage:
updated: 2026-11-01
next: "review: lf54-usage-rejected, G3 G4 pass, X0 passes but for TestWorkingOnContract (identical on 076eb5c, lf54-decision-states), 4c78439"
depends_on: [lf53-usage-contract]
boundary: ["docs/specs/leftovers-54.md Boundary, lf54-usage-rejected"]
spec: "docs/specs/leftovers-54.md (FR-3 to FR-5)"
gate: "docs/specs/leftovers-54.md#Acceptance → gate"
ui_review: false
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

