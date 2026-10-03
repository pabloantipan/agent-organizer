# Decisions as the operator's main view

status: proposed
owner: pablo
by: aglaea, 2026-10-03, for the FSE (thread 01M417NHHRR2WP7XPY69XM438N)
rulings it rests on: 0019 and 0045 (anyone rules a proposed record, here or
in Needs me); 0031 (Help is how-we-build.md); 0068 (a count needs its noun);
0070 and 0071 (time zoom on this Timeline, no hours without timestamps)
review: `docs/ux/reviews/2026-10-03-decisions-view.md` (D1–D7)

## The problem, in the operator's terms

Pablo, 2026-10-03: "Srolling down is a pain due a LOT of stuff get stacked
on … Consider that factory human operator spend mayor time in this view"
(`said`). The page lists every record twice (Timeline and Ruled), so it is
about six screens long at 71 records, and it opens on four number tiles that
say nothing he acts on (D1, D2). It will grow by a few records a day.

Designed as the primary view: the job that brings him here leads the page,
and a report is one click away instead of in the way.

## The page, top to bottom

```
[ Find a decision: number or words              ]   ← field, full width of the content
3 to rule, the oldest for 5 days (0007) · 12 ruled this week
▾ To rule · 3                                        ← sticky heading, 16 px
   0005 Camp's first roadmap        waiting  owner alejandro · 6 days
   0007 …
▾ Ruled · 68                                         ← newest first
   0071 Accept the time-zoom spec …  ruled  "accept as written" · by pablo · 3 Oct
   … ten rows …
   Show the other 58
▸ Timeline                [ − Fit + Today ]          ← closed by default
```

### 1. The summary line (replaces the four tiles)

One line of words at the top, in `md` text, no tiles, no borders:

| Situation | The line says |
|---|---|
| some waiting | `3 to rule, the oldest for 5 days (0007) · 12 ruled this week`, where `0007` is a link landing on that record (as Needs me's key does) |
| one waiting | `1 to rule, for 2 days (0069) · 12 ruled this week` |
| raised today | `… the oldest raised today (0072) …` |
| none waiting | `Nothing to rule · 12 ruled this week` |
| nothing ruled this week | the `· … ruled this week` part is left out |
| All initiatives | the same, over all of them |

"This week" means the last 7 days, today included. **The median turnaround
goes away.** Records hold dates only, and 0070 rules out inventing hours, so
it would read 0 forever. The age of the oldest waiting record is the pace
measure he can act on.

### 2. Find

A text field above the sections, placeholder `Find a decision: number or
words`. It filters **every section at once**, the Timeline included, as he
types:

- a number matches the record number, with or without the padding (`69`,
  `0069`);
- words match the title, the chosen option and the body, case-insensitive,
  every word in any order.

While a filter is on, each heading's count reads `2 of 68`, and the
sections with no match show their heading with `no match`. A closed section
that has matches says so in its heading (`▸ Ruled · 2 of 68`), but it does
not open by itself. Escape in the field clears it. The filter is not
remembered. `/` focuses the field when focus is not in a text box.

### 3. Sections: one disclosure each

Three sections, **To rule**, **Ruled** and **Timeline**, in that order. The
Timeline moves to the end.

- **The heading is the control**: a button inside the `h2`, named by its
  words and count, `aria-expanded`, with a chevron ▾/▸ before the words. The
  disclosure is marked the same way as everywhere else (design system, Focus
  and names).
- **Words**: `To rule · N`, `Ruled · N`, `Timeline`. The sort order is no
  longer a meta beside the heading; it goes in the section's first row
  spacing and its accessible description ("oldest first", "newest first").
- **Size**: `xl` (16/22) semibold, the design system's section title.
- **Sticky**: an open section's heading sticks under the initiative header
  while its rows scroll by, so he always knows where he is and can close the
  section from where he stands.
- **Defaults**: To rule open, Ruled open, Timeline closed. What he opens or
  closes is **remembered per machine** (as the rail's collapse is), because
  this is his working layout, not a look.
- **An empty To rule** shows the heading `To rule · 0` and the line `Nothing
  to rule.`, and cannot be closed (there is nothing to hide).
- The Timeline's zoom control (0071) sits at the right of its heading and
  shows only while the Timeline is open. "show N superseded or withdrawn"
  sits there too.

### 4. Ruled: the newest ten

Ruled shows the **ten most recently ruled**, then one row of its own: `Show
the other 58`. Once pressed, the rest show and the row becomes `Show only
the newest ten`. Find searches all of them whatever this shows. Superseded
and withdrawn stay at the end of Ruled, under their small heading, inside the
same limit.

On a ruled row, the turnaround shows only when it is at least one day:
`after 3 days`. A same-day ruling says nothing more (D6).

### 5. Timeline rows: one line

Each Timeline row is one line, 28 px: the number and the title. The status
(the second line today) goes into the hover title and the row's accessible
name, and the bar's colour and the legend say it. Seventy rows go from about
3,050 px to about 2,000 px, and only when he opens the Timeline. Pressing a
label does what it does today. If the record is in a closed section, that
section opens first, then the record is expanded and scrolled to.

### 6. Landing on a record

Any landing (the header's decisions chip, Needs me's Rule, the summary
line's link, a Timeline label) on a record whose section is closed, or
beyond Ruled's ten, opens that section, or shows all of Ruled, before it
scrolls. The scroll leaves room for the sticky heading, so the record's line
is not hidden under it. Never land on a hidden record. A landing does not
change the remembered open/closed state of other sections.

### 7. The page's first line

"decision records in working-on/decisions/ · anyone may rule a waiting record
here, and it notes who did" leaves the page. What it teaches belongs in
Help. The "anyone may rule" fact is the Rule button's description where a
non-owner rules (it already signs the ruling with the owner, 0045). On All
initiatives the `h1` stays.

## States

| State | What shows |
|---|---|
| no records at all | as built: "No decision records … The working-on skill says how to raise one." No find, no sections |
| records, none waiting | summary `Nothing to rule · …`, `To rule · 0` with `Nothing to rule.`, Ruled open, Timeline closed |
| some waiting | the summary names the oldest; To rule lists them, oldest first, each with Rule as today |
| ten or fewer ruled | no "Show the other" row |
| find with no match anywhere | each heading reads `0 of N`, with one line under the field: `No decision matches "…".` and a Clear button |
| a record being ruled | as built (the rule box; header-fold-2 owns its expansion). After the ruling, the record leaves To rule and is first in Ruled. If Ruled is closed, its heading's count changes and it does not open |
| a read-only initiative (0042) | as built: no Rule. Everything else is the same |
| 1024×640 | same layout. The summary line wraps to two lines before anything is cut, and the field is full width |

## What it does not change

The record's row and its expanded body (`dec-line`, its `aria-expanded`,
the rule box, the facts) belong to header-fold-2. The Timeline's axis and
zoom belong to time-zoom (0071). This design moves the Timeline below Ruled,
gives its rows one line, and gives it a heading that closes. The marks and
the zoom stay as those cards make them.

## Acceptance, in the operator's terms

| # | The operator can | Checked by |
|---|---|---|
| B1 | open the view and see what waits on a ruling, and the oldest's age, without scrolling | screenshot at 1512×945 and 1024×640 with 3 waiting: summary and To rule's rows in view |
| B2 | read the top as words: no tiles, no median, no bare dash | the four tiles are gone; the summary reads per the table in §1 in each case (0, 1, n waiting; raised today; none ruled this week) |
| B3 | jump to the oldest waiting record from the summary | press `(0007)`: the record expanded and in view, focus on its line |
| B4 | close and open To rule, Ruled and Timeline from their headings, by mouse and by keyboard, and find them as he left them after a restart | toggle each; relaunch; same state. `aria-expanded` matches |
| B5 | see which section he is in while scrolling | scroll mid-Ruled: its heading sits under the initiative header |
| B6 | open the view with ~70 records and reach the end within two screens at default state | the organizer's own records, 1512×945: page height ≤ 2 × view height with the Timeline closed |
| B7 | find a past ruling by number or words | type `69` → 0069 alone; type `rail group` → only records with both words; Escape clears |
| B8 | land on a ruled record that is beyond the ten or in a closed section | Timeline label or chip on an old record with Ruled closed: Ruled opens, all shown, record expanded and visible below the sticky heading |
| B9 | read section headings as headings | `h2` at 16 px, semibold, count after the words |
| B10 | not read "0d" or "1d" on a same-day ruling | a same-day ruled row has no turnaround; a 3-day one reads `after 3 days` |
| B11 | read Timeline rows as one line | rows are 28 px; the status in the title and the accessible name |

## Amendment 1: the tall record's head, and its line's name

by aglaea, 2026-10-03, from leftovers-3 rows 2 and 9
(`docs/ux/reviews/2026-10-03-rank-leftovers-3.md`; header-fold-2's UI
review U2 and U3). Absorbed here because both are in this file's record
line, and the record's sticky head has to stack under this design's sticky
section heading.

### §8 A record taller than the view keeps its head

0069's note said that an expanded record taller than the view "keeps its
head at the top, Rule included". On main a landing only puts it there; one
scroll and Rule is at −362 px (U2). That note is what was meant. The head is
the record's line and its action row (Rule, when there is one). The facts
and the body scroll under it.

- While an expanded record's top is above the scroller's top and its end is
  still in view, its head sticks **directly under the section's sticky
  heading**. Never under the initiative header alone, and never covering the
  section heading.
- When the record's end scrolls past, the head goes with it. The next
  record's line never sits under a stuck head.
- A collapsed record and a record shorter than the view do not stick.
- With the rule box open, the box rides with Rule. If it is taller than the
  room under the stuck head, it is capped there and scrolls inside itself
  (Widths: a box is capped at the window). It never pushes the head up.
- A landing (§6) leaves room for both stuck layers: the section heading,
  then the record's head.
- The stuck head has the panel's background and a 1 px `--border` at its
  bottom, so the body visibly passes under it.

### §9 The line's name says each thing once

The record line's accessible name follows its visible text and says each
fact once: "0007 Stage normalize: exit met, waiting, owner pablo, 5 days".
Today it says "waiting" twice (U3).

| # | The operator can | Checked by |
|---|---|---|
| B12 | keep Rule in view while reading a record taller than the view | land on a tall waiting record at 1024×640, scroll 600 px: the record's line and Rule are under the section heading; scroll past the record's end: they leave with it |
| B13 | rule from a stuck head | open the rule box while the head is stuck: the box is under Rule, capped, the head does not move |
| B14 | hear each fact of a record line once | the `dec-line` accessible name contains "waiting" once |

## Open questions

- **O1** (Pablo): are these the jobs that keep you here (rule what waits,
  check what you just ruled, find an old ruling, see the pace)? If there is
  another one, it may change the order. The design does not wait on the
  answer.
- **O2** (FSE): sequencing. This touches `DecisionsView.tsx` around both
  cards' parts: the page frame, the section headings, Ruled's limit, the
  Timeline row's label line and its position. It does not change `dec-line`,
  the record body or the Timeline's axis and marks. It shares the file with
  both, so I'd sequence it after both.
- **O3** (FSE): the find matches the body. The body is on every
  `model.Decision` already (`d.body`), so no backend work, unless you see a
  reason.

## Technical notes

by the FSE, 2026-10-03, on main aa41169.

- **O2, sequencing:** the card depends on header-fold-2 (owns `dec-line`'s
  aria-expanded in `DecisionsView.tsx`) and time-zoom (0071, owns the
  Timeline's axis, marks and zoom control). It builds after both are in
  `done/`, on what they leave.
- **O3, find over the body:** `model.Decision.Body` (`internal/model/decision.go:46`,
  json `body`) is on every record already. The match is a pure function in
  `frontend/src/lib/` (number with or without padding, every word in title,
  chosen or body), vitest-tested. No Go change.
- **Remembered per machine:** the three sections' open state goes in browser
  storage the way `railCollapsed` and `headerOpen` do
  (`board.store.ts:132-189`, try/catch, a default when storage is empty):
  To rule and Ruled open, Timeline closed. Not in the order document; it is a
  look, not a setting that syncs.
- **The page's first line to Help:** the builder only removes it. Help is
  `~/agent-slack/docs/how-we-build.md` (`config.DefaultHelpDoc`), another
  repo, outside the card; if it lacks the sentence, the FSE raises it with
  Hephaistos.
- **Summary line and turnaround words** are pure functions in `lib/`
  (the §1 table's cases; `after N days`, nothing for the same day),
  vitest-tested.
- **Not touched:** `dec-line` and its aria-expanded, the record body, the
  Timeline's axis, marks and zoom, the rule box, the store's navigation
  (`openNeedsMe` landings only open sections, §6), Go, `docs/design-system.md`.

### Spec check (spec-craft step 5b)

Gate rows B1-B11 each name evidence; B6 needs the organizer's own records,
which the builder reads from this repo's `working-on/decisions/` through a
fixture copy, not the real home. Boundary claims traced: body on the record
(decision.go:46); per-machine storage precedent (board.store.ts). Result:
holds.
