---
title: Home holds the glance at 1024, on the laptop and on the ultrawide
status: next
repos: [organizer]
branch: main
updated: 2026-09-29
next: "pablo: rule 0062 (wide: left or centred); the FSE starts its supervisor when ui-leftovers lands (0061 accepted)"
depends_on: ["ui-leftovers"]
boundary: ["frontend/src/components/Home.tsx, RuleDecisionBox.tsx, Rail.tsx, App.tsx (the shell layout)", "frontend/src/stores/board.store.ts (the width class; the rail's default)", "frontend/src/lib/ and its tests", "frontend/src/styles/shell.css, home.css, rule-box.css", "docs/specs/twenty-at-a-glance.md (G9's widths, one line)"]
spec: "docs/specs/responsive-home.md (FR-1 to FR-6); the design: docs/ux/specs/responsive-home.md (Aglaea, 3174fc2)"
gate: "docs/specs/responsive-home.md Acceptance, rows G1 to G8; the Gate section below"
stage: twenty-at-a-glance
seat:
ui_review: true
---

## Goal
0059 ("1024 is real", Pablo: "kinda responsive") and 0060 ("you"): FR-1 to
FR-6 of `docs/specs/responsive-home.md`, from Aglaea's design spec.

## Gate
- [ ] G1: see `docs/specs/responsive-home.md`, Acceptance
- [ ] G2: see `docs/specs/responsive-home.md`, Acceptance
- [ ] G3: see `docs/specs/responsive-home.md`, Acceptance
- [ ] G4: see `docs/specs/responsive-home.md`, Acceptance
- [ ] G5: see `docs/specs/responsive-home.md`, Acceptance
- [ ] G6: see `docs/specs/responsive-home.md`, Acceptance
- [ ] G7: see `docs/specs/responsive-home.md`, Acceptance
- [ ] G8: see `docs/specs/responsive-home.md`, Acceptance

## Done
- 2026-09-29 cut from responsive-home by the FSE

## Next
1. pablo: rule 0062
2. fse: start the supervisor after ui-leftovers lands

## Blockers
none

## Notes
- The frontend uses pnpm; add no dependency (aebc25e). No Go change.
- G3 needs a 3440×1440 viewport: headless Chromium `--window-size=3440,1440`.
