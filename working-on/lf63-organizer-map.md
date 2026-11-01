---
title: "The organizer has its own C4 base map, every node grounded"
status: blocked
repos: [organizer]
branch: lf63-organizer-map
seat: lf63-build
stage:
updated: 2026-11-01
next: "waits on Hephaistos's c4-map self-repo fix (asked 2026-11-01)"
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
- Tools: `~/claudecode/bin/c4-map`, `diagram-check`, `mermaid2svg` (claudecode main); mmdc under ~/.nvm.
- The method: claudecode `docs/specs/c4-base-map.md`; the README from `~/.claude/skills/spec-craft/templates/architecture-README.md`.
- Short-sample fallback: a node the adapters do not find and no evidence grounds is left out, never drawn ungrounded or invented; say which on the card.
- Data shape across states: c4-map/1 as the contract gives it.
- Evidence: command output under `.wt-notes/<seat>/`.
- Design questions (what to draw, what to merge or hide): the FSE, which asks the judge-architecture subagent while Pablo is away.
- Retention: n/a.

## Notes
- 2026-11-01, sup105: parked; drafts at 9749dd9 (generated containers.md and map.json left untracked in the worktree, from the failed gen). `c4-map gen` runs its adapters once per `initiative.yaml` `repos:` entry; this root is its own repo (`repos: []`), so no container is found and `--modules organizer` exits 2 (`~/claudecode/bin/c4-map` run_adapters, container_repo). Ruled (A) by fse: Hephaistos fixes c4-map for a self-repo root. Drafts of `c4.json` and `context.md` are on branch `lf63-organizer-map` (worktree `.wt/lf63-organizer-map`, not pushed); a fresh builder continues from `.wt-notes/lf63-build/progress.md`. C5 runs `go run .wt-notes/sup105/c5 <root>` (spec d550a88). Prompts kept: `~/.local/share/organizer/prompts/organizer-lf63-build.md`, `organizer-lf63-review.tmpl.md`.
