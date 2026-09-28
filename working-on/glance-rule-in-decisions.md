---
title: Rule a decision from the Decisions tab
status: next
repos: [organizer]
branch: main
updated: 2026-09-28
next: "Give an expanded proposed record owned by the lead the same Rule box as Needs me; none on ruled, withdrawn or superseded records (0038)"
depends_on: []
boundary: ["frontend/src/components/DecisionsView.tsx", "frontend/src/components/RuleDecisionBox.tsx (reuse; props only if needed)", "frontend/src/styles/ (the Decisions tab's CSS only)"]
spec: "docs/specs/twenty-at-a-glance.md (FR-12); values: docs/design-system.md"
gate: "docs/specs/twenty-at-a-glance.md Acceptance, rows G15, G10; the Gate section below"
stage: twenty-at-a-glance
seat: wave1-decrule
---

## Goal
Pablo's review of the installed app (0038): FR-12 of `docs/specs/twenty-at-a-glance.md`.

## Gate
- [ ] G15: see `docs/specs/twenty-at-a-glance.md`, Acceptance
- [ ] G10: see `docs/specs/twenty-at-a-glance.md`, Acceptance

## Done
- 2026-09-28 cut from the spec by the FSE

## Next
1. Give an expanded proposed record owned by the lead the same Rule box as Needs me; none on ruled, withdrawn or superseded records (0038)

## Blockers
none

## Notes
- 2026-09-28 sup8 runs this card (organizer-probe-sup8), spawned by the FSE after 0038
