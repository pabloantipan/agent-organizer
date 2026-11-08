# Leftovers 75: stop the fixture's stand-in agents before their dir goes: the build spec

status: accepted (0188, ruled 2026-11-08)
by: the FSE, 2026-11-08, on main at 65a8d51
sources: Hephaistos, for pablo, 2026-11-08 (thread 01M6WS9517RWK989TP9P0VW9Q3):
card reparented-stand-ins-stop (agent-slack chore/cards-2026-11-08a), R2:
safe-kill gains `--pidfile`, which stops only pids listed in a pidfile under
a tmp dir the caller owns, each only if its executable lives inside that
dir; "please card a fixture-home.sh stop that runs safe-kill --pidfile
$tmp/agents.pid BEFORE the tmp dir is removed". Four sightings of stand-ins
outliving review apps (bitácora, 2026-11-01 and 2026-11-02); today 24 from
two removed dirs still ran under launchd.

## Premises (read 2026-11-08 at 65a8d51)

| Premise | Shown by |
|---|---|
| the launcher builds its stand-in agent into `$tmp/bin/organizer-fixture-agent`, starts the stand-ins from it (they sleep 6 h), and writes their pids to `$tmp/agents.pid` | `scripts/fixture-home.sh:301-304` (tmp, bin), `:335`, `:359`, `:713` (agents.pid), `:77`, `:101` (`kill $FIXTURE_AGENT_PIDS`) |
| the launcher has no stop: its usage says `kill $FIXTURE_AGENT_PIDS`, and reviewers remove the tmp dir with the stand-ins still running | `scripts/fixture-home.sh:77`, `:101`; Hephaistos's count, 2026-11-08 |
| the run report's launcher copies the pids to `$N/<label>.agents.pids`, outside the tmp dir, which `safe-kill --pidfile` refuses | `testdata/fixture-report/launch.sh:29`, `:77` |
| the launcher exports `FIXTURE_HOME` (`$tmp/home`) but not the tmp dir itself | `scripts/fixture-home.sh:338-341`, `:725` |
| `safe-kill` has no `--pidfile` on main today | `safe-kill --help` (2026-11-08); the factory card above is in review |

## Requirements

Card `lf75-fixture-stop` (scripts, no UI):
- **FR-1** `scripts/fixture-home.sh stop <dir>` runs `safe-kill --pidfile
  <dir>/agents.pid` and exits with its status. It refuses (exit 2, one
  stderr line, nothing stopped) a dir whose name is not
  `organizer-fixture.*` or that has no `agents.pid`. An empty `agents.pid`
  is exit 0. It never removes the dir: removal stays the caller's, after
  the stop.
- **FR-2** Every form of the launcher also exports `FIXTURE_DIR` (the tmp
  dir), and its usage comment says: `scripts/fixture-home.sh stop
  "$FIXTURE_DIR"` before removing the dir; the `kill $FIXTURE_AGENT_PIDS`
  lines go.
- **FR-3** `testdata/fixture-report/launch.sh` writes no pid copy outside
  the tmp dir; its `<label>.env` carries `FIXTURE_DIR`, and its usage says
  to stop through FR-1 before the dir goes.

## Acceptance → gate

Depends on safe-kill `--pidfile` installed (agent-slack card
reparented-stand-ins-stop merged); until then no row is satisfiable and the
card does not launch. Rows kill only the pids the launcher itself started
in the row, through FR-1; nothing by pattern.

| # | FR | Check | Expected (fails on main) |
|---|---|---|---|
| S1 | 1, 2 | eval the launcher's default output; read the dir's agents.pid; run the new stop on that dir; `ps -p` each pid after 2 s; list the dir | exit 0; no pid alive; the dir still there (main: no `stop`, no FIXTURE_DIR) |
| S2 | 1 | `scripts/fixture-home.sh stop "$(mktemp -d)"` | exit 2, one line; nothing stopped |
| S3 | 1 | the `--empty` form, then `stop "$FIXTURE_DIR"` | exit 0 |
| S4 | 2 | the `--twenty` and `--review` forms export FIXTURE_DIR under the tmp dir; S1's stop on each | as S1 |
| S5 | 3 | `testdata/fixture-report/launch.sh` dry of the app (its own test path, or by reading its writes): no `*.agents.pids` outside the tmp dir; `<label>.env` names FIXTURE_DIR | as FR-3 (main: `$N/<label>.agents.pids`) |
| X0 | all | `XDG_DATA_HOME=$(mktemp -d) CONTRACTS_DIR=<specs checkout>/contracts make test`, `git status --porcelain` | pass, empty |

## Boundary

`scripts/fixture-home.sh`, `testdata/fixture-report/launch.sh`, and any
test of either that asserts the old exports or the pid copy (for those
asserts only).

## Cards

| Card | Gate rows | Depends on | ui_review |
|---|---|---|---|
| `lf75-fixture-stop` | S1-S5, X0 | agent-slack reparented-stand-ins-stop (safe-kill --pidfile) | false |
