---
title: Accept review-map v2 - the Review view, a worklist opened from the card
status: ruled
raised: 2026-10-17
raised_by: fse
owner: pablo
options: ["accept as written", "accept with amendments", "send back"]
cards: [rv-data, rv-list, rv-symbol]
forecast: 90-180m
stage: review-map
supersedes: []
superseded_by:
ruled: 2026-10-17
ruled_by: pablo
chosen: accept as written
---

## Question

The Review view in Deltagos (`docs/specs/review-map.md`, "v2"), from
Aglaea's design `docs/ux/specs/review-view.md`. Her main call: a list to
work through, not a graph (the real c8e1773 map is 75 nodes and 91 edges
for a 6-file change). So no React Flow, ELK or Monaco.

- On a card's back, `Review the change` opens its own screen: the changed
  symbols grouped by package, `Must visit` first (the undeclared ones),
  `Reviewed 3 of 8`, and `N` for the next one.
- One symbol shows its own diff, its flags in words (`no direct test`,
  `not in the card's declared changes`), its tests, who calls it and what
  it calls, and the builder's claim apart from the facts.
- You mark it Reviewed, Question or Blocked with a note. Marks stay in
  Deltagos's data dir, and survive a remap when the code did not change.
  Asking the supervisor from a Question is v3.
- A merged card is reviewable too: its branch is gone, so the organizer
  finds its `merge: <slug>` commit.

Three cards, one after the other: the Go reads and marks, then the screen
and list, then the symbol panel. Two get a UI review. No gate row drives
your screen or keyboard, starts a real agent, or writes your clipboard.

forecast: 90-180 min over 3 waves (sequential); basis: dg-render plus
dg-reader (62 min, two cards, one new screen, this initiative), review-map
v1 (42 min, two Go cards); this is three cards and the largest screen yet.

## Options

- **"accept as written"**
- **"accept with amendments"**: name them.
- **"send back"**: say what is wrong.

## Recommendation

The FSE: **"accept as written"**.

## Consequences

On accept: the FSE gives the three cards to one supervisor, in order.

## Ruling

pablo, 2026-10-17, in the organizer on lodestar: go
