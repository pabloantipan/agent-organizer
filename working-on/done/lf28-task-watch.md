---
title: "Deltagos knows each task's forecast, start and silence"
status: done
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
review: pass
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

## Review
Pass: rows T1, T2, T3, T4 and X0 met at 5e258219d68528f9e78fd221da513bde9a1379bd.
- T1: `TestReadDecisionsForecast` (40-90m, 1.5-3h, soon, none: tops 90 and 180, one problem on `soon` only, none for the record without) and `TestForecastTopMinutes`, both pass; read `ForecastTopMinutes` and `readDecisions` in the diff.
- T2: `TestRulingCommitTime` on a temp git repo (raise 09:00, rule 10:30, cards now and done plus a later edit 11:00) gives `RuledAt` 10:30Z, empty without git; `TestTasksOpenCards` maps it to `started` and drops a record whose cards are all done. Pass. The row is met by the two tests together; the all-done half runs on scan output built in Go, not on the git repo.
- T3: `TestTasksOnTheFeed`: canned health with three threads (60 s with no task seat, 3000 s with tw-build, 600 s with sup9), `.parent` naming organizer-probe-sup9, fake `fetchThread`: `quiet_minutes` 10, seats include sup9, `last_post` subject `leftovers-28`, line `band top: tw-build at 70%`, no refetch on the second sample. Pass.
- T4: `TestTaskState`, band 40-90m: 60 on, 100 over, 200 stalled, quiet 50 with a card now stalled, quiet 50 with all next on/over by elapsed. Pass.
- X0: a fresh clone at the SHA, `CI=true pnpm install --frozen-lockfile`, then `XDG_DATA_HOME=$(mktemp -d) test-lease run --share -- make test` (every Go package ok, 650 vitest), `pnpm run build`, `wails build`, all exit 0; `git status --porcelain` empty. Logs in `.wt-notes/tw-review/`.
- Unmet rows: none.
- Shared test run: fresh, id 34135d72-77809.
- Reviewer tw-review, 2026-10-14, commit 5e258219d68528f9e78fd221da513bde9a1379bd.
