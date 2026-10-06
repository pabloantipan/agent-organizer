---
title: Accept the Roadmap-as-a-plan spec and launch its two cards after usage
status: proposed
raised: 2026-10-06
raised_by: fse
owner: pablo
ruled:
ruled_by:
options: ["accept as written", "accept with amendments", "send back"]
chosen:
cards: [roadmap-waves-scan, roadmap-outline]
threads: []
supersedes: []
superseded_by:
---

## Question

Your ask (0093): the Roadmap like Microsoft Project, with waves, rounds,
cards and decisions, and a switch from the current stage to progressively
more.

Two cards, one after the other, after the usage task (they share files):

1. **roadmap-waves-scan**: the scan reads the `waves:` block Hephaistos
   added to run records (ruled by you today, 55b9524) and joins each wave to
   its stage through its cards.
2. **roadmap-outline**: Aglaea's design (`docs/ux/specs/roadmap-as-a-plan.md`):
   stage summary bars; wave bars from launch to merge; a Rounds row where a
   failed round is outlined and says why; cards under their wave; decisions
   as diamonds, hollow at raised, solid at ruled; a Detail switch: Current
   stage, All stages, + Waves, + Rounds and cards.

Run records before today have no waves block and draw as dots (no
backfill, Hephaistos's ruling); every task from now on fills it, so the
view fills as you work. The fixture proves it meanwhile.

Build spec `docs/specs/roadmap-as-a-plan.md`. Every gate row is a seat's
(0095).

forecast: 2-4 h of wave time over 2 waves, after the usage task (2-4 h);
plus this decision; basis: today's single-card tasks, 52-90 min each (run
records 2026-10-06), a scan reader plus a view counted as two.

## Options

- **accept as written**
- **accept with amendments**: name them.
- **send back**: say what is wrong.

## Recommendation

The FSE's: accept as written.

## Ruling
