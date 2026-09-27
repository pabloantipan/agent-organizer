---
title: The app reads runs, with input tokens per card
status: next
repos: [organizer]
branch: redesign-runs-binding
updated: 2026-09-26
next: "review: redesign-runs-binding, gate G6, G9, G17 met, e09408a 89bb148"
seat: wave1-runs
depends_on: []
boundary: ["app.go (a Runs method only)", "internal/service/run.go (Runs by initiative, tokens per card)", "internal/service/run_test.go", "frontend/wailsjs/ (regenerated)", "frontend/src/hooks/useWails.ts (the runs wrapper)"]
spec: "docs/specs/redesign.md (FR-10); visual: docs/specs/redesign-mockups.html"
gate: "docs/specs/redesign.md Acceptance, rows G6, G9, G17; the Gate section below"
---

## Goal
The redesign, wave 1 of 2: FR-10 of `docs/specs/redesign.md`. Decisions 0013–0020.

## Gate
- [x] G6: see `docs/specs/redesign.md`, Acceptance
- [x] G9: see `docs/specs/redesign.md`, Acceptance
- [x] G17: see `docs/specs/redesign.md`, Acceptance

## Done
- 2026-09-26 cut from the redesign spec by the FSE
- 2026-09-26 FR-10 bound (e09408a, 89bb148 on `redesign-runs-binding`, rebased onto 4ebe3d6, unmerged). `service.InitiativeRuns` folds runs.jsonl and the live statusline records by `pid:session_id` (the live record wins, so a running session is not counted twice) and groups them per card with the input tokens summed; `RunInfo` is `session.Run` without `CostUSD`, so the bindings carry no dollars (0020). `app.go` gained one `Runs` method, `frontend/wailsjs` was regenerated, `useWails.ts` gained `api.runs`. Gate: **G6** `TestInitiativeRunsSumsTokensPerCard` in `internal/service/run_test.go` — two archived runs (12k, 30k) plus one live session (40k, over a stale 5k open line) on one card returns 82000 and three runs, and the view's JSON names no cost; `XDG_DATA_HOME=$(mktemp -d) go test ./internal/service/ -run TestInitiativeRunsSumsTokensPerCard -v` → `--- PASS: TestInitiativeRunsSumsTokensPerCard (0.00s)`. **G9** `XDG_DATA_HOME=$(mktemp -d) make test` after the rebase → `ok organizer/internal/service 0.566s`, every package ok, `go vet` clean. **G17** `git diff --name-only main...redesign-runs-binding -- '*.css'` → empty

## Next
1. review: redesign-runs-binding, gate G6, G9, G17 met, e09408a 89bb148

## Blockers
none

## Notes
- `stage:` is left out: the organizer has no roadmap yet (it waits on Pablo's intake); the FSE adds it once one is ruled
- `wails generate module` flips the mode of `frontend/wailsjs/runtime/*` from 644 to 755 without changing a byte of them; reset to 644 so the commit is the three generated files only
- the bound read does not archive: `Runs` (the CLI's) shells out to `ps` and `zellij` first, and a UI read must not depend on a process sample — a running session's fresh numbers are in its statusline record. The reasoning and the rest of the choices are in `.wt-notes/wave1-runs/progress.md`
- `node_modules` is absent in a fresh worktree, so `tsc` could not check the `useWails.ts` wrapper and `make test` does not cover the frontend; wave 2's first `npm run build` is its real check
- 2026-09-26 sup2 runs this card (organizer-probe-sup2), spawned by the FSE after 0023; seat wave1-runs, worktree .wt/redesign-runs-binding, branch redesign-runs-binding
