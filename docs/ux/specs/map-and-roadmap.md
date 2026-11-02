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

## Amendment 1 (aglaea, 2026-10-28): the map lens on the C4 base map

From Pablo, 2026-10-27 ("C4 are for being integrated to Deltagos and
Elenx, send fses"). Relayed by Hephaistos with the spec
`docs/specs/c4-base-map.md` (claudecode `origin/spec/c4-base-map`,
f3d2346): `bin/c4-map gen` writes `docs/architecture/containers.md`,
`modules.md` and one index, `map.json` (schema `c4-map/1`). Every node
carries a stable `snake_case` id and a grounding row (`node | level |
kind | status | evidence`). This note's lens draws on it. What follows is
my position on its two questions that touch Deltagos, and what the lens
takes from it.

- **Its Q3: Deltagos reads `map.json`, and does not parse the pages.**
  This is the factory report's rule: one computation, and the screen
  computes nothing. The pages are for people and for GitHub. The schema is
  versioned, so the lens refuses a version it does not know with one line
  (`Map not drawn: map.json is c4-map/2; this Deltagos reads c4-map/1`),
  never a half-drawn map.
- **Its Q1 (Pablo's ruling; my position): the base map draws what exists,
  plus `status`, with no change classes.** The one idea of this note is
  that the base map is the canvas and every change is a lens on it. A base
  map that draws a ruled target in added/changed classes bakes one lens
  into the canvas, and every other lens (a stage, a spec, a record's
  option) would then fight it. Status is drawn as a fact about the node,
  not as a change:
  - `exists`: plain;
  - `ruled`: a dashed outline and the record number under the label
    (`ruled 0012`, a link), the way planned work is dashed on the Timeline;
  - `retiring`: the label in `--fg-muted`, with the word `retiring`.

  A lens's classes draw over status. ✕ removed is dashed and struck, so
  `retiring` keeps its word to tell the two apart.
- **Rendering: the dark render, from the source.** The lens renders each
  map page's mermaid block through `mermaid2svg --style dark` into the
  per-machine cache (diagrams-in-app §2). It never shows the committed
  `*.md-N.svg`, which are light ("no white cards"). The generator must
  keep each node's id recoverable from its SVG element (mermaid writes
  `flowchart-<id>-<n>`). The lens reads that mapping and nothing else.
- **What the lens needs from `map.json` per node**: `id`, `label`,
  `level`, `kind`, `status`, `evidence[]`, the container it belongs to (for
  L3), the members of a merge, and whether diagram-check found it
  ungrounded. That is a request to the spec's FR-12, Hephaistos's.
- **The node panel** (seed 2) ends with **Grounding**: each evidence entry
  as a line.
  - `repo harbor-ledger@1a2b3c4` (mono) opens the editor at the repo.
  - `deploy <path>` opens the file.
  - `record 0012` opens the record in the drawer.
  - `curated: context.md` opens the page in the spec reader.

  A merged node lists its members, each with its own grounding. Hidden
  nodes are not drawn and not listed.
- **An ungrounded node is drawn as drift**: a dotted outline and the word
  `not grounded` in the panel and the node's name. This is the drift
  odyssey found, made visible in the one place Pablo looks. The rest of
  the map draws as usual.
- **Levels** follow the generator's: context (L1, hand-kept), containers
  (L2), and modules (L3, only for the containers `c4.json` asks for). A
  container without L3 opens nothing, and its panel says `No module map
  for this container.`
- **No map yet** (`docs/architecture/map.json` absent): Map is still on
  the Roadmap switch and shows the Empty state, `No base map yet.` / `Daedalus
  makes one with c4-map gen; the FSE cuts the card.` There is no action.
- **Elenx** gets the same lens, unchanged: the map is per initiative and
  the lens reads only that initiative's `map.json`.

| # | Pablo can | Checked by |
|---|---|---|
| M1 | read the base map | an initiative with the spec's fixture `map.json`: Map draws L2 in dark, no light panel, every node a button named `<label>, <kind>, <status>` |
| M2 | tell what is planned from what runs | a `ruled` node is dashed with `ruled 0012` linking the record; a `retiring` node reads `retiring` |
| M3 | see where a node lives in code | a node's panel ends with Grounding, each evidence entry a working link |
| M4 | spot drift | an ungrounded node is dotted and named `not grounded` |
| M5 | not be shown a half map | a `map.json` of an unknown schema shows `Map not drawn: …`; no file shows the empty state |
| M6 | keep his place | switching a lens (stage, spec) recolours the same layout; no node moves |

## Amendment 2 (aglaea, 2026-10-28): inline SVG, and where the buttons live

The FSE noted it for 0170: today's figures are `<img>` (diagrams-in-app),
and the lens must restyle node ids, so lf58-map-render inlines the SVG,
sanitized.

- **The SVG is the picture, never the controls.** It is inlined
  sanitized: no script, no `foreignObject`, no event attributes, and no
  external `href`. It is `aria-hidden`, as diagrams-in-app A3 has it, and
  a lens is only classes on its node elements.
- **Each node's button is a real `<button>`** in a layer laid over the
  figure, sized to the node's box as read from the inlined SVG. It is never
  a `role="button"` on an SVG group. The buttons form one roving set in
  reading order, with the names this note gives them (`payouts, changed
  in stage 4, …`). Focus draws the violet-11 ring on the button, which
  sits over the node's outline, so the ring has 3:1 against the map's
  ground.
- **The map's text alternative is the right panel** (as the note says),
  not a figure caption. The figure keeps one name: `<initiative> base map,
  <level>`.
- **Redraw on resize**: the button layer follows the figure's scale. A
  frame that cannot fit the figure scrolls in its own region (D8), and the
  buttons scroll with it.

| # | Pablo can | Checked by |
|---|---|---|
| M7 | reach every node by keyboard | Tab enters the node set once; arrows move in reading order; each stop is a `<button>` over its node with the ring visible; the SVG itself has no focusable element and no script |

## Amendment 3 (aglaea, 2026-11-02): a legible floor, a trail at Context, the word under a node

From l58-lens-ui's review of lf58-map-lens at 1123beb (pass;
`working-on/lf58-map-lens.md`, ## UI review, U2, U3, U6; shots under
`.wt-notes/l58-lens-ui/`).

- **U2, a floor on the scale.** The figure scales down to fit only while
  its smallest text draws at `--font-size-xs` (11 px) or more: the floor
  is 11 ÷ the smallest font size in the inlined SVG (0.6875 for 16 px
  labels). Past it the figure stays at the floor and its frame scrolls in
  its own region (D8, already in A2). This does not go against A2: "the
  button layer follows the figure's scale" means the buttons follow
  whatever scale is drawn, the floor included, and scroll with the figure.
  The frame's scrolling edges carry the design system's 1 px
  `--fg-subtle` lines.
- **U3, the trail at Context.** The trail is always drawn, one entry or
  many. At Context it reads `Context` (current) and, when a containers
  view was open before, a forward step to it: `Context › <system>
  containers`, the second a button that returns there. With none open
  before, `Context` alone. So the way back is never through the node.
- **U6, the word under a node stays a word.** The node's button is the
  one target per node (M7); a second target inside it would nest controls
  and fall under 24 px at the floor scale. The word is in the button's
  name (`harbor-api, ruled 0002, …`) and the press opens the panel, where
  `record 0002` is the link.
- **U1, U4, U5**, the reviewer's proposals taken: panel actions draw in
  `--accent-fg` as links do (the `button.linkish` inherit must not win
  over them); no scrollbar when the figure fits; the panel's list in the
  same reading order as the roving set.
- **M7 on screen.** The ring and the arrows were shown by the builder's
  harness with keys and by AX and vitest; that stands. The review method
  could not send keys, not a gap in the build.

| # | Pablo can | Checked by |
|---|---|---|
| M8 | read every label | at 1024×640, no text in the figure draws under 11 px; the frame scrolls in its region past the floor, the buttons over their nodes while it scrolls |
| M9 | go back from Context | after Containers → Context, the trail reads `Context › <system> containers` and its second entry returns to Containers |
| M10 | tell an action from a word | in the node panel, Grounding actions, list entries and `record 0002` draw in `--accent-fg`; the figure's `ruled 0002` is in its node button's name |
| M11 | read the same order twice | the panel's list and the arrow order go node for node in reading order |
