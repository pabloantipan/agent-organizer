---
title: Accept leftovers 75 - stop the fixture's stand-in agents before their dir goes
status: ruled
raised: 2026-11-08
raised_by: fse
owner: pablo
options: ["accept as written", "send back"]
cards: [lf75-fixture-stop]
forecast: 30-60m
supersedes: []
superseded_by:
ruled: 2026-11-08
ruled_by: pablo (autonomous mode)
chosen: accept as written
---

## Question

The fixture launcher's stand-in agents keep running after reviewers remove
the fixture's tmp dir (four sightings; 24 still running today). Hephaistos
is adding `safe-kill --pidfile` on the factory side and asked for the
organizer's half: `scripts/fixture-home.sh stop <dir>`. Leftovers 75
(`docs/specs/leftovers-75.md`), one small scripts card with no UI. It
launches only once safe-kill `--pidfile` is merged.

## Options

- **accept as written**: one card, launched once the factory card lands.
- **send back**.

## Recommendation

accept as written.

## Forecast

forecast: 30-60m over 1 wave, plus the wait on the factory card; basis: lf65 (review guard, 20 min) and lf72-lf73 (about 40 min), this initiative.

## Ruling

pablo (autonomous mode), 2026-11-08 02:22: the recommendation taken after
five minutes without an answer. Asked at 02:17 in the mailbox ("0188:
accept leftovers 75, fixture-home.sh stop?", options accept as written or
send back); recommended "accept as written". Not sensitive: the
organizer's own record, scripts only. No supervisor yet: the card waits on
safe-kill --pidfile and the memory outage.
