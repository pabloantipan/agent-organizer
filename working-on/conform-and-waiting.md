---
title: Needs me verbs and blocked reasons follow the design system; waiting says whose
status: next
repos: [organizer]
branch: main
updated: 2026-09-29
next: "sup19 runs this card (organizer-probe-sup19), spawned by the FSE 2026-09-29 after 0057 and sup18 landed"
depends_on: ["home-rule-and-rows", "cell-screens-fix"]
boundary: ["frontend/src/components/Home.tsx (the waiting signal; the row verbs' class)", "frontend/src/components/InitiativeHeader.tsx (waitingDecisions may move to lib, same count)", "frontend/src/components/Conversation.tsx (the worklist's Rule toggle; the chat list's no-token line)", "frontend/src/components/CardDrawer.tsx (Write about this card)", "frontend/src/components/AgentsView.tsx and Crew.tsx (aria-describedby only)", "frontend/src/lib/ (the owner list and its test)", "CSS", "testdata/"]
spec: "docs/specs/lead-side-fixes.md (FR-10, FR-11, FR-12; amendments 1 and 2; decisions 0056, 0057); the rules: docs/design-system.md principle 3, Inbox row, Disabled actions (7b6afd4)"
gate: "docs/specs/lead-side-fixes.md Acceptance, rows G8, G9, G7; the Gate section below"
stage: discovery-in-a-cell
seat:
ui_review: true
---

## Goal
FR-10 (0056, waiting says whose), FR-11 and FR-12 (Aglaea's design-system
rewrite, 7b6afd4) of `docs/specs/lead-side-fixes.md`.

## Gate
- [ ] G8: see `docs/specs/lead-side-fixes.md`, Acceptance
- [ ] G9: see `docs/specs/lead-side-fixes.md`, Acceptance
- [ ] G7: see `docs/specs/lead-side-fixes.md`, Acceptance

## Done
- 2026-09-29 cut from lead-side-fixes amendments 1 and 2 by the FSE; replaces waiting-says-whose

## Next
1. sup19 runs this card

## Blockers
none

## Notes
- 2026-09-29 sup19 runs this card; 0057 accepted as written, so the previous wave's sev 2–1 UI findings stay out (the FSE's next batch)
- The UI reviewer checks against docs/design-system.md's "Disabled actions".
- The frontend uses pnpm; `make test` runs the frontend tests.
