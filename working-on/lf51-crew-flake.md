---
title: "The crew launch test keeps its property with a bound swap cannot reach"
status: next
repos: [organizer]
branch: lf51-crew-flake
seat: l51-flake
reviewer: l51-flake-review
stage:
updated: 2026-10-24
next: "review: lf51-crew-flake, gate met (C4 20/20, X0 pass, porcelain empty), 202b718"
depends_on: []
boundary: ["docs/specs/leftovers-51.md Boundary, lf51-crew-flake"]
spec: "docs/specs/leftovers-51.md (FR-6)"
gate: "docs/specs/leftovers-51.md#Acceptance → gate"
ui_review: false
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
