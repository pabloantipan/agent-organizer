# Leftovers 83: the React app on the organizer's own map: the build spec

status: proposed (0196)
by: the FSE, 2026-11-08, on main at 91a28388
sources: the FSE queue since 2026-11-01 ("the React app on the organizer's
map, a --modules for frontend", unblocked by Hephaistos's
c4-map-stamp-grounded, claudecode a5778f3); a judgement by AI agent
Daedalus (judge-architecture, 2026-11-08, quoted in 0196): option A, a
second L2 container for the webview made by an adapter kept in this repo,
its L3 from `frontend/src`, a curated edge to `agent_organizer`; no c4-map
change. 0176 accepted the first map; leftovers-63, -66 and -76 kept it.

## Premises (read 2026-11-08 at 91a28388)

| Premise | Shown by |
|---|---|
| the map has one container, `agent_organizer`, whose L3 is the Go packages under `internal/`; the React app is not on it | `docs/architecture/c4.json` (`modules.agent_organizer.root = "internal"`), `modules.md` |
| c4.json cannot declare a container: containers come only from adapter facts; `externals` are always kind external | `~/claudecode/bin/c4-map:427-451` (`build_containers`) |
| an adapter may live in the initiative: `adapters[].path` is joined to the root and must be executable; a container fact carries `repo`, `name`, `tech` and `evidence` | `~/claudecode/bin/c4-map:285-293`, `:330-339`; `~/claudecode/docs/specs/c4-base-map.md` (c4.json block, about line 157); the spec's fixture adapter `c4-adapter-fakedeploy` |
| a container's repo is the first part of its `repo` evidence (split at `@` or `/`), so `agent-organizer/frontend` resolves to this repo; `--modules` makes one module per top-level folder under `modules.<id>.root` | `~/claudecode/bin/c4-map:576-578`, `:602` |
| `frontend/src` holds components, hooks, lib, stores and styles (plus App.tsx, main.tsx) | `ls frontend/src` |
| the adapter contract: `--root <root> --repo <dir>`, `$C4_REPO_DIR` for a self repo, exit 3 when not applicable, 2 on bad usage | `~/claudecode/bin/c4-adapter-repos:4-26` |
| codebase-memory has no index of this repo's root today (only a removed lf63 worktree), and `--modules` needs one | `codebase-memory list_projects` (2026-11-08) |

## Requirements

Card `lf83-webview-map` (docs and one adapter script; no app code):
- **FR-1** `scripts/c4-adapter-webview` (executable, no dependencies
  beyond the system's python3 or sh) prints one container fact for
  `--repo agent-organizer` when `$C4_REPO_DIR/frontend` exists:
  `{"fact":"container","repo":"agent-organizer","name":"deltagos-webview","tech":"React in WKWebView","evidence":{"kind":"repo","ref":"agent-organizer/frontend"}}`,
  exit 0; exit 3 for any other `--repo` or when `frontend/` is missing;
  exit 2 on bad usage.
- **FR-2** `docs/architecture/c4.json` lists the adapter
  (`{"name":"webview","path":"scripts/c4-adapter-webview"}`), the edge
  `deltagos_webview` → `agent_organizer` (evidence `repo
  agent-organizer/frontend/wailsjs`, why: calls the Wails-bound App
  methods), and `modules.deltagos_webview.root = "frontend/src"`. The `ids`
  lock is written by `gen`, never by hand.
- **FR-3** `c4-map gen .`, `c4-map gen . --modules agent_organizer` and
  `c4-map gen . --modules deltagos_webview` regenerate the map; L2 shows two
  containers joined by the edge; `modules.md` has both containers' regions;
  `c4-map check .` is clean. `frontend/wailsjs` is outside `frontend/src`
  and shows only as the edge's evidence.

## Acceptance → gate

The repo is indexed in codebase-memory at the card's root before any
`--modules` run (`index_repository`), and that is said in the card.

| # | FR | Check | Expected (fails on main) |
|---|---|---|---|
| C1 | 1 | run the adapter with `--root . --repo agent-organizer` and C4_REPO_DIR set to the root; then with `--repo other`; then with no arguments | the one fact line, exit 0; exit 3; exit 2 (main: no adapter) |
| C2 | 2, 3 | `c4-map gen .` then `c4-map check .`; `map.json` read with jq | exit 0 both; nodes agent_organizer and deltagos_webview, each kind container, the webview grounded `repo agent-organizer/frontend@<sha>`; one edge between them with its why (main: one container) |
| C3 | 3 | both `--modules` runs, then `c4-map check .`; the modules page | exit 0; the webview's region lists components, hooks, lib, stores, styles; the Go region still lists internal's packages |
| C4 | 3 | `diagram-check` run per page with `--map` (never over the folder: leftovers-76 lesson) | exit 0 each, no `ungrounded:` line |
| C5 | 3 | `mermaid2svg <copy> --check` on byte-identical copies of each page (leftovers-63 Amendment 1) | exit 0 |
| X0 | all | `git status --porcelain` outside `docs/architecture/` and the adapter | empty |

## Boundary

`docs/architecture/` and `scripts/c4-adapter-webview` (new). Nothing
under `frontend/`, `internal/` or the factory's tools.

## Cards

| Card | Gate rows | Depends on | ui_review |
|---|---|---|---|
| `lf83-webview-map` | C1-C5, X0 | lf76-map-regen (merged #70) | false |
