---
title: "An agent joins the card its seat names when its folder matches two"
status: ruled
raised: 2026-09-26
raised_by: sup2
owner: pablo
ruled: 2026-09-27
ruled_by: pablo
options: [seat wins, none]
chosen: seat wins
cards: []
threads: []
supersedes: []
superseded_by:
stage:
---

## Question

sup2, closing redesign wave 1: FR-7 says an agent that answers to two cards joins none; as built the join is per key, so an agent whose folder matches two cards but whose seat matches one joins the seat's card. Keep it?

## Options

- **seat wins**: an explicit `seat:` assignment beats an ambiguous folder or branch match.
- **none**: any ambiguity joins nothing, as the spec says.

## Recommendation

The blacksmith's: seat wins.

## Ruling

Pablo, 2026-09-27, in the blacksmith session: "Seat wins (Rec.)".

## Consequences

The FSE amends FR-7 to: ambiguity by place or branch joins none, unless exactly one of those cards names the agent's seat.
