---
title: "An empty Memory cell has three words, and stays on its track"
status: now
repos: [organizer]
branch: lf16-memory-words
seat: mw-build
stage: one-window
updated: 2026-10-10
next: "review: lf16-memory-words, gate met (M1, M2, X0), 7094fef"
depends_on: [lf15-names-and-notices]
boundary: ["lib/initiatives.ts (Memory cell helpers)", "AgentList.tsx", "Crew.tsx", "their css and tests"]
spec: "docs/specs/leftovers-16.md (FR-4, FR-5; docs/ux/specs/initiatives-view.md Amendment 1, I16)"
gate: "docs/specs/leftovers-16.md Acceptance, rows M1, M2 and X0"
ui_review: true
---

## Goal
lf15-initiatives-polish V4 and FR-4's widths (Aglaea, b3295f2).

## Gate
docs/specs/leftovers-16.md, rows M1, M2 and X0.

- [x] M1: vitest `frontend/src/lib/memoryWords.test.tsx` (Agents row and crew seats, no reading / failed / reading; no "unknown") — `.wt-notes/mw-build/progress.md`
- [x] M2: review build, AX frames on my own pid: x 2334 on all 8 rows at 1440×900, 1904 at 1024×640, rail open, wrapped rows included — `.wt-notes/mw-build/m2-memory-x.log`
- [x] X0: clean clone at 7094fef, make test, npm run build, wails build exit 0 — `.wt-notes/mw-build/x0.txt`

## Done
- 2026-10-10 mw-build: an empty Memory cell is named `Memory: not running`, `Memory: could not be read` or `Memory: reading…`, never "unknown" (7094fef); FR-5's track already held from lf15, measured on this branch.

## Notes
- The top bar's memory button still reads `memory unknown` on a failed read (`lib/memory.ts`, outside this card); ram-indicator's States table names it so.
