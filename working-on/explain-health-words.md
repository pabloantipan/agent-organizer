---
title: Every health word says why and what to do
status: next
repos: [organizer]
branch: main
updated: 2026-09-28
next: "One table of why and what-to-do per health state; capped says the next prompt delivers the mail, never restart"
depends_on: []
boundary: ["frontend/src/lib/health.ts (new)", "frontend/src/components/ContextBar.tsx", "frontend/src/components/Home.tsx (the health rows only)", "frontend/src/components/SlackView.tsx (the health counts' words only)", "internal/service/crew.go (the blocker reasons only)", "CLAUDE.md (the Slack paragraph's capped sentence)"]
spec: "docs/specs/machine-explains-itself.md (FR-4, FR-5); values: docs/design-system.md"
gate: "docs/specs/machine-explains-itself.md Acceptance, rows G3, G6; the Gate section below"
stage: machine-explains-itself
---

## Goal
Roadmap stage machine-explains-itself (0032): FR-4, FR-5 of `docs/specs/machine-explains-itself.md`.

## Gate
- [ ] G3: see `docs/specs/machine-explains-itself.md`, Acceptance
- [ ] G6: see `docs/specs/machine-explains-itself.md`, Acceptance

## Done
- 2026-09-28 cut from the spec by the FSE

## Next
1. One table of why and what-to-do per health state; capped says the next prompt delivers the mail, never restart

## Blockers
- waits on Pablo accepting the spec (decision 0040)
