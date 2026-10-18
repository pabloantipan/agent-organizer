---
title: "The Review screen's symbol panel: diff, facts, claim and the mark"
status: now
repos: [organizer]
branch: rv-symbol
seat: rs-build
stage: review-map
updated: 2026-10-18
next: "decide: V-F2 at 1024 cannot hold inside the crumb: with the memory badge (critical, 134 px) the bar is full at 1024 and the crumbs get 152 px, so the title has 17 px (0 of 31 characters; ~8 with a shorter badge); 20 characters need ~110 px more from outside the crumb (Places 197, Needs me + Rescan 229, the badge). Fold the bar while the review is open (TopBar.tsx beyond the crumb), relax the row at 1024, or other? Everything else is built and passing"
risk: medium
footprint: [frontend/src/components/ReviewSymbol.tsx, frontend/src/components/ReviewSymbol.test.tsx, frontend/src/lib/review.ts, frontend/src/lib/review.test.ts, frontend/src/styles/review.css, frontend/src/components/Review.tsx, frontend/src/components/TopBar.tsx (crumb), frontend/src/components/TopBar.test.tsx, scripts/fixture-home.sh (--review only)]
depends_on: [rv-list]
boundary: ["docs/specs/review-map.md v2 Boundary, rv-symbol"]
spec: "docs/specs/review-map.md (v2, FR-19, Amendment 2 FR-20, FR-21, Amendment 3 FR-22, FR-23; docs/ux/specs/review-view.md)"
gate: "docs/specs/review-map.md v2 Acceptance, rows V-R4, V-R5, V-R6, V-R7, V-R8, V-R10, V-R12 and X0; Amendment 2 rows V-F1, V-F2; Amendment 3 rows V-R13, V-R14"
ui_review: true
---

## Goal
Pablo reads one symbol's change with its evidence, marks it, and moves to the next.

## Gate
docs/specs/review-map.md v2, rows V-R4, V-R5, V-R6, V-R7, V-R8, V-R10, V-R12 and X0; Amendment 2 rows V-F1, V-F2; Amendment 3 rows V-R13, V-R14.

## Notes
- V-F2 at 1024×640 (harness, `.wt-notes/rs-build/out/h-vf2-1024x640.txt`): bar 1024 wide, scrollWidth 1024; brand 77, Where 364 (Places 197, crumbs 152), memory `critical · 1.2 GB` 134, Needs me + Rescan 229, app 124. The crumbs' 152 px hold `init-a` 42, two separators, `Review` 44 and four 8 px gaps, leaving the title 17 px: `G…`. At 1440 the full title shows with 8 px to `› Review` (`h-vf2-1440x900.txt`). The ≥ 20 characters need room outside the crumb, which the boundary (TopBar.tsx, the crumb only) does not give.
- `Open in editor` at the head line (§3.3 title) is not drawn: FR-19 does not name it, and `OpenInEditor(path)` takes no line and the frontend has no path to the reviewed checkout.
