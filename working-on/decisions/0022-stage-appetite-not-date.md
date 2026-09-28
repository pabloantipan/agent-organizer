---
title: A stage may carry an appetite in place of a date
status: ruled
raised: 2026-09-26
raised_by: fse
owner: pablo
ruled: 2026-09-27
ruled_by: pablo
options: [appetite allowed, a date required, neither]
chosen: appetite allowed
cards: []
threads: [01M3G3SE8B4QAK39G6JY2W8ZH8]
supersedes: []
superseded_by:
stage:
---

## Question

The mockup page's Q5 (R2): may a stage carry an appetite ("two waves", "a
week") where it has no real date? The working-on format already allows
`appetite` and an optional `target` per stage (working-on skill, Roadmap);
this record makes the organizer's drawing of it a ruling, not a default.

## Options

- **appetite allowed**: a stage with no `target` draws as a dashed bar sized
  by order only, labelled with its appetite; a `target` stays a real date.
  Matches the format and the roadmapping skill; the bar's length is not a
  promise.
- **a date required**: every stage has a `target`. Contradicts the skill's
  rule against invented dates; forces dates nobody committed to.
- **neither**: stages have no size at all; the Roadmap is an ordered list.
  Honest, but loses "how much is this worth", which is what stops a stage.

## Recommendation

The FSE's: appetite allowed. No objection to the format as written.

## Ruling

Pablo, 2026-09-27, in the UI review session, choosing among the options as laid out there: "Appetite allowed": a stage without a real date draws as a dashed bar labelled with its appetite; a real date stays a date; no date is ever computed from an appetite.


## Consequences

The redesign spec's Roadmap requirements draw appetite as text on a dashed
bar and never compute a date from it.
