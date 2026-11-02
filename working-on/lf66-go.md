---
title: "Status reads, usage state, spec reader and review guard close their gaps"
status: now
repos: [organizer]
branch: lf66-go
seat: l66-go
reviewer: l66-go-rev
stage:
updated: 2026-11-02
next: "l66-go builds it on branch lf66-go (sup110, launched 2026-11-02)"
depends_on: []
boundary: ["internal/service/draft.go", "internal/cli/decisions.go", "internal/service/literals_test.go", "internal/service/usagepost.go", "internal/service/spec.go", "internal/specpath/", "reviewguard.go", "internal/service/draft_test.go", "internal/cli/decisions_test.go", "internal/service/usagepost_test.go", "internal/service/spec_test.go", "reviewguard_test.go"]
spec: "docs/specs/leftovers-66.md (FR-1 to FR-4)"
gate: "docs/specs/leftovers-66.md#Acceptance → gate"
ui_review: false
touches: []
change_order: {add: [], change: [], retire: []}
autonomy: unattended
---

## Goal
Four review findings closed, each with a test that fails on main.

## Gate
docs/specs/leftovers-66.md, rows G1-G4 and X0.

## Pre-answered
- Base: origin/main at the card's start (includes #43, the review guard).
- Merge target: `main` through talos-lab's PR.
- Tests: `go test ./...`; every fixture in a temp dir.
- Short-sample fallback: the real home is injected in G4, never read.
- Data shape across states: as the premises give it.
- Evidence: logs under `.wt-notes/<seat>/`.
- Retention: n/a.
