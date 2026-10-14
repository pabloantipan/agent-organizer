---
title: "Seats start detached; the organizer stops typing into iTerm"
status: now
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
