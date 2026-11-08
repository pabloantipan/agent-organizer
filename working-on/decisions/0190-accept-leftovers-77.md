---
title: Accept leftovers 77 - the no-client group is the app's, by key, not by name
status: proposed
raised: 2026-11-08
raised_by: fse
owner: pablo
options: ["accept as written", "send back"]
cards: [lf77-no-client]
forecast: 45-90m
supersedes: []
superseded_by:
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
