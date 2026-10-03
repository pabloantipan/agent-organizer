---
title: The header, third pass - the stage stays in the bar at compact, tiles open their own stage, the fold tested
status: done
repos: [organizer]
branch: header-fold-3
updated: 2026-10-03
next: "merged 4f17404 (sup28); UI findings U1-U3 sev 1 and the code review outside-gate notes are the FSE's"
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
- [x] G21: see `docs/specs/initiative-header.md`, Acceptance
- [x] G11: see `docs/specs/initiative-header.md`, Acceptance

## Done
- 2026-10-03 sup28 merged 4f17404 (code review pass e4f4d00, UI review pass c2e715b); make test and npm run build green on main
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

## UI review
hf3-ui, 2026-10-03, on `header-fold-3` at 6a670e6, fixture home (init-a).
Chromium: `wails dev` on 34471, headless Playwright. WKWebView: `wails build`
of the same commit, window 1024×640 (content 609), captured alone with
`screencapture -l`. Shots and drivers in `.wt-notes/hf3-ui/`.

**Verdict: pass.** No severity 4 or 3. G18 and G19 hold in both engines.

### Gate rows (G21)

| Row | State | Chromium | WKWebView | Measured | Difference |
|---|---|---|---|---|---|
| G18 | Work, Details open, header at top | `chromium-1024x640-G18-work-open-top.png` | `webkit-1024x640-G18-work-open-top-railexpanded.png` | head 256/640 (40 %); area 178 of 450, scrolls; bottom edge `--border-strong`, top transparent; the stage in the bar | WKWebView draws a classic scrollbar in the area (mouse attached), Chromium none |
| G18 | Work, scrolled to the bottom | `chromium-1024x640-G18-work-open-bottom.png` (and `-1024x609-`) | `webkit-1024x640-G18-work-open-bottom-railexpanded.png`, `…-railstrip.png` | the stage stays in the bar (`Stage 2 of 4 · now · The joins`); top edge on (WKWebView pixel row 121: 62,59,67 on 25,21,31), bottom off; the strip whole above the tabs | none beyond the scrollbar |
| G18 | Decisions, top and bottom | `chromium-1024x640-G18-decisions-open-{top,mid,bottom}.png` | `webkit-1024x640-G18-decisions-open-{top,bottom}-railexpanded.png`, `…-bottom-railstrip-stagehover.png` | as Work; the header keeps its scroll position across the tab | none |
| G19 | tiles 1-4 pressed (click) | `chromium-1024x640-G19-click-tile{1..4}.png` | `webkit-1024x640-G19-click-tile{1..4}.png` | each opens Roadmap → Stages with its own position expanded; tile 3 (the duplicate `joins`) opens stage 3 "written twice by hand", not stage 2; header folded | none |
| G19 | tiles 1-4 by Enter | `chromium-1024x640-G19-enter-tile{1..4}.png` | not verified (below) | `activeElement` is the stage's toggle, "Stage n: …. Hide its detail", in view | - |
| G19 | focus after landing | log in Chromium | `webkit-1024x640-G19-tile4-then-Return-focus-proof.png` | Return after tile 4's landing collapses stage 4: focus is on its toggle in WKWebView too | - |

Earlier rows rechecked in Chromium at 1024×640, 1512×945, 3440×1380
(`earlier.log`): G2 folded head 76 px; G12 256 px at compact, scrolls; G13
folded, folded, folded, then open across a switch; G14 target whole, goal
ellipsized; G16 `cursor: pointer`, 2px offset on the bar's stage and on the
current tile by keyboard; G17 names as written. All hold. At regular and wide
the open header has no stage in the bar, as FR-17 asks (compact only).

### Findings

- **U1 (1) The scroll edge is barely visible.** The lead on a trackpad
  (overlay scrollbars) has only the line to tell the header scrolls. Where:
  `webkit-1024x640-G18-work-open-bottom-railexpanded.png`, row 121.
  Evidence: `--border-strong` measures 1.6:1 on the header's background.
  It is the design system's token, so this is conformance, not the card's
  defect. Proposal (Aglaea, DS): consider a stronger edge or a short fade
  for scroll areas.
- **U2 (1) After a pointer landing, the focused stage shows no ring.** The
  lead sees which stage opened (the accent left border) but not that it has
  focus. Where: `*-G19-click-tile3.png`, both engines. Evidence: focus is
  there (Return collapses it), `:focus-visible` is false after a click.
  Proposal: none needed. If the DS's "focus onto what a navigation names"
  should always be visible, say so there.
- **U3 (1) Stage 4's landing at 1024×640 leaves its detail below the fold.**
  Only the outcome line shows. Where: `*-G19-click-tile4.png`. Evidence:
  `scrollIntoView({block: "nearest"})` on the toggle only. Proposal: bring
  the expanded detail into view as far as it fits, keeping the toggle on
  screen.

### Spec gaps (for the FSE)

- With a duplicate stage id both rows list the same cards (the builder's
  note; `*-G19-click-tile3.png`). FR-18 says nothing more is shown on the
  tile, but not what the expanded row shows. Decide whether a duplicate
  row's Cards says the join is ambiguous.
- G18 does not name the rail state; DS Widths asks it to. Reviewed both:
  Chromium's fresh profile starts as the strip, WKWebView's stored state was
  expanded, and it was also shot with the strip.

### Outside this spec (recorded, not findings against the card)

- Roadmap → Stages axis labels overlap at 1024 ("10 Aug17 Aug24 Aug31"),
  worse with the rail expanded (`webkit-restore-check.png`). This is the DS
  "no axis text cut" (leftovers-4).
- Work's wave strip and columns scroll sideways at 1024.

### Not verified

- Enter on the tiles in WKWebView. macOS Keyboard navigation is off here
  (`AppleKeyboardUIMode` unset), so Tab does not reach buttons (Q1). Enter
  passed in Chromium only.
- Overlay scrollbars in WKWebView: this machine has a mouse, so the area
  drew a classic scrollbar. The edge line alone was not seen without it.
- G1, G3-G10, G15 were not rerun. This branch touches none of their code
  paths besides the stage tile (G6, covered by G19).
- Running the app wrote its rail and fold state to the bundle's WebKit
  storage, which the installed app shares. I restored the rail to expanded
  and left the header folded.
