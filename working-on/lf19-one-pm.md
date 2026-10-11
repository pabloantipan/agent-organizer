---
title: "make test uses pnpm, like wails build"
status: now
repos: [organizer]
branch: lf19-one-pm
seat: pm-build
stage: one-window
updated: 2026-10-11
next: "review: lf19-one-pm, P1 and X0 met, a088a56"
depends_on: []
boundary: ["docs/specs/leftovers-19.md Boundary, lf19-one-pm"]
spec: "docs/specs/leftovers-19.md (FR-9)"
gate: "docs/specs/leftovers-19.md Acceptance, rows P1 and X0"
ui_review: false
---

## Goal
sup55: make test uses npm while wails build uses pnpm.

## Gate
docs/specs/leftovers-19.md, rows P1 and X0.
- [x] P1: clean clone, make test pass, no frontend/package-lock.json, tree clean — .wt-notes/pm-build/gate.log
- [x] X0: XDG_DATA_HOME=$(mktemp -d) make test, pnpm run build, wails build pass, git status --porcelain empty — .wt-notes/pm-build/gate.log

## Done
- 2026-10-11 make test installs (frozen lockfile), builds and tests the frontend with pnpm (a088a56); release.yml already used pnpm, left as is.

## Notes
