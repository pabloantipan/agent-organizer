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

- Findings from rm-v0 (sup74, thread 01M5119X, 2026-10-15), for the cut of
  v1/v2: (1) the main package's `//go:embed all:frontend/dist` fails in every
  `git archive` export of this repo (dist is ignored), so each review of the
  organizer reports it as a problem though type info resolves: v1 builds a
  stub dist in the export or treats an embed error as known. (2) FR-3's
  `untested` means no direct test reference: `runLaunches` (run via
  `queueLaunch` in launch_test.go) and `crewCmd` (via `runWith` in
  crew_test.go) read untested though tests run them: v2's viewer says `no
  direct test`, or v1 adds reach. (3) v1's reconciliation reuses
  `change-check <initiative> <card> --json` (claudecode 975131b, installed
  as `~/bin/change-check`; Hephaistos, thread 01M50YGJ).
- rm-v0 chose `go/types` (0 M2/M3 misses, 2.3 s on c8e1773, needs only go
  and the module cache); codebase-memory was file level and dropped
  receivers, scip-go missed types and vars (`working-on/done/rm-v0.md`).

## Open questions

- Q1 (v1): answered 2026-10-17, see "v1" below: the branch is pushed and
  `organizer review` runs in the reviewing Mac's clone; no sync path.
- Q2 (v2): Monaco and ELK add weight to the bundle; Aglaea and the size
  budget decide.

## Cards

| Card | Gate rows | Depends on | ui_review |
|---|---|---|---|
| `rm-v0` | M1, M2, M3, M4, M5, M6, X0 | — | false |

Amendment 1, 2026-10-15, the FSE, from rm-build's report via the card
(0d14c8f): M4 asked for a tested and an untested changed function on
*both* merges, but 35671ed has no untested changed definition; a real merge
need not hold both. So:
- **M4** is met when, across the two gate merges, a changed function with a
  test lists `file::TestName` and a changed function without one carries
  `untested`; if neither merge holds an untested one, a small Go repo in
  testdata shows it. A merge with no untested definition says so in the
  evidence, which is itself a check that no false `untested` appears.

## v1: TS, package level, declared changes (cards `rm-v1-ts`, `rm-v1-reconcile`)

status: ruled (0145), by the FSE, 2026-10-17, on main at d0d122a.

### Premises

| Premise | Shown by | Read |
|---|---|---|
| Q1: the branch is pushed and `organizer review` runs in the reviewing Mac's clone; odyssey has go, the initiative repos and mmdc | Pablo on lodestar, "Oddysey is escentially a 'clone' of this laptop", "yes, all installed" (Hephaistos relay, thread 01M55TQT) | 2026-10-17 |
| odyssey's claudecode is at `~/claudecode/personal-cloude`, so no `~/claudecode` path goes into the command | Hephaistos, same thread (a relay: claim) | 2026-10-17 |
| `internal/review` has one `Source`, `GoTypes`; every node is `Level: "symbol"`, `Lang: "go"`; no `~/claudecode` path in the package | `source.go:50`, `:59`; `review.go:274`; grep | 2026-10-17 |
| `Export` is `git archive \| tar`, which leaves out the ignored `frontend/dist`, so the main package's `//go:embed all:frontend/dist` errors in exports | `git.go:96`; sup74's finding (claim, re-read by T5) | 2026-10-17 |
| `change-check … --base --head --json` is on the PATH, finds a `done/` card, and gives `repos[].files[]` (`path`, `status`, `test`, `symbols`) and `flags[]` (`flag`, `repo`, `path`, `symbol`, `detail`) with the words `undeclared`, `outside footprint`, `declared, not changed` | run on lf40-verb-fit 29aa20f..608880e: three flags | 2026-10-17 |
| two of those flag kinds can be false (CSS custom properties; footprint written with words) | sup79's close (claim) | 2026-10-17 |
| `typescript` is in `frontend/node_modules`; node v22.15.0 on the PATH | `ls`, `node -v` | 2026-10-17 |
| the schema's `level` is `symbol` or `package`; flags `undeclared`, `declared_not_changed`, `outside_footprint`; mismatches `{type, node}` with `changed_not_declared` | `pipeline-starter.md` §6.6.3, lines 383-431 | 2026-10-17 |

### Requirements

Card `rm-v1-ts` (Go):

- **FR-7** TS and TSX files (not `.d.ts`, not `frontend/wailsjs`) get
  symbol nodes as Go does (FR-2, FR-3): changed exported and top-level
  functions, components, consts and types, their 1-hop callers and callees
  inside the same repo, and the tests that reference them (`*.test.ts(x)`,
  as `file::<describe or it name>`), `lang: "ts"`. The source is chosen by
  measurement as FR-5 was (candidates: the TypeScript compiler API run by
  node from the reviewed repo's own `node_modules`; tree-sitter; a light
  parser), recorded in the card's Notes, behind `Source`.
- **FR-8** Every symbol node's `parent` is a `package` node (Go: the import
  path; TS: the file's directory under `src`), emitted once with `change`
  `modified` when any child changed, else `affected`; package-to-package
  `uses` edges summarise the symbol edges.
- **FR-9** The export gets what an ignored embed needs: when a Go package
  fails only on a `//go:embed` pattern that matches nothing in the export,
  the build writes an empty placeholder for that pattern inside the export
  (never in the repo) and retries; the summary says `embed <pattern>:
  placeholder` once.
- **FR-10** No path is written in: a tool is found on the PATH or in the
  reviewed repo (`node_modules/.bin`), and a missing one is named by
  `organizer review` and `organizer doctor`, as FR-5.

Card `rm-v1-reconcile` (Go, depends on `rm-v1-ts`):

- **FR-11** With a card (the target is a slug, or `--card <slug>` with a
  sha) `organizer review` runs `change-check <initiative> <card> --base
  <base> --head <head> --json` and maps its flags onto the map, word for
  word: `undeclared` → node flag `undeclared` and mismatch
  `changed_not_declared`; `declared, not changed` → `declared_not_changed`
  and mismatch `declared_not_changed` on the node it names, or a node-less
  mismatch when none matches; `outside footprint` → `outside_footprint`. A
  flag on a file with no node lands on a file-level mismatch. The map adds
  no flag change-check did not give (FR-6).
- **FR-12** No card, or `change-check` missing or failing: the map is
  written without reconciliation and the summary says why in one line; exit
  0. The summary counts each mismatch type.

### Acceptance → gate

| # | FR | Check | Expected (fails on main) |
|---|---|---|---|
| T1 | 7 | `organizer review organizer 35671ed --json` in a clean clone (lf33, Go and frontend); the builder's hand list of every TS definition a hunk touches, committed first | every hand-listed TS definition present with the right `change` and `lang: "ts"`; none not on the list |
| T2 | 7 | for 35671ed, three changed TS functions or components; callers by `grep` written by hand | each caller `affected` with a `uses` edge; no edge the hand check cannot confirm |
| T3 | 7 | for 35671ed: a changed TS symbol a vitest names, and one none does | the first lists `file::<name>`; the second `untested` |
| T4 | 8 | 35671ed and c8e1773 | every symbol node's `parent` is a `package` node present in `nodes`; package `uses` edges exist only where a symbol edge does |
| T5 | 9 | `organizer review organizer c8e1773` | no embed problem; `embed all:frontend/dist: placeholder` once; `git status --porcelain` empty in the repo |
| T6 | 5, 10 | the card's Notes; `PATH=` without node, `organizer review organizer 35671ed` | the comparison table with the source chosen and why; the run names what is missing and still writes the Go nodes |
| R1 | 11 | `organizer review organizer 43c61fc --card lf40-verb-fit --json` | its three change-check flags appear: `outside_footprint` on the test file, `undeclared` on `shell.css` (file level), `declared_not_changed` for `.ib-row` as a node-less mismatch; nothing else flagged |
| R2 | 11 | go test with a fake `change-check` on the PATH printing one flag of each kind on symbols that have nodes | each flag and mismatch on its node, word for word |
| R3 | 12 | no card; `PATH` without change-check; a fake one exiting 1 | the map written, one line saying why, exit 0 |
| X0 | all | `XDG_DATA_HOME=$(mktemp -d) make test`, `cd frontend && pnpm run build`, `wails build`, then `git status --porcelain` | pass, empty |

### Boundary

- `rm-v1-ts`: `internal/review` (a TS source behind `Source`, the package
  level, the embed placeholder), `internal/cli` (`review.go`, and `doctor`'s line in
  `cli.go`), a node helper script under `internal/review` if the
  compiler API wins, `go.mod`/`go.sum`, their tests and testdata.
- `rm-v1-reconcile`: `internal/review` (the change-check call and mapping),
  `internal/cli` (`--card`), their tests and testdata.
- Not: the frontend's code (it is only read), `change-check` itself (its two
  false flags go to Hephaistos, sent 2026-10-17), `internal/service` beyond
  the scan, any other repo, CI, a viewer.

### No-gos

- No `~/claudecode` or other absolute tool path. No network. No writes to
  the reviewed repo. No reach (`no direct test`) yet: v2's viewer words it.

### Cards

| Card | Gate rows | Depends on | ui_review |
|---|---|---|---|
| `rm-v1-ts` | T1, T2, T3, T4, T5, T6, X0 | — | false |
| `rm-v1-reconcile` | R1, R2, R3, X0 | `rm-v1-ts` | false |

## v2: the Review view (cards `rv-data`, `rv-list`, `rv-symbol`)

status: ruled (0146), by the FSE, 2026-10-17, on main at c88c071.
sources: Aglaea's design `docs/ux/specs/review-view.md` (3425cb3, §1-§6,
acceptance R1-R12; thread 01M5657Q), answering Q2: no React Flow, ELK or
Monaco in v2. Its rows are the gate rows below, each named `V-R<n>`.

### Premises

| Premise | Shown by | Read |
|---|---|---|
| `organizer review` resolves a card by its `branch:` in `refs/heads` only; a card whose branch is gone is Missing | `internal/review/resolve.go:44` (`CardRanges`) | 2026-10-17 |
| supervisors delete a card's branch after merging, and every merge on main's first parent has the subject `merge: <slug> (…)` (119 of them) | `git log --first-parent main`; sup79, sup80 closing reports | 2026-10-17 |
| the map has `nodes` (`id`, `parent`, `kind`, `lang`, `file`, `range_head`, `range_base`, `change`, `risk`, `evidence.tests`, `claim`, `flags`, `review`), `edges`, `mismatches`, `reconciled`, `reconciliation`, `problems`, `notes`, `stats` | `internal/review/review.go:18-90` | 2026-10-17 |
| the CLI builds the map in process (`review.Build`, temp work dir under `review.DataDir()`); nothing in `internal/service` calls it | `internal/cli/review.go:47-81`; grep | 2026-10-17 |
| screens are `home`, `initiative`, `settings`, `usage`, `initiatives`; the card back is `CardDrawer` with sections Next action, Repos, Actions, Discuss, Path, Spec; `readOnlyOf` marks another machine's card | `stores/board.store.ts:15`; `components/CardDrawer.tsx:80-175` | 2026-10-17 |
| the ruler is the cell's human, else pablo (`ruler`) | `internal/service/rule.go:87` | 2026-10-17 |
| `scripts/fixture-home.sh` makes the fixture's init-a a git repo with two commits, in a temp copy | its header | 2026-10-17 |
| the bundle has no React Flow, ELK or Monaco today | `frontend/package.json`, grep | 2026-10-17 |

### Requirements

Card `rv-data` (Go):

- **FR-13** A card resolves to a change: its branch when the branch exists
  (FR-1), else the newest commit on main's first parent whose subject
  starts `merge: <slug> ` or `merge: <slug>(`, reviewed as a commit
  (`<sha>^1`). The CLI and the app use the same resolution. A card with
  neither is Missing with both named.
- **FR-14** Bound reads, local cards only (another machine's card is
  refused): the card's review status (`none`, the map for the resolved
  head, or a map whose head is not the branch's current one, with both
  shas); the map; and a file's text at a sha for one range (`git show`,
  read only, the range plus 3 lines each side).
- **FR-15** A bound make runs the same build as `organizer review
  <initiative> <card> --json` with reconciliation (FR-11), in the
  background, with elapsed seconds and a Stop that kills it; one make per
  card at a time; a failure returns the first error line and the command.
- **FR-16** Marks: a bound write keeps `{symbol id, state (reviewed |
  question | blocked), note, by, at, head-text hash}` in
  `<data>/review/<initiative>/<head>/state.json`, never in the repo or
  Firestore; `by` is the ruler. Question and blocked refuse an empty note.
  Reading a new head's marks carries each mark of the previous head for
  this card whose symbol's head text hashes the same, and reports the
  others as `changed since you reviewed`.
- **FR-17** `scripts/fixture-home.sh --review` adds to init-a a card with a
  branch whose change touches one Go and one TS file, holds one symbol
  with a test and one undeclared, and a second commit on that branch for
  the moved-branch state. Never under `testdata/` on disk at test time but
  in the temp copy.

Card `rv-list` (frontend, after `rv-data`): the screen, the header and the
worklist (design §2, §3.1, §3.2, §3.4, §4, §5).

- **FR-18** The card back's `Review` section and button, the `review`
  screen with its crumb, `← Card` and Esc, the place in the store
  (initiative, card, head, symbol); the header's counts, coverage, `Next
  to review`, `N` / `Shift+N`, the partial lines (from `reconciled`,
  `reconciliation` and `problems`); the worklist's groups, order, rows and
  names as one roving stop; the widths; every §4 state's words.

Card `rv-symbol` (frontend, after `rv-list`): the panel (design §3.3, §5).

- **FR-19** The title, the scoped diff with sign gutters as a named scroll
  stop, flags in the design's words, Tests, Called by / Calls with the
  read-only affected view and `← back`, `The builder says`, and the mark
  with `Reviewed, next` and `Save` and the v3 line.

### Acceptance → gate

Harness rows run in the Tab harness's own hidden window on `fixture-home.sh
--review`, never on Pablo's screen; no row starts a seat or writes the
clipboard (0095, 0108). `Copy the command` is checked by the label and a
stubbed clipboard in vitest only.

| # | FR | Check | Expected (fails on main) |
|---|---|---|---|
| D1 | 13 | `organizer review organizer lf40-verb-fit --json` (branch gone, merged at 43c61fc) | `head` 43c61fc, `base` its first parent; a slug with neither branch nor merge exits 2 naming both |
| D2 | 14, 15 | go test: status for a card with no map, with a map, after the branch moves; make twice at once; Stop | `none`, the map, moved with both shas; the second make refused; Stop leaves no map and no work dir |
| D3 | 14 | go test: a range read at base and head; another machine's card; a path outside the repo | the lines with 3 of context; both refused |
| D4 | 16 | go test: marks written, an empty note on question, a remap with one symbol's text unchanged and one changed | the file under the data dir only; refused; one carried, one `changed since you reviewed` |
| D5 | 17 | `fixture-home.sh --review` then `organizer review init-a <card> --json` | one Go and one TS changed symbol, one `undeclared`, one with a test; `git status` of the repo clean |
| V-R1 | 18 | harness: the fixture card's back; a card without branch or merge; Esc in the view | `Review the change`; no Review section; back on the card, focus on the button |
| V-R2 | 18 | harness, fixture map | `Reviewed 0 of n · 1 must-visit left` |
| V-R3 | 18 | harness: `N` from the top, then `Shift+N` | Must visit first, then packages by size, flagged first; back one |
| V-R9 | 18 | harness with change-check off the PATH, make the map | `Not checked against the card's declared changes: …` |
| V-R11 | 18 | harness at 1024×640 and 1440×900 | list 280 / 300 px; facts under / beside the diff; page `scrollWidth` equals its width |
| V-S | 18 | vitest of each §4 state's words (no map, making with counter and Stop, failed, moved, nothing at symbol level, all reviewed) | the design's words exactly |
| V-R4 | 19 | harness: a modified symbol | only its base and head ranges, 3 lines of context, `+` / `−` gutters; the diff is a Tab stop named `<symbol>, diff` |
| V-R5 | 19 | vitest and harness | `no direct test` for untested; `not in the card's declared changes` amber (computed colour `--warning`) |
| V-R6 | 19 | harness: Called by → an affected symbol → `← back` | read-only with `unchanged · shown because it calls …`, no diff, no mark; back on the changed one |
| V-R7 | 19 | vitest with a fixture node carrying a claim | the claim under `The builder says` in a blockquote |
| V-R8 | 19 | harness: `Reviewed, next`; Question with no note | the count rises by one, focus on the next symbol's h2; the button disabled until a note |
| V-R10 | 16, 19 | harness: mark two, move the fixture branch (its second commit), `Make it again` | the unchanged one keeps its mark; the other reads `changed since you reviewed` |
| V-R12 | 18, 19 | `frontend/package.json` and the built bundle | no `reactflow`, `@xyflow`, `elkjs`, `monaco` |
| X0 | all | `XDG_DATA_HOME=$(mktemp -d) make test`, `cd frontend && pnpm run build`, `wails build`, then `git status --porcelain` | pass, empty |

### Boundary

- `rv-data`: `internal/review` (FR-13, marks), `internal/service` (one
  file for the review reads, make and marks), `app.go` (the bound
  methods), `wails generate module` output, `internal/cli/review.go` and
  `internal/cli/review_test.go`, `scripts/fixture-home.sh`, their tests:
  `internal/review/*_test.go`, `internal/service/review_test.go`.
- `rv-list`: a new `components/Review.tsx` and `Review.test.tsx`, a
  `lib/review.ts` and `lib/review.test.ts` (groups, order, counts, words),
  `styles/review.css`, `CardDrawer.tsx` (the section), `stores/board.store.ts`
  (the screen and place), `App.tsx` (mounting the screen), the crumbs.
- `rv-symbol`: `components/ReviewSymbol.tsx` and `ReviewSymbol.test.tsx`,
  `lib/review.ts` and its test, `styles/review.css`, `Review.tsx` only to
  mount the panel.
- Not: the graph, Monaco, syntax colour, Needs me, Home, Work, Firestore,
  posting a thread (v3), `change-check`.

### No-gos

- No write to the reviewed repo. No mark in a card file. No network. No
  new dependency over 50 kB gzipped without a note in the card.

### Cards

| Card | Gate rows | Depends on | ui_review |
|---|---|---|---|
| `rv-data` | D1, D2, D3, D4, D5, X0 | — | false |
| `rv-list` | V-R1, V-R2, V-R3, V-R9, V-R11, V-S, V-R12, X0 | `rv-data` | true |
| `rv-symbol` | V-R4, V-R5, V-R6, V-R7, V-R8, V-R10, V-R12, X0 | `rv-list` | true |

Amendment 1 (v2), 2026-10-18, the FSE, from rd-build via sup81 (thread
01M56G76): the premise "`readOnlyOf` marks another machine's card" is false.
`readOnlyOf` (`lib/queue.ts:57`) is the asleep/archived word of an inactive
initiative; another machine's card is `c.local === false`
(`CardDrawer.tsx:98`, `:128`, "Actions work only on the local machine"),
re-read today. So:
- **FR-14 / FR-18** "another machine's card" means `!c.local`: the card back
  draws no Review section for it, and the bound reads refuse it (as built).
  `readOnlyOf` is not consulted: an asleep or archived initiative's local
  card is reviewable, since marks live in the data dir, not the repo.

Amendment 2 (v2), 2026-10-18, the FSE, from rv-list's UI review (rl-ui,
62d9133, U1, U2, G1): the design does not say where focus lands on open,
nor the crumb's width at 1024. Both are severity 2 and sit in files
rv-symbol already touches or is next to, so they join `rv-symbol`:
- **FR-20** (U1) On open, focus goes to the screen's first target: the
  worklist's stop when a map is shown, `Make the map` when there is none,
  else `← Card`. Never the page body (`docs/design-system.md`, Focus and
  names).
- **FR-21** (U2) The crumb's card title shrink-wraps (no fixed basis,
  `min-width: 0`, at most 32ch) so it is cut only when the bar is full, and
  at 1024×640 with the memory badge shown it keeps at least 20 characters.
- **V-F1** (20) harness: open the screen with a map, and with none |
  `document.activeElement` is the worklist stop, then `Make the map`.
- **V-F2** (21) harness at 1024×640 and 1440×900, the fixture card | at 1024
  the title shows ≥ 20 characters; at 1440 no gap over 8 px between the
  title and `› Review`.
- `rv-symbol`'s gate adds V-F1 and V-F2; its boundary adds
  `components/TopBar.tsx` (the crumb only) and `Review.tsx` for the focus on
  open. U3 (severity 1, the flags' wrap) and G2/G3 are held.

Amendment 3 (v2), 2026-10-18, the FSE, from Aglaea's review-view Amendment 1
(9d1c848, A1, A2, R13, R14), answering rv-list's UI review. Both join
`rv-symbol` (its files `lib/review.ts` and `Review.tsx` hold them):
- **FR-22** (A1) A TS row's qualifier is its file stem; a stem `index`
  takes its folder's name; two rows in one group that would read the same
  both carry their parent folder. The row's description carries the full
  path.
- **FR-23** (A2) A make's progress line (`Making the map · n s`, `Stop`)
  shows only after 1 s; before it, only the button reads `Making the map…`
  with focus kept. Focus does not move to Stop when it appears.
- **V-R13** (22) vitest of the qualifier: `lib/index.ts` → `lib.<name>`;
  two `format.ts` in one group → both `<folder>/format.<name>`.
- **V-R14** (23) vitest with fake timers: a make ending at 900 ms never
  renders the counter or Stop; one at 1500 ms does, focus unmoved.
- **FR-21** also: the crumb's card title carries the full title in its
  accessible name (Aglaea, same amendment); V-F2 checks it.
- `rv-symbol`'s gate adds V-R13 and V-R14.

Amendment 4 (v2), 2026-10-18, the FSE, from sup81 before rv-symbol's launch
(thread 01M56JJC): V-R6 needs an affected symbol, and the `--review`
fixture's map has none (4 nodes, 0 edges). So `rv-symbol`'s boundary adds
`scripts/fixture-home.sh`, its `--review` branch only: an unchanged
function on the fixture branch that calls `svc.Greet`, so the map holds an
affected caller with a `uses` edge. No claim (v1 fills none; V-R7 stays
vitest). D5's expectations still hold.

Amendment 5 (v2), 2026-10-18, the FSE, from rs-build's `decide:` (00b8b25):
FR-21's "at least 20 characters at 1024 with the memory badge" cannot hold
inside the crumb: at 1024 with the critical badge (134 px) the bar is full
and the crumbs get 152 px. Taking width from the rest of the top bar is a
change of its own, not this card's. So:
- **FR-21** the title shrink-wraps and is cut only when the bar is full; it
  carries the full title in its accessible name and its hover title. No
  character floor at 1024.
- **V-F2** at 1440×900: no gap over 8 px between the title and `› Review`,
  and the full title shown; at 1024×640: the accessible name is the full
  title, and the crumb never overlaps the bar's other items. The top bar's
  width budget at 1024 is held for a later card.
