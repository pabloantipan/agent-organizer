---
title: The organizer's roadmap
status: proposed
raised: 2026-09-27
raised_by: fse
owner: pablo
ruled:
ruled_by:
options: [as proposed, reorder or merge, rewrite]
chosen:
cards: []
threads: []
supersedes: []
superseded_by:
stage:
---

## Question

0029 (seven sub-goals with 0030) and 0030 (scope, phases) are ruled. The
roadmapping skill wants three to six stages. Is this the organizer's
`working-on/roadmap.yaml`? Once ruled, the FSE writes the file as below and
sets `done` on the first stage (this ruling is its "exit met").

## Options

- **as proposed**: the YAML below.
- **reorder or merge**: say which.
- **rewrite**: say what is wrong.

```yaml
stages:
  - id: foundations
    title: The board and the redesign
    phase: building
    outcome: one board across machines, organized around the initiative
    exit:
      - text: the redesign's 11 cards and retire-keeps-the-cell passed review
        met: 2026-09-26
    done:                 # 2026-09-27, when this record is ruled
  - id: twenty-at-a-glance
    title: Twenty at a glance
    phase: building
    outcome: from Home the lead tells which initiatives execute, which are in discovery, which wait on business and which on him, without opening one
    exit:
      - initiative.yaml carries scope (in/out) and the organizer shows goal and scope on the header (0030)
      - each stage shows its phase; Home shows each initiative's current phase
      - every active initiative has a goal
      - "what needs me" answered from Home in under a minute, 20 initiatives loaded (fixture)
    gates: ["0029", "0030"]
    appetite: one wave
  - id: machine-explains-itself
    title: The machine explains itself
    phase: building
    outcome: a developer new to the factory learns the flow and diagnoses the mailbox from the app
    exit:
      - the Help shows how we follow the flow, from the business plain-text diagrams (0031)
      - a deaf or capped seat says why and what to restart, in the UI
    appetite: one wave
  - id: cheap-execution
    title: Execution costs the lead little
    phase: building
    outcome: waves run through supervisors and the lead only rules
    exit:
      - the FSE pilot is judged keep or drop on pablo_minutes, gate_rework and decide_turnaround (0005)
  - id: discovery-in-a-cell
    title: Discovery has a shape and runs in a cell
    phase: building
    outcome: an initiative in discovery has a cell fed with its business context, and its move to building is a ruled record
    exit:
      - a cell being defined shows as such, with seats drafted from goal, scope and people.md
      - camp moves from discovery to building through a ruled record
  - id: decisions-owned-and-used
    title: Decisions have real owners, and their data is used
    phase: building
    outcome: business people's decisions are recorded as theirs, and turnaround and waits across initiatives drive changes
    exit:
      - records owned by someone other than the lead exist on at least one initiative
      - one change traced to decision data
    gates: []             # identity: a new record reopening 0004, not raised yet
```

## Recommendation

The FSE's: as proposed.

- **Scope and phase open stage 2.** They are small, and the format is
  already in the skills.
- **The machine explains itself is third.** Pablo said "Intuitiveness is a
  first", and the Help (0031) lives there.
- **Cheap execution is fourth.** It waits on Pablo's minutes, not on a build.
- **Discovery in a cell before owned decisions.** camp is in discovery now
  with its own FSE, so it is the live case.
- **Owned decisions last.** They need identity: four business people per
  initiative is the second person 0004 was withdrawn to wait for.

All stages are `building`, because the organizer is software being built.
Its discovery happened in 0029 and 0030. Stage 2's gate is those two rulings.

## Ruling



## Consequences

Once ruled:
- The FSE writes `working-on/roadmap.yaml`.
- It asks Pablo for the organizer's scope (stage 2's first exit item).
- It specs stage 2 (spec-craft) and spawns its supervisor.
