---
title: One layer order (the card back above the rule box), focus back to the box below, the scrim under the top bar, blocked never folds, edges and words
status: next
repos: [organizer]
branch: layers-focus-and-words
updated: 2026-10-04
next: "lf7-build builds it in .wt/layers-focus-and-words (sup33)"
seat: lf7-build
depends_on: [timeline-and-find-6]
boundary: ["frontend/src/styles/tokens.css (z-index tokens), global.css (.modal-backdrop and layer z-index), decisions.css, rule-box.css, home.css, time-zoom.css", "frontend/src/components/RuleDecisionBox.tsx, HelpView.tsx and CardDrawer.tsx (focus return and layer only), DecisionsView.tsx (Rule's name, FR-11), Home.tsx, TimeZoom.tsx, StageRoadmap.tsx (the sticky axis only)", "frontend/src/lib/width.ts, lib/axis.ts, lib/decisionsPage.ts, lib/useScrollEdges.ts and lib/ tests", "testdata/fixture-overlay/", "not: Go, docs/design-system.md"]
spec: "docs/specs/leftovers-7.md (FR-1 to FR-9); the ranking docs/ux/reviews/2026-10-04-rank-leftovers-7.md (Aglaea, adfce1e); the design system as amended there"
gate: "docs/specs/leftovers-7.md Acceptance, rows P1 to P8 and P0"
ui_review: true
---

## Goal
sup31's leftovers, the severity-3 layer bug first.

## Gate
- [ ] P1-P8: see `docs/specs/leftovers-7.md`, Acceptance
- [ ] P0: see `docs/specs/leftovers-7.md`, Acceptance

## Done
- 2026-10-04 0078 ruled by pablo ("Ok", accept as written, 045ff78); sup33 launched by the FSE
- 2026-10-04 cut from leftovers-7 by the FSE

## Next

## Blockers

## Notes
