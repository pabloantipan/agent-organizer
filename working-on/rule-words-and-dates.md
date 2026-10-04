---
title: The rule box's tables scroll, the facts line stays while ruling, his words kept verbatim, dates in words, make test from a clean checkout
status: next
repos: [organizer]
branch: rule-words-and-dates
updated: 2026-10-04
next: "sup35: may FR-4's fix go in shell.css:65 or as a home.css override? (question posted); rwd-build then fixes it, runs Q4 and Q3's DOM row, reruns Q0 and posts done"
depends_on: []
boundary: ["frontend/src/styles/rule-box.css, decisions.css, home.css; frontend/src/components/RuleDecisionBox.tsx, DecisionsView.tsx, Home.tsx", "frontend/src/components/Conversation.tsx (the composer's attributes only), CardDrawer.tsx and its CSS (cap, scroll, comments' attributes)", "frontend/src/components/TimeZoom.tsx (.tz-more name, Timeline names' dates), StageRoadmap.tsx (dates only)", "frontend/src/lib/dates.ts and lib/ tests", "testdata/fixture-overlay/", "Makefile (the test target only)", "frontend/src/styles/shell.css (the .home max-width rule at :65 only, FR-4; widened by the FSE 2026-10-04)", "not: Go, docs/design-system.md"]
spec: "docs/specs/leftovers-8.md (FR-1 to FR-8); the ranking docs/ux/reviews/2026-10-04-rank-leftovers-8.md (Aglaea, 10bc67a); the design system's Principles as amended there"
gate: "docs/specs/leftovers-8.md Acceptance, rows Q1 to Q7 and Q0"
ui_review: true
seat: rwd-build
---

## Goal
sup33's leftovers with Aglaea's A1-A3.

## Gate
- [ ] Q1-Q7: see `docs/specs/leftovers-8.md`, Acceptance
- [ ] Q0: see `docs/specs/leftovers-8.md`, Acceptance

## Done
- 2026-10-04 rwd-build: FR-1, 2, 3, 5, 6, 7, 8 built on rule-words-and-dates (2d76c08 a77e5ea a2290b0 9595953 c607d1c d1c2ea1 2aa1afb, fixture dff9f41); Q1 Q2 Q5 Q6 Q7 Q0 pass in Chromium and WKWebView, Q3's values pass in WKWebView (`.wt-notes/rwd-build/gate.md`)
- 2026-10-04 0080 ruled by pablo ("Ok", 5fa5b5e); sup35 launched by the FSE
- 2026-10-04 cut from leftovers-8 by the FSE

## Next

## Blockers

## Notes
- Q3's correction bubble and its Escape could not be raised by synthetic
  typing in WKWebView on this machine (a control field without the
  attributes was not corrected either): left to the UI reviewer with a real
  keyboard.
- FR-4 measured (rwd-build, 2026-10-04, dff9f41, fixture): Home at a
  1512×945 window, rail as a strip. The list (`.home-list`, and Needs me
  above it) ends at x=1306 in both engines: `.home` is 1240 px wide because
  `.home { max-width: 1240px }` (`frontend/src/styles/shell.css:65`) holds
  in regular below 1720 (`roomy`, `ROOMY_FROM` in `lib/width.ts`, lifts it
  to 1480). The content edge is at 1477 with classic scrollbars (15 px
  gutter on `.board-wrap`, 20 px padding) and 1492 with overlay ones, so
  the list stops 171 px short (classic) and 186 px short (overlay) — A3's
  "~200". Chromium (classic) and WKWebView (Deltagos Review, classic and
  overlay, AX frames: the table 66..1306) measure the same; no engine
  difference and not the scrollbar gutter. Meanwhile the goal is clamped,
  signals fold to "+3" and the next date is cut to "due · …". The design
  system's Widths caps regular at 1,480. Shots and numbers in
  `.wt-notes/rwd-build/` (`q4-chromium-before.json`,
  `wk-1512x945-Q4-home-strip-classic-before.png`).
