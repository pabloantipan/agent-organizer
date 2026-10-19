# Leftovers 45: every merged card resolves, and a multi-repo card is checked repo by repo: the build spec

status: proposed (0153)
by: the FSE, 2026-10-18, on main at e615854
sources: Pablo's "Are revision tools ready?" (this session, 2026-10-18
~23:30), answered by a check that found the merge-subject gap; Hephaistos's
`change-check --repo` (claudecode 9837301, thread 01M58S7R).

## Premises (read 2026-10-18 at e615854)

| Premise | Shown by |
|---|---|
| a gone branch resolves only to a first-parent merge whose subject starts `merge: <slug> ` or `merge: <slug>(` | `internal/review/resolve.go:92-105`, the refusal at `:88` |
| of 131 first-parent merges on main, 115 put a space after the slug, 14 a comma (`merge: lf44-ask-survives, an ask …`, lf41 to lf44 among them), 2 a `/`; `organizer review organizer lf44-ask-survives` and `lf43-review-states` exit naming no merge | `git log --first-parent --format=%s main`; run today |
| `Make` runs change-check once with the first range's base and head (`rm.Base`, `rm.Head` are the first range's, `review.go:104-105`) and the root as dir | `internal/review/resolve.go:172`; `internal/review/review.go:104-105` |
| a range carries its repo's `Name` ("" for the root); a change-check flag carries `repo` | `internal/review/git.go:23-30`; `internal/review/reconcile.go:25-31` |
| change-check takes `--repo <name>`; without it, it checks each repo with its own base and head | `change-check --help`; Hephaistos, thread 01M58S7R |

## Requirements, card `lf45-review-resolve` (Go)

- **FR-1** A gone branch resolves to the newest first-parent merge whose
  subject is `merge: <slug>` followed by the end or any character that
  cannot be in a slug (not `a-z`, `0-9`, `-`). `merge: lf44-ask-survives,
  …` resolves; `merge: lf44-ask-survives-2 …` does not resolve
  `lf44-ask-survives`. The refusal names the pattern in those words.
- **FR-2** A card with more than one range runs change-check once per
  range: `--repo <name> --base <its base> --head <its head>`; the flags are
  joined, and each applies only to nodes of its repo. One failing repo
  leaves `reconciliation` naming that repo and the error, and the others'
  flags still apply; `reconciled` is true only when every repo checked.
  A one-range card runs as today.

## Acceptance → gate

| # | FR | Check | Expected (fails on main) |
|---|---|---|---|
| M1 | 1 | `organizer review organizer lf44-ask-survives --json`; go test with subjects `merge: x, y`, `merge: x/y`, `merge: x`, `merge: x-2 y` for slug `x` | head 5164ee4, base its first parent; the first three resolve, the last does not |
| M2 | 2 | go test with a two-repo temp card and a stub change-check on the PATH that records its arguments and fails for one repo | two calls with each repo's `--repo`, base and head; the other repo's flags applied to its nodes only; `reconciled` false, `reconciliation` names the failing repo |
| X0 | all | `XDG_DATA_HOME=$(mktemp -d) make test`, `wails build`, then `git status --porcelain` | pass, empty |

## Boundary

- `internal/review/resolve.go`, `internal/review/reconcile.go`, their
  tests (`internal/review/*_test.go`). Not the frontend, not the CLI's
  text beyond the refusal.

## Cards

| Card | Gate rows | Depends on | ui_review |
|---|---|---|---|
| `lf45-review-resolve` | M1, M2, X0 | — | false |
