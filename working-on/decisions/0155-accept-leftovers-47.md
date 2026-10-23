---
title: Accept leftovers 47 - the review header follows the newest re-read, no save of nothing, a resumed seat's cost counted once, and a chat with someone outside the roster
status: ruled
raised: 2026-10-23
raised_by: fse
owner: pablo
options: ["accept as written", "accept with amendments", "send back"]
cards: [lf47-review-moved, lf47-runs-cost, lf47-others]
forecast: 25-50m
stage: review-map
supersedes: []
superseded_by:
ruled: 2026-10-23
ruled_by: pablo
chosen: accept as written
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
- **Runs cost** (Go, added from sup87's closing report): leftovers 46 made
  `organizer runs` sum each process's final cost, but the real archive
  shows the cost is cumulative across a resume, so a resumed seat is
  counted twice. My premise was marked not verified and was wrong. After
  this the fold uses the rule usage already has (usage-audit Amendment 1:
  split at a drop, sum each run's largest), the app's runs panel folds per
  conversation too, and the app's seat match reads the session's short
  name as `organizer runs` does.
- **Others** (frontend, Aglaea's Amendment 12, from sup87's finding 4): a
  review asked of a supervisor lands on Conversations with no current row,
  since People lists only the roster. After this People gets an `Others`
  group for names outside the roster with an open direct thread with you;
  the landing draws and selects the row at once.

## Options

- **accept as written**: three cards, no shared file, one wave.
- **accept with amendments**: say which.
- **send back**: keep today's behaviour.

## Recommendation

accept as written. UW1, UW2 and Others are Aglaea's rulings on her own spec; the
runs card applies a rule usage already carries and touches no usage file.

## Forecast

forecast: 25-50m over 1 wave, plus the two UI reviews; basis: 2 tasks, this
initiative (leftovers 46: two cards, one of them a frontend card on these
same files with UI review, handed over 10:47 and both merged 11:10, 23 min;
leftovers 45: one card, 14 min).

## Ruling

pablo, 2026-10-23, in the organizer on lodestar: ok
