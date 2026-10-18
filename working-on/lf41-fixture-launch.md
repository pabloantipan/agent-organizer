---
title: "organizer run prints every seat, one spec-path helper, and a fixture that never reaches the real mailbox"
status: next
repos: [organizer]
branch: lf41-fixture-launch
seat:
stage: review-map
updated: 2026-10-18
next: "pablo: rule 0149 (leftovers 41)"
risk: medium
footprint: [internal/service/launch.go, internal/service/launch_test.go, internal/cli/run.go, internal/cli/run_test.go, internal/scan/scan.go, internal/service/spec.go, internal/specpath/*, internal/config/config.go, internal/service/cell.go, scripts/fixture-home.sh, their tests]
depends_on: []
boundary: ["docs/specs/leftovers-41.md Boundary, lf41-fixture-launch"]
spec: "docs/specs/leftovers-41.md (FR-11 to FR-14)"
gate: "docs/specs/leftovers-41.md Acceptance, rows G4-G6 and X0"
ui_review: false
---

## Goal
The fixture posts nowhere real, and launch lines never race.

## Gate
docs/specs/leftovers-41.md, rows G4-G6 and X0.

## Declared changes

## Notes
