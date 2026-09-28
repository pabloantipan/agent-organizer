---
title: Review the initiative header again — collapse, the waiting chip, the stage strip, editing goal and scope
status: next
repos: [organizer]
branch: main
updated: 2026-09-28
next: "fse: spec these four findings (twenty-at-a-glance amendment), raise the choices as records, cut cards; Pablo rules the choices"
stage: twenty-at-a-glance
---

## Goal
Pablo, 2026-09-28, in the FSE's session, from the installed app v0.2.0-348
(screenshot of the organizer's Conversations tab):

1. "I can't colapse the goal and the scope. And gain, too much space."
   Goal, scope in/out and measure each clamp on their own
   (`glance-header-scroll`), but the header block as a whole cannot fold,
   and scope does not clamp.
2. "On the chip 2 decisions waiting click does nothing." The header chip
   should open the Decisions tab (filtered to waiting).
3. "cinta of waves makes sense? I mean, A label of waht is with an icon?"
   The stage strip under the header has no label saying it is the roadmap's
   stages.
4. "If I want to update goal by hand? And am I saving goals/scope updates?"
   By hand: edit `working-on/initiative.yaml`, then Rescan. Saved: the file
   is; history only when committed (the organizer repo tracks working-on/).
   The app never writes initiative.yaml; editing goal and scope in the app
   would be a new write path (like 0019's for records), Pablo's to rule.

## Candidates (not decided)
- The header folds to one line (name, phase, stage, waiting chip) with a
  toggle, remembered per initiative; scope clamps like goal.
- The chip opens Decisions, waiting first.
- The strip gets a label: a roadmap icon and "Roadmap · stage 5 of 6".
- Edit goal, measure and scope in the app, committing the file, or keep
  file-only editing.

## Done
- 2026-09-28 opened by the FSE from Pablo's report

## Next
1. fse: the spec amendment, records for the choices, cards

## Blockers
none
