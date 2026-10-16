# Leftovers 39: a steady crew test, honest CLI money, a missing spec named, Escape in the harness: the build spec

status: proposed (0143)
by: the FSE, 2026-10-16, on main at d88544d
sources: uc-price's review (`working-on/done/uc-price.md`, `## Review`; sup75,
thread 01M5190P), dg-reader's UI review spec gaps (`working-on/done/dg-reader.md`,
6ef262a) and sup76's close (`runs/2026-10-16-sup76-leftovers-37-diagrams.md`).

## Premises (each read today)

- `TestCrewCmdSkipsRunningSeat` (`internal/cli/crew_test.go`, want list
  :138-143) compares crew's printed lines in exact order; one `make test`
  run lost `qa_cleo running`, and it passed 3 of 3 alone (up-review).
- `organizer usage` text (`internal/cli/usage.go:80-87`) prints
  `money     $0.00; excludes 7 sessions with no cost` when every session
  of the week has no cost (W34, up-review); the view says `—`
  (`unknownMoney`, `lib/usage.ts:77`). `Totals` (`internal/usage/report.go`)
  has no priced share; `totalsNotes` (`lib/usage.ts:243`) names running and
  no-cost sessions only.
- A card's `spec:` is read by its first word (`specRel`,
  `internal/service/spec.go:66`); the scan checks `initiative.yaml`'s
  `specs:` (`resolveSpecs`, `internal/scan/scan.go:275`) but not a card's
  `spec:`. Measured over every initiative on this Mac: 174 cards name a
  relative `.md` spec, 4 of them missing (all in agent-slack, written
  relative to a subfolder).
- `scripts/tab-harness/tabharness.swift:117-119` knows `tab`, `return`
  and the arrows; no `escape` (dg-reader's D7 used a copy).

## Requirements, card `lf39-go-tidy` (Go, one frontend helper, one Swift line)

- **FR-1** `TestCrewCmdSkipsRunningSeat` passes every run: the builder
  finds why a line goes missing and fixes the cause (test or code), not
  the assertion's strictness about which lines are printed.
- **FR-2** When every session of the week has no cost, the text reads
  `money     — (no cost recorded for <n> sessions)`, never `$0.00`.
  `Totals` gains `priced` (dollars from `cost_from: priced` sessions); when
  above 0 the text adds `; $<x> priced` and `totalsNotes` adds `$<x>
  priced`.
- **FR-3** A card whose `spec:` first word (as `specRel` reads it) is a
  relative `.md` path that does not exist under the initiative root is
  one scan Problem on the card: `spec "<path>" names no file`. A first
  word that is not such a path (prose, absolute, another repo) is no
  problem.
- **FR-4** The harness takes `key escape` (key code 53).

## Acceptance → gate

| # | FR | Check | Expected (fails on main) |
|---|---|---|---|
| L1 | 1 | `go test ./internal/cli -run TestCrewCmdSkipsRunningSeat -count=200`, then `make test` three times | all pass; the card's Notes say what made it flaky |
| L2 | 2 | go test of the text with a week of 7 sessions and no cost, and one with a priced session | `— (no cost recorded for 7 sessions)`; `; $x priced` |
| L3 | 2 | vitest `totalsNotes` with `priced: 12.5` | contains `$12.50 priced` |
| L4 | 3 | go test, fixture: a card with `spec: "docs/nope.md (FR-1)"`, one with `spec: "the camp doc"`, one with an existing path | one Problem, on the first card, with the words above |
| L5 | 4 | the harness with a script `key escape` on a page listening for keydown | the page sees `Escape` |
| X0 | all | `XDG_DATA_HOME=$(mktemp -d) make test`, `cd frontend && pnpm run build`, `wails build`, then `git status --porcelain` | pass, empty |

## Boundary

- `lf39-go-tidy`: `internal/cli` (`crew_test.go`, the crew code if the cause
  is there, `usage.go`), `internal/usage/report.go` (`Totals.priced`),
  `internal/scan` (the card spec check) and its fixture under `testdata/`,
  `frontend/src/lib/usage.ts` (`totalsNotes`), `frontend/wailsjs/` as
  regenerated, `scripts/tab-harness/tabharness.swift`, their tests. Not:
  the Usage view's layout, the 4 agent-slack cards (theirs to fix).

## Cards

| Card | Gate rows | Depends on | ui_review |
|---|---|---|---|
| `lf39-go-tidy` | L1 to L5, X0 | — | false |
