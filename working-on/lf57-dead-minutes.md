---
title: "Home reads the report's dead minutes instead of summing them"
status: now
repos: [organizer]
branch: lf57-dead-minutes
seat: l57dm-build
reviewer: l57dm-rev
review: "pass, unmet: none (l57dm-rev, 2026-11-02, 569375c)"
stage:
updated: 2026-11-02
next: "PR with talos-lab (joint merge: specs, claudecode, docs, then this branch; Note 1 filed to the FSE 2026-11-02)"
depends_on: [lf64-run-report-polish]
boundary: ["internal/service/report.go", "internal/service/report_test.go", "frontend/src/components/Home.tsx", "frontend/src/lib/runReport.ts", "frontend/src/components/runreport.fixtures/", "frontend/wailsjs/"]
spec: "docs/specs/leftovers-57.md (Amendment 7, FR-19 and FR-20)"
gate: "docs/specs/leftovers-57.md#Acceptance → gate"
ui_review: false
autonomy: unattended
---

## Goal
Deltagos computes nothing from the factory report; the stopped time comes from the report itself.

## Gate
docs/specs/leftovers-57.md Amendment 7: W12, W13, X0.

## Pre-answered
- Base: origin/main at the card's start (with lf64 merged).
- Contracts: a worktree of agent-mailbox-specs at `feat/report-dead-minutes` (54369d3); CONTRACTS_DIR at its `contracts/`.
- Merge target: a joint merge through talos-lab, asked in Hephaistos's thread 01M6D82ZX2YG16N37W93A2R3VH: specs, claudecode, docs, then this branch.
- Tests: Go in `report_test.go`; vitest beside Home and runReport (`cd frontend && npm test`).
- Short-sample fallback: the run report fixtures are refreshed from the branch's `expected.json`; never hand-edited numbers.
- Data shape across states: the factory-report schema on the specs branch.
- Evidence: test output under `.wt-notes/<seat>/`.
- Retention: n/a.

## Done
- 2026-11-02 l57dm-build: FR-19 and FR-20 built on lf57-dead-minutes (0b7c53a, 0026a88, 91b117c, 569375c), on origin/main 8b5c8f9; W12, W13, X0 pass (`.wt-notes/l57dm-build/progress.md`).

## Declared changes
- modified `internal/service/report.go:Progress`: adds `DeadMinutes` (json `dead_minutes`), the window total (FR-19)
- modified `internal/service/report.go:ProgressLine`: adds `DeadMinutes` (json `dead_minutes`), per line (FR-19)
- modified `frontend/wailsjs/go/models.ts`: regenerated, the two fields above
- modified `internal/service/report_test.go`: comment says CONTRACTS_DIR is the pin and the unset fallback is unpinned; `reportSample` logs when it reads the fallback; the missing-sample error names the pin (FR-20)
- modified `frontend/src/components/runreport.fixtures/expected.json`: copied whole from specs 54369d3
- modified `frontend/src/components/runreport.fixtures/SOURCE.md`: names 54369d3
- modified `frontend/src/components/Home.tsx:runSignalFor`: `deadMin` reads `progress.dead_minutes`, sums no span (FR-19)
- added `frontend/src/components/Home.deadmin.test.tsx`: W13
- modified `frontend/src/components/Home.run.test.tsx`: W8's quiet report sets `dead_minutes: 0` beside its empty spans
Risky:
- `runSignalFor`: a report from a factory older than d423577 has no `dead_minutes`; the signal then reads no stopped time (`?? 0`) instead of the sum
Not changed, on purpose:
- `frontend/src/lib/runReport.ts`: draws spans per row, sums nothing
- `Home.tsx` comment above `runSignalFor`: still says "the sum of the report's own minutes"; the boundary is the signal's line only
- `expected-windows.json`, `expected.txt`: byte-identical at 54369d3

## Notes
- FR-20 kept the unset fallback to `~/agent-slack/specs/contracts` (sup106 relayed the FSE's confirmation, 2026-11-02).

## Review
**Verdict: pass at 569375c (on origin/main 8b5c8f9). Unmet rows: none.** Reviewer l57dm-rev, 2026-11-02. Fresh clone `.wt-notes/l57dm-rev/clean`; logs in `.wt-notes/l57dm-rev/`.

```
change-check: working-on/lf57-dead-minutes.md
risk: medium (missing, read as medium)
repo organizer: base 8b5c8f984 (--base origin/main) ... head lf57-dead-minutes (clone HEAD 569375c35, on detached) 569375c35; 8 files, 3 flags; read in /Users/pabloantipan/organizer/.wt-notes/l57dm-rev/clean

## Changed

- organizer/frontend/src/components/Home.deadmin.test.tsx (added, test)
- organizer/frontend/src/components/Home.run.test.tsx (modified, test)
- organizer/frontend/src/components/Home.tsx (modified): runSignalFor
- organizer/frontend/src/components/runreport.fixtures/SOURCE.md (modified)
- organizer/frontend/src/components/runreport.fixtures/expected.json (modified)
- organizer/frontend/wailsjs/go/models.ts (modified): ProgressLine, Progress
- organizer/internal/service/report.go (modified): Progress, ProgressLine
- organizer/internal/service/report_test.go (modified, test)

## Tests touched

- organizer/frontend/src/components/Home.deadmin.test.tsx
- organizer/frontend/src/components/Home.run.test.tsx
- organizer/internal/service/report_test.go

## Risky (declared)

- `runSignalFor`: a report from a factory older than d423577 has no `dead_minutes`; the signal then reads no stopped time (`?? 0`) instead of the sum

## Not changed, on purpose (declared)

- `frontend/src/lib/runReport.ts`: draws spans per row, sums nothing
- `Home.tsx` comment above `runSignalFor`: still says "the sum of the report's own minutes"; the boundary is the signal's line only
- `expected-windows.json`, `expected.txt`: byte-identical at 54369d3

## Flags

| flag | where | symbol | detail |
|---|---|---|---|
| outside boundary | organizer/frontend/src/components/Home.deadmin.test.tsx |  | added |
| outside boundary | organizer/frontend/src/components/Home.run.test.tsx |  | modified |
| untested? | organizer/frontend/wailsjs/go/models.ts | ProgressLine | no test file names it |

3 flags: outside boundary 2, outside footprint 0, undeclared 0, declared, not changed 0, new env var 0, new dependency 0, new host 0, risk 0, untested? 1, could not read 0, boundary unreadable 0
```

Flags explained:
- outside boundary `Home.deadmin.test.tsx` (added), `Home.run.test.tsx` (modified): the card's Pre-answered puts the vitest "beside Home"; the first is W13 itself, the second is W8's quiet report gaining `dead_minutes: 0` (one line), which the contract requires once Home reads that field. Not a finding.
- untested? `models.ts ProgressLine`: generated; `TestReportDecodesContract` re-encodes `expected.json`, which carries `lines[].dead_minutes`, so the per-line field is covered by W12.

Rows:
- W12: pass on 569375c with CONTRACTS_DIR at specs-dm (HEAD 54369d3); on 8b5c8f9 with the branch's `report_test.go` it fails, "re-encoded report differs from expected.json" (the `dead_minutes` fields dropped) (`w12-branch.txt`, `w12-base.txt`).
- W13: passes on the branch; on 8b5c8f9 with the test and the refreshed `expected.json` it fails, `deadMin: 25` against 90 (`w13-branch.txt`, `w13-base.txt`).
- Fixtures: `cmp` of `expected.json`, `expected-windows.json`, `expected.txt` against specs-dm `contracts/factory-report/`: all identical.
- FR-20: `CONTRACTS_DIR` read when set, unset fallback kept and logged as unpinned, as the FSE confirmed.
- X0: `pnpm install --frozen-lockfile` ok; `make test` exit 0 (go: 19 packages ok; vitest 97 files, 1597 tests); `wails build` exit 0; `git status --porcelain` empty.
- `models.ts`: `wails generate module` leaves it byte-identical (only runtime file modes changed, reverted).

Note 1: the comment above `runSignalFor` (Home.tsx ~811) still says the stopped time is "the sum of the report's own minutes per dead span"; it is now wrong. Left alone because the boundary is the signal's line only. Goes to: a one-line follow-up in the PR or the next leftovers card; to be filed.
