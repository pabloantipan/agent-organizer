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
next: "sup118 runs it after lf74 (0188); safe-kill --pidfile installed; launched"
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
