# Leftovers 63: the organizer's own C4 base map: the build spec

status: proposed (0176)
by: the FSE, 2026-11-01
sources: Pablo's goal for the autonomous window, "factory model built with
the new stuff we created" (relayed by Hephaistos 2026-11-01); claudecode
`docs/specs/c4-base-map.md` (c4-map/1: the layout, `c4.json`, the grounding
table, markers); 0174 (the map lens reads `docs/architecture/map.json`);
Aglaea's map-and-roadmap Amendment 1 ("No base map yet … Daedalus makes one
with c4-map gen; the FSE cuts the card").

## Premises (read 2026-11-01)

| Premise | Shown by |
|---|---|
| the organizer has no `docs/architecture/` map; the lens (lf58) shows "No base map yet" for it | `ls docs/architecture/` |
| `c4-map gen <root>` writes `containers.md`, `modules.md` and `map.json` from a hand-kept `c4.json` and `context.md`, running adapters (`repos`, `manifests`) over the repos in `initiative.yaml` | c4-base-map.md, "The layout" and FR-12 |
| the organizer is one repo (agent-organizer): the Wails app and the `organizer` CLI in one binary, reading the discuss mailbox (agent-mailbox-api) over a unix socket, posting to the record (agent-mailbox-record), Firestore when `auth: firebase`, and calling `factory`, `probe` and `zellij` | CLAUDE.md; `atlax/elements/` (consumes: lines) |

## Requirements

Card `lf63-organizer-map` (docs only):
- **FR-1** `docs/architecture/c4.json` (c4-map/1), `context.md` (L1: Pablo,
  the organizer system, and its externals: the discuss mailbox, the record,
  Firestore, the factory's tools) with its grounding table, and the
  README from the spec-craft template.
- **FR-2** `c4-map gen` writes `containers.md`, `map.json`, and
  `modules.md` for the app container (`--modules`), and `mermaid2svg
  --check` renders the pages.
- **FR-3** Every drawn node is grounded: containers by `repo
  agent-organizer@<sha>`, externals by `curated: context.md` or `external`
  with the atlax designation they are read through
  (`ext:agent-mailbox-api#…`), people by `curated`. No ruled or retiring node
  is invented.

## Acceptance → gate

| # | FR | Check | Expected (fails on main) |
|---|---|---|---|
| C1 | 1, 2 | `c4-map gen .` then `c4-map check .` at the root | exit 0 both; `docs/architecture/map.json` is `c4-map/1` |
| C2 | 1 | `map.json` against `contracts/c4-map/map.schema.json` (specs checkout) | valid |
| C3 | 3 | `diagram-check` over `docs/architecture/` | no `ungrounded:` line |
| C4 | 2 | `mermaid2svg <page> --check` per page | exit 0 |
| C5 | 2 | lf58-map-read's reader (`service.ReadMap`) on the organizer root, through a program kept outside the tree (`.wt-notes/<seat>/c5`), and the existing `TestMap` | state drawn, no "Map not drawn" (main: empty); TestMap green |
| X0 | all | `git status --porcelain` outside `docs/architecture/` | empty |

## Boundary

`docs/architecture/` only.

## Cards

| Card | Gate rows | Depends on | ui_review |
|---|---|---|---|
| `lf63-organizer-map` | C1-C5, X0 | lf58-map-read (merged #24) | false |
