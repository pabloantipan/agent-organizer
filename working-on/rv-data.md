---
title: "A merged card resolves to its merge, and the app can read, make and mark a review map"
status: now
repos: [organizer]
branch: rv-data
seat: rd-build
stage: review-map
updated: 2026-10-18
next: "review: rv-data, gate met (D1-D5, X0), 5e66aa9"
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
