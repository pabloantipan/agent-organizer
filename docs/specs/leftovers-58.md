# Leftovers 58: the C4 map lens in Roadmap: the build spec

status: proposed (0174)
by: the FSE, 2026-11-01, on main after PR #22
sources: 0170 (ruled by Pablo 2026-11-01, "roadmap mode"; its plan of three
cards); Aglaea's `docs/ux/specs/map-and-roadmap.md` Amendments 1 and 2
(4e02302, 57b5ef9), rows M1-M7; the contract agent-mailbox-specs
`contracts/c4-map/` (c4-map/1; at specs 54cf10d or later); Pablo's goal for
the autonomous window, "factory model built with the new stuff we created"
(relayed by Hephaistos 2026-11-01): the map lens is where the model is shown.

## Premises (read 2026-11-01)

| Premise | Shown by |
|---|---|
| `c4-map gen` writes `docs/architecture/map.json` (c4-map/1: `schema`, `initiative`, `system`, `inputs`, `levels[]` with `page` and `svg`, `nodes[]` with `id`, `label`, `level`, `kind`, `parent`, `status`, `grounding[]`, and `edges[]`) beside the level pages, each page holding one mermaid block | `contracts/c4-map/map.schema.json`, `expected.json`, `expected-containers.md` (one ```mermaid block) |
| an ungrounded node is one whose `grounding` is empty | `map.schema.json` line 49 |
| Deltagos already renders a mermaid block dark and caches it (`internal/diagram`, `App.RenderDiagram`), drawn today as an `<img>` | `internal/diagram/diagram.go:168-179`, `app.go:695-699`, `DiagramFigure.tsx` |
| Roadmap's switch is Stages, Cards, Calendar | `frontend/src/components/RoadmapView.tsx:31-42` |
| mermaid writes each node's element id as `flowchart-<id>-<n>` | Aglaea Amendment 1, "Rendering" |
| no sanitizer is a frontend dependency today | `frontend/package.json` |
| no initiative on this Mac has a `map.json` yet | `ls ~/*/docs/architecture/map.json`: none |

## Requirements

**lf58-map-read** (Go):
- **FR-1** `Service.Map(initiative)` reads `<root>/docs/architecture/map.json`
  and, per level, the first mermaid block of its `page` (only that block;
  the page is not otherwise parsed). It returns the index as given and each
  level's source, bound as `App.Map`.
- **FR-2** A `schema` other than `c4-map/1` returns no map and the line
  `Map not drawn: map.json is <schema>; this Deltagos reads c4-map/1`; a
  missing file returns the empty state; a file that is not JSON or a level
  whose page has no mermaid block returns `Map not drawn: <reason>`.
- **FR-3** A remote initiative (from another machine's snapshot) returns
  `Map not drawn: the map is read on <machine>`.

**lf58-map-render** (frontend):
- **FR-4** A level renders through `RenderDiagram` and is inlined as SVG,
  sanitized: no `script`, no `foreignObject`, no `on*` attribute, no
  external `href`; `aria-hidden`; one name, `<initiative> base map, <level>`.
- **FR-5** Each drawn node's element is found by its id
  (`flowchart-<id>-<n>`), its box read from the inlined SVG, and a real
  `<button>` laid over it, named `<label>, <kind>, <status>`; the buttons
  are one roving set in reading order and follow the figure's scale on
  resize. A lens is classes on the node elements; no node moves (M6, M7).

**lf58-map-lens** (frontend, UI review):
- **FR-6** Roadmap's switch gains **Map** (Stages, Map, Cards, Calendar),
  drawing L2 first; a container with modules opens L3, with a breadcrumb
  back; one without says `No module map for this container.`
- **FR-7** Status: `exists` plain; `ruled` dashed with `ruled <NNNN>`
  linking the record; `retiring` muted with the word. Ungrounded: dotted,
  `not grounded` in its name and panel.
- **FR-8** A node's panel (the right side, the map's text alternative)
  ends with Grounding, each entry a line: `repo <name>@<sha>` (mono, opens
  the editor at the repo), `deploy <path>` (opens the file), `record NNNN`
  (opens the record in the drawer), `curated: <page>` (opens the page in
  the spec reader); a merged node lists its members.
- **FR-9** No `map.json`: `No base map yet.` / `Daedalus makes one with
  c4-map gen; the FSE cuts the card.` FR-2 and FR-3's lines show as given.

## Acceptance → gate

Fixture: the contract's harbor map (`expected.json`, `expected-containers.md`,
`expected-modules.md`) copied into `testdata/fixture-map/harbor/docs/architecture/`
with a `working-on/initiative.yaml`, plus three variants beside it: one node
made `ruled` with a record, one with empty grounding, one `schema: c4-map/2`.
UI rows run in the review build (`make review-build` in the worktree, never
with auth: firebase), launched by its own path with the fixture home, read by
AX of the saved pid, shot with `screencapture -l` at 1440x900 and 1024x640.
No row drives Pablo's desktops, focus or input; the editor and file opens
are checked by the command the app would run (a stub), never a real editor.

| # | FR | Check | Expected (fails on main) |
|---|---|---|---|
| R1 | 1 | `go test -run TestMap` in the service package, over the fixture and over `$CONTRACTS_DIR/c4-map/expected.json` | the index equals the file; each level's source is its page's mermaid block |
| R2 | 2, 3 | go test: c4-map/2, missing, not JSON, a page with no block, a remote initiative | each line as FR-2 and FR-3 give it; no partial map |
| V1 | 4 | vitest of the sanitizer over an SVG carrying script, foreignObject, onload and an external href | all four removed; the figure name and aria-hidden set |
| V2 | 5 | vitest of the id-to-box mapping over the fixture's rendered L2 SVG (committed as test data) | every drawn node found once, boxes non-empty |
| M1 | 6 | review build, init harbor, Roadmap → Map | L2 drawn dark, no light panel; every node a button named `<label>, <kind>, <status>` |
| M2 | 7 | the ruled and retiring variant | dashed with `ruled NNNN` linking the record; `retiring` muted with the word |
| M3 | 8 | a node's panel | ends with Grounding, each entry's action run against the stub, logged |
| M4 | 7 | the ungrounded variant | dotted, `not grounded` in name and panel |
| M5 | 2, 9 | the c4-map/2 variant; an initiative with no map | `Map not drawn: …`; the empty state's two lines |
| M6 | 5 | switch level and back; resize the window frame by the app's own API, not by input | no node moves; buttons follow the scale |
| M7 | 5 | AX: Tab into the map, arrow through | one roving set in reading order, each a button, ring visible in the shot; the SVG has no focusable element and no script |
| X0 | all | `XDG_DATA_HOME=$(mktemp -d) CONTRACTS_DIR=<specs checkout>/contracts make test`, `wails build`, `make review-build` in the worktree, `git status --porcelain` | pass, empty |

## Boundary

- `lf58-map-read`: `internal/service/map.go` (new) and its test, `app.go`
  (the `Map` binding only), `frontend/wailsjs` (regenerated),
  `testdata/fixture-map/`, CLAUDE.md (one line under Layout).
- `lf58-map-render`: `frontend/src/lib/mapSvg.ts` (new: sanitize, id to
  box) and its test, `frontend/src/components/MapFigure.tsx` (new), a
  sanitizer dependency if one is needed (`frontend/package.json`, the lock
  file), and its test data.
- `lf58-map-lens`: `frontend/src/components/RoadmapView.tsx` (the switch),
  `MapView.tsx` and `MapPanel.tsx` (new), `frontend/src/styles/map.css`
  (new, tier-2 tokens only).

## Cards

| Card | Gate rows | Depends on | ui_review |
|---|---|---|---|
| `lf58-map-read` | R1, R2, X0 | — | false |
| `lf58-map-render` | V1, V2, X0 | — | false |
| `lf58-map-lens` | M1-M7, X0 | lf58-map-read, lf58-map-render | true |

Not in this spec (0170, "later"): the stage lens, record pins, `touches:`
on the map, and reading atlax's lifecycle and authored onto map nodes (no
mapping from atlax designations to c4 node ids exists yet; asked of
Hephaistos when this lands). The organizer's own `map.json` is Daedalus's
`c4-map gen` run, a separate card.
