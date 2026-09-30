---
title: Accept the header and widths leftovers batch (both specs' amendment 3), and launch its two cards
status: proposed
raised: 2026-09-30
raised_by: fse
owner: pablo
ruled:
ruled_by:
options: [accept as written, accept with amendments, send back]
chosen:
cards: [header-fold-2, widths-and-focus]
threads: [01M3RCXDRAHWDQSD34QPZ97Y3X]
supersedes: []
superseded_by:
stage: twenty-at-a-glance
---

## Question

Aglaea ranked the UI leftovers of header-fold and responsive-home-2 into 15
rows and one fixture gap
(`docs/ux/reviews/2026-09-30-rank-header-fold-responsive-2.md`, 3f3df2f),
all severity 2 or 1, none needing your word on design. Two rows change
specs you accepted:

- **Row 2 (changes 0063's build spec):** after a landing folds the header,
  the next tab you press springs it open again (466 of 640 px). The design
  always said a landing is your choice to fold; the build spec's technical
  note kept it in memory only. Now a landing stores "folded".
- **Row 5 (changes 0061):** wide starts at 2200, not 1920. At 1920 with the
  rail open the list keeps about 1,150 px and goals fall to 22 characters,
  so 1920–2199 get the single column with goals.

The rest: the open header at 1024×640 capped at 40% of the window; the goal
gives way before the target; Agents drops the repeated id; stage tiles look
like buttons; signals never wrap at any width; Home hides a column only
when it does not fit (today 1280–1439 hides goals with ~480 px empty); a
scrim over rows the rule box covers; a 24 px rail toggle; "Open in
Decisions" on a ruled record lands on it; focus and names on the card back
and the thread divider; "now" as the stage word everywhere.

It is amendment 3 of `docs/specs/initiative-header.md` (FR-10 to FR-16,
G12 to G17, card `header-fold-2`) and of `docs/specs/responsive-home.md`
(FR-13 to FR-19, G13 to G18, card `widths-and-focus`). The two cards run in
parallel, each with a UI reviewer. Aglaea settled the one open point: an
expanded record taller than the view keeps its head at the top, Rule
included, and the body scrolls (main already does; G17 checks it holds).

forecast: 40–70 min of wave time over 1 wave (two cards in parallel, UI
reviewers included), plus this decision (median 0 d); basis: 7 cards in 5
single-wave tasks with UI reviewers, this initiative (ui-leftovers 47,
lead-side-fixes 25, responsive-home 41, responsive-home-2 34,
initiative-header ~80 active min).

## Options

- **accept as written**
- **accept with amendments**: name them.
- **send back**: say what is wrong.

## Recommendation

The FSE's: accept as written. Every design call is Aglaea's, measured on
the build; the two spec changes are the design being built as drawn.

## Ruling

## Consequences

On acceptance: the FSE starts one supervisor (sup25) for both cards.
