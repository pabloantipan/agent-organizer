---
title: "The rule box and the Decisions list speak a question record: chosen in full, per-answer floors, question words in the legend, what is missing, the right prompt"
status: next
repos: [organizer]
branch: lf51-rule-words
seat: l51-words
reviewer: l51-words-review, l51-words-ui
stage:
updated: 2026-10-24
next: "review: lf51-rule-words, W5-W8 and X0 pass, 61d9d41"
depends_on: [lf49-rule-questions]
boundary: ["docs/specs/leftovers-51.md Boundary, lf51-rule-words"]
spec: "docs/specs/leftovers-51.md (FR-7 to FR-11)"
gate: "docs/specs/leftovers-51.md#Acceptance → gate"
ui_review: true
---

## Goal
Pablo reads and rules a record with several questions as easily as a plain one.

## Gate
docs/specs/leftovers-51.md, rows W5-W8 and X0; the UI review checks rule-questions Q1 to Q5.

## Done
- 2026-10-24 l51-words: FR-7 to FR-11 on branch lf51-rule-words (7d08b05, f20840e, 61d9d41, rebased on main 48c77ac); W5-W8 fail on main (7 of 13), pass on the branch; X0 passes from a clean clone (vitest 83 files, 1129 tests; build; wails build; porcelain empty). Progress and reviewer commands: .wt-notes/l51-words/progress.md.

## Declared changes
- modified `frontend/src/lib/decisions.ts`: added `chosenLines`, `chosenFloor`, `questionWords`, `missingWords` (FR-7 to FR-10)
- modified `frontend/src/lib/decisions.test.ts`: tests of the four helpers
- modified `frontend/src/components/RuleDecisionBox.tsx:RuleDecisionBox`: legend `Q<n> · <words>`, foot's missing text as Rule's description, question placeholder (FR-9 to FR-11)
- modified `frontend/src/components/RuleDecisionBox.test.tsx`: W6, W7, W8; `box` takes a body
- modified `frontend/src/styles/rule-box.css`: `.rb-question`, `.rb-missing`, legend wraps
- modified `frontend/src/components/DecisionsView.tsx:DecisionsView`: opened ruled head shows Chosen; line floors per answer, drops its chosen while open (FR-7, FR-8)
- added `frontend/src/components/DecisionsView.test.tsx`: W5
Risky:
- `DecisionsView` line: a floored question chosen does not shrink (inline `flex: none`); past it `watchLine` drops it whole
Not changed, on purpose:
- `frontend/src/styles/decisions.css`: outside the boundary; the floor is computed text (first word, at most 8 characters), not a layout floor
- `frontend/src/lib/decisionsPage.ts:lineName`: the line's name keeps the full chosen, open or closed

## Notes
- The per-answer floor always shows on a question line, even with room; a layout floor needs decisions.css (progress.md, Found, not asked).

