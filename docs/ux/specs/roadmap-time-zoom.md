# Time zoom on the Roadmap's Gantt

status: proposed
owner: pablo
by: aglaea, 2026-10-03, for the FSE (thread 01M416RZH3E5VPJC9D5H8PK73F)
rulings it rests on: 0013 and redesign FR-14 (Roadmap sub-view, Cards |
Calendar switch); 0022 (no invented dates); 0059 (1024 is real); the design
system's Timeline section

Looked at: Pablo's screenshot of `ccint-camp-monorepo` (Roadmap › Cards,
regular width) and the code on main `65c190c` (`Roadmap.tsx`,
`RoadmapView.tsx`, `lib/dates.ts`, `internal/scan/git.go`). I did not run the
app for this spec; the UI review of the card runs it.

## The problem, in the lead's terms

Pablo, 2026-10-03: "we have dates at the top of the graph, we need to be able
have time zooming. So, you can see month there, after user action we need to
move to days and then to hours with mins." (`said`)

In his screenshot fifteen cards span thirteen months, and everything that
happened in the last two weeks sits in the last 70 px before the today line:
four `now` bars and eleven dots in two columns. He can see that work exists
but not which day each piece started, ended or is due. Zooming in is how he
reads the recent past and the next few days.

## What the data can show — read this before building Hours

**Every date the Gantt draws is a whole day.** Card `start`, `due`,
`updated`, milestones, `target` and `started` are `YYYY-MM-DD`, and the git
span is `git log --format=%cs`, the short committer date
(`internal/scan/git.go:142`). Without new data, the Hours level would show
whole-day bands and the now line, and nothing about hours or minutes.

Two sources already hold real times, and either would give Hours something to
show. Both are the FSE's call, and both need more than the axis:

1. **Commit times**: `%cI` in place of `%cs` for the branch's first and last
   commit, so `branch_start`/`branch_last` carry a time (then `parseISO`
   accepts a time).
2. **Agent runs**: `runs.jsonl` already has `first_seen` and `last_seen` per
   run, attributed to a card (`session.MatchCard`). An agent's working hours
   on a card are the thing an hour axis shows best.

**Open question O1 for Pablo**, through the FSE: build Hours over day-only data
now (the design below handles that honestly), or add one of these sources
first. I recommend **commit times in the same card**: it changes one format
string and one parser and it makes Hours meaningful. Runs as a second lane
are a later idea, not this card.

## Design

### Three levels, one control

| Level | Scale | Major ticks and labels | Minor gridlines |
|---|---|---|---|
| **Months** (default, as built) | fits the whole span to the lane width, as today | month: `Nov`; January says `Jan 2027` | none |
| **Days** | 40 px per day | every day: `Mon 5` (weekday and date); the 1st of a month says `Oct 1`; weekends tinted one step (`--surface-2`) | none |
| **Hours** | 64 px per hour (1,536 px per day) | every hour: `14:00`; midnight says `Sat 4 Oct` in place of `00:00` | every 15 minutes, faint; labelled `:15 :30 :45` only when the label fits in 48 px |

At Days and Hours a **sticky context label** sits at the left edge of the
axis, saying what the scrolled-off unit is: `October 2026` at Days, `Sat 4
Oct` at Hours. The reader always knows which month or day they are in.

**The control**: a small group to the right of the Stages | Cards | Calendar
switch, shown only on Cards:

`[ − ]  Days  [ + ]   Today   Fit`

- `−` and `+` are icon buttons named "Zoom out" and "Zoom in", 24 px at least.
  They are disabled at Months and at Hours, as the design system says for a
  disabled action that is never possible here (no reason text).
- The middle word is the current level, as text, not a button.
- **Today** scrolls the window so today (Months, Days) or now (Hours) sits at
  one third from the left, at any level. The design system already names a
  "today" control for timelines; this is it.
- **Fit** goes back to Months. It shows only when the level is not Months.
- They are default buttons, never the accent (principle 3: nothing here
  commits).

**The other ways in**, each moving one level:

- **Pinch** on the trackpad, or **⌘ + wheel** with a mouse, over the chart. A
  plain wheel is never taken: it scrolls the page vertically, and with shift
  or a sideways trackpad swipe it pans the chart. Pinch moves one level per
  gesture, not continuously, so the reader always lands on a level the table
  above describes.
- **Keyboard**, with focus anywhere in the chart: `+`/`=` zoom in, `-` zoom
  out, `0` Fit, `t` Today, `←`/`→` pan one major tick (one day at Days, one
  hour at Hours), `shift+←/→` pan one screen. Nothing is bound outside the
  chart.
- **Double-click on the axis** zooms in one level, anchored there.

### What stays still when zooming (the anchor)

- **Pinch, ⌘+wheel, double-click on the axis**: the instant under the pointer
  stays under the pointer.
- **Buttons and keys**: today stays where it is, if it is in view; otherwise
  the instant at the centre of the lane stays where it is.
- **Months**: no anchor, since the level is fitted.

Zooming does not animate when `prefers-reduced-motion` is set; otherwise it
eases for 150 ms at most.

### Scrolling at Days and Hours

The lane becomes wider than the view and scrolls sideways inside the chart's
frame. The **label column (240 px) and the axis stay put**: the label column
is sticky on the left, and the axis is sticky at the top when the rows are
taller than the view. The page never scrolls sideways. A thin horizontal
scrollbar shows under the rows (the macOS overlay one is fine).

The window spans the initiative's data (the Months span) plus one day at each
end at Days, and plus 12 hours at each end at Hours. The reader cannot scroll
into empty years.

### How each mark reads

The rule under every level: **a day-precision date covers its whole day**. A
card due 5 Oct ends at the end of 5 Oct, not at its start. At Months the
difference is under a pixel, but at Days it is a whole column, and drawing it
at the start would make the card look due a day early.

| Mark | Months (as built) | Days | Hours |
|---|---|---|---|
| **Bar with dates** | start → end | from the start of the start day to the end of the end day | the same, so the bar's ends are midnights. With commit times (O1), the git ends are drawn to the minute |
| **Open-ended bar** (`now`, no due) | runs to today, fades | runs to the end of today, fades | runs to **now**, fades into the now line |
| **Dot** (one day, no span) | a dot | a dot centred in its day column | a **whole-day band**, the row's height, the status colour at low fill, with the dot at its left end and the hover title saying "all day: no time recorded". Never shown as a point at 00:00, which would invent a time |
| **Due label** | `5 Oct` after the bar | the same | `due end of 5 Oct` |
| **Overdue** | red ring | red ring | red ring |
| **Milestone, target, started** | a mark on the axis at the day | a mark centred in the day column, title beside it | a band on the axis across the day, mark and title at its left |
| **Today** | 2 px accent line, `today` | today's column tinted with the accent at low fill, the 2 px line at **now** inside it, label `today` | the 2 px line at **now**, label `now 14:32`, moving every minute; today's 24 h tinted as at Days |

Hover titles keep what they say today and add the time when there is one.

### A mark out of view

At Days and Hours most rows have nothing in the window. A row whose mark lies
wholly outside the window shows an **edge pointer** at that side of its lane:
`‹ 12 Sep` or `5 Oct ›`, using the mark's nearest date, in muted text. It is a
button: it scrolls the window to the mark and keeps the level. A bar that
crosses the edge is simply cut by the frame and needs no pointer.

### States

| State | What shows |
|---|---|
| **No cards, no dates** | as built: "No open cards or dates to draw." No zoom control. |
| **Months** | as built, plus the control (`−` disabled, `Months`, `+`, Today). |
| **Days / Hours, something in view** | the table above. |
| **Days / Hours, nothing in view** (every row has an edge pointer) | the rows and their pointers, and one line in the lane's middle: "Nothing in this window." with the Today button beside it. The line is muted, not an error. |
| **Hours over day-only data** (O1 not built) | whole-day bands. Above the axis, at the right, one muted line: "Dates have no time of day; each fills its day." This is said once per view, not on every mark. |
| **Narrow** (1024×640, compact) | same design. The lane is about 760 px: 19 days at Days, about 12 hours at Hours. The control fits beside the switch. If it doesn't, it wraps under the switch, never into a menu. |
| **Another initiative picked, or Cards left and reopened** | back to Months. The level is not remembered: zoom is a look, not a setting. |

### What it does not change

The Stages view, Calendar, the Portfolio and the Decisions timeline. The
bar's start and end rules (`start`, then git, then `updated`; `due`, then
today for `now`, then git) stay as CLAUDE.md states them. Only the day-end
rule above changes how a date becomes a pixel.

## Acceptance, in the lead's terms

| # | The lead can | Checked by |
|---|---|---|
| A1 | from Months, reach Days and then Hours with the `+` button, pinch, ⌘+wheel and the keyboard, one level per action | each input on the fixture |
| A2 | read, at Days, which weekday and date each tick is, and the month he is in while scrolled | screenshot at Days scrolled mid-month: weekday labels and sticky `October 2026` |
| A3 | read, at Hours, `HH:00` per hour, quarter-hour gridlines, and the day he is in | screenshot at Hours across a midnight: `Sat 4 Oct` at the midnight tick and sticky at the left |
| A4 | keep the thing he pinched on under his pointer | pinch over a bar's end at Months → Days: that end moves less than one day column |
| A5 | see a card due 5 Oct end at the end of 5 Oct at Days | fixture card with `due`; the bar's right edge is on the 5/6 boundary |
| A6 | never see a day-only date drawn as a point in time at Hours | a dot card at Hours draws a whole-day band with the "no time recorded" title; the one-line note shows once |
| A7 | find a row's work when it is out of view | at Days, a row with a mark three weeks back shows `‹ <date>`; pressing it scrolls the mark into view and keeps Days |
| A8 | get back with Today and Fit from anywhere | Today puts today (or now) at a third of the lane; Fit returns to Months as built |
| A9 | scroll the page with the wheel without zooming | plain wheel over the chart scrolls vertically; shift+wheel pans |
| A10 | do all of it at 1024×640 without the page scrolling sideways | screenshots at 1024×640 at each level; `document.scrollingElement.scrollWidth` equals the window width |
| A11 | use it by keyboard alone, with the level read out | tab to the control, the level word is in the group's accessible name ("Zoom, Days"); keys work with focus in the chart |

## Open questions

- **O1** (Pablo): Hours over day-only data now, or commit times first. I
  recommend commit times in the same card.
- **O2** (FSE): whether the card goes after header-fold-2 or works around it.
  This design touches the Gantt's axis, its bar layout and one new control
  group beside the switch in `RoadmapView.tsx`. It does not touch the stage
  word or the stage row (FR-14). O1's commit times add `internal/scan/git.go`
  and `lib/dates.ts`.

## Technical notes

(left for the FSE)
