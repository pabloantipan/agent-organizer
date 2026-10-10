---
title: "One name per session everywhere, notifications only from the installed app, the memory popover's reading state reachable"
status: now
repos: [organizer]
branch: lf15-names-and-notices
seat: ln-build
stage: one-window
updated: 2026-10-09
next: "sup52: answer ln-build's two questions (memfake.go for --memory none; AgentList landing name), and run the fixture evidence (N1 CLI, N2 log + notification db) that this session was refused permission for; code on lf15-names-and-notices 47625ec"
depends_on: []
boundary: ["the spec's Boundary for this card"]
spec: "docs/specs/leftovers-15.md (FR-1 to FR-3)"
gate: "docs/specs/leftovers-15.md Acceptance, rows N1 to N3 and X0"
ui_review: false
---

## Goal
Leftovers from 2026-10-09's reviews (0111).

## Gate
docs/specs/leftovers-15.md, N1 to N3 and X0.

## Done
- FR-1 and FR-2 built on lf15-names-and-notices (30ed83b, c5c881e, 47625ec), unit-tested; X0 passed pre-rebase. Progress and repro: .wt-notes/ln-build/progress.md.

## Notes
- FR-3 needs memfake.go (`ORGANIZER_MEMORY_FAKE=none` as "no sample yet"), outside the card's boundary: asked sup52.
- The Agents › landing row is named in AgentList.tsx (lp-build's): asked sup52.
- Fixture runs and the usernoted database were refused by ln-build's permission layer; N1's fixture part and N2 need a session allowed to run them.
