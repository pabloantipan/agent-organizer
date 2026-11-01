---
title: "Every run is attributed to an initiative, a task and a role, and runs and usage agree"
status: now
repos: [organizer]
branch: lf56-run-roles
seat: l56-roles
supervisor: organizer-probe-sup96
stage:
updated: 2026-11-01
next: "decide: FR-2/FR-3 inputs do not reach usage.Attribute: model.Card has no reviewer:, model.Decision no supervisor:, and usage.Initiative (built in internal/service/usage.go, outside the boundary) carries no records. (a) read reviewer: and records' supervisor:/cards: in internal/usage from Initiative.Root (in boundary, a second small frontmatter read; recommended) or (b) widen the boundary to model, scan and service/usage.go. l56-roles builds FR-1/4/5/6 meanwhile"
depends_on: []
boundary: ["docs/specs/leftovers-56.md Boundary"]
spec: "docs/specs/leftovers-56.md (FR-1 to FR-6)"
gate: "docs/specs/leftovers-56.md#Acceptance → gate"
ui_review: false
---

## Goal
No run's cost is left without an initiative, a task and a role, so Hestia's fact ledger can read where every dollar went.

## Gate
docs/specs/leftovers-56.md, rows A1-A6 and X0.
