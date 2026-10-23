---
title: "A resumed seat's cost is counted once, the app's runs fold per conversation, and the app's seat match reads the short name"
status: next
repos: [organizer]
branch: lf47-runs-cost
seat: c47-build
reviewer: c47-review
stage: review-map
updated: 2026-10-23
next: "review: lf47-runs-cost, gate met (C1-C3, X0), d59ce0d"
depends_on: []
boundary: ["docs/specs/leftovers-47.md Boundary, lf47-runs-cost"]
spec: "docs/specs/leftovers-47.md (FR-4 to FR-6)"
gate: "docs/specs/leftovers-47.md Acceptance, rows C1-C3 and X0"
ui_review: false
---

## Goal
`organizer runs` and the app's runs panel count each conversation's money once, under the card its seat names.

## Gate
docs/specs/leftovers-47.md, rows C1-C3 and X0.

## Done
- c47-build: FR-4 to FR-6 on branch lf47-runs-cost (4682e3b, f5d76ee, d59ce0d), rebased on main d9af10b; C1-C3 fail on main and pass on the branch, X0 passed from a clean clone (make test, pnpm run build, wails build, porcelain empty); evidence in .wt-notes/c47-build/progress.md.

## Declared changes
- modified `internal/session/runs.go:Conversations`: cost by usage's rule, doc comment says so (FR-4)
- added `internal/session/runs.go:foldCost`: split where a final drops, sum each run's largest (a copy of usage's `foldCosts` rule, not an import)
- modified `internal/service/run.go:runsView`: draws one row per conversation from `runConversations` (FR-5)
- added `internal/service/run.go:runConversations`: archive with live records over it by key, folded by `session.Conversations`, then filtered by initiative
- added `internal/service/run.go:convRun`: a conversation plus whether one of its processes is live
- modified `internal/service/run.go:liveRuns`: copies the record's cost so a live process joins the cost fold (never reaches RunInfo)
- modified `internal/service/cardjoin.go:matchBySeat`: also matches the session's short name after `-probe-` (FR-6)
- modified `internal/session/runs_test.go`, `internal/service/run_test.go`, `internal/service/cardjoin_test.go`: C1, C2, C3
Risky:
- `runConversations`: per-card tokens are now the last process's context once per conversation, not summed over its pids
- `runConversations`: folds before filtering by initiative, so a conversation lands where its last carded process put it
Not changed, on purpose:
- `RunInfo`: still no cost (0020); C2's cost is asserted on `runConversations`
- `internal/usage`: read only
- `internal/cli` golden file: unchanged, its tests pass

## Notes
- C2's "cost by C1's rule" cannot be read off the app's view, which has no cost by 0020; the test asserts it on the fold `runsView` draws from.
- X0 run 1 failed on `TestAppCreateCrewReturnsAtOnce` (CreateCrew 1.10 s against a 1 s ceiling, memory pressure; outside this boundary) and test-lease refused wails build for low memory; run 2 passed whole.
