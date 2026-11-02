---
title: "Runs and usage agree on read, rulings name the right owner, rejected usage rows are shown and pruned"
status: done
repos: [organizer]
branch: lf62-go
seat: l62-go
stage:
updated: 2026-11-02
next: "done: PR #32 merged 049075e (2026-11-02)"
review: pass
reviewer: l62-go-rev
depends_on: []
boundary: ["internal/service/run.go", "internal/service/rule.go", "internal/service/usagepost.go", "internal/service/tasks.go", "internal/service/literals_test.go", "internal/usage/", "internal/cli/"]
spec: "docs/specs/leftovers-62.md (FR-1 to FR-4)"
gate: "docs/specs/leftovers-62.md#Acceptance → gate"
ui_review: false
autonomy: unattended
prs:
  - {repo: organizer, pr: 32, target: main, state: merged, merge: 049075e}
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

## Review
Verdict: **pass**. Unmet gate items: none. Reviewer `l62-go-rev`, 2026-11-02, at 83fe879 (branch `lf62-go`, merge base e968fc1). Test run fresh: `make test` waited in the test-lease queue and ran, nothing replayed; `wails build` fresh; porcelain empty.

| Row | Result | Proof |
|---|---|---|
| G1 | pass | `TestLF62G1RunsAttributeOnRead` passes at 83fe879. On a7bd633 with the test copied in it fails: `s-a: task "" before the usage pass, "rlf" after`. The read path is `usage.Attributions` (no lock, no ledger or offsets write, no post); `LoadRoles`, `loadOffsets` and `foldCosts` write nothing; the test also checks the ledger bytes are unchanged. |
| G2 | pass | `TestLF62G2RulingOwnerIsAPerson` passes. On a7bd633 it fails: `"pablo, 2026-11-01, owner operator, …"`. `RuleDecision`'s proposed-only check and its writes are untouched; only `rulingLines` changed. |
| G3 | pass | `TestLF62G3PostPrunesGoneRejectedRow`, `TestLF62G3UsageViewRejectedRows`, `TestLF62G3RejectedRowsInJSONPrunedNoBlankLine` pass. On a7bd633 the cli one fails on all three parts (`rejected = []`, `s-gone` kept, doctor's blank line), the post one fails (`gone row kept`), and the view one does not compile (`v.Rejected undefined`). The JSON is `{session_id, day, reason}` under `rejected`, never null. The prune drops only `Rejected` keys whose `session|day` is missing from the ledger. Tests post only to httptest (`newUsageRecord`) or with no `record_url` (doctor reads `usage post: off: no record_url`). |
| G4 | pass | `TestLF62G4*` pass. I planted `d.Status != model.DecisionRuled` in tasks.go in a temp copy of the tree and ran `LITERALS_ROOT=<copy> go test ./internal/service -run 'TestLF62G4NoDecisionStatusLiterals$'`. It printed `FAIL … internal/service/tasks.go:112: compares to a model.Decision* status`. A second plant in `internal/cli/zz.go:5` was caught too. On a7bd633 the guard fails on tasks.go:110. The allowlist has two files, `scan/decisions.go` (the validator) and `service/rule.go` (only a proposed record is ruled, 0019). Both still compare, so neither entry is stale, and that matches the spec's "model and that helper's callers' allowlist". |
| X0 | pass | `XDG_DATA_HOME=$(mktemp -d) CONTRACTS_DIR=…/sup104/specs/contracts test-lease run --share -- make test`: every Go package ok, vitest 1552/1552. `test-lease run -- wails build` built `Deltagos.app`. `git status --porcelain` was empty before and after `git checkout -- frontend/wailsjs/runtime`. |

FR-4 and `tasksOf`: the model's helper for a ruled record is `Decision.Decided()` ("ruled and stands": ruled, applied, acknowledged). FR-4 asks for a read through that helper, so applied or acknowledged accept records becoming tasks is what FR-4 asks for, not an unasked change. `TestLF62TaskRecordReadAsDecided` proves it and fails on a7bd633 (`applied: tasks []`).

change-check (`change-check organizer lf62-go --base origin/main`, from the clean clone):

```
change-check: working-on/lf62-go.md
risk: medium (missing, read as medium)
repo organizer: base 5586ef3b7 (--base origin/main) ... head lf62-go (clone HEAD 83fe879f7, on detached) 83fe879f7; 16 files, 16 flags; read in /Users/pabloantipan/organizer/.wt-notes/l62-go-rev/clean

## Changed

- organizer/frontend/wailsjs/go/models.ts (modified): RejectedRow, View
- organizer/internal/cli/runs_lf56_test.go (modified, test)
- organizer/internal/cli/usage.go (modified): usageCmd, writeUsageRejected
- organizer/internal/cli/usage_rejected_test.go (modified, test)
- organizer/internal/service/literals_test.go (added, test)
- organizer/internal/service/rule.go (modified): rulingLines, ownerPerson
- organizer/internal/service/rule_test.go (modified, test)
- organizer/internal/service/run.go (modified): Service.Runs, Service.InitiativeRuns, ledgerTasks, Service.ledgerTasks, usageInputs, Service.usageInputs
- organizer/internal/service/run_lf62_test.go (added, test)
- organizer/internal/service/tasks.go (modified): tasksOf
- organizer/internal/service/tasks_test.go (modified, test)
- organizer/internal/service/usage.go (modified): Service.Usage
- organizer/internal/service/usagepost.go (modified): postUsage, pruneRejected, pruneUsageRejected, passRejected
- organizer/internal/service/usagepost_test.go (modified, test)
- organizer/internal/usage/ledger.go (modified): Ingest, sessionAttribution, Attributions
- organizer/internal/usage/report.go (modified): View, RejectedRow

## Tests touched

- organizer/internal/cli/runs_lf56_test.go
- organizer/internal/cli/usage_rejected_test.go
- organizer/internal/service/literals_test.go
- organizer/internal/service/rule_test.go
- organizer/internal/service/run_lf62_test.go
- organizer/internal/service/tasks_test.go
- organizer/internal/service/usagepost_test.go

## Risky (declared)

- `Service.Runs` and `InitiativeRuns` now scan the roots (no git) on every read, as `Usage` does
- `tasksOf`: an applied or acknowledged accept record with a forecast is now a task
- `usageInputs` takes `s.mu` around `scanOptions`; a caller already holding it would deadlock (none does)

## Not changed, on purpose (declared)

- `usage.BySession`: still the ledger as written; tests and nothing else in the runs path read it now
- `usagePostState.Accepted`: keys of gone rows are not pruned (not asked)
- `internal/cli/decisions.go:116`, `internal/service/draft.go:27`: string-literal status comparisons, outside FR-4's `model.Decision*` scope (draft.go outside the boundary)

## Flags

| flag | where | symbol | detail |
|---|---|---|---|
| outside boundary | organizer/frontend/wailsjs/go/models.ts |  | modified |
| outside boundary | organizer/internal/service/rule_test.go |  | modified |
| outside boundary | organizer/internal/service/run_lf62_test.go |  | added |
| outside boundary | organizer/internal/service/tasks_test.go |  | modified |
| outside boundary | organizer/internal/service/usage.go |  | modified |
| outside boundary | organizer/internal/service/usagepost_test.go |  | modified |
| untested? | organizer/internal/cli/usage.go | usageCmd | no test file names it |
| untested? | organizer/internal/cli/usage.go | writeUsageRejected | no test file names it |
| untested? | organizer/internal/service/rule.go | ownerPerson | no test file names it |
| untested? | organizer/internal/service/run.go | Service.ledgerTasks | no test file names it |
| untested? | organizer/internal/service/run.go | Service.usageInputs | no test file names it |
| untested? | organizer/internal/service/usagepost.go | pruneRejected | no test file names it |
| untested? | organizer/internal/service/usagepost.go | pruneUsageRejected | no test file names it |
| untested? | organizer/internal/service/usagepost.go | passRejected | no test file names it |
| untested? | organizer/internal/usage/ledger.go | sessionAttribution | no test file names it |
| untested? | organizer/internal/usage/ledger.go | Attributions | no test file names it |

16 flags: outside boundary 6, outside footprint 0, undeclared 0, declared, not changed 0, new env var 0, new dependency 0, new host 0, risk 0, untested? 10, could not read 0, boundary unreadable 0
```

Every flag explained:
- outside boundary, `frontend/wailsjs/go/models.ts`: generated for `usage.View.rejected`. The spec's boundary allows `frontend/wailsjs` when FR-3 changes a bound type (listed under lf62-ui, but the type changes here).
- outside boundary, `internal/service/rule_test.go`, `run_lf62_test.go`, `tasks_test.go`, `usagepost_test.go`: the spec's boundary is "run.go, rule.go, usagepost.go, tasks.go **and their tests**". The card's `boundary:` field left "and their tests" out, so this is the card's transcription, not a breach.
- outside boundary, `internal/service/usage.go`: `Service.Usage` is the pass FR-1 and FR-3 change. Its diff is call sites only: the input-building block moved verbatim into `usageInputs` in run.go, `v.Rejected = passRejected(...)` was added, and the unused `scan` import was dropped. No logic stays in usage.go. Accepted. The one difference: `scanOptions` now runs under `s.mu` (it reads `prevCPU` and the card refs), which is safer. No caller holds `s.mu` (`app.go:581,592`, `cli/run.go:93`, `cli/usage.go:42`).
- untested? (10): each one is exercised through a gate test that calls its caller. `writeUsageRejected`/`usageCmd` through G3 cli and `TestG4UsageAndDoctor…`. `ownerPerson` through G2 (via `rulingLines`). `ledgerTasks`/`usageInputs`/`Attributions`/`sessionAttribution` through G1 and the whole usage suite (Ingest). `pruneRejected`/`pruneUsageRejected`/`passRejected` through the three G3 tests.
- undeclared 0, declared not changed 0.

`runs_lf56_test.go` A5 expectation `s-fse` changed from `organizer` to `factory`: the fixture's hand-written ledger row disagreed with what a pass writes for a session under no root. FR-1 removes that disagreement, so the fixture change is correct.

Findings (none blocking):
- Note: the G4 guard sees only `model.Decision*` constants. `internal/service/draft.go:27` (`d.Status == "proposed"`) and `internal/cli/decisions.go:116` compare string literals and escape it. The spec scopes FR-4 to the constants, so this does not fail the card. Not yet filed: see `next`.
- Note: the allowlist is per file, so a new comparison added anywhere in `rule.go` or `scan/decisions.go` passes unseen.
- Note: `passRejected` skips its prune while a post is running (the post prunes its own state). `--json` can then list a gone row once until the next pass.
- Findings placed (sup104, 2026-11-02): string-literal status comparisons (draft.go:27, cli/decisions.go:116) outside G4, and usagePostState.Accepted not pruned: filed to the FSE (bitácora, next leftovers; thread 01M6D4NXFT5D88P1FM9P1CY2ZW).
