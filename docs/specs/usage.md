# Usage: tokens and money per session, week by week: the build spec

status: proposed (0099)
by: the FSE, 2026-10-06, on main at c92efa0
scope: 0098 (ruled). design: Aglaea's `docs/ux/specs/usage.md` (b104480),
acceptance U1-U8. Gate rows follow 0095: every row is a seat's.

## Problem

Pablo, 0098: "I see builders and reviers: no token reported?" Today
`~/.local/share/organizer/runs.jsonl` keeps, per session, the context size at
the end and the statusline's dollar cost, not the tokens consumed; and
`session.MatchCard` attributes a run to a card only through a worktree path
or a branch, both gone once a task ends, so `organizer runs organizer`
shows 6 runs. The tokens consumed are in each transcript
(`~/.claude/projects/<dir>/<session>.jsonl`, `message.usage` per assistant
message: `input_tokens`, `output_tokens`, `cache_read_input_tokens`,
`cache_creation_input_tokens`; streamed messages repeat a `message.id`).

## Requirements, card `usage-ledger` (Go)

- **FR-1** A ledger sums, for every transcript under `~/.claude/projects`
  (sub-agent transcripts included, each message counted once by
  `message.id`), the four token kinds per session **per local day**, and
  keeps them in `~/.local/share/organizer/usage.jsonl` (one line per session
  and day, rewritten when a day grows). It reads transcripts incrementally
  (by size and offset), so a rescan of an unchanged home reads nothing.
- **FR-2** Cost per session from `runs.jsonl` and live session records
  (the statusline's cumulative `cost_usd`), split over its days in
  proportion to the day's tokens; a session with no record has no cost, and
  says so.
- **FR-3** Every session is attributed, once, when first seen, and the
  attribution is kept in the ledger so it survives the worktree:
  initiative (longest initiative-root prefix of the cwd; for a worktree
  under `.wt/`, its root), role (supervisor `sup<n>`; builder, reviewer, UI
  reviewer by the seat suffix `-build`, `-review`, `-ui` or `-x<n>`; `fse`;
  a persona seat from `AGENT_NAME`; a pair session such as Hephaistos or
  Aglaea by its skill or session name; else `session`), and task: a seat's
  card by the card's `seat:` prefix (`rlf-build` gives `rlf-*`), a
  supervisor's by the cards whose Notes name it. What cannot be attributed
  is `Not attributed` with the reason (no initiative root, no card).
- **FR-4** `organizer usage [--week YYYY-Www] [--by initiative|role|task|model] [--json]`
  prints Aglaea's totals and cuts for a week (weeks start Monday, local
  time, 0098 O1), and `App.Usage(week)` returns the same to the app.

## Requirements, card `usage-view` (frontend), after `usage-ledger`

- **FR-5** Aglaea's Usage view as designed (`docs/ux/specs/usage.md`): the
  top-level view and its quiet top-bar button, the week picker, three
  tiles, the money chart, the table with four cuts, the Sessions list, the
  Agents line, every state she names.
- **FR-6** Money appears only in Usage (0099 asks Pablo to narrow 0020 so).

## Acceptance → gate

| # | FR | Check | Expected (fails on main) |
|---|---|---|---|
| G1 | 1 | Go test over a fixture transcript with a streamed message repeated three times and a sub-agent file | each kind summed once per `message.id`; the sub-agent counted; a second run reads 0 bytes |
| G2 | 1, 4 | `organizer usage --week 2026-W40 --json` on the real home vs a one-off script summing the same transcripts | totals equal to the token |
| G3 | 2 | a session with a record and one without | cost split by day; the other `cost: null`, counted in "without cost" |
| G4 | 3 | `organizer usage --week 2026-W41 --by task` on the real home | sup46's, rlf-build's, rlf-review's, rlf-ui's, fi3-*'s sessions under leftovers-13's cards (worktrees already removed); nothing of theirs `Not attributed` |
| G5 | 3 | `--by role` for 2026-W41 | supervisor, builder, reviewer, ui reviewer, fse, pair rows; `Not attributed` last with reasons |
| U1-U8 | 5 | Aglaea's rows, in `make review-build` on a fixture ledger (`scripts/fixture-home.sh` gains one) and on the real home | as her spec |
| U9 | 6 | grep the frontend for `$` outside Usage | none on cards, waves or Agents |
| X0 | all | `XDG_DATA_HOME=$(mktemp -d) make test` from a clean checkout; `cd frontend && npm run build`; `wails build` | pass |

## Boundary

`usage-ledger`: a new `internal/usage` package and its tests and testdata,
`internal/service` (one `Usage` method), `internal/cli` (the `usage`
command), `app.go` (one bound method), `frontend/wailsjs` regenerated. Not:
`internal/session`'s record format, `runs.jsonl`'s writer.

`usage-view`: new `Usage.tsx` and `usage.css`, the top bar and the store's
`screen` (one entry), `AgentsView.tsx` (the week line only), `lib/` helpers
and tests, `scripts/fixture-home.sh` (a ledger). Not: Go.

## No-gos

- Off the machine: where the history goes for both laptops (0098) waits on
  Hephaistos's record. Neither card writes to a cloud.
- No price table: cost is what Claude Code reported. Sessions before the
  statusline existed have tokens and no cost.

## Technical notes

- Spec check (spec-craft 5b): every row fails on main (no `usage` command,
  no ledger); G4 is the case Pablo asked about. Inputs in hand: the real
  home's transcripts and records. No row needs Pablo (0095).
- Size: the organizer's project folder alone holds ~40 transcript dirs;
  incremental reading (FR-1) keeps a rescan cheap.

## Cards

| Card | Gate rows | Depends on | ui_review |
|---|---|---|---|
| `usage-ledger` | G1-G5, X0 | — | false |
| `usage-view` | U1-U9, X0 | usage-ledger | true |
