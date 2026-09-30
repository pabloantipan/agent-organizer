---
title: Responsive Home, second pass - compact to 1439, the sheet's scrim, one draft per record, one-line signals, names
status: next
repos: [organizer]
branch: main
updated: 2026-09-29
next: "sup24 runs this card (organizer-probe-sup24), spawned by the FSE 2026-09-30 after rule-box-finish landed"
depends_on: ["responsive-home", "rule-box-finish"]
boundary: ["frontend/src/components/Home.tsx, RuleDecisionBox.tsx, Rail.tsx, App.tsx (the shell layout)", "frontend/src/stores/board.store.ts (the width class; drafts per record)", "frontend/src/lib/ and its tests", "frontend/src/styles/shell.css, home.css, rule-box.css"]
spec: "docs/specs/responsive-home.md (FR-7 to FR-12, amendment 2); the design: docs/ux/specs/responsive-home.md, Amendment 1 (Aglaea, 836866a)"
gate: "docs/specs/responsive-home.md Acceptance, rows G9 to G12 and G8; the Gate section below"
stage: twenty-at-a-glance
seat:
ui_review: true
---

## Goal
responsive-home's UI review (U1–U9) answered by Aglaea's design Amendment 1:
FR-7 to FR-12 of `docs/specs/responsive-home.md`.

## Gate
- [ ] G9: see `docs/specs/responsive-home.md`, Acceptance
- [ ] G10: see `docs/specs/responsive-home.md`, Acceptance
- [ ] G11: see `docs/specs/responsive-home.md`, Acceptance
- [ ] G12: see `docs/specs/responsive-home.md`, Acceptance
- [ ] G8: see `docs/specs/responsive-home.md`, Acceptance

## Done
- 2026-09-29 cut from responsive-home amendment 2 by the FSE

## Next
1. sup24 runs this card

## Blockers
none

## Notes
- 2026-09-30 sup24 runs this card, spawned by the FSE after rule-box-finish landed (8450cac)
- The frontend uses pnpm; add no dependency. No Go change.
