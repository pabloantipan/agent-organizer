# Leftovers 7: the leftovers-5 wave's findings: the build spec

status: proposed (0078)
by: the FSE, 2026-10-04, on main 64e71c4
design: Aglaea's ranking `docs/ux/reviews/2026-10-04-rank-leftovers-7.md`
(adfce1e), "row n", and the design system as amended there (Elevation: one
layer order from z-index tokens; Focus and names: closing the top of a stack
returns focus to the box below, else to the opener), with her calls 3424695
(the scrim below the top bar) and 857949c (the never-fold order).

## Problem

sup31's reviews left one severity 3 (pre-existing: a card back opened while
ruling paints under the rule box), five severity 2 and three severity 1
rows. None needs a design call from Pablo. Rows 1, 2, 5, 6 and 7 touch
timeline-and-find-6's files, and rows 3, 5 and 10 share `rule-box.css`, so
this is one card, after timeline-and-find-6.

## Requirements, card `layers-focus-and-words`

- **FR-1** (row 1, sev 3) One layer order from z-index tokens in
  `tokens.css`: content < sticky < box and scrim < top bar < drawer or modal
  and its backdrop. The card back and its backdrop (`global.css:232`) sit
  above the rule box, the sticky headings and the top bar; the box's Rule is
  not clickable through it.
- **FR-2** (row 2) Closing the top of a stack returns focus to the box below
  at its last field; with no box below, to the opener.
- **FR-3** (row 3) At regular and compact the scrim starts below the top bar;
  Help opens over a rule box at every width; Escape closes Help first.
- **FR-4** (row 4) Inside the never-fold set, waiting gives way first (names,
  the noun to its floor, then "+N"); blocked never folds.
- **FR-5** (rows 5, 10) The rule box's scroller and a `.markdown pre` inside
  it take `useScrollEdges` (`lib/useScrollEdges.ts`, blessed here as the
  shared hook, S4); a wide `pre` scrolls inside the box, never widens it.
- **FR-6** (row 6) The Stages axis sticks while its rows scroll, as on
  Decisions; a stage landing keeps it in view.
- **FR-7** (row 7) The open record's Rule is named "Rule <NNNN> <title>".
- **FR-8** (rows 8, 9) Home's cut next date hovers the cell's words whole
  (`30 Nov · due · w-later`); Needs me rows read `raised 24 Sep` (the year
  only when not this year).
- **FR-9** (S1) A fixture card and a fixture record whose bodies hold a wide
  code block and a ten-column table.

## Acceptance → gate

Rows name window or content, the rail state and the scrollbar kind; rows over
a fixture run from a clean checkout; UI reviewers use `make review-build`.

| # | FR | Check | Expected |
|---|---|---|---|
| P1 | 1 | Decisions at a 1024×640 window: Rule open on a stuck record, then open a card back from the record; click where the box's Rule was | the card back above the box, the headings and the top bar; the click does not reach Rule; `tokens.css` holds the z-index tokens and no raw z-index is left in the touched files |
| P2 | 2, 3 | at regular and compact: Rule open, open Help, Escape, Escape | Help opens over the box; the first Escape closes Help and focus is the box's last field; the second closes the box and focus is its opener |
| P3 | 4 | `--twenty` partner-payouts at 1024×640 and 1280×800, rail expanded, classic scrollbars | "1 blocked" whole in view; waiting cut or in "+N" first |
| P4 | 5, 9 | the fixture record's rule box with its wide code block and table, overlay scrollbars; the fixture card's back; Help | each scroller shows its edge where content is hidden; no box or view widens |
| P5 | 6 | a stage landing at 1024×640 on the fixture roadmap; scroll its rows | the axis in view throughout |
| P6 | 7, 8 | the names log on an open record's Rule; Home's cut next date hover; a Needs me row | "Rule 0009 …"; `30 Nov · due · …`; `raised 24 Sep` |
| P0 | all | `XDG_DATA_HOME=$(mktemp -d) make test` from a clean checkout; `cd frontend && npm run build`; `wails build` | pass |

## Boundary

`tokens.css` (the z-index tokens), `global.css` (`.modal-backdrop` and the
layers' z-index), `decisions.css`, `rule-box.css`, `RuleDecisionBox.tsx`,
`HelpView.tsx` and `CardDrawer.tsx` (focus return and layer only),
`DecisionsView.tsx` (Rule's name), `Home.tsx`, `home.css`, `lib/width.ts`,
`lib/useScrollEdges.ts` and `lib/` tests, `TimeZoom.tsx`, `time-zoom.css`,
`StageRoadmap.tsx` (the sticky axis only), `testdata/fixture-overlay/`. Not:
Go, `docs/design-system.md`.

## Technical notes

- S2 (a UI review ran across a mid-review rebase) and the review-build
  proposal go to Hephaistos for the supervise skill.
- S3: review-build's N7 ("mtime unchanged") passes while WebKit writes WAL
  files inside the directory; the stronger check is `find -newer` plus
  `lsof` on the writer. review-build is in `done/`; this is noted, not
  rebuilt, unless a reviewer's write reaches Pablo's storage again.
- Spec check (spec-craft 5b with the proposed lines): rows read against the
  amended Elevation and Focus lines; files found by grep (`.modal-backdrop`
  at `global.css:232`, `useScrollEdges` now in `lib/`, the Stages axis in
  `TimeZoom.tsx`). Result: holds.

## Cards

| Card | Gate rows | Depends on | ui_review |
|---|---|---|---|
| `layers-focus-and-words` | P1–P6, P0 | timeline-and-find-6 | true |
