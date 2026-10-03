# Time zoom on every Gantt-style axis

status: proposed
owner: pablo
by: aglaea, 2026-10-03, for the FSE (thread 01M416RZH3E5VPJC9D5H8PK73F)
rulings it rests on: 0070 (O1 and O3 ruled 2026-10-03); 0013 and redesign FR-14 (Roadmap sub-view, Cards |
Calendar switch); 0022 (no invented dates); 0059 (1024 is real); the design
system's Timeline section

Looked at: Pablo's two screenshots of `ccint-camp-monorepo` (Roadmap › Cards
and Decisions › Timeline, regular width) and the code on main `65c190c`
(`Roadmap.tsx`, `RoadmapView.tsx`, `StageRoadmap.tsx`, `DecisionsView.tsx`,
`lib/dates.ts`, `internal/scan/git.go`). I did not run the
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

He widened it the same day, about the Decisions Timeline: "we need the same
here … Indeed, each graph that implicates time as gantt style, the same
feature but has no sense" (`said`, relayed by the FSE). **My reading**: one
zoom behaviour for every Gantt-style graph, offered only as far as it makes
sense for that graph's data. The last clause is ambiguous; the design below
holds under either reading, and the FSE may confirm it with him (O3).

### Which graphs

| Graph | Where | Gets zoom |
|---|---|---|
| Cards Gantt | Roadmap › Cards (`Roadmap.tsx`) | yes |
| Stages | Roadmap › Stages (`StageRoadmap.tsx`) | yes; its undated stages stay outside the time axis (below) |
| Decisions Timeline | Decisions (`DecisionsView.tsx`) | yes |
| Portfolio | `Portfolio.tsx`, not mounted | inherits it if ever mounted again; no work now |
| Calendar | Roadmap › Calendar | **no**. It is a month grid with its own month paging, and a day is already its smallest cell. Zooming it would turn it into the Gantt |

All three already share one look (label column 240, ticks, the today line)
and three copies of the same span-and-ticks code. The design system's
Timeline section asks for "one shared axis component". This feature is the
moment to have one, so that the three graphs zoom identically. That is the
FSE's call in Technical notes; for the user it means one behaviour, learnt
once.

## What the data can show — read this before building Hours

**Every date the Gantt draws is a whole day.** Card `start`, `due`,
`updated`, milestones, `target` and `started` are `YYYY-MM-DD`, and the git
span is `git log --format=%cs`, the short committer date
(`internal/scan/git.go:142`). Without new data, the Hours level would show
whole-day bands and the now line, and nothing about hours or minutes.

The same holds for Stages (`done`, `target`, gate dates) and for Decisions
(`raised`, `ruled`): all whole days.

Two sources already hold real times for cards, and either would give Hours
something to show. Both are the FSE's call, and both need more than the axis:

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
| **Fit** (default; "Months" in Pablo's words) | the whole span fitted to the lane width, as built | the design system's rule, now for all three graphs: weekly under 90 days (`28 Sep`), else monthly (`Nov`; January says `Jan 2027`). Cards today is monthly only; it takes the shared rule | none |
| **Days** | 40 px per day | every day: `Mon 5` (weekday and date); the 1st of a month says `Oct 1`; weekends tinted one step (`--surface-2`) | none |
| **Hours** | 64 px per hour (1,536 px per day) | every hour: `14:00`; midnight says `Sat 4 Oct` in place of `00:00` | every 15 minutes, faint; labelled `:15 :30 :45` only when the label fits in 48 px |

At Days and Hours a **sticky context label** sits at the left edge of the
axis, saying what the scrolled-off unit is: `October 2026` at Days, `Sat 4
Oct` at Hours. The reader always knows which month or day they are in.

**Hours only where a mark has a time.** A graph offers Hours only when at
least one of its marks carries a time of day; otherwise it stops at Days.
That is my reading of "but has no sense": an hour axis over whole days says
nothing. As things are, all three graphs stop at Days. With commit times (O1),
Cards gains Hours, and Stages and Decisions still stop at Days. If Pablo
wants Hours everywhere anyway, the whole-day-band treatment below covers it.

**The control**: a small group at the top right of each graph's frame, the
same on all three. On Roadmap it sits on the line of the Stages | Cards |
Calendar switch, and it is not shown on Calendar. On Decisions it sits on the
Timeline's title line.

`[ − ]  Days  [ + ]   Today   Fit`

- `−` and `+` are icon buttons named "Zoom out" and "Zoom in", 24 px at least.
  They are disabled at Fit and at the graph's deepest level (Days, or Hours
  where offered), as the design system says for a disabled action that is
  never possible here (no reason text).
- The middle word is the current level, as text, not a button.
- **Today** scrolls the window so today (Fit, Days) or now (Hours) sits at
  one third from the left, at any level. The design system already names a
  "today" control for timelines; this is it.
- **Fit** goes back to Fit. It shows only when the level is not Fit.
- Each graph has its own level: zooming the Decisions Timeline does not
  zoom the Roadmap.
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
- **Fit**: no anchor, since the level is fitted.

Zooming does not animate when `prefers-reduced-motion` is set; otherwise it
eases for 150 ms at most.

### Scrolling at Days and Hours

The lane becomes wider than the view and scrolls sideways inside the chart's
frame. The **label column (240 px) and the axis stay put**: the label column
is sticky on the left, and the axis is sticky at the top when the rows are
taller than the view. The page never scrolls sideways. A thin horizontal
scrollbar shows under the rows (the macOS overlay one is fine).

The window spans the graph's data (the Fit span) plus one day at each
end at Days, and plus 12 hours at each end at Hours. The reader cannot scroll
into empty years.

**Stages' undated region** ("no dates · order only", the slots after the
dated lane) is not time and does not zoom. At Days and Hours it stays where
it is in the content, after the window's end, at its Fit width; the reader
reaches it by scrolling to the end or with Fit. It is never stretched by the
scale.

### How each mark reads

The rule under every level: **a day-precision date covers its whole day**. A
card due 5 Oct ends at the end of 5 Oct, not at its start. At Fit the
difference is under a pixel, but at Days it is a whole column, and drawing it
at the start would make the card look due a day early.

| Mark | Fit (as built) | Days | Hours |
|---|---|---|---|
| **Bar with dates** | start → end | from the start of the start day to the end of the end day | the same, so the bar's ends are midnights. With commit times (O1), the git ends are drawn to the minute |
| **Open-ended bar** (`now`, no due) | runs to today, fades | runs to the end of today, fades | runs to **now**, fades into the now line |
| **Dot** (one day, no span) | a dot | a dot centred in its day column | a **whole-day band**, the row's height, the status colour at low fill, with the dot at its left end and the hover title saying "all day: no time recorded". Never shown as a point at 00:00, which would invent a time |
| **Due label** | `5 Oct` after the bar | the same | `due end of 5 Oct` |
| **Overdue** | red ring | red ring | red ring |
| **Milestone, target, started** | a mark on the axis at the day | a mark centred in the day column, title beside it | a band on the axis across the day, mark and title at its left |
| **Stage bar** (done, current to today) | as built | whole days, as a card's bar | whole days |
| **Gate / decision diamond** (Stages) | as built | centred in its day | at its day's left edge, with a whole-day band behind it |
| **Decision bar** (raised → ruled; waiting dashed to today) | as built | whole days; waiting runs to the end of today | whole days; waiting runs to now |
| **Decision dot** (raised and ruled the same day) | a dot | a dot centred in its day | a whole-day band, as a card's dot |
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
| **Nothing to draw** | as built in each graph (Cards: "No open cards or dates to draw."; Stages: no roadmap). No zoom control. |
| **Fit** | as built, plus the control (`−` disabled, `Fit`, `+`, Today). |
| **Days / Hours, something in view** | the table above. |
| **Days / Hours, nothing in view** (every row has an edge pointer) | the rows and their pointers, and one line in the lane's middle: "Nothing in this window." with the Today button beside it. The line is muted, not an error. |
| **Hours over day-only data** (O1 not built) | whole-day bands. Above the axis, at the right, one muted line: "Dates have no time of day; each fills its day." This is said once per view, not on every mark. |
| **Narrow** (1024×640, compact) | same design. The lane is about 760 px: 19 days at Days, about 12 hours at Hours. The control fits beside the switch. If it doesn't, it wraps under the switch, never into a menu. |
| **Another initiative picked, or the graph left and reopened** | back to Fit. The level is not remembered: zoom is a look, not a setting. |

### What it does not change

Calendar and the Portfolio. Each graph's start and end rules (for Cards, (`start`, then git, then `updated`; `due`, then
today for `now`, then git) as CLAUDE.md states them; for Stages and Decisions, as built) stay. Only the day-end
rule above changes how a date becomes a pixel.

## Acceptance, in the lead's terms

| # | The lead can | Checked by |
|---|---|---|
| A1 | from Fit, reach Days (and Hours where offered) with the `+` button, pinch, ⌘+wheel and the keyboard, one level per action, on Cards, Stages and Decisions alike | each input on each graph on the fixture |
| A2 | read, at Days, which weekday and date each tick is, and the month he is in while scrolled | screenshot at Days scrolled mid-month: weekday labels and sticky `October 2026` |
| A3 | read, at Hours, `HH:00` per hour, quarter-hour gridlines, and the day he is in | screenshot at Hours across a midnight: `Sat 4 Oct` at the midnight tick and sticky at the left |
| A4 | keep the thing he pinched on under his pointer | pinch over a bar's end at Fit → Days: that end moves less than one day column |
| A5 | see a card due 5 Oct end at the end of 5 Oct at Days | fixture card with `due`; the bar's right edge is on the 5/6 boundary |
| A6 | never see a day-only date drawn as a point in time at Hours | a dot card at Hours draws a whole-day band with the "no time recorded" title; the one-line note shows once |
| A7 | find a row's work when it is out of view | at Days, a row with a mark three weeks back shows `‹ <date>`; pressing it scrolls the mark into view and keeps Days |
| A8 | get back with Today and Fit from anywhere | Today puts today (or now) at a third of the lane; Fit returns to the graph as built |
| A9 | scroll the page with the wheel without zooming | plain wheel over the chart scrolls vertically; shift+wheel pans |
| A10 | do all of it at 1024×640 without the page scrolling sideways | screenshots at 1024×640 at each level; `document.scrollingElement.scrollWidth` equals the window width |
| A12 | not be offered an hour axis where nothing has an hour | with day-only data, `+` is disabled at Days on all three graphs; with commit times (O1), Cards offers Hours and Stages and Decisions do not |
| A13 | still see Stages' undated stages, in order, at any level | Stages at Days: the undated slots keep their Fit width after the window's end |
| A14 | zoom the Decisions Timeline without his Roadmap level changing | set Roadmap › Cards to Days, zoom Decisions to Days and back to Fit; the Roadmap is still at Days |
| A11 | use it by keyboard alone, with the level read out | tab to the control, the level word is in the group's accessible name ("Zoom, Days"); keys work with focus in the chart |

## Open questions

Ruled 2026-10-03, record 0070. O1, Pablo: "Agree" (commit times in the
same card). O3, Pablo: "yes, it's correct, If we have only date and no
timestamp, component shall detect it and avoid showing hours." A12 stands.
O2: the FSE sequences the card after header-fold-2. As asked:

- **O1** (Pablo): Hours over day-only data now, or commit times first. I
  recommend commit times in the same card.
- **O3** (Pablo, only if the FSE wants it confirmed): "the same feature but
  has no sense". I read it as "every Gantt-style graph, where it makes
  sense", so Hours appears only where a mark has a time, and Calendar is left
  out. If he meant Hours on every graph regardless, only A12 changes.
- **O2** (FSE): whether the card goes after header-fold-2 or works around it.
  This design touches the three graphs' axes and mark layout, one control
  group per graph (beside the switch in `RoadmapView.tsx`, on the Timeline's
  title line in `DecisionsView.tsx`) and the shared axis, if the FSE makes
  one. In `StageRoadmap.tsx` it touches the axis and the positions only,
  never the stage word or the stage row (FR-14), but the files overlap. O1's commit times add `internal/scan/git.go`
  and `lib/dates.ts`.

## Technical notes

by the FSE, 2026-10-03, on main 20435e7. O1 and O3 ruled in
`working-on/decisions/0070-time-zoom-hours-only-with-times.md` (Hours only
where a mark has a time; commit times in the same card). O2: the card runs
after header-fold-2 (`depends_on`), whose boundary holds `Roadmap.tsx`,
`RoadmapView.tsx` and `DecisionsView.tsx`.

- **T1, commit times.** `branchSpan` (`internal/scan/git.go:142`) logs
  `--format=%cI` in place of `%cs`, so `model.Card.BranchStart` and
  `BranchLast` carry an RFC 3339 time. Nothing else in Go reads them (grep:
  `scan.go:155`, `scan_test.go`, `model.go:238`). Snapshots from machines on
  an older build still carry dates only; the frontend takes both.
- **T2, one parser, precision kept.** `lib/dates.ts` `parseISO` accepts
  `YYYY-MM-DD` (as today, local midnight) and an RFC 3339 time, and a new
  helper tells which (`hasTime`). Its callers today (`Roadmap.tsx:25,30`,
  `Portfolio.tsx:21-22`) must keep working with either form; a time string
  that `parseISO` refuses would silently drop the git span. Vitest covers
  both forms.
- **T3, one axis.** The three graphs share one axis module in `lib/`
  (span, levels, ticks, pixel position, the day-end rule, `offersHours`) and
  one control component; each graph keeps its own rows and marks. This is the
  design system's "one shared axis component" (Timeline). The pure parts
  (ticks per level, day-end positions, anchor arithmetic, `offersHours`) are
  vitest-tested in `frontend/src/lib`.
- **T4, Hours offered.** `offersHours(marks)` is true when any mark's date
  has a time (T2). Today that is only Cards with a git span; Stages and
  Decisions stop at Days (A12).
- **T5, level is component state**, per graph, reset on initiative change
  or remount; never in the store, browser storage or the order document.
- **Not touched:** Calendar, Portfolio's mounting, the stage word and stage
  row (header-fold-2 FR-14), `docs/design-system.md`, any card or record
  writer. No new bound Go type, so no `wails generate module`.

### Spec check (spec-craft step 5b)

Every gate row (A1-A14, T1, T2) names its evidence. Boundary claims traced:
"nothing else in Go reads BranchStart" (grep above); "level not remembered"
(the spec's States, last row); "Calendar not zoomed" (Which graphs, 0070's
O3 ruling). Result: holds.
