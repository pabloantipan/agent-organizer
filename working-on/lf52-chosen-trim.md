---
title: "A ruling's chosen is written trimmed, and a padded one still reads"
status: next
repos: [organizer]
branch: lf52-chosen-trim
seat: l52-trim
stage:
updated: 2026-10-24
next: "review: lf52-chosen-trim, T1 and X0 pass, d66f701"
depends_on: []
boundary: ["docs/specs/leftovers-52.md Boundary, lf52-chosen-trim"]
spec: "docs/specs/leftovers-52.md (FR-6)"
gate: "docs/specs/leftovers-52.md#Acceptance → gate"
ui_review: false
---

## Goal
No ruled record carries a padded chosen.

## Gate
docs/specs/leftovers-52.md, rows T1 and X0.

## Done
- FR-6 built on lf52-chosen-trim (d66f701): RuleDecision writes chosen trimmed, each answer of a question record too; the scan reads a hand-padded chosen with no problem. T1 fails on main, passes on the branch; X0 passes from a clean clone (.wt-notes/l52-trim/progress.md).

## Declared changes
- added `internal/scan/decisions.go:TrimChosen`: the trimmed chosen a ruling writes
- added `internal/scan/decisions.go:splitAnswers`: one split of a question record's chosen, each answer trimmed, for CheckAnswers and TrimChosen
- modified `internal/scan/decisions.go:CheckAnswers`: uses splitAnswers
- modified `internal/scan/decisions.go:checkDecision`: a plain chosen is compared trimmed
- modified `internal/service/rule.go:RuleDecision`: trims chosen before checking and writing
- modified `internal/scan/decisions_test.go`: TestChosenPaddedByHand (T1)
- modified `internal/service/rule_test.go`: TestRuleChosenTrimmed (T1)
Risky:
- `splitAnswers`: splits on `,` (was `, `), deciding a new answer on the trimmed piece; an alternative holding `, ` is glued back as written
Not changed, on purpose:
- `writeRuling`: every other byte as today (0019); only the chosen it is given is trimmed
- `Decision.Chosen`: the scan keeps the value as written; only the comparison trims
