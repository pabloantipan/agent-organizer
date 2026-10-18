---
title: "The review panel's words, ring and rows, as Aglaea's Amendment 2 and the UI reviews ask"
status: now
repos: [organizer]
branch: rv-polish
seat: rp-build
stage: review-map
updated: 2026-10-18
next: "review: rv-polish, gate met (P1-P5, X0), 570d4b0"
review: pass
risk: low
footprint: [frontend/src/components/ReviewSymbol.tsx, frontend/src/components/ReviewSymbol.test.tsx, frontend/src/components/Review.tsx, frontend/src/lib/review.ts, frontend/src/lib/review.test.ts, frontend/src/styles/review.css, frontend/src/styles/rule-box.css (ring), scripts/fixture-home.sh (--review only)]
depends_on: []
boundary: ["docs/specs/review-map.md v3 Boundary, rv-polish"]
spec: "docs/specs/review-map.md (v3, FR-30 to FR-37; docs/ux/specs/review-view.md §3.3 and Amendment 2)"
gate: "docs/specs/review-map.md v3 Acceptance, rows P1, P2, P3, P4, P5 and X0"
ui_review: true
---

## Goal
The panel says which way a neighbour points, never overrides a Question, shows where focus is, and the fixture's second commit is a real edit.

## Gate
docs/specs/review-map.md v3, rows P1, P2, P3, P4, P5 and X0.
- [x] P1 — vitest: `lib/review.test.ts` and `ReviewSymbol.test.tsx` "P1"; harness `.wt-notes/rp-build/out/h-p-rows-1024x640.txt` (`p1_facts`, `p4_affected`)
- [x] P2 — vitest "P2" (lib, ReviewSymbol); harness `.wt-notes/rp-build/out/h-p-rows-1024x640.txt` (`p2_primary`, `p2_after`)
- [x] P3 — harness `.wt-notes/rp-build/out/h-p-rows-1024x640.txt` (`p3_panel_after_down`, `p3_rb_after_down`), `p3-panel-ring.png`, `p3-rulebox-ring.png`
- [x] P4 — harness at 1024×640 `.wt-notes/rp-build/out/h-p-rows-1024x640.txt` (`p4_mono`, `p4_affected`, `p4_flags`), `p4-flags.png`, `p4-affected.png`; vitest Review.test "P4 (FR-35)"
- [x] P5 — `.wt-notes/rp-build/out/p5-show-review-second.txt`, `p5-second-commit.txt`; V-R10 `.wt-notes/rp-build/out/h-p5-mark-two.txt`, `h-p5-vr10.txt`; D5 `.wt-notes/rp-build/out/p5-d5-map.json`, `p5-d5-exit.txt`, `p5-d5-porcelain.txt`
- [x] X0 — clean clone at 570d4b0: `.wt-notes/rp-build/x0-make-test.txt`, `x0-pnpm-build.txt`, `x0-wails-build.txt`, `x0-porcelain.txt` (empty)

## Declared changes
- modified `frontend/src/lib/review.ts`: `affectedLine` direction words (FR-30), `WORDS.noneFound`, `questionNext`, `blockNext`, `primaryOf` (FR-31)
- modified `frontend/src/lib/review.test.ts`: P1 words, P2 `primaryOf`
- modified `frontend/src/components/ReviewSymbol.tsx`: `none found` (FR-32), the primary from `primaryOf` saves the chosen mark (FR-31)
- modified `frontend/src/components/ReviewSymbol.test.tsx`: P1, P2, the CSS rules of P3/P4
- modified `frontend/src/components/Review.tsx:Worklist`: `currentRow`, the origin row keeps `.on` and gets `aria-current` (FR-35)
- modified `frontend/src/components/Review.test.tsx`: P4 FR-35, the panel props in `view`
- modified `frontend/src/styles/review.css`: radio ring on `:focus` (FR-33), mono links (FR-34), the mark in the row's padding (FR-36)
- modified `frontend/src/styles/rule-box.css`: the options' ring on `:focus` (FR-33), the ring only
- modified `scripts/fixture-home.sh`: `--review`'s second commit escapes `$` so it is a real one-line edit (FR-37)
Risky:
- `primaryOf`: Question and Blocked disable the primary until a note, so the primary is no longer always live
- `review.css .rv-row`: the mark is absolutely placed; a taller mark glyph or another item before the name would overlap
- `affectedLine`: direction from the edges; with mutual calls it reads `calls` from either list
Not changed, on purpose:
- `frontend/src/components/ReviewSymbol.tsx` `WORDS.v3` line: rv-ask-ui replaces it
- any Go, `app.go`, `frontend/wailsjs/`: the bindings sufficed

## Notes
- FR-30 reads the direction from the edges, not from the list the link sat in; they differ only for mutual calls (progress.md, Choices).
- P4's flag edge is the box: the muted `no direct test` has no background, so its text sits 7 px (padding) right of the name.

## Done
- 2026-10-18 rp-build: FR-30 to FR-37 on rv-polish (bc31270, 4f49e9e, 570d4b0), gate P1-P5 and X0 met; notes `.wt-notes/rp-build/progress.md`.

## Review
Verdict: **pass** at 570d4b0529f4e8aba90aea26d2ddb2f72d54571c (clean clone, `.wt-notes/rp-review/clean`, removed after). Unmet gate items: none. Reviewer rp-review, 2026-10-18.

- P1 met: vitest `lib/review.test.ts` "P1 (FR-30)" and `ReviewSymbol.test.tsx` "P1" assert `unchanged · calls svc.Greet`, `unchanged · called by svc.Greet`, `Called by none found`, `Calls none found`; string by string equal to review-view Amendment 2 A1/A3, R15, R17. In the app (harness): Greet's facts read `Called by svc.Welcome / Calls none found`, Welcome's line `unchanged · calls svc.Greet`.
- P2 met: vitest "P2 (FR-31)" in both files (labels `Reviewed, next`, `Save question, next`, `Save block, next`, A2's words; disabled without a note). Harness 1024×640: radio reached by Tab, ↓ checks Question, note typed, primary reads `Save question, next` (enabled); after Return the row reads `format.formatName, …, question` and focus is the H2 `svc.Greet modified`.
- P3 met: my own steps (`.wt-notes/rp-review/steps/rr-rows.txt`; the builder's focused the radio by `.focus()`, I reach it by a real Tab and compare the colour to `var(--focus-ring)` resolved, not by eye). Panel after ↓: `checked question, focused, 2px solid rgb(192, 171, 254)`, ring colour `rgb(192, 171, 254)`, ok; rule box (Home → Rule on 0002) after ↓: `two-machines`, the same, ok.
- P4 met at 1024×640: links' fontFamily equals `var(--mono)` resolved (`"JetBrains Mono Variable", …`); Called by → svc.Welcome: only `Greet, modified` has `aria-current=true` and `.on`; formatName's two wrapped flags start at l=58, the name at l=58.
- P5 met on fresh fixtures: `git show review-second:web/src/format.ts` has its body (`` return `${last.toUpperCase()}, ${first}`; ``), `git diff review-second^ review-second` is 1 file, 1 insertion, 1 deletion. V-R10: marked formatName Question and Greet Reviewed, ran `$FIXTURE_REVIEW_MOVE`, Make it again: `format.formatName, modified, …, changed since you reviewed` and `Greet, modified, reviewed`. D5: `go run . review init-a rv-fixture --json` exit 0, changed Go `svc.Greet` (tested, TestGreet) and TS `format.ts#formatName` (`untested`, `undeclared`), fixture repo `git status --porcelain` empty.
- X0 met: `XDG_DATA_HOME=$(mktemp -d) test-lease run --share -- make test` **fresh**, run c86f2b93-64009 (rp-ui reused it), exit 0: go all ok, vitest 74 files / 894 tests passed. `test-lease run -- pnpm run build` exit 0, `test-lease run -- wails build` exit 0, `git status --porcelain` of the clone empty.
- No-gos: no post, no network, no new dependency (no package.json/lockfile change), no absolute tool path; no Go, `app.go`, `frontend/wailsjs/`, store or `SlackView.tsx` change.

change-check (from the clean clone):

```
change-check: working-on/rv-polish.md
risk: low
repo organizer: base 68aae899d (default main) ... head rv-polish 570d4b052; 9 files

## Changed

- organizer/frontend/src/components/Review.test.tsx (modified, test)
- organizer/frontend/src/components/Review.tsx (modified): currentRow, ReviewView, Worklist
- organizer/frontend/src/components/ReviewSymbol.test.tsx (modified, test)
- organizer/frontend/src/components/ReviewSymbol.tsx (modified): ReviewSymbolView, MarkForm
- organizer/frontend/src/lib/review.test.ts (modified, test)
- organizer/frontend/src/lib/review.ts (modified): affectedLine, primaryOf
- organizer/frontend/src/styles/review.css (modified)
- organizer/frontend/src/styles/rule-box.css (modified)
- organizer/scripts/fixture-home.sh (modified)

## Tests touched

- organizer/frontend/src/components/Review.test.tsx
- organizer/frontend/src/components/ReviewSymbol.test.tsx
- organizer/frontend/src/lib/review.test.ts

## Risky (declared)

- `primaryOf`: Question and Blocked disable the primary until a note, so the primary is no longer always live
- `review.css .rv-row`: the mark is absolutely placed; a taller mark glyph or another item before the name would overlap
- `affectedLine`: direction from the edges; with mutual calls it reads `calls` from either list

## Not changed, on purpose (declared)

- `frontend/src/components/ReviewSymbol.tsx` `WORDS.v3` line: rv-ask-ui replaces it
- any Go, `app.go`, `frontend/wailsjs/`: the bindings sufficed

## Flags

| flag | where | symbol | detail |
|---|---|---|---|
| boundary unreadable | organizer | docs/specs/review-map.md: no section 'v3 Boundary' | boundary entry |
| outside boundary | organizer/frontend/src/components/Review.test.tsx |  | modified |
| outside boundary | organizer/frontend/src/components/Review.tsx |  | modified |
| outside boundary | organizer/frontend/src/components/ReviewSymbol.test.tsx |  | modified |
| outside boundary | organizer/frontend/src/components/ReviewSymbol.tsx |  | modified |
| outside boundary | organizer/frontend/src/lib/review.test.ts |  | modified |
| outside boundary | organizer/frontend/src/lib/review.ts |  | modified |
| outside boundary | organizer/frontend/src/styles/review.css |  | modified |
| outside boundary | organizer/frontend/src/styles/rule-box.css |  | modified |
| outside boundary | organizer/scripts/fixture-home.sh |  | modified |
| outside footprint | organizer/frontend/src/components/Review.test.tsx |  | modified |
| undeclared | organizer/frontend/src/components/Review.tsx | currentRow | added |
| undeclared | organizer/frontend/src/components/Review.tsx | ReviewView | modified |
| untested? | organizer/frontend/src/components/Review.tsx | currentRow | no test file names it |
| untested? | organizer/frontend/src/components/Review.tsx | Worklist | no test file names it |

15 flags: outside boundary 9, outside footprint 1, undeclared 2, declared, not changed 0, new env var 0, new dependency 0, new host 0, risk 0, untested? 2, could not read 0, boundary unreadable 1
```

Explanations:
- `boundary unreadable` and the nine `outside boundary`: the card's boundary entry is prose ("docs/specs/review-map.md v3 Boundary, rv-polish"), which change-check cannot parse. Read against the spec's v3 Boundary, rv-polish bullet: ReviewSymbol.tsx and its test, Review.tsx (the current row: `currentRow`, `aria-current`), lib/review.ts and its test, review.css are inside; rule-box.css changes the ring rule only (one rule plus a comment); fixture-home.sh changes only the `--review` branch's second-commit perl line. All inside except `Review.test.tsx`, below.
- `outside footprint` / `outside boundary` `Review.test.tsx`: the spec's rv-polish bullet names Review.tsx but not its test. The change adds two binding mocks (`MarkReview`, `ReviewFile`, needed now that the view renders the panel) and the FR-35 test; no product code. Note: a boundary omission in the spec, not a defect; rv-ask-ui does not list it either, so no overlap.
- `undeclared` `currentRow` (added) and `ReviewView` (modified): declared at file level as `Review.tsx:Worklist: currentRow, …`; `currentRow` is the one-line helper and ReviewView's one changed line passes it to Worklist. Explained.
- `untested?` `currentRow`, `Worklist`: covered by Review.test "P4 (FR-35)" through ReviewView's rendering; no test names them literally.

Notes (not blocking):
- Note: `affectedLine` reads direction from the edges, not from the list the link sat in (declared Risky). With mutual calls (W→G and G→W) opening W from `Calls` reads `unchanged · calls svc.Greet`, where FR-30 says `called by`; both are true then. → backlog line for the FSE (review-map), with the gate's Boundary omission of `Review.test.tsx`.
- Note: the radio ring now draws on `:focus`, so it also shows when a radio's label is clicked; the design call is rp-ui's.
