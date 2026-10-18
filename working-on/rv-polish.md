---
title: "The review panel's words, ring and rows, as Aglaea's Amendment 2 and the UI reviews ask"
status: now
repos: [organizer]
branch: rv-polish
seat: rp-build
stage: review-map
updated: 2026-10-18
next: "review: rv-polish, gate met (P1-P5, X0), 570d4b0"
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
