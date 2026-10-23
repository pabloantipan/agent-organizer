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
review: pass
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

## Review

**Verdict: pass** at 6c899f4 (branch lf47-review-moved, not moved during the review). Unmet gate items: none. Reviewer m47-review, 2026-10-23.

### change-check (from a clean clone at 6c899f4)

```
change-check: working-on/lf47-review-moved.md
risk: medium (missing, read as medium)
repo organizer: base 1a091202b (default origin/main) ... head lf47-review-moved (clone HEAD 6c899f475, on detached) 6c899f475; 5 files, 7 flags; read in /Users/pabloantipan/organizer/.wt-notes/m47-review/clean

## Changed

- organizer/frontend/src/components/Review.test.tsx (modified, test)
- organizer/frontend/src/components/Review.tsx (modified): Review, ReviewViewProps, PanelProps, ReviewView, SymbolPane
- organizer/frontend/src/components/ReviewSymbol.test.tsx (modified, test)
- organizer/frontend/src/components/ReviewSymbol.tsx (modified): ReviewSymbol, ReviewSymbolViewProps, ReviewSymbolView, TitleLine
- organizer/frontend/src/lib/review.ts (modified): markControls, asSaved, movedHead, headerMoved, inTurn

## Tests touched

- organizer/frontend/src/components/Review.test.tsx
- organizer/frontend/src/components/ReviewSymbol.test.tsx

## Risky (declared)

- `inTurn`: a moved line that arrives while a press line is pending waits for it; if that press's line is dropped (speaker stopped on unmount), the moved line is dropped with it
- `Review` `onStatus`: depends on `status` from load; a panel read that resolves before the screen's own load has a status is ignored (nothing shown yet)

## Not changed, on purpose (declared)

- `frontend/src/lib/liveRegion.ts`: the speaker's replace rule is used elsewhere and is outside the boundary; ordering is done in `inTurn`
- `primaryOf`, `focusAfterSave`: unchanged, as FR-3 says
- `frontend/src/lib/review.test.ts`: the new helpers are covered by the M rows in the component tests

## Flags

| flag | where | symbol | detail |
|---|---|---|---|
| undeclared | organizer/frontend/src/components/Review.tsx | ReviewViewProps | modified |
| undeclared | organizer/frontend/src/components/Review.tsx | PanelProps | modified |
| undeclared | organizer/frontend/src/components/Review.tsx | SymbolPane | modified |
| undeclared | organizer/frontend/src/components/ReviewSymbol.tsx | ReviewSymbolViewProps | modified |
| untested? | organizer/frontend/src/components/Review.tsx | SymbolPane | no test file names it |
| untested? | organizer/frontend/src/components/ReviewSymbol.tsx | TitleLine | no test file names it |
| untested? | organizer/frontend/src/lib/review.ts | asSaved | no test file names it |
| declared, not changed |  | frontend/src/components/ReviewSymbol.tsx:MarkForm | no matching change |

8 flags: outside boundary 0, outside footprint 0, undeclared 4, declared, not changed 1, new env var 0, new dependency 0, new host 0, risk 0, untested? 3, could not read 0, boundary unreadable 0
```

- undeclared `ReviewViewProps`, `PanelProps` (Review.tsx), `ReviewSymbolViewProps` (ReviewSymbol.tsx): the prop types carrying `newer`, `moved`, `onStatus` that the declared `Review`, `ReviewView`, `ReviewSymbol`, `ReviewSymbolView` changes need; inside the boundary.
- undeclared `SymbolPane`: one line passing `moved`/`onStatus` from `panel` to `ReviewSymbol`; inside the boundary.
- declared, not changed `ReviewSymbol.tsx:MarkForm`: false flag; the diff changes MarkForm's `markControls(..., saved)` call (hunk `@@ -290 +312 @@ function MarkForm`); change-check attributed it to no symbol.
- untested? `asSaved`: exercised through `markControls` in M4 and the updated P2/A4/A6; `TitleLine`: rendered by every panel test, its new effect read by M3's source check; `SymbolPane`: rendered by the screen tests with `from` set.
- Outside boundary 0; no new dependency (`git diff main...6c899f4 --name-only` is the five boundary files; no package.json, lock or go.mod).

### Fails on main (the branch's two test files copied onto a clone at main 1a09120, `npx vitest run` of both: 14 failed, 87 passed)

- M1: `TypeError: movedHead is not a function`; and `expected 'import { useEffect, useRef, useState …' to contain 'ReviewStatus(initiative, card).then((…'` (main's re-read never reaches the header).
- M2: `TypeError: movedHead is not a function` (only the helper is missing: on main the header already stays unchanged; see Note 2).
- M3: `TypeError: inTurn is not a function` (both timer tests); `expected 'import …' to contain 'const turn = useMemo(() => inTurn(say…'`.
- M4: `a ✓ symbol reopened` fails with `expected '<h2 …' not to contain 'class="primary"'`, received `…<textarea …>reads right</textarea><div class="rs-buttons"><button class="primary">Reviewed, next</button></div>…`; `the mark changed` and `after a Save` fail with `expected true to be false`. The note-edit and unmarked cases pass on main, as they should (main already draws those).
- Tests the builder changed that pinned a primary on a marked, unedited symbol, all named in ## Notes and failing on main as expected: ReviewSymbol P2 (both), A4 "nobody to ask", A4 "Reviewed with someone to ask", A6 "each mark's primary drops , next", W4 source line, K2 "then Reviewed: the link stays"; Review A6 "after the press".

### Rows

- M1 met: `movedHead(A-shown, B-read)` is B and the rendered header reads `The branch moved since this map (4d2a91b → 7c3e5f2).` with `Make it again` (WORDS.makeAgain), map's worklist still drawn. Both panel reads (mount and the re-read after a refusal) call `onStatus`; `onStatus` only sets `newer`; `load` (the only caller of ReviewMap/ReviewMarks) does not depend on `newer` (Review.tsx:43-63), so nothing reloads and no focus call is made.
- M2 met: same map head gives `""` and identical markup to the screen without a re-read.
- M3 met: with fake timers the region reads `""`, the refusal line, `""`, then after 100 ms the moved line, once.
- M4 met: ✓ reopened draws no primary and no `rs-buttons` (last and not last); note edit and mark change bring `Reviewed, next` / `Reviewed` / `Save question, next` / `Save block`; unmarked draws `Reviewed, next`; after a Save `focusAfterSave` answers radios.
- Words: `The branch moved since this map (<shown> → <new>).` and `Make it again` match FR-1 and Amendment 11 UW1 character for character.
- X0 met: `XDG_DATA_HOME=$(mktemp -d) test-lease run --share -- make test` **reused run 0bd5ca43-69302 of 6c899f47503e** (by organizer-probe-m47-ui, 2026-10-23T20:39:45): go ok, vitest 78 files / 1035 tests passed. `test-lease run -- pnpm run build` exit 0, `test-lease run -- wails build` exit 0, `git status --porcelain` empty (wailsjs/runtime untouched).

### Notes (not blocking)

- Note 1 (to the FSE): M1's "ReviewMap and ReviewMarks are not called again" and "focus unchanged" are proved by reading Review.tsx's source (one call site each) rather than by counting mocked calls on a mounted screen, since the frontend has no DOM test library; I checked the dependency array myself. A gate that wants call counts needs a DOM renderer in the frontend's devDependencies first.
- Note 2 (to the FSE): M2 "fails on main" only through the missing helper; main's behaviour already meets M2. The gate's "Expected (fails on main)" column does not fit a row that checks a non-regression.
- Note 3 (to the FSE, for aglaea's Amendment 11 wording): FR-3 says a marked, unedited symbol "draws no primary"; the build keeps an *asking* primary there (`Ask sup81, next` on a saved Question with a seat, never asked), as the card's Notes say, because hiding it would leave no way to ask without editing the note. M4 tests a ✓ only, so the gate does not settle it; the spec's words should say which.
- Note 4 (to the FSE): M3 drives `inTurn` over the pure `speaker`, not over `useLiveRegion` inside a mounted TitleLine; the component's use of it is checked by source lines. Same DOM-library limit as Note 1.

