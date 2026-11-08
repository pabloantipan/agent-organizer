---
title: "The fixture launcher stops its own stand-ins before their dir goes"
status: next
repos: [organizer]
branch: lf75-fixture-stop
seat: l75-build
reviewer:
review:
stage:
updated: 2026-11-08
next: "l75-build building from origin/main 127b35c (sup118, launched 04:52)"
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
