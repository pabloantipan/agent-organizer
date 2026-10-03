---
title: Home widths, fourth pass - empty columns give way first, urgent signals never fold, wide measured on the row; Escape, the opener, names
status: next
repos: [organizer]
branch: home-widths-4
updated: 2026-10-03
next: "fse: start a supervisor for this card and its pair once time-zoom-2 is in done/ (shared files: StageRoadmap.tsx, scripts/fixture-home.sh); 0074 ruled"
depends_on: [decisions-view, time-zoom-2]
boundary: ["frontend/src/components/Home.tsx, Rail.tsx, RuleDecisionBox.tsx", "frontend/src/components/Crew.tsx (CellStateLz only), Conversation.tsx (FR-24's names and focus only)", "frontend/src/lib/width.ts, frontend/src/lib/ and its tests", "frontend/src/styles/home.css, rule-box.css, global.css (.rail-icon only), shell.css (the rail's rules only)", "testdata/fixture-twenty/ and scripts/fixture-home.sh (FR-25's rows)", "not: header-fold-3's files, DecisionsView.tsx, Go, docs/design-system.md"]
spec: "docs/specs/responsive-home.md (amendment 4, FR-20 to FR-25); the ranking docs/ux/reviews/2026-10-03-rank-leftovers-3.md (Aglaea, 2b6d608); the design system's Widths as amended there"
gate: "docs/specs/responsive-home.md Acceptance, rows G19 to G24 and G8"
ui_review: true
---

## Goal
widths-and-focus's leftovers, ranked by Aglaea: FR-20 to FR-25 of
`docs/specs/responsive-home.md`.

## Gate
- [ ] G19: see `docs/specs/responsive-home.md`, Acceptance
- [ ] G20: see `docs/specs/responsive-home.md`, Acceptance
- [ ] G21: see `docs/specs/responsive-home.md`, Acceptance
- [ ] G22: see `docs/specs/responsive-home.md`, Acceptance
- [ ] G23: see `docs/specs/responsive-home.md`, Acceptance
- [ ] G24: see `docs/specs/responsive-home.md`, Acceptance
- [ ] G8: see `docs/specs/responsive-home.md`, Acceptance

## Done
- 2026-10-03 0074 ruled by pablo ("Ok", accept as written, 117e269)
- 2026-10-03 cut from responsive-home amendment 4 by the FSE

## Next

## Blockers

## Notes
Runs in parallel with header-fold-3; boundaries disjoint.
