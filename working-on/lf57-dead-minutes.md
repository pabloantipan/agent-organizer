---
title: "Home reads the report's dead minutes instead of summing them"
status: now
repos: [organizer]
branch: lf57-dead-minutes
seat: l57dm-build
reviewer: l57dm-rev
stage:
updated: 2026-11-02
next: "l57dm-build builds lf57-dead-minutes (sup106 launched 2026-11-02)"
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
