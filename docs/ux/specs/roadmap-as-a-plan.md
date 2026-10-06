# The Roadmap as a plan

status: proposed
owner: pablo
by: aglaea, 2026-10-06, for the FSE (thread 01M48N0AYS5SC7N243336DDARW)
rulings it rests on: 0093 (scope, Pablo's words); 0094 (proposed: a stage
for the work outside any stage); 0070, 0071, 0073 (time zoom; Hours only
where a mark has a time); 0022 (no invented dates); the design system
(Timeline, Stage stepper, Widths, layers, dates as words)

Looked at: 0093, `working-on/roadmap.yaml`, the run records'
"Rounds" prose (e.g. `runs/2026-10-06-floating-icon-2.md`), and Roadmap ›
Stages as built (`StageRoadmap.tsx` over `TimeZoom`, seen in the UI reviews'
shots). From those, not from a run today.

## The problem, in the lead's terms

Pablo, 2026-10-06: "I see the road map stage as a block of text. I'd like
to see this a bit more like Microsoft Project, with lines about waves,
iterations, and decisitions. It should allow to chose to show current view
or with progresively more data" (`said`). Today each stage is a label of
title, dates and appetite beside one bar. The work that moved a stage (the
waves, their rounds, the cards, the rulings) is not on it.

## The shape: an outline over the axis

One graph, as Project draws one: an **outline** in the label column (rows
indented by level, each with a disclosure) beside the **shared time axis**
(`TimeZoom`, with its levels, Today, edge pointers, sticky axis). One row,
one thing. The label column stays 240 px (design system, Timeline); depth
is shown by indentation, 12 px per level, so at most 36 px.

| Level | Row | Label column | Lane |
|---|---|---|---|
| 0 | **Stage** | chevron, `5`, title, state word (`done 28 Sep`, `now`, `planned · one wave`) | a **summary bar** with end caps (Project's bracket): done in `--status-done`, now in `--status-now` to today, planned as the undated slots as built. Decision diamonds sit on this row (below) |
| 0, sub-rows | **Exit item** (level 1 of the switch only) | a check or an empty box, the item's words, cut with ellipsis | a small check mark at the date it was met; nothing when open |
| 1 | **Wave** | chevron, the task's title, `sup45` in mono, result word (`merged`, `in flight`, `stopped`) | a bar from first launch to merge or stop, in the accent tone; in flight it runs to now and fades, as open card bars do |
| 2 | **Rounds** | `Rounds · 3, 1 failed` | **one row per wave**, the rounds as adjacent segments (below) |
| 2 | **Card** | the card's title, its status lozenge | the card's bar by the Cards rules (start, due, git span) |

Rows: a stage is 32 px, everything under it 28 px. Within a wave the rounds
row comes first, then its cards in the order they were launched. A card
built in two waves shows under each.

### Rounds: one row of segments

Rounds last minutes, so one row per round would be 28 px of nothing at most
zooms. Each wave gets **one Rounds row**, and each round is a segment from
its start to its end, with a 1 px gap between segments.

| Round result | Segment | Word (inside when it fits, else in the hover) |
|---|---|---|
| built | `--fg-subtle` fill | `built` |
| review pass | the accent tone | `pass` |
| **review fail** | `--surface` fill, a 1.5 px magenta outline, and a `✕` at its end | `fail · <what failed>` (`fail · gate row 2`) |
| Pablo's take | periwinkle (`--status-next`) | `take` |
| in flight | the round's colour, running to now, fading | `building`, `in review` |

A failed round is the one that must stand out, so it is the only outline
and the only mark. Magenta is the caution tone; red stays blocked's alone.
The word is never left to colour (principle 4). The hover lists the round
whole: number, times, result, reviewer, and the reason's first line.

Where the segments are narrower than 4 px (at Fit and Days, since rounds
are minutes), the row draws one merged segment for the wave's span, with the
count after it in text (`3 rounds · 1 fail`). The fail count is in magenta
and the `✕` stays. Zooming to Hours draws the segments.

### Decisions: diamonds on the stage row

From level 2 on, each decision record that gates a stage or joins it
(`stage:`) is drawn **on the stage's own row**, never as a row of its own:

- a hollow fuchsia diamond at `raised`;
- once ruled, a solid indigo diamond at `ruled`, joined to the raised one by
  a 1 px line in `--decision-ruled`;
- while waiting, the line runs dashed from raised to today.

Diamonds on the same day stagger 4 px; past three, a `+N` rides the third
(design system, Timeline). Each diamond is a button named `0071 Accept the
time-zoom spec, ruled 3 Oct by pablo`; pressing it opens the record on
Decisions (`openDecision`). Hover is the same text.

## The detail switch

Four steps, cumulative, each one adding to the last (0093):

| Step | Words on the switch | Shows |
|---|---|---|
| 1 (default) | `Current stage` | the current stage's row and its exit items as sub-rows, met or open. Other stages are not drawn. The axis fits the current stage's span |
| 2 | `All stages` | every stage row, with the decision diamonds; no sub-rows |
| 3 | `+ Waves` | under each stage, its waves |
| 4 | `+ Rounds and cards` | under each wave, its Rounds row and its cards |

- **Place**: a segmented control on Roadmap's toolbar line, after the
  Stages | Cards | Calendar switch, and before the zoom control at the
  right. It shows on Stages only. Its group is named `Detail`.
- **Opens on step 1** each time the Roadmap opens (0093: "it opens on
  1"). The step is not remembered, any more than the zoom level is.
- **Local disclosure**: any stage or wave row's chevron opens that row one
  step deeper than the switch, as Project does. Changing the switch resets
  them.
- **Zoom is independent**: the step never changes the zoom level, and the
  zoom never changes the step. Stages offers **Hours** as soon as a wave
  or round with a time is drawn (0070's rule: Hours where a mark has a
  time). Today that means steps 3 and 4.
- **Double-click a wave's bar**: zooms to fit that wave (Hours or Days,
  whichever holds it), anchored on it, as double-click on the axis zooms.
- **Keyboard**: the switch is a radio group (arrows move, the step applies
  at once). In the outline, ↑↓ move between rows, → opens and ← closes a
  row, and Enter on a card opens its card back.

## States

| State | What shows |
|---|---|
| no roadmap | as built: the line pointing to `working-on/roadmap.yaml`. No switch. If waves exist, the "Outside any stage" row below is the only row |
| roadmap, no waves recorded yet | steps 3 and 4 show under each stage one muted row: `No waves recorded yet` |
| a stage with no waves | at step 3, the muted row `No waves in this stage` |
| a wave with no round data (older runs, prose only) | the Rounds row reads `rounds not recorded` and draws nothing |
| a wave in flight | its bar and its current round run to now; the result word is `in flight` |
| a stage with no cards | at step 4, the muted row `No cards` under its waves |
| **work outside any stage** (0094 not accepted) | a last row at stage level, `Outside any stage`, with no number, a dashed summary bracket and `--fg-subtle` text. It holds those waves and cards at steps 3 and 4; at steps 1 and 2 it shows one muted row, `Outside any stage · 23 cards`. If 0094 is accepted, it is simply the new stage |
| the current stage has no exit items | step 1 shows its row and `No exit items written`, muted |
| a done stage at step 1 | not drawn: step 1 is the current stage only |
| the zoom window holds none of a row's marks | the edge pointers as built (`‹ 12 Sep`) |
| narrow window (1024×640, either rail state) | the label column stays 240, and titles cut with an ellipsis, whole in the hover. If the toolbar line cannot hold the three groups, the Detail switch wraps under the Stages switch, never into a menu. The switch's words shorten to `Current`, `All`, `+ Waves`, `+ Rounds` |
| reduced motion | nothing animates; in-flight bars do not fade-pulse |

## What it does not change

Cards and Calendar; the zoom levels and their rules (0070, 0071, 0073); the
stage's undated slots; Home's stepper and the header's strip, which keep
their own stage words.

## Acceptance, in the lead's terms

| # | The lead can | Checked by |
|---|---|---|
| P1 | open the Roadmap on where he is | Stages opens at `Current stage`: one stage row, its exit items met or open, the axis on its span |
| P2 | add detail one step at a time and get back | each step adds exactly the rows in the table; back to 1 restores it; the zoom level does not move |
| P3 | see when each decision was raised and ruled | at step 2, a record raised 1 Oct and ruled 3 Oct draws a hollow diamond on 1 Oct, a solid one on 3 Oct and the line between; a waiting one runs dashed to today; pressing a diamond lands on the record |
| P4 | see the waves that built a stage | at step 3, each wave is a row with its title, supervisor and result, and a bar from launch to merge |
| P5 | spot a failed round at any zoom | at step 4, at Fit, the wave's Rounds row reads `3 rounds · 1 fail` with the `✕`; at Hours, the failed segment is outlined in magenta and says `fail · gate row 2` |
| P6 | find the work outside any stage | with 0094 not accepted, the `Outside any stage` row is last, with its count at steps 1 and 2 and its waves at 3 |
| P7 | use it at 1024×640 with the rail expanded and as the strip | no horizontal page scroll; titles cut with an ellipsis; the switch wraps under the Stages switch |
| P8 | drive it by keyboard | radio-group arrows on the switch; ↑↓ ← → Enter in the outline; diamonds are buttons with their record in the name |

## Open questions

- **O1** (FSE, with Hephaistos): the data. Each run record needs, per wave,
  the supervisor, task title, cards, launch and merge times, and per round
  the start and end times, kind (built, review, take), result, reviewer and
  a one-line reason. Without times, no segments: the wave draws as a dot
  on its day, by 0022.
- **O2** (FSE): which stage a wave belongs to. Its cards' `stage:`, else
  0094's stage, else outside. A wave whose cards sit in two stages appears
  under each, with a `· also in <stage>` meta.

## Technical notes

(left for the FSE)
