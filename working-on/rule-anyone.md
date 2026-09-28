---
title: Anyone may rule a proposed record, and the record notes who did
status: now
repos: [organizer]
branch: main
updated: 2026-09-28
next: "review: rule-anyone, branch rule-anyone, gate G17, G10 met, 6d8035b 6aceddd 0847c6d c08c8ab d2f54a5"
depends_on: []
boundary: ["internal/service/rule.go", "internal/service/rule_test.go", "internal/cli/rule.go (help text only, if it says owner)", "frontend/src/components/DecisionsView.tsx (the Rule condition)", "frontend/src/components/RuleDecisionBox.tsx (labels only)", "testdata/fixture-overlay/ (a proposed record owned by alejandro)", "CLAUDE.md (the Decisions bullet's sentence on who signs a ruling)"]
spec: "docs/specs/twenty-at-a-glance.md (FR-12, FR-14); values: docs/design-system.md"
gate: "docs/specs/twenty-at-a-glance.md Acceptance, rows G17, G10; the Gate section below"
stage: twenty-at-a-glance
seat: rule-build
---

## Goal
Pablo could not rule camp's 0005 (owner alejandro, who is Pablo). 0045: anyone may rule, and the record notes who did.

## Gate
- [x] G17: see `docs/specs/twenty-at-a-glance.md`, Acceptance
- [x] G10: see `docs/specs/twenty-at-a-glance.md`, Acceptance

## Done
- 2026-09-28 cut by the FSE (0045)
- 2026-09-28 rule-build: built on branch rule-anyone (rebased on main 2b7eb18): 6d8035b service (ruled_by = cell human else pablo; Ruling line `<ruler>, <date>, owner <owner>, in the organizer on <machine>:`, owner only when different; no-owner ruled), 6aceddd CLI help, 0847c6d Decisions tab Rule on every proposed record + box signs the ruler, c08c8ab fixture 0005 owned by alejandro, d2f54a5 CLAUDE.md. Notes: .wt-notes/rule-build/progress.md
- 2026-09-28 G17: `go test ./internal/service/ -run TestRuleDecision -v` → `--- PASS: TestRuleDecisionAnyOwner` (alejandro → `ruled_by: pablo`, line names pablo and alejandro, one file, one commit; no owner ruled; cell human rules) (.wt-notes/rule-build/g17-test.txt); screenshots .wt-notes/rule-build/g17-rule-box-alejandro.png ("signed pablo · owner alejandro") and g17-ruled-alejandro.png (ruled, no Rule, Ruling line shown); `git -C $FIXTURE_HOME/init-a log -1 --stat` → `1 file changed, 6 insertions(+), 4 deletions(-)` (g17-git-log.txt)
- 2026-09-28 G10: `cd frontend && npm run build` → `✓ built in 1.09s` (npm-build.txt); G18 grep on `main...rule-anyone` → empty (g18-grep.txt, 0 lines); `go test ./...` → 13 ok, no FAIL (go-test.txt); `wails build` exit 0, wailsjs mode flips restored

## Next
1. Rule on any proposed record; ruled_by is the ruler

## Blockers
none

## Notes
- 2026-09-28 rule-build: leadOf lowercases the cell's human for the box's label while ruled_by is written as spelled in cell.json; same today (all lowercase), differs for a "Pablo" spelling
- 2026-09-28 sup14 runs this card (organizer-probe-sup14), spawned by the FSE
- 2026-09-28 sup14: builder seat rule-build in worktree .wt/rule-anyone (branch rule-anyone); sup14 merges after review
