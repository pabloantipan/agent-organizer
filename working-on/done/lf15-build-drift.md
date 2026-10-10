---
title: "A clean tree after make install, release.yml's tests on a clean checkout, the factory call off the tick with a timeout"
status: done
repos: [organizer]
branch: lf15-build-drift
seat: lb-build
stage: one-window
updated: 2026-10-09
next: "done: reviewed pass by lb-review at 28732ed; merge lf15-build-drift"
depends_on: []
boundary: ["the spec's Boundary for this card"]
spec: "docs/specs/leftovers-15.md (FR-12 to FR-14)"
gate: "docs/specs/leftovers-15.md Acceptance, rows B1 to B3 and X0"
ui_review: false
review: pass
---

## Goal
Leftovers from 2026-10-09's reviews (0111).

## Gate
docs/specs/leftovers-15.md, B1 to B3 and X0.
- [x] B1 (FR-12): `git status --porcelain` after `make build` on a clean tree is empty; install's extra steps only touch /Applications and ~/.local/bin (Makefile `install:` read, not run) — `.wt-notes/lb-build/b1.txt`
- [x] B2 (FR-13): the workflow's steps by hand from a clean clone, Test passes (the old step fails on the missing frontend/dist) — `.wt-notes/lb-build/b2-x0-steps.log`, `b2-old-step.log`
- [x] B3 (FR-14): zero factory calls on the tick path; a fake sleeping 60 s stops at 20 s, lock released, message — `.wt-notes/lb-build/b3.log`, `b3-real-20s.log`
- [x] X0: `XDG_DATA_HOME=$(mktemp -d) make test`, `npm run build`, `wails build` from a clean clone pass — `.wt-notes/lb-build/b2-x0-steps.log`, `x0-build.log`

## Done
- 2026-10-09 lb-build: Makefile restores the runtime files' 0755 after wails build (the drift was mode only, versions already agree); release.yml builds the frontend then runs `make test`; every factory call times out at 20 s (process group stopped, lock released, words say so). 6473efe, 8bfb289, 28732ed.

## Notes
- A bare `wails build`/`wails dev` still flips `frontend/wailsjs/runtime/*` to 0644; the root fix is a mode-only commit of those three files to 644 (outside this card's boundary). See `.wt-notes/lb-build/progress.md`.

## Review
Verdict: **pass**. Reviewer lb-review, 2026-10-09, commit 28732edb1fc4f04be265b1a39bc979962dd05e44. Runs were done from fresh clones under `.wt-notes/lb-review/` (since removed); logs are in `.wt-notes/lb-review/logs/`.
- B1: on a clean clone, `make build` passed and left `git status --porcelain` empty (`b1-make-build.log`). I did not run `make install`. I read its target instead: after `build` it only does `rm -rf`/`cp -R` under /Applications plus `mkdir -p`/`ln -sf` under ~/.local/bin, so nothing touches the tree. The drift is a mode change only (git holds the runtime files at 100755), and the Makefile's `chmod 755` restores it.
- B2: I ran the workflow's steps by hand on a clean clone. The old Test step (`go vet && go test`) fails with `pattern all:frontend/dist: no matching files found` (`b2-old.log`). The new steps (frontend `pnpm install --frozen-lockfile && pnpm run build`, then `make test`) pass: Go ok, vitest 27 files and 418 tests (`b2-frontend.log`, `b2-x0-maketest.log`). I skipped the Install Wails step because v2.15.0 is already installed, the same version the step pins.
- B3: `TestFactoryAwakeNeverOnTheTick` checks that `Scan(false)` plus 3× `RefreshAgents` make zero factory calls and that `Board` makes one awake. `TestFactoryCallTimesOut` uses a fake that sleeps 60 s in a child process: the call is stopped, the lock is free, Wake is not busy, and both messages appear. Both pass with the 1 s timeout (`b3.log`). With the real 20 s (`ORGANIZER_REAL_FACTORY_TIMEOUT=1`) the call stopped at 20.16 s (`b3-real.log`). I also read the code: `App.Factory` serves the cached reading, and the frontend calls it only on board change.
- X0: on a second fresh clone, `XDG_DATA_HOME=$(mktemp -d) make test`, then `cd frontend && npm install && npm run build`, then `wails build` all exited 0 (`x0-maketest.log`, `x0-npm.log`, `x0-wails.log`).
- Unmet rows: none.
- Not covered by the gate: a bare `wails build` still leaves the three `frontend/wailsjs/runtime/*` files modified (0644), as seen in the X0 clone. The root fix is a mode-only commit of those files to 100644, which is outside this card's boundary. Also, the npm and pnpm lockfiles coexist: `npm install` over a pnpm `node_modules` fails ("Cannot read properties of null").
