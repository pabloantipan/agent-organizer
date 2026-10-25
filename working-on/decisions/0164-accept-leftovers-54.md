---
title: Accept leftovers 54 - retire never picks the FSE, CI reads the contracts, the record's rejected rows, decision states read once
status: proposed
raised: 2026-10-25
raised_by: fse
owner: pablo
options: ["accept as written", "accept with amendments", "send back"]
cards: [lf54-retire-guard, lf54-ci-contracts, lf54-usage-rejected, lf54-decision-states]
forecast: 60-120m
supersedes: []
superseded_by:
ruled:
ruled_by:
chosen:
---

## Question

Leftovers 54 (`docs/specs/leftovers-54.md`), four cards, no shared file:

- **lf54-retire-guard** (first): `organizer retire --retirable` planned to
  retire the FSE and kill its session (sup94, not run). After this it picks
  only seats a card named, never the FSE or a standing role.
- **lf54-ci-contracts**: your ruling of 2026-10-25, "as recommended": the
  release build checks out agent-mailbox-specs pinned and points the
  contract tests at it, so a tag build does not fail on them.
- **lf54-usage-rejected**: the record now answers 200 with the rows it
  refused (hestia). Deltagos reads them, stops resending them until they
  change, and shows them with their reason in `organizer usage`; empty
  times go as null.
- **lf54-decision-states** (UI review): "awaiting-cells" shows in Needs me
  and the header like a proposed record; "applied" and "acknowledged" count
  as ruled; `ruled_by` reads as a person plus a mode (your ruling 5 of
  2026-10-25), so "pablo by away mode" and its old variants show as pablo,
  away mode. One helper per side,
  so the literals stop drifting.

The last three wait for leftovers 53's PRs to be on origin/main.

## Options

- **accept as written**: four cards, one wave, merged through talos-lab PRs.
- **accept with amendments**: say which.
- **send back**.

## Recommendation

accept as written. The retire guard is a safety fix; the rest carries out
your 2026-10-25 rulings and what leftovers 53's reviews found.

## Forecast

forecast: 60-120m over 1 wave, plus the wait for leftovers 53's PRs, one UI
review and the test-lease queue (no lease data; leftovers 52 and 53 queued
6-11 deep); basis: 8 tasks, this initiative.
