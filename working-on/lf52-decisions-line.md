---
title: "The Ruled list shows answers whole when there is room, and an open record's line does not read its chosen twice"
status: next
repos: [organizer]
branch: lf52-decisions-line
seat: l52-line
reviewer: l52-line-review, l52-line-ui
stage:
updated: 2026-10-25
next: "review: lf52-decisions-line, D1 D2 X0 pass, F1 U1 fixed, 2816be1"
review: pass
depends_on: [lf52-state-layer]
boundary: ["docs/specs/leftovers-52.md Boundary, lf52-decisions-line"]
spec: "docs/specs/leftovers-52.md (FR-4 to FR-5)"
gate: "docs/specs/leftovers-52.md#Acceptance → gate"
ui_review: true
---

## Goal
Pablo reads a ruled question record's answers in the list, and a screen reader says them once.

## Gate
docs/specs/leftovers-52.md, rows D1-D2 and X0.

## Done
- 2026-10-25 l52-line: FR-5 (88e7e38) and FR-4 (1f751f0) on lf52-decisions-line, rebased on main 46851ef; D1, D2 fail on main and pass on the branch, X0 passes from a clean clone. Commands, output and the fixture steps for the UI review in `.wt-notes/l52-line/progress.md`.
- 2026-10-25 l52-line, round 2: F1 and U1 fixed in 2816be1 (rebased on main 843f288; earlier commits now 0bdf0f3, 3c53949). D1 follows Amendment 3 (water-filling), with the F1 and U1 cases failing at 1f751f0; X0 passes from a clean clone at 2816be1. progress.md, Round 2.

## Declared changes
- modified `frontend/src/lib/decisions.ts`: `chosenFloor` replaced by `ruledAnswers` (the answers in order) and `fitAnswers` (whole while it fits the measured room, else water-filled equal shares with `Q<n>` whole; floor the first word at most 8 characters, never cutting a shorter one), and `FIT_SLACK`, `answerSizes`, `fitRoom` (the item asks 2 px over the measure and the fit keeps half)
- modified `frontend/src/lib/decisions.test.ts`: D1 over the leftovers-49 fixture: wide, narrow (Amendment 3), both cut, floor, F1 short answers, U1 room equal to the basis; `ruledAnswers` replaces the `chosenFloor` test
- modified `frontend/src/lib/decisionsPage.ts:lineName`: an `open` argument drops the chosen from the name (FR-5)
- modified `frontend/src/lib/decisionsPage.test.ts`: D2, open and closed
- modified `frontend/src/components/DecisionsView.tsx`: `RuledAnswers` measures the chosen's font and room (canvas, ResizeObserver, fonts.ready) and sizes the `.dec-opt` item through `answerSizes` and `fitRoom`; the line passes `isOpen` to `lineName`
- modified `frontend/src/components/DecisionsView.test.tsx`: the closed line draws the answers whole before it measures; the open line's name has no chosen
- modified `frontend/src/styles/decisions.css`: `.dec-opt.answers .dec-chosen { flex: 1 1 0 }`, so the text takes the room the item gets and never sizes the line
Risky:
- `RuledAnswers`: canvas text width against WKWebView's rendering, 2 px asked over the measure and 1 px kept by the fit; a disagreement shows as a second CSS ellipsis at some width
- `RuledAnswers`: calls `settleLines` once per measure so watchLine's drop sees the new sizes
Not changed, on purpose:
- plain ruled lines: same markup and floor as main
- `watchLine`, `settleLines`: unchanged, past the floor the option still drops whole
- the `.sl` state layer and `StateLayer.css.test.ts` (passes)

## Notes
- The line was not seen in WKWebView by the builder (no window may open on Pablo's screen); the UI review checks Q2 (amended) at 1024 and 1440 and Q6.

## Review

**Verdict: pass** at 2816be1 (the branch moved from 1f751f0; rebased on main 843f288, 0bdf0f3 and 3c53949 the old 88e7e38 and 1f751f0, plus 2816be1). Unmet gate items: none. D1 (as amended by leftovers-52 Amendment 3), D2 and X0 are met; F1, which failed round 1 at 1f751f0, is fixed.

### change-check (fresh clean clone at 2816be1)
```
repo organizer: base abe1feca8 (default origin/main) ... head lf52-decisions-line (clone HEAD 2816be1f1, on detached) 2816be1f1; 7 files, 2 flags
| untested? | DecisionsView.tsx | RuledAnswers | no test file names it |
| untested? | DecisionsView.tsx | textWidth | no test file names it |
2 flags: outside boundary 0, outside footprint 0, undeclared 0, declared, not changed 0, new env var 0, new dependency 0, new host 0, risk 0, untested? 2, could not read 0, boundary unreadable 0
```
Explained: `RuledAnswers` is exercised through the rendered line in DecisionsView.test.tsx (`class="dec-opt answers"`, whole before the measure), and its arithmetic now lives in `answerSizes`/`fitRoom`, which decisions.test.ts tests by name (U1 case). `textWidth` is the canvas measure, which jsdom cannot run; the UI review covers it on WKWebView. All 7 files are inside the boundary; nothing undeclared or outside it.

### Rows
- **D1 (Amendment 3)**: decisions.test.ts. Wide room gives `“Q1 after-graph-performs-start-now, Q2 record-page”` whole; narrow room 287 gives `“Q1 after-graph-perform…, Q2 record-page”` (Amendment 3's string: the shorter whole, the longer cut); the both-long case (room 196) gives `“Q1 after-gr…, Q2 record-p…”` and `“Q1 after-gr…, Q2 neo4j-pe…”`, equal px, `Q<n>` whole. Room is measured, not counted: `.dec-chosen` (`flex: 1 1 0`) read by `getBoundingClientRect` under a ResizeObserver, text by canvas in its computed font, re-measured on `fonts.ready`. Plain records keep main's markup. Met.
- **D2**: `lineName(…, true)` has no chosen, closed has it whole; DecisionsView passes `isOpen` into the `.dec-line` `aria-label` (DecisionsView.tsx:314); DecisionsView.test.tsx asserts the open name has no `Q1` and no `“`. Met.
- **F1 (round 1)**: `cut` now floors at the first word, 8 characters at most, and never cuts below it. Test "an answer no longer than its floor is never cut (F1)" gives `“Q1 yes, Q2 extraord…”` at 0 and 100, `“Q1 no, Q2 extraord…”`, `“Q1 abc, Q2 x”`, `“Q1 renamed, Q2 after…”`. Fixed.
- **Fails on main 843f288** (2816be1's three test files copied onto a clean clone):
```
× D2: drops the chosen while the record is open, and has it whole closed
× closed, the line draws the answers whole before it measures, and its name keeps the full chosen (leftovers-52 D1)
× open, the head shows Chosen with both answers in full and the line has no chosen
FAIL  src/lib/decisions.test.ts  TypeError: ruledAnswers is not a function
Test Files  3 failed (3)   Tests  3 failed | 25 passed (28)
```
- **The new checks fail at 1f751f0** (same files on a clone of 1f751f0):
```
× no room: the floor, every alternative at its first word, at most 8 characters   expected '“Q1 after…, Q2 recor…”' to be '“Q1 after…, Q2 record…”'
× an answer no longer than its floor is never cut (F1)   expected '“Q1 ye…, Q2 extra…”' to be '“Q1 yes, Q2 extraord…”'
× a room equal to the basis the item asks for reads whole (U1)   TypeError: answerSizes is not a function
Tests  3 failed | 57 passed (60)
```
  The Amendment 3 narrow and both-long cases pass at 1f751f0 too: water-filling was already there, so the amendment ruled what the code did.
- **X0**: `CI=true test-lease run -- pnpm install --frozen-lockfile` exit 0; `XDG_DATA_HOME=$(mktemp -d) test-lease run --share -- make test` exit 0, **fresh**, run `dadac3ab-79676` of 2816be1 (l52-line-ui reused it at 04:21:14): 19 go `ok` lines, no FAIL, `Test Files 86 passed (86)`, `Tests 1306 passed (1306)`; `test-lease run -- pnpm run build` exit 0 (`✓ built in 1.22s`); `test-lease run -- wails build` exit 0; `git status --porcelain` empty before and after `git checkout -- frontend/wailsjs/runtime`. `StateLayer.css.test.ts` and its harness: 200 passed. The branch's only style change is `.dec-opt.answers .dec-chosen { flex: 1 1 0 }`; no state mark in decisions.css left the `.sl` layer. Met.

### My own inputs at 2816be1 (7 px/char)
- three answers, 57 ch: `“Q1 alpha-beta-ga…, Q2 delta-epsilon, Q3 zeta-eta-thet…”`; 43 ch: all three cut; floor `“Q1 alpha…, Q2 delta…, Q3 zeta…”`. As Amendment 3.
- one question: whole at 143 ch, `“Q1 after-graph-performs-s…”` at 28.6, floor `“Q1 after…”`.
- a plain long chosen: `ruledAnswers` null, main's plain path.
- an answer longer than the line (200 x's): at 50 ch `“Q1 xxx…(28)…, Q2 record-page”`; floor `“Q1 xxxxxxxx…, Q2 record…”`; the item's min-width holds there and watchLine drops it below.
- widths in between, 43 and 36 ch: `“Q1 after-graph-performs…, Q2 record-page”` and `“Q1 after-graph-p…, Q2 record-page”`.
- F1's inputs: `yes` and `no` whole at every room; `yes-no` floors to `“Q1 yes…”`.
- U1: `answerSizes` basis 359 / floor 163; `fitRoom` at basis and basis-1 gives the whole line, at basis-2 the cut begins, at the floor the floor.

Note (to the FSE, next leftovers): `a-b` floors to `“Q1 a…”`, the same character count as `Q1 a-b`, because its first word is one letter. A cut that saves almost nothing; not ruled against by Amendment 3 ("shorter than the floor" is measured against the first word). It does not fail the card.
Note (to the FSE): D1 runs `fitAnswers` with an injected width. The real-width half of FR-4 (canvas against WKWebView, FIT_SLACK 2 px) rests on the UI review at 1024 and 1440.

Round 1 at 1f751f0: fail on F1 (790ca75), now fixed.

Reviewer: l52-line-review, 2026-10-25.

## UI review
l52-line-ui, 2026-10-25, commit 1f751f0. **Verdict: fail** (one severity 3 against rule-questions Amendment 2 Q2 (amended), leftovers-52 FR-4).

How it was checked: the review build (`make review-build` in `.wt/l52-line-ui`) was launched with the `--review` fixture (auth off, discuss_state_dir under its temp dir, checked), but the screen was locked (`CGSSessionScreenIsLocked` true): `screencapture -l` returned "could not create image" and AX gave no tree, so it was quit by its pid. Every state below was read in offscreen WKWebView (window never ordered in, no system input) over `wails dev` of a clean clone of 1f751f0, with the fixture's init-a and the leftovers-49 record 0037 ruled `"Q1 after-graph-performs-start-now, Q2 record-page"` per the builder's steps (copied into `$FIXTURE_HOME` only). Rendered text is the DOM's `textContent` of `.dec-chosen`; widths from `getBoundingClientRect`; the accessible name is the `.dec-line` button's `aria-label` (its accname, since AX was not reachable). Shots `.wt-notes/l52-line-ui/r/<w>x<h>-<state>.png` (WKWebView `takeSnapshot`, not the screen); harness output `r/h-q.txt`, `r/h-q2.txt`.

Shared test run: **fresh**, test-lease run `32206d01-84766` of 1f751f0, `make test` rc 0 (go test ok; vitest 86 files, 1303 tests passed).

| Row | State | Result |
|---|---|---|
| Q2 (amended), 1440×900 | closed, line 1132 px, title whole with room to spare | **fail**: reads `“Q1 after-graph-performs-start-no…, Q2 record-page”` |
| Q2, between (1280, 1180, 1100, 1060) | closed | 1280-1100 the same `start-no…` (title never cut); 1060 `“Q1 after-graph-performs-start…, Q2 record-page”` (title cut, room 279 px) |
| Q2 (amended), 1024×640 | closed, room 243 px | `“Q1 after-graph-perform…, Q2 record-page”`: Q1 and Q2 whole labels, Q1 cut, Q2 whole (see G1) |
| plain ruled lines (0012, 0011, 0006, 0004, 0001) | 1024, 1440 | whole, no inline sizes, as on main: pass |
| tooltip | closed | `.dec-line` title `“Q1 after-graph-performs-start-now, Q2 record-page” · show the record`, `.dec-chosen` title the full chosen: pass |
| open head | open, 1024 and 1440 | `Chosen` / `Q1 after-graph-performs-start-now` / `Q2 record-page`, whole, wrapping: pass |
| Q6 | open | name `0037 A Big Picture stage — … , ruled, by pablo, 24 Oct, after 1 day`, no chosen; line draws no chosen: pass |
| Q6 | closed again | name has `“Q1 after-graph-performs-start-now, Q2 record-page”`: pass |
| marks, R50 | before and after open | the view's marks are the rail row (`rail-item sl active`, 1440) or strip item (`strip-item sl active`, 1024) and the sub-tab (`sl on`): each `::before` paints the fill or inset line with `transition: none`, the control eases `background-color 0.1s` only. The Ruled list has no `.on`/`.current`/`.active` of its own; the open line has no fill (`aria-expanded` only, background transparent in the same frame as the click), unchanged from main: pass |
| height, alignment, ellipsis | 1024, 1440 | every line 38 px, chosen 20 px on the title's row, 12 px `--fg-muted`-family ink, no second CSS ellipsis (`scrollWidth == clientWidth` at every width): pass |

**U1 (severity 3): a two-answer line never shows both answers whole, even with room.**
- What Pablo cannot do: read the ruled Q1 answer whole on the Ruled list at 1440. It ends `start-no…`: the one letter lost is the one that tells `start-now` from a cut.
- Where: Decisions, Ruled, the 0037 line; `r/1440x900-closed-b.png`, `r/1280x800-closed.png`.
- Evidence (`r/h-q2.txt`, 1440): the item gets exactly its basis (`flex-basis: calc(1ch + 300.4393px)`, item 307.75 px), the chosen's room is 296.4375 px; canvas measures the whole text at 295.4393 px, the DOM at 295.4531 px, so it fits the room. `RuledAnswers` asks `fitAnswers(answers, room - 1, …)`: 295.4375 < 295.4393 by 0.002 px, so it cuts. The "+1 px" in the basis and the "−1 px" on the room cancel, and layout rounding to 1/64 px takes the rest. The text is the same at 1440, 1280, 1180 and 1100, where the title is not cut, so the line had room every time.
- Severity 3: Q2 (amended)'s 1440 check fails as written, on the card's own gated feature; D1 passes only because vitest feeds a synthetic width.
- Proposal (for the builder; not built here): the slack must add up, not cancel. Either the basis carries 2 px over the measure, or the fit compares with the room and no −1 (the CSS ellipsis stays the fallback). Add a D1 case where the room equals the basis the item asks for: the answer stays whole.

**Spec gaps (for the FSE)**
- G1: Q2 (amended) at 1024 reads `Q1 <cut>…, Q2 <cut>…`; FR-4 and UW2 say each answer takes an equal share. At 1024 Q2 `record-page` (87 px) fits its equal share (~113 px), so the builder keeps it whole and gives the rest to Q1 (water-filling). That is what the line shows. I did not fail it: an answer cut while it fits its share would hide words for nothing. The row should say whether an answer that fits its share stays whole.
- G2: the spec names no width "in between". 1060 cuts Q1 at `start…` with the title already cut at its floor, a reasonable order. I only recorded it.

**For aglaea, not verified**
- A1: whether water-filling (G1) or strict equal cuts is the design at 1024.
- A2: at 1024 the initiative header's goal line sits on the sub-tabs with no gap (`r/1024x640-closed-b.png`, top). It is outside this card; it looks like leftovers-52 Amendment 1's A4/R53.

**Not verified**: the review app on screen (screen locked: no AX tree, no window capture). Everything above is offscreen WKWebView over `wails dev`, the same engine but not the bundled `frontend/dist`. VoiceOver speech was not checked, only the aria-label.
