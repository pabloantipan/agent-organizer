---
title: "A ruling's chosen is written trimmed, and a padded one still reads"
status: done
repos: [organizer]
branch: lf52-chosen-trim
seat: l52-trim
reviewer: l52-trim-review
stage:
updated: 2026-10-24
next: "done: reviewed pass at 304d4e8 (l52-trim-review); merge is sup93's"
review: pass
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
- Review finding 1 and note 3 fixed (304d4e8): a plain chosen is compared against trimmed options in RuleDecision and checkDecision (`scan.IsOption`); TestRuleChosenTrimmed asserts the whole record and rules a padded option, TestChosenPaddedByHand reads `" a "` and `a` against `[" a ", b]`; those four cases fail at d66f701 and pass at 304d4e8; X0 passes again from a clean clone.

## Declared changes
- added `internal/scan/decisions.go:TrimChosen`: the trimmed chosen a ruling writes
- added `internal/scan/decisions.go:splitAnswers`: one split of a question record's chosen, each answer trimmed, for CheckAnswers and TrimChosen
- modified `internal/scan/decisions.go:CheckAnswers`: uses splitAnswers
- added `internal/scan/decisions.go:IsOption`: a plain record's chosen against its options, both sides trimmed
- modified `internal/scan/decisions.go:checkDecision`: a plain chosen is compared with IsOption
- modified `internal/service/rule.go:RuleDecision`: trims chosen before checking and writing; a plain chosen is checked with IsOption
- modified `internal/scan/decisions_test.go`: TestChosenPaddedByHand (T1)
- modified `internal/service/rule_test.go`: TestRuleChosenTrimmed (T1), whole-record assert
Risky:
- `splitAnswers`: splits on `,` (was `, `), deciding a new answer on the trimmed piece; an alternative holding `, ` is glued back as written
Not changed, on purpose:
- `writeRuling`: every other byte as today (0019); only the chosen it is given is trimmed
- `Decision.Chosen`: the scan keeps the value as written; only the comparison trims

## Review

**Verdict: pass** at 304d4e8 (restarted on the moved branch: 5522dcf is d66f701 rebased, `git range-diff` shows `1: d66f701 = 1: 5522dcf`; 304d4e8 fixes the first round's finding 1 and Note 3). Unmet gate items: none. First round (d66f701, fail on finding 1, commit 7ad05c9) is superseded by this one.

### change-check (fresh clean clone at 304d4e8)

```
repo organizer: base 0226d09f4 (default origin/main) ... head lf52-chosen-trim (clone HEAD 304d4e894, on detached) 304d4e894; 4 files, 3 flags
## Changed
- organizer/internal/scan/decisions.go (modified): checkDecision, CheckAnswers, splitAnswers, TrimChosen, IsOption
- organizer/internal/scan/decisions_test.go (modified, test)
- organizer/internal/service/rule.go (modified): Service.RuleDecision
- organizer/internal/service/rule_test.go (modified, test)
## Flags
| untested? | organizer/internal/scan/decisions.go | splitAnswers | no test file names it |
| untested? | organizer/internal/scan/decisions.go | TrimChosen | no test file names it |
| untested? | organizer/internal/scan/decisions.go | IsOption | no test file names it |
3 flags: outside boundary 0, outside footprint 0, undeclared 0, declared, not changed 0, new env var 0, new dependency 0, new host 0, risk 0, untested? 3, could not read 0, boundary unreadable 0
```

No undeclared, outside boundary or declared-not-changed lines. The three `untested?` flags match names only: `splitAnswers` runs under `TestCheckAnswers` (through `CheckAnswers`), `TrimChosen` and `IsOption` under `TestRuleChosenTrimmed` (through `RuleDecision`) and `TestChosenPaddedByHand` (through `checkDecision`).

### T1

- `TestRuleChosenTrimmed` now compares the whole record: the source with only status, ruled, ruled_by, chosen and the Ruling line replaced (0019), plus no scan problem after the ruling. Cases: one-question `" b "` → `chosen: "b"`; `Q1 a , Q2 x` → `chosen: "Q1 a, Q2 x"`; plain `" tray "` → `chosen: tray`; options `[" tray ", fsnotify]` with `tray` and `" tray "` → `chosen: tray`. `TestChosenPaddedByHand`: hand-written padded plain, padded option (chosen padded and plain), one- and two-question records read with no problem. That is what the row asks, not less.
- Fails on main (0226d09, branch test files copied onto a clean main clone):
  ```
  --- FAIL: TestChosenPaddedByHand/a_plain_record
      decisions_test.go:261: problems [{... Msg:chosen " b " is not one of the options ...}], want none
  --- FAIL: TestChosenPaddedByHand/a_padded_option,_chosen_plain
      decisions_test.go:261: problems [{... Msg:chosen "a" is not one of the options ...}], want none
  --- FAIL: TestRuleChosenTrimmed/one_question,_plain      rule_test.go:532: record: (chosen: " b ")
  --- FAIL: TestRuleChosenTrimmed/two_questions            rule_test.go:532: record: (chosen: "Q1 a , Q2 x")
  --- FAIL: TestRuleChosenTrimmed/a_plain_record           rule_test.go:512: chosen " tray " is not one of decision 0002's options (tray, fsnotify, none)
  --- FAIL: TestRuleChosenTrimmed/a_padded_option,_chosen_plain   rule_test.go:512: chosen "tray" is not one of decision 0002's options ( tray , fsnotify)
  --- FAIL: TestRuleChosenTrimmed/a_padded_option,_chosen_padded  rule_test.go:532: record:
  ```
- My own whole-file probe (separate clone, not the branch) passes on 304d4e8 for one-question `" b "`, `Q1 a , Q2 x`, plain `" tray "`, plain tabs, `Q1 a,Q2 x` and tabbed answers: byte-equal record, one commit touching one file, trimmed commit subject (`(b)`, `(Q1 a, Q2 x)`, `(tray)`), clean tree, no scan problem. Met.

### Own inputs at 304d4e8

| Input | Result | Spec |
|---|---|---|
| rule plain `"\ttray\t"` | `chosen: tray`, whole file as 0019 | allowed |
| rule `Q1 a,Q2 x` (no space) | `chosen: "Q1 a, Q2 x"`; main refused | not asked; Note 1 |
| rule `"\tQ1 a\t,\tQ2 x\t"` | `chosen: "Q1 a, Q2 x"` | allowed |
| rule `"   "` on plain / two-question / one-question | refused (`chosen "" is not one of ... options`, `does not answer Q1 in its place`), nothing written or committed | allowed |
| rule `" nope "`, empty words, withdrawn record | refused, nothing written (`TestRuleDecisionRefusals`, `TestRuleQuestionRefusals` pass too) | existing refusals hold |
| rule options `[" tray ", fsnotify]`, `tray` / `" tray "` (round-1 finding 1) | ruled, `chosen: tray` | fixed |
| scan options `[" a ", b]`, `chosen: " a "` / `a` (round-1 finding 1) | no problem | fixed |
| scan `chosen: "\tb\t"`, `"Q1 a,Q2 x"` | no problem | allowed |
| scan `chosen: "   "`, `" c "` on `[a, b]` | problem `... is not one of the options` | allowed |
| rule `"   "` on `options: [tray, ""]` | ruled, `chosen:` written empty; main ruled `""` the same way and refused only `"   "` | Note 2 |

### Notes (none blocking)

1. `Q1 a,Q2 x` with no space is now accepted and written `Q1 a, Q2 x`. The spec asks only for trimming; this is a harmless normalisation it neither asks for nor forbids. To the FSE.
2. Nothing refuses an empty chosen: on a record with an empty option (`options: [tray, ""]`) main already rules `""` and writes `chosen:` empty; with trimming `"   "` now does the same. Older than this card (the empty-option record is malformed anyway); a "chosen must not be empty" refusal in `RuleDecision` would close it. To the FSE.

### X0

From the fresh clean clone at 304d4e8: `CI=true test-lease run -- pnpm install --frozen-lockfile` (frontend/); `XDG_DATA_HOME=$(mktemp -d) test-lease run --share -- make test`: **fresh**, run id `c18dfbd3d84008decf19f21b363f2ada` (sha 304d4e8947b6), rc 0, 19 Go packages ok, vitest 84 files / 1153 tests passed. `test-lease run -- pnpm run build`: rc 0. `test-lease run -- wails build`: rc 0. `git status --porcelain`: empty (wails did not touch `frontend/wailsjs/runtime`). Met.

Reviewer: l52-trim-review, 2026-10-24.
