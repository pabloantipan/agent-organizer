---
title: Cards seated wave<N>-* form a wave with its progress and tokens
status: next
repos: [organizer]
branch: redesign-waves
updated: 2026-09-26
next: "review: redesign-waves, gate G5, G9, G17 met, 43ce855 27e6a36"
seat: wave1-waves
depends_on: ["redesign-goal-stages", "redesign-agent-card"]
boundary: ["internal/model/model.go (AgentGroup: waves; nothing else)", "internal/service/waves.go (new)", "internal/service/waves_test.go (new)", "internal/service/service.go (the agents feed: attach waves)"]
spec: "docs/specs/redesign.md (FR-9); visual: docs/specs/redesign-mockups.html"
gate: "docs/specs/redesign.md Acceptance, rows G5, G9, G17; the Gate section below"
---

## Goal
The redesign, wave 1 of 2: FR-9 of `docs/specs/redesign.md`. Decisions 0013–0020.

## Gate
- [x] G5: see `docs/specs/redesign.md`, Acceptance
- [x] G9: see `docs/specs/redesign.md`, Acceptance
- [x] G17: see `docs/specs/redesign.md`, Acceptance

## Done
- 2026-09-26 cut from the redesign spec by the FSE
- 2026-09-26 FR-9 built on `redesign-waves` (43ce855, 27e6a36): `internal/service/waves.go` groups cards seated `wave<N>-<name>` into building / in review / queued / done with the gate rows of A2, the wave's input tokens and the A1 supervisor; `AgentGroup.Waves` carries them on the 10 s agents feed. Gate met:
  - G5 — `TestWavesG5` in `internal/service/waves_test.go`; `go test ./internal/service/ -run TestWavesG5 -v` → `--- PASS: TestWavesG5 (0.00s)` (1 building, 1 in review, 1 queued, gate 4/5, tokens 12000)
  - G9 — `cd /Users/pabloantipan/organizer/.wt/redesign-waves && XDG_DATA_HOME=$(mktemp -d) make test` after rebasing onto main → every package `ok`, including `ok organizer/internal/service 13.535s`; no golden refresh needed
  - G17 — `git -C /Users/pabloantipan/organizer/.wt/redesign-waves diff --name-only main...redesign-waves -- '*.css'` → no output; the branch changes only `internal/service/{service,waves,waves_test}.go`

## Next
1. review: redesign-waves, gate G5, G9, G17 met, 43ce855 27e6a36. Branch left unmerged, rebased onto main.

## Blockers
none

## Notes
- `stage:` is left out: the organizer has no roadmap yet (it waits on Pablo's intake); the FSE adds it once one is ruled
- 2026-09-26 sup2 runs this card (organizer-probe-sup2), spawned by the FSE after 0023; seat wave1-waves, worktree .wt/redesign-waves, branch redesign-waves
- `AgentGroup` is declared in `internal/service/service.go`, not in `internal/model/model.go` as this card's boundary line says. The `Waves` field went on it there (the boundary's service.go entry) and `model.go` was not touched at all: the `Wave` and `WaveCard` types live in the new `waves.go`.
- FR-9 names the four groups but not what to do when a card answers to two. Applied precedence: done (status done or archived) > in review (`next` starts with `review:`) > building (an agent joined) > queued — a reviewer's session joined to a handed-over card must not read as "still being built".
- `Wave.InputTokens` sums the joined agents' live statusline tokens, not `Service.InitiativeRuns` (FR-10's archive + live). Two reasons: the wave rides the 10 s feed and `InitiativeRuns` reads `runs.jsonl` and every statusline record from disk, and its `liveRuns` takes the service lock `agentsViewLocked` already holds, so calling it there would deadlock. If the strip should show the archive total instead, that is a spec amendment, not a bug here.
