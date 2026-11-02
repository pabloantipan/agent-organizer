# Leftovers 68: runs attributes reviewers and supervisors; the literal guard's two gaps: the build spec

status: accepted (0181, ruled 2026-11-02)
by: the FSE, 2026-11-02, on main at 80f5977
sources: sup110's closing report (2026-11-02, Found 1, 2, 4); sup101 Found 1
(runs.jsonl leaves supervised seats with no card), held since 2026-11-01.

## Premises (read 2026-11-02 at 80f5977)

| Premise | Shown by |
|---|---|
| `organizer runs organizer` attributes today's builders (l66-go, l66-map) but lists no row for their reviewers (l66-go-rev, l65-rev) or supervisors (sup109, sup110), all run from the root | `organizer runs organizer --json`; their lines in `~/.local/share/organizer/runs.jsonl` (cwd the root) |
| the runs path matches by directory, branch, then the card's `seat:` only | `internal/session/runs.go:222-280` (`MatchCard`, `MatchRun`), `internal/service/run.go:484` |
| the usage attribution already reads a card's `reviewer:` and a record's `supervisor:` | `internal/usage/attribute.go:14-72` (leftovers-56 Amendment 1) |
| the status-literal guard misses `x == ("ruled")`, and exempts an allowlisted file whole | `internal/service/literals_test.go:160-210`; sup110 Found 1, 2 |

## Requirements

Card `lf68-go`:
- **FR-1** A run whose session's seat is named in one card's `reviewer:`
  list is that card's, as a `seat:` match is (one card, else none).
- **FR-2** A run whose session is named in an accept record's
  `supervisor:` is attributed to that record's task (its `cards:`), shown
  as `task <NNNN>` where a card would be; tokens and cost count once, under
  the task, never spread over its cards.
- **FR-3** `organizer runs` and the app's runs view read FR-1 and FR-2
  through the same reader `internal/usage` uses, so the two agree.
- **FR-4** The guard catches a parenthesised literal (`x == ("ruled")`)
  and allowlists comparisons by function, not by file: a new literal
  comparison in an allowlisted file fails.

## Acceptance → gate

| # | FR | Check | Expected (fails on main) |
|---|---|---|---|
| G1 | 1 | go test of the matcher: a session `<p>-probe-l9-rev` from the root, one card with `reviewer: l9-rev, l9-ui`; two cards naming it | the card; none |
| G2 | 2 | go test over a fixture: a supervisor session named by one ruled record's `supervisor:` | `task NNNN`, its cost once (main: no row) |
| G3 | 3 | go test: runs and usage over the same fixture ledger | the same card or task per session |
| G4 | 4 | go test: the guard over temp copies with a planted `x == ("ruled")` and a planted second literal comparison in `draft.go` | both fail; the tree passes |
| X0 | all | `XDG_DATA_HOME=$(mktemp -d) CONTRACTS_DIR=<specs checkout>/contracts make test`, `wails build`, `git status --porcelain` | pass, empty |

## Boundary

`internal/session/runs.go`, `internal/service/run.go`, `internal/usage/`
(the shared reader, if it moves), `internal/cli/` (the runs printer),
`internal/service/literals_test.go`, and their tests; `frontend/wailsjs`
only if a bound type changes.

## Cards

| Card | Gate rows | Depends on | ui_review |
|---|---|---|---|
| `lf68-go` | G1-G4, X0 | — | false |
