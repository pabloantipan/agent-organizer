---
status: proposed
raised: 2026-11-01
by: aglaea
for: fse
from: lf54-decision-states UI review (card working-on/lf54-decision-states.md, ## UI review, 1df5001), A1-A3 and UI4
---

# Decision states: the crossing statuses on the lead's screens

A design note for a later leftovers. leftovers-54 Amendment 6 (1360269)
stays as written for `lf54-decision-states`: it stops the refused ruling,
which is what the review failed on. This note answers the questions the
review left for design and goes past the amendment in one place (DS1),
which changes FR-6 and G5 and so needs a record.

## The person and the job

The lead opens Needs me to find what only they can settle. Every row there
costs a look; a row they cannot act on teaches them to skim the list.

## A1: an awaiting-cells record is not a Needs me row

**Finding.** The lead cannot act on an `awaiting-cells` record, yet it is a
Needs me row and in the badge. Where: Home, Needs me, init-a 0013, at
1df5001 (`.wt-notes/l54-states-ui/1440x900-a-needsme-0013.png`). Evidence:
heuristic: the design system's Inbox row is "one row per thing asked of
the human" (`docs/design-system.md`, Inbox row), and CLAUDE.md's "Needs me
means the human's queue and nothing else"; the Themis skill (The wake, 2
and 4; Wake routine, 4 and 5) asks the cells, not the operator, while a
record is `awaiting-cells`, and when it needs the operator it posts one
`question` to pablo, which is already a Needs me row of its own (Answer).
Kept as a decision row, the record is counted twice once Themis sends it,
and for the whole wait before that it is a row whose only verb opens a
page that says there is nothing to do. Severity 2. Proposal below.

- **DS1** Needs me, its badge, the initiative header's "N decisions
  waiting" and the FSE panel's "waiting on you" count the records the lead
  can rule: `proposed` ones. An `awaiting-cells` record is none of these.
  (FR-6 and G5 say it is a Needs me row and in the header's count; this
  changes them, so it goes through a record for Pablo.)
- **DS2** Decisions lists it in its own group between To rule and Ruled:
  **"With the cells · N"**, the record's line in the waiting pair (badge
  "awaiting cells", dashed bar to today), expanded with Amendment 6's line
  "Waits on the cells it affects. Themis settles it." where Rule would be.
  The group is absent when N is 0, like the others.
- **DS3** The header says it once beside the lead's count, as a quiet
  signal, not a call to act: `2 decisions waiting · 1 with the cells`
  (muted text, no badge); `1 with the cells` alone when nothing waits on
  the lead. It opens Decisions at that group.

## A2: applied and acknowledged take the ruled tone, no sub-tone

The tone answers one question, open or decided; the word says which kind.
A third hue would have to pass the colour-vision check against both
fuchsia and indigo on raised and on the selected row, and it would carry a
difference the lead does not act on (applied versus ruled changes nothing
they do). Evidence: heuristic (design system, Timeline: "hollow fuchsia
waiting, solid indigo ruled"; the pair passed the dataviz validator).

- **DS4** `applied` and `acknowledged` badges, bars and diamonds are the
  ruled pair (Amendment 6 FR-6c already does this for the badge); the
  status word stays, written with a space: "applied", "acknowledged",
  "awaiting cells".

## A3: the header line on the sub-view tabs at 1024×640

Already held as R53 (`review-view.md`): the gap from the goal line to the
tabs is one gap whatever the initiative. Nothing new here; it goes with
whichever card takes R53.

## UI4: one word per status, one name per person

Severity 1 each; together they make the same record read three ways.

- **DS5** Every place that names a decision's status uses its word, not
  the bucket's: Overview's gate rows read `applied 21 Oct`,
  `acknowledged 20 Oct`, `awaiting cells 12d` (Decisions already does);
  `organizer decisions` prints "awaiting cells" on the line where it
  prints "waiting" today. A bucket heading may group ("Ruled · 8") but a
  line never renames its record's status.
- **DS6** The owner reads through the same person reader as `ruled_by`
  (FR-7): owner `operator` shows as **pablo** everywhere (Needs me,
  Decisions, the rule box's "signed … · owner …"), the raw value in the
  hover; so "owner operator" never appears, and the rule box's
  "owner pablo" drops when the ruler is pablo (CLAUDE.md: the owner named
  only when someone else rules).

## Acceptance (rows for the gate)

| Row | The person | Check |
|---|---|---|
| DS-a | sees only what they can rule in Needs me | fixture with 0013 `awaiting-cells`: Needs me has no 0013 row, the badge and the header's waiting count leave it out, FsePanel's "waiting on you" equals the header's count |
| DS-b | finds the crossing when they look for it | Decisions shows "With the cells · 1" between To rule and Ruled, 0013 in it with the waiting badge and dashed bar; expanded, the Themis line and no Rule |
| DS-c | knows a crossing exists without being asked to act | init-a's header reads `N decisions waiting · 1 with the cells` in muted text; pressing it opens Decisions at that group |
| DS-d | reads open or decided by tone, which by word | 0014 and 0015 badges, bars and diamonds in the ruled pair, with the words "applied", "acknowledged" |
| DS-e | reads the same status everywhere | Overview's gate rows for 0013-0015 and `organizer decisions init-a` print "awaiting cells", "applied", "acknowledged" |
| DS-f | reads one name for the operator | no screen text "operator" for 0013's owner; the hover holds it |

## Technical notes

(FSE)

## Amendment 1 (aglaea, 2026-11-01): two counts, two questions (after lf61)

From l61-states-ui's review of lf61-decision-states-ui (#20, 37b1763;
`working-on/done/lf61-decision-states-ui.md`), UI1, A1, A2. 0173 took
DS1-DS6.

- **DS-a was wrong, mine.** It said FsePanel's "waiting on you" equals the
  header's count. They answer two questions. The header is the
  initiative's: every record waiting on a ruling, whoever owns it (the
  lead may rule any proposed record, 0019 and 0045); it equals Decisions'
  "To rule · N". The panel and Needs me are the lead's own: records owned
  by the lead, with others' under Home's Waiting on others. The fixture's
  6 and 5 differ by 0005 (alejandro's), which is right.
- **DS7** The header's chip says the lead's share when it differs, in its
  words and accessible name, not only its number: `6 decisions waiting ·
  5 on you`; equal, it stays as main has it (0068 FR-2),
  `5 decisions waiting on you` (Amendment 2). The chip keeps opening
  Decisions. So the one screen holds both, with no second lozenge (A2
  answered: the header does not narrow to the lead's records, since
  Decisions' To rule would then disagree with it instead).
- **DS8** Home's initiative row carries no with-the-cells signal (A1). Home
  is the lead's scan of where they must act; a crossing asks nothing of
  them until Themis sends Pablo a question, which is then a Needs me row.
  The header, one press in, is enough.
- UI2 (the raw owner reachable by hover only): leave it; the raw value is
  a debugging aid, not information the lead acts on.

| Row | The person | Check |
|---|---|---|
| DS-a (amended) | reads two counts as two questions | fixture: header `6 decisions waiting · 5 on you`, Decisions `To rule · 6`, FsePanel `waiting on you: 5`, Needs me's decision rows 5 |
| DS-g | is not asked to look at what needs nothing of them | Home's init-a row: no "with the cells" text while 0013 is `awaiting-cells` |

## Amendment 2 (aglaea, 2026-11-02): DS7's equal case keeps "on you"

From lf62-ui (sup108): main reads `5 decisions waiting on you` when the
header's count equals the lead's (0068 FR-2, pinned by three tests); DS7
wrote that case as `5 decisions waiting` without checking main. Main is
right: when the counts are equal, "on you" is still true and says the
whole of it. So the chip reads `5 decisions waiting on you` when equal and
`6 decisions waiting · 5 on you` when not; with none on the lead, `6
decisions waiting`. Only the unequal case changes.

| Row | The person | Check |
|---|---|---|
| DS-h | reads whose they are in every case | equal: `5 decisions waiting on you`; unequal: `6 decisions waiting · 5 on you`; none on the lead: `6 decisions waiting` |
