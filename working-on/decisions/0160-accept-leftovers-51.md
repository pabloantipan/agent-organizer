---
title: Accept leftovers 51 - one recipient list, the Chats head held still, hover both ways, the crew test unflaked, the rule box's words for question records
status: ruled
raised: 2026-10-24
raised_by: fse
owner: pablo
options: ["accept as written", "accept with amendments", "send back"]
cards: [lf51-composers, lf51-crew-flake, lf51-rule-words]
forecast: 30-60m
stage: review-map
supersedes: []
superseded_by:
ruled: 2026-10-24
ruled_by: pablo
chosen: accept as written
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
- **lf51-rule-words** (frontend, UI review), Aglaea's rule-questions
  Amendment 1 from l49-ui's UI review: an opened ruled record shows what
  was chosen, one full line per answer; the list cuts each answer, not the
  whole line; each question's group is named with its words; beside a
  disabled Rule the box says what is missing; the placeholder says "Why
  these answers" on a question record.

## Options

- **accept as written**: three cards, no shared file, one wave once lf49 merges (lf48 merged).
- **accept with amendments**: say which.
- **send back**.

## Recommendation

accept as written. The eight UI points are Aglaea's rulings on her own specs;
the test is the second sighting of the same flake.

## Forecast

forecast: 30-60m over 1 wave after lf48 merges, plus the UI review and no
lease data; basis: 4 tasks, this initiative (leftovers 47-50: 83, 43 min,
lf48 and lf49 in flight past their tops on a review round each).

## Ruling

pablo, 2026-10-24, in the organizer on lodestar: as recommended
