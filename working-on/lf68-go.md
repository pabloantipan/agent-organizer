---
title: "Runs counts every seat of a wave, and the literal guard has no holes"
status: next
repos: [organizer]
branch: lf68-go
seat: l68-go
reviewer: l68-go-rev
stage:
updated: 2026-11-02
next: "sup112 runs it (0181 ruled 2026-11-02)"
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
