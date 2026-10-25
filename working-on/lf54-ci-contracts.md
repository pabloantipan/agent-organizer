---
title: "The release build reads the contract samples from the specs repo, pinned"
status: next
repos: [organizer]
branch: lf54-ci-contracts
seat:
stage:
updated: 2026-10-25
next: "pablo: rule 0164 (leftovers 54)"
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
