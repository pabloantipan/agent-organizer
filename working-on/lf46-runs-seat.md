---
title: "Runs find their card by seat and fold a resumed seat into one row; old asks keep their note"
status: next
repos: [organizer]
branch: lf46-runs-seat
seat:
stage: review-map
updated: 2026-10-22
next: "pablo: rule 0154 (leftovers 46)"
risk: low
footprint: [internal/session/runs.go, internal/session/runs_test.go, internal/service/run.go, internal/service/run_test.go, internal/cli/run.go, internal/cli/run_test.go, internal/review/marks.go, internal/review/marks_test.go]
depends_on: []
boundary: ["docs/specs/leftovers-46.md Boundary, lf46-runs-seat"]
spec: "docs/specs/leftovers-46.md (FR-1 to FR-3)"
gate: "docs/specs/leftovers-46.md Acceptance, rows R1-R3 and X0"
ui_review: false
---

## Goal
organizer runs puts every seat's cost under its card, once per conversation.

## Gate
docs/specs/leftovers-46.md, rows R1-R3 and X0.

## Declared changes

## Notes
