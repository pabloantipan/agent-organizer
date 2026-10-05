---
title: Decisions holds still - the view moves by itself while a record is read (Pablo's report)
status: next
repos: [organizer]
branch: decisions-still
updated: 2026-10-05
next: "sup41 builds it (0086 ruled, accept as written)"
depends_on: []
boundary: ["frontend/src/components/DecisionsView.tsx, RuleDecisionBox.tsx", "frontend/src/styles/decisions.css, rule-box.css, global.css (.markdown rules only)", "frontend/src/lib/useScrollEdges.ts and lib/ tests", "not: Home, Conversations, Go, docs/design-system.md"]
spec: "docs/specs/decisions-still.md (FR-1 to FR-3)"
gate: "docs/specs/decisions-still.md Acceptance, rows W1 to W3 and W0"
ui_review: true
---

## Goal
Nothing on Decisions moves unless the operator moves it. Measure the cause first.

## Gate
- [ ] W1-W3: see `docs/specs/decisions-still.md`, Acceptance
- [ ] W0: see `docs/specs/decisions-still.md`, Acceptance

## Done
- 2026-10-05 0086 ruled by pablo ("ok", 0d6bb82); sup41 launched by the FSE
- 2026-10-05 cut by the FSE from Pablo's report ("this view 'vibrates'")

## Next

## Blockers

## Notes
