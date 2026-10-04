---
title: The document never scrolls; signals fold against floors in rendered width; the scroll edge visible; names and dates
status: next
repos: [organizer]
branch: home-signals-5
updated: 2026-10-04
next: "hs5-build builds it in .wt/home-signals-5 (sup31)"
depends_on: [markdown-and-labels]
boundary: ["frontend/src/components/Home.tsx, frontend/src/styles/home.css", "frontend/src/styles/global.css (html, body; the .markdown scroll edge, FR-13)", "frontend/src/lib/width.ts and frontend/src/lib/ tests", "frontend/src/styles/shell.css (the scroll edge only), frontend/src/components/InitiativeHeader.tsx (useScrollEdges only)", "frontend/src/components/Conversation.tsx and SlackView.tsx (FR-10 names only)", "testdata/fixture-twenty/, scripts/fixture-home.sh", "not: rule-box-and-stages' files, Go, docs/design-system.md"]
spec: "docs/specs/leftovers-5.md; the ranking docs/ux/reviews/2026-10-03-rank-leftovers-5.md (Aglaea, 31f7ac9); the design system as amended there"
gate: "docs/specs/leftovers-5.md Acceptance, rows M4 to M7, M9 and M0"
ui_review: true
seat: hs5-build
---

## Goal
leftovers-5 FR-7 to FR-11: row 1 first (the document never scrolls), then re-measure before folding changes.

## Gate
- [ ] M4-M7: see `docs/specs/leftovers-5.md`, Acceptance
- [ ] M9: see `docs/specs/leftovers-5.md`, Acceptance (amendment 1)
- [ ] M0: see `docs/specs/leftovers-5.md`, Acceptance

## Done
- 2026-10-04 0077 ruled by pablo ("go"); sup31 launched by the FSE
- 2026-10-03 amendment 1 of leftovers-5 adds M9 (from leftovers-6), proposed with 0077
- 2026-10-03 cut from leftovers-5 by the FSE

## Next

## Blockers

## Notes
Runs in parallel with its pair; boundaries disjoint.
