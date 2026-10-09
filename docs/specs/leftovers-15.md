# Leftovers 15: names, the Initiatives view's polish, the Help mark's motion, and the build's drift: the build spec

status: proposed (0111)
by: the FSE, 2026-10-09, on main at 356dcae
sources: today's reviews (cards in `working-on/done/`: ram-view, initiatives-view,
deltagos-mark, app-icon-composer), Aglaea's floating-icon Amendment 7 (8c6249d),
the FSE's install notes. Gate rows follow 0095 and 0108: no row drives
Pablo's desktops or input; screen checks only in the review app's own
window, else logs, renders, vitest or headless runs.

## Requirements, card `lf15-names-and-notices` (Go + frontend)

- **FR-1** A session is named one way everywhere (the memory popover, its
  `Agents ›` landing, `organizer memory`, the warning's body): its session
  name, else its card's seat, else `<initiative> session` with the pid in the
  hover. Never a resume UUID, never a bare `pid N` (ram-view U4, U5; the
  warning tonight read "1030fdd4-… 0.9 GB, pid 1636 0.7 GB").
- **FR-2** Only the installed bundle (`cl.antipan.organizer`) posts system
  notifications; a review build or a fixture run logs the warning and posts
  nothing ("Memory critical on fixture" reached Pablo at 16:50).
- **FR-3** The popover's "Reading memory…" state is reachable in the
  fixture (`--memory none`), so a reviewer can see it.

## Requirements, card `lf15-initiatives-polish` (frontend)

initiatives-view's UI review U1-U6 and code review 3, 4, 5's FloatList note:
- **FR-4** The Agents Memory cell sits in a fixed, right-aligned track, so
  figures line up row under row (U1).
- **FR-5** With memory unread, the row's accessible name says `memory
  unknown`, not a number, and the group head reads `Memory —` (U2).
- **FR-6** `Initiatives ›` on Home and the rail lands focus on the view's
  title (U3).
- **FR-7** `asleep since today` on the day (U4); `1 decision … leaves`
  (U5); the rail's fold chevrons are named `Expand Asleep`, `Collapse
  Archived` (U6).
- **FR-8** The Asleep head's limit line links only initiatives that have a
  Sleep; a factory-blind one is named without a link (CR 3).
- **FR-9** Sleeping the last awake initiative confirms with `Home will be
  empty until one wakes.` even with nothing live or waiting (CR 4).
- **FR-10** FloatList's group label says `Asleep (n)`, not `Not active (n)`.

## Requirements, card `lf15-help-mark` (frontend)

- **FR-11** Aglaea's Amendment 7: the Help header's mark moves 4.5 s after
  Help opens, then stops where it is; hovering plays 4.5 s more; never over
  5 s unasked; still under Reduce motion. In the lockup the mark is
  `aria-hidden` with no role or label; the wordmark is the name (F25, F26).

## Requirements, card `lf15-build-drift` (tooling)

- **FR-12** `make install` and `make build` leave the tree clean:
  `frontend/wailsjs/runtime/` is not rewritten (the wails CLI and go.mod's
  wails version agree, or the step is pinned), observed twice today.
- **FR-13** `.github/workflows/release.yml`'s Test step passes on a clean
  checkout (`frontend/dist` built first or embedded as the app expects).
- **FR-14** The factory call: `factory awake` runs only on a rescan, never on
  the 10 s tick (a test proves it); a factory call times out after 20 s and
  releases the busy lock, saying so.

## Requirements, card `lf15-ring-breath` (native)

- **FR-15** Aglaea's ram-indicator Amendment 2 as amended (56f0244): at
  critical the amber ring breathes in width, not opacity: full opacity,
  3 to 4.5 px and back over 1.6 s, the 1 px ground keyline following its
  outer edge at full opacity; a steady 3 px under Reduce motion (A1: at half
  opacity amber on white all but vanished).

## Acceptance → gate

| # | FR | Check | Expected (fails on main) |
|---|---|---|---|
| N1 | 1 | Go test over agents with a name, a seat only, neither; `organizer memory` and the warning body on the fixture | one name each, the same in all four places; no UUID, no bare pid |
| N2 | 2 | review build with `ORGANIZER_MEMORY_FAKE=critical` on the fixture: its log, and the notification center's database for the review bundle id | warning logged, nothing posted |
| N3 | 3 | fixture `--memory none`, popover in the review build (seat-pointer --pid while idle) or vitest of the state | `Reading memory…` |
| P1-P7 | 4-10 | vitest for each helper; the review build on the fixture for U1 (cell x equal on every row, logged) and U3 (AX focus on the title) | as each FR |
| H1 | 11 | vitest with fake timers; a headless check that the animation stops at 4.5 s; AX tree of the lockup | stops, replays on hover, never under Reduce motion; one name |
| B1 | 12 | `git status --porcelain` after `make install` on a clean tree | empty |
| B2 | 13 | the workflow's steps run locally from a clean clone (`act` or the steps by hand) | Test passes |
| B3 | 14 | Go test: the tick path with a fake factory that records calls; a fake factory that sleeps 60 s | zero calls on ticks; timeout at 20 s, lock released, message |
| R1 | 15 | review build, `ORGANIZER_MEMORY_FAKE=critical`, the icon window shot (`screencapture -l`) at the trough and the peak, composited over white and over the dark ground (no wallpaper changed) | full-opacity amber with its keyline in both frames, 3 and 4.5 px; Reduce motion: steady 3 px |
| X0 | all | `XDG_DATA_HOME=$(mktemp -d) make test`, `cd frontend && npm run build`, `wails build` | pass |

## Boundary

`lf15-names-and-notices`: `internal/service` (the name), `internal/cli`
(memory output), `app.go`/notify (bundle check), the memory popover and its
lib helper, `scripts/fixture-home.sh` (`--memory none`).
`lf15-initiatives-polish`: `InitiativesView.tsx` and css, `AgentList.tsx`,
`Crew.tsx`, `Rail.tsx`, `Home.tsx`, `FloatList.tsx`, lib helpers and tests.
`lf15-help-mark`: `DeltagosMark.tsx` and css, `HelpView.tsx`.
`lf15-build-drift`: `Makefile`, `.github/workflows/release.yml`,
`internal/service/sleep.go` and its tests, `wails.json`/`go.mod` if the
version pin needs it. Not: the floating icon's native code.
`lf15-ring-breath`: `floaticon_darwin.m` (the ring layer's animation only).

## Not in this batch

Aglaea's open answers (initiatives-view A1-A3) wait for her; the factory's depth (camp invisible)
is Hephaistos's.

## Cards

| Card | Gate rows | Depends on | ui_review |
|---|---|---|---|
| `lf15-names-and-notices` | N1-N3, X0 | — | false |
| `lf15-initiatives-polish` | P1-P7, X0 | — | true |
| `lf15-help-mark` | H1, X0 | — | false |
| `lf15-build-drift` | B1-B3, X0 | — | false |
| `lf15-ring-breath` | R1, X0 | — | true |
