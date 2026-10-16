# Diagrams and the spec reader: Deltagos draws a spec's change on the map: the build spec

status: proposed (0140)
by: the FSE, 2026-10-15, on main at 425be25
sources: agent-slack `docs/decisions.md` 2026-10-15 "specs and decision
records explain themselves with diagrams on one base map" (Pablo: "As
complexity rises, diagrams is prefered for self explaining"), relayed in
thread 01M50YGJ (T11c, stage `review-map` exit 3, 0137); claudecode 0da5ca7
(`mermaid-flowcharts` "Change classes", spec-craft step 5 `## Change on the
map`); Aglaea's design `docs/ux/specs/diagrams-in-app.md` (6d51b8a, §1-§3,
D1-D8). Code read before writing: markdown rendered by `marked` in
`DecisionsView.tsx:600`, `CardDrawer.tsx:49`, `RoleDrawer.tsx:256`,
`RuleDecisionBox.tsx:427`, `HelpView.tsx:48`; specs listed and opened in the
editor (`Initiatives.tsx:58`); `mermaid2svg` is a shell function, so the app
calls `mmdc` itself with the style files in `~/.mermaid`.

## Problem and appetite

On odyssey Pablo reviews records and specs from prose; a mermaid block shows
as raw code, and a spec does not open in the app at all. Appetite: one wave,
two cards in order.

## Requirements

### Card `dg-render` (Go and frontend): a mermaid block becomes a dark figure

- **FR-1** A bound method renders one mermaid block to SVG the way
  `mermaid2svg --style dark` does (Hephaistos, mermaid-diagram-tool
  20dfbcc): it appends the four lines of `~/.mermaid/classdefs-dark.mmd` to
  the block (a later classDef of the same class wins; CSS cannot outrank
  mermaid's scoped classDef rules), then runs `mmdc -c
  ~/.mermaid/mermaid-config-dark.json -C ~/.mermaid/mermaid-styles-dark.css`.
  `mmdc` is looked up on the PATH, then `~/.nvm/versions/node/*/bin/mmdc`
  newest first. The SVG is cached at
  `~/.local/share/organizer/diagrams/<sha256>.svg`, the hash over the
  original block plus the three style files, so a style change re-renders.
  Rendered on open, never on scan. A cached file is returned without
  running `mmdc`. The source text is never changed.
- **FR-2** Wherever the app renders markdown with `marked` (the five places
  above), a fenced `mermaid` block draws as a figure from FR-1: while
  rendering, the source as code under `Drawing the diagram…`; when it
  cannot render, the source as code under `Diagram not drawn: <reason>`
  (`mmdc not found`, the dark style missing, or mmdc's first error line).
  Never an empty box.
- **FR-3** Every figure has a `Source` disclosure (the block as code) and,
  under it, one text line built from the block's `class` assignments:
  `Added: <ids>. Changed: <ids>. Removed: <ids>.` (`none` when empty;
  `context` not listed).
- **FR-4** A figure wider than its column scrolls in its own frame, a Tab
  stop named `<nearest heading>, diagram`; the page never scrolls sideways.
- **FR-5** `organizer doctor` reports `diagrams: mmdc <path>, dark style
  ok` or what is missing.

### Card `dg-reader` (frontend, one Go read): the spec reader

- **FR-6** A bound read returns a spec file's text by initiative and path
  (only paths the scan resolved under `specs:` or a card's `spec:`; anything
  else refused).
- **FR-7** The reader is the right drawer (diagrams-in-app §3): path, Open
  in editor, ✕; then Contents, the file's `##` headings, `Change on the
  map` first and marked ✎; then the body at min(72ch, 100%), figures full
  width (FR-2 to FR-4). It opens from the Specs list in the initiative's
  detail and header (instead of the editor), and from a card's `spec:`
  link (`#section` lands on that heading).
- **FR-8** A link in the reader to another spec or a decision record opens
  in the same drawer with `← Back`, which returns to the previous file at
  its scroll position; Esc closes and returns focus to the opener. A
  missing path reads `missing` and opens nothing.

## Acceptance → gate

| # | FR | Check | Expected (fails on main) |
|---|---|---|---|
| G1 | 1 | go test with a fake `mmdc` on the PATH (and one only under a fake `~/.nvm/versions/node/v*/bin`): render a block twice; change one node; change `classdefs-dark.mmd` | `mmdc` runs once for the first two, again for each change; the input it received ends with the four dark classDef lines; nvm's newest is found when the PATH has none |
| G2 | 1, 2 | go test and vitest: no `mmdc`; dark style missing; `mmdc` exits 1 with an error | the method returns the reason; the view shows the source under `Diagram not drawn: <reason>`, never an empty figure |
| D1 | 1, 2 | Tab harness at 1024×640 on lodestar (real `mmdc`, the dark style installed): a fixture record holding the skill's change-classes example | a figure, no light panel: ✚ lilac, ✎ amber, ✕ dashed and struck, context grey (shot) |
| D2 | 1 | the same: computed stroke and label colours per class against `--surface` | strokes ≥ 3:1, labels ≥ 4.5:1 |
| D5 | 3 | vitest: the text line for a block with added, changed and no removed | `Added: a, b. Changed: c. Removed: none.` |
| D8 | 4 | Tab harness: a figure wider than the drawer | its frame scrolls, page `scrollWidth` equals its width, the frame is a Tab stop with that name |
| D6 | 6, 7 | Tab harness, fixture: a card's `spec:` link with `#section` | the drawer opens on that heading; Contents lists `Change on the map` first with ✎ |
| D7 | 8 | Tab harness: a record link inside the spec, `← Back`, Esc | the record in the drawer; back at the same scroll; focus on the card's `spec:` link |
| G3 | 6 | go test: a path outside the resolved specs | refused, nothing read |
| X0 | all | `XDG_DATA_HOME=$(mktemp -d) make test`, `cd frontend && pnpm run build`, `wails build`, then `git status --porcelain` | pass, empty |

D1 and D2 use the `dark` style in `~/.mermaid` (landed, mermaid-diagram-tool
20dfbcc). On odyssey `mmdc` and `~/.mermaid` are installed by Pablo or its
Hephaistos (`npm install -g @mermaid-js/mermaid-cli`), not by this card.

## Boundary

- `dg-render`: a new `internal/diagram` (render, cache, the doctor check),
  `app.go` for one bound method, `wails generate module` output,
  `internal/cli` for `doctor`'s line, a frontend `lib/` helper (find blocks,
  the class line) and one figure component used by the five markdown
  places, `styles/` for the figure, the fixture record, their tests.
- `dg-reader`: `app.go` and `internal/service` for one bound read, the
  drawer component, `Initiatives.tsx` and the header's Specs, the card
  back's `spec:` link, their tests.
- Not: bundling mermaid in the frontend (the measurement below says
  whether a later card should), the `~/.mermaid` style files, editing any
  spec or record, `diagram-check`.

## No-gos

- No light panel, no red for `removed` (Pablo's visual direction). No
  network. No write outside the diagrams cache.

## Rabbit holes

- Bundling mermaid instead: measure it once in `dg-render`'s Notes (bundle
  size against today's, first render time, the Safari 15 floor), and stop
  there; the build is the pre-render.
- `mmdc` starts a headless browser: a slow first render is expected; the
  `Drawing the diagram…` state covers it.

## Cards

| Card | Gate rows | Depends on | ui_review |
|---|---|---|---|
| `dg-render` | G1, G2, D1, D2, D5, D8, X0 | — | true |
| `dg-reader` | D6, D7, G3, X0 | `dg-render` | true |
