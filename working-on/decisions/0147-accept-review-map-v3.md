---
title: Accept review-map v3 - ask the card's supervisor from a mark, with the review polish
status: proposed
raised: 2026-10-18
raised_by: fse
owner: pablo
options: ["accept as written", "accept with amendments", "send back"]
cards: [rv-ask-data, rv-polish, rv-ask-ui]
forecast: 70-140m
stage: review-map
supersedes: []
superseded_by:
ruled:
ruled_by:
chosen:
---

## Question

Review-map v3 and the review polish (`docs/specs/review-map.md`, "v3"),
raised together for one ruling, as planned.

- **Ask** (stage exit 2): on a Question or Blocked mark, `Save` becomes
  `Ask <seat>`. The seat is the supervisor named in the card's `next` when
  it is in discuss, else the initiative's FSE, else its reconciler. Pressing
  it saves the mark and opens one thread to that seat, as you, with the
  note, the file and lines, and `Next action: <seat> answers in this
  thread`. The mark keeps the thread. The panel then reads `Asked <seat> ·
  Open the thread`. `organizer review <i> <card> --marks` prints the
  coverage for the card.
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
your screen, starts a seat or writes your clipboard. The words of the Ask
states are mine; Aglaea may amend them before the UI card launches.

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
