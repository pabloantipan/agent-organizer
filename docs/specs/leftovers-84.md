# Leftovers 84: the map reader picks each level's own diagram on a shared page: the build spec

status: accepted (0197, ruled 2026-11-08)
by: the FSE, 2026-11-08, on main at c398f958
sources: l83-map's note on lf83-webview-map (sup125, branch at d0f6780a):
`modules.md` now holds two modules regions, and Deltagos's map reader
takes the first mermaid block of a page for every level, so the webview's
L3 would draw the Go modules. c4-map's markers (claudecode
`docs/specs/c4-base-map.md`, "Markers"): a page may hold several levels,
each between `<!-- c4-map:begin <level> -->` and `<!-- c4-map:end
<level> -->`, `<level>` being `containers` or `modules <container_id>`,
and each diagram's first line after `flowchart` is `%% c4: <level>`.

## Premises (read 2026-11-08 at c398f958, and lf83's branch at d0f6780a)

| Premise | Shown by |
|---|---|
| the reader takes the first mermaid block of a level's page, whatever the level | `internal/service/map.go:180-191`, `:196-215` (`firstMermaid`) |
| a modules level in `map.json` names its container; two modules levels share `modules.md` | `map.json` on lf83's branch, `levels[]` (`container: agent_organizer`, `container: deltagos_webview`); `map.go:50`, `:73` |
| `modules.md` on lf83's branch holds two regions, `modules agent_organizer` (lines 7-57) and `modules deltagos_webview` (61-81) | `git show d0f6780a:docs/architecture/modules.md` |
| CLAUDE.md's Map reader line says "the first ```mermaid block of its page" | CLAUDE.md, Layout, "Map reader" |

## Requirements

Card `lf84-map-region` (Go, one CLAUDE.md line; no UI change):
- **FR-1** For each level the reader takes the mermaid block inside that
  level's marker region on its page: `modules <container>` for a modules
  level with a container, `containers` for containers, `context` for
  context. A page with no marker region for the level falls back to its
  first mermaid block, as today, so every existing map reads the same.
- **FR-2** A marker region that holds no mermaid block, or a level whose
  region appears twice, is `Map not drawn: <page> has no mermaid block in
  its <level> region` or `… has two <level> regions`, never a partial map.
- **FR-3** CLAUDE.md's Map reader line says each level's block is the one
  inside its marker region, else the page's first.

## Acceptance → gate

| # | FR | Check | Expected (fails on main) |
|---|---|---|---|
| R1 | 1 | go test of `Service.Map` over a fixture whose modules page holds two regions (two containers) and whose index lists both modules levels | each level's source is its own region's block (main: both are the first) |
| R2 | 1 | the existing `TestMap` over the harbor fixtures and `$CONTRACTS_DIR/c4-map/expected.json` | unchanged, green |
| R3 | 2 | go test: a region with no block; a level whose region appears twice | each refused with its line; no levels returned |
| R4 | 3 | grep CLAUDE.md's Map reader line | names the marker region |
| X0 | all | `XDG_DATA_HOME=$(mktemp -d) CONTRACTS_DIR=<specs checkout>/contracts make test`, `wails build`, `git status --porcelain` | pass, empty |

## Boundary

`internal/service/map.go` (the block reader only) and its test;
`testdata/fixture-map/` (a new two-container variant); CLAUDE.md (the Map
reader line only).

## Cards

| Card | Gate rows | Depends on | ui_review |
|---|---|---|---|
| `lf84-map-region` | R1-R4, X0 | — (lf83 needs it to draw right; either may merge first) | false |

## Amendment 1 (FSE, 2026-11-08, on l84-rev's fail at 87bc0bd2)

A level's region opened by `<!-- c4-map:begin <level> -->` and not closed
by its `<!-- c4-map:end <level> -->` before the next `c4-map:begin` (or the
page's end) is refused, as FR-2's other cases are: `Map not drawn: <page>'s
<level> region is not closed`. It never reads another region's block. R3
adds that case.
