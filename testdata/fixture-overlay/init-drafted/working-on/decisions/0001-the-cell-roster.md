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

Is this the cell for the first stage? Two seats, drafted from the goal
and `agents/people.md`; nothing launches until this is ruled.

### Seats drafted

- **po_rosa**, product owner and reconciler: the goal needs someone to hold the cell to it.
- **tech_lead_tomas**, technical lead: the refused launch is a behaviour someone owns.

### Considered, not drafted

- **a designer**: the goal names no screen; add one when a stage builds UI.
- **a developer seat**: builders come per wave from cards, not from the roster.

### Gaps the inputs left

- No `measure` in `initiative.yaml`: the cell cannot say when the goal is met.
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

(Fixture: the accept record a draft cell waits on, shaped like the
persona-agents skill's `references/drafting.md` §5; discovery-in-a-cell G4
iii, ui-leftovers FR-12 V2.)

On accept, cell.json loses `draft` and gains `accepted` and `record`, each
persona file drops its draft line, and the crew is set up the usual way
(tokens, `bootstrap.sh`, `organizer crew`).
