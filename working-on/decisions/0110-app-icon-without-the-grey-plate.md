---
title: The app icon in Apple's new format, so macOS 26 drops the grey plate - scope and accept
status: ruled
raised: 2026-10-09
raised_by: fse
owner: pablo
ruled: 2026-10-09
ruled_by: pablo
options: ["accept as written", "accept with amendments", "send back"]
chosen: accept as written
cards: [app-icon-composer]
threads: []
supersedes: []
superseded_by:
---

## Question

One record for a small UI ask (0108). The Deltagos mark shipped as an
old-style `.icns`, and macOS 26 draws such icons on a light-grey plate in
Finder's small sizes (16 and 32 pt: list view and sidebar; the Dock at 128 pt
and up is clean). dm-ui's review recorded it (5523e32).

Aglaea exported the mark in Apple's new Icon Composer format
(`Deltagos.icon`, floating-icon Amendment 6, f9ee762) and proved it on this
Mac: no plate at 16, 32, 128 or 512 pt.

One trade-off: the new format has one drawing for every size, so the special
16 px cut (the D alone) goes away on macOS 26; at 16 px the gears blur but it
reads as the mark. macOS 12 to 15 keep today's icon with its cuts.

One card, `app-icon-composer`: compile the `.icon` into the bundle beside the
existing `.icns`. Its gate renders the icon through IconServices (no screen
driven) and checks the old icon is kept for macOS 12-15.

forecast: 40-90 min over 1 wave; plus this decision; basis: this
initiative's single-card tasks today (deltagos-mark built in 14 min,
reviews ~30 min).

## Options

- **"accept as written"**
- **"accept with amendments"**: name them.
- **"send back"**: say what is wrong (for example, keep the plate rather than
  lose the 16 px cut).

## Recommendation

The FSE's: accept as written.

## Ruling

pablo, 2026-10-09, in the organizer on lodestar: do as recomended (in the FSE session on lodestar, answering 0109 and 0110 together)
