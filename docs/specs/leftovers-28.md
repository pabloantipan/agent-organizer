# Leftovers 28: a task over its forecast, a stalled task and an unanswered ask reach Needs me: the build spec

status: proposed (0124)
by: the FSE, 2026-10-14, on main at 089a90d
source: agent-slack record 0014 (`~/agent-slack/working-on/decisions/0014-stalls-and-asks-reach-pablo.md`),
ruled by Pablo 2026-10-14, "go ahead as you recommended", option C with its
thresholds; relayed by Hephaistos (thread 01M4GTXEHBBVMB3W8945PNN6GV), who
asked the organizer FSE to card the Deltagos half. The supervisor's
band-top post is already live (supervise §5, claudecode c1f12a2). Gate rows
follow 0095 and 0108: no row drives Pablo's desktops, focus or input.

## Requirements, card `lf28-task-watch` (Go)

- **FR-1** An accept record carries `forecast:` in its frontmatter, the
  band with its unit: `40-90m`, `1.5-3h`, `70-110m` (`model.Decision.Forecast`,
  string as written, plus `forecast_top` in minutes parsed from it). A
  value that does not parse is one scanner problem on that record, never a
  failed scan. Records without the field (all before 0124) get no task
  rows. The body's `forecast:` prose line stays as it is and is not read.
- **FR-2** A **task** is a ruled record with a `forecast:` and `cards:` of
  which at least one is not in `done/`. Its `started` is the time of the
  commit that ruled it (`git log` on the record, the commit where `status:
  ruled` first appears; the app's own ruling commit). Its seats are the
  `seat:` values of its cards plus, for each, the session named in
  `~/.local/state/probe/<project>-probe-<seat>.parent` (the supervisor).
- **FR-3** Per task, from the health snapshot the agents feed already
  reads: `quiet_minutes`, the smallest `quiet_seconds` over the live
  threads whose participants include a seat of the task, and the last
  message of the supervisor's latest thread to the FSE (subject and first
  line, fetched with `Client.Thread`, cached like `openers`). The task
  rides the agents feed (`AgentGroup.tasks`: record number, title,
  forecast, `forecast_top`, `started`, cards with status, seats,
  `quiet_minutes`, `last_post`).
- **FR-4** State, computed in one function and tested: `over` once elapsed
  passes `forecast_top`; `stalled` once elapsed passes 2 × `forecast_top`,
  or `quiet_minutes` ≥ 45 while any card of the task is `now`; else `on`.
  Stalled wins over over.

## Requirements, card `lf28-task-rows` (frontend), after `lf28-task-watch`

- **FR-5** `needsMeRows` adds one row per task that is `over` or
  `stalled`, in the existing anatomy, dated by `started`, verb **Agents**
  (opens the initiative's Agents): `<title>: over its forecast, 2 h 10 m
  of 70-110 min` or `<title>: stalled, no post for 52 min` (or `…, 3 h 50
  m, twice its forecast`); the second line quotes `last_post` when there
  is one (`sup64: <subject>: <first line>`). A task that is `on` has no
  row. One row per task, never one per card.
- **FR-6** Asks to the human (`queueOf`'s `AskedOfMe` threads) are already
  rows from the first minute in every awake initiative with a cell, which
  meets 0014's "open for 30 min becomes a row" (the FSE's reading: earlier
  is not later). What changes: the row names the asking seat and, when
  its watcher is not `alive`, says `<seat> is not picking up` with the
  health table's words (`lib/health.ts`), since the answer would not wake
  it (0014, hestia). Rows stay oldest first and open their thread.

## Acceptance → gate

| # | FR | Check | Expected (fails on main) |
|---|---|---|---|
| T1 | 1 | Go test of the scan over records with `forecast: 40-90m`, `1.5-3h`, `soon`, and none | tops 90 and 180; one problem for `soon`; none for the record without |
| T2 | 2 | Go test on a temp git repo: raise, rule (commit), then cards in now and done | `started` = the ruling commit's time; a record whose cards are all done is no task |
| T3 | 3 | Go test with a fake health payload: three threads, two with a task seat, quiet 600 s and 3000 s; a `.parent` file naming sup9; a fake `Thread` with the supervisor's last post | `quiet_minutes` 10; seats include sup9; `last_post` its subject and first line |
| T4 | 4 | Go test, fake clock: band 40-90m; elapsed 60, 100, 200 min; quiet 50 min with a card now; quiet 50 min with all cards next | on, over, stalled, stalled, over-or-on by elapsed only |
| R1 | 5 | vitest of `needsMeRows` with tasks on, over and stalled, with and without `last_post` | rows only for over and stalled, the words of FR-5, verb Agents, one per task |
| R2 | 5 | review build on a fixture with an accept record carrying `forecast: 1-2m` ruled 10 min back and a card in now (fixture-home, overlay record), AX of Needs me | a stalled row with FR-5's words; Agents opens the initiative's Agents |
| R3 | 6 | vitest: an asks-you thread whose asker is stale, and one alive | the stale one says the seat is not picking up in `HEALTH`'s words; the alive one does not |
| X0 | all | `XDG_DATA_HOME=$(mktemp -d) make test`, `cd frontend && pnpm run build`, `wails build`, then `git status --porcelain` | pass, empty |

## Boundary

- `lf28-task-watch`: `internal/model/decision.go`, `internal/scan`
  (records and the ruling commit), `internal/service` (tasks on the feed,
  a new `tasks.go`), `internal/discuss` only if a field is missing, their
  tests; `testdata/fixture-overlay/` (one record with a forecast);
  `frontend/wailsjs` regenerated. Not: components, stylesheets.
- `lf28-task-rows`: `lib/queue.ts` and its test, `Home.tsx` only for the
  rows' second line if the anatomy lacks one, the shell's Needs me styles
  only for that line; `scripts/fixture-home.sh` for R2's record. Not: Go.

## No-gos

- No notification, sound or badge beyond Needs me's count.
- No row for a task without `forecast:`; no forecast inferred.
- No restart of a deaf seat from the app (the factory's `factory check`
  and `probe -r`, 0014's factory half).

## Technical notes

- The `forecast:` field changes the decision record format: the
  working-on skill's Decisions section is Hephaistos's; told 2026-10-14.
  From 0124 on the FSE writes it.
- `started` is the ruling, not the supervisor's start: the FSE launches
  within minutes of the ruling, and Pablo reads it as "since I accepted".

## Cards

| Card | Gate rows | Depends on | ui_review |
|---|---|---|---|
| `lf28-task-watch` | T1, T2, T3, T4, X0 | `lf27-launch-state` (both edit the agents feed) | false |
| `lf28-task-rows` | R1, R2, R3, X0 | `lf28-task-watch`, `lf27-launch-view` (both edit `lib/queue.ts`) | true |
