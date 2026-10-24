---
title: "A ruling's chosen is written trimmed, and a padded one still reads"
status: next
repos: [organizer]
branch: lf52-chosen-trim
seat: l52-trim
reviewer: l52-trim-review
stage:
updated: 2026-10-24
next: "review: lf52-chosen-trim, T1 and X0 pass after finding 1 fixed, 304d4e8"
review: fail
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

**Verdict: fail** at d66f701 (branch not moved). Unmet gate items: none (T1 and X0 met). The card fails on one proved finding outside the gate (finding 1), per the review's own rule.

### change-check (from the clean clone)

```
repo organizer: base 52824d273 (default origin/main) ... head lf52-chosen-trim (clone HEAD d66f701ca, on detached) d66f701ca; 4 files, 2 flags
## Changed
- organizer/internal/scan/decisions.go (modified): checkDecision, CheckAnswers, splitAnswers, TrimChosen
- organizer/internal/scan/decisions_test.go (modified, test)
- organizer/internal/service/rule.go (modified): Service.RuleDecision
- organizer/internal/service/rule_test.go (modified, test)
## Flags
| untested? | organizer/internal/scan/decisions.go | splitAnswers | no test file names it |
| untested? | organizer/internal/scan/decisions.go | TrimChosen | no test file names it |
2 flags: outside boundary 0, outside footprint 0, undeclared 0, declared, not changed 0, new env var 0, new dependency 0, new host 0, risk 0, untested? 2, could not read 0, boundary unreadable 0
```

No undeclared, outside boundary or declared-not-changed lines. The two `untested?` flags are name-matching only: `splitAnswers` runs under `TestCheckAnswers` (via `CheckAnswers`) and `TrimChosen` under `TestRuleChosenTrimmed` (via `RuleDecision`); both are exercised.

### T1

- `TestRuleChosenTrimmed` (rule_test.go): one-question `" b "` → `chosen: "b"`; `Q1 a , Q2 x` → `chosen: "Q1 a, Q2 x"`; plain `" tray "` → `chosen: tray`. `TestChosenPaddedByHand` (decisions_test.go): hand-written padded plain, one-question and two-question records read with no problem.
- Fails on main (branch test files copied onto a clean main clone, 52824d2):
  ```
  --- FAIL: TestChosenPaddedByHand/a_plain_record
      decisions_test.go:258: problems [{... Msg:chosen " b " is not one of the options ...}], want none
  --- FAIL: TestRuleChosenTrimmed/one_question,_plain   ... chosen: " b "
  --- FAIL: TestRuleChosenTrimmed/two_questions         ... chosen: "Q1 a , Q2 x"
  --- FAIL: TestRuleChosenTrimmed/a_plain_record
  ```
- Whole file: the branch test checks only the chosen line. My own probe (in a separate clone, not the branch) compares the whole record against the source with only status, ruled, ruled_by, chosen and the Ruling line replaced, for one-question `" b "`, `Q1 a , Q2 x` and plain `" tray "`: byte-equal; one commit, one file, clean tree, subject `docs(decisions): rule 0002 phase-4-polish (b)` / `(Q1 a, Q2 x)` / `(tray)` (trimmed). 0019 holds. Met.

### Own inputs (branch; main where it differs)

| Input | Branch | Spec |
|---|---|---|
| rule plain `"\ttray\t"` | `chosen: tray`, whole file as above | allowed (trim) |
| rule `Q1 a,Q2 x` (no space) | `chosen: "Q1 a, Q2 x"`; main refused it | not asked; Note 2 |
| rule `"\tQ1 a\t,\tQ2 x\t"` | `chosen: "Q1 a, Q2 x"` | allowed |
| rule chosen `"   "`: plain / two-question / one-question | refused: `chosen "" is not one of ... options` / `does not answer Q1 in its place` (both), nothing written or committed | allowed |
| rule `" nope "` | refused, nothing written | allowed |
| rule empty words, withdrawn record | refused (`a ruling needs the ruler's words`, `is withdrawn, not proposed`), nothing written | existing refusals hold (also `TestRuleDecisionRefusals`, `TestRuleQuestionRefusals` pass in make test) |
| rule options `[" tray ", fsnotify]`, chosen `tray` or `" tray "` | **refused** `chosen "tray" is not one of decision 0002's options ( tray , fsnotify)`; main ruled `" tray "` | finding 1 |
| scan ruled `chosen: "\tb\t"`, options `[a, b]` | no problem (main: problem) | allowed |
| scan ruled options `[" a ", b]`, `chosen: " a "` | **problem** `chosen " a " is not one of the options`; main: none | finding 1 |

### Findings

1. **Blocking (proved, outside the gate).** FR-6 trims the chosen side only. A plain record whose option is quoted with padding (`options: [" tray ", fsnotify]`) can no longer be ruled from the organizer with any chosen (`chosen "tray" is not one of decision 0002's options ( tray , fsnotify)`), and a hand-written `chosen: " a "` against `options: [" a ", b]` that main reads clean is now a problem (`chosen " a " is not one of the options`). FR-6 says the scan "compares trimmed forms, so a record written padded by hand still reads"; this record read on main and does not here. Question records already trim each alternative in `Questions`, so plain options are the one side left. Fix in the boundary: compare against trimmed options in `RuleDecision` and `checkDecision`. No real record carries a padded quoted option today (grep of `working-on/decisions/` under ~), so it is a latent regression, but it is concrete. Goes to: lf52-chosen-trim (back to l52-trim).
2. Note: `Q1 a,Q2 x` (no space) is now accepted and written `Q1 a, Q2 x`; main refused it. The spec asks only for trimming; this is a harmless normalisation the spec neither asks for nor forbids. To the FSE.
3. Note: T1's rule test asserts the chosen line with `strings.Contains`, not the whole file; 0019's every-other-byte is covered by `TestRuleDecisionWritesAndCommits` and `TestRuleQuestionRecord` for unpadded input and by my probe for padded input. A whole-file assert in `TestRuleChosenTrimmed` would close it. To lf52-chosen-trim.

### X0

From the clean clone at d66f701: `CI=true test-lease run -- pnpm install --frozen-lockfile` (frontend/); `XDG_DATA_HOME=$(mktemp -d) test-lease run --share -- make test`: **fresh**, run id `d8a9e5432b1dedc8e7d8f12e389bf212` (sha d66f701cad99), rc 0, every Go package ok, vitest 84 files / 1153 tests passed. `test-lease run -- pnpm run build`: rc 0. `test-lease run -- wails build`: rc 0, `build/bin/Deltagos.app`. `git status --porcelain`: empty (wails did not touch `frontend/wailsjs/runtime`). Met.

Reviewer: l52-trim-review, 2026-10-24.
