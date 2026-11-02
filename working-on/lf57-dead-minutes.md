---
title: "Home reads the report's dead minutes instead of summing them"
status: now
repos: [organizer]
branch: lf57-dead-minutes
seat: l57dm-build
reviewer: l57dm-rev
stage:
updated: 2026-11-02
next: "review: lf57-dead-minutes, W12 W13 X0 pass, 569375c"
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
