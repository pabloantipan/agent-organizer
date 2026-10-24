---
title: "Ruling a record with several questions picks one answer per question and writes them all into chosen"
status: next
repos: [organizer]
branch: lf49-rule-questions
seat: l49-build
reviewer: l49-review, l49-ui
stage: review-map
updated: 2026-10-24
review: pass
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

## Review

**Verdict: pass.** Unmet gate items: none (Q1, Q2, Q3, Q4, X0 met, with Amendment 1). Reviewed 592359b from a clean clone; reviewer `l49-review`, 2026-10-24.

### change-check

```
$ change-check organizer lf49-rule-questions   (clean clone at 592359b, base 82dbf5b origin/main)
10 files: RuleDecisionBox.test.tsx (added), RuleDecisionBox.tsx, decisions.test.ts, decisions.ts,
internal/scan/decisions.go, decisions_test.go, internal/service/rule.go, rule_test.go,
testdata/questions/0037-big-picture-stage.md (added), testdata/questions/0038-usage-exit-amended-by-0018.md (added)
| undeclared | frontend/src/components/RuleDecisionBox.tsx |  | modified |
| undeclared | frontend/src/lib/decisions.ts | Question | added |
| undeclared | frontend/src/lib/decisions.ts | answersOf | added |
| undeclared | frontend/src/lib/decisions.ts | picksOf | added |
| undeclared | frontend/src/lib/decisions.ts | allAnswered | added |
| undeclared | internal/scan/decisions.go | Question | added |
| untested? | internal/scan/decisions.go | Answers | no test file names it |
| untested? | internal/service/rule.go | setFrontmatterKey | no test file names it |
| declared, not changed |  | frontend/src/components/RuleDecisionBox.tsx:RuleDecisionBox | no matching change |
9 flags: outside boundary 0, outside footprint 0, undeclared 6, declared, not changed 1, new env var 0, new dependency 0, new host 0, risk 0, untested? 2, could not read 0, boundary unreadable 0
```

Explained, none is a finding:
- `RuleDecisionBox.tsx` undeclared + `RuleDecisionBox.tsx:RuleDecisionBox` declared-not-changed: one change. Every hunk of the file is inside the `RuleDecisionBox` function (the `questions`/`picks`/`ready` lines and the per-question fieldsets) plus its import and doc comment; the tool did not attribute the hunks to the symbol.
- `decisions.ts` `answersOf`, `picksOf`, `allAnswered`: declared in one bullet with `questionsOf` (comma-separated); the parser took the first name only. `Question` (TS type and Go struct): the return type of `questionsOf` / `scan.Questions`, inside boundary files, not declared by name.
- untested? `Answers`: called by `CheckAnswers` to build the shape in every refusal; `TestCheckAnswers` and Q2's error strings run it. `setFrontmatterKey`: run through `writeRuling` by `TestWriteRulingShapes` and Q1's whole-file comparison.
- Outside boundary 0, new dependency 0 (no go.mod, package.json or lockfile change). The two `working-on/*.md` in the diff are card files. No `frontend/wailsjs/` change.

### Rows

- **Q1** `TestRuleQuestionRecord` (internal/service/rule_test.go): rules a temp copy of the fixture with `Q1 after-graph-performs-start-now, Q2 record-page` through `RuleDecision`, then compares the **whole file** with the source plus exactly five replacements (status, ruled, ruled_by, the quoted chosen, the signed line under `## Ruling`); rescans and asserts chosen, status and no problem on the record. Fails on main: `rule: chosen "Q1 after-graph-performs-start-now, Q2 record-page" is not one of decision 0002's options (...)`.
- **Q2** `TestRuleQuestionRefusals` (+ `TestQuestionRecordOneQuestion` in scan): Q2 missing → `does not answer Q2`; `Q1 nope, Q2 record-page` → `Q1 nope is not one of Q1's alternatives`; each compares the file's bytes before/after and `git rev-parse HEAD` before/after (nothing written, no commit). Plain record `tray` rules as today (`chosen: tray`). One-question `["Q1 a | b"]` with `b` and with `Q1 b` both rule and the rescan reports no problem on the record; the scan test checks both too. Fails on main: `error chosen "Q1 after-graph-performs-start-now" is not one of decision 0002's options (...), want it to mention "does not answer Q2"`, the same for `Q1 nope`, and `chosen "b" is not one of decision 0002's options (Q1 a | b)`, `chosen "Q1 b" ...`.
- **Q3** `TestQuestionRecordScan`, `TestQuestionRecord0038` (internal/scan/decisions_test.go): the fixture ruled as in Q1 reads with no problem; with `Q2 nope` exactly one problem containing `Q2 nope is not one of Q2's alternatives`; hestia 0038's options and hand-fixed chosen read with no problem (Amendment 1). Fails on main: `problems [... chosen "Q1 after-graph-performs-start-now, Q2 record-page" is not one of the options ...], want none`, `... want one naming "Q2 nope is not one of Q2's alternatives"`, `chosen "Q1 amend-exit, Q2 threads-and-specs-ok" is not one of the options`.
- **Q4** `RuleDecisionBox.test.tsx`: options parsed from the fixture file itself (`?raw`); fieldsets with legends `Q1`, `Q2`, three radios each with the fixture's alternatives; Rule disabled with none picked, with only Q1 (words typed), with both and blank words; enabled with both and words; `ruleDecision("hestia","0037","Q1 after-graph-performs-start-now, Q2 record-page","as recommended")`. Amendment 1: a one-alternative question draws one radio, no `checked=""` before a pick, disabled until Q1 is picked. Plain record still one `Chosen option` group. Fails on main (3 of 4, the plain-record test passes as it should): `expected [ { legend: 'Chosen option', …(1) } ] to deeply equal [ …(2) ]`, `Q1 after-graph-performs-start-now drawn: expected undefined to be defined`.
- Fails-on-main method: the new test files copied verbatim onto main fail to compile (`undefined: Questions`, `too many arguments in call to writeRuling`); to show behaviour, the Q1-Q3 test functions alone were appended to main's test files (dropping one `len(Questions(...))` clause) and run; the vitest file was copied unchanged.
- Fixture: `testdata/questions/0037-big-picture-stage.md` frontmatter diffed against hestia 0037: identical but `status: proposed` and empty `ruled`, `ruled_by`, `chosen` (set back to proposed, as the spec's "ruled as in Q1" needs). 0038's frontmatter is identical to hestia's. Outside `testdata/home/`; no golden file and no existing test changed (rule_test.go's only removed lines are the two `writeRuling` calls gaining `false`).
- Existing refusals hold: `TestRuleDecisionRefusals` (not proposed, chosen outside options, empty words), `TestRuleDecisionWritesAndCommits`, `TestRuleDecisionAnyOwner` unchanged and pass; the commit code in rule.go is untouched.

### My own inputs (RuleDecision on a temp fixture at 592359b, then a rescan)

| options | chosen | result | spec |
|---|---|---|---|
| `["Q1 a \| b", "plain"]` | `plain` | ruled `chosen: plain`, no problem | FR-1: not a question record, as today ✓ |
| same | `Q1 a \| b` | ruled, no problem | as today ✓ |
| `["Q2 a \| b", "Q3 x \| y"]` | `Q2 a, Q3 x` | refused "not one of decision 0002's options", nothing written | Amendment 1: plain list ✓ |
| same | `Q2 a \| b` | ruled | ✓ |
| `["Q1 a \| b", "Q3 x \| y"]` | `Q1 a, Q3 x` / `Q3 x \| y` | refused / ruled | plain list ✓ |
| `["Q1 only"]` | `only` / `Q1 only` | both ruled, quoted, no problem | Amendment 1 + FR-3 one-question forms ✓ |
| `["Q1 start now \| wait a bit", "Q2 record page \| elsewhere"]` | `Q1 wait a bit, Q2 record page` | ruled, no problem | ✓ |
| `["Q1 a \| b", "Q2 x \| y"]` | `Q2 y, Q1 a` | refused "does not answer Q1 in its place; ... ruled as \"Q1 <alt>, Q2 <alt>\"" | FR-3 order ✓ |
| same | `Q1 a, Q2 y, ` | refused "Q2 y, is not one of Q2's alternatives" | ✓ |
| same | `Q1 a,Q2 y` | refused "Q1 a,Q2 y is not one of Q1's alternatives" | ✓ |
| same | `` (empty) | refused, nothing written | ✓ |
| `["Q1 a \| b"]` | `Q1 b, ` | refused | ✓ |
| `["Q1 a \| b"]` | ` b ` | ruled, written `chosen: " b "` (padding kept) | Note below |
| `["Q1 say \"hi\" \| no", "Q2 x \| y"]` | `Q1 say "hi", Q2 x` | ruled, `chosen: "Q1 say \"hi\", Q2 x"`, rescan no problem | ✓ |

### Test run (X0)

- `XDG_DATA_HOME=$(mktemp -d) test-lease run --share -- make test` from the clean clone root: **fresh**, run `91df0864-67515` at 592359bc72 (l49-ui reused it at 16:14:19, per the lease log). Exit 0: every Go package ok; vitest 80 files, 1055 tests passed.
- `test-lease run -- pnpm run build` (frontend/): exit 0. `test-lease run -- wails build`: exit 0. `git status --porcelain`: empty (wailsjs/runtime not touched).

### Notes (not blocking)

- Note: a one-question record accepts a padded plain chosen (` b `) and writes it with the padding; CheckAnswers trims for one question only. Harmless (the box never sends it); to the FSE if it should be refused.
- Note: Q4's "none picked" state is asserted only with blank words; the "one picked, words typed" case covers the pick condition. To the FSE.
- Note: change-check reads only the first name of a comma-separated declared bullet (`questionsOf`, `answersOf`, …), giving three false undeclared flags. To the FSE (change-check's parser).

Reviewer: l49-review, 2026-10-24, at 592359b.
