# Leftovers 29: a crew list that reads its result, starts only what was asked, closes; dated failures; deaf and capped show their count: the build spec

status: proposed (0125)
by: the FSE, 2026-10-14, on main at 7a55537
sources: sup64's close (`runs/2026-10-14-sup64-leftovers-27.md`; `## UI
review` of `working-on/done/lf27-*.md`), Aglaea's
`docs/ux/specs/launch-progress.md` Amendment 1 (8c1b167, rows L8-L12) and
`tab-reaches-links.md` A3 §2. Polish U2 stays as built (Aglaea: 2 px of air
is the floor). Gate rows follow 0095 and 0108: no row drives Pablo's
desktops, focus or input, none starts a real seat (the probe stub of
leftovers-27 FR-4), and none writes the real clipboard.

## Requirements, card `lf29-crew-list` (frontend, docs)

- **FR-1** (L8, U3) Once no seat of the list is waiting, starting or
  trying again, the heading reads the result: `Crew up · 3 of 3 running`,
  `Crew up · 2 of 3 running, 1 didn't start`, `Stopped · 2 of 3 running, 1
  not started`; the live region says it once.
- **FR-2** (L9, U4) The list holds only the seats this press starts:
  `Bring 1 up` gives `Starting 1 seat · 0 of 1 running`, then `Seat up · 1
  of 1 running`. Seats already running are not listed.
- **FR-3** (L10) A settled list with a failure has `Close the list`, a
  quiet button. It is view-only: it calls `SeenLaunch`, hides the list,
  the failed seats read `off`, `Bring n up` comes back, the Needs me row
  goes; nothing is killed.
- **FR-4** The Crew paragraph of `CLAUDE.md` says each seat starts
  detached and fails alone (no longer "a failing seat stops the rest"),
  and the Navigation paragraph's Needs me list names the task rows of
  leftovers-28 (`forecast:` on accept records, over and stalled).

## Requirements, card `lf29-rows-badges` (frontend), after `lf28-task-rows`

- **FR-5** (L11) The unseen-failure Needs me row is dated with the last
  failure's time and sorts among the dated rows (`lib/queue.ts`).
- **FR-7** (tr-ui U1, leftovers-28 FR-6) An asker who is capped with a
  live watcher is not "not picking up": the ask row uses the health
  table's capped words (`HEALTH.capped`), and "not picking up" only for a
  watcher that is not alive.
- **FR-6** (L12) The deaf and capped badges of a person draw `· n
  waiting`, so the description (lf27 FR-9) and the screen say the same.

## Acceptance → gate

| # | FR | Check | Expected (fails on main) |
|---|---|---|---|
| C1 | 1 | harness on the review build, probe stub, a fixture cell of 3 seats: all succeed; one fails (`PROBE_STUB_FAIL`); Stop starting during the second; read the heading and the live region | the three headings of FR-1; one announcement each |
| C2 | 2 | harness: with two seats running, `Bring 1 up` | one seat listed; `Starting 1 seat · 0 of 1 running`, then `Seat up · 1 of 1 running` |
| C3 | 3 | harness: a failed settled list, Tab to `Close the list`, Return; AX of the crew block and of Needs me; the stub's call log | list gone; failed seats `off`; `Bring n up` present; no Needs me row; no kill call |
| C4 | 4 | `grep -n "fails alone\|stops the rest\|forecast:" CLAUDE.md` | "fails alone" and "forecast:" match, "stops the rest" does not |
| B1 | 5 | vitest of `needsMeRows` with an unseen failure at 12:05 among rows dated 11:00 and 13:00 | dated 12:05, sorted between them |
| B3 | 7 | vitest of an ask row whose asker is capped with an alive watcher, and one whose watcher is stale | the capped words; "not picking up" only for the stale one |
| B2 | 6 | vitest and AX of a deaf and a capped person with 3 waiting | `· 3 waiting` drawn; the description says `3 messages waiting` |
| X0 | all | `XDG_DATA_HOME=$(mktemp -d) make test`, `cd frontend && pnpm run build`, `wails build`, then `git status --porcelain` | pass, empty |

## Boundary

- `lf29-crew-list`: `Crew.tsx`, `styles/launch.css`, their tests; the
  Crew and Navigation paragraphs of `CLAUDE.md`. Not: `lib/queue.ts`, `SlackView.tsx`, Go.
- `lf29-rows-badges`: `lib/queue.ts` (the unseen-failure row and the ask row's words),
  `SlackView.tsx` (the person badge), their tests; in `styles/global.css`
  only `.person*`. Not: `Crew.tsx`, `launch.css`, Go.

## No-gos

- No change to the ring floor (polish U2, as built).
- No real clipboard in a gate row.

## Cards

| Card | Gate rows | Depends on | ui_review |
|---|---|---|---|
| `lf29-crew-list` | C1, C2, C3, C4, X0 | — | true |
| `lf29-rows-badges` | B1, B2, B3, X0 | `lf28-task-rows` (both edit `lib/queue.ts`) | true |
