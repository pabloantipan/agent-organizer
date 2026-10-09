---
title: "The Initiatives view: cards awake, asleep and archived, Sleep and Wake, the rail's folds, memory on every Agents row"
status: now
repos: [organizer]
branch: initiatives-view
seat: iv-build
stage: one-window
updated: 2026-10-09
next: "iv-build: WKWebView rows of I1-I13 when lodestar unlocks, after ffs-build's S2 run; crew seat rows' Memory waits on sup51 (Crew.tsx outside the boundary)"
depends_on: [initiatives-sleep, ram-view]
boundary: ["new InitiativesView.tsx and css, the top bar and the store's screen", "Rail.tsx (folds), Home.tsx (one line), InitiativeHeader.tsx (asleep line), AgentsView.tsx, AgentList.tsx and Crew.tsx (Memory column)", "frontend/src/lib helpers and tests, scripts/fixture-home.sh", "not: Go"]
spec: "docs/specs/initiatives-view.md (FR-5; docs/ux/specs/initiatives-view.md (e577d08))"
gate: "docs/specs/initiatives-view.md Acceptance, rows I1 to I13 and X0"
ui_review: true
---

## Goal
0104: initiatives as cards, put to sleep and woken from Deltagos, awake
first, memory per initiative and per agent.

## Gate
docs/specs/initiatives-view.md, I1 to I13 and X0.

## Done
- 2026-10-09: view, top-bar button, rail folds, Home line, asleep header, Agents Memory column, fixture and fake factory on `initiatives-view` (f39d0d0); every state run in Chromium at 1024 and 1512 (`.wt-notes/iv-build/flows.log`, `chromium-*.png`); X0 pass from a clean clone (`x0.txt`).

## Notes
- 2026-10-09: supervisor sup51 (window 8385), spawned by the FSE.
- 2026-10-09 iv-build: crew seat rows are drawn by `Crew.tsx` (outside the boundary), so they have no Memory cell yet; asked sup51.
- 2026-10-09 iv-build: the WKWebView rows wait on lodestar's locked screen, and must not overlap ffs-build's S2 (a second Deltagos Review in front spoils its frontmost-app log).
- 2026-10-09 iv-build: CardDrawer and Conversation still say `paused: read-only` (`readOnlyOf` in `lib/queue.ts`, outside the boundary).
- 2026-10-09 iv-build: at 1024 the top bar wrapped on Initiatives and Usage once the button was added; the idle machines line now folds into the brand's hover at compact (for Aglaea's look).
- 2026-10-09 the FSE: boundary widened by Crew.tsx (Memory column on crew seat rows only), spec Amendment 2 (0108).
