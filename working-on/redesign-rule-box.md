---
title: Ruling from Needs me writes the record, end to end
status: next
repos: [organizer]
branch: main
updated: 2026-09-27
seat: wave2-rulebox
next: "Add the Rule box on a Needs me decision row calling RuleDecision; then run the end to end check G16 against a temp copy of testdata/home"
depends_on: ["redesign-overview", "redesign-work", "redesign-roadmap"]
boundary: ["frontend/src/components/RuleDecisionBox.tsx (new)", "frontend/src/components/Home.tsx (the decision row's Rule action)", "frontend/src/styles/rule-box.css (new)"]
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
- 2026-09-27 sup3: the gate screenshots run against `eval "$(scripts/fixture-home.sh)"` (1993e12): a temp copy of `testdata/home` with `testdata/fixture-overlay` laid over it: init-a a git repo with two FSE-signed commits, proposed records 0002 (the fixture record G15/G16 rule) and 0003 raised by the FSE and owned by pablo, the current stage gated on 0002, three cards seated `wave1-*`, and a cell `organizer-fixture` whose `fse` seat has one question thread open to pablo in the mailbox. `testdata/home` and `status.golden` are unchanged
- `stage:` is left out: the organizer has no roadmap yet (it waits on Pablo's intake); the FSE adds it once one is ruled
- 2026-09-27 sup3 runs this card (organizer-probe-sup3), spawned by the FSE after wave 1 passed
