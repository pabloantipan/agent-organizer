---
title: How the organizer helps draft a cell's roster
status: ruled
raised: 2026-09-28
raised_by: fse
owner: pablo
ruled: 2026-09-28
ruled_by: pablo
options: [a drafting session, a role checklist, the FSE drafts it]
chosen: a drafting session
cards: []
threads: []
supersedes: []
superseded_by:
stage: discovery-in-a-cell
---

## Question

0030: "helping to promp roles acording the details of the initiative". The
organizer shows a cell and launches it, but nothing drafts one. How should a
roster (seats, persona files, `cell.json`) come from an initiative's goal,
scope and `people.md`? The persona-agents skill has no drafting procedure
yet (relayed to Hephaistos).

## Options

- **a drafting session**: a "Draft the cell" button on an initiative
  without a cell. It writes a prompt from the goal, scope, `people.md` and
  the persona-agents skill, and opens a Claude session at the root, as
  `organizer prompt --run` does. That session writes a draft roster marked
  as a draft. The organizer shows it as "in definition"; the human edits it
  and accepts it with a record. This reuses existing machinery. It needs the
  skill's drafting procedure first.
- **a role checklist**: the organizer shows a form prefilled with a standard
  discovery roster (PO, tech lead, designer, developer, and the business
  people from `people.md`). The human ticks and renames seats, and the app
  writes `cell.json` and stub persona files. There is no model in the loop;
  the stubs are thin until someone writes them.
- **the FSE drafts it**: the initiative's FSE proposes the roster as a
  decision record, from its intakes. The organizer only shows the draft and
  its record. There is no new app feature, but it works only where an FSE
  runs.

## Recommendation

The FSE's: a drafting session. It prompts roles from the initiative's
details, which is what 0030 asks for, and the human keeps the accept step.
It waits on the persona-agents skill's drafting procedure (Hephaistos).
Until then, the FSE-drafted path is what camp and any initiative with an FSE
can already use.

## Ruling

pablo, 2026-09-28, in the organizer on lodestar: That

## Consequences

The FSE amends the spec (FR-3, G4) and cuts the drafting card. On "a
drafting session", it depends on Hephaistos adding the skill's procedure.
