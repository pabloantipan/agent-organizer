---
title: Accept the leftovers-8 batch and launch its card
status: proposed
raised: 2026-10-04
raised_by: fse
owner: pablo
ruled:
ruled_by:
options: [accept as written, accept with amendments, send back]
chosen:
cards: [rule-words-and-dates]
threads: [01M43Z4MM70GV0TH1NAJC2D28A]
supersedes: []
superseded_by:
---

## Question

Aglaea ranked layers-focus-and-words' leftovers with her own A1-A3
(`docs/ux/reviews/2026-10-04-rank-leftovers-8.md`, 10bc67a), none needing
your word on design. She amended the design system's Principles: dates read
as words wherever you read them, and your words are kept verbatim (the real
app autocorrected "words" to "Words" in a ruling). The build spec is
`docs/specs/leftovers-8.md`, one card, `rule-words-and-dates` (Q1-Q7):

- a table in the rule box scrolls inside instead of crushing the box;
- while ruling, the record's facts line stays with the stuck head;
- autocorrect, capitalisation and spellcheck off wherever you type a ruling,
  a message or a comment; Escape on a correction bubble no longer closes the
  box;
- Home's list at 1512 with the rail as a strip stops ~200 px short in the
  real app: measured first, then fixed;
- dates in words in record meta, Timeline and Stages;
- the card back capped at the window, scrolling inside;
- `make test` passes from a fresh clone (today it fails until the frontend
  is built once).

forecast: 40-80 min of wave time over 1 wave, plus this decision (median
0 d); basis: 14 single-wave tasks, this initiative (4 to ~80 min working).

## Options

- **accept as written**
- **accept with amendments**: name them.
- **send back**: say what is wrong.

## Recommendation

The FSE's: accept as written.

## Ruling

## Consequences

On acceptance: the FSE starts one supervisor for rule-words-and-dates.
