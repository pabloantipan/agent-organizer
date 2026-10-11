---
title: "make test uses pnpm, like wails build"
status: done
repos: [organizer]
branch: lf19-one-pm
seat: pm-build
stage: one-window
updated: 2026-10-11
next: "review: lf19-one-pm, P1 and X0 met, b222da5"
depends_on: []
boundary: ["docs/specs/leftovers-19.md Boundary, lf19-one-pm"]
spec: "docs/specs/leftovers-19.md (FR-9)"
gate: "docs/specs/leftovers-19.md Acceptance, rows P1 and X0"
ui_review: false
review: pass
---

## Goal
sup55: make test uses npm while wails build uses pnpm.

## Gate
docs/specs/leftovers-19.md, rows P1 and X0.
- [x] P1: clean clone, make test pass, no frontend/package-lock.json, tree clean — .wt-notes/pm-build/gate.log
- [x] X0: XDG_DATA_HOME=$(mktemp -d) make test, pnpm run build, wails build pass, git status --porcelain empty — .wt-notes/pm-build/gate.log

## Done
- 2026-10-11 make test installs (frozen lockfile), builds and tests the frontend with pnpm (b222da5); release.yml already used pnpm, left as is.

## Notes

## Review
Verdict: pass. Branch lf19-one-pm at b222da5 (unmoved), fresh clone under .wt-notes/pm-review/clean (removed after); log .wt-notes/pm-review/gate.log.
- P1: from the clean clone (no node_modules, no dist), `XDG_DATA_HOME=$(mktemp -d) make test` exit 0 (go all ok, vitest 38 files / 513 tests); the log shows `pnpm install --frozen-lockfile`, `pnpm run build`, `pnpm test`; `ls frontend/package-lock.json` exit 1; `git status --porcelain` empty. Diff is Makefile only, inside the Boundary; release.yml already pnpm.
- X0: same clone, then `cd frontend && pnpm run build` exit 0, `wails build` exit 0, `git status --porcelain` empty.
Unmet: none. Reviewer pm-review, 2026-10-11, commit b222da5656492c70d78439f99f0e7d86c395a27d.
