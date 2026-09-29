---
title: Home's waiting signal names whose records wait
status: next
repos: [organizer]
branch: main
updated: 2026-09-29
next: "fse: start its supervisor when home-rule-and-rows lands (both touch Home.tsx)"
depends_on: ["home-rule-and-rows"]
boundary: ["frontend/src/components/Home.tsx (the waiting signal only)", "frontend/src/components/InitiativeHeader.tsx (waitingDecisions may move to lib, same count)", "frontend/src/lib/ (the owner list and its test)", "testdata/"]
spec: "docs/specs/lead-side-fixes.md (FR-10, amendment 1; decision 0056); values: docs/design-system.md"
gate: "docs/specs/lead-side-fixes.md Acceptance, rows G8, G7; the Gate section below"
stage: discovery-in-a-cell
seat:
---

## Goal
FR-10 of `docs/specs/lead-side-fixes.md`: 0056 ruled "waiting says whose",
Aglaea's F3.

## Gate
- [ ] G8: see `docs/specs/lead-side-fixes.md`, Acceptance
- [ ] G7: see `docs/specs/lead-side-fixes.md`, Acceptance

## Done
- 2026-09-29 cut from lead-side-fixes amendment 1 by the FSE

## Next
1. fse: start the supervisor after home-rule-and-rows lands

## Blockers
none

## Notes
- The frontend uses pnpm; `make test` runs the frontend tests.
