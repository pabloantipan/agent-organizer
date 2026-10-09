---
title: "The Initiatives view: cards awake, asleep and archived, Sleep and Wake, the rail's folds, memory on every Agents row"
status: next
repos: [organizer]
branch: initiatives-view
seat: iv-build
stage: one-window
updated: 2026-10-09
next: "waits on 0106 (accept), initiatives-sleep and ram-view merged"
depends_on: [initiatives-sleep, ram-view]
boundary: ["new InitiativesView.tsx and css, the top bar and the store's screen", "Rail.tsx (folds), Home.tsx (one line), InitiativeHeader.tsx (asleep line), AgentsView.tsx and AgentList.tsx (Memory column)", "frontend/src/lib helpers and tests, scripts/fixture-home.sh", "not: Go"]
spec: "docs/specs/initiatives-view.md (FR-5; docs/ux/specs/initiatives-view.md (e577d08))"
gate: "docs/specs/initiatives-view.md Acceptance, rows I1 to I13 and X0"
ui_review: true
---

## Goal
0104: initiatives as cards, put to sleep and woken from Deltagos, awake
first, memory per initiative and per agent.

## Gate
docs/specs/initiatives-view.md, I1 to I13 and X0.
