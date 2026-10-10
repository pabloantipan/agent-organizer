---
title: "A clean tree after make install, release.yml's tests on a clean checkout, the factory call off the tick with a timeout"
status: now
repos: [organizer]
branch: lf15-build-drift
seat: lb-build
stage: one-window
updated: 2026-10-09
next: "review: lf15-build-drift, gate met (B1 B2 B3 X0), 28732ed"
depends_on: []
boundary: ["the spec's Boundary for this card"]
spec: "docs/specs/leftovers-15.md (FR-12 to FR-14)"
gate: "docs/specs/leftovers-15.md Acceptance, rows B1 to B3 and X0"
ui_review: false
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
