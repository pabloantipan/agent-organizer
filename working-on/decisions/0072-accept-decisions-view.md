---
title: Accept the Decisions view redesign and launch its card after header-fold-2 and time-zoom
status: ruled
raised: 2026-10-03
raised_by: fse
owner: pablo
ruled: 2026-10-03
ruled_by: pablo
options: [accept as written, accept with amendments, send back]
chosen: accept as written
cards: [decisions-view]
threads: [01M417NHHRR2WP7XPY69XM438N]
supersedes: []
superseded_by:
---

## Question

Your ask (2026-10-03): collapse Timeline, Waiting and Ruled; scrolling is a
pain; the number tiles and the median in days make no sense; headings need
an upgrade; the operator spends most of his time here. Aglaea reviewed it
(`docs/ux/reviews/2026-10-03-decisions-view.md`: every record listed twice,
~6,500 px; tiles answer nothing, the median reads 0d forever; no way to find
an old ruling) and designed `docs/ux/specs/decisions-view.md` (9386d15):

- a find field over every section (number, or words in title, chosen, body);
- one summary line of words in place of the tiles, e.g. "3 to rule, the
  oldest for 5 days (0007) · 12 ruled this week"; the median dropped;
- To rule, Ruled and Timeline as 16 px sticky disclosure headings, their
  open state remembered on this machine; Timeline moves last, starts closed,
  rows on one line; Ruled shows the newest ten plus "Show the other N";
- a landing opens whatever hides its record; the developer line at the top
  goes (its words belong in Help).

Her one question for you (O1): are these the jobs that keep you here — rule
what waits, check what you just ruled, find an old ruling, see the pace? If
there is another, say it as an amendment.

One card, `decisions-view`, gate B1-B11 plus tests, with a UI reviewer, after
header-fold-2 and time-zoom (same file).

forecast: 40-80 min of wave time over 1 wave (one card, UI reviewer
included), after time-zoom's wave, plus this decision (median 0 d); basis:
5 single-wave UI tasks, this initiative (25, 34, 41, 47, ~80 min).

## Options

- **accept as written** (the four jobs are right)
- **accept with amendments**: name them, or the missing job.
- **send back**: say what is wrong.

## Recommendation

The FSE's: accept as written.

## Ruling

pablo, 2026-10-03, in the FSE session on lodestar: "I accept recommendations go on"

## Consequences

On acceptance: the FSE starts one supervisor for `decisions-view` once
header-fold-2 and time-zoom are in `done/`.
