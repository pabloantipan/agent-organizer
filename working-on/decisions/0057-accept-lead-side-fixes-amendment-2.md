---
title: Accept amendment 2 of lead-side-fixes, the code Aglaea's design-system rewrite needs
status: ruled
raised: 2026-09-29
raised_by: fse
owner: pablo
ruled: 2026-09-29
ruled_by: pablo
options: [accept as written, accept with amendments, send back]
chosen: accept as written
cards: [conform-and-waiting]
threads: [01M3PWYY5MSHREKZ7M2CMCRZ2P]
supersedes: []
superseded_by:
stage: discovery-in-a-cell
---

## Question

Under 0054, Aglaea rewrote `docs/design-system.md` (7b6afd4):

- principle 3: the accent marks the action that commits, and a row verb in a
  list is a default button;
- a new "Disabled actions" section: a blocked action's reason is visible
  text tied with `aria-describedby`, never a hover alone.

Amendment 2 of `docs/specs/lead-side-fixes.md` is the code that follows:

- **FR-11:** the Needs me row verbs (Answer, Launch/Open, Rule) lose the
  accent, and the open Rule toggle in Conversations is marked without it.
- **FR-12:** visible reasons with `aria-describedby` on Draft the cell, Bring
  crew up, Conversations' + with no token, and Write about this card.

It rides one card, `conform-and-waiting`, with FR-10 (your 0056, waiting says
whose). The card runs after sup18's two cards, whose files it touches, and
has a UI reviewer.

forecast: 20–36 min of wave time over 1 wave, after sup18's wave, plus this
decision (median 0 d); basis: 25 cards in 12 single-wave tasks, this
initiative.

## Options

- **accept as written**
- **accept with amendments**: name them.
- **send back**: say what is wrong.

## Recommendation

The FSE's: accept as written. It makes one choice you have not ruled, which
Aglaea left to me: Write about this card is hidden where the initiative has
no cell (never here), and says "no seat to write to" where the cell has no
seats (blocked).

## Ruling

pablo, 2026-09-29, in the organizer on lodestar: Do

## Consequences

On acceptance: when sup18's two cards land, the FSE starts one supervisor for
conform-and-waiting.
