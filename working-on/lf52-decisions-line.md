---
title: "The Ruled list shows answers whole when there is room, and an open record's line does not read its chosen twice"
status: next
repos: [organizer]
branch: lf52-decisions-line
seat: l52-line
reviewer: l52-line-review, l52-line-ui
stage:
updated: 2026-10-25
next: "l52-line: fitAnswers must not cut an alternative shorter than ALT_FLOOR (Q1 yes stays whole at the floor, as main's test asserted); restore that case in decisions.test.ts, then X0 and review again"
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
