---
title: Time zoom shows Hours only where a mark has a time; the scan reads commit times
status: ruled
raised: 2026-10-03
raised_by: fse
owner: pablo
ruled: 2026-10-03
ruled_by: pablo
options: [commit times in the same card, days only for now, hours over day-only data]
chosen: commit times in the same card
cards: []
threads: [01M416RZH3E5VPJC9D5H8PK73F]
supersedes: []
superseded_by:
---

## Question

Aglaea's design spec `docs/ux/specs/roadmap-time-zoom.md` (6569427) zooms
every Gantt-style graph (Roadmap Cards, Roadmap Stages, Decisions Timeline)
from Fit to Days to Hours. Every date those graphs draw is a whole day
(`internal/scan/git.go:142` reads commits with `%cs`; cards, records and
stages are YYYY-MM-DD), so Hours would show nothing about hours (O1). And
Pablo's "the same feature but has no sense" needed reading (O3).

## Options

- **commit times in the same card**: the scan reads commit times (`%cI`);
  Cards offers Hours, Stages and Decisions stop at Days.
- **days only for now**: Fit and Days; Hours when some data has a time.
- **hours over day-only data**: Hours everywhere, whole-day bands.

## Recommendation

Aglaea's and the FSE's: commit times in the same card.

## Ruling

pablo, 2026-10-03, in the FSE session on lodestar, on O1: "Agree". On O3:
"yes, it's correct, If we have only date and no timestamp, component shall
detect it and avoid showing hours."

## Consequences

The zoom card adds `internal/scan/git.go` (commit times) and `lib/dates.ts`
to its boundary; the component detects whether any mark has a time and
offers Hours only then (A12 as written). The design spec's acceptance is
not accepted by this record; that is the accept record with the card.
