---
title: "Deltagos reads factory report's JSON and text, its windows, and joins its lines to the waves and their rounds"
status: next
repos: [organizer]
branch: lf57-report-go
seat:
stage:
updated: 2026-11-01
next: "the FSE launches its supervisor once lf52-decisions-line, lf53-frontmatter and lf55-one-title are on origin/main (0169 ruled 2026-11-01)"
depends_on: [lf53-frontmatter, lf52-decisions-line, lf55-one-title]
boundary: ["docs/specs/leftovers-57.md Boundary, lf57-report-go"]
spec: "docs/specs/leftovers-57.md (FR-1 to FR-6)"
gate: "docs/specs/leftovers-57.md#Acceptance → gate"
ui_review: false
---

## Goal
The app gets the run report from the one computation, and knows which wave moved each line and at what cost.

## Gate
docs/specs/leftovers-57.md, rows R1-R4, R6 and X0.
