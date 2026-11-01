---
title: "Runs and usage agree on read, rulings name the right owner, rejected usage rows are shown and pruned"
status: now
repos: [organizer]
branch: lf62-go
seat: l62-go
stage:
updated: 2026-11-01
next: "review: lf62-go, G1-G4 and X0 pass, 83fe879"
depends_on: []
boundary: ["internal/service/run.go", "internal/service/rule.go", "internal/service/usagepost.go", "internal/service/tasks.go", "internal/service/literals_test.go", "internal/usage/", "internal/cli/"]
spec: "docs/specs/leftovers-62.md (FR-1 to FR-4)"
gate: "docs/specs/leftovers-62.md#Acceptance → gate"
ui_review: false
autonomy: unattended
---

## Goal
What the CLI says about runs, rulings and usage is the same whichever command ran first.

## Gate
docs/specs/leftovers-62.md, rows G1-G4 and X0.

## Pre-answered
- Base: origin/main at the card's start.
- Merge target: `main` through talos-lab's PR.
- Tests: Go, beside each file in the boundary (`go test ./internal/...`).
- Short-sample fallback: a state a fixture lacks is added to the card's own fixture; never the real home, never skipped.
- Data shape across states: the existing types; FR-3 adds the rejected rows to the usage JSON as `{session_id, day, reason}`.
- Design questions: Aglaea's DS7 and R53 (Amendment 20) answer them; anything else to the FSE, which asks the judge-design subagent while Pablo is away.
- Evidence: test output and shots under `.wt-notes/<seat>/`.
- Retention: n/a.

## Done
- G1-G4 fail on a7bd633 and pass on lf62-go; G4's guard fails on a planted `d.Status == model.DecisionRuled` in a temp copy; X0 passes from a clean clone at 83fe879 (rebased on origin/main e968fc1). Evidence in `.wt-notes/l62-go/progress.md`.

## Declared changes
- modified `internal/usage/ledger.go`: `sessionAttribution` (the pass's per-session rule, extracted from `Ingest`) and added `Attributions` (that rule read-only, no lock, no write) for FR-1
- modified `internal/service/run.go`: `ledgerTasks` is a method reading through `usage.Attributions`; added `usageInputs` (initiatives and cost records a pass uses), shared with `Service.Usage` (FR-1)
- modified `internal/service/usage.go`: `Service.Usage` calls `usageInputs` and sets `View.Rejected` from `passRejected`; call sites only (FR-1, FR-3)
- modified `internal/service/rule.go`: `rulingLines` reads the owner through `model.PersonOf` (`ownerPerson`), names it only when it is not the ruler (FR-2)
- modified `internal/usage/report.go`: added `View.Rejected` and `RejectedRow` `{session_id, day, reason}` (FR-3)
- modified `internal/service/usagepost.go`: added `pruneRejected`, `pruneUsageRejected`, `passRejected`; `postUsage` prunes rejected rows whose ledger row is gone (FR-3)
- modified `internal/cli/usage.go`: `writeUsageRejected` prints no leading blank line; `usage` prints its own (FR-3, doctor)
- modified `frontend/wailsjs/go/models.ts`: generated `usage.RejectedRow`, `usage.View.rejected` (lf62-ui reads them)
- modified `internal/service/tasks.go`: `tasksOf` reads the record through `Decision.Decided()` (FR-4)
- added `internal/service/literals_test.go`: the status literal guard and its planted-copy test (G4)
- added `internal/service/run_lf62_test.go`: G1
- modified `internal/service/rule_test.go`, `usagepost_test.go`, `tasks_test.go`, `internal/cli/usage_rejected_test.go`: G2, G3, FR-4 tests
- modified `internal/cli/runs_lf56_test.go`: A5's FSE ledger row reads factory, as a pass writes it
Risky:
- `Service.Runs` and `InitiativeRuns` now scan the roots (no git) on every read, as `Usage` does
- `tasksOf`: an applied or acknowledged accept record with a forecast is now a task
- `usageInputs` takes `s.mu` around `scanOptions`; a caller already holding it would deadlock (none does)
Not changed, on purpose:
- `usage.BySession`: still the ledger as written; tests and nothing else in the runs path read it now
- `usagePostState.Accepted`: keys of gone rows are not pruned (not asked)
- `internal/cli/decisions.go:116`, `internal/service/draft.go:27`: string-literal status comparisons, outside FR-4's `model.Decision*` scope (draft.go outside the boundary)

## Notes
- `internal/service/usage.go` is outside the card's boundary; FR-1 and FR-3 change the pass it runs, so it carries two call sites, the code is in run.go and usagepost.go.
