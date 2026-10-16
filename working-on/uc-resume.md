---
title: "A resumed session's money counts every process, not the largest one"
status: next
repos: [organizer]
branch: uc-resume
seat: uc-build
updated: 2026-10-15
next: "sup75 runs it (uc-resume then uc-price); 0138 ruled"
risk: high
footprint: [internal/usage/ledger.go (CostSource, foldCosts), internal/usage/ledger_test.go, internal/service/usage.go]
depends_on: []
boundary: ["docs/specs/usage-audit.md Boundary (uc-resume)"]
spec: "docs/specs/usage-audit.md (FR-1, FR-2)"
gate: "docs/specs/usage-audit.md Acceptance (uc-resume), rows A1, A2, A3, A4, A5 and X0"
ui_review: false
---

## Goal
The Usage view's money is right for a woken or resumed seat: each process's cost is added, since Claude Code's total restarts per process (Hephaistos's audit, 2026-10-15: the organizer FSE shows $18.08, the audit $74.71).

## Gate
docs/specs/usage-audit.md, rows A1, A2, A3, A4, A5 and X0.
