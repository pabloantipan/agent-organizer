---
title: "The crew launch test keeps its property with a bound swap cannot reach"
status: done
repos: [organizer]
branch: lf51-crew-flake
seat: l51-flake
reviewer: l51-flake-review
stage:
updated: 2026-10-24
next: "merge lf51-crew-flake (202b718), review passed"
depends_on: []
boundary: ["docs/specs/leftovers-51.md Boundary, lf51-crew-flake"]
spec: "docs/specs/leftovers-51.md (FR-6)"
gate: "docs/specs/leftovers-51.md#Acceptance → gate"
ui_review: false
review: pass
---

## Goal
`make test` stops failing on TestAppCreateCrewReturnsAtOnce when the Mac is swapping.

## Gate
docs/specs/leftovers-51.md, rows C4 and X0. HYGIENE: lf51-crew-flake.

## Declared changes
- modified `app_launch_test.go:TestAppCreateCrewReturnsAtOnce`: stub sleeps 6 s per seat, the call must return in under 3 s (FR-6)
Risky:
- `TestAppCreateCrewReturnsAtOnce`: the test now takes about 19 s (three seats × 6 s in the background wait)
Not changed, on purpose:
- `scripts/probe-stub.sh`: the sleep is the env var, no stub change needed

## Done
- 2026-10-24 l51-flake: bound 3 s over a 6 s stub (202b718); C4 20/20 pass (slowest 748 ms), X0 pass in a clean clone, porcelain empty. Notes in .wt-notes/l51-flake/progress.md.

## Review
**Verdict: pass** at 202b718 (branch not moved during the review). Unmet gate items: none.

change-check (clean clone of 202b718):
```
repo organizer: base f73a6eb27 (default origin/main) ... head lf51-crew-flake (clone HEAD 202b71821, on detached) 202b71821; 1 files, 1 flags
## Changed
- organizer/app_launch_test.go (modified, test)
| undeclared | organizer/app_launch_test.go |  | modified |
| declared, not changed |  | app_launch_test.go:TestAppCreateCrewReturnsAtOnce | no matching change |
2 flags: outside boundary 0, outside footprint 0, undeclared 1, declared, not changed 1, new env var 0, new dependency 0, new host 0, risk 0, untested? 0
```
- Both flags are one change seen twice: the declaration names the symbol, change-check matched the file but not the symbol in a test file. Every hunk of `git diff main...202b718` (`@@ -16`, `@@ -21`, `@@ -55,2`) is inside `TestAppCreateCrewReturnsAtOnce` or its doc comment (func at line 18). Explained, no finding.
- Boundary: the only code file is `app_launch_test.go`; no `frontend/wailsjs/`, no go.mod/go.sum/package.json/lockfile change, so no new dependency.

Rows:
- **C4**: `test-lease run -- go test -run TestAppCreateCrewReturnsAtOnce -count=20 -v .` → 20 `--- PASS`, 0 FAIL, `ok organizer 372.661s`; slowest `App.CreateCrew returned in 192.841917ms`. Source: `app_launch_test.go:22 t.Setenv("PROBE_STUB_SLEEP", "6")`, `:56 if took >= 3*time.Second`. Main's source: `:21 PROBE_STUB_SLEEP "3"`, `:55 if took >= time.Second`. HYGIENE card: the new test passes on main by design (main fails only under swap; the branch differs from main in this file alone, so the new test on main is the run above). Property still guarded: in a scratch copy (not committed, removed) `internal/service/launch.go:180 go s.runLaunches(l)` → `s.runLaunches(l)` gave `--- FAIL: TestAppCreateCrewReturnsAtOnce (18.87s) app_launch_test.go:57: CreateCrew took 18.715651167s, want < 3 s`. Waiting for only the first seat costs ≥ 6 s, over the 3 s bound by arithmetic.
- **X0**: `XDG_DATA_HOME=$(mktemp -d) test-lease run --share -- make test` → **fresh** run `dc2cc77f-82539` (sha 202b71821, rc 0): every Go package ok, vitest `Tests 1116 passed (1116)`. `test-lease run -- pnpm run build` rc 0 (`✓ built in 1.29s`); `test-lease run -- wails build` rc 0 (`Built …/Deltagos.app/Contents/MacOS/organizer`); `git status --porcelain` empty (wailsjs/runtime untouched).

Note: C4 at count=20 takes ~6 min (each run waits ~18 s for the background seats); the builder's declared risk stands, not a finding.

Reviewer `l51-flake-review`, 2026-10-24.
