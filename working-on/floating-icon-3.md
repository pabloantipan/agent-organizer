---
title: The floating list ends at its last row, the icon 8 px under the menu bar, shown beside a zoomed window, and the open list closes at once
status: now
repos: [organizer]
branch: floating-icon-3
seat: fi3-build
stage: one-window
updated: 2026-10-06
next: "fi3-build builds it on branch floating-icon-3 (sup46, wave 1)"
depends_on: []
boundary: ["floaticon_darwin.m, floaticon_darwin.h, floaticon_darwin.go", "frontend/src/components/FloatList.tsx, frontend/src/styles/float.css, frontend/src/lib/floatList.ts and its test", "scripts/floating-icon-by-hand.sh", "not: docs/ux/specs/floating-icon.md, the Ruled line, scripts/fixture-home.sh"]
spec: "docs/specs/leftovers-13.md (FR-6 to FR-9); docs/ux/specs/floating-icon.md Amendment 3 (3bc5164)"
gate: "docs/specs/leftovers-13.md, card floating-icon-3, rows F13 to F16 and X0; every row by the seat (0095)"
ui_review: true
---

## Goal
Aglaea's Amendment 3: four floating-icon details left by sup43 and sup44.

## Gate
docs/specs/leftovers-13.md, F13-F16 and X0.

## Notes
- 0096 ruled 2026-10-06; supervisor sup46, spawned by the FSE.
