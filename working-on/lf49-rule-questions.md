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

## UI review

**Verdict: pass.** Reviewed 592359b (detached worktree, `make review-build`, `Deltagos Review` launched by me from the fixture home with the copied records; AX reads and presses on its pid, `screencapture -l` of its window). Reviewer `l49-ui`, 2026-10-24. No severity 4 or 3.

**Fixture.** `scripts/fixture-home.sh` (config carries `discuss_state_dir: <tmp>/discuss`; no `editor:` line, Open in editor never pressed). In the temp init-a only: `0013-big-picture-stage.md` = `testdata/questions/0037…` as is (proposed); `0014-usage-exit-amended.md` = `testdata/questions/0038…` set back to proposed (Q1 `amend-exit`, one alternative). Ruling wrote and committed only there: `58f3412 docs(decisions): rule 0013 big-picture-stage (Q1 after-graph-performs-start-now, Q2 record-page)`, `5b069ef … rule 0014 usage-exit-amended (Q1 amend-exit, Q2 strip-code-blocks)`, `4b78c93 … rule 0002 where-the-fixture-runs (two-machines)`; `git status --porcelain` of the root checkout empty after, hestia-monorepo's one dirty line the same before and after.

**States, how checked** (shots in `.wt-notes/l49-ui/`):

| State | Where | How | Result |
|---|---|---|---|
| two groups, nothing picked | Decisions 1024 (`1024x640-dec-q-none.png`), 1440 | AX: `AXGroup d="Q1"` and `d="Q2"` (`.rb-options`), three `AXRadioButton` each, all `v=0` | ✓ FR-2 |
| Rule, none picked | Decisions 1024 | AX `enabled=0` | ✓ |
| Q1 only | Decisions 1024 (`-q1only`) | AXPress radio; `enabled=0` | ✓ |
| both, no words | Decisions 1024 (`-both-nowords`) | `enabled=0` | ✓ |
| both + words | Decisions 1024/1440 (`-ready`) | words set by AX value; `enabled=1` | ✓ |
| ruled | `1440x900-dec-q-ruled.png` | Rule pressed; file `chosen: "Q1 after-graph-performs-start-now, Q2 record-page"` | ✓ FR-3 |
| list line | Ruled · 7 at 1440; 1024 (`-dec-ruled-list`) | line name `ruled, “Q1 after-graph-performs-start-now, Q2 record-page”, by pablo, 24 Oct` | ✓ FR-5 (see U1 at 1024) |
| one-alternative Q1, nothing picked | Needs me 1024 (`-needsme-q1one-none`) | one radio `amend-exit` `v=0` | ✓ Amendment 1 |
| Q1 + words, Q2 unpicked | Needs me 1024 (`-needsme-q1-words-noq2`) | `enabled=0` | ✓ |
| both + words, ruled | Needs me 1440 (`1440x900-needsme-q-ready`) | `enabled=1`; file `chosen: "Q1 amend-exit, Q2 strip-code-blocks"`; `organizer status` names no chosen problem (only the fixture's "stage … is not on the roadmap") | ✓ |
| plain record 0002 | Needs me 1024 (`-needsme-plain-*`) | one group `CHOSEN OPTION`, 2 radios; disabled → enabled as on main; ruled `chosen: two-machines` unquoted | ✓ as main |

**Words, screen vs source.** Legends `Q1`, `Q2` (the `.rb-label` uppercase leaves them as written); radio labels = the alternatives verbatim (`after-graph-performs-start-now`, `after-graph-performs-wait`, `before-graph-performs`, `record-page`, `neo4j-perspective`, `organizer-view`, `amend-exit`, `threads-and-specs-ok`, `strip-code-blocks`, `exclude-threads`); `YOUR WORDS`; placeholder `Why this option, in your words. They go under ## Ruling.`; `signed pablo · commits one file`; `Cancel`; `Rule`; plain legend `CHOSEN OPTION`; ruling line `pablo, 2026-10-24, in the organizer on fixture: as recommended (ui review)`; list `“Q1 after-graph-performs-start-now, Q2 record-page”`. All match the code and the spec.

**Design system.** Groups reuse `.rb-options`/`.rb-label`/`.rb-option` unchanged: same row, radio mark, selected fill and border, gap `--space-3` between groups (box gap). Disabled Rule is the same `.primary` through `busyButton` as main (incomplete: no reason text, design system Disabled actions). Reading order in the AX tree: title, Q1 legend, its radios, Q2 legend, its radios, words, foot.

**Findings**

- **U1 (2) — a question record's answer to Q2 cannot be read in the Decisions list at 1024.** Where: Decisions, Ruled, 1024×640 (`1024x640-dec-ruled-list.png`): the line reads `"Q1 ame…"`; opening the record shows options and the Ruling words, not `chosen`. Evidence: the full chosen is only in the line's accessible name/title. Severity 2 (FR-5 is met as written; the floor is the existing `CHOSEN_FLOOR`, which a two-answer chosen now always hits). Proposal: show `chosen` in the opened record's head for every ruled record, or floor per answer (`Q1 ame…, Q2 str…`). For aglaea.
- **U2 (2) — the group's name is `Q1` alone.** Where: the box in both places; AX group description `Q1`. Evidence: a screen reader hears "Q1, group", and in the capped 1024 Decisions box the record text with "Q1. Where in the order?" is outside the box. Severity 2; FR-2 asks for legend `Q<n>`, so conforming. Proposal: legend `Q1 · <the record's Q1 line>` when the Question section has a `**Q1. …**` line, else `Q1`. Spec gap, for aglaea.
- **U3 (2) — at 1024 in Decisions the box opens with Q2 below its fold while Rule is disabled.** Where: `1024x640-dec-q-none.png`: Q1's three radios and the pinned foot; Q2 only after scrolling the box. Evidence: the design system's incomplete treatment assumes "the missing input is in view"; the box shows its edge (leftovers-7 FR-5), as for a long plain list. Severity 2. Proposal: name what is missing as text in the foot beside Rule (`Q2 not answered yet`), or keep it as long plain lists are. For aglaea.
- **U4 (1) — placeholder says "Why this option" for a record ruled with several answers.** Proposal: `Why these answers, …` for a question record. For aglaea.

**Shared test run.** `XDG_DATA_HOME=$(mktemp -d) test-lease run --share -- make test` from my worktree at 592359b: **reused** run `91df0864-67515` of 592359bc72a8 by organizer-probe-l49-review (exit 0; Go ok, vitest 80 files / 1055 tests passed).

**Spec gaps (FSE).** FR-5 says "as written" but not at which width (U1); FR-2 names the legend but not the question's words (U2).

**For aglaea.** U1, U2, U3, U4.

**Not verified in WKWebView.** Arrow keys within a group and Tab between groups: no real key input allowed; from the DOM each group is its own `<fieldset>` + `<legend>` with radio `name` `<id>-Q<n>`, so native radio grouping applies (one Tab stop per group, arrows move and pick within it). Focus ring: AX focus landed on `record-page` but the review window was not key, so WebKit painted no ring; the rule `.rb-option input:focus + span` (rule-box.css) is the one the plain box uses and applies to the new radios unchanged.

Reviewer: l49-ui, 2026-10-24, at 592359b.
