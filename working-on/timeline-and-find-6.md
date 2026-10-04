---
title: Today said at Days, focus after a ruling and after Show the other N, titles that stack, finds that store nothing
status: next
repos: [organizer]
branch: timeline-and-find-6
updated: 2026-10-04
next: "review: timeline-and-find-6, gate met (N2-N6, N0 in Chromium; N1 in Chromium and WKWebView, Cards and Decisions)"
depends_on: [rule-box-and-stages]
boundary: ["frontend/src/components/TimeZoom.tsx, frontend/src/lib/axis.ts and its tests, frontend/src/styles/time-zoom.css", "frontend/src/components/DecisionsView.tsx, frontend/src/styles/decisions.css", "frontend/src/components/RuleDecisionBox.tsx (the after-rule focus only)", "a new many-records fixture initiative under testdata/, scripts/fixture-home.sh (to lay it out)", "not: Go, docs/design-system.md"]
spec: "docs/specs/leftovers-6.md (FR-1 to FR-7, FR-6a); the ranking docs/ux/reviews/2026-10-03-rank-leftovers-6.md (Aglaea, b582a27); the design system's Timeline as amended there"
gate: "docs/specs/leftovers-6.md Acceptance, rows N1 to N6 and N0"
ui_review: true
seat: tf6-build
---

## Goal
The rest of sup29's and sup30's leftovers, free of leftovers-5's files once
rule-box-and-stages lands.

## Gate
- [x] N1-N6: see `docs/specs/leftovers-6.md`, Acceptance
- [x] N0: see `docs/specs/leftovers-6.md`, Acceptance

## Done
- 2026-10-04 tf6-build: built on timeline-and-find-6 (377dfea, c9ca911, f28f167, rebased on 8e515e9), gate met; evidence and choices in .wt-notes/tf6-build/progress.md
- 2026-10-04 sup32 launched by the FSE, rule-box-and-stages in done/
- 2026-10-04 0077 ruled by pablo ("go")
- 2026-10-03 cut from leftovers-6 by the FSE

## Next

## Blockers

## Notes
- Days keeps 4 px between tick labels, not 12: a day column is 40 px and "Wed 30" ~35 px, so 12 px would drop every other day against the zoom spec's A2. 12 px holds at Fit and Hours. For the UI reviewer / Aglaea.
- N1's Decisions case with 1 Oct as first whole day was seen in Chromium only on the card's graphs that scroll that far (Cards, Stages); Decisions' window ends near today. In WKWebView: Cards both cases, Decisions mid-September.
- lib/decisionsPage.ts timelineCount is unused now (outside the boundary).
