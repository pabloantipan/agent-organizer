# Progress over time, joined with the waves (aglaea, 2026-10-27)

status: proposed (exploration: options for a record, not cards)
owner: pablo
by: aglaea, for the FSE (thread 01M6022GYPSWMS5HTNC1Y5XJEA), from
Hephaistos's brief (thread 01M60222JWSNQZGSQ2NX5HP9NB)
rests on: Pablo 2026-10-27, "we need to explore how to use this kind of
charts for joining information time-advancement-chart + waves, visually in
Deltagos"; his rulings of 2026-10-27 (the user picks the window, one
computation, only the factory's environments, no sync, rebuild from disk
now, the 0042 facts ledger later); run-report.md with Amendments 1 and 2.

## The question

Chart 1 says **how much** passed review and **when**. The waves say **who**
built it and **at what cost**: WaveStrip in Work shows a wave's cards by
group, and run records hold each round's start, end, result and now its
`cause`. Joining them answers the morning question that neither answers
alone: *which wave moved the line, how many rounds it took, and why the
failed ones failed.*

## The data, all real

| what | source | fields |
|---|---|---|
| moves to done, grouped | `factory report --json` | `progress.lines[]`: `t`, `cards`, `commits`, `pct` |
| dead time | the same | `progress.dead[]` (pulse usage limit, memory outage) |
| the window | the same | `window.since`, `until`, `kind` |
| waves | `runs/*.md`, `docs/runs/*.md` (`model.Wave`) | `wave`, `supervisor`, `cards`, `launched`, `merged` |
| rounds | the same | `card`, `kind` (build, review, ui-review, take), `start`, `end`, `result`, `reviewer`, `reason`, and `cause` (0042: approach, execution, gate, environment, unclear) |
| card facts | 0042 fields (lf57-facts-fields) | `created`, `done`, `review_rounds` |
| cost | `runs.jsonl` | tokens and cost per session, by card |

Joining rule, the same in every option: **a progress line's card belongs
to the wave whose `cards` lists it**, and that wave's rounds for it are
the card's cost. A card in no wave is shown as `no wave`, never assigned
by guess.

## Option A: one timeline, chart 1 above the wave lanes

```
 Run 26 Oct 23:40 – 07:10            [Hours]           now ▸
            00:00      01:00      02:00   …   05:00      06:00      07:00
 Share   ▁▁▁▁▁▁▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▃▅▅▅▅▅▅▇▇▇▇▇▇▇▇█████  25 · 50 · 75 · 100%
         ┊          ╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱ usage limit ╱╱╱╱╱┊
 wave 1  ━build━ ▭rev✓    ━build━ ▭rev✕ execution ━build━ ▭rev✓ ◆ merged
 sup95   lf54-retire-guard ·  4 rounds · 1 failed
 wave 2      ━build━ ▭rev✓ ▭ui✓ ◆
 sup96       lf55-one-title · 3 rounds
 ┊ autonomous mode on                                            autonomous mode off ┊
```

- **What it draws**:
  - On the shared Timeline at Hours, a top band shows the share over time
    as a step area in the one series hue, with `pct` labels at each step,
    so chart 1 becomes one row.
  - Under it, one lane per wave that had a round in the window. Each round
    is a segment from `start` to `end`:
    - build is a solid bar in `--fg-subtle`;
    - a passed review is an outlined bar with ✓;
    - a failed review is a dashed bar with ✕ and its `cause` word;
    - a merge is a ◆.
  - Dead time is a hatched band across every lane. Mode on and off are the
    window's edges.
- **Pablo learns at a glance**: where the hours went (building, reviewing,
  stopped), which wave's merge made each step in the share, and where
  rounds failed and why, all on one axis.
- **Where it lives**: **Roadmap › History** (run-report §4). This *is* the
  activity history, made concrete: the lanes are its `Cards`, `Seats`,
  `Stops` lanes, organised by wave. The by-day event list under the axis
  stays its text equivalent.
- **Cost**: the most build work: Hours lanes, round segments and the step
  band. At 1024 a 7-hour night is about 450 px wide, so it fits without
  scrolling.

## Option B: chart 1's rows, each with its wave and its rounds

```
While you were away                                Window [Latest run 26 Oct 23:40 – 07:10 ▾]   Copy as text
12 cards passed review between 23:40 and 07:10.

          wave                                                           share
 23:40    ·      autonomous mode on
 00:52    1      ▇▇▇▇▇▇▇▇▇░░░░░░░░░░░░░░░░   3 cards  schema · loader · docs    25%
                 ▸ 7 rounds · 1 failed: execution · 41 min building · 52k tokens
 01:30    ·      ╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱╱   usage limit, every seat stopped · 1 h 58 min
 04:15    1 2    ▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇▇░░░░░░░░   2 cards  worker · retries         50%
                 ▸ 5 rounds · 2 failed: gate, execution
 …
 07:10    ·      autonomous mode off

 Waves in this window   wave 1 · sup95 · 7 cards · 14 rounds, 3 failed (execution 2, gate 1)
                        wave 2 · sup96 · 5 cards ·  8 rounds, 1 failed (approach 1)
```

- **What it draws**: run-report §3's rows unchanged, plus:
  - a narrow **wave column** before the bar, naming the wave or waves
    whose cards that row holds (`1`, `1 2`, `·` for mode and dead rows,
    `–` for `no wave`);
  - a **disclosure under each row** (`▸`, `aria-expanded`) with that row's
    cost: its rounds, how many failed and their causes in words, build
    time, and tokens;
  - a **footer**, `Waves in this window`, with one line per wave: its
    supervisor, cards, rounds, and failures by cause. Each wave links to
    its WaveStrip in Work.
- **Pablo learns at a glance**: the morning report he already reads, now
  answering "which wave, and at what cost" on the row where the jump
  happened. The causes in the footer show whether failures were
  execution, a weak gate, or the approach.
- **Where it lives**: **Overview's `While you were away`**, the lf57
  section. It adds a column, a disclosure and a footer, and needs no new
  view.
- **Cost**: small. The rows exist (lf57), and the waves and rounds are
  already scanned.
- **Copy as text**: unchanged (the factory report's text). The wave column
  and the rounds are the app's join, read from the run records, not
  numbers computed over the report's (run-report AR15 holds). If Pablo
  wants them in the text too, `factory report` adds a `waves` block.

## Option C: one row per wave, small multiples

```
 Waves, 26 Oct 23:40 – 07:10                              cards passed   rounds   failed by cause
 wave 1 · sup95  |━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━|◆         7 (58%)       14       ■■ execution  ■ gate
                  ↑    ↑  ↑✕     ↑        ↑✕  ↑
 wave 2 · sup96            |━━━━━━━━━━━━━━━━━━━|◆       5 (42%)        8       ■ approach
                            ↑  ↑     ↑✕   ↑
 share   ▁▁▃▃▃▃▃▃▃▃▃▃▃▃▃▃▅▅▅▅▅▇▇▇▇▇██████
```

- **What it draws**: per wave, a bar from `launched` to `merged`, its
  rounds as ticks (✕ marks a failure), its share of the window's passed
  cards, its round count, and its failures by cause as a count per word.
  Chart 1 sits under them as one compact share line on the same axis.
- **Pablo learns at a glance**: which waves were long or costly, and their
  failure mix. It compares waves well and tells a single morning's story
  poorly.
- **Where it lives**: Work's waves area, as an `Over time` switch beside
  the WaveStrips.
- **Cost**: medium. It is a third way to draw waves next to WaveStrip and
  the Roadmap Gantt.

## Pick

**B now, A as the History card later, and C folded into both.**

- B answers the morning question in the view Pablo already reads, at
  little cost, and it is lf57's section with one column, one disclosure
  and one footer added.
- A is the activity history (run-report §4) with a concrete shape: the
  later card, once the 0042 facts ledger gives seat starts, stops and
  merges as facts and not as reconstructions.
- C's best part, failures by cause per wave, is B's footer and A's lane
  headers. On its own, C would be a third way to draw waves.

## Rules every option keeps

- **The window is the one Pablo picked**, and every lane, row and count is
  for that window (ruling 2).
- **Causes are words** (`execution`, `gate`, `approach`, `environment`,
  `unclear`), never colour alone. Failed rounds are dashed with ✕, not red,
  because they are past; red stays for blocked now.
- **Dead time** is the hatched band of run-report §3 everywhere.
- **No invented time**: a round with no `end` draws to `now` while its wave
  runs, and as a dot once it does not. A card in no wave is `no wave`.
- **Only the factory's environments** (ruling 1): no option draws
  environment columns. Tracks stay chart 2's.
- **Each factory draws its own** (ruling 3): a remote initiative shows the
  run-report A1 line and no waves join.
- Every mark has a text name. A and C carry a table view: A's is History's
  event list, C's is the waves table.

## Questions for Pablo (with the FSE's pick beside mine in the record)

1. B now and A later (my pick), or A first, or C?
2. Should the wave join and rounds also go into `factory report`'s text
   (a `waves` block), so the FSE's pasted report carries them? My pick:
   yes, once B is built.
3. Cost on a row in tokens (my pick, after 0020: cards and waves show
   tokens, not dollars), or money?

## Acceptance (for whichever is picked; B's rows first)

| # | Pablo can | Checked by |
|---|---|---|
| PW1 | see which wave moved the line | every progress row whose cards belong to a wave names it in the wave column; a card in no wave reads `–` |
| PW2 | see what a jump cost | a row's disclosure lists its rounds, failures with cause words, build time and tokens, all from run records and runs.jsonl |
| PW3 | see why rounds failed | the footer counts failed rounds per wave by cause word; no cause recorded reads `unclear` only when the record says so, else `no cause given` |
| PW4 | go to the wave | a wave in the footer opens Work with that WaveStrip in view |
| PW5 | trust it is one window | changing the window changes rows, waves and counts together; nothing outside the window is counted |
| PW6 | (A) read the night on one axis | History at Hours: the share band, one lane per wave with round segments (build, ✓, ✕ cause), ◆ merges, the dead band across all lanes; the event list below matches |

## Amendment 1 (aglaea, 2026-11-01): what a finished wave's footer opens

From lf57-run-report (sup101, 2f7dccb) and leftovers-57 Amendment 3
(14bad79): PW4 sent every wave to Work's WaveStrip, but Work draws strips
for running waves only, and a report's waves are mostly finished, so the
press lands on Work with nothing in view. My gap: PW4 assumed every wave
has a strip.

- **A finished wave opens its run record** (`runs/*.md` or `docs/runs/*.md`,
  the file its `model.Wave` was read from) in the spec reader, the drawer
  over the current view (diagrams-in-app), so the report stays where the
  reader left it and Back returns to it. The record is where a finished
  wave's story lives: rounds, verdicts, causes, what merged.
- **A running wave keeps PW4**: Work, scrolled to its strip.
- **No strip for finished waves on Work.** Work is the board of what is
  open now; finished waves drawn there would be history in a now view, and
  their cards are mostly in Done. Finished waves get drawn on an axis in
  option A, the History card, not on Work.
- The link says where it goes, in its accessible name and hover:
  `open sup95's run record` or `show sup96 on Work`; the visible text
  stays the wave's name.
- A wave whose record the scan reported unread opens Needs me's unread
  row for that initiative, as any unread file does; never a dead press.

| # | The person can | Check |
|---|---|---|
| PW4 (amended) | go to the wave | a running wave's footer line opens Work with its WaveStrip in view; a finished wave's opens its run record in the reader drawer over the report, and Back (or Escape) returns to the report at the same scroll |
| PW7 | know where the press goes before pressing | each footer link's name reads `open <wave>'s run record` or `show <wave> on Work` by the wave's state |
