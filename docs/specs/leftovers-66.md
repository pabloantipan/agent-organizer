# Leftovers 66: Go leftovers of today's reviews, then the map regenerated: the build spec

status: proposed (0179)
by: the FSE, 2026-11-02, on main at 902b01a
sources: review findings filed to the FSE (bitácora, day log 2026-11-01/02):
lf62-go's review at 83fe879 (string-literal status comparisons; Accepted
not pruned); sup101 Found 5 and sup103's lf58-map-lens review note 1
(ReadSpec follows symlinks, second sighting); sup109 Found 1 (the review
guard compares paths as text); leftovers-63 Amendment 1 and claudecode
21f4e28 (c4-map's self-stamp fixed, so the map can be regenerated and
stay fresh until the next code commit).

## Premises (read 2026-11-02 at 902b01a)

| Premise | Shown by |
|---|---|
| two Go reads compare a decision status to a string literal, which the G4 literal guard (constants only) does not catch | `internal/service/draft.go:27` (`d.Status == "proposed"`), `internal/cli/decisions.go:116` (`s == "proposed"`); `internal/service/literals_test.go` |
| the usage post state prunes a Rejected key whose ledger row is gone but never an Accepted one | `internal/service/usagepost.go:243` (Rejected), `:208`, `:214` (Accepted only written or deleted on a post) |
| ReadSpec cleans the path text and never evaluates symlinks, so a symlink inside an allowed dir opens a file outside the initiative | `internal/service/spec.go:39-80` (no `EvalSymlinks`), `internal/specpath` |
| the review guard compares resolved paths as text: a case variant or the `/System/Volumes/Data` firmlink form of a dir under the real home passes | `reviewguard.go:84-118` (`resolvePath`, `underDir`); sup109's run record |
| the organizer's map was generated at 8b5c8f9; every code commit since stales `c4-map check` | `docs/architecture/map.json` `inputs`; `c4-map check .` |

## Requirements

Card `lf66-go`:
- **FR-1** `acceptRecord` and `statusWord` read the status through
  `model.DecisionProposed` (or a model helper); the literal guard also
  fails on a decision status compared to a string literal equal to a
  status value, outside `internal/model`.
- **FR-2** A pass of the usage post drops from `Accepted` every key whose
  ledger row is gone, as it does for `Rejected`.
- **FR-3** `ReadSpec` refuses a path whose symlinks, evaluated, leave the
  directory its allow rule admitted it under (specs, a card's spec, run
  records, the map's pages); a symlink resolving inside that directory
  still reads.
- **FR-4** The review guard decides "under the real home" by file
  identity (`os.SameFile` of the home against each existing ancestor of
  the resolved path), so a case variant or a firmlink form refuses too.

Card `lf66-map` (after lf66-go merges; docs only):
- **FR-5** `c4-map gen .` regenerates `docs/architecture/` at the root,
  committed alone, and `c4-map check .` is clean on that commit.

## Acceptance → gate

| # | FR | Check | Expected (fails on main) |
|---|---|---|---|
| G1 | 1 | go test: the literal guard over the Go packages; and over a temp copy with a planted `d.Status == "ruled"` | passes after the change; fails on the plant (main: the plant passes) |
| G2 | 2 | go test of the post state over a fixture ledger with an accepted row then removed | the key is gone from `Accepted` after the next pass |
| G3 | 3 | go test of `ReadSpec` over a temp initiative: a symlink in its specs folder to a file outside the root; a symlink in the specs folder to a file in that folder | the first refused, the second read (main: the first reads) |
| G4 | 4 | go test of the guard decision with an injected home under `$TMPDIR`: the home's path with its case changed, and its `/System/Volumes/Data` form | both refuse (main: both pass) |
| C1 | 5 | `c4-map gen .` then `c4-map check .` at the root, on the map-only commit | exit 0 both |
| C2 | 5 | `diagram-check` over the map's folder | no `ungrounded:` line |
| C3 | 5 | `mermaid2svg <copy> --check` on byte-identical copies of each page | exit 0 |
| X0 | all | lf66-go: `XDG_DATA_HOME=$(mktemp -d) CONTRACTS_DIR=<specs checkout>/contracts make test`, `wails build`, `git status --porcelain`; lf66-map: `git status --porcelain` outside the map's folder | pass, empty |

## Boundary

- `lf66-go`: `internal/service/draft.go`, `internal/cli/decisions.go`,
  `internal/service/literals_test.go`, `internal/service/usagepost.go`,
  `internal/service/spec.go`, `internal/specpath/`, `reviewguard.go`, and
  their tests.
- `lf66-map`: `docs/architecture/` only.

## Cards

| Card | Gate rows | Depends on | ui_review |
|---|---|---|---|
| `lf66-go` | G1-G4, X0 | — | false |
| `lf66-map` | C1-C3, X0 | lf66-go | false |
