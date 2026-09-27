---
title: What "executing" counts on Home
status: ruled
raised: 2026-09-27
raised_by: fse
owner: pablo
ruled: 2026-09-27
ruled_by: pablo
options: [a working agent or a running wave, any live agent on a card]
chosen: any live agent on a card
cards: []
threads: []
supersedes: []
superseded_by:
stage: twenty-at-a-glance
---

## Question

The accepted spec's A3 (`docs/specs/twenty-at-a-glance.md`, 0033) says
"executing" means a wave is running or an agent is working on a card. As
built, it counts any live agent on a card, including one that is idle
(review of `done/glance-home-state.md`, finding 3: the fixture's stand-in
agents are `running`, never `working`). Which does the lead want to see?

## Options

- **a working agent or a running wave**, as A3 says: an idle session parked
  on a card does not make its initiative executing. One change in
  `lib/initiativeState.ts`, and the fixture needs a working stand-in.
- **any live agent on a card**, as built: an initiative with a session
  open on a card reads as executing even while it waits. The spec is
  amended to match.

## Recommendation

The FSE's: any live agent on a card, as built. Builders sit idle between
turns and while they wait on a reply. "Working" flickers every ten seconds
(CPU over the sample), so Home would blink between executing and quiet
mid-wave. A live session on a card is what the lead means by "someone is on
it".

## Ruling

Pablo, 2026-09-27, in the FSE's session (organizer-probe-fse): "recomention
for 0035 accepted".

## Consequences

As built: the FSE amends A3 in the spec. As A3: the FSE cuts one card.
