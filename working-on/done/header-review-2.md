---
title: Review the initiative header again — collapse, the waiting chip, the stage strip, editing goal and scope
status: done
repos: [organizer]
branch: main
updated: 2026-09-30
next: "closed: 0063, 0064 and 0068 ruled; built by header-fold (3a3454d) and rule-box-finish (421dd9b)"
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

5. (screenshot of the stage strip) "why chip says buildgin and marked as
   done also?" The strip shows two things with the same weight: the stage's
   phase ("building", 0030) and its state ("1 · done"). Every organizer stage
   is building, so the phase chip repeats six times and reads as a status.
6. "If I click I have no deatil of the wave." The tiles are roadmap stages,
   not waves, and clicking one opens nothing.

## Candidates (not decided)
- The header folds to one line (name, phase, stage, waiting chip) with a
  toggle, remembered per initiative; scope clamps like goal.
- The chip opens Decisions, waiting first.
- The strip gets a label: a roadmap icon and "Roadmap · stage 5 of 6".
- The phase shows once, where it changes (a divider between discovery and
  building stages), not as a chip on every tile; state stays the tile's word.
- Clicking a stage opens its detail: outcome, exit items with their evidence
  or record, gates, and its cards (a stage panel, or the Roadmap tab focused
  on it).
- Edit goal, measure and scope in the app, committing the file, or keep
  file-only editing.

## Done
- 2026-09-29 designed by Aglaea (docs/ux/specs/initiative-header.md), specced by the FSE (docs/specs/initiative-header.md), cards header-fold and rule-box-finish
- 2026-09-28 opened by the FSE from Pablo's report

## Next
1. pablo: rule 0063 and 0064
2. closes when header-fold and rule-box-finish land

## Blockers
none

## Notes
- 2026-09-30: Pablo, 2026-09-30, in the FSE's session: "yes" to moving it to done/.
