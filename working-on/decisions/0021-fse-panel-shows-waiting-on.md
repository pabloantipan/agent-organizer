---
title: What the FSE panel on Overview shows beyond a feed
status: ruled
raised: 2026-09-26
raised_by: fse
owner: pablo
ruled: 2026-09-27
ruled_by: pablo
options: [feed only, feed and what the FSE waits on, feed and hand-off only]
chosen: feed and what the FSE waits on
cards: []
threads: [01M3G3SE8B4QAK39G6JY2W8ZH8]
supersedes: []
superseded_by:
stage:
---

## Question

The mockup page's Q4 (O5): the FSE panel shows the hand-off and a feed of
recent actions. Should it also show what the FSE is waiting on from Pablo?

## Options

- **feed only**: recent actions from `Committed-by: FSE` commits and the
  FSE's threads. Cheapest; Pablo has to infer what is his.
- **feed and what the FSE waits on**: plus a short list of the FSE's
  `proposed` records owned by Pablo and its open questions to him (threads it
  opened with no reply from him). Every item is derived from records and
  threads the organizer already reads (`scan.readDecisions`, the agents
  feed); nothing new is stored. It overlaps Needs me, on purpose: Needs me is
  across initiatives, this is one seat's view.
- **feed and hand-off only**: the hand-off paragraph from the bitácora
  already says what is open, as prose; no list.

## Recommendation

The FSE's: feed and what the FSE waits on, capped at five items, each
linking to its row in Needs me. The hand-off prose goes stale between wakes;
the list cannot, because it is derived.

## Ruling

Pablo, 2026-09-27, in the UI review session, choosing among the options as laid out there: "Feed + waits on": up to five items, the FSE's proposed records he owns and its unanswered questions to him, each linking to its Needs me row, derived and never stored. The panel header carries the count ("waiting on you: N") so it shows when the list is collapsed.


## Consequences

The redesign spec's Overview requirement for the FSE panel cites this record;
until it is ruled that requirement is `[NEEDS CLARIFICATION]`.
