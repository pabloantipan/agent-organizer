---
title: The rule box's tables scroll, the facts line stays while ruling, his words kept verbatim, dates in words, make test from a clean checkout
status: next
repos: [organizer]
branch: rule-words-and-dates
updated: 2026-10-04
next: "review: rule-words-and-dates, gate met (Q1-Q7, Q0 in Chromium and WKWebView; Q3's correction bubble left to the UI reviewer)"
depends_on: []
boundary: ["frontend/src/styles/rule-box.css, decisions.css, home.css; frontend/src/components/RuleDecisionBox.tsx, DecisionsView.tsx, Home.tsx", "frontend/src/components/Conversation.tsx (the composer's attributes only), CardDrawer.tsx and its CSS (cap, scroll, comments' attributes)", "frontend/src/components/TimeZoom.tsx (.tz-more name, Timeline names' dates), StageRoadmap.tsx (dates only)", "frontend/src/lib/dates.ts and lib/ tests", "testdata/fixture-overlay/", "Makefile (the test target only)", "frontend/src/styles/shell.css (the .home max-width rule at :65 only, FR-4; widened by the FSE 2026-10-04)", "not: Go, docs/design-system.md"]
spec: "docs/specs/leftovers-8.md (FR-1 to FR-8); the ranking docs/ux/reviews/2026-10-04-rank-leftovers-8.md (Aglaea, 10bc67a); the design system's Principles as amended there"
gate: "docs/specs/leftovers-8.md Acceptance, rows Q1 to Q7 and Q0"
ui_review: true
review: pass
seat: rwd-build
---

## Goal
sup33's leftovers with Aglaea's A1-A3.

## Gate
- [x] Q1-Q7: see `docs/specs/leftovers-8.md`, Acceptance
- [x] Q0: see `docs/specs/leftovers-8.md`, Acceptance

## Done
- 2026-10-04 rwd-build: FR-4 fixed at the source, `.home` capped at 1,480 (shell.css:65, boundary widened by the FSE via sup35; bd1ff21): at 1512×945 with the strip the list reaches the content edge in both engines; gate met, rows in `.wt-notes/rwd-build/gate.md`
- 2026-10-04 rwd-build: FR-1, 2, 3, 5, 6, 7, 8 built on rule-words-and-dates (fbd0d2f e1f0470 8eefbae 802d297 a40e038 6fc221f fc712a2, fixture 0e3f3c1); Q1 Q2 Q5 Q6 Q7 Q0 pass in Chromium and WKWebView, Q3's values pass in WKWebView (`.wt-notes/rwd-build/gate.md`)
- 2026-10-04 0080 ruled by pablo ("Ok", 5fa5b5e); sup35 launched by the FSE
- 2026-10-04 cut from leftovers-8 by the FSE

## Next

## Review
- Verdict: pass (code review; the UI review is separate).
- Commit reviewed: bd1ff21 (`git diff main...bd1ff21`).
- Unmet gate items: none.
- Checks: Q7 fresh `git clone` + `checkout bd1ff21` + `make test`, exit 0
  (Go ok, vitest 191); Q0 detached worktree, `XDG_DATA_HOME=$(mktemp -d)
  make test` 0, `npm test` 0, `npm run build` 0; `wails build` from the
  builder's log only (q0b). Q4's cause is on the card before the fix
  (2b25628 < bd1ff21) and the fix is that cause (shell.css:65 cap).
  Q5: `dateWords` in lib/dates.ts with lib tests; no raw ISO left in
  record meta, Timeline names or Stages (grep).
- Findings, not gate items: (1) boundary: Conversation.tsx also changes the
  queue's RuleBox (attributes and its Escape guard) and keydown handlers, not
  only the composer's attributes; CardDrawer's note edit gains an Enter
  composing guard. Both serve FR-3; the FSE decides. (2) Q3's Escape with a
  correction bubble is guarded in code (preventDefault on composing/229,
  boxStack skips prevented keys) but no one has raised a bubble yet: the UI
  reviewer's. (3) Q4 in WKWebView: the list reaches the edge but init-a's
  goal, first signal and next date still ellipsise while Stage and Phase
  show slack; the gate's "room" reads as list width, so it passes, but the
  column split is not covered by any row.
- Reviewer: rwd-review, 2026-10-04.

## Blockers

## Notes
- Compact after bd1ff21 (rail as a strip, classic): a 1024×640 window keeps
  Home at 923 px (under either cap, unchanged); a 1400×900 window gets 1299
  (was capped at 1240); the list reaches the content edge in both. Compact
  content (window < 1440) never reaches 1,480, so compact is never capped.
- Found, not asked: `.home.roomy { max-width: 1480px }` (shell.css) is now
  redundant with the base cap; the roomy class (`ROOMY_FROM` in lib/width.ts)
  no longer changes Home's width. Left as is.
- Found, not asked: at 1512×945 with the strip, WKWebView still ellipsises
  init-a's next date ("30 Nov due · …") with the row at full width, where
  Chromium fits it; the room is used, so this is the column split, not a cap.
- Found, not asked: ISO dates remain in the card back's "updated" badge,
  InitiativeHeader's target and Roadmap's milestone and target hover titles;
  Retire's dialog is not capped at the window.
- Q3's correction bubble and its Escape could not be raised by synthetic
  typing in WKWebView on this machine (a control field without the
  attributes was not corrected either): left to the UI reviewer with a real
  keyboard.
- FR-4 measured (rwd-build, 2026-10-04, 0e3f3c1, fixture): Home at a
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
