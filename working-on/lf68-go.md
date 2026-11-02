---
title: "Runs counts every seat of a wave, and the literal guard has no holes"
status: now
repos: [organizer]
branch: lf68-go
seat: l68-go
reviewer: l68-go-rev
stage:
updated: 2026-11-02
next: "PR with talos-lab"
review: "pass, l68-go-rev 2026-11-02 at 0ff6c37: G1-G4, X0 met; notes only"
depends_on: []
boundary: ["internal/session/runs.go", "internal/session/runs_test.go", "internal/service/run.go", "internal/service/run_test.go", "internal/usage/", "internal/cli/", "internal/service/literals_test.go", "frontend/wailsjs/"]
spec: "docs/specs/leftovers-68.md (FR-1 to FR-4)"
gate: "docs/specs/leftovers-68.md#Acceptance → gate"
ui_review: false
touches: []
change_order: {add: [], change: [], retire: []}
autonomy: unattended
---

## Goal
A supervised wave's whole cost shows in `organizer runs`, by card or task.

## Gate
docs/specs/leftovers-68.md, rows G1-G4 and X0.

## Pre-answered
- Base: origin/main at the card's start.
- Merge target: `main` through talos-lab's PR.
- Tests: `go test ./...`; fixture ledgers in temp dirs, never the real runs.jsonl.
- Short-sample fallback: the fixture holds every case.
- Data shape across states: runs.jsonl lines as `internal/session` writes them.
- Evidence: logs under `.wt-notes/<seat>/`.
- Retention: n/a.

## Done
- 2026-11-02 l68-go: runs reads reviewers and supervisors through usage.RunAttributions; supervisor of one accept record shows as `task <NNNN>`; guard catches parens and allowlists by function with a count. Branch lf68-go at 0ff6c37 rebased on origin/main 341b328, not pushed. Evidence: .wt-notes/l68-go/progress.md.

## Declared changes
- modified `internal/usage/ledger.go:Attribution`: adds `Record` (the one accept record whose supervisor: is the session) and `Label()` (`task <NNNN>` or Task)
- modified `internal/usage/ledger.go:sessionAttribution`: a kept supervisor attribution gains its Record, task unchanged
- modified `internal/usage/ledger.go:sameAttribution`: compares Record
- added `internal/usage/ledger.go:RunAttributions`, `RunSeen`, `attributions`: the one reader runs uses; ledger first, else Attribute when it names a card task
- modified `internal/usage/ledger.go:Attributions`: delegates to attributions
- modified `internal/usage/attribute.go:Attribute`: sets Record for a supervisor
- added `internal/usage/attribute.go:recordOf`, `initiativeByID`: the record number, none when several
- added `internal/usage/lf68_test.go`: reader unit tests
- modified `internal/service/run.go:ledgerTasks`: takes the runs, calls usage.RunAttributions
- added `internal/service/run.go:cardless`: sessions the archive gave no card
- modified `internal/service/run.go:Runs`, `InitiativeRuns`, `withAttribution`: pass the runs; card is `Label()`
- modified `internal/service/run_test.go`: G1-G3 (`lf68Home`, `cardOf`)
- modified `internal/cli/run_test.go`: G2 printer test
- modified `internal/service/literals_test.go`: `unparen`, `findStatusComparisons`, `funcName`, `allowance`, function-keyed `statusLiteralAllowed`, `guardFindings` by function and count; G4 test; LF62 planted test's expected findings
Risky:
- `sessionAttribution`: a supervisor already in the real ledger is rewritten once on the next usage pass (Record added; task unchanged)
- `withAttribution`: a supervisor of one record now shows `task <NNNN>` in runs where it showed its card or `wave:<seat>`
Not changed, on purpose:
- `internal/session/runs.go:MatchRun`: the archive's matcher stays; reviewers and records are read only through usage's reader (FR-3)
- `Attribution.Task` values, the usage view, `frontend/src/lib/usage.ts:groupWaves`, `service/report.go:lineTokens`: unchanged, outside the boundary
- `frontend/wailsjs`: no bound type changed

## Notes
- CLAUDE.md's Runs baseline paragraph does not yet mention reviewer/record attribution or `task <NNNN>` (outside the boundary).
- The usage view still shows a one-card record's supervisor under its card; showing `task <NNNN>` there is a frontend card if wanted.

## Review
Verdict: **pass** at 0ff6c37 (branch did not move). Unmet rows: none. Reviewer l68-go-rev, 2026-11-02. Logs: `.wt-notes/l68-go-rev/`.

change-check (`--base origin/main`, which in the clone is 71fccb8; no frontend commit showed, so no rerun on 341b328): 7 files; outside boundary 0, undeclared 0, declared-not-changed 0, risk 0; 8 `untested?`. All 8 are exercised through callers: `ledgerTasks`, `cardless`, `withAttribution`, `RunAttributions`, `attributions`, `Attributions` by TestLF68G1/G2/G3 (via `Runs`, `InitiativeRuns`); `initiativeByID`, `sameAttribution` by TestLF68KeptSupervisorGainsItsRecord and the usage pass in G3.

- G1 met: TestLF68G1ReviewerRunIsItsCards passes; on 83056a1 fails (card "", want lf9).
- G2 met: TestLF68G2SupervisorRunIsItsRecordsTask, cli TestLF68G2RunsPrintsTheRecordsTask pass; on 83056a1 "0 rows for the supervisor", printer no rows, total not $4.75.
- G3 met: TestLF68G3RunsAndUsageAgree passes; on 83056a1 app before the pass "" and s-sup "wave:sup9" not "task 0009".
- G4 met: TestLF68G4GuardCatchesParensAndAllowsByFunction passes; the old guard (83056a1) over temp copies with `d.Status == ("ruled")` and a second `!= "proposed"` in draft.go reports nothing.
- X0 met: pnpm install, `make test` (Go ok, vitest 1643/1643), `wails build` exit 0, porcelain empty.

Extra inputs: reviewer in two cards' `reviewer:` → none; reviewer also another card's `seat:` → the reviewer card (lfA); `org-probe-xl9-rev` → overhead:session, no card; supervisor of two records → record "", `wave:sup9`, one row; record with two `cards:` → `task 0009` once, total $4.75; guard catches `x == (("ruled"))`, `("ruled") == x`, and a closure comparison inside `acceptRecord` (counted 2 of 1). Risk: an old supervisor ledger line after a usage pass differs only by `"record":"0009"` (plus the header generation); a reviewer line is unchanged. LF68 tests under a fake HOME wrote nothing there but Go telemetry.

- Note: `recordOf` reads every record carrying `supervisor:`, any status, not only ruled accept records; a withdrawn record naming a supervisor would label its run `task <NNNN>`. Not shown in real data. → FSE, for the next leftovers spec if wanted.
- Note: `org-probe-l9-rev2` is attributed as builder of a card whose `seat:` is `l9-rev` (the existing trailing-digit rule in `cardOfSeat`, not this diff). → no action; recorded here.

