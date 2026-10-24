---
title: Accept leftovers 51 - one recipient list, the Chats head held still, hover both ways, the crew test unflaked
status: proposed
raised: 2026-10-24
raised_by: fse
owner: pablo
options: ["accept as written", "accept with amendments", "send back"]
cards: [lf51-composers, lf51-crew-flake]
forecast: 30-60m
stage: review-map
supersedes: []
superseded_by:
ruled:
ruled_by:
chosen:
---

## Question

Leftovers 51 (`docs/specs/leftovers-51.md`), two cards, one wave once
lf48-chat-landing merges:

- **lf51-composers** (frontend, UI review), Aglaea's review-view Amendment
  15 from l48-ui's UI review: the reply, rule and new-thread boxes list
  recipients from one function (roster, then Others); the Chats label and
  `+` stay outside the scrolling list; a click on a half-hidden row reveals
  it; hover eases in and out alike, and current or selected controls
  switch at once. The review fixture gets a stand-in token so the
  new-thread form opens without hand-made files.
- **lf51-crew-flake** (one Go test): TestAppCreateCrewReturnsAtOnce failed
  twice under swap (1.10 s, 1.16 s against 1 s). It keeps what it proves,
  that Bring crew up returns before the first seat finishes starting, with
  a stub of 6 s and a bound of 3 s.

## Options

- **accept as written**: two cards, one wave after lf48.
- **accept with amendments**: say which.
- **send back**.

## Recommendation

accept as written. The four UI points are Aglaea's rulings on her own spec;
the test is the second sighting of the same flake.

## Forecast

forecast: 30-60m over 1 wave after lf48 merges, plus the UI review and no
lease data; basis: 4 tasks, this initiative (leftovers 47-50: 83, 43 min,
lf48 and lf49 in flight past their tops on a review round each).
