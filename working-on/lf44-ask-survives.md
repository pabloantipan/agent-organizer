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
review: pass
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

## Review
**Pass.** Unmet gate items: none (K1, K2, K3, K4, K5, X0 met on 9092eb3). Reviewer `as-review`, 2026-10-18.

### change-check (from a clean clone at 9092eb3)

```
change-check: working-on/lf44-ask-survives.md
risk: low
repo organizer: base ed9ad9b7f (default main) ... head lf44-ask-survives 9092eb355; 14 files

## Changed

- organizer/frontend/src/components/Conversation.review.test.tsx (modified, test)
- organizer/frontend/src/components/Conversation.test.tsx (modified, test)
- organizer/frontend/src/components/Conversation.tsx (modified): Conversation, askedSeat, unlistedLanding
- organizer/frontend/src/components/ReviewSymbol.test.tsx (modified, test)
- organizer/frontend/src/components/ReviewSymbol.tsx (modified): ReviewSymbolView, TitleLine, editorFailedId
- organizer/frontend/src/lib/review.test.ts (modified, test)
- organizer/frontend/src/lib/review.ts (modified): marksOf, askOf, saveShown, noteHint, domId
- organizer/frontend/src/styles/review.css (modified)
- organizer/frontend/wailsjs/go/models.ts (modified): Mark
- organizer/internal/review/marks.go (modified): Mark, SetMark, SetAsked
- organizer/internal/review/marks_test.go (modified, test)
- organizer/internal/service/review_ask.go (modified): Service.AskReview
- organizer/internal/service/review_ask_test.go (modified, test)
- organizer/internal/service/review_test.go (modified, test)

## Tests touched

- organizer/frontend/src/components/Conversation.review.test.tsx
- organizer/frontend/src/components/Conversation.test.tsx
- organizer/frontend/src/components/ReviewSymbol.test.tsx
- organizer/frontend/src/lib/review.test.ts
- organizer/internal/review/marks_test.go
- organizer/internal/service/review_ask_test.go
- organizer/internal/service/review_test.go

## Risky (declared)

- `unlistedLanding`: "moved" compares the chat key the landing put with the one shown; pressing the same chat again is not a move
- `askedSeat`: reads the thread through GetCellThread; with no mailbox (fixture) it fails silently and the landing stays on channel

## Not changed, on purpose (declared)

- clearing a mark (state "") still drops it, ask included: the panel cannot clear a mark, and a stateless record would print in `organizer review` marks (internal/cli)
- the chat rows' aria-current and `.active`: both already read focus/view; K4 renders them on one row
- Review.tsx, the store: Open the thread passes no seat, so the seat comes from the thread's messages

## Flags

| flag | where | symbol | detail |
|---|---|---|---|
| outside boundary | organizer/frontend/src/components/Conversation.review.test.tsx |  | modified |
| outside boundary | organizer/frontend/wailsjs/go/models.ts |  | modified |
| outside boundary | organizer/internal/service/review_test.go |  | modified |
| outside footprint | organizer/frontend/src/components/Conversation.review.test.tsx |  | modified |
| outside footprint | organizer/internal/service/review_test.go |  | modified |
| undeclared | organizer/internal/service/review_test.go |  | modified |
| untested? | organizer/frontend/src/components/ReviewSymbol.tsx | TitleLine | no test file names it |
| declared, not changed |  | internal/service/review_test.go:TestAskReview | no matching change |

8 flags: outside boundary 3, outside footprint 2, undeclared 1, declared, not changed 1, new env var 0, new dependency 0, new host 0, risk 0, untested? 1, could not read 0, boundary unreadable 0
```

Explanations:
- outside boundary `frontend/wailsjs/go/models.ts`: false flag; the spec's Boundary names the `wails generate module` output (not `runtime/`). The diff is the two `asked_note` lines; `git status --porcelain` stayed empty after `wails build`, so the file is what the generator writes.
- outside boundary / outside footprint `internal/service/review_test.go`, undeclared `review_test.go`, declared-not-changed `review_test.go:TestAskReview`: one and the same change. Amendment 1 allows it. The diff is one hunk inside `func TestAskReview` (the hunk header names it): the failed-re-ask check of b changed from `Asked != ""` to expecting the earlier ask kept (`M4`, `T1`, `3 now?`), plus one comment line. Nothing else in the file changed. change-check gives test files no symbols, so it can't match the declared `:TestAskReview`.
- outside boundary / outside footprint `Conversation.review.test.tsx`: Amendment 1's second bullet. The diff is the one A10 literal, `unlisted.sent(slackDraft.threadId);` changed to `unlisted.start(id);`, with the same meaning.
- untested? `TitleLine`: not exported. K5 tests `editorFailedId` and pins `const failedId = editorFailedId(id);` in its source, and TitleLine uses that one id for both `describedBy` and `EditorFailed id` (ReviewSymbol.tsx:174, 188-190).
- `Conversation.tsx` changes only the slackDraft landing and its watcher (`askedSeat`, `unlistedLanding`). `app.go` and the store are unchanged. No new dependency (go.mod and package.json are not in the diff).

### Gate rows
- K1: `TestSetMarkKeepsTheAsk` (marks) and `TestAskReviewSurvivesASave` (service) both run ask, then SetMark with an edited note, then SetMark to reviewed. Each time they assert `Asked`, `AskedThread` and `AskedNote` = the asked note, and the marks test also checks the file on disk. I ran both myself: PASS. `review_ask.go:134` passes AskReview's `note`, the same one `askBody` posts. SetAsked trims it.
- K2: the panel renders from MarkReview's post-Save marks. With the question and the edited note it shows `Asked sup81 · Open the thread`, `Ask sup81 again, next` and A6's line `Saves the mark and asks sup81 again in this review's thread. Wakes sup81.`, with no Save, and the row reads `question, asked` (blocked the same). With reviewed it keeps the link, offers no `Ask`, and `row.asked` is false. The words match review-view Amendment 9 RS1 and A6 string for string.
- K3: `saveShown("", note)` is false, `noteHint` gives `Choose a mark to save this note.` (RS2's words), and the hint is drawn under the textarea with `aria-describedby`, muted (`.rs-note-hint`). With any mark the hint is "" and Save is drawn.
- K4: `unlistedLanding` with the thread not listed shows channel first, then `seat:fse` once the thread's messages name fse, then lands when the feed lists it. "archive" appears nowhere. If Pablo moved first, nothing lands and the seat's chat doesn't take him back; after LIST_WAIT_MS the chat stands. In the rendered list the `aria-current` row and the `.active` row are the same row (fse, and channel). The landing source no longer names `"archive"`.
- K5: node `ts:a b/c.ts#f` gives one `aria-describedby` token, and that id exists in the markup.
- X0: `XDG_DATA_HOME=$(mktemp -d) test-lease run --share -- make test`: **reused** run `2c2f7c16-62247` of 9092eb355014 (organizer-probe-as-ui, 2026-10-18T19:14:53), 78 files and 1013 vitest tests passed, go ok, exit 0. `test-lease run -- pnpm run build`: exit 0. `test-lease run -- wails build`: exit 0. `git status --porcelain`: empty. I also reran the K tests myself: 4 go tests PASS, and 155 vitest tests in the 4 touched files PASS.

### Checks outside the gate
- Old marks without `asked_note` still read: Go has `omitempty`, and `askOf` falls back to `note`, tested in K2.
- No path posts or opens an editor without a press. The only new call is `GetCellThread` (a read, `cell.go:282`), and it runs from the Open the thread press.

### Notes (non-blocking)
- Note (to the FSE): a mark asked before this landed has no `asked_note`. SetMark carries the empty value forward, so after that note is edited and saved, `askOf` reads the new note as the asked one and no `Ask <seat> again` is offered. A scratch test shows it: legacy ask, then a SetMark with "why 2, not 3?", gives `asked="M1" asked_note=""`. On main the ask was lost on Save anyway, so nothing regresses. A fix: SetMark sets `AskedNote = was.Note` when `was.Asked != ""` and `AskedNote` is empty.
- Note (to the FSE): AskReview's doc comment (`review_ask.go:88-90`) still says a failed post "leaves the mark saved without asked". It now keeps an earlier ask.
- Note (to the FSE): K2 and K3 test the pure functions and source pins behind the panel, not a press, because there is no DOM test library in `frontend/`. That is the project's norm, and each claim is pinned to the code that draws it.
