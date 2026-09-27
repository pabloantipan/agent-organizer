---
title: The owner's ruling is written into a proposed record and committed
status: next
repos: [organizer]
branch: main
updated: 2026-09-26
next: "Write status, ruled, ruled_by, chosen and the Ruling into a proposed record, commit that one file, refuse everything else FR-13 names"
depends_on: ["redesign-runs-binding"]
boundary: ["internal/service/rule.go (new)", "internal/service/rule_test.go (new)", "internal/cli/rule.go (new)", "internal/cli/cli.go (dispatch and help)", "app.go (a RuleDecision method only)", "frontend/wailsjs/ (regenerated)", "frontend/src/hooks/useWails.ts (the rule wrapper)", "CLAUDE.md (line 37, per 0019)"]
spec: "docs/specs/redesign.md (FR-13); visual: docs/specs/redesign-mockups.html"
gate: "docs/specs/redesign.md Acceptance, rows G8, G9, G17; the Gate section below"
---

## Goal
The redesign, wave 1 of 2: FR-13 of `docs/specs/redesign.md`. Decisions 0013–0020.

## Gate
- [ ] G8: see `docs/specs/redesign.md`, Acceptance
- [ ] G9: see `docs/specs/redesign.md`, Acceptance
- [ ] G17: see `docs/specs/redesign.md`, Acceptance

## Done
- 2026-09-26 cut from the redesign spec by the FSE

## Next
1. Write status, ruled, ruled_by, chosen and the Ruling into a proposed record, commit that one file, refuse everything else FR-13 names

## Blockers
none

## Notes
- `stage:` is left out: the organizer has no roadmap yet (it waits on Pablo's intake); the FSE adds it once one is ruled
