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
