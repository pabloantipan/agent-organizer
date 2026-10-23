---
title: "The review panel's last loose words: no false hint, the asked seat's chat at once, unique ids, the not-here line kept"
status: now
repos: [organizer]
branch: lf46-review-words
seat: rw-build
reviewer: rw-review, rw-ui
stage: review-map
updated: 2026-10-23
next: "review: lf46-review-words, gate met (W1-W4, X0), 5e8510c"
risk: low
footprint: [frontend/src/lib/review.ts, frontend/src/lib/review.test.ts, frontend/src/components/ReviewSymbol.tsx, frontend/src/components/ReviewSymbol.test.tsx, frontend/src/components/Review.tsx, frontend/src/components/Review.test.tsx, frontend/src/styles/review.css, frontend/src/components/Conversation.tsx (landing), frontend/src/stores/board.store.ts (openSlack seat)]
depends_on: []
boundary: ["docs/specs/leftovers-46.md Boundary, lf46-review-words"]
spec: "docs/specs/leftovers-46.md (FR-4 to FR-8)"
gate: "docs/specs/leftovers-46.md Acceptance, rows W1-W4 and X0"
ui_review: true
---

## Goal
The review panel never says something untrue, and Open the thread lands where the question went.

## Gate
docs/specs/leftovers-46.md, rows W1-W4 and X0.

## Declared changes
- modified `frontend/src/lib/review.ts:WORDS`: `chooseMark` removed (FR-4)
- deleted `frontend/src/lib/review.ts:noteHint`: the hint was untrue, the primary saves an unmarked note ✓ (FR-4, AS1)
- modified `frontend/src/lib/review.ts:domId`: escapes every unsafe character, `_` included, as `_<hex>_`, so ids are injective (FR-6)
- added `frontend/src/lib/review.ts:editorShown`: keeps the refused place not-here while re-reading and when the re-read is for another map_head (FR-7)
- modified `frontend/src/lib/review.ts:askOf`: `asked_note` empty falls back to the note (FR-8)
- modified `frontend/src/components/ReviewSymbol.tsx:ReviewSymbol`: keeps the refused place (`left`, `rereading`) and draws through `editorShown` (FR-7)
- modified `frontend/src/components/ReviewSymbol.tsx:MarkForm`: the hint line, its id and aria-describedby removed (FR-4)
- modified `frontend/src/styles/review.css`: `.rs-note-hint` rule and its comment removed (FR-4)
- added `frontend/src/components/Review.tsx:openThread`: Open the thread passes the asked seat to openSlack (FR-5)
- modified `frontend/src/components/Review.tsx:Review`: onOpenThread uses `openThread` (FR-5)
- modified `frontend/src/components/Conversation.tsx:unlistedLanding`: `start(id, seat)` starts on the seat's chat, channel only with none; `asked` with the same seat does not show again (FR-5, AS3)
- modified `frontend/src/components/Conversation.tsx:Conversation`: the unlisted landing starts with `focus` (FR-5)
- modified `frontend/src/lib/review.test.ts`, `frontend/src/components/ReviewSymbol.test.tsx`, `frontend/src/components/Review.test.tsx`, `frontend/src/components/Conversation.test.tsx`, `frontend/src/components/Conversation.review.test.tsx`: gate rows W1-W4; old rows pinning the hint, the old domId and `unlisted.start(id)` updated
Risky:
- `domId`: ids change shape (`a b/c.ts` → `a_20_b_2f_c_2e_ts`); every user builds both ends with it, nothing stores them
- `unlistedLanding.start`: with a seat, Conversations never shows channel; a review whose addressee is not the seat the thread was asked of moves once `asked` answers, as before
Not changed, on purpose:
- `frontend/src/stores/board.store.ts:openSlack`: already sets `slackFocus` from its second argument
- `frontend/src/lib/review.ts:editorAt`: a first status read for another head still draws nothing (E3)

## Done
- 2026-10-23 rw-build: FR-4 to FR-8 on `lf46-review-words` (105c9aa, 5e8510c); W1-W4 fail on main, pass on the branch; X0 passes from a clean clone (`.wt-notes/rw-build/progress.md`)

## Notes
- FR-8's frontend fallback alone does not survive a Save of an old asked mark until lf46-runs-seat's FR-3 (SetMark keeps the previous note as AskedNote) merges; the two cards close it together.
