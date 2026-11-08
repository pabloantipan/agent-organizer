---
title: Accept leftovers 77 - the no-client group is the app's, by key, not by name
status: ruled
raised: 2026-11-08
raised_by: fse
owner: pablo
options: ["accept as written", "send back"]
cards: [lf77-no-client]
forecast: 45-90m
supersedes: []
superseded_by:
ruled: 2026-11-08
ruled_by: pablo (autonomous mode)
supervisor: organizer-probe-sup119
chosen: accept as written
---

## Question

sup118 found that the seeded rail group is told only by its name, so a
client called "other" or "Other" collides with it, and its rename field
shows the raw name. Aglaea ruled it (run-report Amendment 11, 5958a02):
the seed reads "No client" and is keyed by a reserved id. Leftovers 77
(`docs/specs/leftovers-77.md`) adds an optional `seed` field to the stored
group (it rides the synced order document), reads old seeds once by their
members, fixes the rename field, and swaps a script's kill for the
fixture's stop. One card with a UI review.

## Options

- **accept as written**: one card.
- **send back**.

## Recommendation

accept as written. A new optional field in the order document is read as
absent by an older Deltagos on another machine, which keeps showing the
group by its name.

## Forecast

forecast: 45-90m over 1 wave; basis: lf74 (about 25 min, frontend only) plus a Go model field and its wails regen, this initiative.

## Ruling

pablo (autonomous mode), 2026-11-08 05:17: the recommendation taken after
five minutes without an answer. Asked at 05:12 in the mailbox ("0190:
accept leftovers 77, the No client group?", options accept as written or
send back); recommended "accept as written". Not sensitive: the
organizer's own record; the new field is local app state, synced only
under auth: firebase, which is off.
