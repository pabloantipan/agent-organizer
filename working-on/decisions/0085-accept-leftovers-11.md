---
title: Accept the leftovers-11 batch, with Needs me showing its oldest five, and launch its card
status: ruled
raised: 2026-10-04
raised_by: fse
owner: pablo
ruled: 2026-10-05
ruled_by: pablo
options: [accept as written, accept without the Needs me change, accept with amendments, send back]
chosen: accept as written
cards: [roles-and-needs-me-five, decisions-still]
threads: []
supersedes: []
superseded_by:
---

## Question

**One design change to your queue, which needs your yes:** with 14 Needs me
rows, the new Roles section starts below the fold on Home, so the glance it
was built for fails. Aglaea's call (transversal-roles Amendment 1, f3535e7):
at compact and regular widths Needs me shows its **oldest five** rows, then
one row `Show the other 9`, as Ruled does on Decisions. The badge and the
heading keep the total (`Needs me · 14`); wide is unchanged; what counts as
Needs me does not change.

The rest is roles-ui's small leftovers (`docs/specs/leftovers-11.md`, one
card `roles-and-needs-me-five`, V1-V5): following a role's mail line or an
initiative link puts focus on what it opened instead of the page; screen
reader names for role items and session rows; role rows line up at 1024.

Added before your ruling (Aglaea, from drafts-per-chat's review, sev 2): a
new thread started in the channel addresses everyone, not the first seat, and
shows how many seats it wakes beside Start; in a direct chat it addresses
that seat. Today the channel form defaults to one seat, which is the same
wrong-seat risk drafts-per-chat just fixed.

Added 2026-10-05, from your report ("this view 'vibrates' kinda rendering
doesn't work properly"): card `decisions-still` (`docs/specs/decisions-still.md`,
W1-W3). The builder measures what moves and why first, then makes Decisions
hold still with no input, at any scroll, with a record expanded, stuck and
with Rule open, in both engines, without removing the stuck head, the scroll
edges or the refresh. It shares no files with the other card, so both run
at once under one supervisor.

drafts-per-chat has landed, so both can start at once.

forecast: 40-80 min of wave time over 1 wave, plus
this decision (median 0 d); basis: 19 single-wave tasks, this initiative.

## Options

- **accept as written** (the oldest five, then "Show the other N")
- **accept without the Needs me change**: the card drops FR-1 and V1.
- **accept with amendments**: name them.
- **send back**: say what is wrong.

## Recommendation

The FSE's: accept as written.

## Ruling

pablo, 2026-10-05, in the organizer on lodestar: ok

## Consequences

On acceptance: the FSE starts one supervisor for roles-and-needs-me-five
and decisions-still, in parallel.
