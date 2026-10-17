---
title: Accept review-map v1 - TS, package level and declared changes in organizer review
status: proposed
raised: 2026-10-17
raised_by: fse
owner: pablo
options: ["accept as written", "accept with amendments", "send back"]
cards: [rm-v1-ts, rm-v1-reconcile]
forecast: 40-90m
stage: review-map
supersedes: []
superseded_by:
---

## Question

The next step of the review map (`docs/specs/review-map.md`, "v1"). Q1 is
answered by you through Hephaistos (thread 01M55TQT): odyssey is a clone of
lodestar, so `organizer review` runs in odyssey's clone of the pushed
branch, with no sync path.

Two Go cards, one after the other:

- `rm-v1-ts`: the frontend's TypeScript gets symbols, callers and tests
  like Go; every symbol sits under a package node; the `frontend/dist`
  embed error in every review goes (a placeholder in the export, never in
  the repo). The TS parser is picked by measurement, as rm-v0 picked go/types.
- `rm-v1-reconcile`: given a card, the map carries change-check's flags
  (undeclared, declared not changed, outside footprint) word for word, and
  adds none of its own.

No viewer yet (v2, needs Aglaea's design). No gate row drives your screen
or keyboard, starts a real agent, or writes your clipboard.

forecast: 40-90 min over 2 waves (sequential); basis: rm-v0 (18 min, one Go
card, this initiative) and Go leftovers 34-40 min each; the TS source
comparison is the unknown.

## Options

- **"accept as written"**
- **"accept with amendments"**: name them.
- **"send back"**: say what is wrong.

## Recommendation

The FSE: **"accept as written"**.

## Consequences

On accept: the FSE gives both cards to one supervisor, `rm-v1-ts` first.
