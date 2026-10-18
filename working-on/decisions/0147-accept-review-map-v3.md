---
title: Accept review-map v3 - ask the card's supervisor from a mark, with the review polish
status: ruled
raised: 2026-10-18
raised_by: fse
owner: pablo
options: ["accept as written", "accept with amendments", "send back"]
cards: [rv-ask-data, rv-polish, rv-ask-ui]
forecast: 70-140m
stage: review-map
supersedes: []
superseded_by:
ruled: 2026-10-18
ruled_by: pablo by standing rule
chosen: accept as written
---

## Question

Review-map v3 and the review polish (`docs/specs/review-map.md`, "v3"),
raised together for one ruling, as planned.

- **Ask** (stage exit 2), with Aglaea's Amendment 3 (ad9450d) folded in:
  on a Question or Blocked mark the primary reads `Ask <seat>, next`
  (saves, asks, moves on); `Save` keeps it here. The seat is the
  supervisor named in the card's `next` when it is in discuss, else the
  initiative's FSE, else its reconciler; the line under it ends `Wakes
  <seat>.` One thread per review, `<slug>: review at <sha>`, posted as
  you; each ask is a message in it naming the symbol and lines, ending
  `Next action: <seat> answers in this thread`. An asked row draws `?
  asked`; `Open the thread` goes to Conversations, and `← Review` comes
  back. `organizer review <i> <card> --marks` prints the coverage.
- **Polish**, from Aglaea's Amendment 2 and the two UI reviews: `calls` /
  `called by` by direction; the primary reads `Save question, next` when
  Question is chosen and never overrides it; `none found`; the radio focus
  ring after an arrow key, in the panel and the rule box; mono links; the
  origin row stays current; flags wrap at the name; the fixture's second
  commit becomes a real edit.
- Held: `Open in editor` at a line (needs a choice of checkout), the
  fixture's missing claim and failing make, a "review waiting" Needs me row.

Three cards in two waves: the Go ask and the polish side by side, then the
Ask button. Two get a UI review. No gate row posts to a real seat, drives
your screen, starts a seat or writes your clipboard. The Ask states' words
are Aglaea's (Amendment 3).

forecast: 70-140 min over 2 waves, plus no waits on you; basis: review-map
v2 (112 min, three cards in three waves, this initiative) and rv-symbol's
polish rounds; one wave fewer here, and the largest card is smaller.

## Options

- **"accept as written"**
- **"accept with amendments"**: name them.
- **"send back"**: say what is wrong.

## Recommendation

The FSE: **"accept as written"**.

## Consequences

On accept: one supervisor runs rv-ask-data and rv-polish in parallel (they
share no file), then rv-ask-ui. Exit 2 is then met in code; your trial on
odyssey (exit 1) proves both.

## Ruling

pablo, 2026-10-18, in the organizer on lodestar: No answer in 5 min (raised 11:42, text changed 11:47 with Aglaea's Amendment 3); ruled as recommended under Pablo's standing rule, relayed by Hephaistos, lodestar, 2026-10-18 ~02:10: "Till October 18th 12:00am Chilean time, if I dont answer in 5mins, do as recommended and SAVE desition taken" (thread 01M56PWG).
