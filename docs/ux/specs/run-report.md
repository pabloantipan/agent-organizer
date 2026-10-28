# How it happened: the run report and the activity history (aglaea, 2026-10-27)

status: proposed
owner: pablo
by: aglaea, for the FSE (thread 01M600FZ92J0NC61M6Y2HYFSVS, relayed by Hephaistos)
rests on: Pablo 2026-10-26, "This kind of chart shall be part of reporting";
Pablo 2026-10-27, "Send aglaea for adding this to Deltagos … to be able to
generate in Deltagos dynamically that kind of report. So we need to get in
Deltagos how actions have occurred."; the FSE's chart reference
(claudecode `skills/fse/references/autonomous-report-charts.md`, branch
feat/fse-charts-standing-roles); the design system (Timeline, Stage stepper,
Badge, Decision record, Empty state, Widths, dates as words, no invented
values).
merges after: lf53-frontmatter, lf52-decisions-line, lf55-one-title.
card prefix: lf57 (proposed).

## The problem, in Pablo's terms

After a night in autonomous mode, Pablo learns what happened from a report
the FSE writes by hand from git and the cards: two plain-text charts. He
wants Deltagos to draw it live from the same sources. Deltagos today shows
**what is**; this is the first time it shows **how it got there**.

## The jobs

1. **The morning after**: what moved while I was away, how much, what
   stopped it, and what was ruled without me?
2. **Where each track is**: what is done, where it runs, what it waits on,
   who owns that wait, and the shortest path to the goal.
3. **Any time**: what happened on this initiative, in order, and when.
4. **Pass it on**: the same report as text, for a thread or a record.

## 1. The model: one activity history, and a run is a window on it

**Accept Hephaistos's open question: yes.** There is one activity history
per initiative, and the run report is that history seen through a window.

- **An event**, one shape whatever its source: time, kind, subject (card
  slug, record number, seat, commit), who (a role or seat, never a
  business person), and a one-line detail.

  | kind | source today | words on screen |
  |---|---|---|
  | `done` | git: the card file added under `working-on/done/` | `passed review` |
  | `review` | run records (`runs/`, `docs/runs/`): rounds and cause | `review failed: <cause>` / `review passed, round 2` |
  | `merge` | git: a merge into main naming the card's branch | `merged` |
  | `seat` | Argos `pulse-history.jsonl`: state changes per seat | `started`, `stopped`, `capped` |
  | `stop` | pulse `usage_limit`; a machine or memory outage | `usage limit, <n> seats stopped` |
  | `mode` | `~/.local/state/factory/away-log.jsonl` | `autonomous mode on`, `off`, `moved: until 19:30` |
  | `ruling` | decision records: `ruled`, `ruled_by`, `ruled_mode` | `0160 ruled by judge-design` |

- **One renderer in Go**: `organizer activity <initiative> [--since]
  [--until] [--json]` lists events, and `organizer report <initiative>
  [--run <start>] [--text]` draws the two charts. The app calls the same
  service and the CLI prints the same text. **Copy as text** in the app
  copies exactly what `--text` prints (AR9).
- **A run is a window** from the away log, from `mode on` to `mode off`.
  Windows are factory-wide, so each initiative's report covers what
  happened in it during that window. An initiative with no event in a
  window has no report for it.
- **Never invented**: an event without a real time is not drawn. A source
  that is absent (no pulse history on this machine) is one line in the
  report saying so, never a gap passed off as calm.

## 2. Where it lives

- **The run report: a section of Overview**, `While you were away`,
  first on Overview while the latest window is recent (§3). Overview
  answers "where are we", and the morning after, that question is "what
  happened".
- **The history: a mode on Roadmap**, `Stages | Cards | Calendar |
  History`. Roadmap already owns the time axis and today; the history is
  the part left of today. It is not a seventh sub-view and it gets no
  badge (FR-14). Map, when it lands (map-and-roadmap), sits before
  History.
- **Home: one signal on the initiative's row** (§5), and nothing else. The
  run is not a Needs me row: nothing in it is asked of Pablo, and what is
  (a ruling that waits) is already on Needs me.

I change three things in Hephaistos's option B:

1. **Chart 1 is the rows Pablo liked, not a line on the Timeline.** A
   night is 7 to 8 hours. At Hours (1,536 px a day) it fits, but a
   cumulative line drops the card names, which are what the morning reader
   reads. The rows are the chart: time, bar, cards, percentage. The
   Timeline is the History mode's axis instead (§4).
2. **Chart 2 is a table of tracks, not Stage stepper tiles.** The stepper
   is a strip of three or more stages in order; chart 2 is a tree with
   columns. Where the stepper's words exist (`now`, done, planned), the
   table uses them.
3. **No percentage on Home.** Chart 1's denominator is the cards that
   passed review in the window, so a finished run always reads 100%. A
   number that cannot move says nothing. Home says the count and the dead
   time.

## 3. Overview: `While you were away`

```
While you were away                                     Run [26 Oct 23:40 – 07:10 ▾]   Copy as text
12 cards passed review in this initiative between 23:40 and 07:10.  Share = of those 12.

  23:40   autonomous mode on
  00:52   ▇▇▇▇▇▇▇▇▇░░░░░░░░░░░░░░░░░░░░░░░░░   3 cards  schema · loader · docs              25%
  01:30   ╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱   usage limit, every seat stopped · 1 h 58 min
  03:28   ╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱
  04:15   ▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇░░░░░░░░░░░░░░░░░   2 cards  worker · retries                    50%
  ...
  07:10   autonomous mode off

Tracks                                     Local = cards passed review / cards on the board for the track (cards not yet cut are not counted).
                          local   dev   qa              stg   prod   waits on
  A  Ingest · stage 1      100%    –     on qa · 0012    –     –      acceptance · operator
  └ B Validation · stage 2 100%    –     on qa · 3f1c2ab –     –
    ├ C Templates           71%    –     0%              –     –      templates-infra · Talos, operator
    │   5/7 · left reload-event, preview-fill
    └ D Batch issuance      73%    –     0%              –     –      batch-qa · Talos (not cut) · 0120 · operator
        8/11 · left timeout, follow-ups, params
  Shortest path to templates on qa: C, two Talos steps away.

Ruled while you were away · 2
  ◆ 0158  where the fixture runs   ruled by judge-design · 02:14   "two-machines"
  ◆ 0160  composer recipients      ruled by judge-architecture · 05:02
```

### Progress (chart 1)

- **A table** with the denominator line as its caption. That line is
  always drawn, and it says what the share counts: the cards that passed
  review in the window, or the planned cards when the run's brief named
  them (then `Share = of the 9 planned`).
- **One row per moment** cards moved to `done/`. Moves within 10 minutes
  of each other share a row, at the first one's time.
  - The time is mono, as words around midnight (`Sun 00:52` only when
    the window spans two days and the day changes).
  - The bar is a fixed 34-unit track of `--surface-raised` with the share
    filled in the one series hue (as Usage's bars).
  - Then the count, the cards as links that open each card's back, and
    the percentage, tabular, right-aligned.
- **Dead time** is its own row (two rows when it spans a gap, as in the
  text). It has a full-width hatched band in `--fg-subtle` on
  `--surface`, then the cause in words and its length (`1 h 58 min`).
  - It is not red once it is over: it needs nothing from Pablo now, and
    red is for blocked.
  - In a live run, dead time that is still going is drawn in the blocked
    treatment (`--status-blocked` and its word `stopped now`), since it
    is blocking at that moment.
- **Mode rows**: the first row is `autonomous mode on`, the last is `off`;
  `moved: until 19:30` sits at its time. They are text rows with no bar.
- **Reviews that failed** show in no bar (the chart counts passes), but a
  run with failed rounds adds one line under the table: `3 review rounds
  failed · Open in History`.
- Bars and hatching are `aria-hidden`. Each row reads as text: `00:52, 3
  cards passed review: schema, loader, docs, 25 percent`. Dead rows read
  `01:30 to 03:28, usage limit, every seat stopped, 1 hour 58 minutes`.

### Tracks (chart 2)

- **A track is a roadmap stage** by default. Its parent is the stage's
  `after:` when the roadmap names one (data being decided), else the stage
  before it. With no roadmap, chart 2 is the one line `No tracks yet:
  working-on/roadmap.yaml has no stages.`
- **A table**:
  - Rows in tree order, indented 16 px per level. The `└ ├ │` connectors
    are drawn in `--border-strong` and are `aria-hidden`; each row's name
    also says `after B` in its accessible name.
  - The track cell gives the letter, the title and the stage, with `now`
    on the current stage (the stepper's word).
- **`local`**: the percentage, and under the row in `sm` `--fg-muted`,
  the fraction and what is left (`5/7 · left reload-event, preview-fill`,
  cards as links). What counts is in the caption line above the table.
  - It counts cards on the board for the track. Cards not yet cut cannot
    be known, so they are not counted, and the caption says so.
  - That differs from the FSE's hand chart, which counts them from its
    own plan.
- **`dev`, `qa`, `stg`, `prod`** only when the roadmap has
  `environments:` (data being decided). Each cell is a Badge lozenge:
  - `on qa · <commit or record>` in the `now` tint;
  - `0%` in the neutral badge;
  - `–` (no lozenge) for an environment the track does not use, with the
    line above the table naming the skipped ones and why, from the
    roadmap.

  Without `environments:` the four columns are absent and the line reads
  `No environment data yet: roadmap stages carry no environments.` It is
  never a column of dashes made up.
- **`waits on`**: the card or record as a link, then the owner as a role
  (`Talos`, `operator`, a seat). A wait not cut yet is named with
  `(not cut)`. Several waits share the cell, separated by `·`.
- **Last line**: `Shortest path to <goal>: <track>, <what stands in it>.`
  The goal is the run brief's goal or the current stage's exit, whichever
  the away log's note names; with neither, the line is absent.
- Width: at 1024 the `waits on` cell moves under the row, after the
  fraction line, so the columns keep one x (Widths). Nothing scrolls
  sideways.

### Ruled while you were away

- **Decision record lines** (the existing component, lf52's line), for
  records whose `ruled` time falls in the window. Each line names who
  ruled it (`ruled by judge-design`, a role) and the time, so a ruling
  taken without Pablo reads as such.
  - It shows `ruled_mode` as the lozenge word `while away` beside
    `ruled`.
  - Opening the line opens the record in the drawer (map-and-roadmap's
    pattern), so Overview is not left.
- No rulings: the subsection is absent; the count in its heading is the
  number of lines.

### The run picker, live and empty

- **`Run`** is a select listing the windows of the last 14 days that had
  an event here, newest first, named `26 Oct 23:40 – 07:10`. The latest is
  chosen on arrival. Windows with nothing here are left out; the select is
  absent when there is one window.
- **Live** (the window is open now): the section heading reads `Running
  now · since 23:40`, and the last row is `now 03:12`, with no `off`.
  - It re-reads every 60 s while shown, with no live-region announcement
    (a night of rows would talk all night).
  - Dead time still going is drawn as blocked (above).
  - The section heads Overview while live, whatever its age.
- **Recent**: the section heads Overview until Pablo has opened it on this
  machine once and 24 h have passed since the window ended, or for 7 days
  at most (seen times in browser storage, a per-viewer convenience). After
  that it moves to the end of Overview, folded, as `Last run · 26 Oct`.
- **Never a run**: the section is absent from Overview. History still
  exists.
- **A window with no card passed**: chart 1 is the one line `No card
  passed review in this run.` above the mode rows, never an empty block.
- **Copy as text**: a default button, never the accent (no commit). It
  copies `organizer report <id> --run <start> --text`. The section's
  sr-only polite region says `Copied the report as text.`; the button's
  label does not change.

## 4. Roadmap › History

- **The shared Timeline** at Fit, Days and Hours (roadmap-time-zoom).
  Hours is offered because every event has a time, and opening from a
  run's `Open in History` lands at Hours on that window. Lanes, one per
  kind that has events in view:
  - `Cards` (done and merge as dots; a card's review rounds as ticks on
    the same lane);
  - `Seats` (one bar per seat run, from start to stop);
  - `Stops` (dead time as the hatched band, across every lane, as today's
    line does);
  - `Rulings` (diamonds, as Decisions draws them).
- **Run windows** are bands behind every lane, `--surface-raised`, with
  `autonomous mode` as their label in the axis's context row. Two windows
  never overlap (the away log has one at a time). Each band is a button
  that opens that run's report on Overview.
- **The list under the axis** is the text equivalent and the main
  reading: events grouped by day, newest day first, oldest first within a
  day, as one row each: time (mono), kind word lozenge, subject (a link),
  who (a role).
  - A kind filter sits above it as a checkbox group, one per kind, all on
    by default and remembered per machine. It is not chips; chips are only
    ruled out for initiatives, but checkboxes say "several" plainly.
- **Empty**: Empty state, `Nothing has happened here yet that Deltagos
  can read.` / `It reads git moves into working-on/done/, run records,
  decision rulings and the away log.` No action.

## 5. Home

- On the initiative's row, the signal **`last run · 12 cards · 2 h
  stopped`** (or `last run · 12 cards` with no dead time). A live window
  reads `running now · 3 cards so far`.
  - It shows under the same rule as Overview's heading (§3, Recent); after
    that it is gone.
  - It links to the initiative's Overview, scrolled to the section.
- Signals already fold at narrow widths (responsive-home). This one folds
  first, after `waiting`, since it asks nothing.

## 6. Cut from v0

- Chart 1 as a line or area on the Timeline (§2, change 1).
- Editing anything from the report or the history; both are read-only.
- Business names or client data: tracks, cards, records and roles only
  (every source is already that).
- A cross-initiative run report on Home. If Pablo wants the whole night in
  one place, it is v1 and reads the same windows.
- Counting not-yet-cut cards in `local`.

## Questions for Pablo (through the FSE)

1. **History as a Roadmap mode** (my pick: Roadmap owns the time axis), or
   a section of Overview, or its own sub-view?
2. **`environments:` on roadmap stages** (Hephaistos asked it already): the
   design draws the four columns only when they exist, so either answer
   works. Does a stage also get `after:` for the tree, or is "the stage
   before it" enough?
3. **The report heads Overview** until you have seen it and 24 h have
   passed (my pick), or only for the morning after (until noon)?
4. **No percentage on Home** (it always reads 100% for a finished run): say
   if you want the run's planned share there instead, which needs the
   brief to name its cards.

## Acceptance

| # | Pablo can | Checked by |
|---|---|---|
| AR1 | see the night on arrival | after a window with 3 cards passed, Overview opens with `While you were away` first: the caption line, `autonomous mode on`, one row per move with bar, cards as links and percent, `autonomous mode off` |
| AR2 | see what stopped it | a fixture with a usage limit 01:30–03:28: one hatched dead row reading `usage limit, every seat stopped · 1 h 58 min`, not red; during a live window with the limit still on, it reads `stopped now` in the blocked treatment |
| AR3 | know what the share counts | the caption above chart 1 and the line above Tracks are always drawn and name the denominator |
| AR4 | see each track | a roadmap with 4 stages, one with `after:`: four rows in tree order, `local` with its fraction and what is left under it, `waits on` with the owner as a role, the shortest-path line |
| AR5 | not be shown invented columns | a roadmap without `environments:` shows no dev/qa/stg/prod columns and the line `No environment data yet: …`; with them, lozenges `on qa · <ref>`, `0%`, or `–` with the skip named above |
| AR6 | see what was ruled without him | two records ruled in the window by judge seats: two Decision record lines with `while away`, the ruler and time; opening one shows the record in the drawer |
| AR7 | pick another night | two windows with events here: `Run` lists both, newest first and chosen; one window: no select |
| AR8 | watch a run live | with a window open: `Running now · since …`, last row `now <time>`, no `off`; a move made outside appears within 60 s; no live announcement |
| AR9 | pass it on | Copy as text puts on the clipboard exactly what `organizer report <id> --run <start> --text` prints, byte for byte |
| AR10 | never meet an empty box | a window with no card passed reads `No card passed review in this run.`; no roadmap reads `No tracks yet: …`; History with no events shows the empty state |
| AR11 | read it without the bars | every chart 1 row and every track row has an accessible name in words (time, count, cards, percent; track, after, local, environments, waits on); bars, hatching and connectors are hidden |
| AR12 | read the history | Roadmap › History lists events by day, newest day first, each with time, kind word, subject link and role; the kind checkboxes filter the list and the lanes; a run band opens its report |
| AR13 | see it from Home | the row signal reads `last run · 12 cards · 2 h stopped`, goes to the section, and leaves under §3's rule |
| AR14 | fit at 1024 | at 1024×640, Tracks keeps its columns at one x with `waits on` under the row, and no part of the section scrolls sideways |
