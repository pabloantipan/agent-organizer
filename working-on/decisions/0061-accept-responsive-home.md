---
title: Accept responsive Home (Aglaea's design and its build spec), and launch its card
status: ruled
raised: 2026-09-29
raised_by: fse
owner: pablo
ruled: 2026-09-29
ruled_by: pablo
options: [accept as written, accept with amendments, send back]
chosen: accept as written
cards: [responsive-home]
threads: [01M3QYJ7GKBX6H175TPJF6WPGM]
supersedes: []
superseded_by:
stage: twenty-at-a-glance
---

## Question

You asked for "kinda responsive" in 0059. Aglaea's design,
`docs/ux/specs/responsive-home.md`, has measurements and screenshots. It
gives Home, the rule box and the rail three widths:

- **compact, under 1280** (the laptop with a terminal beside it): the rail
  starts as the strip unless you chose otherwise, and every row takes one
  line. At least six initiatives show at 1024×640, where 2½ show today.
- **regular** (the 14-inch laptop at full screen): as today, with the rule
  box capped at the window.
- **wide, 1920 and up** (your ultrawide): Needs me becomes a right column,
  goals show whole, and you rule inside that column with all twenty
  initiatives in view.

The build spec, `docs/specs/responsive-home.md`, turns that into
requirements FR-1 to FR-6. FR-6 is your 0060: "1 waiting · you". Its gate is
the design's acceptance A1 to A8, which includes the glance timed at all
three sizes. One card, with a UI reviewer. It runs after ui-leftovers, which
touches the same files.

forecast: 35–55 min of wave time over 1 wave, after ui-leftovers, plus this
decision and 0062 (median 0 d); basis: 26 cards in 13 single-wave tasks,
this initiative, plus ~10 min for the UI reviewer. The high end is raised
because the gate needs screenshots at three sizes and a timed reader, as
twenty-at-a-glance's did.

## Options

- **accept as written**
- **accept with amendments**: name them.
- **send back**: say what is wrong.

## Recommendation

The FSE's: accept as written. The sub-views are left out on purpose (the
design, "Worth it?"). Where the wide layout sits on the screen is 0062.

## Ruling

pablo, 2026-09-29, in the organizer on lodestar: Go

## Consequences

On acceptance: when ui-leftovers lands, the FSE starts one supervisor for
responsive-home. Aglaea adds a "Widths" section to the design system.
