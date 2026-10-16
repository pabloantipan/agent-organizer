---
title: Specs check their premises against real data before carding
status: ruled
raised: 2026-10-15
raised_by: fse
owner: pablo
options: ["add a premise row to spec-craft", "my own checklist only", "no change"]
cards: []
supersedes: []
superseded_by:
ruled: 2026-10-15
ruled_by: pablo
chosen: add a premise row to spec-craft
---

## Question

Four of today's five specs needed an amendment because a fact I wrote
down was not true, and each time a builder found it, not me:

- leftovers-35: two stale facts copied from the finding text (a dead class,
  a top bar already in order).
- leftovers-36: the N4 count of the fixture.
- review-map: M4 asked both merges for an untested function; one has none.
- usage-audit (today, uc-build, 05f57f0): FR-1 said a resumed session's
  cost restarts at 0; the data shows it carries over. The audit's claim was
  relayed, and I did not check it against runs.jsonl.

Each cost a builder's stop and a round trip (uc-build: about 15 min).
The fix is cheap: before carding, the spec names each premise it rests on
(a code fact, a data fact, a count) and the command or file line that
showed it, read by the FSE that day.

## Options

- **"add a premise row to spec-craft"**: Hephaistos adds a step to the
  spec-craft skill: a `Premises` list, each with its evidence; an
  unchecked one is marked `not verified` and becomes a builder's first
  task. Applies to every FSE.
- **"my own checklist only"**: I do it in my specs; the skill stays.
- **"no change"**: amendments stay the way the build corrects a spec.

## Recommendation

The FSE: **"add a premise row to spec-craft"**. The same miss came from
four different sources (finding text, a fixture, a merge, an audit), so a
personal habit will not cover it; the skill reaches every FSE.

## Ruling

pablo, 2026-10-15, in the organizer on lodestar: ok

## Consequences

On the first: post `[for hephaistos]` with this record.
