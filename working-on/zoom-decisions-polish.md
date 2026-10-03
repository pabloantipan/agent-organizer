---
title: Decisions and zoom polish - focus kept at the zoom's ends, a sticky axis, finds open their sections, honest empty and hidden counts
status: now
repos: [organizer]
branch: zoom-decisions-polish
updated: 2026-10-03
next: "review: zoom-decisions-polish, gate L1-L8 and L0 met at 28f581a (L1, L5, L8 in WKWebView with Keyboard navigation on)"
depends_on: []
boundary: ["frontend/src/components/TimeZoom.tsx, frontend/src/styles/time-zoom.css, frontend/src/lib/axis.ts and its tests", "frontend/src/components/DecisionsView.tsx, frontend/src/styles/decisions.css (FR-2 to FR-8 only)", "frontend/src/lib/ and its tests", "testdata/fixture-overlay/", "not: scripts/fixture-home.sh, testdata/fixture-twenty/, global.css, rule-box.css, RuleDecisionBox.tsx, StageRoadmap.tsx, header-fold-3's and home-widths-4's files, Go, docs/design-system.md"]
spec: "docs/specs/leftovers-4.md (FR-1 to FR-8); the ranking docs/ux/reviews/2026-10-03-rank-leftovers-4.md (Aglaea, 94308ad); the design system as amended there"
gate: "docs/specs/leftovers-4.md Acceptance, rows L1 to L8 and L0"
ui_review: true
seat: zdp-build
---

## Goal
The first half of sup27's leftovers, the part free of sup28's files.

## Gate
- [x] L1-L8: see `docs/specs/leftovers-4.md`, Acceptance
- [x] L0: see `docs/specs/leftovers-4.md`, Acceptance

## Done
- 2026-10-03 zdp-build: FR-1 to FR-8 on zoom-decisions-polish (68dfc40, bf224db, a011b9d, 73f7b57, 5d5abfa, 28f581a), rebased on 7f49158; L1-L8 and L0 measured, rows and shots in .wt-notes/zdp-build/progress.md
- 2026-10-03 sup29 launched by the FSE
- 2026-10-03 0075 ruled by pablo (accept as written)
- 2026-10-03 cut from leftovers-4 by the FSE

## Next

## Blockers

## Notes
Runs beside sup28's header-fold-3 and home-widths-4: disjoint files.
- L8 in WKWebView failed first: macOS's autocorrect bubble over the find took the first Escape. Fixed in DecisionsView (28f581a, spelling off on the field); none of rule-box.css, RuleDecisionBox.tsx or global.css was needed, so nothing went to sup29.
- Keyboard rows ran with Keyboard navigation and classic scrollbars passed to the built app as arguments (`-AppleKeyboardUIMode 2 -AppleShowScrollBars Always`, the argument domain), so the machine's settings were not changed; a UI reviewer can do the same.
- L2 needs ~74 records and the fixture has 8 at most: it ran on a run-time copy of this repo's 76 records inside the fixture home, not committed. A large-decisions fixture would make L2 repeatable.
- Found, not asked: ruling a record while Ruled is closed leaves focus on the page body (afterRule focuses the record's line, no longer rendered); Focus and names says never the body.
- FR-2 makes only the Decisions Timeline's axis stick to the page at Fit; Roadmap's Cards and Stages keep their axis in the frame.
