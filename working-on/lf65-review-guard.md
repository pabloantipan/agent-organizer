---
title: "A review or dev build cannot start against the real home"
status: now
repos: [organizer]
branch: lf65-review-guard
seat: l65-build
reviewer: l65-rev
stage:
updated: 2026-11-02
next: "PR with talos-lab"
review: "pass, 4d1b400, l65-rev 2026-11-02; unmet: none"
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

## Review
Verdict: **pass** at 4d1b400 (fresh clone, origin/main 4fabf9f). Unmet rows: none. Reviewer l65-rev, 2026-11-02. Logs in `.wt-notes/l65-rev/`.

change-check (`--base origin/main`; in the clone that is local main 55e67c8, 4fabf9f plus card-only commits, so the changed set equals `4fabf9f..4d1b400`):
```
6 files: CLAUDE.md, main.go:main, reviewguard.go (added), reviewguard_dev.go, reviewguard_nodev.go, reviewguard_test.go
3 flags: outside boundary 0, outside footprint 0, undeclared 0, declared, not changed 0, new env var 0, new dependency 0, new host 0, risk 0, untested? 3
untested? reviewguard.go devRealHomeEnv / resolvePath / underDir: no test file names it
```
The three `untested?` flags are explained: `resolvePath` and `underDir` run in every G1 case through `guardDecision` (the not-yet-created, symlink, `..` and home-itself rows), and `devRealHomeEnv` is the literal `ORGANIZER_DEV_REAL_HOME` in G2. No undeclared, outside-boundary or declared-but-unchanged lines.

| Row | Evidence |
|---|---|
| G1 | `TestReviewGuardDecisionTable` (3 kinds × 2 vars × 8 cases), `TestReviewGuardNoHome` pass; on 4fabf9f with the test copied in, the build fails (`undefined: buildKind`, `guardDecision`) |
| G2 | `TestReviewGuardDevOverride` passes (dev with `=1` starts, review refuses, `true` is not the override); absent on 4fabf9f |
| G3 | `TestReviewGuardBundleID` passes (review plist, production plist, no plist, bare binary, stray plist); absent on 4fabf9f |
| G6 | `TestReviewGuardRunsFirstInAppBranch` passes (AST: after `IsSubcommand`, before `appLogger`/`NewApp`, `os.Exit` on refusal); fails on 4fabf9f. Read: `main.go:41` is the first statement after the CLI dispatch |
| FR-1 read | home from `user.Current()`, not `$HOME` (`TestReviewGuardRealHomeIgnoresHOME`); existing prefix through `EvalSymlinks`; `""` is refused; the override only when `kind == buildDev` |
| Extra inputs | relative `c.yaml` with cwd = home is refused, with cwd outside it starts; `$HOME/.local/share/` (trailing slash) is refused; `$HOME/` is refused; an injected home that is itself a symlink is refused through the link and through its target; `/Users/pabloantipanX/d` starts (prefix not matched by text); `"  "` and a literal `~/…` resolve under cwd (they refuse here because cwd was under the home) |
| G4 | review build, `env -u … HOME=$(mktemp -d)`: exit 2, stderr `Deltagos review build refuses to start: ORGANIZER_CONFIG is unset or empty; export the fixture's (eval "$(scripts/fixture-home.sh)")`, temp HOME has 0 entries, organizer.log `9618 1793599963` before and after |
| G5 | after `eval "$(scripts/fixture-home.sh)"`: `ORGANIZER_CONFIG=/private/tmp/organizer-fixture.6ZM2iH/config.yaml`, `XDG_DATA_HOME=/private/tmp/organizer-fixture.6ZM2iH/data`; pid 39528 alive after 5 s, `safe-kill 39528` stopped it; the app wrote to the fixture's data, real log unchanged |
| X0 | `pnpm install --frozen-lockfile` 0; `make test` 0 (19 Go packages ok, vitest 99 files / 1643 tests); `wails build` 0; `make review-build` 0 (`cl.antipan.organizer.review`); `git status --porcelain` empty, wailsjs/runtime unchanged |

- Note: the guard compares paths as text, so two spellings of the real home on disk get through. `XDG_DATA_HOME=/users/pabloantipan/.local/share` (case-insensitive APFS) and `/System/Volumes/Data/Users/pabloantipan/.local/share` (firmlink) both return nil; `stat` shows the same device and inode (16777230 266280) as `/Users/pabloantipan`. This meets FR-1's literal definition of "resolves" (cleaned, symlinks evaluated), so it does not fail the card. Goes to: the FSE, as a follow-up leftover to compare by device+inode (`os.SameFile` on each existing ancestor). A reviewer's slip would not type these paths.
- Note: my G5 run left 8 `organizer-fixture-agent` stand-ins (pids 39481 39483 39485 39487 39489 39492 39495 39498) that `safe-kill` refuses, like the builder's 8. Goes to: Hephaistos, as a fixture-home.sh cleanup hook.

