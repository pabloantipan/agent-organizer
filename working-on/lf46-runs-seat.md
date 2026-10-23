---
title: "Runs find their card by seat and fold a resumed seat into one row; old asks keep their note"
status: now
repos: [organizer]
branch: lf46-runs-seat
seat: ru-build
reviewer: ru-review
stage: review-map
updated: 2026-10-23
next: "review: lf46-runs-seat, gate met (R1-R3, X0), a8e5519"
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
