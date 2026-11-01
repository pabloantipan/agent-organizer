---
title: "The organizer has its own C4 base map, every node grounded"
status: now
repos: [organizer]
branch: lf63-organizer-map
seat: lf63-build
stage:
updated: 2026-11-01
next: "decide: c4-map cannot map a root that is its own repo (repos: []); fse asked, options A tool fix, B repos: [\".\"], C send back"
depends_on: [lf58-map-read]
boundary: ["docs/architecture/"]
spec: "docs/specs/leftovers-63.md (FR-1 to FR-3)"
gate: "docs/specs/leftovers-63.md#Acceptance → gate"
ui_review: false
autonomy: unattended
---

## Goal
Deltagos's Map shows the organizer itself, and atlax publishes its map with the slice.

## Gate
docs/specs/leftovers-63.md, rows C1-C5 and X0.

## Pre-answered
- Base: origin/main at the card's start (lf58-map-read merged, #24).
- Merge target: `main` through talos-lab's PR.
- Tests: no new test; the gate rows run the c4-map tools and lf58-map-read's existing TestMap.
- Tools: `~/claudecode/bin/c4-map`, `diagram-check`, `mermaid2svg` (claudecode main); mmdc under ~/.nvm.
- The method: claudecode `docs/specs/c4-base-map.md`; the README from `~/.claude/skills/spec-craft/templates/architecture-README.md`.
- Short-sample fallback: a node the adapters do not find and no evidence grounds is left out, never drawn ungrounded or invented; say which on the card.
- Data shape across states: c4-map/1 as the contract gives it.
- Evidence: command output under `.wt-notes/<seat>/`.
- Design questions (what to draw, what to merge or hide): the FSE, which asks the judge-architecture subagent while Pablo is away.
- Retention: n/a.
