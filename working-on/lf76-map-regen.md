---
title: "The organizer's map is regenerated with the grounded stamp and checks clean"
status: next
repos: [organizer]
branch: lf76-map-regen
seat: l76-map
reviewer:
review:
stage:
updated: 2026-11-08
next: "l76-map regenerating from origin/main 46fc597e (sup118, launched 05:05)"
depends_on: []
boundary: ["docs/architecture/"]
spec: "docs/specs/leftovers-76.md (FR-1)"
gate: "docs/specs/leftovers-76.md#Acceptance → gate"
ui_review: false
touches: []
change_order: {add: [], change: [], retire: []}
autonomy: unattended
---

## Goal
`c4-map check` is clean on main after this merge, and stays clean.

## Gate
docs/specs/leftovers-76.md, rows C1-C3 and X0.

## Pre-answered
- Base: origin/main at the card's start.
- Merge target: `main` through talos-lab's PR.
- Tests: the c4-map, diagram-check and mermaid2svg runs of C1-C3 (mermaid2svg on copies, leftovers-63 Amendment 1).
- Short-sample fallback: n/a, the map is generated from the repo itself.
- Data shape across states: c4-map/1.
- Evidence: command output in the card's Done line.
- Retention: n/a.
