---
title: Each live agent is joined to the card it works
status: next
repos: [organizer]
branch: main
updated: 2026-09-26
next: "Join each live agent to at most one open card by worktree path, branch, then seat; none when two cards answer"
depends_on: []
boundary: ["internal/model/model.go (Agent: its card; nothing else)", "internal/service/cardjoin.go (new)", "internal/service/cardjoin_test.go (new)", "internal/service/service.go (agentOptions, RefreshAgents wiring)"]
spec: "docs/specs/redesign.md (FR-6 to FR-8); visual: docs/specs/redesign-mockups.html"
gate: "docs/specs/redesign.md Acceptance, rows G4, G9; the Gate section below"
---

## Goal
The redesign, wave 1 of 2: FR-6 to FR-8 of `docs/specs/redesign.md`. Decisions 0013–0020.

## Gate
- [ ] G4: see `docs/specs/redesign.md`, Acceptance
- [ ] G9: see `docs/specs/redesign.md`, Acceptance

## Done
- 2026-09-26 cut from the redesign spec by the FSE

## Next
1. Join each live agent to at most one open card by worktree path, branch, then seat; none when two cards answer

## Blockers
- waits on Pablo accepting the spec (decision 0023)

## Notes
- `stage:` is left out: the organizer has no roadmap yet (it waits on Pablo's intake); the FSE adds it once one is ruled
