---
title: Accept leftovers 43 - Open in editor's refusals, the definition line, Save only when it saves
status: proposed
raised: 2026-10-18
raised_by: fse
owner: pablo
options: ["accept as written", "accept with amendments", "send back"]
cards: [lf43-review-states]
forecast: 25-50m
stage: review-map
supersedes: []
superseded_by:
ruled:
ruled_by:
chosen:
---

## Question

Leftovers 43 (`docs/specs/leftovers-43.md`), from the last two UI reviews,
with Aglaea's words (review-view Amendments 7, 8). One card.

- When the reviewed commit is no longer checked out, `Open in editor`
  goes and the panel says `Not checked out here at <sha>.`; when only the
  editor failed (now caught: Deltagos waits up to 2 s for it), the button
  stays with `Editor didn't open: …`. No red, no `Error:`.
- The editor opens at the definition, not at its doc comment.
- Save shows only when there is something to save.
- The current sub-view tab is the page marker (`aria-current="page"`).

forecast: 25-50 min over 1 wave, plus no waits on you; basis: lf42 (37 min,
one card, the same files, this initiative).

## Options

- **"accept as written"**
- **"accept with amendments"**: name them.
- **"send back"**: say what is wrong.

## Recommendation

The FSE: **"accept as written"**.

## Consequences

On accept: one supervisor runs the card.

## Ruling
