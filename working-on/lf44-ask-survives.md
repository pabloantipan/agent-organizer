---
title: "An ask survives a Save, a note says it needs a mark, Open the thread never lands on archive"
status: next
repos: [organizer]
branch: lf44-ask-survives
seat: as-build
reviewer: as-review, as-ui
stage: review-map
updated: 2026-10-18
next: "review: lf44-ask-survives, gate met (K1-K5, X0 from a clean clone), 9092eb3"
risk: low
footprint: [internal/review/marks.go, internal/review/marks_test.go, internal/service/review_ask.go, internal/service/review_ask_test.go, frontend/wailsjs/go/*, frontend/src/components/ReviewSymbol.tsx, frontend/src/components/ReviewSymbol.test.tsx, frontend/src/lib/review.ts, frontend/src/lib/review.test.ts, frontend/src/styles/review.css, frontend/src/components/Conversation.tsx (landing), frontend/src/components/Conversation.test.tsx]
depends_on: []
boundary: ["docs/specs/leftovers-44.md Boundary"]
spec: "docs/specs/leftovers-44.md (FR-1 to FR-4; docs/ux/specs/review-view.md Amendment 9)"
gate: "docs/specs/leftovers-44.md Acceptance, rows K1-K5 and X0"
ui_review: true
---

## Goal
A question once asked stays asked, a note that cannot save says why, and opening its thread lands somewhere real.

## Gate
docs/specs/leftovers-44.md, rows K1-K5 and X0.

## Done
- K1-K5 and X0 met on 9092eb3, rebased on main at 8997c7c; X0 from a clean clone: make test (go + 1013 vitest), pnpm run build, wails build, git status --porcelain empty. Evidence in .wt-notes/as-build/.

## Declared changes
- modified `internal/review/marks.go:Mark`: adds `AskedNote` (json `asked_note`), the note an ask was sent with
- modified `internal/review/marks.go:SetMark`: keeps Asked, AskedThread, AskedNote of the replaced mark on every Save (FR-1)
- modified `internal/review/marks.go:SetAsked`: takes the note and writes AskedNote
- modified `internal/review/marks_test.go`: K1 `TestSetMarkKeepsTheAsk`; SetAsked call sites take the note
- modified `internal/service/review_ask.go:AskReview`: passes the note to SetAsked
- modified `internal/service/review_ask_test.go`: K1 through the service, `TestAskReviewSurvivesASave`
- modified `internal/service/review_test.go:TestAskReview`: one assertion, the failed re-ask of b keeps the earlier ask (M4, T1, its note); outside the spec's Boundary by sup85's leave (leftovers-44 Amendment 1)
- modified `frontend/wailsjs/go/models.ts`: `wails generate module`, `asked_note` on review.Mark
- modified `frontend/src/lib/review.ts`: `askOf` added, `noteHint` added, `domId` added, `WORDS.chooseMark` added; `marksOf` marks asked only on question/blocked; `saveShown` needs a mark (FR-1, FR-2, FR-4)
- modified `frontend/src/lib/review.test.ts`: tests for the above
- modified `frontend/src/components/ReviewSymbol.tsx`: MarkForm reads `askOf` (again forms against the asked note), draws the note hint with aria-describedby, sanitised ids; `editorFailedId` added; TitleLine takes the node id (FR-1, FR-2, FR-4)
- modified `frontend/src/components/ReviewSymbol.test.tsx`: K2, K3, K5; W4's source literal follows MarkForm
- modified `frontend/src/styles/review.css`: `.rs-note-hint`, muted sm
- modified `frontend/src/components/Conversation.tsx`: the slackDraft landing; `askedSeat` added, `unlistedLanding` added (replaces the unlisted sentWatch) (FR-3)
- modified `frontend/src/components/Conversation.test.tsx`: K4; W5's source regex follows the landing
- modified `frontend/src/components/Conversation.review.test.tsx`: A10's literal is the FR-3 landing (`unlisted.start(id);`), by sup85's leave
Risky:
- `unlistedLanding`: "moved" compares the chat key the landing put with the one shown; pressing the same chat again is not a move
- `askedSeat`: reads the thread through GetCellThread; with no mailbox (fixture) it fails silently and the landing stays on channel
Not changed, on purpose:
- clearing a mark (state "") still drops it, ask included: the panel cannot clear a mark, and a stateless record would print in `organizer review` marks (internal/cli)
- the chat rows' aria-current and `.active`: both already read focus/view; K4 renders them on one row
- Review.tsx, the store: Open the thread passes no seat, so the seat comes from the thread's messages

## Notes
- internal/service/review_test.go and Conversation.review.test.tsx changed by sup85's leave (2026-10-18), named above.
- FR-1's "none keeps the link" is not reachable from the panel (no clear control); see Not changed.
