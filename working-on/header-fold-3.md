---
title: The header, third pass - the stage stays in the bar at compact, tiles open their own stage, the fold tested
status: now
repos: [organizer]
branch: header-fold-3
updated: 2026-10-03
next: "review: header-fold-3, gate met (G18 G19 G20 G11); G21 is the UI reviewer's"
depends_on: [decisions-view, time-zoom-2]
boundary: ["frontend/src/components/InitiativeHeader.tsx and its CSS", "frontend/src/styles/shell.css (the header's rules only)", "frontend/src/components/StageRoadmap.tsx and frontend/src/stores/board.store.ts (open a stage by position, FR-18; the fold's storage behind a lib function, FR-19)", "frontend/src/lib/ and its tests", "not: home-widths-4's files, DecisionsView.tsx, Go, docs/design-system.md"]
spec: "docs/specs/initiative-header.md (amendment 4, FR-17 to FR-19); the ranking docs/ux/reviews/2026-10-03-rank-leftovers-3.md (Aglaea, 2b6d608)"
gate: "docs/specs/initiative-header.md Acceptance, rows G18 to G21 and G11"
ui_review: true
seat: hf3-build
review: pass
---

## Review
- Verdict: **pass** (code review; G21 is the UI reviewer's).
- Unmet gate items: none. G18: `G18-measure.json` and the 1024x640 shots, Work and Decisions, header 256 px, bar stage at y 55-79, edges 1 px `--border-strong` switching at top/bottom. G19: `G19-measure.json`, tiles 1-4 (click and Enter) expand and focus their own row; tile 3 (duplicate `joins`) opens row 3. G20: `lib/fold.test.ts` stores "folded" and reads it back; the store calls `lib/fold`. G11, rerun by the reviewer at 6a670e6: `make test` (Go ok, vitest 13 files / 137 tests), `npm run build`, the redesign G18 grep empty, `wails build` ok.
- Boundary: 10 files, all inside it; none of home-widths-4's.
- Outside the gate: (1) G18's "edge visible" when scrolled to the bottom is met by the top edge. That is the builder's reading of the design system's line. The gate should say "the edge with content hidden past it", so Pablo/the FSE can confirm the wording. (2) StageRoadmap's focus effect now has no dependency list. If the target row never mounts, `focusOn` stays set and could take focus on a later render. A guard or a clear on initiative change would close it. (3) `useScrollEdges` observes the area's children only at mount, so a child added later does not re-measure until scroll or resize. (4) The evidence is headless Chromium, so WKWebView rests on G21. (5) This was already there and is outside the boundary: at 1024 the Stages axis labels overlap ("3 Aug10 Aug17").
- Reviewer: hf3-review, 2026-10-03.

## Goal
header-fold-2's leftovers, ranked by Aglaea: FR-17 to FR-19 of
`docs/specs/initiative-header.md`.

## Gate
- [x] G18: see `docs/specs/initiative-header.md`, Acceptance
- [x] G19: see `docs/specs/initiative-header.md`, Acceptance
- [x] G20: see `docs/specs/initiative-header.md`, Acceptance
- [ ] G21: see `docs/specs/initiative-header.md`, Acceptance
- [x] G11: see `docs/specs/initiative-header.md`, Acceptance

## Done
- 2026-10-03 hf3-build: FR-17 to FR-19 on header-fold-3 (376b1aa fold in lib/fold, 3c07f67 tiles by position, b577edc stage kept in the bar at compact with scroll edges, 6a670e6 landed stage focused); G18 G19 G20 G11 measured in .wt-notes/hf3-build/; G21 left for the UI reviewer
- 2026-10-03 sup28 launched by the FSE (decisions-view and time-zoom-2 in done/)
- 2026-10-03 0074 ruled by pablo ("Ok", accept as written, 117e269)
- 2026-10-03 cut from initiative-header amendment 4 by the FSE

## Next

## Blockers

## Notes
Runs in parallel with home-widths-4; boundaries disjoint.
- Not anticipated: the landed stage was expanded but never focused (FR-4):
  since time-zoom the stage rows mount a render after the landing, so the
  focus was dropped. Fixed in StageRoadmap.tsx (6a670e6).
- Not anticipated: with a duplicate stage id both rows list the same cards,
  since a card's `stage:` names an id. Left as is; the scan reports it.
- G18's "edge visible" at the bottom is the top edge: the design system's
  line marks the edge with content hidden past it, so each edge is drawn on
  its own.
