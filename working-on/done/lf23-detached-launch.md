---
title: "Seats start detached; the organizer stops typing into iTerm"
status: done
repos: [organizer]
branch: lf23-detached-launch
seat: dl-build
stage: one-window
updated: 2026-10-14
next: "review: lf23-detached-launch, gate met (A1, A2, A3, X0), 30e2662"
depends_on: []
boundary: ["docs/specs/leftovers-23.md Boundary, lf23-detached-launch"]
spec: "docs/specs/leftovers-23.md (FR-1 to FR-4)"
gate: "docs/specs/leftovers-23.md Acceptance, rows A1, A2, A3 and X0"
ui_review: false
review: pass
---

## Goal
Bring crew up, Run and New agent start seats detached; Attach uses `probe --attach` (Hephaistos, 2026-10-13, from Pablo's ruling).

## Gate
docs/specs/leftovers-23.md, rows A1, A2, A3 and X0. A3 needs the merged probe.

- [x] A1: `internal/service/launch_test.go` (Run, Crew, New agent with a fake probe; 0, 3→0, 3→3, 1), pass; `.wt-notes/dl-build/x0-clean.txt`
- [x] A2: `TestAttachFallbackAttaches`, pass; `.wt-notes/dl-build/x0-clean.txt`
- [x] A3: `.wt-notes/dl-build/a3-iterm-before.txt`, `a3-run.txt`, `a3-iterm-after.txt` (4 and 4), `a3-zellij-sessions.txt`, `a3-kill.txt`
- [x] X0: `.wt-notes/dl-build/x0-clean.txt` (make test, wails build, status empty)

## Done
- 2026-10-14 dl-build: seats start detached through `launchProbe` (/bin/sh -c, retry once on 3), `openInTerminalTabs` gone, Attach fallback `probe --attach`, CLAUDE.md updated; 4f70510, 30e2662.

## Notes
- RunCard now runs `probe --wrap` first; an unnamed New agent gets an animal name from the organizer (probe -t attaches). `app.go`'s CreateCrew comment still says iTerm2 (outside the boundary). See `.wt-notes/dl-build/progress.md`.

## Review
Verdict: pass. Reviewer dl-review, 2026-10-14, commit 30e2662 (fresh clone at `.wt-notes/dl-review/clean`, removed after; evidence in `.wt-notes/dl-review/`).

- A1: `TestRunCardStartsDetachedAndRetriesOnce` (0, 3-then-0, 3-then-3, 1), `TestCreateCrewStartsSeatsDetached` (failing seat named `seat dev_bruno: probe exited 3|1: pane: bruno`, first seat kept), `TestCreateAgentStartsDetached`, all pass (`a1a2.txt`); diff read: launches run `/bin/sh -c <launchLine>` via `launchProbe`, retry only on exit 3, `openInTerminalTabs` gone, no osascript on any launch path.
- A2: `TestAttachFallbackAttaches` pass; `attachFallback` = `probe --attach <name>`, used by both fallback branches.
- A3: `organizer run lf23review throwaway` built from the clean clone, scratch config/data under mktemp: iTerm windows 4 before, 4 after; `lf23review-probe-throwaway [Created 1s ago]` listed with TMPDIR=/tmp; `probe -k` deleted it; wrapper `~/bin/lf23review-probe` removed (`a3-*.txt`).
- X0: `XDG_DATA_HOME=$(mktemp -d) test-lease run -- make test` exit 0 (Go ok, vitest 631 pass), `test-lease run -- wails build` exit 0, `git status --porcelain` empty (`x0-*.txt`).
- FR-4 CLAUDE.md: Agents, Crew and Run gate paragraphs say seats start detached through `launchProbe`, no window.
- Boundary and No-gos: diff touches only crew.go, run.go, service.go, launch_test.go, cli/crew.go (message named iTerm2), CLAUDE.md; no frontend, prompt.go, draft.go or probe; `seats open` appears only in a CLI hint, never called; Kill and Stop unchanged.

Unmet rows: none.

Not in the gate: `openInTerminal` now has no caller (dead code; FR-4 assumed the review prompt and Draft used it, they never did); New agent is tested only on exit 0 (retry is the shared `launchProbe`); a launch blocks up to ~60 s per seat with no progress in the UI; `app.go` comment still says iTerm2.
