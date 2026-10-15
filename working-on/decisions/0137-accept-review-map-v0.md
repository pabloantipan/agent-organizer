---
title: Review tooling - a new stage, and its first card (organizer review, v0)
status: ruled
raised: 2026-10-15
raised_by: fse
owner: pablo
options: ["stage and v0 as written", "v0 only, no stage yet", "send back"]
cards: [rm-v0]
forecast: 45-90m
threads: [01M50YGJWFTYPRFJ59WSKRBWSP]
supersedes: []
superseded_by:
ruled: 2026-10-15
ruled_by: pablo
chosen: stage and v0 as written
---

## Question

You gave the review tooling to the organizer FSE today (Hephaistos session,
"do"). The spec is `docs/specs/review-map.md`; the aim is that on odyssey you
can walk an agent branch of any initiative, mark what you looked at, and ask
the builder's supervisor from where you saw it. Four steps, one at a time:

- **v0 (this card, `rm-v0`)**: `organizer review <initiative> <card or
  merge>` writes the Go change as `revmap.json`: which functions and types
  changed, who calls them and what they call (one step out), and which tests
  reach each. No screen yet.
- v1: the frontend's TypeScript too, and the builder's declared changes
  checked against what changed (with Hephaistos's `change-check`).
- v2: the Review view in Deltagos (the graph, a diff per symbol, reviewed /
  questioned / blocked), after Aglaea designs it.
- v3: a question you mark reaches the card's supervisor as a thread.

Two things to rule:

1. **A roadmap stage for it.** Proposed: stage `review-map`, "Pablo reviews
   an agent branch from Deltagos", building, exit: on odyssey you open a
   real agent branch of another initiative, reach every changed symbol, and
   a question you mark reaches its supervisor. Placed after
   `decisions-owned-and-used`, but its cards may run now (they share no
   files with it).
2. **v0's one technical choice is left to the builder, by measurement**:
   the codebase-memory index first (as Hephaistos's list says), against
   `scip-go` and Go's own type checker, judged on two real merges and on
   what odyssey would need installed. You read no diffs, so the gate checks
   the output against hand lists, not code.

forecast: 45-90 min over 1 wave; basis: no review-tooling task yet; the
nearest are this initiative's new-package Go cards (lf30-launch-go, usage
ledger), plus the index comparison inside the card.

## Options

- **"stage and v0 as written"**
- **"v0 only, no stage yet"**: card it, decide the stage after v0 shows
  what it is.
- **"send back"**: say what is wrong.

## Recommendation

The FSE: **"stage and v0 as written"**.

## Ruling

pablo, 2026-10-15, in the organizer on lodestar: FSE review please, take into consideration what we're current doing and let's work out the stuff

## Consequences

On the first option: `review-map` added to `roadmap.yaml` after
`decisions-owned-and-used`; the FSE spawns a supervisor for `rm-v0` once
sup73's wave ends (memory, and one wave at a time on this Mac's lease).
