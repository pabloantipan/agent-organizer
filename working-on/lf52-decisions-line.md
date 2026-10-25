---
title: "The Ruled list shows answers whole when there is room, and an open record's line does not read its chosen twice"
status: next
repos: [organizer]
branch: lf52-decisions-line
seat: l52-line
reviewer: l52-line-review, l52-line-ui
stage:
updated: 2026-10-25
next: "l52-line fixes F1 (short answers cut) and U1 (1440 cuts a fitting answer); see ## Review and ## UI review (sup93)"
review: fail
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

## Declared changes
- modified `frontend/src/lib/decisions.ts`: `chosenFloor` replaced by `ruledAnswers` (the answers in order) and `fitAnswers` (whole while it fits the measured room, else equal shares with `Q<n>` whole, floor 5 characters)
- modified `frontend/src/lib/decisions.test.ts`: D1 over the leftovers-49 fixture, wide and narrow; `ruledAnswers` replaces the `chosenFloor` test
- modified `frontend/src/lib/decisionsPage.ts:lineName`: an `open` argument drops the chosen from the name (FR-5)
- modified `frontend/src/lib/decisionsPage.test.ts`: D2, open and closed
- modified `frontend/src/components/DecisionsView.tsx`: `RuledAnswers` measures the chosen's font and room (canvas, ResizeObserver, fonts.ready) and sizes the `.dec-opt` item; the line passes `isOpen` to `lineName`
- modified `frontend/src/components/DecisionsView.test.tsx`: the closed line draws the answers whole before it measures; the open line's name has no chosen
- modified `frontend/src/styles/decisions.css`: `.dec-opt.answers .dec-chosen { flex: 1 1 0 }`, so the text takes the room the item gets and never sizes the line
Risky:
- `RuledAnswers`: canvas text width against WKWebView's rendering, 1 px slack each way; a disagreement shows as a second CSS ellipsis at some width
- `RuledAnswers`: calls `settleLines` once per measure so watchLine's drop sees the new sizes
Not changed, on purpose:
- plain ruled lines: same markup and floor as main
- `watchLine`, `settleLines`: unchanged, past the floor the option still drops whole
- the `.sl` state layer and `StateLayer.css.test.ts` (passes)

## Notes
- The line was not seen in WKWebView by the builder (no window may open on Pablo's screen); the UI review checks Q2 (amended) at 1024 and 1440 and Q6.

## Review

**Verdict: fail** at 1f751f0 (pinned SHA, branch not moved). Gate rows met: D1, D2, X0; unmet gate items: none. The card fails on one proved finding outside the gate (F1).

**F1 (blocking, proved): a short answer is cut at the floor, where main kept it whole.** `fitAnswers` (`frontend/src/lib/decisions.ts:169`) loops `k >= Math.min(ALT_FLOOR, alt.length - 1)`, so an alternative of 5 characters or fewer is still cut, by one letter, to a string no narrower than the whole one; its own doc says "never below ALT_FLOOR characters". The floor string (`fitAnswers(answers, 0, …)`) is also the item's `min-width` in `RuledAnswers`, so this is what the line shows at its narrowest. Inputs (7 px/char, as D1's test measures), what the branch gives:
```
options ["Q1 yes | no","Q2 extraordinarily | x"], chosen "Q1 yes, Q2 extraordinarily"
  room 0   → “Q1 ye…, Q2 extra…”     room 100 → “Q1 ye…, Q2 extra…”
options ["Q1 yes | no","Q2 extraordinarily-long-answer | x"], chosen "Q1 no, Q2 extraordinarily-long-answer"
  room 0   → “Q1 n…, Q2 extra…”
options ["Q1 abc | d", …], room 0 → “Q1 ab…, …”
```
On main the floor kept these whole: main's own test, which this diff deletes, asserted `chosenFloor(["Q1 yes | no", "Q2 extraordinarily | x"], "Q1 yes, Q2 extraordinarily")` is `"Q1 yes, Q2 extraord…"`. A yes/no question reads `Q1 n…`: the answer is lost and nothing is saved. Goes to: this card (l52-line), fix in `fitAnswers` and restore that case as a test.

### change-check (from the clean clone at 1f751f0)
```
repo organizer: base 79f2e3b6d (default origin/main) ... head lf52-decisions-line (clone HEAD 1f751f07d, on detached) 1f751f07d; 7 files, 3 flags
Changed: DecisionsView.test.tsx (test), DecisionsView.tsx (DecisionsView, RuledAnswers, textWidth), decisions.test.ts (test), decisions.ts (chosenFloor, Answer, ruledAnswers, fitAnswers), decisionsPage.test.ts (test), decisionsPage.ts (lineName), styles/decisions.css
| untested? | DecisionsView.tsx | RuledAnswers | no test file names it |
| untested? | DecisionsView.tsx | textWidth | no test file names it |
| untested? | decisions.ts | chosenFloor | no test file names it |
3 flags: outside boundary 0, outside footprint 0, undeclared 0, declared, not changed 0, new env var 0, new dependency 0, new host 0, risk 0, untested? 3, could not read 0, boundary unreadable 0
```
Explained: `chosenFloor` is deleted, so no test can name it. `RuledAnswers` is covered by DecisionsView.test.tsx through the rendered line (`class="dec-opt answers"`, whole text before the measure), not by name; `textWidth` (canvas) has no test, since jsdom has no canvas layout: a gap, its risk declared by the builder, left to the UI review on WKWebView. No undeclared, outside-boundary or declared-not-changed lines; all 7 files sit in the boundary.

### Rows
- **D1** — `decisions.test.ts` "D1: …": wide room → `“Q1 after-graph-performs-start-now, Q2 record-page”` whole (also at exactly its width); narrow room 196 → `“Q1 after-gr…, Q2 record-p…”`, both `Q<n>` whole, equal px; plus DecisionsView.test.tsx draws the line whole before the measure. **Room is measured, not counted**: `RuledAnswers` reads `.dec-chosen`'s `getBoundingClientRect().width` under a ResizeObserver (the span is `flex: 1 1 0`, decisions.css), measures text by canvas in the element's computed font, re-measures on `document.fonts.ready`; the test's 7 px/char is only the injected measure. Plain record: same markup, class and title as main (`!answers` branch; `ruledAnswers` returns null). Met.
- **D2** — `decisionsPage.test.ts` "D2": `lineName(…, true)` has no chosen, `false` and the default have the full `“Q1 …, Q2 record-page”`; DecisionsView passes `isOpen` into `lineName` for the `.dec-line` `aria-label` (DecisionsView.tsx:314), and DecisionsView.test.tsx asserts the open line's name holds no `Q1` and no `“`. Met.
- **Fails on main** (clean clone of main 79f2e3b, the branch's three test files copied in):
```
× D2: drops the chosen while the record is open, and has it whole closed
× closed, the line draws the answers whole before it measures, and its name keeps the full chosen (leftovers-52 D1)
× open, the head shows Chosen with both answers in full and the line has no chosen
FAIL  src/lib/decisions.test.ts  TypeError: ruledAnswers is not a function
AssertionError: expected '“Q1 after…, Q2 record…”' to be '“Q1 after-graph-performs-start-now, Q…'
Test Files  3 failed (3)   Tests  3 failed | 25 passed (28)
```
- **X0** — `CI=true test-lease run -- pnpm install --frozen-lockfile` exit 0; `XDG_DATA_HOME=$(mktemp -d) test-lease run --share -- make test` exit 0, **reused** run `32206d01-84766` of 1f751f07d993 (by l52-line-ui, 03:22:34): go `ok` lines, no FAIL, `Test Files 86 passed (86)`, `Tests 1303 passed (1303)`; `test-lease run -- pnpm run build` exit 0 (`✓ built in 1.44s`); `test-lease run -- wails build` exit 0; `git status --porcelain` empty (before and after the runtime checkout). `StateLayer.css.test.ts` + harness: 200 passed; decisions.css gains one rule (`.dec-opt.answers .dec-chosen { flex: 1 1 0 }`), no state mark, none left the `.sl` layer. Met.

### My own inputs (7 px/char)
- three answers, rooms 1000/400/300/200: whole; `“Q1 alpha-beta-ga…, Q2 delta-epsilon, Q3 zeta-eta-thet…”`; `“Q1 alpha-be…, Q2 delta-ep…, Q3 zeta-eta…”`; floor `“Q1 alpha…, Q2 delta…, Q3 zeta…”`. Fits the spec.
- one question, 1000/200/100/0: whole; `“Q1 after-graph-performs-s…”`; `“Q1 after-gr…”`; `“Q1 after…”`. Fits.
- a plain long chosen: `ruledAnswers` null, plain path as on main. Fits.
- an answer longer than the whole line (200 x's + `Q2 record-page`), room 350: `“Q1 xxxx…(28)…, Q2 record-page”`; room 150: the floor `“Q1 xxxxx…, Q2 recor…”` (22 ch in 21 ch: the item's min-width stops the line there and watchLine drops it past it). Fits.
- widths between wide and narrow, 300/250: `“Q1 after-graph-performs…, Q2 record-page”`, `“Q1 after-graph-p…, Q2 record-page”`.
- short alternatives: F1.

Note (to the FSE): at in-between widths a short answer stays whole and the long one takes the rest (water-filling). FR-4 says "each answer take an equal share … cut with an ellipsis", UW2 "each answer is cut … until the line fits"; the D1 row checks only the narrow case, where both are cut. Read as the builder did, a whole answer that fits its share is its share. Whether that is what Aglaea meant is the FSE's (or the UI review's) to say; not a finding.
Note (to the FSE): D1 tests `fitAnswers` with an injected width, not a laid-out line; jsdom cannot lay out, so the real-width half of FR-4 rests on the UI review at 1024 and 1440.

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
