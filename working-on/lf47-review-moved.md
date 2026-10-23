---
title: "The review header says the branch moved after any re-read, and a marked, unedited symbol offers no save of nothing"
status: next
repos: [organizer]
branch: lf47-review-moved
seat: m47-build
reviewer: m47-review, m47-ui
stage: review-map
updated: 2026-10-23
next: "review: lf47-review-moved, gate met (M1-M4, X0), 6c899f4"
depends_on: []
boundary: ["docs/specs/leftovers-47.md Boundary, lf47-review-moved"]
spec: "docs/specs/leftovers-47.md (FR-1 to FR-3)"
gate: "docs/specs/leftovers-47.md Acceptance, rows M1-M4 and X0"
ui_review: true
---

## Goal
The Review screen never shows an old map as current, and never offers a press that saves nothing.

## Gate
docs/specs/leftovers-47.md, rows M1-M4 and X0; the UI review checks review-view R39 and R40.

## Done
- Built on branch lf47-review-moved (5c6af25 FR-3, 6c899f4 FR-1/FR-2), rebased on main at eefd82a; M1-M4 fail on main and pass on the branch, X0 passes from a clean clone; evidence and choices in `.wt-notes/m47-build/progress.md` (m47-build, 2026-10-23).

## Notes
- Tests updated because they pinned a primary on a marked, unedited symbol (FR-3): `ReviewSymbol.test.tsx` P2 (both), A4 "nobody to ask" and "Reviewed with someone to ask", A6 "each mark's primary drops , next", W4 source line (`markControls(... saved)`), "then Reviewed: the link stays"; `Review.test.tsx` A6 "after the press". Each now reads the label from the edited form, and says so in a comment.
- FR-3 is read as "no primary that only saves": an asking primary stays on a saved, unedited mark (`Ask <seat> again` after a Save of an edited note, leftovers-44 FR-1; `Ask <seat>, next` on a saved Question never asked), since an ask posts. The muted ask line goes with a hidden primary.
- FR-2: the live region's speaker replaces a pending line, and emptying in the same task as the refusal is set would batch both away; the moved line waits one 100 ms gap after the refusal line (`inTurn`).
- The clean clone `.wt-notes/m47-build/clean` was left in place: the harness refused `rm -rf` on it.

## Declared changes
- modified `frontend/src/lib/review.ts:markControls`: takes the saved mark; hides a primary that would only save, and its ask line (FR-3)
- added `frontend/src/lib/review.ts:asSaved`: a saved mark shown as saved (FR-3)
- added `frontend/src/lib/review.ts:movedHead`: the other map head a status read answers, else "" (FR-1)
- added `frontend/src/lib/review.ts:headerMoved`: the header's moved line from the newest read, else the screen's own moved status (FR-1)
- added `frontend/src/lib/review.ts:inTurn`: the panel's polite region says a following line after the press's own line (FR-2)
- modified `frontend/src/components/ReviewSymbol.tsx:ReviewSymbol`: every status read goes to `onStatus`; passes `moved` down (FR-1, FR-2)
- modified `frontend/src/components/ReviewSymbol.tsx:ReviewSymbolView`: `moved` prop to the title line (FR-2)
- modified `frontend/src/components/ReviewSymbol.tsx:TitleLine`: refusals said through `inTurn.press`, the moved line through `inTurn.after` once per change (FR-2)
- modified `frontend/src/components/ReviewSymbol.tsx:MarkForm`: passes the saved mark to markControls (FR-3)
- modified `frontend/src/components/Review.tsx:Review`: `newer` state from `onStatus` via movedHead, cleared by load; passes `moved` and `onStatus` to the panel (FR-1)
- modified `frontend/src/components/Review.tsx:ReviewView`: `newer` prop; the moved block drawn from headerMoved (FR-1)
- modified `frontend/src/components/Review.test.tsx`: M1, M2, M3; A6 updated for FR-3
- modified `frontend/src/components/ReviewSymbol.test.tsx`: M4; tests pinning a primary on a saved, unedited mark updated
Risky:
- `inTurn`: a moved line that arrives while a press line is pending waits for it; if that press's line is dropped (speaker stopped on unmount), the moved line is dropped with it
- `Review` `onStatus`: depends on `status` from load; a panel read that resolves before the screen's own load has a status is ignored (nothing shown yet)
Not changed, on purpose:
- `frontend/src/lib/liveRegion.ts`: the speaker's replace rule is used elsewhere and is outside the boundary; ordering is done in `inTurn`
- `primaryOf`, `focusAfterSave`: unchanged, as FR-3 says
- `frontend/src/lib/review.test.ts`: the new helpers are covered by the M rows in the component tests
