---
title: The rule box's tables scroll, the facts line stays while ruling, his words kept verbatim, dates in words, make test from a clean checkout
status: next
repos: [organizer]
branch: rule-words-and-dates
updated: 2026-10-04
next: "rwd-build builds it in .wt/rule-words-and-dates (sup35, 2026-10-04)"
depends_on: []
boundary: ["frontend/src/styles/rule-box.css, decisions.css, home.css; frontend/src/components/RuleDecisionBox.tsx, DecisionsView.tsx, Home.tsx", "frontend/src/components/Conversation.tsx (the composer's attributes only), CardDrawer.tsx and its CSS (cap, scroll, comments' attributes)", "frontend/src/components/TimeZoom.tsx (.tz-more name, Timeline names' dates), StageRoadmap.tsx (dates only)", "frontend/src/lib/dates.ts and lib/ tests", "testdata/fixture-overlay/", "Makefile (the test target only)", "not: Go, docs/design-system.md"]
spec: "docs/specs/leftovers-8.md (FR-1 to FR-8); the ranking docs/ux/reviews/2026-10-04-rank-leftovers-8.md (Aglaea, 10bc67a); the design system's Principles as amended there"
gate: "docs/specs/leftovers-8.md Acceptance, rows Q1 to Q7 and Q0"
ui_review: true
seat: rwd-build
---

## Goal
sup33's leftovers with Aglaea's A1-A3.

## Gate
- [ ] Q1-Q7: see `docs/specs/leftovers-8.md`, Acceptance
- [ ] Q0: see `docs/specs/leftovers-8.md`, Acceptance

## Done
- 2026-10-04 0080 ruled by pablo ("Ok", 5fa5b5e); sup35 launched by the FSE
- 2026-10-04 cut from leftovers-8 by the FSE

## Next

## Blockers

## Notes
