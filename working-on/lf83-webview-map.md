---
title: "The React app is on the organizer's own map, with its modules"
status: now
repos: [organizer]
branch: lf83-webview-map
seat: l83-map
reviewer:
review:
stage:
updated: 2026-11-08
next: "l83-map builds it on lf83-webview-map from origin/main 03f7d9b3 (sup125)"
depends_on: [lf76-map-regen]
boundary: ["docs/architecture/", "scripts/c4-adapter-webview"]
spec: "docs/specs/leftovers-83.md (FR-1 to FR-3)"
gate: "docs/specs/leftovers-83.md#Acceptance → gate"
ui_review: false
touches: []
change_order: {add: [], change: [], retire: []}
autonomy: unattended
---

## Goal
The map shows the Deltagos webview as its own container, with its modules and its edge to the Go app, and checks clean.

## Gate
docs/specs/leftovers-83.md, rows C1-C5 and X0.

## Pre-answered
- Base: origin/main at the card's start (includes #82).
- Merge target: `main` through talos-lab's PR.
- Design: Daedalus's judgement in 0196, option A; the fact line and the c4.json fragments are FR-1 and FR-2's, as the judge quoted c4-map reading them.
- Index the card's root in codebase-memory (`index_repository`) before the `--modules` runs; the existing index is of a removed worktree.
- Tests: the C rows' commands; no Go or vitest test.
- Short-sample fallback: n/a, the map is generated from the repo itself.
- Data shape across states: c4-map/1.
- Evidence: command output in the card's Done line.
- Retention: n/a.
