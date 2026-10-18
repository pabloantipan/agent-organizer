---
title: "The Review screen's symbol panel: diff, facts, claim and the mark"
status: now
repos: [organizer]
branch: rv-symbol
seat: rs-build
stage: review-map
updated: 2026-10-18
next: "V-R14: the progress line shows 50 ms to 1 s after the press, not after 1 s: afterASecond counts from Go's started, cut to the second (review.go:363 RFC3339); count from the press, and test with a whole-second started"
review: fail
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

## Review

**fail**, rs-review, 2026-10-18, on 3155162 (clean clone of 31551625286a1c550dd0149e55453aea773bd5c3).

Unmet gate items: **V-R14**. Met: V-R4, V-R5, V-R6, V-R7, V-R8, V-R10, V-R12, X0, V-F1, V-F2 (as Amendment 5), V-R13.

Found (blocking, V-R14 / FR-23): the progress line and Stop show between 0 and 1 s after the press, not after 1 s. `afterASecond` waits `1000 - elapsedOf(make)`, and `make.started` is Go's `s.now().UTC().Format(time.RFC3339)` (`internal/service/review.go:363`), whole seconds, so the press's fraction of a second is already counted. Proof, `.wt-notes/rs-review/fr23-proof.mjs` importing the clone's `lib/review.ts` unchanged:
```
$ node --experimental-strip-types fr23-proof.mjs
progressDelay at the press: 50 ms (FR-23 wants 1000)
afterASecond schedules show() after: 50 ms; a make ending at 900 ms would show the counter and Stop
```
(input: started `2026-10-18T10:00:00Z`, pressed `10:00:00.950Z`). The V-R14 vitest passes only because it builds `started` with `new Date().toISOString()` (milliseconds), which the binding never returns: the step checks less than the row. The same cause draws `Making the map · 0 s` once the line appears (my harness, `h/out/h-vf1-make.txt` and `h-vr10.txt`, labels seen: `Making the map…`, `Making the map · 0 s`, `Stop`, `Making the map · 1 s`): MakeButton's first render with progress uses `now` from its mount. Fix in the frontend (Go is outside the boundary): count the 1 s from the press, and test with a whole-second `started`.

Evidence (all from my clean clone; notes in `.wt-notes/rs-review/`):
- X0: `XDG_DATA_HOME=$(mktemp -d) test-lease run --share -- make test`: **fresh**, run **357ddb79-82098** (rs-ui reused it), exit 0, go ok for every package, vitest 74 files / 879 tests (`rv-x0-make-test.txt`); `test-lease run -- pnpm run build` exit 0; `test-lease run -- wails build` exit 0, again after `wails dev` exit 0; `git status --porcelain` empty both times.
- V-R12: no `reactflow|@xyflow|elkjs|monaco` in `frontend/package.json` or `frontend/dist` (grep rc=1). No-gos: no change to package.json, lockfile, go.mod; no fetch, URL or absolute path in added frontend lines; no syntax-colour library; only the 9 boundary paths changed (no Go, `wailsjs/`, CardDrawer, board.store, App, shell.css, TopBar.tsx).
- D5 rerun (Amendment 4): `go run . review init-a rv-fixture --json` exit 0: svc.Greet go modified with TestGreet; format.formatName ts modified `untested`,`undeclared`; svc.Welcome affected, edge Welcome uses Greet; reconciled; fixture repo `git status` clean.
- Tab harness (builder's tabharness.swift and steps, read and copied to `h/`, pointed at my clone, my `wails dev -devserver localhost:34256`, fixture `--review --memory critical`, auth off, lock held): V-F1 no map: focus on Make the map; with a map: the worklist stop, never body. V-R5: `no direct test`, `not in the card's declared changes` color rgb(255, 176, 32) = `--warning` #ffb020. V-R8: Reviewed, next → `Reviewed 1 of 2`, focus on h2 svc.Greet; Question with no note: Save disabled, enabled after a typed note. V-R4: Tab from the h2 → region `svc.Greet, diff`, rows 1–6, one `−` (no number) and one `+` (5). V-R6: Called by svc.Welcome → h2 svc.Welcome, `unchanged · shown because it calls svc.Greet`, no diff, no radios, only `← back to svc.Greet` → h2 svc.Greet. V-R10: after `$FIXTURE_REVIEW_MOVE` and Make it again, Greet keeps `question`, formatName `changed since you reviewed`. V-F2 1440×900: full title, 8 px to `›`; 1024×640: text and title attribute the full title, no overlaps, crumbs end 473 before the Mac group at 489.
- Vitest rows read string by string against review-view §3.3, §5, Amendment 1: every word matches (`no direct test`, `not in the card's declared changes`, `none name it directly`, `unchanged · shown because it calls …`, `← back to …`, `The builder says`, `Reviewed`/`Question`/`Blocked`/`Note`, `Reviewed, next`, `Save`, `Kept in Deltagos; asking the supervisor comes later.`, `changed since you reviewed`, `Making the map…`). V-R7 blockquote under the figcaption, after the facts. V-R13 `lib/index.ts` → `lib.formatName`, two `format.ts` → `lib/format.…`, `components/format.…`.

change-check (from the clean clone):
```
change-check: working-on/rv-symbol.md
risk: medium
repo organizer: base 994987754 (default main) ... head rv-symbol 315516252; 9 files

## Changed

- organizer/frontend/src/components/Review.test.tsx (modified, test)
- organizer/frontend/src/components/Review.tsx (modified): Review, firstTarget, ReviewViewProps, PanelProps, ReviewView, MakeButton, Worklist, SymbolPane
- organizer/frontend/src/components/ReviewSymbol.test.tsx (added, test)
- organizer/frontend/src/components/ReviewSymbol.tsx (added): MarkState, ReviewSymbol, ReviewSymbolViewProps, ReviewSymbolView, Diff, MarkForm
- organizer/frontend/src/components/TopBar.test.tsx (modified, test)
- organizer/frontend/src/lib/review.test.ts (modified, test)
- organizer/frontend/src/lib/review.ts (modified): progressDelay, afterASecond, flagLook, FlagLook, tsParts, shortName, qualifiedNames, Row, worklist, DiffLine, RangeText, symbolDiff, shasOf, symbolNode, calledBy, callsOf, isAffected, affectedLine, backTo, testsOf, needsNote, canSave, markOf
- organizer/frontend/src/styles/review.css (modified)
- organizer/scripts/fixture-home.sh (modified)

## Tests touched

- organizer/frontend/src/components/Review.test.tsx
- organizer/frontend/src/components/ReviewSymbol.test.tsx
- organizer/frontend/src/components/TopBar.test.tsx
- organizer/frontend/src/lib/review.test.ts

## Risky (declared)

- `Review.open`: tracks `from` for an affected symbol; N from an affected one walks from the changed one
- `review.css .review-where .crumbs`: a zero width on the crumbs; anything else placed in them must shrink too

## Not changed, on purpose (declared)

- `frontend/src/components/TopBar.tsx`: the title's text is the full title already; the fix is CSS
- `Open in editor` (§3.3): not in FR-19, and OpenInEditor takes no line
- `frontend/wailsjs`, `app.go`, any Go: the bindings sufficed

## Flags

| flag | where | symbol | detail |
|---|---|---|---|
| boundary unreadable | organizer | docs/specs/review-map.md: no section 'v2 Boundary' | boundary entry |
| outside boundary | organizer/frontend/src/components/Review.test.tsx |  | modified |
| outside boundary | organizer/frontend/src/components/Review.tsx |  | modified |
| outside boundary | organizer/frontend/src/components/ReviewSymbol.test.tsx |  | added |
| outside boundary | organizer/frontend/src/components/ReviewSymbol.tsx |  | added |
| outside boundary | organizer/frontend/src/components/TopBar.test.tsx |  | modified |
| outside boundary | organizer/frontend/src/lib/review.test.ts |  | modified |
| outside boundary | organizer/frontend/src/lib/review.ts |  | modified |
| outside boundary | organizer/frontend/src/styles/review.css |  | modified |
| outside boundary | organizer/scripts/fixture-home.sh |  | modified |
| outside footprint | organizer/frontend/src/components/Review.test.tsx |  | modified |
| untested? | organizer/frontend/src/components/Review.tsx | firstTarget | no test file names it |
| untested? | organizer/frontend/src/components/Review.tsx | MakeButton | no test file names it |
| untested? | organizer/frontend/src/components/Review.tsx | Worklist | no test file names it |
| untested? | organizer/frontend/src/components/Review.tsx | SymbolPane | no test file names it |
| untested? | organizer/frontend/src/components/ReviewSymbol.tsx | Diff | no test file names it |
| untested? | organizer/frontend/src/components/ReviewSymbol.tsx | MarkForm | no test file names it |
| untested? | organizer/frontend/src/lib/review.ts | tsParts | no test file names it |
| untested? | organizer/frontend/src/lib/review.ts | qualifiedNames | no test file names it |
| untested? | organizer/frontend/src/lib/review.ts | symbolNode | no test file names it |
| untested? | organizer/frontend/src/lib/review.ts | isAffected | no test file names it |
| untested? | organizer/frontend/src/lib/review.ts | needsNote | no test file names it |

22 flags: outside boundary 9, outside footprint 1, undeclared 0, declared, not changed 0, new env var 0, new dependency 0, new host 0, risk 0, untested? 11, could not read 0, boundary unreadable 1
```
Explained:
- `boundary unreadable` and the 9 `outside boundary`: the false flag on a boundary entry with words after the path. Read against v2 `### Boundary` rv-symbol plus Amendments 2–4: ReviewSymbol(.test).tsx, lib/review(.test).ts, review.css, Review.tsx (mount, focus on open by Am. 2, FR-22/23 by Am. 3), TopBar.test.tsx (the crumb's test, Am. 2), fixture-home.sh (Am. 4; the diff is inside the `--review` branch and its header comment only, adding an unchanged `Welcome` that calls `Greet`). `Review.test.tsx` is not named by the boundary or the footprint (`outside footprint`); it holds the tests of the FR-22/FR-23 changes Amendment 3 puts in Review.tsx. Explained; Note: the footprint should list it.
- TopBar.tsx: in the footprint, not changed; the card declares it not changed on purpose (the fix is CSS in review.css). Consistent with V-F2.
- `untested?`: firstTarget (V-F1 harness), MakeButton/Worklist/SymbolPane/Diff/MarkForm (rendered by Review.test and ReviewSymbol.test), tsParts and qualifiedNames (through shortName and worklist, V-R13), symbolNode (through calledBy/callsOf), isAffected (V-R6), needsNote (through canSave). All exercised; no finding.
- undeclared 0, declared not changed 0.

Notes (not blocking):
- Note: Tests rows that name a test that did not change are plain text; §3.3 says they open the editor. Not in FR-19's list; same cause as `Open in editor`, held by the builder's note.
- Note: an affected symbol restored without a changed one to come from reads only `unchanged` with no back button (`affectedLine` with null).
- Note: the radio inputs are 1×1 with outline none when focused (harness vr-order#2); the focus look is rs-ui's call.
- Note: Tab past `Reviewed, next` lands on body while Save is disabled (builder's "found, not asked").

