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
| `added` | ➕ | 2 px solid `--status-now` (lilac) | `--status-now-bg` | `--fg` |
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
| D1 | read a change figure on the dark theme | a record with the skill's example block shows a dark figure: ➕ lilac, ✎ amber, ✕ dashed and struck, context grey; no light panel |
| D2 | see every class | each touched class's stroke measures 3:1 or more on `--surface` and each label 4.5:1 |
| D3 | never face an empty box | with mmdc off the PATH, the block shows as code under `Diagram not drawn: mmdc not found …`; while rendering, `Drawing the diagram…` |
| D4 | trust it is current | edit one node in the block; the next open shows the new figure (new key), never the old one |
| D5 | read the change without the picture | under the figure, `Added: … Changed: … Removed: …` matches the classes in the block |
| D6 | read a spec in the app | a card's `spec:` link opens the drawer with Contents, `Change on the map` first and marked ✎, and its figure drawn |
| D7 | follow and come back | a link to a record inside the spec opens in the drawer; `← Back` returns to the spec at its scroll position; Esc returns focus to the card's `spec:` link |
| D8 | not scroll the page sideways | a figure wider than the drawer scrolls in its own frame, which is a Tab stop named `<heading>, diagram` |
