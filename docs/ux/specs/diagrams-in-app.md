# Diagrams and the spec reader in Deltagos (aglaea, 2026-10-15)

For the FSE's T11c (thread 01M510GR3VQKCZJVBHNMBSR200), after Hephaistos's
diagram rules landed in claudecode main (0da5ca7: `mermaid-flowcharts`
"Change classes", spec-craft step 5 `## Change on the map`,
`~/bin/diagram-check`). It follows the one-canvas idea in
`map-and-roadmap.md`, without the map yet. Whether to bundle mermaid or
pre-render it is measured in the build card; this spec assumes pre-render,
and §2 says what the screen does either way.

## 1. The four classes on the dark theme

**Map them to dark; no light "paper" panel.** A bright figure on the
#1a1523 ground is a white card in all but name, and "no white cards, no
light theme" is Pablo's pick (CLAUDE.md, visual direction). The skill's
light fills stay right for GitHub, an editor preview or a PDF. What stays
the same across both themes is the **glyph and the shape**; the hue may
differ.

| class | glyph | stroke | fill | label |
|---|---|---|---|---|
| `added` | ✚ | 2 px solid `--status-now` (lilac) | `--status-now-bg` | `--fg` |
| `changed` | ✎ | 2 px solid `--warning` (amber, as the skill's) | `--warning-bg` | `--fg` |
| `removed` | ✕ | 2 px dashed 5 3 `--fg-subtle` | none | `--fg-muted`, struck through |
| `context` | — | 1 px `--border-strong` | `--surface` | `--fg-subtle` |
| unclassed | — | 1 px `--border-strong` | `--surface-raised` | `--fg` |

- `removed` is not red: red is blocked's and errors' only, and a removal
  is neither. The dash, the strike-through and ✕ carry it.
- Amber for `changed` is "look here, nothing has stopped", the same
  meaning the design system gives it.
- Every stroke of a touched class must measure 3:1 or more on the figure's
  ground, and every label 4.5:1 (the build measures them; row D2).
- Edges: `--fg-subtle`; edge labels `--fg-muted`. The figure's background
  is transparent, and the panel behind it is `--surface`.

**Does the toolchain need to know?** Yes, once: a `dark` style in
`~/.mermaid` (`mermaid-config-dark.json` with mermaid's dark base and a
transparent background, and `mermaid-styles-dark.css`, which overrides the
four classes with the table above, written out as hex, since the SVG does
not read our tokens). Then `mermaid2svg <file> --style dark`. The source
keeps the skill's classDef lines unchanged, so the same block renders
light anywhere else. `diagram-check` checks ids, not colours, and needs
nothing. The style files are Hephaistos's to add; the FSE relays it.

## 2. Where the SVG lives, and what shows when it is not there

- **In the organizer's cache, never next to the source**:
  `~/.local/share/organizer/diagrams/<sha256 of the block's text>.svg`.
  It is a generated, per-machine, dark-only file; committing it would put
  a dark picture beside a light-rendering source in every repo and give it
  a way to go stale.
- **Stale cannot happen**: the key is the block's own text, so an edited
  block is a new key. Old files are pruned like session records (unused
  for 30 days).
- **Rendered on open, not on scan**: when a record or a spec with a
  mermaid block is shown, the service renders the missing keys through
  `mermaid2svg --style dark` and the figure swaps in when it is ready.
- **While it renders**: the block's source shows as code, with one line
  above it, `Drawing the diagram…`. No spinner.
- **When it cannot render** (mmdc missing, a syntax error, the render
  failed): the source stays as code, and the line becomes the reason, in
  the blocked-reason style: `Diagram not drawn: mmdc not found (npm
  install -g @mermaid-js/mermaid-cli)`, or mmdc's first error line. Never
  an empty box.
- **Every figure has a `Source` disclosure** (a button, `aria-expanded`)
  that shows the mermaid text under it.
- **A text equivalent under every change figure**, read from the block's
  class assignments: `Added: payments_svc. Changed: bff. Removed: none.`
  It is the screen reader's view of the figure, and it lets Pablo read the
  change on odyssey without parsing the picture. The figure itself is an
  `img` whose alt is its heading plus `diagram`, described by that line.
- **Wider than its column**: the figure scrolls inside its own frame, a
  scroll region named `<heading>, diagram` (tab-reaches-links A3); the
  page never scrolls sideways. No pan or zoom in v0.

The same figure is used wherever marked renders a record today
(DecisionsView, RuleDecisionBox, CardDrawer) and in the spec reader.

## 3. The spec reader

Specs open in the app, as records already do; the external editor stays
one press away.

- **Where it opens**: a drawer from the right, over the current view, the
  same drawer the map note uses for specs and records. Openers: each path
  in the initiative's `specs:` (header Details, and the Initiatives detail
  list, which today opens the editor), and a card back's `spec:` link.
  `spec:` paths with a `#section` land on that section.
- **What it shows**:
  - A header line: the path, `Open in editor` (secondary), and ✕.
  - **Contents**: the `##` headings as a jump list at the top, not sticky
    (a long spec has 10 to 20). `## Change on the map`, when present, is
    first in the list and marked with ✎, since it is the part Pablo looks
    at first; the body keeps the document's own order.
  - The body: rendered markdown at `min(72ch, 100%)` (as Help), figures
    allowed to the drawer's full width.
- **Links inside a spec**: another spec or a decision record opens in the
  same drawer, with `← Back` to the one before (a stack inside the drawer,
  cleared when it closes). A code path opens the editor. An outside link
  opens the browser.
- **Keeping place**: Esc or ✕ closes it and focus returns to the opener.
  The drawer keeps its scroll position per path while the app runs, so
  reopening a spec lands where it was left.
- **A path that does not exist**: the opener is still drawn, reading
  `missing`, and has no press (a never-acting item is not offered as a
  link); the scan's existing problem says why.

## Acceptance

| # | The lead can | Checked by |
|---|---|---|
| D1 | read a change figure on the dark theme | a record with the skill's example block shows a dark figure: ✚ lilac, ✎ amber, ✕ dashed and struck, context grey; no light panel |
| D2 | see every class | each touched class's stroke measures 3:1 or more on `--surface` and each label 4.5:1 |
| D3 | never face an empty box | with mmdc off the PATH, the block shows as code under `Diagram not drawn: mmdc not found …`; while rendering, `Drawing the diagram…` |
| D4 | trust it is current | edit one node in the block; the next open shows the new figure (new key), never the old one |
| D5 | read the change without the picture | under the figure, `Added: … Changed: … Removed: …` matches the classes in the block |
| D6 | read a spec in the app | a card's `spec:` link opens the drawer with Contents, `Change on the map` first and marked ✎, and its figure drawn |
| D7 | follow and come back | a link to a record inside the spec opens in the drawer; `← Back` returns to the spec at its scroll position; Esc returns focus to the card's `spec:` link |
| D8 | not scroll the page sideways | a figure wider than the drawer scrolls in its own frame, which is a Tab stop named `<heading>, diagram` |

## Amendment 1 (aglaea, 2026-10-15): the added glyph

➕ is a colour emoji with its own ink and nearly vanishes on the added fill.
The glyph is **✚ (U+271A)**: it is in the same Dingbats block as ✎ and ✕,
has no emoji presentation, and so takes the label colour and their weight.
Not `+` or `＋`, which read as text, not a mark. The skill's example
changes to match (Hephaistos's). D1 reads ✚.

## Amendment 2 (aglaea, 2026-10-16): from dg-reader's UI review

From `working-on/dg-reader.md`, ## UI review (pass at 6ef262a).

- **U2: the ✎ is said.** The glyph stays `aria-hidden`; the Contents entry
  carries a screen-reader-only suffix, so its name reads `Change on the
  map, start here`. That is what the mark tells a sighted reader: this
  entry is listed first, out of the document's order, because it is the
  one to read first.
- **U1: no change.** At 1024×640 with Details open, Specs sits below the
  fold of the header's own scroll region. That region is a named Tab stop
  that scrolls (tab-reaches-links A3), which is what it is for, and the
  spec reader has two other openers that are always in view where they
  matter: a card's `spec:` link and the Initiatives list. Moving Specs up
  the shared Charter would reorder Home's detail too; adding a second
  Specs opener in the header would say one fact twice. Revisit only if a
  session shows Pablo missing it.

| # | The lead can | Checked by |
|---|---|---|
| D9 | hear which entry to read first | the Contents entry for `Change on the map` has the accessible name `Change on the map, start here`; ✎ stays hidden from the reader |

## Amendment 3 (aglaea, 2026-10-16): from dg-render's UI review

From `working-on/done/dg-render.md`, ## UI review (A1-A3), merged b82ddf0.

- **A1: yes, that is the style.** The blocked-reason style is `sm`
  `--fg-muted` (design system, Disabled actions), the same look as the
  busy line. The two differ in their first words (`Drawing…` against
  `Diagram not drawn:`) and in what follows the second (a reason and a
  fix). No change.
- **A2: no 3:1 on context and unclassed outlines.** 1.4.11 asks 3:1 of the
  parts of a graphic needed to understand it. On this map a node is read
  by its label (context labels `--fg-subtle`, 5.3:1) and its links by
  their edges (`--fg-subtle`); the box outline only frames it. Context is
  recessive on purpose, so the change stands out. The outline must reach
  3:1 only where it carries meaning: the three touched classes (D2), and
  `removed`'s dash.
- **A3: hide the contents; the text line is the one text.** The figure is
  one `role="img"` with its alt, and its inner SVG text is `aria-hidden`.
  Otherwise a reader hears every label twice, the glyphs read as
  "pencil" and "heavy Greek cross", and the order follows the SVG's
  drawing order, not the map's. What the node labels gave is moved into
  the text line, which now uses labels (without glyphs) instead of ids
  and names the neighbourhood too:
  `Added: Payments. Changed: BFF. Removed: none. Around it: PWA.`
  A node with no label is named by its id.

| # | The lead can | Checked by |
|---|---|---|
| D5 (amended) | read the change without the picture | under the figure, `Added: … Changed: … Removed: … Around it: …` lists the labels of each class's nodes, none of them with a glyph |
| D10 | hear the figure once | the AX tree shows the figure as one image with its alt and no child text; the text line is read after it |

## Amendment 4 (aglaea, 2026-10-16): the name in one string

VoiceOver reads `Change on the map , start here`: a screen-reader-only
span joins as its own text run. The Contents entry takes the whole name as
one `aria-label`, `Change on the map, start here`, and the sr-only span
goes. D9 also checks that no space comes before the comma.
