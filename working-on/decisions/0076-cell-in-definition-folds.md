---
title: home-widths-4 G19 - does "cell in definition" fold into "+N"?
status: ruled
raised: 2026-10-03
raised_by: fse
owner: pablo
ruled: 2026-10-03
ruled_by: pablo
options: [never folds, folds last]
chosen: folds last
cards: [home-widths-4]
threads: []
supersedes: []
superseded_by:
---

## Question

`home-widths-4`'s code review failed on G19 alone (5a2fd88). FR-20 and the
design system's Widths name which signals never fold (waits on you, blocked,
waiting) and which fold first (problems, now, live). Neither list names the
"cell in definition" lozenge. The builder folded it last, after problems, now
and live, because at a 1440 window the signal column (218 px) cannot hold
waiting, blocked and the cell whole. G19 says only problems, now and live
may be in "+N", so the build fails it.

The reviewer's point: a cell in definition is itself a Needs me row
("partner-payouts · payouts-fixture in definition"), so it waits on you, and
by the design system's own rule it should not fold.

Since raised: sup28 built "never folds" (G19 as written). It then failed at a
1024x640 window with the rail expanded: waiting, blocked and the cell at
their shortest plus "+4" need 151 px of a 145 px column (1d6cec6, 7460ea4).
Aglaea's design call (thread 01M41HJGNN8PP85CHHSBN3VHCV, design system
Widths amended e9fdcf4): the cell folds last of the foldable signals,
everywhere. Widths names only waits on you, blocked and waiting as never
folding; a cell waiting on you is already its own Needs me row. A wider
column at compact breaks the goal's ~30-character floor; a rule for compact
only would depend on the class name, which Widths forbids.

## Options

- **never folds**: the cell stays in view like waiting; when the column is
  short, its text is cut with an ellipsis ("cell in defin…"), the whole words
  in the hover and the accessible name. G19 stands; the builder changes one
  fold rank. One more build round, small.
- **folds last**: as built; G19 and FR-20 are amended to say the cell folds
  after problems, now and live. Re-review only.

## Recommendation

Aglaea's, and now the FSE's: folds last. The FSE first recommended never
folds; the build showed it cannot fit at the minimum window, and the cell
already reaches you as a Needs me row.

## Ruling

pablo, 2026-10-03, in the FSE session on lodestar: "al recommendation accepted. Go on"

## Consequences

Folds last: the FSE amends FR-20 and G19 in `docs/specs/responsive-home.md`;
the builder puts back `FOLD.cell` (lib/width.ts), and the card goes back to
review. Never folds: the card needs another way into 145 px, and the design
system's Widths changes back.
