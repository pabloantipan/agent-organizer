# Leftovers 23: seats start detached, the organizer stops typing into iTerm: the build spec

status: proposed (0119)
by: the FSE, 2026-10-13, on main at 16b3c5e
sources: Hephaistos's note of 2026-10-13 (thread 01M4TQN8NP5GQNB1RN72P3RQ3S),
from Pablo's ruling the same day (agent-slack `docs/decisions.md`
2026-10-13, Pablo: "I need to keep FSE shell window present and clean ...
a quick way to open iTerm window with sup and builder/reviers attached"),
built in claudecode `feat/seat-background`: `probe` creates every seat as a
detached zellij session (no iTerm window, tab or typed text), writes
`~/.local/state/probe/<s>.parent`, checks the seat within 30 s and exits 3
with the pane's last lines when it did not start; `probe <live seat>` now
prints `running; nothing started`; `probe --attach <name>` attaches;
`seats open [<sup>]` shows a team. This spec starts only after Pablo merges
that branch (the card's precondition).

## Problem

Four organizer paths open iTerm and type a launch line into it:
`CreateCrew` (`openInTerminalTabs`, `internal/service/crew.go:533-560`),
`RunCard` (`internal/service/run.go:164`), `NewAgent` (`openInTerminal`,
`internal/service/service.go:359, 397`), and `AttachSession`'s Terminal
fallback (`service.go:565`, `probe <name>`). After the merge the first
three leave an iTerm window with only a shell in it and keep the stray-
keystroke trap (sup57 lost 40 min to it); the fourth prints `running;
nothing started` instead of attaching.

## Requirements, card `lf23-detached-launch` (Go)

- **FR-1** `CreateCrew`, `RunCard` and `NewAgent` run their launch lines
  themselves (`/bin/sh -c <line>`, the same `launchLine` text), one after
  another, with no osascript, iTerm window, tab or typed text.
- **FR-2** A launch that exits 3 is retried once; a second failure, or any
  other non-zero exit, returns an error carrying the probe's output (the
  pane's last lines), and `CreateCrew` names the seat. Seats already
  started stay up.
- **FR-3** `AttachSession`'s Terminal fallback runs `probe --attach
  <name>`; the iTerm profile path stays as is (Bring crew up does not open
  any window; showing a team is `seats open`, Pablo's).
- **FR-4** `openInTerminalTabs` goes; `openInTerminal` stays only where a
  terminal is the point (the review prompt's `--run`, Draft the cell),
  unchanged. CLAUDE.md's Agents, Crew and Run gate paragraphs say seats
  start detached.

## Acceptance → gate

| # | FR | Check | Expected (fails on main) |
|---|---|---|---|
| A1 | 1, 2 | Go test with a fake `probe` (`probeBin` swappable for tests) that records its calls and exits 0, 3 then 0, 3 then 3, or 1 | the line runs through a shell, no osascript is executed (the exec seam records none); 3-then-0 succeeds after one retry; 3-then-3 and 1 return an error with the fake's output and the seat's name |
| A2 | 3 | Go test of the fallback's command | `probe --attach <name>` |
| A3 | 1 | on lodestar after the probe merge: `organizer run organizer <a throwaway card with a one-line prompt>` against a fixture-free scratch initiative under `$(mktemp -d)`; `osascript -e 'tell application "iTerm2" to count windows'` before and after; `zellij list-sessions -n` with `TMPDIR=/tmp`; then `probe -k` on that session by name | the session listed, the window count unchanged, nothing typed anywhere; killed after |
| X0 | all | `XDG_DATA_HOME=$(mktemp -d) make test`, `wails build`, then `git status --porcelain` | pass, empty |

## Boundary

- `lf23-detached-launch`: `internal/service/crew.go` (`CreateCrew`'s
  launch, `openInTerminalTabs`), `internal/service/run.go` (`RunCard`),
  `internal/service/service.go` (`NewAgent`, `AttachSession`, `probeBin`
  made swappable for tests), their tests, `internal/cli` only if a message
  names a window, `CLAUDE.md` (the three paragraphs). Not: the frontend,
  `prompt.go`, `draft.go`, `probe` itself.

## No-gos

- No `seats open` call from the app (Pablo opens teams).
- No change to Kill (`probe -k`) or Stop.

## Cards

| Card | Gate rows | Depends on | ui_review |
|---|---|---|---|
| `lf23-detached-launch` | A1, A2, A3, X0 | Pablo merges claudecode `feat/seat-background` | false |
