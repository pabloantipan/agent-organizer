---
title: "The Initiatives view's and Agents' polish from its reviews"
status: now
repos: [organizer]
branch: lf15-initiatives-polish
seat: lp-build
stage: one-window
updated: 2026-10-09
next: "review: lf15-initiatives-polish, gate met (P1-P7 on the review build, X0), 8545263"
review: pass
depends_on: []
boundary: ["the spec's Boundary for this card"]
spec: "docs/specs/leftovers-15.md (FR-4 to FR-10)"
gate: "docs/specs/leftovers-15.md Acceptance, rows P1 to P7 and X0"
ui_review: true
---

## Goal
Leftovers from 2026-10-09's reviews (0111).

## Gate
docs/specs/leftovers-15.md, P1 to P7 and X0. Evidence in `.wt-notes/lp-build/` (`progress.md` says how to reach each state on the fixture).
- [x] P1-P7 (FR-4 to FR-10): vitest per helper, `p-rows.log` (P2 `rowMemoryWords`/`groupMemory`, P3 `landingOf`/`landing.test.ts`, P4 since today/leaves/fold names, P5 `limitNames`, P6 `confirmLines` last awake, P7 `inactiveLabel`, P1 `memoryTrack.test.tsx`); review build at 8545263 on the fixture, my own `Deltagos Review` (pid saved, quit by it), AXPress on that pid only, AX reads: U1 `u1-memory-x.log` (every `.a-mem` x at 2334 at 1440×900 rail open, 1904 at 1024×640, wrapped rows and crew seats included; `ax-agents-1440.txt`, `ax-agents-1024.txt`, `wk-1440x900-P1-agents-init-a.png`, `wk-1024x640-P1-agents-init-a.png`); U3 `u3-focus.log` (`AXFocused` = heading `Initiatives` after Home's and after the rail's `Initiatives ›`, nothing focused before).
- [x] X0: `x0.txt`, clean clone at 8545263: `XDG_DATA_HOME=$(mktemp -d) make test` exit 0 (440 vitest), `cd frontend && npm run build` exit 0, `wails build` exit 0.

## Done
- 2026-10-09 lp-build: f9711b7 (lib words + vitest), a20dcbb (Memory cell last on the row, a fixed 64 px right-aligned track; row name `memory unknown`), cdfdaf8 (title landing, limit links only with a Sleep, chevron names, `Asleep (n)`), ee56253 (U1/U3 tests); rebased on main at 2de137c, unmerged.
- 2026-10-09 lp-build, after lp-ui's V1: 8545263 makes the actions and the Memory cell one tail pushed to the row's right edge on any line (no `.a-actions + .a-mem` override), and gives the other agent rows the crew block's 11 px inset so both lists share one track (V2 too). P1 and P3 measured on my own review build by AXPress and AX reads; rebased on main at e5029a2 (branch head 8545263 after the rebase; commits renamed 2329439, e63fdc2, cc4b00a, a7949d6), unmerged.

## Notes
- U1 and U3 were first proved by vitest only (sup52's instruction, beyond the gate); lp-review failed P1 and P3 for it, and lp-ui's V1 found the wrap. Both are now read on the review build (Gate). The launch waited for 60 s of Pablo's idle, since a launch can take focus; no seat-pointer, keys or clicks were used (seat-pointer refused earlier: a point outside the window, then the Dock covering).
- The Memory cell now comes after the actions in the DOM, so a row's reading order puts the figure after the buttons; the row's accessible name carries it first.
- FloatList's fold also holds archived initiatives, so `Asleep (n)` counts them (FR-10 as written).
- The fixture writes init-asleep's since date as 7 days ago; to see `asleep since today`, edit that date in the copy and Rescan.

## UI review
lp-ui, 2026-10-09, on 8545263546318dc3d650e36318a4396f1a4dd834 (re-review after the branch moved; every row re-checked on this commit): **pass**, sev 4/3: none. The fail at ee56253 (V1) is superseded.

How it was checked: a fresh detached worktree at 8545263, `npm install`, vitest 440/440, `test-lease run -- make review-build`, my own `Deltagos Review` on a fresh `fixture-home.sh --memory normal` (launched after 60 s of Pablo idle, pid saved, quit by it). The window was 1440×900; 1024×640 was set through my own window's AX size. Every press was an AXPress on my pid and every reading an AX dump (`AXFocused`, frames). No seat-pointer, pointer, keys, Space or focus change on Pablo's desktop. Shots and dumps are in `.wt-notes/lp-ui/` (`wk-<w>x<h>-<row>-<state>.png`, `ax-*.txt`, `u1-memory-x.log`, the reader `ax.swift`); round 1 (ee56253) is in `.wt-notes/lp-ui/r1/`.

| Row | FR | State, how | Result |
|---|---|---|---|
| P1 | 4 | init-a › Agents, rail open, AX x of each `.a-mem`, at 1440×900 and 1024×640 | pass: all 8 cells (3 crew seats, 5 agents) at x 2334 (1440) and 1904 (1024), including the rows that wrap (build-help at 1440, aglaea and build-help at 1024); one column for crew and agents (`u1-memory-x.log`, `wk-*-P1-agents-normal.png`) |
| P2 | 5 | `echo fail` to the memory file, 15 s, AX | pass: every running row's name ends `memory unknown`; the summary reads `Memory —` (`wk-1440x900-P2-agents-memfail.png`) |
| P3 | 6 | AXPress on Home's `Initiatives ›`, then on the rail's Asleep `Initiatives ›` | pass: `AXFocused` = AXHeading `Initiatives` both times; before each press, the web area or nothing had focus |
| P4 | 7 | init-asleep dated today in the copy; Sleep init-b, then Cancel; rail AX | pass: `asleep since today`; `1 decision waiting on you leaves Needs me until it wakes.`; chevrons `Expand Roles`, `Collapse Asleep`, `Collapse Archived` |
| P5 | 8 | factory limit 10, ten awake | pass: init-blind is a plain span; the nine others are `<id>: go to its Sleep` buttons |
| P6 | 9 | all but init-c paused in the fixture copy, Rescan, Sleep init-c (nothing live or waiting), then Cancel | pass: the confirm holds only `Home will be empty until one wakes.` |
| P7 | 10 | not reached (the list opens from the native icon) | by code and `floatList.test.ts` only; FloatList is unchanged since ee56253 |

Earlier findings:
- **V1 (3) fixed** in 8545263: the actions and Memory are one `.a-tail` pushed to the right edge, so a wrapped row keeps the cell on the track (P1 above).
- **V2 (1) fixed**: the agent rows take the crew block's 11 px inset, so crew and agents share x 2334.
- **V3 (2) open, not a fail**: FloatList's `Asleep (n)` also counts archived initiatives (FR-10 as written), so on the fixture it would read `Asleep (2)` beside the rail's `Asleep (1)` and `Archived (1)`. That calls an archived initiative asleep, where Wake does not apply. Proposal: count asleep ones only and give archived its own fold, or name the fold for both.
- **V4 (1) open, not a fail**: a crew seat that is off has a Memory cell named `Memory unknown, not running`. "Unknown" says the reading failed, when nothing runs. The row name is already right (FR-5). Proposal: name the cell `not running`.

Spec gaps (for the FSE): FR-10 says `Asleep (n)` for a group that also holds archived ones (V3). FR-4 names no window width or rail state for "row under row"; P1 needed 1440 with the rail open and 1024 to show the wrap.

For aglaea: none new (A1-A3 of initiatives-view are still open).

Not verified in WKWebView: P7 (FloatList's label); the visible focus ring on the title (`:focus-visible` read from the CSS, since AXPress is not a keyboard landing); Home's `Wake one in Initiatives ›` in the none-awake state (the same `openInitiatives("title")` call); keyboard Tab order.

## Review
**Pass**, at 8545263546318dc3d650e36318a4396f1a4dd834 (re-review; the fail at ee56253 on P1 and P3 is superseded).

- X0: met. Fresh clone at 8545263 under `.wt-notes/lp-review/clean`: `XDG_DATA_HOME=$(mktemp -d) test-lease run -- make test` exit 0 (29 files, 440 vitest), `npm install && npm run build` exit 0, `wails build` exit 0 (logs `.wt-notes/lp-review/x0-*.log`).
- P1 (FR-4, U1): met. 8545263 makes the actions and the cell one `.a-tail`, `margin-left: auto`, `justify-content: flex-end`, and drops the `margin-left: 0` override that caused V1; the agent rows get 21 px of right padding so they match the crew block's inset. Review build evidence, read from the builder's AX dumps: `ax-agents-1440.txt` and `ax-agents-1024.txt` hold 8 `.a-mem` frames for 8 rows (3 crew seats, 5 agents), every one at x 2334 (1440×900) and 1904 (1024×640), wrapped rows (taller pitch) included; it matches `u1-memory-x.log`. `wk-1024x640-P1-agents-init-a.png` shows one column, crew and agents.
- P2 (FR-5): met. `rowMemoryWords` gives `memory unknown`, `groupMemory` gives `Memory —` (diff plus vitest; lp-ui saw both on its build).
- P3 (FR-6, U3): met. `u3-focus.log`: AXPress on Home's `.home-asleep-link` and on the rail's `.rail-fold-link` (the builder's own pid), and `AXFocused` = AXHeading `Initiatives` both times, nothing focused before. The diff has `openInitiatives("title")`, the `h1` with tabIndex -1, and `applyLanding`.
- P4 (FR-7): met. `sinceLine` gives `today`, `leaves` matches a total of 1, `foldName` names all four chevrons (diff plus vitest; lp-ui saw them on its build).
- P5 (FR-8): met. `limitNames` links only `canAct` (diff plus vitest; lp-ui saw init-blind as a plain span).
- P6 (FR-9): met. `confirmLines` always adds the empty-Home line when last awake.
- P7 (FR-10): met. `inactiveLabel` gives `Asleep (n)` in FloatList (diff plus `floatList.test.ts`; the gate asks vitest here).
- Not covered by the gate: `Asleep (n)` counts archived ones too (lp-ui V3); `groupMemory` shows `Memory —` on groups with nothing running before the first reading; a crew seat that is off has a Memory cell named `Memory unknown, not running` (lp-ui V4).
- Status left at `now` and the card left in place: `## UI review` still reads fail (on ee56253).
- Unmet: none.
- Reviewer lp-review, 2026-10-09, commit 8545263546318dc3d650e36318a4396f1a4dd834.
