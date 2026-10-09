# Initiatives: awake and asleep, the build spec

status: proposed (0106)
by: the FSE, 2026-10-09, on main at e577d08
scope: 0104 (ruled A). design: Aglaea's `docs/ux/specs/initiatives-view.md`
(e577d08), acceptance I1-I13. Memory from 0103 (`mem_bytes`,
`Memory.by_initiative`, sup49 building). Gate rows follow 0095.

## Problem

Pablo, 0104: "view where I could handle initiatives as cards, activate
deactivate some. Also, In the left menu, at top, active ones shall be
placed. Also, I need a monitor of how ram is being used by each initiavie,
each agent". Asleep is the factory's (`~/claudecode/scripts/factory/sleep.sh`):
`status: paused` in `initiative.yaml`, written with a comment `sleeping
since <date> (…)` and committed, plus the seats frozen by `seat-freeze`
into `~/.local/state/probe/frozen/<session>/` (a `cwd` file each). Deltagos
already folds a non-active initiative out of Home and Needs me and opens it
read-only (0036, 0042).

## Requirements, card `initiatives-sleep` (Go)

- **FR-1** `Service.Sleep(id)` and `Service.Wake(id)` run `factory sleep
  <id>` and `factory wake <id>` (never `--force`), one at a time (a second
  call while one runs returns busy), capture exit code and output, rescan,
  and return the factory's words verbatim with the state after the rescan.
  Bound as `App.Sleep`, `App.Wake`. Deltagos writes no status itself.
- **FR-2** The scan carries, per initiative: `asleep_since` from the status
  line's comment when it reads `sleeping since YYYY-MM-DD` (yaml.v3 node
  line comment; anything else leaves it empty, never a problem: O1);
  `frozen` sessions, the probe frozen dirs whose `cwd` falls under the root
  and under no deeper root (O2: readable, same rule as `sleep.sh`).
- **FR-3** `Service.Factory()` reports whether `factory` is on PATH and,
  from `factory awake` (parsed `awake|asleep <id> <root>` lines, run on a
  rescan, not on the 10 s tick), which initiative roots the factory sees and
  its limit (`(limit N)`). An initiative Deltagos scans and the factory does
  not is `factory_blind` (camp today, O3). Missing or failing: the reason,
  first error line verbatim.
- **FR-4** Archived is its own state: `status: archived` is neither awake
  nor asleep, and no Sleep or Wake is offered (the factory refuses it).

## Requirements, card `initiatives-view` (frontend), after both

- **FR-5** Aglaea's design as written: the Initiatives view and its top-bar
  button, the head's count, the three sections, the card, Sleep's in-place
  confirm (its lines from `needsMeRows` and the agents feed), Wake refused
  at the limit, the in-progress and failure states, the rail's `Asleep (n)`
  and `Archived (n)` folds, Home's `n asleep` line, the asleep header line,
  and the Memory column on every Agents row with the group total.

## Acceptance → gate

| # | FR | Check | Expected (fails on main) |
|---|---|---|---|
| G1 | 1 | Go test with a fake `factory` on PATH (script in testdata) that sleeps, wakes, refuses a fifth, and fails | the right argv, never `--force`; words verbatim; state after the rescan; a second call while one runs is busy |
| G2 | 2 | Go test: status lines `paused   # sleeping since 2026-10-09 (factory sleep; …)`, `paused`, `active`; frozen dirs under the root, under a deeper root, elsewhere | `asleep_since` 2026-10-09, empty, empty; only the first frozen dir counted |
| G3 | 3, 4 | Go test: fake `factory awake` output missing one scanned root; no factory on PATH; a failing one; an archived initiative | that root `factory_blind`; missing and failing with reasons; archived offers neither |
| G4 | 1-3 | real home: `factory sleep` and `factory wake` of a fixture initiative made for it under `~/pocs` (removed after), through `App.Sleep`/`App.Wake` from a Go test tagged `live` | status written and committed by the factory, Deltagos shows it after the rescan; camp `factory_blind` until the factory looks four deep |
| I1-I13 | 5 | Aglaea's rows, in `make review-build` on the fixture (`scripts/fixture-home.sh` gains a paused, an archived and a factory-blind initiative, and a fake `factory`) and on the real home | as her spec |
| X0 | all | `XDG_DATA_HOME=$(mktemp -d) make test`; `cd frontend && npm run build`; `wails build` | pass |

## Boundary

`initiatives-sleep`: a new `internal/service/sleep.go` and tests, `internal/scan`
(status comment, frozen dirs), `model.Initiative` (three fields), `app.go`
(three bound methods), testdata, `frontend/wailsjs` regenerated. Not: the
factory scripts, `initiative.yaml` writes.

`initiatives-view`: a new `InitiativesView.tsx` and css, the top bar and the
store's `screen`, `Rail.tsx` (the folds), `Home.tsx` (one line),
`InitiativeHeader.tsx` (the asleep line), `AgentsView.tsx`/`AgentList.tsx`
(the Memory column), `lib/` helpers and tests, `scripts/fixture-home.sh`.
Not: Go.

## No-gos

- No `Wake anyway`, never `--force` (0104 A over B).
- No sleeping or waking on another machine.
- Deltagos does not freeze or thaw sessions itself; the factory does.

## Technical notes

- O1 read from the comment, as above. O2 readable. O3 asked of Hephaistos
  (`sleep.sh` finds initiatives at `-maxdepth 3` under ~ only); the design's
  factory-blind state covers it until then. O4 (archived apart) is a fact
  of the factory, not a choice: it refuses to sleep or wake an archived
  one, so the word cannot be shared. 0106 names it anyway.
- Spec check (spec-craft 5b): every row fails on main (no `App.Sleep`, no
  view). G4 needs a throwaway initiative, made and removed by the builder;
  no row needs Pablo.

## Cards

| Card | Gate rows | Depends on | ui_review |
|---|---|---|---|
| `initiatives-sleep` | G1-G4, X0 | — | false |
| `initiatives-view` | I1-I13, X0 | initiatives-sleep, ram-view (top bar, Agents rows) | true |
