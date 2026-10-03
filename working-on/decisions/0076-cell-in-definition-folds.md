---
title: home-widths-4 G19 - does "cell in definition" fold into "+N"?
status: proposed
raised: 2026-10-03
raised_by: fse
owner: pablo
ruled:
ruled_by:
options: [never folds, folds last]
chosen:
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

## Options

- **never folds**: the cell stays in view like waiting; when the column is
  short, its text is cut with an ellipsis ("cell in defin…"), the whole words
  in the hover and the accessible name. G19 stands; the builder changes one
  fold rank. One more build round, small.
- **folds last**: as built; G19 and FR-20 are amended to say the cell folds
  after problems, now and live. Re-review only.

## Recommendation

The FSE's: never folds. It is a Needs me row, so it waits on you, and the
rule you accepted in 0074 keeps those in view. A cut word with the full text
on hover is how waiting already behaves.

## Ruling

## Consequences

Never folds: `home-widths-4` goes back to its builder, G19 unchanged.
Folds last: the FSE amends FR-20 and G19 in `docs/specs/responsive-home.md`
and the card goes back to review; Aglaea adds the cell to Widths' list.
