---
title: Anyone may rule a proposed record, and the record notes who did
status: next
repos: [organizer]
branch: main
updated: 2026-09-28
next: "Offer Rule on every proposed record on the Decisions tab, sign ruled_by with the ruler (cell human, else pablo) and name the owner in the Ruling line; drop the no-owner refusal (0045)"
depends_on: []
boundary: ["internal/service/rule.go", "internal/service/rule_test.go", "internal/cli/rule.go (help text only, if it says owner)", "frontend/src/components/DecisionsView.tsx (the Rule condition)", "frontend/src/components/RuleDecisionBox.tsx (labels only)", "testdata/fixture-overlay/ (a proposed record owned by alejandro)", "CLAUDE.md (the Decisions bullet's sentence on who signs a ruling)"]
spec: "docs/specs/twenty-at-a-glance.md (FR-12, FR-14); values: docs/design-system.md"
gate: "docs/specs/twenty-at-a-glance.md Acceptance, rows G17, G10; the Gate section below"
stage: twenty-at-a-glance
---

## Goal
Pablo could not rule camp's 0005 (owner alejandro, who is Pablo). 0045: anyone may rule, and the record notes who did.

## Gate
- [ ] G17: see `docs/specs/twenty-at-a-glance.md`, Acceptance
- [ ] G10: see `docs/specs/twenty-at-a-glance.md`, Acceptance

## Done
- 2026-09-28 cut by the FSE (0045)

## Next
1. Rule on any proposed record; ruled_by is the ruler

## Blockers
none

## Notes
- 2026-09-28 sup14 runs this card (organizer-probe-sup14), spawned by the FSE
