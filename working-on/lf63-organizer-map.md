---
title: "The organizer has its own C4 base map, every node grounded"
status: now
repos: [organizer]
branch: lf63-organizer-map
seat: lf63-build
stage:
updated: 2026-11-02
next: "PR with talos-lab (branch lf63-organizer-map pushed at ea0cc7c); review findings placed with the fse by sup107"
review: pass
reviewer: lf63-review
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

## Review
- Verdict: **pass**. Unmet gate items: none. Reviewer lf63-review, 2026-11-02, at ea0cc7c (branch did not move), clean clone with origin = GitHub, tools sup107/cc 11d0b95.
- change-check `organizer lf63-organizer-map --base origin/main`: base 049075e3f, head ea0cc7c1b, 6 files, 0 flags (outside boundary 0, undeclared 0, declared not changed 0). Nothing to explain.
- C1: `c4-map check .` on the committed tree: `stale: containers.md containers`, exit 1 (self-repo stamp). `gen . --modules agent_organizer` (after indexing the clone in codebase-memory) exit 0; its only diff is the sha stamp baf596f → ea0cc7c in containers.md (1 line) and map.json (2 lines); modules.md, context.md, c4.json byte-identical. `check .` after: clean, exit 0. map.json schema `c4-map/1`.
- C2: committed map.json valid against specs d20fa85 `contracts/c4-map/map.schema.json` (jsonschema, draft 2020-12; 31 nodes).
- C3: diagram-check per page with `--map docs/architecture`: 0 `ungrounded:` lines; `invented:` only for each page's own nodes (pablo; the 20 modules), the known tool behaviour.
- C4: byte-identical copies (cmp) under .wt-notes/lf63-review/c4: `mermaid2svg <page> --check` exit 0 for context (6 nodes), containers (5), modules (20), no overlaps.
- C5: `cmp internal/service/map.go` root vs clone identical; `go run ./.wt-notes/sup107/c5 <clone>` → `state=drawn refused="" levels=3`, exit 0. `test-lease run -- go test ./internal/service -run TestMap -count=1`: ok (TestMapFixture, Variants, Refuses, Remote pass; TestMapContract skips without CONTRACTS_DIR).
- X0: `git status --porcelain` empty after restore; `git diff --name-only origin/main...ea0cc7c` all under docs/architecture/ (6 files).
- FR-3 grounding: container `repo agent-organizer@baf596f` is a real commit (the branch's parent); all 12 `ext:` designations appear in `atlax/artifacts/agent-organizer/elements/` consumes lines, none invented; record 0176 exists; the 20 modules are exactly `ls internal/`. Firebase grounded by the code's hosts (firestore, identitytoolkit, securetoken.googleapis.com). FR-1: context names Pablo, the organizer, mailbox, record, Firebase, the factory's tools.
- Left out, checked: `security`, git, osascript/open/x-terminal-emulator, launchctl are exec'd locally (grep exec.Command); off the map per the FSE, no adapter finds them. frontend/ out of L3 by `modules.root: internal`: right for Go packages, but L3 then omits the React app (Note).
- Note: the committed map is always one commit stale (`check` exit 1 on main after merge too, until someone regenerates); C1 as written (gen then check) cannot see it. Gate gap: a row should run `check` on the committed tree, or the repos adapter should stamp the tree, not HEAD. → next.
- Note: C4 and C5 literal commands fail in the tools (mermaid2svg with an output path; go run from another module); the equivalent runs prove the same. → next.
- Note: map.json `levels[].svg` names `<page>.md-1.svg` files that are not committed; the lens reads the mermaid block, so nothing breaks today.
