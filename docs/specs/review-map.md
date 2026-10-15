# Review map: Pablo reviews an agent branch from Deltagos: the spec

status: proposed (0137)
by: the FSE, 2026-10-15, on main at be39970
sources: agent-slack `docs/decisions.md` 2026-10-15 "the organizer FSE builds
the review tooling" (Pablo, Hephaistos session on lodestar: "We need going on
building up tooling for reviwing stuff. What FSE should take it?", then "do");
relayed in organizer thread 01M50YGJ. Doctrine, read not restated:
`~/agent-slack/docs/review/manifesto.md` (non-negotiables 4, 5, 7),
`pipeline-starter.md` §6.6 (the Review Map, `revmap.json` v0 schema, build
order v0-v3, viewer), `profiles.md` (organizer is profile L: no CI, the
reviewer re-runs from a clean clone), `todo.md` T15b, T15c. Pablo's framing:
pilot repo organizer; on lodestar he reads no diffs; on odyssey
"initiatives are big, and we need start reading stuff. Or more thant
reading, being able to do reviews".

## Problem and appetite

Pablo, on odyssey, cannot review what agents built on another initiative's
branch: today he gets a card's `## Review` text and a diff he does not read.
He needs to walk the change (which symbols moved, who calls them, which tests
reach them), mark what he looked at, and send a question to the builder's
supervisor from the place he saw it. Appetite: four small tasks, one per
build step (v0-v3), each a wave of one or two cards; only v0 is carded now.

## Goals

- From a card or a merge, the organizer emits the change as `revmap.json`
  (§6.3 schema, v0 fields) with facts only: changed symbols, their 1-hop
  callers and callees, the tests that reference them.
- It reaches odyssey with the app: an `organizer` subcommand, no separate
  install (CLAUDE.md: the CLI stays `organizer`; §6.6's `deltagos review` is
  `organizer review`).
- Later steps: TS and declared-change reconciliation (v1), the Review view
  (v2), states that post back as threads (v3, T15c).

## Non-goals (this spec's v0)

- No viewer, no HTML, no review state, no TS, no reconciliation with
  `## Declared changes`, no evidence overlay (mutants, fitness, findings).
- Not a CI job (profile L). Not a reimplementation of `change-check`
  (Hephaistos's; v1 reads its `--json`).

## Requirements, v0 (card `rm-v0`)

- **FR-1** `organizer review <initiative> <card-slug | sha> [--json] [--out
  path]` resolves base and head: a card's branch against main's merge base,
  or a merge commit against its first parent (`<sha>^1`). It reads the
  initiative's repos from the scan (`repos:` on the card, else the root).
- **FR-2** For Go files only, it finds the changed definitions (function,
  method, type) by mapping `git diff -U0 base...head` hunks to their
  enclosing definition in head (added, modified) and base (deleted), and
  expands one hop: callers (definitions in head whose body references a
  changed one) and callees (definitions a changed body references), marked
  `affected`.
- **FR-3** Each node lists the tests that reference it (references from
  `_test.go` files, as `file::TestName`); a changed node with none carries
  the `untested` flag.
- **FR-4** It writes `revmap.json` per §6.6.3 v0 (`version`, `base`, `head`,
  `nodes` with `id`, `level`, `parent`, `kind`, `lang`, `file`,
  `range_head`, `range_base`, `change`, `evidence.tests`, `flags`,
  `review.state: "unreviewed"`; `edges` of kind `uses` with `source`;
  `stats`). Fields v0 cannot fill (`risk`, `claim`, `mismatches`) are
  present and empty, never guessed. Default path
  `~/.local/share/organizer/review/<initiative>/<head-sha>/revmap.json`;
  without `--json` it prints a summary (changed, affected, untested, top
  changed symbols by caller count).
- **FR-5** The index source is chosen inside the card by measurement, not
  taste (T15b: "try the codebase-memory index before SCIP"). Candidates:
  the codebase-memory index (`detect_changes`, `trace_path`; the
  organizer is not indexed today), `scip-go`, and `golang.org/x/tools/go/packages`
  with `go/types` in process. The constraint that decides: it runs on
  odyssey from the installed app against another initiative's repo, so a
  source that needs a tool not shipped with the app is acceptable only if
  `organizer doctor` names it and `organizer review` says how to get it. The
  builder records the comparison in the card's Notes (precision on the two
  gate merges, time, what must be installed) and implements one behind a
  small interface, so v1 can add another.
- **FR-6** Rules (§6.6.5): no node or edge that the index did not produce.

## Acceptance → gate

| # | FR | Check | Expected (fails on main) |
|---|---|---|---|
| M1 | 1, 4 | `organizer review organizer 35671ed --json` (lf33, Go and frontend) and `organizer review organizer c8e1773 --json` (lf30-launch-go, 6 Go files) in a clean clone | valid JSON per FR-4; `base` is the first parent, `head` the merge; no node from a non-Go file |
| M2 | 2 | for c8e1773, compare the changed nodes against a hand list the builder writes first from `git diff` (every Go definition whose body a hunk touches), committed beside the evidence | every hand-listed definition present with the right `change`; no changed node that is not on the list |
| M3 | 2 | for c8e1773, pick three changed functions; their callers per `grep`/`gopls references` written by hand | each caller present as `affected` with a `uses` edge; no edge the hand check cannot confirm |
| M4 | 3 | for both merges: a changed function with a test that calls it, and one without | the first lists `file::TestName`; the second has `untested` |
| M5 | 5 | the card's Notes: the comparison table (source, M2/M3 misses, wall time on c8e1773, install needed on odyssey) | present; the chosen source named with why |
| M6 | 1 | `organizer review organizer <a card slug whose branch exists>`; and a card with no branch | the first resolves base/head from the branch; the second exits 2 naming what is missing |
| X0 | all | `XDG_DATA_HOME=$(mktemp -d) make test`, `cd frontend && pnpm run build`, `wails build`, then `git status --porcelain` | pass, empty |

## Boundary

- `rm-v0`: a new package `internal/review` (base/head resolution, hunk to
  definition, one-hop expansion, tests, the JSON), `internal/cli` (the
  `review` subcommand, `doctor`'s line if a tool is needed), `main.go` only
  to register the subcommand, `go.mod`/`go.sum` if the chosen source is a Go
  library, their tests and testdata. Not: the frontend, `internal/service`
  beyond reading the scan, any other repo, CI.

## No-gos

- No invented node, edge, risk or claim. No network. No writes to the
  reviewed repo (worktrees for base/head go under the organizer's data dir
  and are removed after). No new bound Wails method in v0.

## Later steps (rough, cut when the step before lands)

- **v1**: TS (the frontend) and package level; reconcile the card's
  `## Declared changes` and footprint through `change-check --json`
  (Hephaistos's, claudecode `feat/evidence-review-rules` until it merges):
  `undeclared`, `declared_not_changed`, `outside_footprint`.
- **v2**: the Review view in Deltagos (React Flow + ELK, per-symbol Monaco
  diff, reviewed / questioned / blocked with a note, high-risk coverage %),
  opened from a card. Needs Aglaea's design first.
- **v3** (T15c): a question or block on a node posts a thread to the card's
  supervisor (or the FSE when none runs), so Pablo reviews, not only reads;
  coverage as merge evidence on the card.

## Open questions

- Q1 (v1): where `revmap.json` lives for another Mac's branch (odyssey
  reviewing a lodestar initiative): pushed branch and a local clone, or
  computed where the branch is and synced. Raised as its own record when v1
  is cut.
- Q2 (v2): Monaco and ELK add weight to the bundle; Aglaea and the size
  budget decide.

## Cards

| Card | Gate rows | Depends on | ui_review |
|---|---|---|---|
| `rm-v0` | M1, M2, M3, M4, M5, M6, X0 | — | false |
