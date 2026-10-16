---
title: "A steady crew test, honest CLI money, a missing card spec named, Escape in the Tab harness"
status: next
repos: [organizer]
branch: lf39-go-tidy
seat: gt-build
updated: 2026-10-16
next: "waits on 0143; on accept the FSE gives it to a supervisor"
risk: low
footprint: [internal/cli/crew_test.go, internal/cli/usage.go, internal/usage/report.go (Totals), internal/scan (card spec check), testdata/home, frontend/src/lib/usage.ts (totalsNotes), frontend/wailsjs/, scripts/tab-harness/tabharness.swift]
depends_on: []
boundary: ["docs/specs/leftovers-39.md Boundary, lf39-go-tidy"]
spec: "docs/specs/leftovers-39.md (FR-1 to FR-4)"
gate: "docs/specs/leftovers-39.md Acceptance, rows L1 to L5 and X0"
ui_review: false
---

## Goal
Four small findings from last night's reviews closed: the flaky crew test, `organizer usage` saying $0.00 for an unknown week, a card's missing spec file named on the board, and Escape in the Tab harness.

## Gate
docs/specs/leftovers-39.md, rows L1 to L5 and X0.
