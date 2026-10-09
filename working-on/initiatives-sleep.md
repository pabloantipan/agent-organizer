---
title: "Sleep and wake an initiative through the factory, and read asleep since, frozen sessions and what the factory sees"
status: next
repos: [organizer]
branch: initiatives-sleep
seat: is-build
stage: one-window
updated: 2026-10-09
next: "sup51 runs it (0106); first of two"
depends_on: []
boundary: ["new internal/service/sleep.go and tests", "internal/scan (status comment, frozen dirs), model.Initiative (asleep_since, frozen, factory_blind)", "app.go (Sleep, Wake, Factory), testdata, frontend/wailsjs regenerated", "not: the factory scripts, writing initiative.yaml"]
spec: "docs/specs/initiatives-view.md (FR-1 to FR-4)"
gate: "docs/specs/initiatives-view.md Acceptance, rows G1 to G4 and X0"
ui_review: false
---

## Goal
0104: Deltagos puts an initiative to sleep and wakes it the way `factory`
does, and knows what the factory sees.

## Gate
docs/specs/initiatives-view.md, G1 to G4 and X0.

## Notes
- 2026-10-09: supervisor sup51 (window 8385), spawned by the FSE.
