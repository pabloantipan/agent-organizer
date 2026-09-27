---
title: Ruling from Needs me writes the record, end to end
status: next
repos: [organizer]
branch: main
updated: 2026-09-26
next: "Add the Rule box on a Needs me decision row calling RuleDecision; then run the end to end check G16 against a temp copy of testdata/home"
depends_on: ["redesign-overview", "redesign-work", "redesign-roadmap"]
boundary: ["frontend/src/components/RuleDecisionBox.tsx (new)", "frontend/src/components/Home.tsx (the decision row's Rule action)"]
spec: "docs/specs/redesign.md (FR-23, FR-22); visual: docs/specs/redesign-mockups.html; values: docs/design-system.md"
gate: "docs/specs/redesign.md Acceptance, rows G15, G16, G18; the Gate section below"
---

## Goal
The redesign, wave 2 of 2: FR-22 of `docs/specs/redesign.md`. Decisions 0013–0020.

## Gate
- [ ] G15: see `docs/specs/redesign.md`, Acceptance
- [ ] G16: see `docs/specs/redesign.md`, Acceptance
- [ ] G18: see `docs/specs/redesign.md`, Acceptance

## Done
- 2026-09-26 cut from the redesign spec by the FSE

## Next
1. Add the Rule box on a Needs me decision row calling RuleDecision; then run the end to end check G16 against a temp copy of testdata/home

## Blockers
none

## Notes
- `stage:` is left out: the organizer has no roadmap yet (it waits on Pablo's intake); the FSE adds it once one is ruled
