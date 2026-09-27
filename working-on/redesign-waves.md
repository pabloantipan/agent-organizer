---
title: Cards seated wave<N>-* form a wave with its progress and tokens
status: next
repos: [organizer]
branch: main
updated: 2026-09-26
next: "Group cards by seat wave<N>-<name> into building, in review, queued and done, with gate rows (A2), tokens and supervisor (A1)"
depends_on: ["redesign-goal-stages", "redesign-agent-card"]
boundary: ["internal/model/model.go (AgentGroup: waves; nothing else)", "internal/service/waves.go (new)", "internal/service/waves_test.go (new)", "internal/service/service.go (the agents feed: attach waves)"]
spec: "docs/specs/redesign.md (FR-9); visual: docs/specs/redesign-mockups.html"
gate: "docs/specs/redesign.md Acceptance, rows G5, G9; the Gate section below"
---

## Goal
The redesign, wave 1 of 2: FR-9 of `docs/specs/redesign.md`. Decisions 0013–0020.

## Gate
- [ ] G5: see `docs/specs/redesign.md`, Acceptance
- [ ] G9: see `docs/specs/redesign.md`, Acceptance

## Done
- 2026-09-26 cut from the redesign spec by the FSE

## Next
1. Group cards by seat wave<N>-<name> into building, in review, queued and done, with gate rows (A2), tokens and supervisor (A1)

## Blockers
- waits on Pablo accepting the spec (decision 0023)

## Notes
- `stage:` is left out: the organizer has no roadmap yet (it waits on Pablo's intake); the FSE adds it once one is ruled
