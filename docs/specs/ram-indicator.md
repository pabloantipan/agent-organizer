# RAM indicator: memory pressure, free GB and the biggest agents: the build spec

status: proposed (0103)
by: the FSE, 2026-10-09, on main at 01fd2b3; both halves at 6d84a12
scope: 0101 (ruled). design: Aglaea's `docs/ux/specs/ram-indicator.md`
(6d84a12), acceptance M1-M8. Gate rows follow 0095: every row is a seat's.

## Problem

Pablo, 0101: "Due we're having heavy ram usage in other laptop, we need a
ram monitoring indicator for lease ram". Ruled: the Mac's memory pressure as
Activity Monitor shows it, free GB, and which agents use the most; in the top
bar and on the floating icon; this Mac only; a notification when pressure
turns red, naming the biggest agent sessions. Today the organizer samples
agents every 10 s (`App.agentTicker`, `Service.RefreshAgents`) through
`ps -axEo pid=,etime=,tty=,time=,command=` (`internal/scan/agents.go:172`)
and reads no memory at all.

## Requirements, card `ram-sample` (Go)

- **FR-1** A `Memory` reading rides the 10 s agents feed (`AgentsView`, a
  new `memory` field; no second ticker, no daemon, nothing when the app is
  closed): `pressure` (`normal`, `high`, `critical`, Aglaea's words) from
  `kern.memorystatus_vm_pressure_level` (1, 2, 4; the level the kernel's own
  pressure notifications use), `since` (when the current level began, or
  the app's start when it began earlier: the popover's `since Deltagos
  opened`), `was_critical_until` (the last time critical ended, kept 30
  min), `total_bytes` from `hw.memsize`, and
  `free_bytes`, Activity Monitor's "available": total minus app memory,
  wired and compressed (`host_statistics64`, or `vm_stat` parsed; the
  builder picks one and names it in a comment). A read that fails leaves
  `memory` null and says why (`reason`), never a zero.
- **FR-2** Each agent carries `mem_bytes`: the physical footprint of its
  process plus every descendant (MCP servers, node, shells it spawned),
  `ri_phys_footprint` from `proc_pid_rusage` (libproc, cgo, darwin; the
  figure Activity Monitor's Memory column shows), resident size from `ps`
  where footprint cannot be read (another user's process). The tree comes
  from the same `ps` call with `ppid=` added. A crew or probe session sums
  its agents. `Memory.top` lists the five biggest sessions this machine
  runs, biggest first: session name (else pid), initiative, bytes, and the
  agent's id for `Agents ›`; `Memory.agents_bytes` is all agent sessions
  together. (Aglaea's O1: footprint, not resident size; resident size
  counts shared pages once per process and overstates a tree.)
- **FR-3** `organizer memory [--json]` prints the same reading once:
  pressure, free of total in GB to one decimal, then the top sessions.
- **FR-4** The service decides when to warn: on an entry into `critical`,
  only when the pressure has been out of critical for at least 10 minutes
  before it and the last warning is at least 30 minutes old (Aglaea §3; the
  first entry always warns). Nothing at high or on recovery. The decision
  rides the feed as `Memory.warn` (true on the one sample that warns), so
  `ram-view` posts it and tests read it.

## Requirements, card `ram-view` (frontend + native), after `ram-sample`

- **FR-5** Aglaea's design as written (`docs/ux/specs/ram-indicator.md`):
  the top-bar button after Usage and before Rescan (not a badge; Needs me
  stays the one badge), the popover on click with its five sessions and
  `Agents ›` landing focused on the row, the floating icon's ring outside
  the tile (2 px at high, 3 px breathing at critical, steady under Reduce
  motion) and the panel's memory line with three sessions, the short form
  at 1024, and every state in her table.
- **FR-6** The notification when `Memory.warn` is set: her title, body and
  click (Deltagos to the current desktop, popover open), through
  `UNUserNotificationCenter`; when notifications are off for Deltagos the
  popover says so in her words.
- **FR-7** Nothing in the popover, ring, panel or notification stops a
  session (M6). The ring does not wait for the Deltagos mark (0102): it sits
  outside the tile, whatever the tile draws.

## Acceptance → gate (ram-sample)

| # | FR | Check | Expected (fails on main) |
|---|---|---|---|
| G1 | 1 | Go test with a fake sysctl / vm_stat reader for levels 1, 2, 4 and a failed read | `normal`, `high`, `critical`; `memory: null` with a reason |
| G2 | 1, 3 | `organizer memory --json` on the real home vs `sysctl kern.memorystatus_vm_pressure_level` and Activity Monitor's Memory tab read at the same minute | same pressure; free within 0.5 GB of Activity Monitor's total minus used |
| G3 | 2 | Go test over a fixture `ps` output with an agent, two children and a grandchild, and a fake footprint reader that fails for one child | the agent's `mem_bytes` is the four summed, the failed one by resident size; top ordered biggest first, capped at five |
| G4 | 2, 3 | `organizer memory` on the real home with a crew up | the crew's sessions listed by name with their initiative; each tree's sum within 5% of Activity Monitor's Memory column summed over the same pids |
| G5 | 4 | Go test, fake clock: normal → critical (warns) → normal 5 min → critical (no) → normal 12 min → critical 25 min after the first (no) → normal 12 min → critical 40 min after the first (warns); high throughout another run | `warn` exactly twice; never at high or recovery |
| G6 | 1 | Go test: high for 4 min; critical ending at 14:32 | `since` 4 min back; `was_critical_until` 14:32 for 30 min, then empty |
| X0 | all | `XDG_DATA_HOME=$(mktemp -d) make test` from a clean checkout; `wails build` | pass |

## Acceptance → gate (ram-view)

| # | FR | Check | Expected (fails on main) |
|---|---|---|---|
| M1-M8 | 5-7 | Aglaea's rows, in `make review-build` on the fixture, with the reading forced per level (a `ORGANIZER_MEMORY_FAKE=normal|high|critical|fail` env read only by the fixture build path, documented in `scripts/fixture-home.sh`) and on the real home at normal | as her spec |
| N1 | 6 | in the review build, force critical: the notification's title and body; click it from another desktop | as §3; Deltagos on the current desktop, popover open. If macOS refuses notifications to the ad-hoc signed bundle, the row is checked in `/Applications/Deltagos.app` by Pablo and the card says so |
| X0 | all | as above, plus `cd frontend && npm run build` | pass |

## Boundary

`ram-sample`: a new `internal/memory` package and its tests, `internal/scan/agents.go`
(the `ps` columns, the footprint read and the tree sum), `model.Agent` (`mem_bytes`),
`internal/service` (the field on `AgentsView`, the levels' times and the
warn rule), `internal/cli` (the `memory` command), `frontend/wailsjs`
regenerated. Not: the top bar, the floating icon, any view, posting the
notification.

`ram-view`: a new top-bar component, popover and css (tier-2 tokens), the
store (the popover's open state, `Agents ›` focus), `AgentsView.tsx` (focus
a row by agent id only), `floaticon_darwin.m/.h/.go` (the ring and the
panel's line), a new `notify_darwin.m/.go` and `notify_other.go`, `app.go`
(posting on `warn`, the click), `scripts/fixture-home.sh` (the fake
reading). Not: Go under `internal/`, the mark (0102).

## No-gos

- No other machine's memory (0101: "The Mac it runs on"); nothing synced.
- No killing or throttling agents from the indicator; it shows and warns.
- No history or chart of memory over time (unasked).

## Rabbit holes

- **The notification.** `UNUserNotificationCenter` asks the user's
  permission once and may refuse an ad-hoc signed bundle. `osascript
  'display notification'` is not a fallback: it cannot open the popover on
  click or tell whether notifications are off. If the review build is
  refused, N1 moves to the installed app (the row says so).
- **Pressure as Activity Monitor draws it.** Its graph colour is not
  published API; the kernel level is what it follows in practice. G2 checks
  they agree on the real home; if they do not, raise it, do not compute a
  percentage of our own.

## Technical notes

- O2 (critical in magenta, never red) is Aglaea's design-system reading;
  0103 names it so Pablo's accept covers it.
- Spec check (spec-craft 5b): G1-G6 and M1-M8 fail on main (no `memory` field, no
  command, no per-agent memory). Inputs in hand: this Mac (24 GB,
  `kern.memorystatus_vm_pressure_level: 1` at writing). G5 needs no real
  pressure. No row needs Pablo (0095).
- Cost of FR-2: one wider `ps` call already made every 10 s; the tree sum is
  in memory.

## Cards

| Card | Gate rows | Depends on | ui_review |
|---|---|---|---|
| `ram-sample` | G1-G6, X0 | — | false |
| `ram-view` | M1-M8, N1, X0 | ram-sample | true |
