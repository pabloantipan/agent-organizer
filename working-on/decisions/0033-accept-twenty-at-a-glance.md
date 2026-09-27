---
title: Accept the twenty-at-a-glance spec, and launch it
status: proposed
raised: 2026-09-27
raised_by: fse
owner: pablo
ruled:
ruled_by:
options: [accept as written, accept with amendments, send back]
chosen:
cards: [glance-scope-phase, glance-header-phase, glance-home-state]
threads: []
supersedes: []
superseded_by:
stage: twenty-at-a-glance
---

## Question

Is `docs/specs/twenty-at-a-glance.md` (proposed) the spec for roadmap stage 2
(0032)? It has 7 requirements, a 10-row gate that ends with a timed reading
of Home by someone who did not build it, and 3 cards in one wave. Once it is
accepted, the FSE spawns sup5 for the wave and lets go.

## Options

- **accept as written**
- **accept with amendments**: name them.
- **send back**: say what is wrong.

## Recommendation

The FSE's: accept as written. What to look at first, because each is a
choice you have not ruled:
- **The four states and their order (FR-6, A2).** Waits on you, then
  executing, then waits on business, then quiet. The first that applies
  wins.
- **Who the lead is (A1).** The cell's human, else "pablo". Identity
  replaces this at stage 6.
- **"Executing" (A3).** A running wave or a working agent. `now` cards
  that nobody is on do not count.

## Ruling



## Consequences

On acceptance:
- The spec goes to ruled.
- The FSE writes sup5's prompt and identity prelude, adds its token, and
  starts it.
- It notes sup5 on the three cards, commits, and lets go.
