---
title: Home widths, third pass - wide from 2200, signals never wrap, columns give way only when they do not fit; three focus and name fixes
status: now
repos: [organizer]
branch: widths-and-focus
updated: 2026-10-03
next: "review: widths-and-focus, gate met (G13-G18, G8 on 9fdb19d, rebased on 4afddc0)"
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
- [x] G13: see `docs/specs/responsive-home.md`, Acceptance
- [x] G14: see `docs/specs/responsive-home.md`, Acceptance
- [x] G15: see `docs/specs/responsive-home.md`, Acceptance
- [x] G16: see `docs/specs/responsive-home.md`, Acceptance
- [x] G17: see `docs/specs/responsive-home.md`, Acceptance
- [x] G18: see `docs/specs/responsive-home.md`, Acceptance
- [x] G8: see `docs/specs/responsive-home.md`, Acceptance

## Done
- 2026-10-03 wf-build: FR-13 to FR-19 on widths-and-focus (e0875dc..9fdb19d, 9 commits), rebased on main after header-fold-2 (4afddc0, no conflict); G8 green and G13-G18 measured on 9fdb19d; logs, shots and scripts in .wt-notes/wf-build/ (progress.md)
- 2026-10-03 sup25 launched seat wf-build in .wt/widths-and-focus
- 2026-10-03 sup25 launched by the FSE (Pablo's go-ahead, "ok")
- 2026-09-30 0069 ruled by pablo ("Ok", accept as written, 549217f); launchable, sup25 not started yet
- 2026-09-30 cut from responsive-home amendment 3 by the FSE

## Next

## Blockers

## Notes
- FR-16 choices: the goal is kept first, then the next date, which can show alone. Goal at least 224 px (about 30 characters, measured at 36 or more), signals at least 160 (lib/width.ts compactColumns). Regular keeps its two-line narrow fallback.
- The --twenty fixture no longer cuts a lozenge or overflows signals at 1440, 1920 or 3440 (1920 is regular now). G13's ellipsis and G14's +N are shown by forcing one cell narrower in the DOM; see g13.log and g14.log.
- Found: Home's list grew to its min-content, so a column that did not fit widened the page. `.home`'s track and sections are now minmax(0, 1fr). Also fixed a +N measure loop that the text span caused (81f0693).
- Not in the boundary, left open: CellStateLz (Crew.tsx) has no text span. After Answer, Tab next reaches the message's reply button, named "↩", and its branch button, which has no name (Conversation.tsx:440-441). The divider's icon buttons are 20x28, under the 24 px minimum (.rail-icon in global.css).
