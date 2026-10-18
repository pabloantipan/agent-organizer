---
title: "The review's failure words, the thread link, marks in one column, and one list of Needs me verbs"
status: next
repos: [organizer]
branch: lf41-review-words
seat: lw-build
stage: review-map
updated: 2026-10-18
next: "review: lf41-review-words, gate met (W1-W6, X0), afbc2fb"
risk: low
footprint: [frontend/src/lib/review.ts, frontend/src/lib/review.test.ts, frontend/src/components/ReviewSymbol.tsx, frontend/src/components/ReviewSymbol.test.tsx, frontend/src/components/Review.tsx, frontend/src/components/Review.test.tsx, frontend/src/styles/review.css, frontend/src/components/Conversation.tsx (aria-current), frontend/src/components/Home.tsx (verbs), frontend/src/lib/verbs.ts, frontend/src/lib/verbs.test.ts, frontend/src/components/Home.waits.test.tsx]
depends_on: []
boundary: ["docs/specs/leftovers-41.md Boundary, lf41-review-words"]
spec: "docs/specs/leftovers-41.md (FR-1 to FR-6)"
gate: "docs/specs/leftovers-41.md Acceptance, rows W1-W6 and X0"
ui_review: true
---

## Goal
Pablo reads why an ask failed and what to do, reaches the thread as a link, and reads marks in one column.

## Gate
docs/specs/leftovers-41.md, rows W1-W6 and X0.

## Declared changes
- modified `frontend/src/lib/review.ts:askFailedLine`: the failed ask by cause, home path as `~` (FR-1)
- added `frontend/src/lib/review.ts:askStage`: asked, and whether the note was edited since (FR-4)
- added `frontend/src/lib/review.ts:markControls`: the primary, whether it shows, the muted line (FR-4)
- modified `frontend/src/lib/review.ts:askLine`: the `again` line (FR-4)
- modified `frontend/src/lib/review.ts:primaryOf`: `Ask <seat> again` (FR-4)
- modified `frontend/src/components/ReviewSymbol.tsx:MarkForm`: reads markControls; hides an asking primary once asked; focus to Open the thread when the pressed button unmounts (FR-4)
- modified `frontend/src/components/ReviewSymbol.tsx:AskStatus`: Open the thread is an `<a>` (FR-2)
- modified `frontend/src/components/Review.tsx:Worklist`: `? asked` as one unit in the mark's place, `asked` row class (FR-3)
- modified `frontend/src/styles/review.css`: the unit, the asked row's padding, `.rs-thread` link and ring (FR-2, FR-3)
- modified `frontend/src/components/Conversation.tsx:Conversation`: `aria-current="true"` on the chat row shown (FR-5)
- added `frontend/src/lib/verbs.ts`: VERBS, VERB_LIST, ruleVerb (FR-6)
- modified `frontend/src/components/Home.tsx`: every row verb and label from VERBS; InboxRow exported for the test (FR-6)
- modified `frontend/src/lib/review.test.ts`: W1, W4
- modified `frontend/src/components/ReviewSymbol.test.tsx`: W2, W4; A4/A9 words follow FR-1
- modified `frontend/src/components/Review.test.tsx`: W3 markup and CSS
- added `frontend/src/components/Conversation.test.tsx`: W5
- added `frontend/src/lib/verbs.test.ts`: W6, the list
- modified `frontend/src/components/Home.waits.test.tsx`: W6, every row kind rendered
Risky:
- `MarkForm`: once asked with the note as asked, Question/Blocked has no primary; moving on is N or the list (Reviewed and Save stay)
- `askFailedLine`: matching is on error text; a new Go error wording falls to "anything else"
Not changed, on purpose:
- `Conversation.tsx` landing logic: the class and the new attribute already follow the chat shown in WK; only the attribute was added (boundary)
- any Go, `app.go`, `frontend/wailsjs/`, the store, `lib/queue.ts:launchVerb` (outside the boundary; Home compares it to `VERBS.open`)

## Done
- 2026-10-18 lw-build: FR-1 to FR-6 on branch lf41-review-words (9b36a71, f87b25b, 1425e0a, afbc2fb), rebased on main ad4a3c2. Gate met: W1, W4-W6 vitest; W2, W3 vitest and Tab harness at 1024x640 and 1440x900 (W1, W4 also in WK); X0 from a clean clone at afbc2fb (make test 0, pnpm run build 0, wails build 0, porcelain empty). Not merged. Evidence and how to reach each state: `.wt-notes/lw-build/progress.md`.

## Notes
- FR-4's "editing the note" is read as the note only: choosing Blocked over an asked Question with the same note asks nothing (no primary) until the note changes; Save saves it without asking.
- The harness found an asked row's wrapped flags left at the old indent after the first cut of FR-3; fixed in afbc2fb (FR-36 holds: flag 93.97 = name 93.97).
