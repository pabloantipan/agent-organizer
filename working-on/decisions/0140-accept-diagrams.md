---
title: Accept diagrams - records and specs show their change-on-the-map figure in Deltagos
status: ruled
raised: 2026-10-15
raised_by: fse
owner: pablo
options: ["accept as written", "accept with amendments", "send back"]
cards: [dg-render, dg-reader]
forecast: 60-110m
stage: review-map
threads: [01M510GR3VQKCZJVBHNMBSR200, 01M510M9NW8CZ1T3RPNVH2EP2H]
supersedes: []
superseded_by:
ruled: 2026-10-15
ruled_by: pablo
chosen: accept as written
---

## Question

You ruled that specs and records explain themselves with diagrams
(agent-slack, today). Aglaea designed how Deltagos shows them
(`docs/ux/specs/diagrams-in-app.md`); the spec is `docs/specs/diagrams.md`.
Two cards, in order:

- **dg-render**: a diagram in a record or a card back draws as a figure on
  the dark theme (no light panel; added lilac, changed amber, removed
  dashed and struck through, never red), with its source one click away and
  a line under it: `Added: … Changed: … Removed: …`. If it cannot draw, it
  shows the source and says why, never an empty box.
- **dg-reader**: a spec opens inside Deltagos, in a drawer on the right,
  with its headings as contents and "Change on the map" first, instead of
  opening your editor.

Two things to know:
- Drawing uses `mmdc` on the Mac. On lodestar it is installed; I asked
  Hephaistos whether odyssey has it, and for the dark style it needs. Until
  odyssey has it, a figure there shows its source and "mmdc not found".
- This is exit 3 of the review-map stage (0137).

No check drives your screen or keyboard, starts a real agent, or writes
your clipboard.

forecast: 60-110 min over 1 wave (two cards in sequence); basis: this
initiative's two-card frontend tasks (leftovers-30, 33 min; leftovers-29,
36 min) plus a new Go package and the reader drawer.

## Options

- **"accept as written"**
- **"accept with amendments"**: name them.
- **"send back"**: say what is wrong.

## Recommendation

The FSE: **"accept as written"**.

## Ruling

pablo, 2026-10-15, in the organizer on lodestar: ok

## Consequences

On accept: the FSE gives both cards to the next supervisor, in order.
