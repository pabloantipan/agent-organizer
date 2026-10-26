# Leftovers 56: every run attributed to an initiative, a task and a role: the build spec

status: proposed (0166)
by: the FSE, 2026-10-26, on main at 5bfad8f
sources: crossing 0022, ruled by Pablo 2026-10-26 in the Themis seat on
lodestar: "0022: frontmatter-fact-ledger, organizer's attribution card
included, no limit on bitácoras or odyssey" (agent-slack
`working-on/decisions/0022-crossing-factory-facts-ledger.md`; hestia 0042);
the FSE's position there, measured on lodestar 2026-10-26: 87% of run cost
($3,043 of $3,487 over 899 runs) names no card. Premises read today.

## Premises (read 2026-10-26 at 5bfad8f)

| Premise | Shown by |
|---|---|
| a session is attributed once, when the ledger first sees it, and that answer is kept: a builder seen before its card names its seat stays without a task | `internal/usage/attribute.go:75-125` ("called once per session … its answer is kept") |
| the FSE, persona, pair and plain session roles get no task by design, and the report counts them apart | `attribute.go:96-125`; `internal/usage/report.go:403` |
| a supervisor's task comes only from cards that name it (`supervisedBy`); a reviewer's from a card's `seat:` (`cardOfSeat`), not its `reviewer:` | `attribute.go:104-123` |
| a session outside every initiative root (Hephaistos, a pair session) has no initiative | `attribute.go:82-90` |
| `organizer runs` matches a run to a card on its own (`session.MatchRun`), not through the usage attribution, so the two can disagree | `internal/session/runs.go:265-280`; `internal/service/run.go` |
| on lodestar: supervisors $516, Aglaea $173, the FSE $154, Hephaistos $120, builders and reviewers about $370 name no card | `organizer runs --json`, 2026-10-26 |

## Requirements

Card `lf56-run-roles` (Go):

- **FR-1** Every attribution has an initiative, a role and a task. A run
  outside every initiative root has initiative `factory`. A run whose role
  works for the initiative and not a card (FSE, persona, pair, plain
  session, a design or architecture seat) has task `overhead:<role>`.
- **FR-2** A supervisor's task comes from, in order: an accept record whose
  `supervisor:` names its session; the cards that name it (as today); a
  single such card gives the card's slug, several give `wave:<seat>`.
- **FR-3** A reviewer's (and a UI reviewer's) task comes from a card whose
  `reviewer:` names its seat, before `seat:`.
- **FR-4** A kept attribution without a card task is attributed again at
  each read until it has one; one with a card task stays as kept. The
  archive is not rewritten.
- **FR-5** `organizer runs` and the app's runs view take their card and
  task from the same attribution as the usage ledger, so a run and its
  usage row never name different tasks.
- **FR-6** The usage report and `organizer runs` show the share of cost
  with an `overhead:` task and the share with none (which FR-1 makes only
  rows with no session at all).

## Acceptance → gate

| # | FR | Check | Expected (fails on main) |
|---|---|---|---|
| A1 | 1 | go test of `Attribute`: an FSE session at the root, a persona, a pair session outside every root, a plain session | `overhead:fse`, `overhead:persona`, initiative `factory` with `overhead:pair`, `overhead:session` |
| A2 | 2 | go test: an accept record with `supervisor: organizer-probe-sup95` and no card naming it; two cards naming a supervisor | the record's cards as the task; `wave:sup95` with both slugs |
| A3 | 3 | go test: a card with `seat: l54-retire` and `reviewer: l54-retire-rev`; the reviewer's session | the card's slug |
| A4 | 4 | go test: a builder seen before its card names it, then the card gains `seat:` | first read no card task, the next read the card's slug; a kept card task does not change |
| A5 | 5 | go test of `runsView` and `organizer runs` over a fixture ledger | each run's card equals its usage row's task |
| A6 | 6 | `organizer runs` and `organizer usage` on lodestar's real archive (read-only, a copy of the data dir) | both print the overhead share and the share with none; the share with none is under 5% of cost |
| X0 | all | `XDG_DATA_HOME=$(mktemp -d) CONTRACTS_DIR=~/agent-slack/specs/contracts make test`, `wails build`, then `git status --porcelain` | pass, empty |

## Boundary

`internal/usage/` (attribute, ledger, report) and its tests,
`internal/session/runs.go` and its test, `internal/service/run.go`
(`runsView`, `InitiativeRuns`) and its test, `internal/cli` (the runs and
usage output) and its tests. Not `internal/service/usagepost.go`
(lf54-usage-rejected's).

## Cards

| Card | Gate rows | Depends on | ui_review |
|---|---|---|---|
| `lf56-run-roles` | A1-A6, X0 | — | false |
