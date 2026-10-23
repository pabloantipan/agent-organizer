---
title: "A resumed seat's cost is counted once, the app's runs fold per conversation, and the app's seat match reads the short name"
status: done
repos: [organizer]
branch: lf47-runs-cost
seat: c47-build
reviewer: c47-review
stage: review-map
updated: 2026-10-23
next: "merge lf47-runs-cost (d59ce0d), review passed"
depends_on: []
boundary: ["docs/specs/leftovers-47.md Boundary, lf47-runs-cost"]
spec: "docs/specs/leftovers-47.md (FR-4 to FR-6)"
gate: "docs/specs/leftovers-47.md Acceptance, rows C1-C3 and X0"
ui_review: false
review: pass
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

## Review
**Pass.** Unmet gate items: none. Reviewer `c47-review`, 2026-10-23, on d59ce0d from a clean clone.

### change-check
```
change-check: working-on/lf47-runs-cost.md
risk: medium (missing, read as medium)
repo organizer: base c9a71c45f (default origin/main) ... head lf47-runs-cost (clone HEAD d59ce0d39, on detached) d59ce0d39; 6 files, 4 flags; read in /Users/pabloantipan/organizer/.wt-notes/c47-review/clean

## Changed

- organizer/internal/service/cardjoin.go (modified): matchBySeat
- organizer/internal/service/cardjoin_test.go (modified, test)
- organizer/internal/service/run.go (modified): Service.liveRuns, runsView, runConversations, convRun
- organizer/internal/service/run_test.go (modified, test)
- organizer/internal/session/runs.go (modified): Conversations, foldCost
- organizer/internal/session/runs_test.go (modified, test)

## Tests touched

- organizer/internal/service/cardjoin_test.go
- organizer/internal/service/run_test.go
- organizer/internal/session/runs_test.go

## Risky (declared)

- `runConversations`: per-card tokens are now the last process's context once per conversation, not summed over its pids
- `runConversations`: folds before filtering by initiative, so a conversation lands where its last carded process put it

## Not changed, on purpose (declared)

- `RunInfo`: still no cost (0020); C2's cost is asserted on `runConversations`
- `internal/usage`: read only
- `internal/cli` golden file: unchanged, its tests pass

## Flags

| flag | where | symbol | detail |
|---|---|---|---|
| undeclared | organizer/internal/service/cardjoin_test.go |  | modified |
| undeclared | organizer/internal/service/run_test.go |  | modified |
| untested? | organizer/internal/service/run.go | Service.liveRuns | no test file names it |
| untested? | organizer/internal/session/runs.go | foldCost | no test file names it |

4 flags: outside boundary 0, outside footprint 0, undeclared 2, declared, not changed 0, new env var 0, new dependency 0, new host 0, risk 0, untested? 2, could not read 0, boundary unreadable 0
```
- undeclared `cardjoin_test.go`, `run_test.go`: declared in one bullet with `runs_test.go` (three paths, commas); the parser reads the first path only. Inside the boundary ("and its test").
- untested? `Service.liveRuns`: the one change is copying `rec.CostUSD`; no test drives it through `liveRuns` (C2 passes live runs to `runsView` directly). Note, to the FSE.
- untested? `foldCost`: exercised through `Conversations` by C1.
- Outside boundary 0, new dependency 0; `internal/usage`, `go.mod`, `go.sum`, `frontend/` have an empty diff.

### Fails on main (new tests copied onto a main clone, ba825d7)
- C1: `--- FAIL: TestConversationsCostCountsAResumeOnce/the_resumed_process_carries_the_cost_on` … `CostUSD:2.5 … want one at 1.50, resumed 1`. (The 1.00 → 0.40 case is 1.40 on main too, by sum; the first case carries the row.) Passes on branch. Doc comment states the rule (`runs.go:117-124`).
- C1 vs `foldCosts`: same order (last seen, then pid; usage's `At` is the run's `LastSeen`, `service/usage.go:47`), same tie-break, same split rule. They differ on a zero-cost line: usage keeps only `HasCost` (cost > 0), `foldCost` treats a 0 as a drop. Input pids 10/20/30 finals 1.00, 0, 1.50 in one session: `Conversations` gives 2.50, usage 1.50 (review-local test). The real archive has 0 such conversations of 694. FR-4's words literally give 2.50, "follows usage's rule" gives 1.50: Note, to the FSE (amend FR-4 or a follow-up card).
- C2: with the `runConversations` lines removed (undefined on main), `runsView` on main: `run_test.go:298: cards = [{… InputTokens:110000 Live:1 Runs:[{… pid 20 …} {… pid 10 …}]}], want one card with one row`. On branch: one row, cost 1.50 (not 2.50, not the stale 1.10 open line), live, resumed 1. Cost is asserted on `runConversations`, the fold `runsView` draws, since `RunInfo` has no cost (0020).
- C3: `cardjoin_test.go:254: one card = {…} false, want lf46-runs-seat matched`. On branch: one card matched, two none.

### Callers
`Conversations`: `service/run.go:349` (CLI `runs`) and `runConversations`; `runsView`: `InitiativeRuns` only; `matchBySeat`: `cardjoin.go:89` (the agent's card join, now reading the short name as `MatchRun` does). No other caller.

### Real archive (copy under `.wt-notes/c47-review/xdg`)
`go run . runs organizer`: m47-build (resumed 1, finals 3.68 → 4.36) reads $4.36 (main $8.05); rr-build (two pids at 1.63) reads $1.63 (main $3.27). A resumed seat's cost now looks right.

### X0
`XDG_DATA_HOME=$(mktemp -d) test-lease run --share -- make test`: fresh, run `9a11ef8f-22704` on d59ce0d, rc 0 (Go all ok, vitest 1024 passed). `pnpm run build` 0, `wails build` 0, `git status --porcelain` empty.
