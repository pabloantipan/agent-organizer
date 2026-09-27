---
title: The board carries the FSE's hand-off and recent commits
status: next
repos: [organizer]
branch: main
updated: 2026-09-26
next: "Read the bit\u00e1cora HAND-OFF and the last 10 Committed-by: FSE commits under the initiative root onto the board"
depends_on: ["redesign-goal-stages"]
boundary: ["internal/model/model.go (BoardInitiative: fse activity; nothing else)", "internal/scan/fse.go (new)", "internal/scan/fse_test.go (new)", "internal/merge/ (carry it)", "testdata/home/init-a/docs/bitacora/"]
spec: "docs/specs/redesign.md (FR-11); visual: docs/specs/redesign-mockups.html"
gate: "docs/specs/redesign.md Acceptance, rows G7, G9; the Gate section below"
---

## Goal
The redesign, wave 1 of 2: FR-11 of `docs/specs/redesign.md`. Decisions 0013–0020.

## Gate
- [ ] G7: see `docs/specs/redesign.md`, Acceptance
- [ ] G9: see `docs/specs/redesign.md`, Acceptance

## Done
- 2026-09-26 cut from the redesign spec by the FSE

## Next
1. Read the bitácora HAND-OFF and the last 10 Committed-by: FSE commits under the initiative root onto the board

## Blockers
- waits on Pablo accepting the spec (decision 0023)

## Notes
- `stage:` is left out: the organizer has no roadmap yet (it waits on Pablo's intake); the FSE adds it once one is ruled
