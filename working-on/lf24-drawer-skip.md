---
title: "The skip link never sits under a drawer"
status: next
repos: [organizer]
branch: lf24-drawer-skip
seat:
stage: one-window
updated: 2026-10-13
next: "pablo: rule 0120 (accept leftovers-24); on accept the FSE starts its supervisor"
depends_on: []
boundary: ["docs/specs/leftovers-24.md Boundary, lf24-drawer-skip"]
spec: "docs/specs/leftovers-24.md (FR-10, FR-11; tab-reaches-links Amendment 1, T7, T12)"
gate: "docs/specs/leftovers-24.md Acceptance, rows E6, E7 and X0"
ui_review: true
---

## Goal
No skip link while a drawer is open; the drawer's link ring clears its comma (Aglaea, b131393, from sup59's close).

## Gate
docs/specs/leftovers-24.md, rows E6, E7 and X0.
