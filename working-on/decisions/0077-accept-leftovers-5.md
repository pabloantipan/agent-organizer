---
title: Accept the leftovers-5 batch and launch its two cards after markdown-and-labels
status: proposed
raised: 2026-10-03
raised_by: fse
owner: pablo
ruled:
ruled_by:
options: [accept as written, accept with amendments, send back]
chosen:
cards: [rule-box-and-stages, home-signals-5]
threads: [01M41YCPTBFVQDFS9CQW76DQ14]
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

Both run in parallel after markdown-and-labels. One change of process, from
0076's cost (3 h 18 min of a 4 h 39 min wave): the supervisor sends a review
fail that is a design question to Aglaea before the builder.

forecast: 40-80 min of wave time over 1 wave, after markdown-and-labels,
plus this decision (median 0 d); basis: 10 single-wave UI tasks, this
initiative (21 to ~80 min working; home-widths-4's 4 h 39 min wall was a
decision wait, not build).

## Options

- **accept as written**
- **accept with amendments**: name them.
- **send back**: say what is wrong.

## Recommendation

The FSE's: accept as written.

## Ruling

## Consequences

On acceptance: the FSE starts one supervisor for both cards once
markdown-and-labels is in `done/`.
