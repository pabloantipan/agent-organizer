---
title: "Ruling a record with several questions picks one answer per question and writes them all into chosen"
status: next
repos: [organizer]
branch: lf49-rule-questions
seat: l49-build
reviewer: l49-review, l49-ui
stage: review-map
updated: 2026-10-24
next: "review: lf49-rule-questions, gate met (Q1-Q4, X0, with Amendment 1), 592359b"
depends_on: []
boundary: ["docs/specs/leftovers-49.md Boundary"]
spec: "docs/specs/leftovers-49.md (FR-1 to FR-5)"
gate: "docs/specs/leftovers-49.md#Acceptance → gate"
ui_review: true
---

## Goal
A record that asks Q1 and Q2 is ruled in Deltagos with an answer to each, and `chosen` says both.

## Gate
docs/specs/leftovers-49.md, rows Q1-Q4 and X0. Built only if 0157 chooses A.

## Done
- l49-build: built on lf49-rule-questions (f5c48f6 Go, 1496f88 frontend, 592359b Amendment 1), rebased on main f0496c4; Q1-Q4 fail on main and pass here, X0 passes from a clean clone (progress: .wt-notes/l49-build/progress.md).

## Declared changes
- added `internal/scan/decisions.go:Questions`: reads a question record's options (FR-1)
- added `internal/scan/decisions.go:Answers`: the `Q1 <alt>, Q2 <alt>` form (FR-3)
- added `internal/scan/decisions.go:CheckAnswers`: why a chosen is not one answer per question, shared by rule and scan (FR-3, FR-4)
- modified `internal/scan/decisions.go:checkDecision`: a question record's chosen is checked by CheckAnswers (FR-4)
- modified `internal/service/rule.go:RuleDecision`: a question record's chosen is checked by CheckAnswers (FR-3)
- modified `internal/service/rule.go:writeRuling`: takes `question`, writes that chosen quoted
- modified `internal/service/rule.go:setFrontmatterKey`: takes the scalar already formatted
- modified `internal/scan/decisions_test.go`: Q3 and the parser's tests
- modified `internal/service/rule_test.go`: Q1, Q2; writeRuling's new parameter
- added `testdata/questions/0037-big-picture-stage.md`: hestia 0037's frontmatter, proposed
- added `testdata/questions/0038-usage-exit-amended-by-0018.md`: hestia 0038 as ruled, a one-alternative question (Amendment 1)
- added `frontend/src/lib/decisions.ts:questionsOf`, `answersOf`, `picksOf`, `allAnswered`: the shape on the box's side (FR-1, FR-2)
- modified `frontend/src/lib/decisions.test.ts`: the helpers' tests
- modified `frontend/src/components/RuleDecisionBox.tsx:RuleDecisionBox`: one radio group per question, ready when all are picked (FR-2)
- added `frontend/src/components/RuleDecisionBox.test.tsx`: Q4
Risky:
- `CheckAnswers`: an alternative that itself holds `, Q<n> ` would be misread in a record of two or more questions; none in the wild
- `Questions`: a single full-answer option (`["Q1 x, Q2 y"]`) now reads as one question; ruling it with that option still passes (tested)
- `writeRuling`: every caller must pass `question`; the one caller does
Not changed, on purpose:
- `frontend/src/components/DecisionsView.tsx`: FR-5 already met, it shows chosen as written (line 273)
- `frontend/src/styles/rule-box.css`: the groups reuse `.rb-options` and `.rb-label`; outside the boundary

## Notes
- decide answered by leftovers-49 Amendment 1 (40e6f96): one or more alternatives, numbered Q1, Q2, ... from 1, else plain; applied in 592359b.
