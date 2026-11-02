---
title: "The organizer has its own C4 base map, every node grounded"
status: now
repos: [organizer]
branch: lf63-organizer-map
seat: lf63-build
stage:
updated: 2026-11-02
next: "review: lf63-organizer-map, C1-C3 and X0 pass, C4 and C5 pass only by an equivalent run (their literal commands fail in mermaid2svg and go run; question to sup107), ea0cc7c"
depends_on: [lf58-map-read]
boundary: ["docs/architecture/"]
spec: "docs/specs/leftovers-63.md (FR-1 to FR-3)"
gate: "docs/specs/leftovers-63.md#Acceptance → gate"
ui_review: false
autonomy: unattended
---

## Goal
Deltagos's Map shows the organizer itself, and atlax publishes its map with the slice.

## Gate
docs/specs/leftovers-63.md, rows C1-C5 and X0.

## Pre-answered
- Base: origin/main at the card's start (lf58-map-read merged, #24).
- Merge target: `main` through talos-lab's PR.
- Tests: no new test; the gate rows run the c4-map tools and lf58-map-read's existing TestMap.
- Tools at claudecode 762f865 or later: the root maps as one container `agent_organizer` (repo agent-organizer@<sha>); `--modules` needs the repo indexed in codebase-memory first (the seat's lean MCP server has `index_repository`).
- Tools: `~/claudecode/bin/c4-map`, `diagram-check`, `mermaid2svg` (claudecode main); mmdc under ~/.nvm.
- The method: claudecode `docs/specs/c4-base-map.md`; the README from `~/.claude/skills/spec-craft/templates/architecture-README.md`.
- Short-sample fallback: a node the adapters do not find and no evidence grounds is left out, never drawn ungrounded or invented; say which on the card.
- Data shape across states: c4-map/1 as the contract gives it.
- Evidence: command output under `.wt-notes/<seat>/`.
- Design questions (what to draw, what to merge or hide): the FSE, which asks the judge-architecture subagent while Pablo is away.
- Retention: n/a.

## Done
- 2026-11-02, lf63-build: the map at ea0cc7c (branch lf63-organizer-map, rebased on origin/main e4098ed, not pushed): L1 Pablo, deltagos and four externals; L2 one container `agent_organizer` (repo agent-organizer@<sha>) with four curated edges; L3 the 20 Go packages under `internal/`. Every node grounded; commands and output in `.wt-notes/lf63-build/progress.md`.

## Declared changes
- added `docs/architecture/c4.json`: c4-map/1 config, four externals, id lock, L2 edges, `modules.agent_organizer.root: internal`
- added `docs/architecture/context.md`: L1 flowchart, grounding and edge tables
- added `docs/architecture/README.md`: from the spec-craft template
- added `docs/architecture/containers.md`: generated L2
- added `docs/architecture/modules.md`: generated L3 for agent_organizer
- added `docs/architecture/map.json`: generated index
Risky:
- `map.json`: the container's sha is the parent commit; `c4-map check` on the committed tree says stale until gen runs (self-repo)
Not changed, on purpose:
- code, tests, testdata: docs only

## Left out
- macOS Keychain (`security`), git, osascript/Terminal/iTerm: local subprocess tools, off the map (FSE, 2026-11-02).
- `frontend/` at L3: the modules root is `internal/`; with the repo root, L3 drew docs, testdata, working-on and build as modules.

## Notes
- 2026-11-02, lf63-build: three tool gaps, asked sup107. (1) C4: `mermaid2svg <page.md> <out> --check` exits 1 for every page, since the function globs `<page>-*.svg` beside the page while mmdc writes beside `<out>`; the same pages on byte-identical copies render and check clean. (2) C5: `go run .wt-notes/sup107/c5` from the worktree is refused (outside the main module; internal package); run from the root checkout (same map.go) it prints `state=drawn levels=3`. (3) The repos adapter stamps HEAD, so a self-repo map is stale by one commit once committed. Also: diagram-check takes one file, not `docs/architecture/`; ran per page.
- 2026-11-01, sup105: parked; drafts at 9749dd9 (generated containers.md and map.json left untracked in the worktree, from the failed gen). `c4-map gen` runs its adapters once per `initiative.yaml` `repos:` entry; this root is its own repo (`repos: []`), so no container is found and `--modules organizer` exits 2 (`~/claudecode/bin/c4-map` run_adapters, container_repo). Ruled (A) by fse: Hephaistos fixes c4-map for a self-repo root. Drafts of `c4.json` and `context.md` are on branch `lf63-organizer-map` (worktree `.wt/lf63-organizer-map`, not pushed); a fresh builder continues from `.wt-notes/lf63-build/progress.md`. C5 runs `go run .wt-notes/sup105/c5 <root>` (spec d550a88). Prompts kept: `~/.local/share/organizer/prompts/organizer-lf63-build.md`, `organizer-lf63-review.tmpl.md`.
