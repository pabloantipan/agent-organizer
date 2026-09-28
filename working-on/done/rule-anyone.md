---
title: Anyone may rule a proposed record, and the record notes who did
status: done
repos: [organizer]
branch: main
updated: 2026-09-28
next: "sup14: merge rule-anyone (review pass)"
depends_on: []
boundary: ["internal/service/rule.go", "internal/service/rule_test.go", "internal/cli/rule.go (help text only, if it says owner)", "frontend/src/components/DecisionsView.tsx (the Rule condition)", "frontend/src/components/RuleDecisionBox.tsx (labels only)", "testdata/fixture-overlay/ (a proposed record owned by alejandro)", "CLAUDE.md (the Decisions bullet's sentence on who signs a ruling)"]
spec: "docs/specs/twenty-at-a-glance.md (FR-12, FR-14); values: docs/design-system.md"
gate: "docs/specs/twenty-at-a-glance.md Acceptance, rows G17, G10; the Gate section below"
stage: twenty-at-a-glance
seat: rule-build
review: pass
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

## Review
Verdict: pass. Branch rule-anyone (6d8035b..d2f54a5) meets G17 and G10.

Unmet gate items: none.

Evidence (.wt-notes/rule-review/):
- G17: `go test ./internal/service/ -count=1` ok. TestRuleDecisionAnyOwner passes all 5 cases (g17-test.txt). The alejandro case asserts `ruled_by: pablo` and the line `pablo, 2026-09-28, owner alejandro, in the organizer on lodestar: …`. It also asserts one commit that touches only the record, and a clean tree. It covers `owner:` empty and no owner key, and both rule. Screenshot g17-rule-box-alejandro.png shows the box on 0005 (owner alejandro), signed "pablo · owner alejandro". g17-ruled-alejandro.png shows 0005 ruled "by pablo" with the Ruling line and no Rule button. I re-ran `git -C $FIXTURE_HOME/init-a log -1 --stat` on the builder's fixture: 1 file changed, and the diff has `ruled_by: pablo` and the owner-naming line (g17-fixture-check.txt). The diff removes the `ownedByLead` gate from DecisionsView's canRule and the no-owner refusal from rule.go.
- G10: `npm run build` → `✓ built in 1.28s` (npm-build.txt). The G18 grep on `main...rule-anyone` is empty: exit 1, 0 lines (g18-grep.txt). The tree was clean after the build.
- Every changed file is inside the boundary.

Findings the gate does not cover:
- The Rule box's label uses `leadOf`, which lowercases the cell's `human`, but `ruler()` writes it as spelled. A cell with `"human": "Pablo"` would show "signed pablo" but write `ruled_by: Pablo`. Every cell is lowercase today. The builder noted it too.
- G17 has no test for the Decisions tab's Rule condition (a frontend check). Only the screenshot proves it.

Reviewer: rule-review, 2026-09-28

## Next
1. Rule on any proposed record; ruled_by is the ruler

## Blockers
none

## Notes
- 2026-09-28 rule-build: leadOf lowercases the cell's human for the box's label while ruled_by is written as spelled in cell.json; same today (all lowercase), differs for a "Pablo" spelling
- 2026-09-28 sup14 runs this card (organizer-probe-sup14), spawned by the FSE
- 2026-09-28 sup14: builder seat rule-build in worktree .wt/rule-anyone (branch rule-anyone); sup14 merges after review
