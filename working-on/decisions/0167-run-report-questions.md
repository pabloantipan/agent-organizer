---
title: The run report and activity history - four questions before the build spec
status: proposed
raised: 2026-10-27
raised_by: fse
owner: pablo
options: ["Q1 roadmap mode | overview section | own sub-view", "Q2 after field | previous stage", "Q3 seen plus 24 h | until noon", "Q4 no percent | planned share"]
cards: []
threads: [01M600FZ92J0NC61M6Y2HYFSVS]
supersedes: []
superseded_by:
ruled:
ruled_by:
chosen:
---

## Question

You sent Aglaea to design a report that Deltagos draws itself: "to be able
to generate in Deltagos dynamically that kind of report. So we need to get
in Deltagos how actions have occurred" (2026-10-27, relayed by Hephaistos).
Her design is `docs/ux/specs/run-report.md` (331ae1f). It has one activity
history per initiative. A night in autonomous mode is a window on that
history. Overview gets a "While you were away" section with two charts:
cards passed over time, and the tracks with what each one waits on. The
same report comes out as text from `organizer report`. She leaves four
questions for you. They are independent, so they are asked together:

- **Q1** Where does the full history live: as a mode of Roadmap (next to
  Stages, Cards and Calendar), as a section of Overview, or as a seventh
  sub-view of its own?
- **Q2** The tracks chart draws a tree: track C and track D both come
  after B. Does a roadmap stage get an optional `after:` naming its
  parent, or is "the stage before it" enough (a straight line, no
  branches)? This changes the roadmap format in the working-on skill, so
  Hephaistos makes that change; Deltagos only reads it. The `environments:`
  columns (dev, qa, stg, prod) are drawn only when a roadmap has them, so
  that part needs no answer now.
- **Q3** How long does the report stay at the top of Overview after a
  night: until you have opened it once and 24 h have passed since the
  night ended, or only until noon the next day?
- **Q4** Home shows no percent for a finished run. The percent counts
  the cards that passed that night, so a finished run would always read
  100%. Home shows `last run · 12 cards · 2 h stopped` instead. Or does
  Home show the share of the planned cards? That only works when the
  run's brief names its cards.

## Options

- **Q1** roadmap mode | overview section | own sub-view
- **Q2** after field | previous stage
- **Q3** seen plus 24 h | until noon
- **Q4** no percent | planned share

## Recommendation

**Q1 roadmap mode, Q2 after field, Q3 seen plus 24 h, Q4 no percent.**

- Q1, Q3 and Q4 are Aglaea's picks, and I agree with them. Roadmap already
  owns the time axis, and a seventh sub-view breaks FR-14.
- On Q2 I pick `after:`. Her own example is a tree (C and D after B), and
  "the stage before it" cannot draw a tree. The field is optional, so any
  roadmap that leaves it out reads as before.

## Next

After the ruling I write `docs/specs/leftovers-57.md` from her rows AR1 to
AR14 and your answers. It goes to you as an accept record with a forecast.
The prefix is lf57. Hephaistos expects these cards: an away-windows reader,
the facts fields from hestia 0042, the report and `organizer report --text`,
the tracks chart, and the view. They merge after lf53-frontmatter,
lf52-decisions-line and lf55-one-title.
