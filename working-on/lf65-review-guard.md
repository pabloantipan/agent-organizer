---
title: "A review or dev build cannot start against the real home"
status: now
repos: [organizer]
branch: lf65-review-guard
seat: l65-build
reviewer: l65-rev
stage:
updated: 2026-11-02
next: "review: lf65-review-guard, gate met (G1-G6, X0), 4d1b400"
depends_on: []
boundary: ["reviewguard.go", "reviewguard_dev.go", "reviewguard_nodev.go", "reviewguard_test.go", "main.go", "CLAUDE.md"]
spec: "docs/specs/leftovers-65.md (FR-1 to FR-5)"
gate: "docs/specs/leftovers-65.md#Acceptance → gate"
ui_review: false
touches: []
change_order: {add: [], change: [], retire: []}
autonomy: unattended
---

## Goal
No reviewer's slip can put a review or dev build on Pablo's real config or data again.

## Gate
docs/specs/leftovers-65.md, rows G1-G6 and X0.

## Pre-answered
- Base: origin/main at the card's start.
- Merge target: `main` through talos-lab's PR.
- Tests: `go test .` for G1-G3, G6; G4 and G5 in the review build built in the worktree.
- Short-sample fallback: the real home is injected in the unit tests; G4 uses a temp HOME, never the real one.
- Data shape across states: two env vars, each unset, empty, under the home, outside it.
- G4 and G5 never run without the saved pid; kill only with `safe-kill <pid>`.
- Evidence: logs under `.wt-notes/<seat>/`.
- Retention: n/a.

## Done
- 2026-11-02 l65-build: guard built and gate met on `lf65-review-guard` at 4d1b400 (0c6ddf2 feat, 4d1b400 docs), rebased on origin/main 4fabf9f, not pushed; evidence in `.wt-notes/l65-build/progress.md`.

## Declared changes
- added `reviewguard.go`: `guardDecision`, `kindOf`, `bundleID`, `resolvePath`, `underDir`, `realHomeDir`, `reviewGuard`, `guardApp`; the build-kind × env rule (FR-1, FR-3, FR-4)
- added `reviewguard_dev.go`: `devBuild = true` under tag dev
- added `reviewguard_nodev.go`: `devBuild = false` otherwise
- added `reviewguard_test.go`: G1-G3, G6 plus home-from-os/user and dev-tag file checks
- modified `main.go:main`: calls `guardApp` after the CLI dispatch, before `NewApp`/`appLogger`, exits with its code (FR-2)
- modified `CLAUDE.md`: one sentence under Packaging naming the guard and `ORGANIZER_DEV_REAL_HOME=1` (FR-5)
Risky:
- `bundleID`: shells out to `/usr/bin/plutil` at app start; a failure reads as production (fail open for the bundle check only; the dev tag does not depend on it)
- `realHomeDir`: `os/user` on darwin reads the user database through libc; if it errors a guarded build refuses
Not changed, on purpose:
- `windowTitle`, `appLogger`: untouched; the guard returns before them
- CLI subcommands: unguarded per FR-2

## Notes
- G5: `scripts/fixture-home.sh` leaves 8 `organizer-fixture-agent` processes that reparent, so `safe-kill` refuses them; pids in progress.md "Found, not asked".
- `go build -tags dev .` fails to link on main too (UTType); `wails dev` adds the framework itself. `go vet -tags dev .` passes.
