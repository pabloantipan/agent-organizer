---
title: "The fixture launcher stops its own stand-ins before their dir goes"
status: next
repos: [organizer]
branch: lf75-fixture-stop
seat: l75-build
reviewer: l75-rev
review: "pass 2026-11-08 l75-rev at bcab614a; unmet: none"
stage:
updated: 2026-11-08
next: "PR with talos-lab"
depends_on: [agent-slack/reparented-stand-ins-stop]
boundary: ["scripts/fixture-home.sh", "testdata/fixture-report/launch.sh"]
spec: "docs/specs/leftovers-75.md (FR-1 to FR-3)"
gate: "docs/specs/leftovers-75.md#Acceptance → gate"
ui_review: false
touches: []
change_order: {add: [], change: [], retire: []}
autonomy: unattended
---

## Goal
No fixture stand-in outlives its tmp dir.

## Gate
docs/specs/leftovers-75.md, rows S1-S5 and X0.

## Pre-answered
- Base: origin/main at the card's start.
- Merge target: `main` through talos-lab's PR.
- Tests: the S rows run in a shell from the card's worktree; X0 is `make test`; no Go or vitest test is required.
- Design: n/a, no UI.
- Short-sample fallback: the launcher's own forms (default, --empty, --twenty, --review).
- Data shape across states: as the launcher writes it.
- Evidence: the commands and their output under `.wt-notes/<seat>/`.
- Retention: n/a.
- Kills: only through FR-1's stop on pids the row's own launcher started; never pkill, killall or a pgrep pattern.

## Done
- 2026-11-08 l75-build: built on lf75-fixture-stop, rebased on origin/main 3d0c944b (2571999c, bcab614a; not pushed). S1-S5 fail on 127b35c and pass on the branch; X0 passes from a clean clone, porcelain empty. Commands and logs in `.wt-notes/l75-build/progress.md`.

## Declared changes
- modified `scripts/fixture-home.sh`: `stop <dir>` runs `safe-kill --pidfile <dir>/agents.pid` and refuses other dirs (FR-1); every form exports `FIXTURE_DIR`; the usage says stop before removing the dir, the `kill $FIXTURE_AGENT_PIDS` lines go (FR-2)
- modified `testdata/fixture-report/launch.sh`: no `<label>.agents.pids` copy; refuses unless `FIXTURE_DIR` is the config's dir, so `<label>.env` carries it; the usage says stop through FR-1 before the dir goes (FR-3)
Risky:
- `fixture-home.sh stop`: an argument named `stop` used to fall through to the default home; now it is the stop subcommand
Not changed, on purpose:
- `FIXTURE_AGENT_PIDS` export: `scripts/floating-icon-by-hand.sh` still reads it (outside the boundary)
- `docs/ux/memory.md:322-323`: still tells reviewers `pkill -f <fixture dir>`; outside the boundary, noted in progress.md "Found, not asked"

## Review
Verdict: **pass**. Unmet rows: none. Reviewer l75-rev, 2026-11-08, commit bcab614a (branch lf75-fixture-stop, on 3d0c944b), from a fresh clone of origin plus the local branch. Logs in `.wt-notes/l75-rev/`.

change-check (`change-check organizer lf75-fixture-stop --base origin/main`, base c2eeb8f19):
```
repo organizer: base c2eeb8f19 (--base origin/main) ... head lf75-fixture-stop (clone HEAD bcab614ac, on detached) bcab614ac; 2 files, 0 flags
Changed: scripts/fixture-home.sh (modified); testdata/fixture-report/launch.sh (modified, test)
0 flags: outside boundary 0, outside footprint 0, undeclared 0, declared, not changed 0, new env var 0, new dependency 0, new host 0, risk 0, untested? 0, could not read 0, boundary unreadable 0
```
Nothing to explain: no undeclared, outside-boundary or declared-not-changed line.

| Row | main 3d0c944b | branch bcab614a |
|---|---|---|
| S1 | no FIXTURE_DIR; `stop <dir>` lays a second fixture, exit 0; 8 stand-ins alive after 2 s | FIXTURE_DIR = tmp dir; stop exit 0; none alive after 2 s; dir still there |
| S2 | `stop "$(mktemp -d)"` exit 0, lays a fixture | exit 2, one stderr line |
| S3 | no FIXTURE_DIR (stop lays a fixture) | `--empty` FIXTURE_DIR = tmp dir; stop exit 0 |
| S4 | --twenty, --review: no FIXTURE_DIR, stand-ins alive after 2 s | both: FIXTURE_DIR = tmp dir, stop exit 0, none alive, dir there |
| S5 | `r1.agents.pids` in the notes dir; no FIXTURE_DIR in r1.env | no `*.agents.pids` outside the tmp dir; r1.env has `export FIXTURE_DIR='…/organizer-fixture.…'` |
| X0 | — | `make test` pass (go ok, vitest 104 files / 1714 tests), review-build ok, porcelain empty; test run fresh (test-lease log 2026-11-08T04:58:43 start, saved as run de376b1842958c036550e122bde58188) |

Main rows' stand-ins (including the second fixtures main's `stop` laid) ended by `safe-kill --pidfile <dir>/agents.pid`.

Cases beyond the builder's rows (extra-branch.log), each exit and stderr: `stop` with no argument, three args, and `""`: exit 2, one line, no stdout; a regular file named `organizer-fixture.*`: exit 2, one line ("no agents.pid there"); a nonexistent path: exit 2, one line; a dir `organizer-fixture.outside` under `.wt-notes/` (outside $TMPDIR and /tmp) with agents.pid naming my own `sleep`: exit 1 (safe-kill: not below $TMPDIR or /tmp), sleep alive, dir kept; a copy dir in $TMPDIR whose agents.pid names my `sleep`: exit 1, safe-kill's status ("its executable /bin/sleep is not inside …"), sleep alive, dir kept (sleep then ended by `safe-kill <pid>`); a real `--empty` dir with a trailing slash: exit 0, dir kept. `organizer-fixture.*` count under $TMPDIR and /tmp is the same before and after every stop: stop lays nothing. FR-2: all three export points (`fixture-home.sh:361`, `:386`, `:747`) export FIXTURE_DIR; no `kill $FIXTURE_AGENT_PIDS` line in either file. FR-3: launch.sh's only writes outside the tmp dir are `<label>.fixture.err`, `.env`, `.pid`, `.log`.

Note: safe-kill's own refusals print two stderr lines (its reason plus "nothing killed"); FR-1's one-line rule is about stop's own refusals, which are one line. Goes nowhere.
Note: `scripts/floating-icon-by-hand.sh:36` and `docs/ux/memory.md:322-323` still end stand-ins by `kill $FIXTURE_AGENT_PIDS` and `pkill -f`; as the builder found, outside the boundary. Goes to the FSE as a follow-up card.
