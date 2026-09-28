---
title: Accept the machine-explains-itself spec, and launch it
status: ruled
raised: 2026-09-28
raised_by: fse
owner: pablo
ruled: 2026-09-28
ruled_by: pablo
options: [accept as written, accept with amendments, send back]
chosen: accept as written
cards: [explain-help, explain-health-words, explain-health-all-agents]
threads: []
supersedes: []
superseded_by:
stage: machine-explains-itself
---

## Question

Is `docs/specs/machine-explains-itself.md` (proposed) the spec for roadmap
stage 3? It has 7 requirements, a 7-row gate and 3 cards in one wave. The
gate ends with a timed test: someone who did not build it diagnoses three
fixture seats and answers a discovery question from the app alone. Once
accepted, the FSE spawns a supervisor and lets go.

## Options

- **accept as written**
- **accept with amendments**: name them.
- **send back**: say what is wrong.

## Recommendation

The FSE's: accept as written. What to look at first, because each is a
choice you have not ruled:
- **A1: the Help renders `how-we-build.md` live, and never copies it.**
  Hephaistos proposed this so the two cannot drift. On a machine without
  `~/agent-slack`, the Help says where it looked.
- **A2: the Help is in the top bar,** next to ⚙, for the whole factory,
  not per initiative.
- **A3: the test fixture gets a canned mailbox health file,** because the
  live API cannot be made deaf on demand.
- **Non-goal: detecting macOS permissions.** The Help's doc can say how to
  grant them.

It also corrects a wrong remedy. The app still says a capped seat needs
restarting, but since the drain fix the next prompt delivers its mail.

## Ruling

Pablo, 2026-09-28, in the FSE's session (organizer-probe-fse):
"recommendation accepted".

## Consequences

On acceptance: the spec goes to ruled; the FSE starts a supervisor with its
own identity, notes it on the cards, and lets go.
