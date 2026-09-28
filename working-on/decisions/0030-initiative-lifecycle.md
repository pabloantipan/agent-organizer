---
title: An initiative has a goal and a scope, and moves from discovery to building
status: ruled
raised: 2026-09-27
raised_by: fse
owner: pablo
ruled: 2026-09-27
ruled_by: pablo
options: [as read, amend the reading, not now]
chosen: as read
cards: []
threads: []
supersedes: []
superseded_by:
stage:
---

## Question

Pablo, adding to 0029 (2026-09-27, the FSE's session): "we need to see when
agent persona cells are being define, helping to promp roles acording the
details of the initiative. Initiatives shall have a goal and an 'alcance'.
… along problem discovery agent persona cell may be more usefull as they are
fed with Business context. Then one the system is defined we can have start
the building stage where the specific carding and road mapping could be
estimated, then we build up the stuff. As the initiative grows up,
complexity also does, so docs/specs/diagrmas shall be according to it."

Is this the FSE's reading of it? The reading changes the working-on format
and the organizer, so it waits on his words.

## Options

- **as read**:
  1. **Scope.** `initiative.yaml` gains `scope` next to `goal`: what is in,
     and what is explicitly out, in the owner's words. The organizer shows
     both at the top of the initiative. It is a working-on format change,
     like `goal` and `measure` were.
  2. **Two phases, each a run of stages.**
     - **Discovery:** finding the edge of the problem, deciding, expanding.
       Its work is a persona cell fed with business context (the camp cell
       is the existing example: a PO, designers, a tech lead) plus the
       business people's intakes. Its output is decisions and a defined
       system, not cards.
     - **Building:** starts when the system is defined. The FSE turns the
       definition into a spec, estimated cards and a roadmap, and
       supervisors build.
     - The move from discovery to building is a stage gate: a record the
       owner rules. The roadmap format already carries gates (0014); the
       phase is a label on each stage.
  3. **Cells are prompted from the initiative.** When a cell is being
     defined, the organizer shows it as in definition (a cell.json with
     seats but no sessions yet). It helps draft the roles by proposing seats
     from the goal, the scope and the business people in `people.md`. The
     human edits and accepts the proposal; nothing launches until then.
  4. **Docs scale with complexity.** Each stage's exit names the documents
     that stage needs, from a paragraph in discovery up to specs and
     diagrams in building. The docs are not front-loaded, and the roadmap
     says when each one is due.
  5. **A seventh sub-goal**, next to 0029's six: "Discovery runs in a cell."
     Measure: an initiative in discovery has a cell fed with its business
     context, and its move to building is a ruled record.
- **amend the reading**: say which part is wrong.
- **not now**: record the idea; the organizer's roadmap covers 0029 only.

## Recommendation

The FSE's: as read. Build order in the organizer's roadmap: scope in the
format and on the header first (small), the phase label on stages with it,
and cell drafting after sub-goal 1. Cell drafting is the largest, and it
needs the business people's intakes (sub-goal 3) to have something to
prompt from.

## Ruling

Pablo, 2026-09-27, in the blacksmith session, choosing "As read": scope next to goal; discovery in a persona cell, then building through the FSE, with a ruled gate between; cells drafted from the initiative; docs that grow with complexity; a seventh sub-goal. The blacksmith writes the format change (scope, the phase label) into the working-on and roadmapping skills.

## Consequences

Once ruled:
- The FSE asks Pablo for the organizer's own scope.
- It proposes the working-on format change for `scope` and the phase label
  (the skill is Pablo's to accept).
- It proposes the organizer's `roadmap.yaml` with one stage per sub-goal,
  each labelled with its phase, as a record.
