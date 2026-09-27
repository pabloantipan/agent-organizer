---
title: The app reads runs, with input tokens per card
status: next
repos: [organizer]
branch: redesign-runs-binding
updated: 2026-09-26
next: "Bind runs to the app for one initiative, with input tokens summed per card over archived and live sessions"
seat: wave1-runs
depends_on: []
boundary: ["app.go (a Runs method only)", "internal/service/run.go (Runs by initiative, tokens per card)", "internal/service/run_test.go", "frontend/wailsjs/ (regenerated)", "frontend/src/hooks/useWails.ts (the runs wrapper)"]
spec: "docs/specs/redesign.md (FR-10); visual: docs/specs/redesign-mockups.html"
gate: "docs/specs/redesign.md Acceptance, rows G6, G9, G17; the Gate section below"
---

## Goal
The redesign, wave 1 of 2: FR-10 of `docs/specs/redesign.md`. Decisions 0013–0020.

## Gate
- [ ] G6: see `docs/specs/redesign.md`, Acceptance
- [ ] G9: see `docs/specs/redesign.md`, Acceptance
- [ ] G17: see `docs/specs/redesign.md`, Acceptance

## Done
- 2026-09-26 cut from the redesign spec by the FSE

## Next
1. Bind runs to the app for one initiative, with input tokens summed per card over archived and live sessions

## Blockers
none

## Notes
- `stage:` is left out: the organizer has no roadmap yet (it waits on Pablo's intake); the FSE adds it once one is ruled
- 2026-09-26 sup2 runs this card (organizer-probe-sup2), spawned by the FSE after 0023; seat wave1-runs, worktree .wt/redesign-runs-binding, branch redesign-runs-binding
