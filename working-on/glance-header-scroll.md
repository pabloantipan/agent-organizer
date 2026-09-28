---
title: The header clamps and the page body scrolls
status: next
repos: [organizer]
branch: main
updated: 2026-09-28
next: "Clamp goal and measure to two lines with more, and make the body under the tabs scroll while the header and tabs stay (0038)"
depends_on: []
boundary: ["frontend/src/components/InitiativeHeader.tsx", "frontend/src/App.tsx (the initiative page's layout only)", "frontend/src/styles/ (the header's and the shell's CSS only)", "testdata/fixture-overlay/ (a long goal and measure, if missing)"]
spec: "docs/specs/twenty-at-a-glance.md (FR-10, FR-11); values: docs/design-system.md"
gate: "docs/specs/twenty-at-a-glance.md Acceptance, rows G13, G14, G10; the Gate section below"
stage: twenty-at-a-glance
seat: wave1-header
---

## Goal
Pablo's review of the installed app (0038): FR-10, FR-11 of `docs/specs/twenty-at-a-glance.md`.

## Gate
- [ ] G13: see `docs/specs/twenty-at-a-glance.md`, Acceptance
- [ ] G14: see `docs/specs/twenty-at-a-glance.md`, Acceptance
- [ ] G10: see `docs/specs/twenty-at-a-glance.md`, Acceptance

## Done
- 2026-09-28 cut from the spec by the FSE

## Next
1. Clamp goal and measure to two lines with more, and make the body under the tabs scroll while the header and tabs stay (0038)

## Blockers
none

## Notes
- 2026-09-28 sup8 runs this card (organizer-probe-sup8), spawned by the FSE after 0038
