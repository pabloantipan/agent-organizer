---
title: "The Ruled list shows answers whole when there is room, and an open record's line does not read its chosen twice"
status: next
repos: [organizer]
branch: lf52-decisions-line
seat: l52-line
reviewer: l52-line-review, l52-line-ui
stage:
updated: 2026-10-25
next: "review: lf52-decisions-line, D1 D2 X0 pass, 1f751f0"
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
