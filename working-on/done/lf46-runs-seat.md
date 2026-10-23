---
title: "Runs find their card by seat and fold a resumed seat into one row; old asks keep their note"
status: done
repos: [organizer]
branch: lf46-runs-seat
seat: ru-build
reviewer: ru-review
stage: review-map
updated: 2026-10-23
next: "review: lf46-runs-seat, gate met (R1-R3, X0), a8e5519"
review: pass
risk: low
footprint: [internal/session/runs.go, internal/session/runs_test.go, internal/service/run.go, internal/service/run_test.go, internal/cli/run.go, internal/cli/run_test.go, internal/review/marks.go, internal/review/marks_test.go]
depends_on: []
boundary: ["docs/specs/leftovers-46.md Boundary, lf46-runs-seat"]
spec: "docs/specs/leftovers-46.md (FR-1 to FR-3)"
gate: "docs/specs/leftovers-46.md Acceptance, rows R1-R3 and X0"
ui_review: false
---

## Goal
organizer runs puts every seat's cost under its card, once per conversation.

## Gate
docs/specs/leftovers-46.md, rows R1-R3 and X0.

## Done
- R1-R3 fail on main and pass on lf46-runs-seat; X0 passes from a clean clone, status empty (.wt-notes/ru-build/progress.md). Commits 496a655, 5181606, a8e5519.

## Declared changes
- modified `internal/session/runs.go:CardRef`: carries the card's `Seat`
- added `internal/session/runs.go:MatchRun`: MatchCard, then the one card of the initiative whose seat is the session's short name (FR-1)
- added `internal/session/runs.go:initiativeCards`: the longest-root selection, lifted out of MatchCard so MatchRun shares it
- modified `internal/session/runs.go:MatchCard`: uses initiativeCards; behaviour unchanged
- modified `internal/session/runs.go:Retire`: matches through MatchRun with the record's session
- modified `internal/session/runs.go:Run`: `Resumed`, set only by the fold, never written by the archiver
- added `internal/session/runs.go:Conversations`: folds lines of one non-empty session id on read (FR-2)
- modified `internal/service/run.go:cardRefsLocked`: fills `Seat` from `model.Card.Seat`
- modified `internal/service/run.go:liveRuns`: matches through MatchRun with the record's session
- modified `internal/service/run.go:Service.Runs`: returns Conversations of the archive
- modified `internal/cli/run.go:WriteRuns`: `<session> (resumed n)` when n > 0
- modified `internal/review/marks.go:SetMark`: an asked mark with no AskedNote takes its previous note (FR-3)
- modified `internal/session/runs_test.go`, `internal/service/run_test.go`, `internal/cli/run_test.go`, `internal/review/marks_test.go`: R1, R2, R3
Risky:
- `Conversations`: the cost is the sum of each process's final cost, as the spec says; the real archive suggests a resumed process's cost does not restart at 0, so the sum may double-count (Notes)
Not changed, on purpose:
- `LoadRuns`: stays one per pid:session; Retire keys by it and usage, roles, crew and InitiativeRuns read it per process
- `MatchCard` signature: `internal/service/cardjoin.go` (outside the boundary) calls it
- `internal/cli/testdata/runs.golden`: unchanged, no row in it is resumed
- `frontend/wailsjs/go/`: unchanged, no bound type moved

## Notes
- Cost on resume, the spec's unverified premise (read-only over the real runs.jsonl): of 60 consecutive pid pairs in 42 resumed conversations, 20 have the later pid's final cost exactly equal to the earlier one's (organizer-probe-rr-build 1.63 twice), 39 higher, 1 lower. Cost looks cumulative over the conversation, so FR-2's sum double-counts; max per conversation would not. Built as written; wants a ruling.
- Runs archived before this branch stay unattributed: the seat match is made when a line is written, not on read.
- The app's InitiativeRuns still lists a resumed conversation once per pid (not in FR-2).

## Review
**Verdict: pass** at 8303a1c (branch `lf46-runs-seat`; the card's 496a655, 5181606, a8e5519 are the pre-rebase SHAs of 1729646, c1d997b, 8303a1c). Unmet gate items: none.

### change-check (clean clone at 8303a1c)
```
6 flags: outside boundary 0, outside footprint 0, undeclared 3, declared, not changed 0, new env var 0, new dependency 0, new host 0, risk 0, untested? 3, could not read 0, boundary unreadable 0
| undeclared | organizer/internal/cli/run_test.go |  | modified |
| undeclared | organizer/internal/review/marks_test.go |  | modified |
| undeclared | organizer/internal/service/run_test.go |  | modified |
| untested? | organizer/internal/service/run.go | Service.cardRefsLocked | no test file names it |
| untested? | organizer/internal/service/run.go | Service.liveRuns | no test file names it |
| untested? | organizer/internal/session/runs.go | initiativeCards | no test file names it |
```
- The three `undeclared` test files are declared, but in one bullet that lists four files, and change-check parses only the first. They sit inside the boundary, since each is "its test".
- `untested?`: `TestRunsFindTheirCardBySeat` goes through `InitiativeRuns`, which calls `liveRuns` (run.go:430) and `cardRefsLocked` (run.go:438). `initiativeCards` is exercised by every `MatchCard`/`MatchRun` test.
- All 8 changed files are within Boundary (lf46-runs-seat). No golden file changed, and no dependency was added.

### Fails on main (the branch's tests copied onto 61ae190)
- R1 `TestRunsFindTheirCardBySeat/one_card_names_the_seat`: `cards = [], want the run under "lf46-runs-seat"`. `TestMatchRunBySeat` does not build on main (`undefined: MatchRun`, `unknown field Seat in struct literal of type CardRef`).
- R2 `TestRunsFoldsAResumedConversation`: two rows (`$0.50`, `$1.00`, `2 runs`), and `table missing "1 run "` / `want one row for the conversation`. `TestConversationsFoldResumes`: `undefined: Conversations`.
- R3 `TestSetMarkGivesAnOldAskItsNote`: `Asked:M1 AskedThread:T1 AskedNote:}], want note q2 asked M1 with q`.
- The second half of R3 (an AskedNote already set is kept) is the existing `TestSetMarkKeepsTheAsk` (`AskedNote != "why 2?"`), which passes on the branch.
- R1, my own probe (a scratch test, since removed): cwd root on branch `feat-x` with a card on `feat-x` plus a seat card picks `by-branch`; on main it picks `by-seat`; `camp-probe-andrea` picks the card with `seat: andrea`; the bare `rr-build` matches nothing. The short name is the session after `-probe-`, as in CLAUDE.md, Crew session names.

### X0
- `XDG_DATA_HOME=$(mktemp -d) test-lease run --share -- make test`: **fresh** run, id `d5173b83-82609`, sha 8303a1c, rc 0 (go all ok; vitest 78 files, 1013 tests).
- `pnpm run build` rc 0 and `wails build` rc 0. wailsjs/runtime was untouched, and `git status --porcelain` printed nothing.
- `runs.jsonl` stays backward-compatible: `Run` gained only `resumed,omitempty`, `LoadRuns` is unchanged and its existing tests pass. Every new test sets `XDG_DATA_HOME`/`HOME` to temp dirs.

### Notes (do not fail the card)
- Note, to the FSE: FR-2 sums each process's final cost. The builder's read of the real archive (20 of 60 resumed pairs have equal finals) says cost is cumulative per conversation, so the sum likely double-counts. The gate is correct as written, but the premise may be wrong; it is the same question as uc-resume and 0138.
- Note, to the FSE: `InitiativeRuns` (the app) still lists a resumed conversation once per pid. FR-2 names only `organizer runs`.
- Note, to the FSE: R2 says "go test of LoadRuns". The fold lives in `Conversations`, and `LoadRuns` stays per pid on purpose. The tests check LoadRuns→Conversations and the CLI end to end, which meets the row's intent.
- Note, to the FSE: the branch's tests check "path wins over seat" but not "branch wins over seat". I verified the branch case by hand (above). Runs archived before this change stay unattributed.

Reviewer `ru-review`, 2026-10-23.
