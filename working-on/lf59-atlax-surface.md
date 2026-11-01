---
title: "Deltagos's atlax slice names every Wails method and CLI command"
status: now
repos: [organizer]
branch: lf59-atlax-surface
seat: l59-surface
stage:
updated: 2026-11-01
next: "l59-surface builds FR-7 to FR-9 on lf59-atlax-surface (sup102 launched 2026-11-01 18:55)"
depends_on: [lf59-atlax-record]
boundary: ["atlax/"]
spec: "docs/specs/atlax-seed.md (Amendment 4, FR-7 to FR-9)"
gate: "docs/specs/atlax-seed.md#Acceptance → gate"
ui_review: false
autonomy: unattended
touches: []
change_order:
  adds: []
  modifies: []
  retires: []
---

## Goal
The factory model shows everything Deltagos offers its window and its CLI, and atlax tells the FSE when one of its promises breaks.

## Gate
docs/specs/atlax-seed.md Amendment 4: S1, S2 (every derived element has exactly one file), S4 and S5 with --card, X0.

## Pre-answered
- Base: origin/main at the card's start, with lf59-atlax-record merged.
- Merge target: `main` through talos-lab's PR.
- Tool: `atlax` at claudecode 3d7aea5 or later (a worktree at origin/main, never ~/claudecode's working tree); contracts at specs 230a515 or later.
- `touches:` and `change_order.adds` are filled by the builder with exactly the elements it authors (FR-8); the rest are unauthored files and need no change order.
- Tests: none written; an authored element names an existing test that reads a contract sample.
- Short-sample fallback: an element whose test or sample is missing stays unauthored, with the reason in the card's Notes.
- Data shape across states: element files per `contracts/atlax/element.schema.json` at the specs pin.
- Evidence: `atlax derive --json` and `atlax verify --card --json` under `.wt-notes/<seat>/`.
- Never `atlax publish` or `atlax check` from the card.
- Retention: n/a.
