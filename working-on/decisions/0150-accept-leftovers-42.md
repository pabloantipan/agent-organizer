---
title: Accept leftovers 42 - Open in editor at the symbol's line
status: proposed
raised: 2026-10-18
raised_by: fse
owner: pablo
options: ["accept as written", "accept with amendments", "send back"]
cards: [lf42-open-at-line]
forecast: 25-50m
stage: review-map
supersedes: []
superseded_by:
ruled:
ruled_by:
chosen:
---

## Question

Leftovers 42 (`docs/specs/leftovers-42.md`): the design's `Open in
editor` at the head line, held since rv-symbol because it needed a line and
a choice of checkout.

- **Which checkout**: the card's worktree when it is at the reviewed head,
  else the repo under the initiative root when it is, else none: the
  button is not drawn and the panel says `Not checked out here at <sha>.`
  No temporary checkout (it would open code you cannot commit from).
- **The line**: `code` and `cursor` get `-g file:line`; an `editor` with
  `{file}` and `{line}` is used as written; any other gets the file alone.
- One card after leftovers 41 (same files), one UI review. No row opens a
  real editor.

forecast: 25-50 min over 1 wave, plus no waits on you; basis: lf38, lf39
(26 and 34 min, one card each, this initiative).

## Options

- **"accept as written"**
- **"accept with amendments"**: name them (e.g. a temporary checkout when none holds the head).
- **"send back"**: say what is wrong.

## Recommendation

The FSE: **"accept as written"**.

## Consequences

On accept: sup83 runs it as wave 2 of its task, after leftovers 41 merges.

## Ruling
