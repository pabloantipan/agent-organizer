---
title: The rule box keeps focus, shows the recommendation on short records, and names its initiative
status: next
repos: [organizer]
branch: main
updated: 2026-09-29
next: "sup23 runs this card (organizer-probe-sup23), spawned by the FSE 2026-09-29 after responsive-home landed"
depends_on: ["responsive-home"]
boundary: ["frontend/src/components/RuleDecisionBox.tsx", "frontend/src/styles/rule-box.css", "frontend/src/components/DecisionsView.tsx (ownerPhrase only)", "frontend/src/components/Conversation.tsx (the People toggle label only)", "frontend/src/lib/ tests"]
spec: "docs/specs/initiative-header.md (FR-7); the design: docs/ux/specs/initiative-header.md (Aglaea, 6c93a49)"
gate: "docs/specs/initiative-header.md Acceptance, rows G9, G11; the Gate section below"
stage: twenty-at-a-glance
seat:
ui_review: true
---

## Goal
FR-7 of `docs/specs/initiative-header.md`, from Aglaea's header design and Pablo's header-review-2.

## Gate
- [ ] G9: see `docs/specs/initiative-header.md`, Acceptance
- [ ] G11: see `docs/specs/initiative-header.md`, Acceptance

## Done
- 2026-09-29 cut from initiative-header by the FSE

## Next
1. sup23 runs this card

## Blockers
none

## Notes
- 2026-09-29 sup23 runs this card with its sibling, spawned by the FSE after responsive-home landed (d8591aa)
- The frontend uses pnpm; add no dependency. No Go change.
