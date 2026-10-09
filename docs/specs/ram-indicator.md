# RAM indicator: memory pressure, free GB and the biggest agents: the build spec

status: proposed (the sampling half; the view half waits on Aglaea's design)
by: the FSE, 2026-10-09, on main at 01fd2b3
scope: 0101 (ruled). design: Aglaea's `docs/ux/specs/ram-indicator.md`, asked
in thread 01M4CK6VQ11WY8YJW9YWQ4C63T, **not written yet**. Gate rows follow
0095: every row is a seat's.

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
  closed): `pressure` (`normal`, `warn`, `critical`) from
  `kern.memorystatus_vm_pressure_level` (1, 2, 4; the level the kernel's own
  pressure notifications use), `total_bytes` from `hw.memsize`, and
  `free_bytes`, Activity Monitor's "available": total minus app memory,
  wired and compressed (`host_statistics64`, or `vm_stat` parsed; the
  builder picks one and names it in a comment). A read that fails leaves
  `memory` null and says why (`reason`), never a zero.
- **FR-2** Each agent carries `rss_bytes`: the resident size of its process
  plus every descendant (MCP servers, node, shells it spawned), from the same
  `ps` call with `rss=` and `ppid=` added. A crew or probe session sums its
  agents. `Memory.top` lists the five biggest sessions this machine runs,
  biggest first: session name (else pid), initiative, bytes.
- **FR-3** `organizer memory [--json]` prints the same reading once:
  pressure, free of total in GB to one decimal, then the top sessions.
- **FR-4** On the transition into `critical` (not on every critical sample),
  the app posts one macOS notification naming the top three sessions, at
  most once per 10 minutes; back to `normal` re-arms it. Words and click
  target are Aglaea's; until her spec lands the card carries placeholders
  only in a test, not in the app.

## Requirements, card `ram-view` (frontend + floating icon), after `ram-sample`

Waits on Aglaea's design spec: the top-bar indicator beside Needs me (which
stays the one badge) and Usage, the hover listing the top sessions linked to
their Agents rows, how the floating icon shows warn and critical without a
second badge, and every state (no reading, normal, warn, critical, back to
normal, reduced motion). Her acceptance becomes this card's gate rows. The
floating icon's own redesign (the Deltagos mark, `docs/ux/inputs/deltagos-mark/`)
may share this card; she settles that first.

## Acceptance → gate (ram-sample)

| # | FR | Check | Expected (fails on main) |
|---|---|---|---|
| G1 | 1 | Go test with a fake sysctl / vm_stat reader for levels 1, 2, 4 and a failed read | `normal`, `warn`, `critical`; `memory: null` with a reason |
| G2 | 1, 3 | `organizer memory --json` on the real home vs `sysctl kern.memorystatus_vm_pressure_level` and Activity Monitor's Memory tab read at the same minute | same pressure; free within 0.5 GB of Activity Monitor's total minus used |
| G3 | 2 | Go test over a fixture `ps` output with an agent, two children and a grandchild | the agent's `rss_bytes` is the four summed; top ordered biggest first, capped at five |
| G4 | 2, 3 | `organizer memory` on the real home with a crew up | the crew's sessions listed by name with their initiative; sums match `ps -o rss= -g` per tree within 5% |
| G5 | 4 | Go test driving pressure normal → critical → critical → normal → critical inside and past 10 minutes (fake clock) | one notification per entry into critical, none within 10 minutes of the last |
| X0 | all | `XDG_DATA_HOME=$(mktemp -d) make test` from a clean checkout; `wails build` | pass |

## Boundary

`ram-sample`: a new `internal/memory` package and its tests, `internal/scan/agents.go`
(the `ps` columns and the tree sum), `model.Agent` (`rss_bytes`),
`internal/service` (the field on `AgentsView`, the transition and its rate
limit), `internal/cli` (the `memory` command), `app.go` (posting the
notification), `frontend/wailsjs` regenerated. Not: the top bar, the
floating icon, any view.

## No-gos

- No other machine's memory (0101: "The Mac it runs on"); nothing synced.
- No killing or throttling agents from the indicator; it shows and warns.
- No history or chart of memory over time (unasked).

## Rabbit holes

- **The notification.** `UNUserNotificationCenter` needs a signed bundle with
  a notification entitlement and the user's permission; `Deltagos Review.app`
  is signed ad hoc. If it refuses there, `osascript -e 'display notification'`
  is the fallback, and the builder records which one shipped.
- **Pressure as Activity Monitor draws it.** Its graph colour is not
  published API; the kernel level is what it follows in practice. G2 checks
  they agree on the real home; if they do not, raise it, do not compute a
  percentage of our own.

## Technical notes

- Spec check (spec-craft 5b): G1-G5 fail on main (no `memory` field, no
  command, no `rss` column). Inputs in hand: this Mac (24 GB,
  `kern.memorystatus_vm_pressure_level: 1` at writing). G5 needs no real
  pressure. No row needs Pablo (0095).
- Cost of FR-2: one wider `ps` call already made every 10 s; the tree sum is
  in memory.

## Cards

| Card | Gate rows | Depends on | ui_review |
|---|---|---|---|
| `ram-sample` | G1-G5, X0 | — | false |
| `ram-view` | Aglaea's rows, X0 | ram-sample, Aglaea's spec | true |

Cards are cut, and the accept record with its forecast raised, once
Aglaea's spec gives `ram-view` its rows, so both launch under one record.
