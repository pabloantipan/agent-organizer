---
title: The run report and activity history - three questions before the build spec
status: ruled
raised: 2026-10-27
raised_by: fse
owner: pablo
options: ["Q1 roadmap mode | overview section | own sub-view", "Q2 seen plus 24 h | until noon", "Q3 no percent | planned share"]
cards: []
threads: [01M600FZ92J0NC61M6Y2HYFSVS]
supersedes: []
superseded_by:
ruled: 2026-10-27
ruled_by: pablo
chosen: "Q1 roadmap mode, Q2 seen plus 24 h, Q3 no percent"
---

## Question

You sent Aglaea to design a report that Deltagos draws itself: "to be able
to generate in Deltagos dynamically that kind of report. So we need to get
in Deltagos how actions have occurred" (2026-10-27, relayed by Hephaistos).
Her design is `docs/ux/specs/run-report.md` (331ae1f). It has one activity
history per initiative. A night in autonomous mode is a window on that
history. Overview gets a "While you were away" section with two charts:
cards passed over time, and the tracks with what each one waits on. The
same report comes out as text from `organizer report`. She leaves three
questions for you. They are independent, so they are asked together:

- **Q1** Where does the full history live (a later card; lf57 is the
  Overview section and the Home signal only): as a mode of Roadmap (next to
  Stages, Cards and Calendar), as a section of Overview, or as a seventh
  sub-view of its own?
- **Q2** How long does the report stay at the top of Overview after a
  night: until you have opened it once and 24 h have passed since the
  night ended, or only until noon the next day?
- **Q3** Home shows no percent for a finished run. The percent counts
  the cards that passed that night, so a finished run would always read
  100%. Home shows `last run · 12 cards · 2 h stopped` instead. Or does
  Home show the share of the planned cards? That only works when the
  run's brief names its cards.

## Options

- **Q1** roadmap mode | overview section | own sub-view
- **Q2** seen plus 24 h | until noon
- **Q3** no percent | planned share

## Recommendation

**Q1 roadmap mode, Q2 seen plus 24 h, Q3 no percent.**

- All three are Aglaea's picks, and I agree with them. Roadmap already
  owns the time axis, and a seventh sub-view breaks FR-14.

## Changed before ruling (FSE, 2026-10-27)

Raised with four questions. Aglaea's Amendment 1 (8d2141a) follows your
three rulings relayed by Hephaistos. Tracks are now the cards' `track:` with
`depends_on` (odyssey's charts spec), not roadmap stages, so the old Q2
(`after:` on stages) is withdrawn and the rest renumbered. Deltagos draws
from `factory report <init> --since --until --json`, which is being built on
odyssey, and computes nothing itself.

## Next

After the ruling I write `docs/specs/leftovers-57.md` from her rows AR1 to
AR14 and your answers. It goes to you as an accept record with a forecast.
The prefix is lf57: the Overview section and the Home signal, drawn from
`factory report`. lf57 waits for that command to exist here. They merge after lf53-frontmatter,
lf52-decisions-line and lf55-one-title.

## Ruling

pablo, 2026-10-27, in the organizer on lodestar: Pablo in the FSE session, 2026-10-28: "excecute please", answering the FSE's ask to rule 0167 and 0168 as recommended.
