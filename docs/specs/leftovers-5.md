# Leftovers 5: header-fold-3 and home-widths-4's findings: the build spec

status: proposed (0077)
by: the FSE, 2026-10-03, on main 769000f
design: Aglaea's ranking `docs/ux/reviews/2026-10-03-rank-leftovers-5.md`
(31f7ac9), "row n", and the design system as amended in that commit (the
document never scrolls; fold order and floors; the scroll edge token; Escape
closes the topmost box; hover keeps the mark; a box never covers its opener;
the ring is for the keyboard).

## Problem

sup28's reviews left twelve severity 2 and 1 rows and six gate and code
rows. None needs a design call from Pablo. Rows 13 (live signals flicker
with three app instances) and 15 (as designed) are no build work; row 14 is
a gate wording.

## Requirements

Card `rule-box-and-stages` (after markdown-and-labels, whose files it shares):

- **FR-1** (row 3) Escape closes the topmost open box only: one stack of open
  boxes (Help, a card drawer, a rule box), the document listener acts on its
  top.
- **FR-2** (row 4) A rule box never covers its opener; at compact on
  Decisions it opens below the stuck head's action row, the head visible.
- **FR-3** (row 7) Hover never takes the opener's selected mark away.
- **FR-4** (row 8) A stage tile's landing scrolls so the expanded detail
  shows as far as it fits, its toggle at the top.
- **FR-5** (row 11) A duplicate stage id's rows read `Cards can't be joined:
  two stages are named "<id>".` and list no cards.
- **FR-6** (S6) StageRoadmap's focus effect has a dependency list.

Card `home-signals-5` (after markdown-and-labels; beside rule-box-and-stages,
disjoint files):

- **FR-7** (row 1, first) The document never scrolls: the row holding
  `.p-stage`'s `sr-only` spans gets `position: relative`, and `html, body`
  get `overflow: hidden` (`global.css:4`). Then rows 2 and 5 are re-measured
  in the built app before any change for them.
- **FR-8** (rows 2, 5, 6) Signals fold against floors in rendered width: the
  floor of waiting and blocked is `N` plus the whole noun ("5 waiting");
  the fold order is live, now, problems, then the cell (0076), and the cell
  shows wherever it fits beside a cut waiting. The goal floor is measured
  with the classic scrollbar present. `shareRoom` never returns
  `fits: false` (S6).
- **FR-9** (row 9) The scroll edge line is `--fg-subtle`; `useScrollEdges`
  (`InitiativeHeader.tsx`) observes children added after mount (S6).
- **FR-10** (row 10) "Clear search", "Clear reply to <author>" and "Hide
  people" are the buttons' names.
- **FR-11** (row 12) Home's next date reads as everywhere else (`30 Nov`, the
  year only when not this year) and never wraps.

## Acceptance → gate

Every width row names window or content, the rail state and overlay or
classic scrollbars (S1); signal rows measure after the first `agents` event
(S2); 2560×1440 is gated as 2560×1380 (S3); rows over a fixture run from a
clean checkout (S4). G20 of `responsive-home.md` now reads "≥ 65 characters
on its line" (row 14, amended by the FSE with this spec).

| # | FR | Check | Expected |
|---|---|---|---|
| M1 | 1 | the built app: Rule open on Home, then Help, Escape; then a card drawer over a rule box, Escape | each Escape closes only the top box |
| M2 | 2, 3 | Decisions at a 1024×640 window, rail expanded, a stuck head, Rule; wide Home, pointer in the box | DOM: the element at the opener's Rule is the Rule; the opener keeps `--surface-selected` while hovered away |
| M3 | 4, 5, 6 | a stage tile's landing at 1024×640; the init-a roadmap's duplicate id | the detail in view below its toggle; both duplicate rows show the sentence and no cards; no React warning for the effect |
| M4 | 7 | the built app, classic scrollbars, a wheel past Home's end at 1024, 1280 and 1512 | `document.scrollingElement.scrollTop` stays 0; no outer scrollbar |
| M5 | 8 | `--twenty`, the built app, classic scrollbars, after the first `agents` event: 1024×640 and 1280×800 rail expanded, 1920×1080 | waiting and blocked whole ("5 waiting") or folded after live, now, problems and the cell; the goal shown at 1280; the cell shown at 1920; a lib test that `shareRoom` returns fits |
| M6 | 9 | the header's scroll area with content past an edge | the edge line in `--fg-subtle`; it appears for content added after mount |
| M7 | 10, 11 | the names log over Conversation's clear and hide buttons; init-a's row at 1512 in the built app | names as FR-10; `30 Nov` on one line |
| M0 | all | `XDG_DATA_HOME=$(mktemp -d) make test` from a clean checkout; `cd frontend && npm run build`; `wails build` | pass |

## Boundary

- **rule-box-and-stages:** `RuleDecisionBox.tsx`, `rule-box.css`,
  `HelpView.tsx` and `CardDrawer.tsx` (their Escape only, FR-1),
  `decisions.css` (the box's placement only), `StageRoadmap.tsx`, `lib/` and
  its tests, `testdata/fixture-overlay/`. Not: home-signals-5's files,
  `DecisionsView.tsx`, Go, `docs/design-system.md`.
- **home-signals-5:** `Home.tsx`, `home.css`, `global.css` (`html, body` only),
  `lib/width.ts` and `lib/` tests, `shell.css` (the scroll edge only),
  `InitiativeHeader.tsx` (`useScrollEdges` only), `Conversation.tsx` and
  `SlackView.tsx` (FR-10's names only), `testdata/fixture-twenty/` and
  `scripts/fixture-home.sh`.
  Not: rule-box-and-stages' files, Go, `docs/design-system.md`.

## Technical notes

- Row 13 (live signals flicker): three app instances on one Mac each sample
  CPU since their own previous sample (`Service.prevCPU`). The FSE traces it
  before anyone calls it a defect; not in these cards.
- S5: a review fail that is a design question goes to Aglaea before the
  builder (the supervisor's prompt says so). 0076 cost 3 h 18 min of a
  4 h 39 min wave because it went to the builder twice first.
- Spec check (spec-craft 5b with the proposed lines): every gate row read
  against these notes and the design system's amended Widths and Focus; no
  row asks for stored state. Files found by grep: `.p-stage` in `Home.tsx`,
  `home.css`; `useScrollEdges` in `InitiativeHeader.tsx:169`; `shareRoom` in
  `lib/width.ts:156`; `html, body` at `global.css:4`; `nextDate` in
  `InitiativeHeader.tsx`, used by Home (FR-11 changes Home's rendering only).
  Result: holds.

## Cards

| Card | Gate rows | Depends on | ui_review |
|---|---|---|---|
| `rule-box-and-stages` | M1–M3, M0 | markdown-and-labels | true |
| `home-signals-5` | M4–M7, M0 | markdown-and-labels | true |
