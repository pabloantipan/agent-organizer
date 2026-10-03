---
title: Escape closes the top box only, a rule box never covers its opener, stage landings show their detail, duplicate stage ids said plainly
status: next
repos: [organizer]
branch: rule-box-and-stages
updated: 2026-10-03
next: "decide: pablo - accept 0077 (leftovers-5); then the FSE starts its supervisor once markdown-and-labels is in done/"
depends_on: [markdown-and-labels]
boundary: ["frontend/src/components/RuleDecisionBox.tsx, frontend/src/styles/rule-box.css", "frontend/src/components/HelpView.tsx and CardDrawer.tsx (their Escape only)", "frontend/src/styles/decisions.css (the box placement only)", "frontend/src/components/StageRoadmap.tsx", "frontend/src/lib/ and its tests", "testdata/fixture-overlay/", "not: home-signals-5's files, DecisionsView.tsx, Go, docs/design-system.md"]
spec: "docs/specs/leftovers-5.md; the ranking docs/ux/reviews/2026-10-03-rank-leftovers-5.md (Aglaea, 31f7ac9); the design system as amended there"
gate: "docs/specs/leftovers-5.md Acceptance, rows M1 to M3, M8 and M0"
ui_review: true
---

## Goal
leftovers-5 FR-1 to FR-6: the rule box's and the stages' rows.

## Gate
- [ ] M1-M3: see `docs/specs/leftovers-5.md`, Acceptance
- [ ] M8: see `docs/specs/leftovers-5.md`, Acceptance (amendment 1)
- [ ] M0: see `docs/specs/leftovers-5.md`, Acceptance

## Done
- 2026-10-03 amendment 1 of leftovers-5 adds M8 (from leftovers-6), proposed with 0077
- 2026-10-03 cut from leftovers-5 by the FSE

## Next

## Blockers

## Notes
Runs in parallel with its pair; boundaries disjoint.
