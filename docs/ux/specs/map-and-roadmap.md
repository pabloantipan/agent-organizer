# The map and the roadmap: one canvas, several lenses (aglaea, 2026-10-15)

A design note, not a spec yet. Pablo asked for ideas (thread
01M50Z4GK1ZBCD306HZ3PBK9F4, relayed by Hephaistos) after the 2026-10-15
ruling in agent-slack `docs/decisions.md`: each initiative keeps a base map
in `docs/architecture/` with stable snake_case node ids and a grounding
table; specs and decision records draw their change on that map. The
organizer FSE owns the build; this note is what I would build and what I
would cut. Seeds 1-4 are Hephaistos's; I keep, change or cut each below.

## The one idea

**The base map is the canvas, and everything else is a lens on it.** A
stage, a spec's "change on the map", a decision record's option, a node's
history: each one only recolours the same map, drawn once, in the same
layout. Nothing is laid out again when the lens changes.

That one rule is what keeps Pablo's place. If a node moves when he switches
from stage 3 to stage 4, or from the stage to its spec, he has to find it
again, and the picture explains nothing. Mermaid lays a diagram out anew
whenever its input changes, so the map is rendered **once** from the base
map (`mermaid2svg`, node ids kept as element ids) and a lens is only a set
of classes on those ids. Safari 15 can do that with plain CSS.

It also gives one visual grammar. The ruling already classes a spec's
diagram as added / changed / removed / context; the stage lens uses the same
four classes, so a spec's picture and its stage's picture read the same
way.

## Where it lives: a mode of Roadmap, not a seventh sub-view

`Stages | Map | Cards | Calendar` on the Roadmap switch (FR-20). Roadmap
already answers "where are we going", and the selected stage is shared
between Stages and Map: pick stage 4 on Stages, switch to Map, and Map
shows stage 4's slice. No new sub-view, no new badge.

## The one screen: "where are we and what is changing"

Map opens on the **current stage**, as Stages does (roadmap-as-a-plan:
opens on step 1, Current stage).

```
┌ Roadmap   Stages  [Map]  Cards  Calendar ─────────────────────────────┐
│ ◀ 3 Ledger  ·  [4 Payouts · current]  ·  5 Partners ▶     all stages  │
├────────────────────────────────────────────┬──────────────────────────┤
│                                            │ Stage 4 · Payouts        │
│   [api]━━━[payouts]┅┅[ledger]              │ changes 3 nodes, adds 1  │
│     │          ◆0021                       │                          │
│   [auth]     [statement]+                  │ Now                      │
│                                            │  w-payout-run · payouts  │
│   context nodes greyed                     │ Waiting                  │
│                                            │  0021 ◆ payouts · Rule   │
│  legend: added  changed  removed  context  │ Not touched yet          │
│                                            │  partner_api (touches:)  │
└────────────────────────────────────────────┴──────────────────────────┘
```

- **Left, the map**, the slice of the shown stage in the four classes;
  every other node greyed as context. Decision records that shaped the
  stage are pins (◆, the decision diamond of roadmap-as-a-plan, hollow when
  waiting, solid when ruled) on the node they concern.
- **Top, the stage stepper**, the scrubber made discrete: previous and next
  stage, and `all stages`. Stepping recolours, never relays out.
- **Right, what is changing, as text**: cards now on these nodes, records
  waiting, nodes the stage declares (`touches:`) that no card has reached
  yet. This list is also the map's text alternative.

## Moving between Roadmap, Map, a spec or a record without losing place

- **A spec or a record opens in a drawer over the map, never a new
  screen.** The map behind it takes the document's own lens: a spec shows
  its "change on the map"; a record with structural options shows one
  option at a time, with the options as tabs in the drawer, so comparing
  options is switching tabs on a map that does not move. Closing the
  drawer (Esc, ✕) restores the stage lens and focus returns to what opened
  it. This is the card-back pattern already in the app.
- **Selection survives every switch**: the shown stage and the selected
  node are part of the place, so Stages ↔ Map ↔ a drawer and back lands
  where Pablo was. `openInitiative(id, "roadmap", { mode, stage, node })`
  carries it, and a link to that place can be pasted to Pablo from odyssey.
- **Levels** (system context → containers → modules): a container node
  opens inside itself; a trail above the map (`camp › api › payouts`) walks
  back. One trail, never history stacks.

## The seeds

1. **Map as backdrop: keep, change the colours.** Amber is `--warning` in
   the design system ("look at this"), and a current stage is not a
   warning. Use the card status family the app already has: done nodes
   solid in `--fg-muted`, the current stage's nodes in the `now` purple,
   future stages dashed periwinkle (`next`). Shape says it too (solid /
   filled / dashed) and a legend says it in words, never colour alone.
   Red only where a card on that node is blocked. **The replay scrubber:
   cut.** Stepping stages shows the same growth, one stage per step,
   without an animation to watch or a time axis to invent.
2. **Click a node, see its history and future: keep.** The right panel
   swaps to the node: stages that changed it (done), the one changing it
   now, stages that declare it; under each, the cards and records. Newest
   first. Grounding paths at the bottom, so Pablo can see what the node is
   in code.
3. **Click a stage, see its slice with pins: keep, it is the default
   screen above.**
4. **Gaps: keep one, cut one.** A stage that touches no node, neither
   derived nor declared, is vague: report it as a roadmap problem, the same
   way `checkStages` reports a gate naming no record, so it shows where
   problems already show. **A node no stage touched in a long time: cut.**
   A stable module is not a defect; it would be a list of noise.

One more the data gives for free, for later (v1): a stage's **declared**
`touches:` against what its cards **really** changed (change-check). A node
changed but not declared, or declared but never reached, is drawn with a
dotted outline and listed. It is revmap's mismatch idea at stage scale.

## Accessibility

A diagram is not an interface. Each node is a button in a roving set in
reading order (left to right, top to bottom of the base layout), named
`payouts, changed in stage 4, 1 card now, 1 record waiting`. The right
panel is the full text equivalent of the map. Pins are buttons named
`Record 0021, waiting, on payouts`. Every class has a word in the legend.

## What to cut from v0

- The replay animation (seed 1).
- "Untouched for long" (seed 4).
- Declared-versus-real mismatches (v1, after change-check lands).
- Editing anything from the map. It is read-only, as the board is; `touches:`
  is written in roadmap.yaml through the FSE's roadmap records.
- Free pan and zoom past fit-to-width. The base map is curated to read at
  one size; a module level opens inside its container instead.

## Questions for Pablo

1. Map as a mode of Roadmap (my pick), or its own sub-view?
2. `touches:` on future stages: the FSE writes it in roadmap proposals
   (my pick), or Daedalus when he keeps the map current?
3. On odyssey, is the place link (initiative, stage, node) enough to share
   a view, or do you want a picture of the map lens in records and specs
   too?
