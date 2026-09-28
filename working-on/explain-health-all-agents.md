---
title: Supervisors and builders show their mailbox health
status: next
repos: [organizer]
branch: main
updated: 2026-09-28
next: "Stamp health (with capped) on every live agent that has it, list personas outside the roster, flag a session running without its mailbox identity; then the timed end to end"
depends_on: ["explain-health-words"]
boundary: ["internal/service/crew.go (health on non-roster agents, and capped; not the blocker reasons)", "internal/model/model.go (Agent: capped, identity)", "internal/scan/agents.go (read-only use of the env it reads)", "frontend/src/components/AgentsView.tsx", "frontend/src/components/AgentList.tsx", "testdata/ (a canned health source for the fixture, A3)", "internal/service/crew_test.go"]
spec: "docs/specs/machine-explains-itself.md (FR-6, FR-7); values: docs/design-system.md"
gate: "docs/specs/machine-explains-itself.md Acceptance, rows G4, G5, G6, G7; the Gate section below"
stage: machine-explains-itself
---

## Goal
Roadmap stage machine-explains-itself (0032): FR-6, FR-7 of `docs/specs/machine-explains-itself.md`.

## Gate
- [ ] G4: see `docs/specs/machine-explains-itself.md`, Acceptance
- [ ] G5: see `docs/specs/machine-explains-itself.md`, Acceptance
- [ ] G6: see `docs/specs/machine-explains-itself.md`, Acceptance
- [ ] G7: see `docs/specs/machine-explains-itself.md`, Acceptance

## Done
- 2026-09-28 cut from the spec by the FSE

## Next
1. Stamp health (with capped) on every live agent that has it, list personas outside the roster, flag a session running without its mailbox identity; then the timed end to end

## Blockers
- waits on Pablo accepting the spec (decision 0040)
