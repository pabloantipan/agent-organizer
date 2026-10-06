---
title: "The scan reads waves and rounds from run records and joins each wave to its stages"
status: now
repos: [organizer]
branch: roadmap-waves-scan
seat: rws-build
stage: one-window
updated: 2026-10-06
next: "sup48 runs it, wave 1"
depends_on: [usage-view]
boundary: ["internal/scan (runs reader and tests), internal/model (Wave, Round), internal/merge", "app.go (type stubs only), frontend/wailsjs regenerated, testdata/fixture-overlay (run records)", "not: the run record template, internal/session"]
spec: "docs/specs/roadmap-as-a-plan.md (FR-1 to FR-3)"
gate: "docs/specs/roadmap-as-a-plan.md Acceptance, rows W1 to W4 and X0"
ui_review: false
---

## Goal
0093: the Roadmap reads like a project plan.

## Gate
docs/specs/roadmap-as-a-plan.md, W1 to W4 and X0.

## Notes
- 0100 ruled 2026-10-06; launches when usage-view is in done/.
- supervisor sup48, spawned by the FSE 2026-10-06.
