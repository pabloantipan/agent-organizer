---
title: Home says "quiet" on a row that also says "1 blocked" or "1 waiting"
status: ruled
raised: 2026-09-29
raised_by: fse
owner: pablo
ruled: 2026-09-29
ruled_by: pablo
options: [keep as ruled, waiting says whose, a blocked card counts as business]
chosen: waiting says whose
cards: []
threads: [01M3PVTCBV0NSN9XZ8MBAFV5A7]
supersedes: []
superseded_by:
stage: twenty-at-a-glance
---

## Question

Aglaea's first look, F3 (severity 2, heuristic;
`docs/ux/reviews/2026-09-29-first-look.md`): on the `--twenty` fixture, Home
reads "quiet" on infra-costs, which also says "1 blocked" (on "Wait for the
finance export"), and on email-digest, which says "1 waiting" (a record the
FSE owns). "Quiet" reads as "nothing to look at", and the signals say
otherwise. The app does what twenty-at-a-glance FR-6 says (0034, 0035): the
state comes from Needs me rows, executing agents and records owned by
someone else, and cards were left out on purpose. Should the rule change?

## Options

- **keep as ruled**: no code. The state answers "who does it wait on", and
  neither row waits on you or on a business owner by that rule. Cost: the
  two words keep disagreeing on such rows.
- **waiting says whose**: the waiting signal names its owner ("1 waiting ·
  fse"), so the row explains itself; the four states stay. Cost: one signal's
  words in `Home.tsx`; a card in the next wave.
- **a blocked card counts as business**: a `blocked` card makes the state
  "business". Cost: `initiativeStates`; a blocked card is not always blocked
  on business (it may be on a repo, a deploy or the lead), so the word would
  sometimes lie the other way.

## Recommendation

The FSE's: waiting says whose. It removes the contradiction on the row
without changing a ruled state rule, and it is cheap. The blocked row stays
"quiet" because the rule never knew what a card waits on; that is a question
for when blocked cards name their owner.

## Ruling

pablo, 2026-09-29, in the organizer on lodestar: rules

## Consequences

On "waiting says whose": the FSE writes it as an FR of lead-side-fixes (or
the next spec, if that wave has launched) and cuts it into a card.
