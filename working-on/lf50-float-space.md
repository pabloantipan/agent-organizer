---
title: "The floating icon comes back after a desktop change: a second full-screen read, and the panel ordered in again when the window server dropped it"
status: next
repos: [organizer]
branch: lf50-float-space
seat:
stage: review-map
updated: 2026-10-24
next: "sup89 runs it (0158 ruled 2026-10-24)"
depends_on: []
boundary: ["docs/specs/leftovers-50.md Boundary"]
spec: "docs/specs/leftovers-50.md (FR-1 to FR-3)"
gate: "docs/specs/leftovers-50.md#Acceptance → gate"
ui_review: false
---

## Goal
Moving between desktops never leaves Pablo without the floating icon where it should be.

## Gate
docs/specs/leftovers-50.md, rows S1-S4 and X0; no row moves between desktops.
