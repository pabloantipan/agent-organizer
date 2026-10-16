# Needs me: long waits and records owned by others (aglaea, 2026-10-15)

For 0134 ("record exit 1, act on the waits"). The FSE cuts the card from
this; it is a design spec, not a build card.

## 0. What the screen does today (read before cutting)

0134 says a record owned by someone else "reads like yours" on Needs me.
It does not: `needsMeRows` keeps only records whose owner is the lead or
empty (`ownedByLead` in `lib/queue.ts`, 0034 FR-8). camp 0005 (owner
alejandro) is on **no** Needs me row today. It shows only as the camp row's
`1 waiting · alejandro` signal on Home, the header count, and the Decisions
tab, where anyone may Rule it (0045). So the "waiting on <owner>" half of
0134 adds something that is missing; it does not relabel a row.

The lead's own long waits (camp 0007, 0008; agent-slack 0013) are on
Needs me already, and dated rows already sort oldest first. What they lack
is their age said plainly: the row says `raised 29 Sep` in its second line,
and nothing marks it as long.

## 1. The lead's own records: a long wait says its age

- **Threshold: 7 days.** The median turnaround is 0 days, so a week is far
  off the lead's rhythm, and it matches the reading in 0134 (the waits sit
  on initiatives he is not in this week). Counted in whole days from
  `raised` to today.
- **Words, first on the row** (task-rows §3: the fact before the title, so
  the title is what an ellipsis cuts):

  `waiting 18 days · camp 0007 · <title>`

  The fact is an amber lozenge (`--warning`, as `stalled`: look at this,
  nothing has stopped). `days` in full, never `d`: a screen reader reads
  `d` as a letter.
- **Under 7 days**: no lozenge; the row is as today.
- **Sort**: rows with the lozenge come first in Needs me, oldest first;
  then every other row, in today's order. The badge count does not change.
- **No `raised`**: no age, no lozenge, sorted as today (undated). Never a
  computed date.
- Verb stays **Rule**.

## 2. Records owned by others: their own group, not the lead's queue

Needs me is the lead's queue (0034), and its badge is that queue's count.
A record someone else owns is not his to act on first, even though 0045
lets him rule it. So it gets its own group, inside the Needs me section
and below its rows:

- **Heading**: `Waiting on others · 1` (an `h3`, the count in words for a
  screen reader as the heading text says it). The badge does **not**
  count these rows.
- **Which records**: proposed, owner not empty and not the lead, on an
  active initiative, **and waiting 7 days or more**. A fresh record is its
  owner's normal work; it stays where it is today (Home signal, header,
  Decisions). The group is absent when it would be empty.
- **Row**:

  `waiting on alejandro · 18 days · camp 0005 · <title>`

  `waiting on <owner>` is the fact, in the `--decision-waiting` word
  colour (dashed fuchsia lozenge, as waiting records are drawn), then the
  amber age lozenge, then id and title.
- **Verb: Open**, not Rule. It lands on the record in the initiative's
  Decisions tab (as Rule does today, focused on the record), where Rule is
  still offered (0045). The default verb on someone else's record is to
  look, not to rule over them.
- **Owner is a seat** (`fse`, a persona): same group, `waiting on fse`.
  A stuck FSE record is worth seeing; 0034 kept it off Needs me, not off
  the screen.

## 3. States

| state | where | words |
|---|---|---|
| owner empty | Needs me (the lead's, 0034) | as §1 |
| owner = the cell's human, any case | Needs me | as §1 |
| owner = someone else, under 7 days | not on Home's Needs me; Home signal, header, Decisions as today | — |
| owner = someone else, 7 days or more | Waiting on others | as §2 |
| no `raised` | the lead's: Needs me undated, no age; others': not in the group (no age to judge) | — |
| initiative not active | nowhere on Home (isActive, as today) | — |
| ruled, withdrawn or superseded while shown | leaves on the next scan | — |
| exactly 7 days | counts as long | `waiting 7 days` |

## 4. Accessible names

- Lead's row: name `Rule <initiative> <NNNN>`, described by the drawn line
  (tab-reaches-links A2): `waiting 18 days, camp 0007, <title>`.
- Others' row: name `Open <initiative> <NNNN>`, described by `waiting on
  alejandro, 18 days, camp 0005, <title>`.

## Acceptance

| # | The lead can | Checked by |
|---|---|---|
| W1 | see a long wait | a proposed record of the lead's raised 8 days ago leads Needs me with `waiting 8 days` in an amber lozenge before its id; one raised 6 days ago has no lozenge |
| W2 | find the oldest first | two long records, 9 and 18 days, and a 2-day thread: order 18 d, 9 d, then the thread |
| W3 | see someone else's long wait apart | camp 0005 (owner alejandro, 18 d) is under `Waiting on others · 1`, reads `waiting on alejandro · 18 days`, verb Open; the top-bar badge is unchanged by it |
| W4 | still rule it | Open lands on camp's Decisions with 0005 focused, and Rule is there |
| W5 | not see fresh others' records | an alejandro record raised 3 days ago is in no Needs me group; the group is absent |
| W6 | never get a made-up age | a record with no `raised` shows no age and joins no group by age |

## Amendment 1 (aglaea, 2026-10-15): from lf36's UI review

From sup73's close (`runs/2026-10-15-sup73-leftovers-36.md`,
`working-on/done/lf36-needs-me-waits.md`, ## UI review, nw-ui). My §1 and
§2 put the age in a lozenge while every row already has an age column;
that caused all three faults below. The age moves to its column, and the
reason column goes back to saying what kind of row it is.

- **Gap (the lead's long row lost `decision`)**: the reason column keeps
  the `decision` lozenge on every record row, long or not. The verb is not
  the only mark of a row's kind.
- **A2 (age twice)**: the age is said once, in the age column. On a long
  row (7 days or more) that column draws in `--warning` amber at 600, so
  the row still reads as long at a glance. The amber age lozenge is gone.
  The description still says it in full: `waiting 25 days, …`.
- **A1 (others' rows misalign)**: others' rows also carry `decision` in
  the 112 px reason column, so every row's lozenge and age line up. The
  owner moves to the front of the subject, in the one owner phrase
  (`ownerPhrase`): `owner alejandro · camp 0005 · <title>`. A long name is
  cut at the subject's end, never in the column.
- **Q (sub-line)**: yes, one line under the heading, as Needs me has:
  `Theirs to rule. Not counted in Needs me.` It says the one thing nothing
  else on the screen says, why the badge leaves these rows out.
- **VoiceOver of the descriptions**: a finding for whoever has a screen, as
  in launch-progress A6; not a gate row.

| # | The lead can | Checked by |
|---|---|---|
| W7 | tell a record row from others | every record row, long or not and in both groups, shows the `decision` lozenge in the reason column |
| W8 | read the age once | a long row has no age lozenge; its age column reads in amber; a 6-day row's age column is in the usual colour |
| W9 | scan others' rows in line | at 1024, `owner alejandro` and `owner ana` rows: the lozenges and the age columns share one x each |
| W10 | know why they are not counted | under `Waiting on others · n` the line reads `Theirs to rule. Not counted in Needs me.` |

## Amendment 2 (aglaea, 2026-10-16): from lf37's UI review

From `working-on/done/lf37-waits-polish.md`, ## UI review (merged af31b6c).

- **U1: the owner is said once.** On others' rows the subject already
  leads with `owner alejandro`, so the context line drops its
  `ownerPhrase` there and starts at `raised …` (a fact shows once per
  screen). The lead's rows keep the context line as it is.
- **U2: one verb column.** The verb sits in a column as wide as the widest
  verb a row can carry (Rule, Open, Answer, Agents, Launch), with the
  button right-aligned in it, so the age column stands at one x across
  every row of Needs me and of Waiting on others. The outcome is the rule;
  a fixed `min-width` on the verb cell is enough.

| # | The lead can | Checked by |
|---|---|---|
| W11 | read the owner once | at 1280 and wider, an others' row shows `owner alejandro` in the subject only; its context line starts `raised` |
| W12 | scan ages in one line | at 1024 and 1440, with Rule, Open and Answer rows in view, every age column's left edge has the same x (±0.5 px) |

## Amendment 3 (aglaea, 2026-10-16): from lf38's UI review

- **U1: the verb column fits the widest label a row can show, `Rule ·
  draft` (leftovers-9) included.** The draft mark stays in the verb: it is
  the one place that says "you started this" at every width, and the
  context line is not drawn at 1024. W12 reads "every verb label",
  not the five named; its check adds a `Rule · draft` row.
