# Usage audit fixes: money a resumed session spent, hours that mean something: the spec

status: proposed (0138)
by: the FSE, 2026-10-15, on main at 523b0a7
sources: Hephaistos's audit of the week 2026-W42 (organizer thread 01M50ZTJ;
scripts in Hephaistos's scratchpad `usage-audit/`), after Pablo asked "dude,
are we sure of these numbers?" on lodestar. Code read before writing:
`internal/usage/ledger.go` (`CostSource`, `foldCosts` :523-545, dedupe
:455-466), `internal/usage/report.go` (`Hours` :237, the model cut's split
:313-323), `internal/service/usage.go` (cost sources from runs.jsonl and live
records, :47, :51). The base spec is `docs/specs/usage.md`.

## What the audit confirmed right

Tokens (911.4M vs 913.0M five minutes later), 107 sessions, the dedupe by
message id, the attribution. Not attributed is the Hephaistos pair session
(cwd `~`) and one throwaway in `/private/tmp`.

## Requirements, card `uc-resume` (Go), the bug with no choice in it

- **FR-1** A session's cost is the sum over its processes of each
  process's largest cost record, not the largest record of all. A cost
  record is per process (runs.jsonl folds `pid:session_id`; live records
  are per pid): Claude Code's `total_cost_usd` restarts at 0 in each new
  process, so a resumed or woken seat's earlier processes are lost today.
  `CostSource` carries the pid; `foldCosts` keeps the max per (session,
  pid) and sums across pids. The comment that says the total is cumulative
  across a resume is corrected.
- **FR-2** The transcript cost-state (`cost_from: transcript`) follows the
  same rule if it restarts per process; the builder checks which on a
  resumed session's transcript and writes what it found in the card's
  Notes.

## Acceptance → gate (uc-resume)

| # | FR | Check | Expected (fails on main) |
|---|---|---|---|
| A1 | 1 | go test: one session, three pids with records 5, 10 (then 12) and 7 | cost 24 (12 + 5 + 7), not 12 |
| A2 | 1 | go test: one pid with growing records 3, 8, 11 | cost 11 |
| A3 | 1 | on this Mac, read-only: `organizer usage --week 2026-W42 --by task --json`, session 368c36b6 (the organizer FSE, pids 88428, 28295, 51126) | its cost within 5% of the audit's $74.71 (today $18.08) |
| A4 | 1 | the same, `--week 2026-W41` total | within 3% of the audit's $801.82 (today $783.08) |
| A5 | 2 | the card's Notes | which cost source restarts per process, with the evidence |
| X0 | all | `XDG_DATA_HOME=$(mktemp -d) make test`, `cd frontend && pnpm run build`, `wails build`, then `git status --porcelain` | pass, empty |

A3 and A4 read the real ledger and change nothing; the builder runs them
on a copy of the data dir (`XDG_DATA_HOME` pointed at a copy), never
rewriting the live `usage.jsonl`.

## Boundary (uc-resume)

- `internal/usage` (`CostSource`, `foldCosts`, the cost-state reading if
  FR-2 finds it restarts), `internal/service/usage.go` only to pass the
  pid, their tests. Not: the frontend, the post to the record
  (`usage-post`, which resends the changed rows by itself), the ledger's
  file format beyond what a cost change rewrites.

## Waiting on 0138 (not carded until ruled)

- **Hours (audit 2).** "179 h of work" is first-to-last message per session
  and day, so idle and parallel sessions count: the audit finds 65 h active
  and 18.7 h of wall clock with any session working. The words and the
  number are the owner's choice (0138, Q1).
- **No cost record (audit 3).** A session with none counts as $0 (the week
  of 17 Aug: 341.9M tokens, 7 sessions, $0.00). A fallback needs a price
  table the organizer keeps (0138, Q2). Prices checked by Hephaistos today
  for Opus 5.5: input $4/M, cache write $5/M (5 min) or $8/M (1 h), cache
  read $0.20/M, output $20/M, no long-context surcharge.
- **The split (audit 4).** Cost split across days and models by token share,
  not price; with a price table it splits by priced tokens (0138, Q2). A
  past week also drifts while a session spanning it grows; that stays, and
  the view says so (0138, Q2).
- **Live cost above priced tokens (audit 5).** 9 of 441 sessions since 23
  Sep, 9-34% above. Not verified; a note, no card.
