---
title: Records waiting on the cells leave Needs me, one word per status everywhere
status: ruled
raised: 2026-11-01
raised_by: fse
owner: pablo
options: ["take Aglaea's DS1-DS6", "keep FR-6 as built"]
cards: []
supersedes: []
superseded_by:
ruled: 2026-11-01
ruled_by: pablo
chosen: "take Aglaea's DS1-DS6"
---

## Question

0164's FR-6 counts an `awaiting-cells` record (a crossing waiting on the
cells, Themis's) as a decision waiting: a Needs me row and part of the
header's count. lf54-decision-states builds that, with the row reading
"awaiting cells" and the verb Open (leftovers-54 Amendment 6). Aglaea judged
it (docs/ux/specs/decision-states.md, d05ea58): the row has nothing for you
to do, and when Themis needs you it posts a question, which is already its
own Needs me row, so the crossing is counted twice.

Her design, DS1-DS6:
- **DS1** Needs me, its badge, the header's waiting count and the FSE
  panel's count take proposed records only.
- **DS2** Decisions gets a group "With the cells · N" between To rule and
  Ruled.
- **DS3** The header shows a muted "· 1 with the cells" that opens it.
- **DS4** applied and acknowledged keep the ruled colours, no new tone.
- **DS5** One word per status everywhere: Overview's gate rows and the CLI
  print "awaiting cells", "applied", "acknowledged".
- **DS6** owner `operator` shows as pablo, and the rule box drops "owner"
  when you are the ruler.

## Options

- **take Aglaea's DS1-DS6**: one frontend and CLI card after
  lf54-decision-states merges; changes 0164's FR-6.
- **keep FR-6 as built**: awaiting-cells stays a Needs me row with Open.

## Recommendation

take Aglaea's DS1-DS6. A row with nothing to do teaches you to skip rows.

## Forecast

forecast: 45-90m over 1 wave, after lf54-decision-states merges; basis:
this initiative's frontend cards with a UI review (lf52, lf55: 60-110 min).

## Ruling

pablo, 2026-11-01, in the organizer on lodestar: Pablo chose "take Aglaea's DS1-DS6" in the FSE session on 2026-11-01 (one card after lf54-decision-states merges).
