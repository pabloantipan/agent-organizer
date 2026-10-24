---
title: Accept leftovers 48 - a landing shows its chat row, state fills do not ease, the picker reaches Others
status: ruled
raised: 2026-10-23
raised_by: fse
owner: pablo
options: ["accept as written", "accept with amendments", "send back"]
cards: [lf48-chat-landing]
forecast: 25-50m
stage: review-map
supersedes: []
superseded_by:
ruled: 2026-10-24
ruled_by: pablo
chosen: accept as written
---

## Question

Leftovers 48 (`docs/specs/leftovers-48.md`) builds Aglaea's review-view
Amendment 13 (9d65a97), from o47-ui's UI review of lf47-others. One card,
frontend plus the fixture, UI review on.

- **UO1**: at 1024x640 a landing on a chat under Others leaves its row
  below the list's edge. After this, any landing scrolls the current row
  into view, instantly.
- **UO2**: the current row's fill eases with every button, so in a window
  that is not redrawing it can stay on the old row. After this, state
  fills switch at once (now a design-system rule); hover still eases.
- **Picker**: you cannot start a chat with a name under Others. After
  this the new-thread picker lists them under an `Others` group.
- **Fixture**: the review fixture gets one open chat between you and
  `sup10`, so these rows run without hand-editing test data (o47-ui's
  spec gap).

## Options

- **accept as written**: one card, one wave.
- **accept with amendments**: say which.
- **send back**: keep today's behaviour.

## Recommendation

accept as written. The three behaviours are Aglaea's rulings on her own
spec; the fixture line removes a hand edit the last UI review needed.

## Forecast

forecast: 25-50m over 1 wave, plus the UI review; basis: 3 tasks, this
initiative (leftovers 45: 1 card, 14 min; leftovers 46: 2 cards, 23 min;
leftovers 47: 3 cards, past its 50 min top on the shared test queue).

## Ruling

pablo, 2026-10-24, in the organizer on lodestar: ok. As recommended
