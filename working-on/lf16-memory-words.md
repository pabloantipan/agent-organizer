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

## UI review
- 2026-10-10 mw-ui, on 7094fef (all rows; the branch did not move). Verdict: **pass**, no sev 4 or 3.
- M1 / FR-4 (I16), checked in WKWebView and vitest: `Deltagos Review` built from 7094fef, own pid, fixture `--memory none` then `fail` then `normal` (the file walked live), init-a > Agents by AXPress. AX names on every `.a-mem`: before the first reading the off seat (fse, no process) `Memory: not running` and the seven running rows `Memory: reading…`; failed, `Memory: could not be read`; read, `Memory < 0.1 GB` with hover "this process tree's footprint". Hover = name on every `—`. No "unknown" on any Agents row or crew seat (`.wt-notes/mw-ui/ax-*-{reading,failed,normal}.txt`; shots `wkwebview-1440x900-M1-reading.png`, `wkwebview-1024x640-M1-failed.png`). Agents rows' own names carry `memory: reading…` / `memory: could not be read`, nothing for an off row. vitest `memoryWords.test.tsx` + `initiatives.test.ts`: 47 pass.
- M2 / FR-5, checked in WKWebView: rail open, window 1440x900 and 1024x640 by AXSize on my own window. Every Memory cell at x 2334 (1440) and x 1904 (1024) on all 8 rows (3 crew seats, 5 agent rows), in both the reading and the read states, wrapped rows (64-88 px tall) included; the figures end on the same right edge in the shots (`wkwebview-{1440x900,1024x640}-M2-{reading,normal}.png`).
- Findings: none at sev 2 or above.
  - W1 (sev 1, words, outside FR-4): with a failed reading the top bar's memory button is still named `memory unknown` while every cell under it says `Memory: could not be read`. Where: top bar, `wkwebview-1024x640-M1-failed.png`, AX `.memory-btn.failed`. Evidence: `ax-1024-failed.txt`. Proposal: one word for the same fact; name the button `Memory: could not be read` (ram-indicator's States table would change with it).
  - W2 (sev 1, consistency, outside the spec): an Agents row's accessible name ends with its memory words (`…, memory: reading…`) but a crew seat's row name does not (`organizer-fixture-probe-ana (po_ana, idle)`). A screen reader landing on a seat hears no memory until it reaches the cell. Evidence: `ax-1440-reading.txt`. Proposal: seat rows use `rowMemoryWords` as agent rows do.
- Spec gaps for the FSE: (1) W1: FR-4 names the cell only; ram-indicator keeps "unknown" for the top bar, so the app has two words for one failed read. (2) Off and reading both show the same `—` with no visible difference; the spec puts the why in the name and hover only, which the build follows.
- For aglaea: none (W1 is a words call the spec can settle).
- Not verified in WKWebView: the hover tooltip drawn (no pointer; the title is read from AX and vitest); an Agents (non-crew) row that has exited (pid 0) is not in the fixture, covered by vitest only; keyboard landing on a row (Q1).
