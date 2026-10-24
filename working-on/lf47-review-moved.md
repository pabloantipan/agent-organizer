---
title: "The review header says the branch moved after any re-read, and a marked, unedited symbol offers no save of nothing"
status: next
repos: [organizer]
branch: lf47-review-moved
seat: m47-build
reviewer: m47-review, m47-ui
stage: review-map
updated: 2026-10-23
next: "review: lf47-review-moved, gate met (M1-M4 with Amendment 1, X0), 3301319"
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
- MV1 fixed on the same branch (3301319); M4's new focus test fails on 6c899f4 and passes; rebased on main at 4dd010d, X0 passes from a clean clone (m47-build, 2026-10-23).

## Notes
- Tests updated because they pinned a primary on a marked, unedited symbol (FR-3): `ReviewSymbol.test.tsx` P2 (both), A4 "nobody to ask" and "Reviewed with someone to ask", A6 "each mark's primary drops , next", W4 source line (`markControls(... saved)`), "then Reviewed: the link stays"; `Review.test.tsx` A6 "after the press". Each now reads the label from the edited form, and says so in a comment.
- FR-3 is read as "no primary that only saves": an asking primary stays on a saved, unedited mark (`Ask <seat> again` after a Save of an edited note, leftovers-44 FR-1; `Ask <seat>, next` on a saved Question never asked), since an ask posts. The muted ask line goes with a hidden primary.
- FR-2: the live region's speaker replaces a pending line, and emptying in the same task as the refusal is set would batch both away; the moved line waits one 100 ms gap after the refusal line (`inTurn`).
- MV1 fixed per Amendment 1: the last symbol's own primary press (no next, no ask) hands focus to the checked radio through `focusAfterSave`; armed only when the press succeeded. S4's source pin of the old focus line now pins `landAfterSave`.

## Declared changes
- modified `frontend/src/lib/review.ts:markControls`: takes the saved mark; hides a primary that would only save, and its ask line (FR-3)
- added `frontend/src/lib/review.ts:asSaved`: a saved mark shown as saved (FR-3)
- added `frontend/src/lib/review.ts:movedHead`: the other map head a status read answers, else "" (FR-1)
- added `frontend/src/lib/review.ts:headerMoved`: the header's moved line from the newest read, else the screen's own moved status (FR-1)
- added `frontend/src/lib/review.ts:inTurn`: the panel's polite region says a following line after the press's own line (FR-2)
- modified `frontend/src/components/ReviewSymbol.tsx:ReviewSymbol`: every status read goes to `onStatus`; passes `moved` down (FR-1, FR-2)
- modified `frontend/src/components/ReviewSymbol.tsx:ReviewSymbolView`: `moved` prop to the title line (FR-2)
- modified `frontend/src/components/ReviewSymbol.tsx:TitleLine`: refusals said through `inTurn.press`, the moved line through `inTurn.after` once per change (FR-2)
- modified `frontend/src/components/ReviewSymbol.tsx:MarkForm`: passes the saved mark to markControls (FR-3); arms the after-save focus for the last symbol's own primary press (Amendment 1, MV1)
- added `frontend/src/components/ReviewSymbol.tsx:leavesAfterPress`: a primary press that neither moves on nor asks (Amendment 1)
- added `frontend/src/components/ReviewSymbol.tsx:landAfterSave`: where focus lands once Save or that press has left, via focusAfterSave (Amendment 1)
- modified `frontend/src/components/Review.tsx:Review`: `newer` state from `onStatus` via movedHead, cleared by load; passes `moved` and `onStatus` to the panel (FR-1)
- modified `frontend/src/components/Review.tsx:ReviewView`: `newer` prop; the moved block drawn from headerMoved (FR-1)
- modified `frontend/src/components/Review.test.tsx`: M1, M2, M3; A6 updated for FR-3
- modified `frontend/src/components/ReviewSymbol.test.tsx`: M4 (with Amendment 1's focus check); tests pinning a primary on a saved, unedited mark updated; S4's source pin follows landAfterSave
Risky:
- `inTurn`: a moved line that arrives while a press line is pending waits for it; if that press's line is dropped (speaker stopped on unmount), the moved line is dropped with it
- `Review` `onStatus`: depends on `status` from load; a panel read that resolves before the screen's own load has a status is ignored (nothing shown yet)
Not changed, on purpose:
- `frontend/src/lib/liveRegion.ts`: the speaker's replace rule is used elsewhere and is outside the boundary; ordering is done in `inTurn`
- `primaryOf`, `focusAfterSave`: unchanged, as FR-3 says
- `frontend/src/lib/review.test.ts`: the new helpers are covered by the M rows in the component tests

## Review

**Verdict: pass** at **3301319** (rebased on main 4dd010d; supersedes my fail at 6c899f4, 7077f1e). Unmet gate items: none. Reviewer m47-review, 2026-10-23.

### What changed since 6c899f4

`git range-diff 1a09120..6c899f4 4dd010d..3a0543d`: both earlier commits are `=` (5c6af25 = 26c9c8f, 6c899f4 = 3a0543d), so the rebase changed nothing on the branch. My M1-M3 checks and their fails-on-main evidence below stand unchanged. New: 3301319 (MV1 fix, ReviewSymbol.tsx and its test only). Spec: leftovers-47 Amendment 1 (2064179) adds M4's focus check; review-view Amendment 14 (ba825d7).

### change-check (clean clone at 3301319)

```
change-check: working-on/lf47-review-moved.md
risk: medium (missing, read as medium)
repo organizer: base 587ee24ec (default origin/main) ... head lf47-review-moved (clone HEAD 33013194f, on detached) 33013194f; 5 files, 7 flags; read in /Users/pabloantipan/organizer/.wt-notes/m47-review/clean

## Changed

- organizer/frontend/src/components/Review.test.tsx (modified, test)
- organizer/frontend/src/components/Review.tsx (modified): Review, ReviewViewProps, PanelProps, ReviewView, SymbolPane
- organizer/frontend/src/components/ReviewSymbol.test.tsx (modified, test)
- organizer/frontend/src/components/ReviewSymbol.tsx (modified): ReviewSymbol, ReviewSymbolViewProps, ReviewSymbolView, TitleLine, leavesAfterPress, landAfterSave
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

The flags are the same as at 6c899f4, with the same explanations:
- undeclared `ReviewViewProps`, `PanelProps`, `ReviewSymbolViewProps`: these prop types carry `newer`, `moved` and `onStatus` for the declared component changes.
- undeclared `SymbolPane`: one pass-through line.
- declared, not changed `MarkForm`: a false flag. The diff does change MarkForm (`markControls(..., saved)`, and 3301319's arming line and `landAfterSave` call); change-check attributes those hunks to no symbol.
- untested? `asSaved`: tested through `markControls` in M4.
- untested? `TitleLine` and `SymbolPane`: rendered by the panel and screen tests.

Outside the boundary: 0. `git diff 4dd010d...3301319 --name-only` lists only the five boundary files, and no new dependency came in.

### M4 with Amendment 1 (the focus check)

- Fix: `run("next", …)` now arms the after-save focus when the press neither asks nor moves on (`leavesAfterPress({ ask, moves: !!then })`, i.e. the last symbol's `Reviewed` / `Save question` / `Save block` with no seat). The effect then calls `landAfterSave`, which is the old inline code moved out unchanged: the asking primary if one is drawn, else `input:checked`, else the first radio. The arming runs inside `then`, after `onMark` has resolved and `onMarks` has updated `saved`, so `dirty` is false when the effect runs. A press that moves on (h2 of the next symbol) or asks (Open the thread) is not armed, so those paths are unchanged.
- Test (M4, new `it`): a stand-in document whose `focus()` sets `activeElement`. After `markPress` on the last symbol, `leavesAfterPress` arms, the primary is gone, and `landAfterSave` leaves `document.activeElement` on the checked radio. The same holds for Question and Blocked with no seat. Moving on or asking arms nothing. A source line pins the arming in `run`.
- Fails on 6c899f4 (ReviewSymbol.test.tsx from 3301319 copied onto a 6c899f4 clone, `npx vitest run … -t "M4|S1-S4"`: 2 failed, 9 passed):
  - `× after the last unmarked symbol's own primary press, document.activeElement is the checked radio, never the body`: `TypeError: leavesAfterPress is not a function`
  - `× S4: …`: `expected 'import { useEffect, useMemo, useRef, …' to contain 'landAfterSave({ showPrimary, ask: pri…'` (S4's source line was moved with the refactor. It still pins the same focus target, and the builder's comment says so.)
- The behaviour on 6c899f4 is proven by m47-ui's MV1: `R22_focus` gives `{"tag":"BODY"}`.

### Fails on main, M1-M4 (from the 6c899f4 round; the branch commits are identical)

The branch's test files were copied onto main 1a09120: 14 failed, 87 passed.
- M1: `TypeError: movedHead is not a function`, plus the source check that the re-read reaches the header.
- M2: `TypeError: movedHead is not a function` (see Note 2).
- M3: `TypeError: inTurn is not a function`.
- M4: the ✓-reopened case received `<button class="primary">Reviewed, next</button>`.

The builder updated tests that pinned a primary on a marked, unedited symbol. All are named on the card: P2 (both), A4 ×2, A6, W4, K2, and Review A6.

### Rows

- M1 met: the header reads `The branch moved since this map (4d2a91b → 7c3e5f2).` and shows `Make it again`. Nothing reloads: `load` does not depend on `newer`. No focus call.
- M2 met.
- M3 met: `""`, then the refusal line, then `""`, then the moved line 100 ms later, once.
- M4 met: no primary on a reopened ✓. The primary returns when the note or the mark changes. An unmarked symbol draws `Reviewed, next`. After a Save, and after the last symbol's own press, focus is on the checked radio.
- Words: they match FR-1 and Amendment 11 string for string.
- X0 met. The shared `make test` reused run 1424b154-52953 of 33013194f8c6 (organizer-probe-m47-ui, 2026-10-23T21:02:13): 79 files, 1045 tests passed, go ok. `pnpm run build` exited 0, `wails build` exited 0, and `git status --porcelain` is empty.

### Notes (not blocking)

- Note 1 (to the FSE): the frontend has no DOM test library. M1's "not called again", M3's wiring and M4's focus wiring are therefore proved on the pure helpers plus source lines, not on a mounted component. Amendment 1's `document.activeElement` is a stand-in object. The live check is m47-ui's.
- Note 2 (to the FSE): M2 fails on main only because a helper is missing. Main's behaviour already meets M2.
- Note 3: the asking primary that stays on a saved, never-asked Question is settled by leftovers-47 Amendment 1 and review-view Amendment 14. Closed.

## UI review

m47-ui, 2026-10-23. **Verdict: pass on 3301319** (rebased on main 4dd010d; leftovers-47 Amendment 1 at 2064179, review-view Amendment 14 at ba825d7). No finding of severity 4 or 3 is left. MV1 from the first round at 6c899f4 is fixed. The rows were re-run on 3301319 in a fresh worktree, a fresh dev clone and a fresh fixture:
- M4 with Amendment 1's focus check;
- R22 (amended);
- R45;
- R39, R40, M1-M3;
- the rest of the panel at 1024×640 and 1440×900.

Evidence is in `.wt-notes/m47-ui/out/`: harness logs `h-1024x640.txt` and `h-1440x900.txt`, the shell steps in `driver-*.log`, shots `wk-*.png` and `rb-*.png`, AX dumps `rb-ax-*.txt`, and `killed.txt`. The first round's evidence is kept in `.wt-notes/m47-ui/r1/`.

Shared test run: **fresh**. Run `1424b154-52953` of 33013194f8c6, run by me (m47-review reused it): exit 0, go ok, vitest 79 files / 1045 tests (`.wt-notes/m47-ui/x0-make-test.log`).

No mailbox, no editor. Each fixture was `--review --canned-post` and `auth: off`, with exactly one `discuss_state_dir:` under its own temp dir (`out/dev-config-check.txt`, `out/rb-config-check.txt`). The probe was stubbed. `editor:` was a stub that only logs its arguments. Every `Open in editor` press was refused before any editor ran, and `out/editor-calls.txt` was never written. Nothing was asked, and no `posts.jsonl` was created.

**Amendment 1 fails on 6c899f4**:
- I copied 3301319's `ReviewSymbol.test.tsx` onto a clone at 6c899f4 and ran `npx vitest run … -t "after the last unmarked symbol"`. Result: `1 failed`, `TypeError: leavesAfterPress is not a function` (`.wt-notes/m47-ui/fail-on-6c899f4.txt`).
- The behaviour fails too. My first-round harness on 6c899f4 recorded `R22_focus {"tag":"BODY"}` at both sizes (`r1/out-6c899f4/h-*.txt`), and the review build's AX showed no focused element.

How each state was checked:
- **WKWebView, Tab harness.** I used as-ui's `tabharness.swift` through rw-ui's copy (read first, unchanged), offscreen with `isKey: true`, under `harness.lock`. It ran against my own `wails dev -devserver localhost:34265` from a clean clone of 3301319, at 1024×640 and at 1440×900. The steps are in `steps/M.txt`. Spies wrapped `ReviewMap`, `ReviewMarks` and `ReviewStatus` on `window.go.main.App`, and MutationObservers watched both polite regions. The two sizes read the same.
  - **M4 / R40**:
    - Unmarked formatName: `Reviewed, next`. The press saves ✓ and moves focus to Greet's h2.
    - ✓ reopened: the mark form has no button, no ask line and no Save. Tab goes h2 → diff → radio `reviewed` → Note → body, so no primary is a stop.
    - `N` opens Greet.
    - Note edited: `Reviewed, next` and `Save` return, in that Tab order. With the note emptied, both go.
    - Mark changed to Blocked: `Ask fse, next` and `Save` return, both disabled until there is a note. Back to Reviewed, both go.
    - Save of an edited note: focus is on the `reviewed` radio.
  - **R22 (amended) / Amendment 1**: Greet is the last unmarked symbol and reads `Reviewed`, with no `, next`. Return on it saves ✓ and the button goes (`buttons: []`). `R22_focus` is `INPUT name=reviewed`, the checked radio, at both sizes. The ring is drawn on its span (`.rs-radio input:focus + span`, 2px `--focus-ring`). The screen's polite region says `Reviewed 2 of 2` once.
  - **R45**:
    - On formatName, with seat fse and both symbols marked (so it is the last), Question was picked with the note `y`. That drew `Ask fse` and `Save` plus `Saves the mark and asks fse (the initiative's FSE) in this review's thread. Wakes fse.`
    - Pressing `Save` saved the Question without asking. The panel still offers `Ask fse` and the same line, and focus is on `Ask fse` (`focusAfterSave`: primary, since it asks).
    - Reopened via Greet, the panel is the same: `Ask fse` and the line.
    - Shots: `wk-1024x640-R45-after-save.png`, `wk-1440x900-R45-after-save.png`.
    - The `, next` form was not reachable here: no unmarked symbol was left.
  - **M2**: every mount read answered the shown head. The header had no moved line, and ReviewMap and ReviewMarks were called 0 times.
  - **R39 / M1**:
    - The driver checked out `rv-fixture`, moved the branch to `review-second`, and made a map at the new head with `organizer review`. Then Return on `Open in editor`.
    - The header reads `The branch moved since this map (f320a1d → 781e029).` + `Make it again` (1440: `9614cc9 → 2cbf02c`).
    - ReviewMap and ReviewMarks were called 0 times before and after, and the worklist is unchanged.
    - Focus is on the h2, which is R31's refusal move; the header change moved nothing.
    - The header grew by one line (48 → 84 px).
    - No horizontal scroll at 1024/1024 or 1440/1440.
  - **M3**: the panel's polite region logged:
    - 1024: `[1178 "Not checked out here at f320a1d."] [1618 ""] [1721 "The branch moved since this map (f320a1d → 781e029)."]`;
    - 1440: `593 / 693 / 795`.
    - The moved line comes once, after the press's own line, 100 ms after the emptying.
  - Opening another symbol on a header already moved: the header stays moved and the panel's region says nothing.
  - **Header Tab order** (1440): `← Card` → `Make it again` → the worklist's stop → the diff → radios.
  - **Make it again** leaves the moved state: `2cbf02c ← … Reviewed 1 of 2 · 1 must-visit left`, and formatName reads `changed since you reviewed`.
- **Review build** (`make review-build` in my detached worktree at 3301319). I saved its pid (97654), used AX and AXPress on that pid only, and shot window 52658 with `screencapture -o -l` at 1440×900 and 1024×640. The screen was unlocked.
  - Unmarked: `Reviewed, next` (`rb-1440x900-M4-unmarked.png`).
  - ✓ reopened: no `Reviewed` button (`rb-ax-1440-reopened.txt`, `rb-1440x900-R40-reopened.png`).
  - R22: AXPress `Reviewed` on the last symbol. AXFocused is `AXRadioButton t="Reviewed" v=1` (`rb-ax-R22-focus.txt`, `rb-1440x900-R22-after.png`).
  - R39: checkout, move, map outside (`rb-move.txt`), then AXPress `Open in editor`.
    - The header reads `The branch moved since this map (adbe4d4 → eb054ea).` with AXButton `Make it again`.
    - The file line reads `Not checked out here at adbe4d4.`
    - The panel's sr-only region holds the moved line, and AX focus is on the h2 (`rb-ax-1440-R39.txt`, `rb-ax-1024-R39.txt`, `rb-1440x900-R39-moved.png`, `rb-1024x640-R39-moved.png`).
- **Rest of the panel against lf46's UI review**, unchanged at both sizes:
  - the header `<head> ← <base> · 2 symbols changed, 0 tests` and `Reviewed n of 2 · 1 must-visit left`;
  - the h2 focused when a symbol opens;
  - `Not checked out here at <sha>.`;
  - the 2px ring;
  - no `Error:`;
  - at 1440 the facts sit beside the diff, at 1024 under it.

Words, design vs screen:
- `The branch moved since this map (<shown> → <new>).` reads `The branch moved since this map (f320a1d → 781e029).`. Same.
- `Make it again` reads `Make it again`. Same.
- `Reviewed, next` / `Reviewed` read `Reviewed, next` / `Reviewed`. Same.
- `Ask <seat>` reads `Ask fse`. Same.
- `Next to review` + `N`: same.
- `Reviewed 2 of 2`: same.
- `Not checked out here at <short sha>.`: same.
- `changed since you reviewed`: same.
- On a ✓ reopened there is no `Reviewed` / `Reviewed, next`, as UW2 says.

Findings:
- **MV1 (3), first round at 6c899f4, fixed at 3301319**: the last symbol's `Reviewed` press dropped focus to the body. Focus now lands on the checked radio (harness and AX, above).
- **MV2 (1)**: after Make it again, focus is on the worklist row of the symbol shown. That matches Amendment 1 (on open, focus goes to the worklist's stop), so it is recorded only.

Spec gaps (for the FSE): none left. The R22/UW2 contradiction is settled by leftovers-47 Amendment 1 and review-view A14 A1.

For aglaea: none. A14 answered both of the first round's questions.

Not verified in WKWebView:
- `Save question` / `Save block` on the last symbol with no seat: the fixture always has the seat fse. vitest's Amendment 1 test covers both, in the fresh run.
- R45's `Ask <seat>, next` form, with another symbol still unmarked: my order left none. vitest P2/A4 cover it.
- R45 in the review build: AX cannot type the note a Question needs. It was checked in the harness only.
- The header's Tab order at 1024×640: checked at 1440 only. The markup is the same at both widths.
- VoiceOver speech itself: the polite regions were read by MutationObserver and AX, not heard.
