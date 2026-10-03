---
title: Record bodies never widen the view, dimmed by token not opacity, no cut axis label, the rule box's own placement
status: next
repos: [organizer]
branch: markdown-and-labels
updated: 2026-10-03
next: "decide: pablo - accept 0075 (leftovers-4); then the FSE starts its supervisor once header-fold-3, home-widths-4 and zoom-decisions-polish are in done/"
depends_on: [header-fold-3, home-widths-4, zoom-decisions-polish]
boundary: ["frontend/src/styles/global.css (.markdown and .dec.* rules only)", "frontend/src/styles/rule-box.css, frontend/src/components/RuleDecisionBox.tsx, frontend/src/styles/decisions.css (the !important placement only)", "frontend/src/components/TimeZoom.tsx, frontend/src/lib/axis.ts, frontend/src/components/StageRoadmap.tsx (axis labels only)", "frontend/src/lib/ tests", "testdata/fixture-overlay/, scripts/fixture-home.sh", "not: Go, docs/design-system.md"]
spec: "docs/specs/leftovers-4.md (FR-9 to FR-12); the ranking docs/ux/reviews/2026-10-03-rank-leftovers-4.md (Aglaea, 94308ad); the design system as amended there"
gate: "docs/specs/leftovers-4.md Acceptance, rows L9 to L11 and L0"
ui_review: true
---

## Goal
The second half of sup27's leftovers, the part that shares files with
sup28's cards and with zoom-decisions-polish.

## Gate
- [ ] L9-L11: see `docs/specs/leftovers-4.md`, Acceptance
- [ ] L0: see `docs/specs/leftovers-4.md`, Acceptance

## Done
- 2026-10-03 cut from leftovers-4 by the FSE

## Next

## Blockers

## Notes
