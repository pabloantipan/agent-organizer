---
title: Initiatives carry a goal, a measure and stages
status: next
repos: [organizer]
branch: main
updated: 2026-09-26
next: "Read goal, measure, specs from initiative.yaml and working-on/roadmap.yaml into the board, with the current stage and the four problems of FR-5"
depends_on: []
boundary: ["internal/model/model.go (Initiative, Card, BoardInitiative: goal, measure, specs, stages, stage)", "internal/model/decision.go (stage)", "internal/scan/scan.go (ReadInitiative)", "internal/scan/roadmap.go (new)", "internal/scan/roadmap_test.go (new)", "internal/scan/decisions.go (the stage check)", "internal/merge/", "testdata/home/init-a/", "internal/cli/testdata/status.golden", "CLAUDE.md (Layout: one bullet)"]
spec: "docs/specs/redesign.md (FR-1 to FR-5); visual: docs/specs/redesign-mockups.html"
gate: "docs/specs/redesign.md Acceptance, rows G1, G2, G3, G9, G17; the Gate section below"
---

## Goal
The redesign, wave 1 of 2: FR-1 to FR-5 of `docs/specs/redesign.md`. Decisions 0013–0020.

## Gate
- [ ] G1: see `docs/specs/redesign.md`, Acceptance
- [ ] G2: see `docs/specs/redesign.md`, Acceptance
- [ ] G3: see `docs/specs/redesign.md`, Acceptance
- [ ] G9: see `docs/specs/redesign.md`, Acceptance
- [ ] G17: see `docs/specs/redesign.md`, Acceptance

## Done
- 2026-09-26 cut from the redesign spec by the FSE

## Next
1. Read goal, measure, specs from initiative.yaml and working-on/roadmap.yaml into the board, with the current stage and the four problems of FR-5

## Blockers
none

## Notes
- `stage:` is left out: the organizer has no roadmap yet (it waits on Pablo's intake); the FSE adds it once one is ruled
