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

## Amendment 1 (aglaea, 2026-10-27): Pablo's three rulings, and odyssey's charts spec

Pablo, 2026-10-27 (relayed by Hephaistos; docs decisions.md):

1. Show only the environments a factory uses; lodestar is local only.
2. The user picks the time window in Deltagos, so its result differs from
   the FSE's text whenever the window does. Both run one computation,
   `factory report <init> --since/--until --json` (being built). Deltagos
   does not paste the FSE's text.
3. Each factory draws its own charts, with no sync.

Read with them: odyssey's Hephaistos's spec, agent-organizer
`spec/autonomous-report-charts` (bdb54c7, c41b8ae),
`docs/specs/autonomous-report-charts.md`. It owns the computation: done
moves, the window, dead time, grouping, the deploy record, `track:`,
`waits_on:`. This spec owns how Deltagos shows it, and so answers its Q2
(which sub-view: Overview, §2).

### What changes here

- **One computation, read as JSON.** §1's `organizer activity` and
  `organizer report` are replaced, for the charts, by `factory report
  <init> --since --until --json`. Deltagos draws from that JSON and
  computes nothing of its own.
  - Grouping, denominators, dead spans and percentages are the
    computation's (odyssey FR-5 to FR-8; moves grouped at a 20 min gap),
    so §3's "within 10 minutes" goes.
  - **Copy as text** copies `factory report <init> --since <shown> --until
    <shown>` text, byte for byte, for the window on screen.
  - When the command is missing or fails, the section shows the source of
    nothing: one line in the blocked-reason style, `Report not drawn:
    factory report not found` or its first error line, with no chart
    (diagrams-in-app D3's pattern).
- **The window is Pablo's to pick.** §3's `Run` select becomes a window
  control in the section's heading row:
  - presets as a select: each autonomous window of the last 14 days
    (`26 Oct 23:40 – 07:10`, newest first, the latest chosen on arrival),
    then `Last 24 hours`, then `Custom…`;
  - `Custom…` shows two `datetime-local` fields, `From` and `To`, applied
    on change, with no button. `To` before `From` disables nothing; the
    line under them reads `From must come before To.` and the chart keeps
    the last good window.
  - **The caption always names the window** (`12 cards passed review
    between 23:40 and 07:10.`), so a chart that differs from the FSE's
    text says why. With a custom window the mode rows read `window start`
    / `window end` (odyssey FR-8).
  - The chosen preset is remembered per machine. A custom window is not
    remembered: the next arrival shows the latest run.
- **Environments: only those the factory uses.** The columns are the
  environments that some deploy entry of this factory names (odyssey
  FR-19). On lodestar that is none, so Tracks shows `local` alone, with no
  line about missing columns: nothing is missing. §3's `No environment
  data yet` line and its AR5 reading go.
- **Tracks are `track:`, not stages.** Odyssey P17 shows tracks are not
  roadmap stages. A track is the cards' `track:` (odyssey FR-16), and the
  tree comes from `depends_on` across tracks (FR-17). `after:` on stages is
  withdrawn (Q2 below). With no `track:` on any card, Tracks is the one line
  `No card carries track: yet.`
  - `local` counts cards still to cut from the track's ruled records
    (FR-18), so the caption reads as odyssey FR-21 has it.
  - Untracked cards are one `[untracked]` row, last.
  - The letter, indent, `waits on` (`who` as the role) and the
    shortest-path line stay as §3 draws them. The path line is drawn only
    when the computation gives one (odyssey Q6).
- **No sync.** An initiative shown from another machine's snapshot has no
  report here. Its Overview shows, in place of the section, the one line
  `Run reports are drawn on <machine>.` and Home shows no run signal for
  it.
- **Drawn rows, not the text in a mono block.** Odyssey FR-11 asks the
  view to show the text verbatim in mono. With ruling 2 the app no longer
  pastes text, and the morning reader needs what the text cannot give:
  cards as links, a ruling that opens its record, and a name per row for
  VoiceOver (a mono block of `#` and `x` reads as noise). So the view
  draws §3's rows from the JSON, and the text is one press away (Copy as
  text). The same numbers, two forms. Odyssey FR-11 should be amended to
  say so (spec-craft step 7), which is Hephaistos's.
- **History is a later step.** The computation being built is the report.
  §4's Roadmap › History needs an events source beyond it (seat starts,
  merges, rulings in one list), so it is its own card once that source
  exists. lf57 is §3 and §5 only.

### Questions, as they stand (record 0167)

- Q1 (History's place): stands, for the later card.
- Q2: ruled for environments. The `after:` part is withdrawn: tracks come
  from `track:` and `depends_on`.
- Q3 (how long the report heads Overview) and Q4 (no percent on Home):
  stand.

| # | Pablo can | Checked by |
|---|---|---|
| AR5 (amended) | see only his environments | on lodestar (no deploy entries) Tracks has the `local` column alone and no line about environments; with deploy entries naming qa, a `qa` column appears with `on qa · <ref>`, `0%` or `–` |
| AR7 (amended) | pick the window | the window select lists the last 14 days' runs (latest chosen), `Last 24 hours` and `Custom…`; Custom's From/To redraw the chart on change; the caption names the window shown |
| AR9 (amended) | pass it on | Copy as text equals `factory report <id> --since <shown> --until <shown>` text, byte for byte |
| AR15 | trust the numbers | every count and percent drawn equals the `--json` output for the same window; no number is computed in the frontend |
| AR16 | see why nothing is drawn | with `factory` off the PATH, the section reads `Report not drawn: factory report not found` and draws no chart |
| AR17 | not see another machine's run | a remote initiative's Overview reads `Run reports are drawn on <machine>.`; its Home row has no run signal |
| AR18 | read tracks as the factory marks them | cards with `track:` draw one row per track, in the depends_on tree; none carry it: `No card carries track: yet.`; untracked cards are one `[untracked]` row last |

## Amendment 2 (aglaea, 2026-10-27): drawn from the merged `factory report`

`factory report <init> [--window last|current | --since T --until T]
[--text|--json]` is merged (claudecode 4ee1f71, `scripts/factory/report.py`).
I ran it on organizer `--window last` (18 Oct 16:31–19:30). Its JSON has
`window`, `progress` (`denominator`, `moves`, `lines`, `dead`, `notes`) and
`tracks` (`rev`, `rev_time`, `envs`, `tracks`, `goal`). The screen maps to
it as follows, and nothing is computed in the app (AR15).

- **The window control's presets** are the command's: `Running now`
  (`--window current`, present only while a window is open), then each
  run of the last 14 days, the latest being `--window last`, chosen on
  arrival, then `Last 24 hours` and `Custom…` (`--since/--until`).
- **Progress rows** are `progress.lines`: time `t`, `cards` as links to
  each card's back (its commit sha in the link's name and hover, not on
  the row), and `pct`. The bar width comes from `pct`; `hashes` belongs to
  the text form. `progress.dead` draws the dead rows, and `progress.notes`
  are lines under the table in `sm` `--fg-muted`.
- **The caption** is drawn from `denominator.count` and the window, in
  words: `5 cards passed review between 16:31 and 19:30, 18 Oct.` With a
  `planned` kind it says `of the 9 planned`.
- **Tracks are what the JSON gives**, today the roadmap's stages plus one
  row for cards with no stage (`id` empty), drawn last as `No stage`. A1
  read tracks from `track:` after odyssey's proposal; the merged command
  reads stages, and the screen does not care which. If the command adopts
  `track:`, nothing here changes.
  - **A chain is a column, not a staircase**: a track that is its
    parent's only child sits at its parent's indent, with a `↓` connector.
    Indent shows a branch only.
  - **Done tracks fold.** Tracks with `done` set and no move in the
    window collapse into one line at the top, `7 tracks done · Show`, a
    disclosure (`aria-expanded`) that lists them with their done dates in
    words. The text form keeps them all; the screen leads with what is
    open.
  - A track with nothing planned (`planned` 0) reads `–` under `local` and
    `no card names it` in `sm` `--fg-muted`.
  - `envs` are the columns. With `local` alone there is no environments
    line (A1).
  - **The board's moment**: one `sm` `--fg-muted` line above the table,
    `Board as of 2a60d49 · 19:17` (`rev`, `rev_time`), so a rerun that
    matches is visibly the same board.
  - The **goal line** is `tracks.goal` as given.
  - **No tracks at all** (`tracks.drawn` false, or an empty `tracks`):
    one line, `No tracks to draw: no roadmap stages, and no card names a
    track.` A1's `No card carries track: yet.` is withdrawn, since the
    stages are drawn when no card carries `track:`.
- **Rulings are not in the JSON.** Until they are, `Ruled while you were
  away` reads the scan's own `RuledAt` within the window. It is a list,
  not a number, so AR15 holds. Asked of Hephaistos: a `rulings` list in
  the report (number, ruled_at, ruled_by, ruled_mode), so the text form
  carries them too.

| # | Pablo can | Checked by |
|---|---|---|
| AR19 | read open work first | on organizer `--window last`: one line `7 tracks done · Show` at the top of Tracks, then `review-map` and `No stage` with their fractions and what is left; Show lists the seven with dates in words |
| AR20 | read a chain plainly | stages that follow one another without a branch share one indent, joined by `↓` |
| AR21 | know which board was read | the line `Board as of <rev> · <time>` equals the JSON's `rev` and `rev_time` |

## Amendment 3 (aglaea, 2026-11-01): leftovers 57 UI notes

From the UI reviews of lf57-run-report and lf57-home-signal
(`working-on/done/`, ## UI review). All were measured on an offscreen
WKWebView of the merged sha, the screen being locked; none is above
severity 2.

- **run-report U3, several waits in one cell.** The owner goes in
  parentheses, as Copy as text writes it: `0002 (pablo) · rule-x (pablo)`.
  `·` then separates waits only. One line still; past the cell, the
  usual "+N" with the rest in the hover and name.
- **run-report U4, not drawn.** No red rule: red is blocked only. The
  not-drawn line is `sm` `--fg-muted` text with no rule and no hue; its
  words carry it.
- **run-report U1, U2, U5**, the reviewer's proposals taken: the time
  column is sized for `Ddd HH:MM` when the window spans days; card links,
  disclosures and the done fold get a 24 px target by padding; a line the
  usage ledger has no run for reads `no tokens recorded`, never `0 tokens`.
- **The chain connector `↓`** is `--fg-subtle` (4.5:1), not
  `--border-strong`: it says the row runs after the one above, which is
  content, not frame. It stays hidden from the accessible name (AR11
  already says "after" in words).
- **home-signal U1, the run folds at 1440 with the rail open: by design.**
  The run signal informs and asks nothing, so it folds first, before
  live, now and problems (the design system's fold order now names it).
  Dropped as a finding.
- **home-signal U2, a folded signal cannot be pressed: kept as is.** A
  signal may fold only when the row's own press reaches where its link
  goes. The run's link goes to Overview, where a recent run heads the
  page, and the row's chevron reaches it. "+N" stays text, its name lists
  what it holds. Dropped as a finding.

| # | Pablo can | Checked by |
|---|---|---|
| AR22 | tell several waits apart | a track waiting on two records: `waits on` reads `0002 (pablo) · 0003 (pablo)` |
| AR23 | read a failed report without alarm | the not-drawn state: no rule, no red, `--fg-muted` words |
| AR24 | hit every control | `.rr-card`, `.rr-more`, `.rt-fold` and the `waits on` links each at least 24 px high |
| AR25 | not read a missing measure as zero | a line with no ledger run reads `no tokens recorded` |
| AR26 | read a day-change row | a window over two days: `Tue 01:00` sits whole in the time column, with the column gap before the wave |

## Amendment 4 (aglaea, 2026-11-02): run report polish, four looks

From l64-ui's review of lf64-run-report-polish at 8eabfb4 (pass;
card ## UI review, shots `.wt-notes/l64-ui/`), findings 1-4.

- **1, a footer that goes nowhere looks it.** leftovers-64 Amendment 1
  gave it a name; this gives it a look. A pressable wave footer draws the
  wave in `--accent-fg`, as links do. One with no run record draws the
  wave in `--fg-muted` with a trailing `· no run record` in `--fg-subtle`
  on the line, not only in the name.
- **2, one-letter card links.** `.rr-card` takes `min-width: 24px`, text
  centred, so two neighbours never share a target (WCAG 2.5.8 on both
  sides; the design system now says so).
- **3, `Rounds as recorded`** is drawn as the app's folds (`.rr-more`):
  muted ▸ turning, 24 px, the native marker hidden, `<details>` kept.
- **4, the reader's landing.** The heading focus lands on draws no ring
  (the design system's Navigating rule, amended): it is a place, not a
  control; the drawer's scroll shows it.

| # | Pablo can | Checked by |
|---|---|---|
| AR27 | see which footer goes nowhere | shim launch: `sup2/1 · no run record` with the wave muted and the words on the line; sup1 in `--accent-fg` |
| AR28 | hit one card, not its neighbour | `.rr-card` `a`, `b`, `d`, `e` each at least 24×24 |
| AR29 | recognise a fold | `Rounds as recorded` shows the muted ▸ and 24 px of `.rr-more`, no native marker |
| AR30 | see the ring only where a key presses | the reader opened on a run record: no outline on the landed heading; Tab then rings the first control after it |

## Amendment 5 (aglaea, 2026-11-02): lf67 notes

- **Footer gap.** A pressable footer and a still one keep the same gap
  before the `·`; the button's padding adds no space (its target grows
  by negative margin or the line's own height, not by a wider gap).
- **AR30 after a real Tab** stands on the builder's keyed harness and
  vitest, as M7 did; a review that cannot send keys does not reopen it.

| # | Pablo can | Checked by |
|---|---|---|
| AR31 | read the footers as one list | a pressable and a still footer: the same gap before the `·` |

## Amendment 6 (aglaea, 2026-11-02): rings inside the waits line

From sup113 (`runs/2026-11-02-sup113-leftovers-69.md`): `.rt-waitline` is
`overflow: hidden` (it folds to one line), around the `.rr-card` buttons,
so their rings can be cut; not seen on screen. The design system's
clipping rule now names `overflow: hidden` too, and for a one-line cell
that cannot pad, the controls inside draw the ring inset
(`outline-offset: -2px`).

| # | Pablo can | Checked by |
|---|---|---|
| AR32 | see the ring whole in the waits line | focus on a `waits on` card link: the ring drawn inside its 24 px box, four sides whole |

## Amendment 7 (aglaea, 2026-11-02): an inset ring keeps its 4 px

From sup114 (`runs/2026-11-02-sup114-leftovers-70.md`, R1, Q1, Q2): the
inset ring on `.rt-waitline .rr-card` covers about 1.5 px of the slug's
first glyph, the card having no side padding.

- **R1**: `.rr-card` pads `padding-inline: var(--space-1)` (4 px); its
  `min-width: 24px` stays.
- **Q1**: yes, the 4 px applies to every inset ring, on the element that
  draws it, on the sides the ring crosses (design system, amended).
- **Q2**: the element's own radius; +2 only for an outset ring at a 2 px
  offset.
- **The count's gap** (U10's, also at `Home.tsx:79`, `:357` and
  `Overview.tsx:145`): one rule for all, `<title> · N`, drawn by one
  shared piece (design system, amended).

| # | Pablo can | Checked by |
|---|---|---|
| AR33 | read a focused slug whole | focus on a `waits on` card link: 4 px between the ring and the first and last glyph |
| AR34 | read every count the same way | Usage's Not accepted, Home's groups at those two places, Overview's at that place: equal gaps either side of the `·` |

## Amendment 8 (aglaea, 2026-11-02): padding, the comma, every count

From l71-ui at 1567309 (`working-on/lf71-count-look.md`, ## UI review,
F1-F3 and (d)).

- **F1**: AR33's 4 px is padding, as built; it leaves 2.5-3 px between
  the ring and the glyph, which is what the rule is for (no glyph
  covered). No 6 px: wider links fold the waits line sooner.
- **F2**: in a comma list (a track's `left`, `RunTracks.tsx:88`) the comma
  stays outside the link and is pulled in by the padding's width, so the
  text reads `a, b`; focused, the ring may touch the comma, never the
  name.
- **F3**: a disclosure label with a count is a title: `Sessions · 10`
  through the same shared piece.
- **(d)**: `Gates · 6` and the rail's `Roles · 4` take the form;
  `Exit 0/2` is a fraction (met of total), not a count, and stays.

| # | Pablo can | Checked by |
|---|---|---|
| AR33 (amended) | read a focused slug whole | focus on a `waits on` card link: 4 px padding each side, the ring touching no glyph |
| AR35 | read a list of links as text | a track's `left` with two cards: `a, b`, no space before the comma |
| AR36 | read every count one way | `Sessions · 10`, `Gates · 6`, `Roles · 4` with equal gaps around the `·`; `Exit 0/2` unchanged |

## Amendment 9 (aglaea, 2026-11-02): comma lists are text, names keep their case

From l72-ui at 27962f3 (`working-on/lf72-counts-commas.md`, ## UI review,
F1, F2, (c), (d)).

- **F1**: links in a comma list draw the **inset** ring, as
  `.rt-waitline` does, so the comma's pull never brings a neighbour under
  a ring. AR35's "never the name" means no name at all: neither the
  focused link's nor the next item's (`f (not cut)` included).
- **F2**: links in a comma list are inline text, under WCAG 2.5.8's
  inline exception: no 24 px minimum there, only the 4 px padding, so a
  one-letter slug reads `a, b`. AR28's minimum stays on the card links of
  the progress rows and the waits line, which are not sentences.
- **(c)**: the folded rail groups read `Asleep · 1`, `Archived · 1`; `(N)`
  is not a count form.
- **(d)**: yes. A group name is a name a person gave (a client's, often
  an acronym already in capitals); `.rail-group` stops uppercasing and
  shows it as written, at the label's size, weight and colour. Names
  written in capitals (`ACME`) stay so; `ccint` written lowercase reads
  `ccint`.

| # | Pablo can | Checked by |
|---|---|---|
| AR35 (amended) | read a list of links as text | a track's `left` with `a`, `f (not cut)`: `a, f (not cut)`, no space before the comma; focus on `a` draws its ring inside its box, touching neither name |
| AR37 | read every count one way | the rail's folded groups read `Asleep · 1`, `Archived · 1` |
| AR38 | read a group's name as he wrote it | a group named `Acme` reads `Acme` in the rail, not `ACME` |
