---
title: The Help shows how we follow the flow
status: next
repos: [organizer]
branch: main
updated: 2026-09-28
next: "Read help_doc (default ~/agent-slack/docs/how-we-build.md) at open and render it with its sections and monospace diagrams; say which path and key when missing"
depends_on: []
boundary: ["internal/config/config.go (help_doc)", "internal/service/help.go (new)", "internal/service/help_test.go (new)", "app.go (one Help method)", "frontend/wailsjs/ (regenerated)", "frontend/src/components/HelpView.tsx (new)", "frontend/src/components/TopBar.tsx (the Help entry)", "frontend/src/styles/ (the Help's CSS only)"]
spec: "docs/specs/machine-explains-itself.md (FR-1, FR-2, FR-3); values: docs/design-system.md"
gate: "docs/specs/machine-explains-itself.md Acceptance, rows G1, G2, G6; the Gate section below"
stage: machine-explains-itself
---

## Goal
Roadmap stage machine-explains-itself (0032): FR-1, FR-2, FR-3 of `docs/specs/machine-explains-itself.md`.

## Gate
- [ ] G1: see `docs/specs/machine-explains-itself.md`, Acceptance
- [ ] G2: see `docs/specs/machine-explains-itself.md`, Acceptance
- [ ] G6: see `docs/specs/machine-explains-itself.md`, Acceptance

## Done
- 2026-09-28 cut from the spec by the FSE

## Next
1. Read help_doc (default ~/agent-slack/docs/how-we-build.md) at open and render it with its sections and monospace diagrams; say which path and key when missing

## Blockers
- waits on Pablo accepting the spec (decision 0040)
