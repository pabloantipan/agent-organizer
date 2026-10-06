# Usage: tokens and money per week

status: proposed
owner: pablo
by: aglaea, 2026-10-06, for the FSE (thread 01M492E4X6K04P266W8BVYAKCZ)
rulings it rests on: 0098 (scope, Pablo's words); 0020 (cards and waves show
tokens, not dollars); FR-14 (one badge, Needs me); the design system (stat
tile, Widths, dates as words, data looks like data); the dataviz method
(one axis, one hue for one series, a table view, hover on every mark)

Looked at: 0098 and what it says exists (`runs.jsonl`: 165 sessions,
$627 since 2026-09-30, most builders and reviewers unattributed). No screen
exists yet.

## The problem, in the lead's terms

Pablo, 2026-10-06: "note to save as clear as it's possible token
conmptsumtion plus money. I see builders and reviers: no token reported?
And, we need a weekly token counting report" (`said`). Today the cost of a
wave's builders and reviewers is invisible, and nothing adds up a week.

## The jobs

1. **This week**: what did it cost, in money and tokens, and is that more
   or less than last week?
2. **Where it went**: which initiative, which role (builder, reviewer,
   supervisor, FSE, persona, pair session), which task, which model.
3. **History**: the weeks before, to see the trend and look one up.

## 0098 and 0020

0020 keeps cards and waves to tokens, not dollars. 0098 asks for money
beside tokens. In this design, **money shows in the Usage view only**,
while cards, waves and Agents keep tokens as 0020 says. I read 0098 as
narrowing 0020, not reversing it. The FSE names this in the accept record.

## Where it lives

A **top-level view, Usage**, beside Settings: it spans every initiative, so
it is not an initiative's sub-view, and it is something he reads, so it does
not belong hidden in Settings.

- **Top bar**: a quiet text button `Usage`, left of Help. **No badge and
  no number**: Needs me is the one badge (FR-14), and money in the top bar
  would turn a glance into a worry.
- **Crumbs**: `Home / Usage`.
- **From an initiative**: Agents' toolbar line gains a muted line, `This
  week · 3.2M tokens`, in tokens (0020). It links to Usage filtered to that
  initiative.

## The view, top to bottom

```
Usage                           ‹  This week · 6–12 Oct  ›   This Mac only
┌───────────────┐ ┌────────────────────────────┐ ┌──────────────┐
│ $84.20        │ │ 41.2M tokens               │ │ 23 sessions  │
│ +12% on last  │ │ cache read 38.0M · input   │ │ 14 h of work │
│ week ($75.10) │ │ 1.1M · output 0.6M · cache │ │ 2 running    │
│               │ │ write 1.5M                 │ │              │
└───────────────┘ └────────────────────────────┘ └──────────────┘
Money per week            ▁ ▂ ▃ ▅ ▄ ▆ █   (12 weeks, this one marked)
[ By initiative | By role | By task | By model ]
 name             money    share        tokens  input  output  cache r  cache w  sessions
 organizer        $52.10   ████████▌     25.0M  …
 camp             $21.40   ███▌          …
 Not attributed   $10.70   █▋            …
▸ Sessions · 23
```

### 1. The week picker

`‹  This week · 6–12 Oct  ›`. Weeks start on Monday, as the Calendar's do.
The arrows move a week; pressing the label opens a short list of every
recorded week (`29 Sep–5 Oct · $112.40`). The first week recorded reads
`from 30 Sep`, because data starts mid-week. On the same line, at the
right: `This Mac only` (below, States).

### 2. Three tiles: the number is the point

The design system's stat tile, three in a row, no sparkline:

- **Money**: `$84.20` (2xl, tabular). Under it, in words and in neutral
  ink: `+12% on last week ($75.10)` or `−8% on last week`. Not green or red:
  spending more is not an error, and status colours are reserved.
- **Tokens**: `41.2M tokens`. Under it, the four kinds in one line,
  **largest first**: `cache read 38.0M · input 1.1M · output 0.6M · cache
  write 1.5M`. Cache reads dwarf the rest, and a stacked bar would show one
  colour and three slivers, so the kinds are words and numbers, not a chart.
- **Sessions**: `23 sessions`, `14 h of work` (summed session time), and
  `2 running` when any are.

### 3. One chart: money per week

The only chart in the view: **money per week**, the last 12 weeks (fewer
while history is shorter), as vertical bars in one hue (the accent's
data-viz step). The selected week's bar is the full step and the others are
lighter steps of the same hue, never a second colour.

- One measure, one axis. Tokens are not on it: two measures of different
  scale would need two axes, which the dataviz method forbids, and money is
  the one he asked to see clearly.
- 4 px rounded tops anchored to the baseline, a 2 px gap between bars, a
  recessive grid (`$0`, and one or two lines like `$100`), and week labels
  as dates in words (`6 Oct`).
- Hover on each bar: `29 Sep–5 Oct · $112.40 · 58.0M tokens · 41
  sessions`. Clicking a bar selects that week.
- `Show as table` below it switches to a table of the same rows, which is
  the accessible view.
- Only the selected week carries a direct label (`$84.20`). Every bar does
  not get a number.

### 4. Where it went: one table, four cuts

A segmented control, `By initiative | By role | By task | By model`, over
**one table**, sorted by money, largest first.

| Column | Shows |
|---|---|
| name | the initiative, role, task (the card's title or the wave's `supNN · title`, a link to it) or model |
| money | `$52.10`, tabular, the sort key |
| share | an inline bar of its share of the week's money, one hue, with the percent in its hover |
| tokens | the total, compact (`25.0M`, `830k`) |
| input · output · cache read · cache write | the four kinds |
| sessions | the count |

- The roles are the six of 0098: `builder`, `reviewer`, `supervisor`,
  `FSE`, `persona seat` and `pair session` (Hephaistos, Aglaea and the
  like).
- **Not attributed** is always the last row, never hidden, muted, with
  its hover saying why: `no card or wave matched its folder or branch`. It
  is the honest answer to "builders and reviewers: no token reported?"
- By task, a wave's row opens to its sessions (builder, reviewer,
  supervisor), so a wave's whole cost reads in one place.

### 5. Sessions

`▸ Sessions · 23`, closed by default. Each row has its start (`Mon 6 Oct
14:02`), the session name, initiative, task, role, model, duration, tokens
and money, newest first. A running session reads `running` in place of a
duration, and its numbers are marked `so far`.

## States

| State | What shows |
|---|---|
| **no data yet** | the view's title and one line: `No sessions recorded yet. Usage fills in as Claude sessions run on this Mac.` No tiles, chart or table |
| **a week with one session** | the tiles; the chart with its bars; the table with one row (100%); Sessions · 1 |
| **a week with no sessions** (picked from history) | `$0.00`, `No sessions this week.`, and the chart still shows the other weeks |
| **unattributed sessions** | the `Not attributed` row, last, with its reason in the hover; By task, it is the same row |
| **a session still running** | counted in the week with `so far`; the Sessions tile says `2 running`; its row reads `running`. Totals note `includes 2 running` |
| **the other machine absent** | `This Mac only` at the right of the picker. Its hover says `odyssey's usage is not here yet.` until the history leaves the machine (0098). When both are present: `lodestar and odyssey` and a `By machine` cut |
| **partial first week** | its label says `from 30 Sep`; earlier weeks are not drawn |
| **cost unknown for a session** (no statusline cost) | its money cell reads `—` with the hover `no cost recorded`; the money totals say `excludes 3 sessions with no cost` |
| **narrow, 1024×640** | the three tiles stay in a row. The table's four kind columns give way first, into the row's hover and name (design system Widths), then sessions; name, money, share and tokens stay |

## Acceptance, in the lead's terms

| # | The lead can | Checked by |
|---|---|---|
| U1 | read this week's money and tokens at a glance | Usage opens on this week: `$` tile with its change on last week in words, tokens with the four kinds, sessions |
| U2 | see the trend | the money chart shows up to 12 weeks, one hue, this week marked, a hover per bar, a table view |
| U3 | see where it went | each of the four cuts sorts by money; `Not attributed` is last with its reason |
| U4 | see a wave's whole cost | By task, a wave row opens to its builder, reviewer and supervisor sessions |
| U5 | look up a past week | ‹ and the week list select it; every section follows |
| U6 | trust a running week | a running session is `so far` and counted, and the tile says how many run |
| U7 | know what is missing | `This Mac only`, and sessions without cost are named in the totals |
| U8 | read it at 1024×640 | the kind columns fold into the hover; no horizontal page scroll |

## Open questions

- **O1** (FSE): "a week" in the machine's time zone, Monday first. Say if
  the remote history wants UTC; the view would still show local weeks.
- **O2** (Pablo, only if the FSE wants it confirmed): money in the Usage
  view only, tokens elsewhere (0020). I read 0098 that way.

## Technical notes

(left for the FSE)
