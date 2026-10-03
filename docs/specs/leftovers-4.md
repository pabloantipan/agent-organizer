# Leftovers 4: decisions-view and time-zoom-2's findings: the build spec

status: proposed (0075)
by: the FSE, 2026-10-03, on main cae853b
design: Aglaea's ranking `docs/ux/reviews/2026-10-03-rank-leftovers-4.md`
(94308ad), "row n", and the design system as amended in that commit (Widths,
Focus and names, Timeline, Decision record). Rows 5, 6, 8 and 9 change
`docs/ux/specs/decisions-view.md` §2 and §6 as the ranking says.

## Problem

sup27's reviews left fifteen severity 2 and 1 findings on the Decisions view
and the time zoom, and five gate gaps. None needs a design call from Pablo;
row 7 (Tab in the real app) waits on his answer to Q1 and is not in these
cards. Row 16 is no work now.

## Requirements

Card `zoom-decisions-polish` (runs beside sup28; its files are in neither of
sup28's cards):

- **FR-1** (row 1) When a zoom button is about to disable itself, focus
  shall move to the opposite button first, and the ring shall show in
  WKWebView (a class that draws the same ring if `:focus-visible` is dropped).
- **FR-2** (row 4) The Timeline's axis shall stick under its sticky heading
  while its rows scroll.
- **FR-3** (row 5) With no find on, an empty Ruled says `Nothing ruled yet.`;
  "no match" only while a find is on.
- **FR-4** (row 6) While a find is on, every section with a hit shows open;
  clearing it restores the operator's own layout; nothing is stored.
- **FR-5** (row 8) A landing opens a section for the visit only; storage
  holds only what was toggled by hand.
- **FR-6** (row 9) The Timeline's count names what it hides:
  `Timeline · 1 of 71 · 3 hidden`.
- **FR-7** (rows 11, 12, 13) The label column has one continuous
  background; the zoomed frame's focus ring is drawn on its wrapper, outside
  the frame; the lane ends with 12 px of padding right and bottom.
- **FR-8** (row 15) Where no ruler is recorded, the record line's text and
  its name both say `no ruler recorded`.

Card `markdown-and-labels` (after sup28's cards and zoom-decisions-polish,
whose files it shares):

- **FR-9** (row 2) `pre` and tables in any `.markdown` body scroll inside
  themselves (`overflow-x: auto; max-width: 100%`); no body widens its view.
  Amended 2026-10-03 (mal-ui U1, sev 3): a body scrolled sideways keeps its
  offset across the periodic refresh; the body's DOM is replaced only when
  its HTML changes (`DecisionsView.tsx:284` re-sets it today).
- **FR-10** (row 3; amended 2026-10-03, Aglaea 59b4dcb, as built) Superseded
  and withdrawn records lose the row opacity (`global.css:713`); title and
  meta take `--fg-muted`; their lozenge takes the neutral badge
  (`--fg-muted`), not its own tokens.
- **FR-11** (row 10; amended 2026-10-03 to the design system's Timeline as
  amended in 59b4dcb, mal-ui U2/U3) No axis text is cut at the lane's edges
  (milestone titles, today, the undated label). Tick labels that would
  overlap skip one in two, and a tick label gives way to a mark's title; a
  mark's title is never skipped: colliding titles stagger to the next label
  row. Measured on the rendered width, not a character count.
- **FR-12** (row 14) The capped rule box has `overflow-x: hidden`, and its
  stuck placement moves from `decisions.css`'s `!important` into the box.

## Acceptance → gate

Sizes are window sizes and every row names the rail state (Widths, as
amended; S2). Keyboard rows run in WKWebView with macOS Keyboard navigation
on and say so (Focus and names, as amended; row 7).

| # | FR | Check | Expected |
|---|---|---|---|
| L1 | 1 | WKWebView 1512×945 window, rail expanded: Enter on `+` to the deepest level, then `−` to Fit | screenshot after each: `activeElement` is the opposite button and its ring is visible |
| L2 | 2 | Decisions, Timeline open, 74 records, scroll 600 px | the axis under the Timeline heading |
| L3 | 3, 4, 6 | init-drafted's Ruled with no find; a find whose hits sit in closed sections, then clear | `Nothing ruled yet.`; the sections with hits open; after clearing, the stored layout back; `Timeline · n of N · k hidden` |
| L4 | 5 | land on a record in a closed Ruled, leave and come back | Ruled closed again; storage unchanged |
| L5 | 7 | Hours on Cards in WKWebView with classic scrollbars | no outline round the labels; the frame's ring whole; no mark under the scrollbar |
| L6 | 8 | the names log over a record with no `ruled_by` | text and name both `no ruler recorded` |
| L7 | S1 | B13 with a box taller than its room: Chromium 1024×580 content, or an error line in the box | the box scrolls; Rule and Cancel inside it |
| L8 | S3 | `/` focuses the find; Escape clears it; "Show only the newest ten"; a record ruled while Ruled is closed leaves To rule | each as stated |
| L9 | 9, 10 | Decisions with 0032's wide yaml at a 1024×640 window; a superseded record | no horizontal scrollbar on the scroller; the code block scrolls inside; the superseded lozenge's text ≥ 4.5:1 |
| L10 | 11 | the fixture at 1024×640 window, rail expanded: Cards at Fit and Days, Stages, Decisions at Fit | no cut milestone, today or undated label; no overlapping labels; every milestone title shown, colliding ones on the next row; a tick under a title gives way (DOM: rendered widths) |
| L12 | 9 | Decisions, 0006 expanded, its code block scrolled right, wait 40 s through refreshes, both engines | the `pre` keeps its `scrollLeft`; the body's DOM not replaced while its HTML is unchanged |
| L11 | 12 | WKWebView, the capped rule box | no horizontal scrollbar; no `!important` placement left in `decisions.css` |
| L0 | all | `XDG_DATA_HOME=$(mktemp -d) make test`; `cd frontend && npm run build`; `wails build` | pass |

## Boundary

- **zoom-decisions-polish:** `TimeZoom.tsx`, `time-zoom.css`, `lib/axis.ts`
  and its tests, `DecisionsView.tsx`, `decisions.css` (FR-2 to FR-8 only),
  `lib/` and its tests, `testdata/fixture-overlay/` (S5). Not:
  `scripts/fixture-home.sh` and `testdata/fixture-twenty/` (home-widths-4's
  while it runs), `global.css`, `rule-box.css`, `RuleDecisionBox.tsx`,
  `StageRoadmap.tsx`, sup28's files, Go, `docs/design-system.md`.
- **markdown-and-labels:** `DecisionsView.tsx` (the record body's render
  only, FR-9 as amended), `global.css` (`.markdown` and `.dec.*` rules
  only), `rule-box.css`, `RuleDecisionBox.tsx`, `decisions.css` (the
  `!important` placement only), `TimeZoom.tsx`, `lib/axis.ts` and
  `StageRoadmap.tsx` (axis labels only), `lib/` tests, the fixture homes.
  Not: Go, `docs/design-system.md`.

## Technical notes

- S4: a UI reviewer's remembered state lands in Pablo's installed app (same
  bundle id, same WebKit storage). The supervisor's prompt tells the UI
  reviewer to clear the app's WebKit storage for `cl.antipan.organizer`
  after its run, or to run the build under review with a test bundle id;
  the supervise skill's fix goes to Hephaistos.
- Spec check (spec-craft 5b, with the two lines proposed to Hephaistos):
  every gate row read against this spec's notes and the design spec's States
  (FR-4 stores nothing, FR-5 stores only hand toggles: no row asks for
  stored landing state); every file named was found by grep
  (`global.css:713`, `StageRoadmap.tsx`'s undated label, `decisions.css`'s
  placement). Result: holds.

## Cards

| Card | Gate rows | Depends on | ui_review |
|---|---|---|---|
| `zoom-decisions-polish` | L1–L8, L0 | — (beside sup28) | true |
| `markdown-and-labels` | L9–L11, L0 | header-fold-3, home-widths-4, zoom-decisions-polish | true |
