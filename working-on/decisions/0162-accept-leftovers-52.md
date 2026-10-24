---
title: Accept leftovers 52 - every state mark on one layer, the Decisions line's last words, a trimmed chosen
status: proposed
raised: 2026-10-24
raised_by: fse
owner: pablo
options: ["accept as written", "accept with amendments", "send back"]
cards: [lf52-state-layer, lf52-decisions-line, lf52-chosen-trim]
forecast: 45-90m
supersedes: []
superseded_by:
ruled:
ruled_by:
chosen:
---

## Question

Leftovers 52 (`docs/specs/leftovers-52.md`), what leftovers 51 left:

- **lf52-state-layer** (styles, UI review), Aglaea's review-view Amendment
  17: every control with a current, selected or open mark paints it on one
  shared layer with no transition, so a mark never fades and hover fades
  on all of them; lf51's stop-gap of no transition at all goes. The test
  finds every marked control in every stylesheet by itself (sup92 found
  lf51's test read only one stylesheet), so none is missed again.
- **lf52-decisions-line** (frontend, UI review), Aglaea's rule-questions
  Amendment 2: the Ruled list shows answers whole when there is room, and
  an open record's line no longer reads its chosen twice to a screen
  reader. After lf52-state-layer, which shares one stylesheet.
- **lf52-chosen-trim** (Go): a ruling's chosen is written without stray
  spaces (sup91).

## Options

- **accept as written**: three cards, two waves (decisions-line after
  state-layer; chosen-trim alongside the first).
- **accept with amendments**: say which.
- **send back**.

## Recommendation

accept as written. The UI points are Aglaea's rulings; the gate checks every
marked control, the gap that cost leftovers 51 two review rounds.

## Forecast

forecast: 45-90m over 2 waves, plus two UI reviews and no lease data; basis:
6 tasks, this initiative (leftovers 46-51: 23, 83, 64, 33, 43 min, and
141 min for leftovers 51, 66 of them a usage-limit stop and the rest three
amendment rounds).
