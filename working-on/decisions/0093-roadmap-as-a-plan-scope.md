---
title: The Roadmap reads like a project plan - scope
status: ruled
raised: 2026-10-06
raised_by: fse
owner: pablo
ruled: 2026-10-06
ruled_by: pablo
options: [what an iteration is, levels of detail, work outside any stage, who designs first]
chosen: an iteration is a build/review round in a wave; four levels of detail; a new stage for the work outside any stage (0094); Aglaea designs, then the FSE specs
cards: []
threads: []
supersedes: []
superseded_by:
---

## Question

Pablo, 2026-10-06, in the FSE session on lodestar, of the Roadmap
sub-view's stage list: "I see the road map stage as a block of text. I'd
like to see this a bit more like Microsoft Project, with lines about waves,
iterations, and decisitions. It should allow to chose to show current view or
with progresively more data", then: "cards, waves, iterations, decisions".

## Ruling

pablo, 2026-10-06, in the FSE session on lodestar, answering the FSE's
form:

- What an iteration is: "A build/review round in a wave" (each round of a
  run record: built, reviewed pass or fail, rebuilt).
- Levels of detail: "4 steps": 1 the current stage only, 2 all stages with
  decisions as diamonds, 3 plus the waves under each stage, 4 plus the
  iterations and cards under each wave; it opens on 1.
- The ~23 cards since 2026-10-03 that join no stage: "Propose a new stage
  for them" (raised as 0094).
- Who shapes it first: "Aglaea, then I spec it".

## Consequences

Aglaea writes a design spec for the Roadmap's stage list as an outline over
the shared axis: stage rows, wave rows (one supervised task), iteration rows
(its rounds), card rows, decisions as diamonds at raised and ruled, and the
four-step switch, every state named. The FSE then turns it into cards and an
accept record with a forecast.

Technical note (FSE, not verified against the code): waves and their rounds
live today only as prose in `runs/*.md`; the view needs them as data (start,
end, result per round, cards, supervisor). How run records carry that is a
supervise-skill change, so it goes to Hephaistos before the build spec.
