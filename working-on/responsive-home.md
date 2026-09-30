---
title: Home holds the glance at 1024, on the laptop and on the ultrawide
status: now
repos: [organizer]
branch: main
updated: 2026-09-29
next: "sup21 runs this card (organizer-probe-sup21), spawned by the FSE 2026-09-29 after ui-leftovers landed"
depends_on: ["ui-leftovers"]
boundary: ["frontend/src/components/Home.tsx, RuleDecisionBox.tsx, Rail.tsx, App.tsx (the shell layout)", "frontend/src/stores/board.store.ts (the width class; the rail's default)", "frontend/src/lib/ and its tests", "frontend/src/styles/shell.css, home.css, rule-box.css", "docs/specs/twenty-at-a-glance.md (G9's widths, one line)"]
spec: "docs/specs/responsive-home.md (FR-1 to FR-6); the design: docs/ux/specs/responsive-home.md (Aglaea, 3174fc2)"
gate: "docs/specs/responsive-home.md Acceptance, rows G1 to G8; the Gate section below"
stage: twenty-at-a-glance
seat: resp-build
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
- 2026-09-29 sup21 launched resp-build on branch responsive-home (worktree .wt/responsive-home, from 4c3c78d); reviewers resp-review (code), resp-ui (UI), resp-reader (G7, timed)

## Next
1. sup21 runs this card

## Blockers
none

## Notes
- 2026-09-29 sup21 runs this card, spawned by the FSE after ui-leftovers landed (508d9a8)
- The frontend uses pnpm; add no dependency (aebc25e). No Go change.
- G3 needs a 3440×1440 viewport: headless Chromium `--window-size=3440,1440`.
