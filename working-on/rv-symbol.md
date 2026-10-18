---
title: "The Review screen's symbol panel: diff, facts, claim and the mark"
status: now
repos: [organizer]
branch: rv-symbol
seat: rs-build
stage: review-map
updated: 2026-10-18
next: "review: rv-symbol, gate met, edcd546"
review: fail
risk: medium
footprint: [frontend/src/components/ReviewSymbol.tsx, frontend/src/components/ReviewSymbol.test.tsx, frontend/src/lib/review.ts, frontend/src/lib/review.test.ts, frontend/src/styles/review.css, frontend/src/components/Review.tsx, frontend/src/components/TopBar.tsx (crumb), frontend/src/components/TopBar.test.tsx, scripts/fixture-home.sh (--review only)]
depends_on: [rv-list]
boundary: ["docs/specs/review-map.md v2 Boundary, rv-symbol"]
spec: "docs/specs/review-map.md (v2, FR-19, Amendment 2 FR-20, FR-21, Amendment 3 FR-22, FR-23; docs/ux/specs/review-view.md)"
gate: "docs/specs/review-map.md v2 Acceptance, rows V-R4, V-R5, V-R6, V-R7, V-R8, V-R10, V-R12 and X0; Amendment 2 rows V-F1, V-F2; Amendment 3 rows V-R13, V-R14; Amendment 6 row V-U1"
ui_review: true
---

## Goal
Pablo reads one symbol's change with its evidence, marks it, and moves to the next.

## Gate
docs/specs/review-map.md v2, rows V-R4, V-R5, V-R6, V-R7, V-R8, V-R10, V-R12 and X0; Amendment 2 rows V-F1, V-F2; Amendment 3 rows V-R13, V-R14; Amendment 6 row V-U1.
- [x] V-R4: `.wt-notes/rs-build/out/h-vr4-vr8.txt` (Tab from the h2 → region `svc.Greet, diff`; only lines 1-6 with `−`/`+` and head numbers), `out/vr4-greet.png`; ReviewSymbol.test.tsx
- [x] V-R5: `.wt-notes/rs-build/out/h-vr4-vr8.txt` (`no direct test`; `not in the card's declared changes` rgb(255,176,32) = `--warning` #ffb020); lib/review.test.ts, ReviewSymbol.test.tsx, Review.test.tsx
- [x] V-R6: `.wt-notes/rs-build/out/h-vr4-vr8.txt` (Called by svc.Welcome → `unchanged · shown because it calls svc.Greet`, no diff, no mark; `← back to svc.Greet` → h2 svc.Greet), `out/vr6-affected.png`
- [x] V-R7: ReviewSymbol.test.tsx "V-R7" (vitest fixture node with a claim; blockquote under `The builder says`)
- [x] V-R8: `.wt-notes/rs-build/out/h-vr4-vr8.txt` (Reviewed 0 → 1 of 2, focus on h2 svc.Greet; Question with no note: Save disabled, enabled after a typed note)
- [x] V-R10: `.wt-notes/rs-build/out/h-vr10.txt` (after `$FIXTURE_REVIEW_MOVE` and Make it again: Greet keeps `question`, formatName `changed since you reviewed`)
- [x] V-R12: `.wt-notes/rs-build/vr12.txt` (0 matches in the clean clone's package.json and dist)
- [x] X0 (round 1): `.wt-notes/rs-build/x0r1-head.txt` (edcd546), `x0r1-install.txt`, `x0r1-make-test.txt` (exit 0; vitest 74 files / 884 tests), `x0r1-pnpm-build.txt`, `x0r1-wails-build.txt` (exit 0), `x0r1-porcelain.txt` (empty); V-R12 again `vr12-r1.txt` (rc=1)
- [x] V-F1: `.wt-notes/rs-build/out/h-vf1-make.txt` (no map: focus on Make the map; with a map: the worklist's stop; never body)
- [x] V-F2 (as Amendment 5): `.wt-notes/rs-build/out/h-vf2-amended-1440x900.txt` (31 of 31 shown, 8 px to `›`), `out/h-vf2-amended-1024x640.txt` (text and hover title the full title, no overlap, crumbs end 473 before the Mac group at 489); TopBar.test.tsx
- [x] V-R13: lib/review.test.ts "V-R13" (`lib/index.ts` → `lib.<name>`; two `format.ts` → `<folder>/format.<name>`)
- [x] V-R14 (round 1, edcd546): lib/review.test.ts "V-R14" (started `2026-10-18T10:00:00Z` as the binding returns it, press at `.950Z`: ending 900 ms after the press never shows; at 1500 ms shows 1000 ms after the press with `· 1 s`, no document so no focus); Review.test.tsx "V-R14 … as drawn" (the same timeline rendered: no counter or Stop through 900 ms; `Making the map · 1 s` and Stop at 1 s, never `· 0 s`); harness `.wt-notes/rs-build/out/h-r1-vf1-make.txt` (labels seen `Making the map…`, `Making the map · 1 s`, `Stop`; no `· 0 s`)
- [x] V-U1 (edcd546): ReviewSymbol.test.tsx "V-U1" (Question with a note, Save, Reviewed, next: the form reads Reviewed and Save is disabled, nothing more written; the panel drawn from those marks has Reviewed checked)

## Done
- 2026-10-18 rs-build: the symbol's panel, focus on open, the crumb's shrink-wrap, the TS qualifier, no flash, the fixture's affected caller; gate met at 3155162 (branch rv-symbol, rebased on efe1d95).
- 2026-10-18 rs-build, review round 1: V-R14 fixed, the 1 s and the counter count from the press (`makeOrigin`; a make first seen here from the latest instant it can have started), never `· 0 s` (e0b7d5f); FR-24 / V-U1 (Amendment 6, rs-ui U1): the form shows the mark as saved and Save is live only for a change (edcd546). Gate met at edcd546, rebased on c18b5f8; V-F1 and V-R4–V-R8 rerun in the harness, unchanged.

## Notes
- Resolved by Amendment 5 (5545802): V-F2 at 1024×640 (harness, `.wt-notes/rs-build/out/h-vf2-1024x640.txt`): bar 1024 wide, scrollWidth 1024; brand 77, Where 364 (Places 197, crumbs 152), memory `critical · 1.2 GB` 134, Needs me + Rescan 229, app 124. The crumbs' 152 px hold `init-a` 42, two separators, `Review` 44 and four 8 px gaps, leaving the title 17 px: `G…`. At 1440 the full title shows with 8 px to `› Review` (`h-vf2-1440x900.txt`). The ≥ 20 characters need room outside the crumb, which the boundary (TopBar.tsx, the crumb only) does not give.
- `Open in editor` at the head line (§3.3 title) is not drawn: FR-19 does not name it, and `OpenInEditor(path)` takes no line and the frontend has no path to the reviewed checkout.
- D5 rerun with the affected caller: `.wt-notes/rs-build/out/d5-map.json` (exit 0; Go and TS changed, one undeclared, one tested, svc.Welcome affected with a uses edge), `out/d5-porcelain.txt` empty.

## Declared changes
- added `frontend/src/components/ReviewSymbol.tsx`: the symbol's panel (title, diff, facts, claim, mark; the mark as saved after each save, FR-24)
- added `frontend/src/components/ReviewSymbol.test.tsx`: V-R4 to V-R8, V-R10 on the view, V-U1
- modified `frontend/src/lib/review.ts`: symbolDiff, calledBy, callsOf, affectedLine, testsOf, canSave (FR-24: only a changed mark), afterSave (FR-24), markOf, shasOf, the TS qualifier (FR-22), makeOrigin, progressDelay, afterASecond and secondsSince (FR-23, counted from the press), Row.path, the panel's words
- modified `frontend/src/lib/review.test.ts`: V-R4 to V-R8, V-R13, V-R14 (whole-second started), FR-24's canSave
- modified `frontend/src/components/Review.tsx`: mounts ReviewSymbol, focus on open (FR-20), progress after 1 s from the press and its counter from the same origin (FR-23), flagLook and the path description on rows
- modified `frontend/src/components/Review.test.tsx`: FR-23 states, V-R14 as drawn, FR-22 description, V-R5 row looks
- modified `frontend/src/styles/review.css`: the panel, the diff, the radios, flag looks, the crumb's shrink-wrap (FR-21)
- modified `frontend/src/components/TopBar.test.tsx`: FR-21
- modified `scripts/fixture-home.sh`: `--review` adds svc/welcome.go (Amendment 4)
Risky:
- `makeOrigin`: a make first seen after a reload counts from the latest instant it can have started, so its line may show up to 1 s later than it would have on the pressing page
- `canSave`: Save is disabled on a saved mark shown unchanged; a reader who opens a saved Question must change it to save
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


## UI review
rs-ui, 2026-10-18, on 31551625286a1c550dd0149e55453aea773bd5c3 (every row; the branch did not move). **Verdict: pass.** No severity 4 or 3 against the spec or the design. rs-review's V-R14 fail is not repeated here; the screen agrees with it (U4). Evidence: `.wt-notes/rs-ui/` (`out/` shots, harness logs, steps).

Shared test run: **reused**, run `357ddb79-82098` of 31551625286a by organizer-probe-rs-review (exit 0; go ok, vitest 74 files / 879 tests; `.wt-notes/rs-ui/x0-make-test.txt`).

How each state was checked:
- Review build (`make review-build` in my detached worktree): I launched `Deltagos Review` myself (pid saved) on `fixture-home.sh --review --memory critical` with auth off and the probe stub. I read its AX tree by that pid, pressed by AXPress on that pid, resized its window by AX and shot it with `screencapture -o -l` (`wk-<w>x<h>-*.png`). The screen was not locked. States seen live in WKWebView: no map, with focus on Make the map (V-F1). Making, which reads `Making the map…` and then the map, with focus on the worklist. formatName with flags, diff and facts at 1440: facts beside the diff at 360 (V-R5). Greet after `Reviewed, next`: `Reviewed 1 of 2`. Called by → svc.Welcome read-only, then `← back to svc.Greet` (V-R6). Question with no note: Save disabled, placeholder `required for Question and Blocked`. 1024×640 with the facts under the diff. All reviewed: `Reviewed 2 of 2`, Next to review gone, live region `Reviewed 2 of 2` once. Moved: `The branch moved since this map (391ae0f → d836522).` and `Make it again`. Remade (V-R10): Greet keeps ✓, formatName reads `changed since you reviewed` in the row and in the panel.
- Process note: between two AXPresses (← Card, then Review the change) my review app became the frontmost app. I cannot tell whether a press or a click did it. I stopped pressing in that window and did the rest in the Tab harness. `wails dev` also brings its own `Deltagos` window front when it starts.
- Tab harness (the builder's tabharness.swift and steps, read and copied to `.wt-notes/rs-ui/steps/`, with my own steps `a.txt` and `b.txt`): run against my own `wails dev -devserver localhost:34257` from a clean clone of 3155162, fixture `--review --memory critical`, auth off, under `harness.lock`. The window was offscreen, isKey true, with activation prohibited. Logs: `out/h-a-1024x640.txt`, `out/h-b-1440x900.txt`, `out/h-vf2-*.txt`.
  - §5 order with real Tab: ← Card → Next to review → the worklist (one stop). From a symbol's h2: the diff region `<symbol>, diff` (V-R4) → Called by's link → the radio group (one stop) → Note → `Reviewed, next` → Save, which is skipped while disabled, so focus falls on body. N opens formatName with focus on its h2, ring 2 px `--focus-ring`, and the live region silent. `Reviewed, next` gives `Reviewed 1 of 2`, focus on h2 `svc.Greet`, and its row in view (V-R8). Called by → h2 svc.Welcome → Tab `← back to svc.Greet` → h2 svc.Greet (V-R6). Esc in Note stays on the screen. A typed note enables Save; Save keeps focus and gives row `Greet, modified, question`, ? in `--tone`.
  - V-F1: no map → Make the map; with a map → the worklist stop; never body. Escape → the card back, focus on `Review the change`.
  - V-R4 / design tokens: added rows on `--status-now-bg`, removed on `--surface-pressed` with text `--fg-muted`, 12 px (`sm`) JetBrains Mono, head line numbers, none on `−`.
  - V-R5: `not in the card's declared changes` in rgb(255,176,32) = `--warning` on `--warning-bg`, in both row and panel. `no direct test` muted, no fill.
  - V-R11 still holds: at 1440, list 300, facts 360 beside the diff; page scrollWidth equals the width at 1024 and at 1440. Radios are 24 px high.
  - V-F2 as Amendment 5 wrote it: at 1440 the full title shows, 8 px to `›`. At 1024 the crumb's text and title attribute are the full title, with no overlaps; crumbs end at 473, before the Mac group at 489. On screen at 1024 with the critical badge the title shows `G…`, which Amendment 5 holds for a later card.
- vitest: in the shared run (V-R7 claim, V-R13, V-R14, the §4 words).
- V-R12: no reactflow, @xyflow, elkjs or monaco in `frontend/package.json` or the built `dist`.
- rv-list's UI review: R1 (Review section, Esc back to the button), R2, R3's first step (N → Must visit), the partial-free map, R11 widths and the §4 words all show as they did. Its U3 (flags wrap at a smaller indent than the name) is still there, held. U1 is fixed: focus on open is Make the map, else the worklist stop. U2 is as Amendment 5 says.

§4 and §3.3 words, design against screen:
- `No review map for this change yet.` / `Make the map`: the same.
- Making: `Making the map…` on the press; then `Making the map · 0 s`, `Stop`, `· 1 s` on a make longer than 1 s. The `0 s` is U4.
- Failed (`Try again`, `Copy the command`) and docs-only: vitest only.
- Moved and `Make it again`, `changed since you reviewed`, all reviewed: the same, live.
- Panel: `Flags`, `Tests`, `none name it directly`, `Called by`, `Calls`, `unchanged · shown because it calls svc.Greet`, `← back to svc.Greet`, `Reviewed` / `Question` / `Blocked`, `Note`, `Reviewed, next`, `Save`, `Kept in Deltagos; asking the supervisor comes later.`: the same, live. `The builder says` is vitest only. Flag words: the same.
- Words the design does not give: empty Called by and Calls read `none`; a callee reads `… because svc.Greet calls it`.

Findings:
- **U1 (2) After the last `Reviewed, next`, the panel still shows the old mark.**
  - What the person cannot do: trust the panel's mark. The row says ✓ and the count says 2 of 2, but the radios still say Question with the note, and Save is live. Pressing Save then puts the mark back to Question.
  - Where: Greet saved as Question, then `Reviewed, next` with nothing left to move to (`h-1024x640-R8-last-next.png`; harness `last`: rows `Greet, modified, reviewed`, checked `question`).
  - Evidence: MarkForm keeps its own state and is keyed by the node. When no next symbol opens, nothing resets it from the saved mark.
  - Proposal: after any save, set the radios and note from the saved mark (`markOf`). Or re-key the form on the mark.
- **U2 (2) Moving between the radios with the arrow keys loses the focus ring.**
  - What the person cannot do: see where focus is after choosing a mark by keyboard.
  - Where: the mark's radio group (`h-1440x900-radio-tabin.png`, then `h-1440x900-radio-arrow.png`).
  - Evidence: tabbing in, the focused radio matches `:focus-visible` and its span has `solid 2px` `--focus-ring`. After ↓, WebKit reports `:focus-visible` false on the newly checked input, and the span's outline is `none`. Only the selected look (accent border) remains. WCAG 2.4.7. The rule box's options use the same pattern; not measured there.
  - Proposal: draw the ring on `input:focus + span`, not only on `:focus-visible`. A radio takes focus only by keyboard or a click on its own label. Check the rule box in the same way.
- **U3 (2) `Open in editor` at the head line is not drawn, and Tests that did not change do not open the editor.** Pablo cannot jump from the diff to the code. The file and lines are shown, so he can open it by hand. FR-19 lists neither, and `OpenInEditor(path)` takes no line and knows no checkout of the reviewed head. I agree with the builder that this is a **spec gap**, not a fail. The severity is 2 because reading the change does not depend on it.
- **U4 (1, rs-review's V-R14 cause) The counter first reads `Making the map · 0 s`** although it appears only after a second. Same cause as rs-review's finding (whole-second `started`). Fixing V-R14 fixes this.
- **U5 (1) Called by and Calls links are in Manrope**, while every other symbol name (title, rows, Tests) is mono. The `link` class overrides `mono`.
- **U6 (1) While an affected symbol is shown, no worklist row is current.** The row of the changed symbol it came from loses `.on`, so the list says nothing about where you are.

Spec gaps (for the FSE):
- G1: U3. `Open in editor` and "else the editor" for Tests need a line-taking binding and a decision on which checkout opens: the card's worktree, the root, or a temp checkout of the head.
- G2: the fixture's second commit is broken. Its `perl -pi -e 's/…/`${last.toUpperCase()}, ${first}`/'` interpolates `${…}` and leaves `web/src/format.ts` 2 lines long (`git show review-second:web/src/format.ts`), so V-R10's changed symbol reads as a deleted body. This is rv-data's fixture (5e66aa9), not this card's. It still proves V-R10, but not as a real edit.
- G3: the fixture has no claim, so `The builder says` is never seen live. It also has no make that fails and none under 1 s.

For aglaea:
- A1: §3.3 gives words for an affected caller only. The builder wrote `unchanged · shown because svc.Greet calls it` for a callee. Is that right?
- A2: `Reviewed, next` marks Reviewed even when Question or Blocked is chosen with a note (§3.3 says so). With a Question chosen, should the primary ask before it overrides?
- A3: empty Called by and Calls read `none`. The design gives no words for this.

Not verified in WKWebView (vitest or code only): failed (`Try again`, `Copy the command`), docs-only, a claim (V-R7), a make that ends under 1 s (V-R14), Blocked (its ✕ in `--danger`), change-check off the PATH (V-R9, not rerun), Shift+N, the Tests group, another machine's card.
