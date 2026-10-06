---
title: "The Usage view: this week's tokens and money, past weeks, by initiative, role, task and model"
status: next
repos: [organizer]
branch: usage-view
seat: uv-build
stage: one-window
updated: 2026-10-06
next: "pablo: accept 0099, then the FSE starts the supervisor"
depends_on: [usage-ledger]
boundary: ["frontend/src/components/Usage.tsx and styles/usage.css (new)", "the top bar and board.store.ts screen (one entry), AgentsView.tsx (the week line only)", "frontend/src/lib helpers and tests, scripts/fixture-home.sh (a ledger)", "not: Go"]
spec: "docs/specs/usage.md (FR-5, FR-6; docs/ux/specs/usage.md (b104480))"
gate: "docs/specs/usage.md Acceptance, rows U1 to U9 and X0"
ui_review: true
---

## Goal
0098: tokens consumed and money, as clear as possible, weekly, in Deltagos.

## Gate
docs/specs/usage.md, U1 to U9 and X0.

## Notes
