---
title: Is this the cell for the first stage?
status: proposed
raised: 2026-09-28
raised_by: draft
owner: pablo
ruled:
ruled_by:
options: [accept, accept with edits, redraft]
chosen:
cards: []
threads: []
supersedes: []
superseded_by:
---

## Question

Is this the cell for the first stage? The drafting session read the goal
("a drafted roster waits on its accept record before anything launches")
and `agents/people.md`, and drafted two seats for the drafted-fixture
cell. Nothing launches until this record is ruled. (Fixture: the accept
record a draft cell waits on, shaped like the persona-agents skill's
`references/drafting.md` §5; discovery-in-a-cell G4 iii, ui-leftovers
FR-12 V2.)

### Seats drafted

- **po_rosa**, the product owner and the cell's reconciler: the goal is an
  outcome someone has to hold the cell to, and people.md names no one on
  the product side besides pablo.
- **tech_lead_tomas**, the technical lead: the goal names a launch that
  has to be refused until a ruling, which is a behaviour someone has to
  own end to end.

### Considered, not drafted

- **a designer**: the goal names no screen and people.md names no user
  besides pablo; add one when a stage builds UI.
- **a developer seat**: builders come per wave from cards, not from the
  roster.

### Gaps the inputs left

- No `measure` in `initiative.yaml`: the cell cannot say when the goal is
  met.
- No base documents under `docs/`: the personas start from the goal alone.
- One witness only: people.md names pablo and no one else.

## Recommendation

The drafting session's: accept. Two seats are enough for a first stage
with no UI and no base documents; the gaps above are the owner's to fill
before the second stage, not reasons to redraft. If a designer is wanted
now, choose accept with edits and add the file by the persona-agents
skill before ruling.

## Options

- **accept**: the cell loses `draft`, and the crew is set up the usual way.
- **accept with edits**: the owner edits the files under `agents/`, then
  rules.
- **redraft**: say what to change; the drafting session reruns.

## Ruling

## Consequences

On accept, cell.json loses `draft` and gains `accepted` and `record`, each
persona file drops its draft line, and the crew is set up the usual way
(tokens, `bootstrap.sh`, `organizer crew`).
