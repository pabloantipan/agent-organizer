---
title: Home widths, third pass - wide from 2200, signals never wrap, columns give way only when they do not fit; three focus and name fixes
status: next
repos: [organizer]
branch: widths-and-focus
updated: 2026-10-03
next: "sup25 builds it (organizer-probe-sup25, launched 2026-10-03)"
depends_on: []
boundary: ["frontend/src/components/Home.tsx, Rail.tsx, RuleDecisionBox.tsx", "frontend/src/lib/width.ts, frontend/src/lib/ and its tests", "frontend/src/styles/home.css, rule-box.css, shell.css (the rail's rules only)", "FR-19 only: frontend/src/components/Overview.tsx (the record row's open), CardDrawer.tsx (focus on open and close), Conversation.tsx (the divider's icon button names)", "frontend/src/stores/board.store.ts only if the class boundary is read there", "not: header-fold-2's files; no Go; not docs/design-system.md"]
spec: "docs/specs/responsive-home.md (FR-13 to FR-19, amendment 3); the ranking: docs/ux/reviews/2026-09-30-rank-header-fold-responsive-2.md (Aglaea, 3f3df2f); the design system's Widths as amended there"
gate: "docs/specs/responsive-home.md Acceptance, rows G13 to G18 and G8; the Gate section below"
stage: twenty-at-a-glance
ui_review: true
---

## Goal
responsive-home-2's UI leftovers and three focus and name fixes, ranked by
Aglaea: FR-13 to FR-19 of `docs/specs/responsive-home.md`.

## Gate
- [ ] G13: see `docs/specs/responsive-home.md`, Acceptance
- [ ] G14: see `docs/specs/responsive-home.md`, Acceptance
- [ ] G15: see `docs/specs/responsive-home.md`, Acceptance
- [ ] G16: see `docs/specs/responsive-home.md`, Acceptance
- [ ] G17: see `docs/specs/responsive-home.md`, Acceptance
- [ ] G18: see `docs/specs/responsive-home.md`, Acceptance
- [ ] G8: see `docs/specs/responsive-home.md`, Acceptance

## Done
- 2026-10-03 sup25 launched by the FSE (Pablo's go-ahead, "ok")
- 2026-09-30 0069 ruled by pablo ("Ok", accept as written, 549217f); launchable, sup25 not started yet
- 2026-09-30 cut from responsive-home amendment 3 by the FSE

## Next

## Blockers

## Notes
