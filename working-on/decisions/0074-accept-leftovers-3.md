---
title: Accept the leftovers-3 batch (both specs' amendment 4, decisions-view Amendment 1) and launch its two cards after decisions-view
status: proposed
raised: 2026-10-03
raised_by: fse
owner: pablo
ruled:
ruled_by:
options: [accept as written, accept with amendments, send back]
chosen:
cards: [header-fold-3, home-widths-4, decisions-view]
threads: [01M41B2BRFY6W55KSBC307ZWY5]
supersedes: []
superseded_by:
---

## Question

You accepted batching sup25's leftovers. Aglaea ranked them
(`docs/ux/reviews/2026-10-03-rank-leftovers-3.md`, 2b6d608): 11 rows plus
5 gate and fixture rows, all severity 2 or 1, none needing your word on
design. She also amended the design system's Widths in that commit.

- **To decisions-view (Amendment 1, B12-B14):** a tall record's line and its
  Rule stay under the section heading while you scroll, until the record
  ends (her reading of 0069's note: main only lands it there); the record
  line says "waiting" once. This changes 0072's spec, and the
  decisions-view card now touches `dec-line`.
- **header-fold-3** (`docs/specs/initiative-header.md` amendment 4, FR-17 to
  FR-19, G18-G21): at compact the bar keeps its stage while Details is open
  and the scroll area shows its edge; a stage tile opens its own stage by
  position; the stored fold gets a test; G15 drops its unmounted clause.
- **home-widths-4** (`docs/specs/responsive-home.md` amendment 4, FR-20 to
  FR-25, G19-G24): a column empty on every row gives way first; waits on
  you, blocked and waiting never fold into "+N"; wide is measured on the row
  with 2200 as the floor; Escape closes the rule box from anywhere in the
  view; the opener's row stays above the scrim; conversation buttons named,
  24 px targets; the cell lozenge ellipsized; the fixture gains the rows the
  reviewers had to force.

Both cards run in parallel after decisions-view (it shares the rule box's
Decisions behaviour), each with a UI reviewer who also shoots the built app
in WKWebView, since every number so far is headless Chromium.

Spec check (spec-craft 5b): every gate row against its FR and the specs'
Technical notes and States; boundary files traced by grep (`CellStateLz` in
`Crew.tsx`, `.rail-icon` in `global.css`, the tile's `openStage` in
`InitiativeHeader.tsx`, vitest's scope for FR-19). Result: holds.

forecast: 40-75 min of wave time over 1 wave (two cards in parallel, UI
reviewers included), after decisions-view's wave, plus this decision
(median 0 d); basis: 6 single-wave UI tasks, this initiative (25, 34, 41,
46, 47, ~80 min).

## Options

- **accept as written**
- **accept with amendments**: name them.
- **send back**: say what is wrong.

## Recommendation

The FSE's: accept as written. Every design call is Aglaea's; the rest is
the design system as amended and gate fixes.

## Ruling

## Consequences

On acceptance: decisions-view builds B1-B14; the FSE starts one supervisor
for header-fold-3 and home-widths-4 once decisions-view is in `done/`.
