---
title: "A merged card resolves to its merge, and the app can read, make and mark a review map"
status: done
repos: [organizer]
branch: rv-data
seat: rd-build
stage: review-map
updated: 2026-10-18
next: "review: rv-data, gate met (D1-D5, X0), 5e66aa9"
review: pass
risk: medium
footprint: [internal/review/resolve.go, internal/review/marks.go, internal/review/*_test.go, internal/service/review.go, internal/service/review_test.go, app.go, frontend/wailsjs/*, internal/cli/review.go, internal/cli/review_test.go, scripts/fixture-home.sh]
depends_on: []
boundary: ["docs/specs/review-map.md v2 Boundary, rv-data"]
spec: "docs/specs/review-map.md (v2, FR-13 to FR-17; docs/ux/specs/review-view.md)"
gate: "docs/specs/review-map.md v2 Acceptance, rows D1 to D5 and X0"
ui_review: false
---

## Goal
The Review view has everything it reads and writes, and a fixture card to show it on.

## Gate
docs/specs/review-map.md v2, rows D1 to D5 and X0.
- [x] D1: `.wt-notes/rd-build/d1.txt` (lf40-verb-fit head 43c61fc, base its first parent f4fd863; rv-list exits 2 naming branch and merge)
- [x] D2: `.wt-notes/rd-build/d2-d4-gotest.txt` (TestReviewStatusMakeMoved, TestReviewMakeOnceAndStop, TestReviewMakeFails)
- [x] D3: `.wt-notes/rd-build/d2-d4-gotest.txt` (TestReviewFile, TestReadRange)
- [x] D4: `.wt-notes/rd-build/d2-d4-gotest.txt` (TestReviewMarksAcrossRemap, TestMarksCarryAcrossRemap)
- [x] D5: `.wt-notes/rd-build/d5.txt`, `d5-map.json`
- [x] X0: `.wt-notes/rd-build/x0-make-test.txt`, `x0-pnpm-build.txt`, `x0-wails-build.txt`, `x0-porcelain.txt` (clean clone of 5e66aa9)

## Done
- 2026-10-18 rd-build: FR-13 to FR-17 on branch `rv-data` (5cb7d2d..5e66aa9, unmerged, rebased on main e42ebf5); gate met in a clean clone; progress and reproduction in `.wt-notes/rd-build/progress.md`

## Notes
- Bindings for rv-list and rv-symbol (`frontend/wailsjs/go/main/App`, types in `models.ts`), all arguments strings unless said:
  - `ReviewStatus(initiative, card)` → `service.ReviewStatus {initiative, card, state: "none"|"map"|"moved"|"missing", head, base, from, map_head, map_path, reason, make: ReviewMake|null}`; `head`/`base` are the card's change now, `map_head` the map shown (moved: the older one), `reason` names branch and merge when missing.
  - `ReviewMap(initiative, card, head)` → `review.RevMap` (revmap.json as written); `head` "" is the current head; an older head reads the moved map.
  - `ReviewFile(initiative, card, sha, file, from: number, to: number)` → `review.Text {path, sha, first, lines[], total}`: lines `from-3..to+3` clipped, `first` the 1-based number of `lines[0]`; `file` as the map writes it.
  - `MakeReview(initiative, card)` → `service.ReviewMake {initiative, card, state: "making"|"done"|"failed"|"stopped", started (RFC3339), elapsed (s), head, error, command}` as it starts; a second one while making is an error. Its end is the Wails event `review:make` with the ReviewMake. The counter: `elapsed` from `ReviewMakeState`/`ReviewStatus.make`, or count from `started`. `command` is `organizer review <id> <card> --json` (Copy the command); `error` the first stderr line.
  - `StopReview(initiative, card)` → ReviewMake (`stopped`); no map, no work dir. `ReviewMakeState(initiative, card)` → ReviewMake or null.
  - `ReviewMarks(initiative, card, head)` → `review.Marks {initiative, card, head, marks: Mark[], changed: Mark[], from}`; `Mark {symbol, state, note, by, at, hash, from}`; `changed` are the previous head's marks that read `changed since you reviewed` (no mark).
  - `MarkReview(initiative, card, head, symbol, state, note)` → Marks; state `reviewed|question|blocked`, `""` clears; question/blocked with an empty note is an error; only changed symbols (not packages, not affected).
- Every call refuses a card that is not in this machine's scan ("card X of Y is on <machine>, not this machine; review it there").
- Premise `readOnlyOf marks another machine's card` is false (`lib/queue.ts:57` is a sleeping initiative); not relied on by this card; rv-list should not use it for that.
- Make passes change-check the scanned root, not the id (its id lookup walks ~ and missed fixtures and clones).
- change-check on 5e66aa9: undeclared 0, declared-not-changed 0; `outside boundary` 14 are every file, because the card's `boundary:` entry ("docs/specs/review-map.md v2 Boundary, rv-data") does not parse ("no section 'v2 Boundary'": the spec's heading is `### Boundary` under `## v2`); all 14 are in the spec's rv-data Boundary. `outside footprint` 1 is `internal/review/git.go:Export`, the race fix, inside the Boundary's `internal/review`. The 31 `untested?` are helpers reached through tested callers.
- Fixture: `eval "$(scripts/fixture-home.sh --review)"` exports `FIXTURE_REVIEW_CARD=rv-fixture` and `FIXTURE_REVIEW_MOVE` (moves the branch to its second commit).

## Declared changes
- modified `internal/review/resolve.go`: CardRanges falls back to the card's merge on main (mergeOf); Resolve and Make shared by the CLI and the app; change-check gets the root
- added `internal/review/resolve_test.go`: D1 at package level
- added `internal/review/marks.go`: marks per head, carry by hash, ReadRange, SymbolText
- added `internal/review/marks_test.go`: D3, D4 at package level
- modified `internal/review/git.go:Export`: one stderr buffer per process (data race)
- modified `internal/cli/review.go`: uses review.Resolve and review.Make, adds --work, drops findCard
- modified `internal/cli/review_test.go`: merged-card test; reviewRepo returns the root
- added `internal/service/review.go`: status, map, file, make, stop, marks
- added `internal/service/review_test.go`: D2, D3, D4
- modified `app.go`: eight bound review methods
- modified `frontend/wailsjs/go/main/App.d.ts`: generated
- modified `frontend/wailsjs/go/main/App.js`: generated
- modified `frontend/wailsjs/go/models.ts`: generated
- modified `scripts/fixture-home.sh`: --review
Risky:
- `MakeReview`: kills the child's process group on Stop; a make's grandchild that changed its own group would outlive Stop
- `ReadMarks`: the first read of a new head writes state.json (the carry), a write on a read
Not changed, on purpose:
- `internal/review/reconcile.go:ChangeCheck`: its signature stays; Make passes the root as its initiative argument
- `frontend/src`: rv-list and rv-symbol own every screen

## Review
Verdict: **pass** at 5e66aa9 (main 371193f), clean clone, every row run from it. Unmet gate items: none.

- D1: `go run`-built binary, temp XDG_DATA_HOME, `organizer review organizer lf40-verb-fit --json` → exit 0, `head` 43c61fc2…, `base` f4fd863f… (= `43c61fc^1`), 7 nodes; `organizer review organizer rv-list --json` → exit 2, "branch rv-list of card rv-list does not exist in …, and no commit on main's first parent in … starts "merge: rv-list " or "merge: rv-list("". Root checkout's `git status` unchanged.
- D2: `TestReviewStatusMakeMoved` (none → map with reconciliation → moved with both shas; missing names both), `TestReviewMakeOnceAndStop` (second make refused "already being made"; Stop with a grandchild running leaves no map and no work dir), `TestReviewMakeFails` (first stderr line + command). They test the row; the make's child is a helper process, so the real `os.Executable()` + `--work` path is not under test (Note below).
- D3: `TestReviewFile` (base/head with context, `../`, absolute, `p/../../x` refused; another machine's card refused for file, status and make) and `TestReadRange` (3 lines each side on a 20-line file, clipped at both ends, flag-as-sha refused). Meets the row.
- D4: `TestReviewMarksAcrossRemap` (state.json under XDG_DATA_HOME, repo `status --ignored` empty; question with blank note refused; after B changes, A carried and B in `changed`; signed pablo) and `TestMarksCarryAcrossRemap`. Meets the row.
- D5: `fixture-home.sh --review`, `organizer review init-a rv-fixture --json` → exit 0, reconciled "change-check rv-fixture"; `svc.Greet` go modified with `svc/greet_test.go::TestGreet`; `web/src/format.ts#formatName` ts modified, flags `untested, undeclared`; mismatch `changed_not_declared`. `git status --porcelain` of the fixture init-a: empty (`--ignored` shows only `web/node_modules`, excluded on purpose).
- X0: `CI=true pnpm install --frozen-lockfile` ok; `XDG_DATA_HOME=$(mktemp -d) test-lease run --share -- make test` exit 0 (18 Go packages ok, vitest 71 files / 810 tests); `test-lease run -- pnpm run build` exit 0; `test-lease run -- wails build` exit 0; `git status --porcelain` of the clone empty. The five D2-D4 tests also pass under `-race -count=1`.
- No-gos: no added line in the diff names `/Users/`, `claudecode`, `http(s)://` or `net/http`; marks and maps go under the data dir only; no card file written.

change-check organizer rv-data (from the clean clone), flags summary:
```
47 flags: outside boundary 14, outside footprint 1, undeclared 0, declared, not changed 0, new env var 0, new dependency 0, new host 0, risk 0, untested? 31, could not read 0, boundary unreadable 1
| boundary unreadable | organizer | docs/specs/review-map.md: no section 'v2 Boundary' | boundary entry |
| outside boundary | app.go, frontend/wailsjs/go/main/App.d.ts, App.js, models.ts, internal/cli/review.go, review_test.go, internal/review/git.go, marks.go, marks_test.go, resolve.go, resolve_test.go, internal/service/review.go, review_test.go, scripts/fixture-home.sh |
| outside footprint | organizer/internal/review/git.go | Export | modified |
| untested? | 31 symbols (App.ReviewMakeState, wailsjs types, reviewCmd, marks.go helpers, mergeOf, service helpers) |
```
- `boundary unreadable` and the 14 `outside boundary`: the card's entry has words after the path (known false flag). Read by hand against the spec's v2 `### Boundary`, rv-data bullet: `internal/review` (git.go, marks.go, resolve.go and their tests), `internal/service` one file (review.go) and `review_test.go`, `app.go`, the `wails generate module` output (the three wailsjs files), `internal/cli/review.go` and `review_test.go`, `scripts/fixture-home.sh`. All 14 are inside it.
- `outside footprint` git.go:Export: the stderr data-race fix, declared, inside the Boundary's `internal/review`; the footprint simply did not list it.
- `untested?` 31: helpers reached through tested callers (mergeOf by TestCardRangesMerged and TestReviewMergedCard; markable/loadMarks/saveMarks/previousMarks/RepoPath by the marks and range tests; service helpers by the D2-D4 tests) and generated TS types. Not a gate item.
- undeclared 0, declared-not-changed 0.

Findings on the card, where each went:
- `readOnlyOf` premise false → review-map.md v2 Amendment 1 (102de58).
- `review.Export` data race → fixed on this branch (git.go:Export).
- change-check's id lookup walks `~` → handled on this branch (Make passes the scanned root); the lookup itself is change-check's design (its tests set HOME).
- `wails generate module` flips wailsjs/runtime to 755 → known, FSE bitácora line 209.

Note: the app's real make (`os.Executable()` + `--work`) is not under a go test; checked by hand: `organizer review init-a rv-fixture --json --out <tmp>/out.json --work <tmp>/w` exit 0, map written, `w` left empty.
Note: rd-build's clean clone `.wt-notes/rd-build/clean` is still on disk (its progress.md says so).

Reviewer: rd-review, 2026-10-18.
