# Usage audit fixes: money a resumed session spent, hours that mean something: the spec

status: ruled (0138, 2026-10-15: "Do as you recommend", the first option)
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

## Requirements, card `uc-price` (Go, one frontend line), ruled by 0138

0138 chose: hours are active time with a 5-minute gap rule; the organizer
keeps a price table for missing costs and for the split. Code read:
`Ingest`'s add callback (ledger.go:274-296, where each message's `ts` is
seen), `splitCost` (:571), `costOf` (:558), `totals` (report.go:219, `Hours`
:237), the model cut's split (report.go:310-321), `hoursWords` and
`moneyOf` in `frontend/src/lib/usage.ts`.

- **FR-3** (hours) A ledger line carries `active`, seconds: the sum of the
  gaps between that session's consecutive messages on that day that are 5
  minutes or less (a message more than 5 minutes after the one before
  starts a new stretch and adds nothing for the gap). `Totals.Hours` is
  the sum of `active`, not of `Last - First`. Lines written before the
  field exist are recomputed from the transcripts once (the builder picks
  how: a ledger version that resets the offsets, or a one-time rebuild),
  never left reading 0 h. The view's words stay `<n> h of work`.
- **FR-4** (price table) `internal/usage` holds one table of prices per
  model, dollars per million tokens per kind, each row with the date it
  was checked and its source. It starts with the one row checked
  (Hephaistos, 2026-10-15): `claude-opus-5-5` input 4, output 20, cache
  read 0.20, cache write 5 (5-minute) and 8 (1-hour). The builder reads a
  real transcript's `usage` for a 1-hour/5-minute cache-write split
  (`cache_creation.ephemeral_1h_input_tokens` or its like): if it is
  there, cache writes are priced per TTL; if not, at the 5-minute price,
  and the card's Notes say which. No price for a model is guessed; a model
  not in the table has no price.
- **FR-5** (missing cost) A session with no cost record and no transcript
  cost gets a priced cost when every one of its tokens is of a priced
  model: `cost_from: "priced"`. Otherwise its cost stays null and the view
  keeps `—` and `no cost recorded for <n> sessions`, never $0.00. A
  priced cost reads `$<n> (priced)` where the view names the source
  (`moneyOf` or a sibling helper; the one frontend change).
- **FR-6** (split) A session's cost is put on its days, and a day's cost on
  its models, by each part's priced tokens when every part is priced, and
  by token count (today's rule) when any part is not. The total never
  changes by the split.
- A past week still drifts while a session that spans it grows; that
  stays (audit 4) and is not this card's.
- Live cost above priced tokens (audit 5, 9 of 441 sessions since 23 Sep):
  a note, no card.

## Acceptance → gate (uc-price)

| # | FR | Check | Expected (fails on main) |
|---|---|---|---|
| P1 | 3 | go test: one session, messages at 10:00, 10:03, 10:04, 10:30, 10:32 | `active` 360 s (3 + 1 + 2 min); hours 0.1 |
| P2 | 3 | go test: a session ingested in two passes, the split between 10:03 and 10:04 | the same 360 s as one pass |
| P3 | 3 | go test: a ledger line without `active` (written by today's code) | recomputed from its transcript after one ingest, not 0 |
| P4 | 3 | on this Mac, read-only, a copy of the data dir: `organizer usage --week 2026-W42 --json` totals.hours, read after uc-resume landed | within 10% of the audit's 65 h (today 179 h) |
| P5 | 4, 5 | go test: a session of opus-5-5 tokens with no cost source | cost from the table, `cost_from: "priced"`, exact to the cent for a hand-computed case |
| P6 | 5 | go test: a session with one unpriced model's tokens and no cost source | cost null, no `priced` |
| P7 | 5 | on the copy: `--week 2026-W34` (the 17 Aug week, 7 sessions, $0.00 today) | money not 0 if its models are priced, else `—` with `no cost recorded for 7 sessions`; the card's Notes say which models it held |
| P8 | 6 | go test: a session with cost $10 over two days, day one 1M opus output tokens, day two 1M opus cache-read tokens | day one ≈ $9.90, day two ≈ $0.10 (20 : 0.20), sum $10 |
| P9 | 5 | vitest: the priced words | `$12.50 (priced)` for a priced cost; `—` stays for unknown |
| X0 | all | `XDG_DATA_HOME=$(mktemp -d) make test`, `cd frontend && pnpm run build`, `wails build`, then `git status --porcelain` | pass, empty |

P4 and P7 read the real ledger and change nothing: a copy of the data dir
(`XDG_DATA_HOME` pointed at it), never the live `usage.jsonl`.

## Boundary (uc-price)

- `internal/usage` (the `active` field, the price table, `costOf`,
  `splitCost`, `totals`, the model cut's split), `internal/service/usage.go`
  only if the rebuild needs it, `frontend/src/lib/usage.ts` and its test
  for the priced words, `frontend/src/components/Usage.tsx` only to call
  them, their tests. Not: the post to the record, `foldCosts` (uc-resume's),
  any other view.
- Runs after `uc-resume` (same package, same files): `depends_on: [uc-resume]`.

Amendment 1, 2026-10-15, the FSE, from uc-build's evidence on the card
(05f57f0, `working-on/uc-resume.md` Notes): FR-1's premise is false. Claude
Code restores a session's cost on resume, so both the statusline record and
the transcript's `cost-state` are cumulative across processes (34 of 35
multi-pid sessions in runs.jsonl rise monotonically). The one drop is
368c36b6: the cost restarted inside pid 28295 at `/login`, and that
process's peak before `/login` is in no record. Summing per pid, as written,
double-counts every ordinary resume (W41 $1215 vs the audit's $801.82). So:

- **FR-1** (replaced) A session's recorded cost is the sum over its *runs*
  of each run's largest record, where a run ends when a record, in time
  order, is lower than the one before it (a reset, `/login` is the one
  seen). With no drop this is today's max. `CostSource` carries what
  orders the records (first/last seen, pid); the session is marked
  `reset` when it has more than one run. The comment that the total is
  cumulative across a resume stays: it is true.
- **FR-2** stands answered: neither source restarts per process (A5, the
  card's Notes).
- **A1** (replaced) go test: one session, records in time order 5, 10,
  12, 3, 7 (across three pids) → 19 (12 + 7), `reset`; and a second
  session of three pids 5→10, 10→12, 12→14 → 14, not `reset`.
- **A3** (replaced) 368c36b6 reads $24.00 (18.08 + 5.92) and `reset`; the
  window lost before `/login` is priced by uc-price (FR-7, P10), not here.
- **A4** (replaced) W41 total within 3% of $801.82 and no session above
  its value on main except one marked `reset` (main is already within
  3%; this row guards against double counting).
- **uc-price FR-7** A session marked `reset` whose tokens are all of
  priced models takes the larger of its recorded cost and its priced
  tokens, `cost_from: "priced"`; one with an unpriced model keeps its
  recorded cost and `reset`.
- **uc-price P10** go test: a `reset` session whose priced tokens exceed
  its runs takes the priced cost; on the data-dir copy, 368c36b6 is within
  10% of the audit's $74.71.
