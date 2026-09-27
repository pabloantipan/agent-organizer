---
title: The owner's ruling is written into a proposed record and committed
status: next
repos: [organizer]
branch: redesign-rule-record
updated: 2026-09-26
next: "review: redesign-rule-record, gate G8, G9, G17 met, f6f6c7b 80c5055 748bb9f 180e8eb"
seat: wave1-rule
depends_on: ["redesign-runs-binding"]
boundary: ["internal/service/rule.go (new)", "internal/service/rule_test.go (new)", "internal/cli/rule.go (new)", "internal/cli/cli.go (dispatch and help)", "app.go (a RuleDecision method only)", "frontend/wailsjs/ (regenerated)", "frontend/src/hooks/useWails.ts (the rule wrapper)", "CLAUDE.md (line 37, per 0019)"]
spec: "docs/specs/redesign.md (FR-13); visual: docs/specs/redesign-mockups.html"
gate: "docs/specs/redesign.md Acceptance, rows G8, G9, G17; the Gate section below"
---

## Goal
The redesign, wave 1 of 2: FR-13 of `docs/specs/redesign.md`. Decisions 0013–0020.

## Gate
- [x] G8: see `docs/specs/redesign.md`, Acceptance
- [x] G9: see `docs/specs/redesign.md`, Acceptance
- [x] G17: see `docs/specs/redesign.md`, Acceptance

## Done
- 2026-09-26 cut from the redesign spec by the FSE
- 2026-09-26 FR-13 built on `redesign-rule-record` (f6f6c7b, 80c5055, 748bb9f, 180e8eb, rebased onto main, unmerged). `Service.RuleDecision` (`internal/service/rule.go`) writes `status: ruled`, `ruled`, `ruled_by` (the record's `owner`, A4) and `chosen` into a proposed record and the words under `## Ruling` as "<owner>, <date>, in the organizer on <machine>: <words>", editing the file as text so every other byte survives, then shells out to git to commit that one file. `organizer rule <initiative> <NNNN> --chosen <option> --words <text>` (`internal/cli/rule.go`, dispatch and help in `cli.go`), `App.RuleDecision` bound with the wailsjs bindings regenerated and `api.ruleDecision` in `useWails.ts`, CLAUDE.md's Decisions bullet rewritten per 0019.
  - G8 met: `TestRuleDecisionWritesAndCommits` in `internal/service/rule_test.go` rules a proposed fixture in a temp git repo and asserts the diff's added lines are exactly `status: ruled`, `ruled: 2026-09-26`, `ruled_by: pablo`, `chosen: fsnotify` and the ruling line, that `## Consequences` and the options survive, and `git show --name-only` has one file with one commit; `TestRuleDecisionRefusals` gives each refusal its own fixture (ruled again, a chosen outside options, no chosen, empty words, a record that is not there) and asserts the record is byte-identical, HEAD unmoved and the tree clean; `TestWriteRulingShapes` covers a missing key, a missing heading, an occupied section and multi-line words. `go test ./internal/service/ -run TestRuleDecision -v` → `--- PASS: TestRuleDecisionWritesAndCommits`, `--- PASS: TestRuleDecisionRefusals`. `go run . rule --help` prints the usage and exits 0.
  - G9 met: `XDG_DATA_HOME=$(mktemp -d) make test` in the worktree after the rebase → `ok` for all 13 packages with tests (`ok organizer/internal/service 15.645s`, `ok organizer/internal/cli 16.097s`), no golden refresh needed.
  - G17 met: `git diff --name-only main...redesign-rule-record -- '*.css'` prints nothing.

## Next
1. review: redesign-rule-record, gate G8, G9, G17 met, f6f6c7b 80c5055 748bb9f 180e8eb

## Blockers
none

## Notes
- Two refusals FR-13 does not name are preflighted, so nothing is written half-way: a record with no `owner` (A4 signs the ruling with the owner, so there is nothing to sign with) and a record whose directory is not in a git repo (the commit could not happen). Phase notes, including the rebase conflict with main's new "Goal and stages" CLAUDE.md bullet, are in `.wt-notes/wave1-rule/progress.md`.
- `stage:` is left out: the organizer has no roadmap yet (it waits on Pablo's intake); the FSE adds it once one is ruled
- 2026-09-26 sup2 runs this card (organizer-probe-sup2), spawned by the FSE after 0023; seat wave1-rule, worktree .wt/redesign-rule-record, branch redesign-rule-record
