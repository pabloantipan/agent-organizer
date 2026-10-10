---
title: "A bare wails build leaves the tree clean; dead usage css removed"
status: now
repos: [organizer]
branch: lf18-build-drift
seat: bd-build
stage: one-window
updated: 2026-10-10
next: "bd-build building: wailsjs runtime modes, .usage-btn"
depends_on: []
boundary: ["docs/specs/leftovers-18.md Boundary, lf18-build-drift"]
spec: "docs/specs/leftovers-18.md (FR-11, FR-12)"
gate: "docs/specs/leftovers-18.md Acceptance, rows D1, D2 and X0"
ui_review: false
---

## Goal
lf15-build-drift fixed make install only; X0's bare wails build still dirties frontend/wailsjs/runtime/ (sup53).

## Gate
docs/specs/leftovers-18.md, rows D1, D2 and X0.

## Done

## Notes
