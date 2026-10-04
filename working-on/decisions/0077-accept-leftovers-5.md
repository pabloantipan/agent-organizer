---
title: Accept the leftovers-5 and leftovers-6 batches and the review build, and launch their cards
status: ruled
raised: 2026-10-03
raised_by: fse
owner: pablo
ruled: 2026-10-04
ruled_by: pablo
options: [accept as written, accept with amendments, send back]
chosen: accept as written
cards: [rule-box-and-stages, home-signals-5, timeline-and-find-6, review-build]
threads: [01M41YCPTBFVQDFS9CQW76DQ14, 01M4234H29HX9P9J0WJFQYYA9F]
supersedes: []
superseded_by:
---

## Question

Aglaea ranked sup28's findings (`docs/ux/reviews/2026-10-03-rank-leftovers-5.md`,
31f7ac9): 15 rows and 6 gate and code rows, all severity 2 or 1, none needing
your word on design. The build spec is `docs/specs/leftovers-5.md`:

- **rule-box-and-stages** (M1-M3): Escape closes only the top box (today one
  Escape closes Help and the rule box under it); a rule box never covers its
  own Rule; hover keeps the selected mark; a stage landing shows its detail;
  a duplicate stage id says "Cards can't be joined: two stages are named …".
- **home-signals-5** (M4-M7): first, the whole window no longer scrolls in
  the real app (a wheel past Home's end moves the top bar away and costs
  15 px everywhere); then waiting and blocked keep their whole noun ("5
  waiting") or fold after live, now, problems and the cell; the scroll edge
  visible; three buttons named; Home's dates as `30 Nov`, never wrapped.

**Added before your ruling, leftovers-6** (Aglaea's
`rank-leftovers-6.md`, b582a27; build spec `docs/specs/leftovers-6.md`):
sup29's and sup30's findings, none needing your word on design.

- Two rows join the cards above (amendment 1 of leftovers-5): a Stages bar's
  text sits after a short bar instead of cut inside, with a fixture record
  that makes the tall-rule-box row reachable; a code block that scrolls shows
  its edge.
- **timeline-and-find-6** (N1-N6), after rule-box-and-stages: at Days the
  axis says `today · Sat 3`; after a ruling, focus goes to the next waiting
  record; "Show the other N" lands on the first revealed record; a third
  colliding title adds a row, then "+N"; ticks 12 px apart; the today line
  under title text; a find stores nothing and says how many hidden records
  matched; a committed fixture with 70+ records.
- **review-build** (N7): `make review-build` makes `Deltagos Review.app`
  under its own bundle id, so reviewers stop writing into your installed
  app's remembered layout. Third time it happened (hw4-ui, zdp-ui,
  mal-build); reminders did not hold. Two copies of your earlier layout wait
  in `.wt-notes/`.

Both run in parallel after markdown-and-labels. One change of process, from
0076's cost (3 h 18 min of a 4 h 39 min wave): the supervisor sends a review
fail that is a design question to Aglaea before the builder.

forecast: 40-80 min of wave time per wave over 2 waves (rule-box-and-stages,
home-signals-5 and review-build; then timeline-and-find-6), plus this
decision (median 0 d); basis: 10 single-wave UI tasks, this
initiative (21 to ~80 min working; home-widths-4's 4 h 39 min wall was a
decision wait, not build).

## Options

- **accept as written**
- **accept with amendments**: name them.
- **send back**: say what is wrong.

## Recommendation

The FSE's: accept as written.

## Ruling

pablo, 2026-10-04, in the FSE session on lodestar, answering the FSE's "I recommend accepting 0077 as written": "go"

## Consequences

On acceptance: the FSE starts one supervisor for rule-box-and-stages,
home-signals-5 and review-build at once (markdown-and-labels is in `done/`),
and one for timeline-and-find-6 after rule-box-and-stages lands.
