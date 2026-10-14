# Leftovers 33: a seat the press found running can be attached at once, a closed confirm says why, a repeat waits 100 ms: the build spec

status: proposed (0129)
by: the FSE, 2026-10-14, on main at d989ac2
sources: lf32-newest-answer's UI review (`working-on/done/lf32-newest-answer.md`,
`## UI review`, U1, U2, A1), answered by Aglaea in
`docs/ux/specs/launch-progress.md` Amendment 6 (469a605, L23-L25) and the
reworded design-system rule. Gate rows follow 0095 and 0108: no row drives
Pablo's desktops, focus or input, starts a real seat, or writes the real
clipboard.

## Requirements, card `lf33-press-running` (Go and frontend)

- **FR-1** (L23, Go) `App.CreateCrew` returns what the press did, not only
  launch lines: a bound struct with `lines` (as today), and `running`, one
  entry per seat it skipped because it already runs, with `seat` and
  `session` (`crewSession`, the one namer; no new call: `StartCrew`'s
  `Skipped` already holds the seats). The CLI's crew line is unchanged.
  `frontend/wailsjs` regenerated; `useWails.ts`'s `createCrew` types follow.
- **FR-2** (L23, view) After the race (leftovers-32 FR-1), a seat the press
  reports running reads `running`, never `idle`, and draws `Attach` on its
  session at once, before the next feed; the focus chain counts it. A seat
  the result does not name keeps `running` with `—` and is skipped by the
  chain until the feed (never `starting…`).
- **FR-3** (L24) When a feed closes the confirm because nothing is off
  (leftovers-32 FR-3), the live region says `Every seat is already running`
  (`ALL_RUNNING`) before focus lands on `Attach`.
- **FR-4** (L25) The live-region helper (`lib/liveRegion.ts`, `speaker`)
  empties, then sets the text again 100 ms later in a later task
  (`setTimeout`, never `requestAnimationFrame`).

## Acceptance → gate

| # | FR | Check | Expected (fails on main) |
|---|---|---|---|
| P1 | 1 | Go test: a crew of three with two running (`liveSeats` faked), `App.CreateCrew` or the service method it calls; `organizer crew <fixture> --print` | `running` names the two with `crewSession`'s names, `lines` the third's; CLI output unchanged from main |
| P2 | 2 | Tab harness at 1024×640 with the probe stub: leftovers-32's N1 race (stale feed showing fse off, press Start); read the fse row and `document.activeElement` before the next `applyAgents` | the row reads `running` and has `Attach fse`; focus on the first seat's `Attach` in drawn order, which may be fse |
| P3 | 3 | Tab harness: leftovers-32's N3 (confirm open, focus on Start, `applyAgents` with the seat live); the live region's text over time | `Every seat is already running` said, then focus on `Attach` |
| P4 | 4 | vitest of the helper with a fake clock: say `a`, say `a` again; read at 0, 50, 100 ms | empty at 0 and 50 ms, `a` at 100 ms; no `requestAnimationFrame` |
| X0 | all | `XDG_DATA_HOME=$(mktemp -d) make test`, `cd frontend && pnpm run build`, `wails build`, then `git status --porcelain` | pass, empty |

## Boundary

- `lf33-press-running`: `app.go` (`CreateCrew` and its result type),
  `internal/service/crew.go` (the result's running seats, its test),
  `frontend/wailsjs` regenerated, `hooks/useWails.ts` (`createCrew` only),
  `Crew.tsx`, `lib/liveRegion.ts` and their tests. Not: `internal/cli`
  beyond keeping its output, `lib/queue.ts`, stylesheets.

## No-gos

- No new service call or feed field: the press's own result carries it.
- No VoiceOver gate row (Amendment 6: a finding for whoever has a screen).

## Cards

| Card | Gate rows | Depends on | ui_review |
|---|---|---|---|
| `lf33-press-running` | P1, P2, P3, P4, X0 | — | true |
