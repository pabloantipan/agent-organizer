---
title: "Deltagos knows each task's forecast, start and silence"
status: now
repos: [organizer]
branch: lf28-task-watch
seat: tw-build
stage: one-window
updated: 2026-10-14
next: "review: lf28-task-watch, gate met (T1 T2 T3 T4 X0), 5e25821"
depends_on: [lf27-launch-state]
boundary: ["docs/specs/leftovers-28.md Boundary, lf28-task-watch"]
spec: "docs/specs/leftovers-28.md (FR-1 to FR-4)"
gate: "docs/specs/leftovers-28.md Acceptance, rows T1, T2, T3, T4 and X0"
ui_review: false
---

## Goal
Deltagos knows each task's forecast, start and silence (agent-slack 0014, ruled 2026-10-14).

## Gate
docs/specs/leftovers-28.md, rows T1, T2, T3, T4 and X0.
- [x] T1: /Users/pabloantipan/organizer/.wt-notes/tw-build/t1.log
- [x] T2: /Users/pabloantipan/organizer/.wt-notes/tw-build/t2.log
- [x] T3: /Users/pabloantipan/organizer/.wt-notes/tw-build/t3.log
- [x] T4: /Users/pabloantipan/organizer/.wt-notes/tw-build/t4.log
- [x] X0: /Users/pabloantipan/organizer/.wt-notes/tw-build/x0-make-test.log, x0-pnpm.log, x0-wails.log, x0-status.txt (empty)

## Done
- tw-build: forecast and ruling time in the scan, tasks on the agents feed with state, overlay record 0011 + w-task; branch lf28-task-watch at 5e25821 (2c2a6c6, ca861d5, 5e25821), unmerged, rebased on main; notes and the tasks JSON shape in /Users/pabloantipan/organizer/.wt-notes/tw-build/progress.md

## Notes
- No ruling commit (no git) gives a task with started null and state on.
- R2 "ruled 10 min back": the overlay alone dates 0011 at fixture time (stalled after 4 min); fixture-home.sh must commit it in its own commit with GIT_COMMITTER_DATE 10 min back (lf28-task-rows, progress.md says how).
- CLI golden files did not move.
