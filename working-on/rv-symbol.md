---
title: "The Review screen's symbol panel: diff, facts, claim and the mark"
status: now
repos: [organizer]
branch: rv-symbol
seat: rs-build
stage: review-map
updated: 2026-10-18
next: "review: rv-symbol, gate met, 3155162"
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
- [x] V-R4: `.wt-notes/rs-build/out/h-vr4-vr8.txt` (Tab from the h2 → region `svc.Greet, diff`; only lines 1-6 with `−`/`+` and head numbers), `out/vr4-greet.png`; ReviewSymbol.test.tsx
- [x] V-R5: `.wt-notes/rs-build/out/h-vr4-vr8.txt` (`no direct test`; `not in the card's declared changes` rgb(255,176,32) = `--warning` #ffb020); lib/review.test.ts, ReviewSymbol.test.tsx, Review.test.tsx
- [x] V-R6: `.wt-notes/rs-build/out/h-vr4-vr8.txt` (Called by svc.Welcome → `unchanged · shown because it calls svc.Greet`, no diff, no mark; `← back to svc.Greet` → h2 svc.Greet), `out/vr6-affected.png`
- [x] V-R7: ReviewSymbol.test.tsx "V-R7" (vitest fixture node with a claim; blockquote under `The builder says`)
- [x] V-R8: `.wt-notes/rs-build/out/h-vr4-vr8.txt` (Reviewed 0 → 1 of 2, focus on h2 svc.Greet; Question with no note: Save disabled, enabled after a typed note)
- [x] V-R10: `.wt-notes/rs-build/out/h-vr10.txt` (after `$FIXTURE_REVIEW_MOVE` and Make it again: Greet keeps `question`, formatName `changed since you reviewed`)
- [x] V-R12: `.wt-notes/rs-build/vr12.txt` (0 matches in the clean clone's package.json and dist)
- [x] X0: `.wt-notes/rs-build/x0-head.txt` (3155162), `x0-install.txt`, `x0-make-test.txt` (exit 0; vitest 74 files / 879 tests), `x0-pnpm-build.txt`, `x0-wails-build.txt` (exit 0), `x0-porcelain.txt` (empty)
- [x] V-F1: `.wt-notes/rs-build/out/h-vf1-make.txt` (no map: focus on Make the map; with a map: the worklist's stop; never body)
- [x] V-F2 (as Amendment 5): `.wt-notes/rs-build/out/h-vf2-amended-1440x900.txt` (31 of 31 shown, 8 px to `›`), `out/h-vf2-amended-1024x640.txt` (text and hover title the full title, no overlap, crumbs end 473 before the Mac group at 489); TopBar.test.tsx
- [x] V-R13: lib/review.test.ts "V-R13" (`lib/index.ts` → `lib.<name>`; two `format.ts` → `<folder>/format.<name>`)
- [x] V-R14: lib/review.test.ts "V-R14" (fake timers: ending at 900 ms never shows; 1500 ms shows at 1 s, no focus); Review.test.tsx (first second: `Making the map…`, no counter, no Stop)

## Done
- 2026-10-18 rs-build: the symbol's panel, focus on open, the crumb's shrink-wrap, the TS qualifier, no flash, the fixture's affected caller; gate met at 3155162 (branch rv-symbol, rebased on efe1d95).

## Notes
- Resolved by Amendment 5 (5545802): V-F2 at 1024×640 (harness, `.wt-notes/rs-build/out/h-vf2-1024x640.txt`): bar 1024 wide, scrollWidth 1024; brand 77, Where 364 (Places 197, crumbs 152), memory `critical · 1.2 GB` 134, Needs me + Rescan 229, app 124. The crumbs' 152 px hold `init-a` 42, two separators, `Review` 44 and four 8 px gaps, leaving the title 17 px: `G…`. At 1440 the full title shows with 8 px to `› Review` (`h-vf2-1440x900.txt`). The ≥ 20 characters need room outside the crumb, which the boundary (TopBar.tsx, the crumb only) does not give.
- `Open in editor` at the head line (§3.3 title) is not drawn: FR-19 does not name it, and `OpenInEditor(path)` takes no line and the frontend has no path to the reviewed checkout.
- D5 rerun with the affected caller: `.wt-notes/rs-build/out/d5-map.json` (exit 0; Go and TS changed, one undeclared, one tested, svc.Welcome affected with a uses edge), `out/d5-porcelain.txt` empty.

## Declared changes
- added `frontend/src/components/ReviewSymbol.tsx`: the symbol's panel (title, diff, facts, claim, mark)
- added `frontend/src/components/ReviewSymbol.test.tsx`: V-R4 to V-R8, V-R10 on the view
- modified `frontend/src/lib/review.ts`: symbolDiff, calledBy, callsOf, affectedLine, testsOf, canSave, markOf, shasOf, the TS qualifier (FR-22), afterASecond (FR-23), Row.path, the panel's words
- modified `frontend/src/lib/review.test.ts`: V-R4 to V-R8, V-R13, V-R14
- modified `frontend/src/components/Review.tsx`: mounts ReviewSymbol, focus on open (FR-20), progress after 1 s (FR-23), flagLook and the path description on rows
- modified `frontend/src/components/Review.test.tsx`: FR-23 states, FR-22 description, V-R5 row looks
- modified `frontend/src/styles/review.css`: the panel, the diff, the radios, flag looks, the crumb's shrink-wrap (FR-21)
- modified `frontend/src/components/TopBar.test.tsx`: FR-21
- modified `scripts/fixture-home.sh`: `--review` adds svc/welcome.go (Amendment 4)
Risky:
- `Review.open`: tracks `from` for an affected symbol; N from an affected one walks from the changed one
- `review.css .review-where .crumbs`: a zero width on the crumbs; anything else placed in them must shrink too
Not changed, on purpose:
- `frontend/src/components/TopBar.tsx`: the title's text is the full title already; the fix is CSS
- `Open in editor` (§3.3): not in FR-19, and OpenInEditor takes no line
- `frontend/wailsjs`, `app.go`, any Go: the bindings sufficed
