---
title: "The release build reads the contract samples from the specs repo, pinned"
status: now
repos: [organizer]
branch: lf54-ci-contracts
seat: l54-ci
stage:
updated: 2026-11-01
next: "l54-ci builds it from origin/main 076eb5c (sup99, specs pin 54cf10d)"
depends_on: [lf53-frontmatter, lf53-usage-contract]
boundary: ["docs/specs/leftovers-54.md Boundary, lf54-ci-contracts"]
spec: "docs/specs/leftovers-54.md (FR-2)"
gate: "docs/specs/leftovers-54.md#Acceptance → gate"
ui_review: false
---

## Goal
A tag build runs the contract tests against the same samples as lodestar.

## Gate
docs/specs/leftovers-54.md, rows G2 and X0.
