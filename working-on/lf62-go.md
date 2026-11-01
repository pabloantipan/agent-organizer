---
title: "Runs and usage agree on read, rulings name the right owner, rejected usage rows are shown and pruned"
status: next
repos: [organizer]
branch: lf62-go
seat:
stage:
updated: 2026-11-01
next: "sup104 runs it (0175 ruled 2026-11-01, autonomous mode)"
depends_on: []
boundary: ["internal/service/run.go", "internal/service/rule.go", "internal/service/usagepost.go", "internal/service/tasks.go", "internal/service/literals_test.go", "internal/usage/", "internal/cli/"]
spec: "docs/specs/leftovers-62.md (FR-1 to FR-4)"
gate: "docs/specs/leftovers-62.md#Acceptance → gate"
ui_review: false
autonomy: unattended
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
