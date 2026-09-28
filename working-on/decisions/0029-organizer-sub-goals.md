---
title: The organizer's sub-goals under its goal
status: ruled
raised: 2026-09-27
raised_by: fse
owner: pablo
ruled: 2026-09-27
ruled_by: pablo
options: [the six as proposed, a subset or reorder, rewrite]
chosen: the six as proposed
cards: []
threads: []
supersedes: []
superseded_by:
stage:
---

## Question

The goal (`initiative.yaml`, Pablo 2026-09-27): a lead developer handles up
to 20 initiatives, 4–6 executing in parallel and the rest sequential, each
with about 4 business people; agents recover the decision making and it is
optimized on that data. Secondary: the machine is honest, transparent and
intuitive, so a new developer becomes its mechanic fast. Which sub-goals
break that down, in what order? Each becomes a roadmap stage (roadmapping
skill), and its measure becomes the stage's exit.

## Options

Sub-goals, each an outcome with a measure someone can check. Evidence is
what exists today; the gap is what does not.

1. **Twenty at a glance.** From Home, the lead tells which initiatives are
   executing, which are in discovery, which wait on business and which wait
   on him, without opening one.
   - Evidence: the redesign's Home, rail groups, stage stepper.
   - Gap: no execution-vs-discovery state per initiative, and only the
     organizer has a goal or a roadmap.
   - Measure: 20 initiatives on one Home; "what needs me" answered in under
     a minute.
2. **Every decision is a record with its real owner.** Decisions made by
   business people (PMO, designer, analyst, operations) are recorded with
   that person as owner, not only the lead.
   - Evidence: decision records, the Decisions tab, the Rule box, and
     `people.md` for routing.
   - Gap: every record today is owned by Pablo; business people have no way
     in (auth off, 0003).
   - Measure: share of an initiative's decisions with a record, and share
     owned by someone other than the lead.
3. **Discovery has a shape.** An initiative's early stages (finding the edge
   of the problem, deciding, expanding) are stages with gates, and the FSE
   runs each business person's intake.
   - Evidence: roadmap stages (0014), the intake, the FSE seat.
   - Gap: one FSE, on one initiative; no roadmap outside the organizer.
   - Measure: each active initiative has a goal, a roadmap and a current
     stage.
4. **Execution costs the lead little.** Waves run through supervisors, and
   the lead only rules.
   - Evidence: two redesign waves plus two one-card tasks this weekend, the
     run records, the wave strip.
   - Gap: the pilot measures are not in yet (`fse-pilot`).
   - Measure: `pablo_minutes` per wave, `gate_rework`, `decide_turnaround`.
5. **Decision data is used.** Turnaround, who waits on whom, and repeated
   questions are visible across initiatives and feed changes.
   - Evidence: the median turnaround on the Decisions tab, the FSE's
     repetition log.
   - Gap: nothing across initiatives; nothing reads the log.
   - Measure: one change a month traced to decision data.
6. **The machine explains itself (secondary goal).** A new developer can
   tell from the UI why a seat is not hearing, what a wake costs, and what
   to restart.
   - Evidence: the Agents and Conversations tabs, and the deaf/capped
     health words.
   - Gap: this weekend's faults were all found by digging, not in the UI:
     sup2 launched deaf; the drain ceiling looked like an empty inbox;
     Accessibility had to go to zellij, not iTerm2.
   - Measure: a developer new to the factory diagnoses a deaf seat from the
     UI alone, and becomes productive in a stated number of days (Pablo to
     say the number).

## Recommendation

The FSE's: all six, ordered 1, 4, 3, 2, 6, 5.

- 1 and 4 are nearly there.
- 3 feeds 2.
- 2 reopens identity (0004 said reopen when a second person needs it; four
  business people per initiative is that).
- 6 is secondary, but cheap to start: each fault above is one card.
- 5 needs data from 2 first.

## Ruling

Pablo, 2026-09-27, in the FSE's session (organizer-probe-fse): "It's fine",
then added: persona cells being defined should be visible, with help
prompting roles from the initiative's details; initiatives have a goal and
an "alcance"; discovery is where a cell fed with business context helps,
then the building stage estimates cards and roadmap; docs, specs and
diagrams grow with the initiative's complexity. The additions are 0030.

## Consequences

Once ruled, the FSE:
- writes `measure` into `initiative.yaml` from the chosen sub-goals, in
  Pablo's words;
- proposes `working-on/roadmap.yaml` with one stage per sub-goal, as a
  record;
- opens the cards for the first stage.
