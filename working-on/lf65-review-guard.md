---
title: "A review or dev build cannot start against the real home"
status: now
repos: [organizer]
branch: lf65-review-guard
seat: l65-build
reviewer: l65-rev
stage:
updated: 2026-11-02
next: "l65-build builds it (sup109 launched 09:03, forecast 45-90m)"
depends_on: []
boundary: ["reviewguard.go", "reviewguard_dev.go", "reviewguard_nodev.go", "reviewguard_test.go", "main.go", "CLAUDE.md"]
spec: "docs/specs/leftovers-65.md (FR-1 to FR-5)"
gate: "docs/specs/leftovers-65.md#Acceptance → gate"
ui_review: false
touches: []
change_order: {add: [], change: [], retire: []}
autonomy: unattended
---

## Goal
No reviewer's slip can put a review or dev build on Pablo's real config or data again.

## Gate
docs/specs/leftovers-65.md, rows G1-G6 and X0.

## Pre-answered
- Base: origin/main at the card's start.
- Merge target: `main` through talos-lab's PR.
- Tests: `go test .` for G1-G3, G6; G4 and G5 in the review build built in the worktree.
- Short-sample fallback: the real home is injected in the unit tests; G4 uses a temp HOME, never the real one.
- Data shape across states: two env vars, each unset, empty, under the home, outside it.
- G4 and G5 never run without the saved pid; kill only with `safe-kill <pid>`.
- Evidence: logs under `.wt-notes/<seat>/`.
- Retention: n/a.
