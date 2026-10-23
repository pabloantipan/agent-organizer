---
title: Accept leftovers 47 - the review header follows the newest re-read, and no save of nothing
status: proposed
raised: 2026-10-23
raised_by: fse
owner: pablo
options: ["accept as written", "accept with amendments", "send back"]
cards: [lf47-review-moved]
forecast: 20-45m
stage: review-map
supersedes: []
superseded_by:
ruled:
ruled_by:
chosen:
---

## Question

Leftovers 47 (`docs/specs/leftovers-47.md`) builds Aglaea's review-view
Amendment 11 (2715032), from rw-ui's UI review of lf46-review-words. One
frontend card, UI review on.

- **UW1**: if the branch moves while the Review screen is open, the header
  keeps the old map's header with no moved line; only the editor line
  re-reads. After this, any re-read that answers for another map head puts
  `The branch moved since this map (<shown> → <new>).` and `Make it again`
  in the header, in place, said once to a screen reader.
- **UW2**: a marked, unedited symbol still draws `Reviewed` / `Reviewed,
  next`, which saves the same mark again. After this it draws no primary
  until the mark or note changes; N in the header is the way on.

## Options

- **accept as written**: one card, one wave.
- **accept with amendments**: say which.
- **send back**: keep today's behaviour.

## Recommendation

accept as written. Both are Aglaea's rulings on her own spec; the card
touches only the review screen's three files.

## Forecast

forecast: 20-45m over 1 wave, plus the UI review; basis: 2 tasks, this
initiative (leftovers 46: two cards, one of them a frontend card on these
same files with UI review, handed over 10:47 and both merged 11:10, 23 min;
leftovers 45: one card, 14 min).
