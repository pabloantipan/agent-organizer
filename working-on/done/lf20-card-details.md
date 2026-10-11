---
title: "Focus raises the card; Details never moves"
status: done
repos: [organizer]
branch: lf20-card-details
seat: dt-build
stage: one-window
updated: 2026-10-11
next: "review: lf20-card-details, gate met (D1, D2, X0), f1b6e6e"
depends_on: []
boundary: ["docs/specs/leftovers-20.md Boundary, lf20-card-details"]
spec: "docs/specs/leftovers-20.md (FR-5, FR-6; initiatives-view Amendment 5, I37, I38)"
gate: "docs/specs/leftovers-20.md Acceptance, rows D1, D2 and X0"
ui_review: true
review: pass
---

## Goal
Keyboard focus raises the card as hover does; the header's Details keeps one frame (Aglaea, 9a058c0, from sup56's close).

## Gate
docs/specs/leftovers-20.md, rows D1, D2 and X0.
- [x] D1 (FR-5): vitest D1 in InitiativesView.test.tsx; Chromium computed style, `Open init-a` focused by Tab, `:focus-visible` true: card `rgb(46, 39, 60)` class `raised`, the same as hover (rest `rgb(39, 32, 51)`), at 1024x640 and 1440x900 — .wt-notes/dt-build/d1-d2-chromium-branch.json, chromium-*-D1-focus-branch.png
- [x] D2 (FR-6): vitest D2 (aria-expanded, Details outside the pills); Chromium frame of Details closed, open, closed on init-a: 1024x640 rail open x 928.70 y 53 w 75.30 h 24 all three, goal line under the first line; 1440x900 x 1344.70 y 53 w 75.30 h 24 all three — .wt-notes/dt-build/d1-d2-chromium-branch.json, chromium-*-D2-*-branch.png
- [x] X0: clean clone at f1b6e6e: make test exit 0, pnpm run build exit 0, wails build exit 0, git status --porcelain empty — .wt-notes/dt-build/x0-*.log, x0-porcelain.txt

## Done
- 2026-10-11 dt-build: focus-visible on `Open <id>` sets hover's `.raised`; the header's pills wrap in `.ihead-pills` and Details sits outside them at the first line's right end, so its frame holds closed and open (410946b, ac951eb, f1b6e6e). Progress and reproduction in .wt-notes/dt-build/progress.md.

## Notes
- At 1024 on init-a the target wraps with the goal, so the goal line is under the bar's first line but shares its line with `target 1 Oct`, not alone on it. Rows measured in Chromium, not offscreen WebKit; no review app launched.

## Review
Pass: D1, D2 and X0 met at f1b6e6e (dt-review, 2026-10-11).
- D1: vitest D1 (focusVisible; onFocus/onBlur on `Open <id>`; one `.raised` class for hover and focus, no `.ic:focus` rule) passes. Chromium on wails dev over the fixture from my clean clone, 1024x640 and 1440x900: init-a rest `rgb(39, 32, 51)`; hovered `rgb(46, 39, 60)` `raised`; 8 Tabs, no pointer, `Open init-a` focused, `:focus-visible` true, `rgb(46, 39, 60)` `raised`; one Tab on, back to rest. .wt-notes/dt-review/d1-d2-chromium-review.json.
- D2: vitest D2 (aria-expanded open and closed, Details outside `.ihead-pills`) passes. Chromium frame of Details closed, open, closed on init-a: 1024x640 rail open (250 px) x 928.70 y 53 w 75.30 h 24 all three, goal y 81 under the first line (y 54 h 22); 1440x900 x 1344.70 y 53 w 75.30 h 24 all three. Same json, chromium-*-D2-*-review.png.
- X0: fresh clone at f1b6e6e: `XDG_DATA_HOME=$(mktemp -d) make test` exit 0, `pnpm run build` exit 0, `wails build` exit 0, `git status --porcelain` empty. .wt-notes/dt-review/x0-*.log.
- Unmet: none. Boundary: diff touches only InitiativesView.tsx, InitiativeHeader.tsx, header.css, initiatives.css (card rule comment) and their tests (CharterOnce H2/H4 follow the new markup).
- Not covered by the gate: WebKit frames (Chromium only); at 1024 the goal shares its second line with `target 1 Oct`.
- ui_review: true and no `## UI review` yet: status and place left for it.
- reviewer dt-review, 2026-10-11, commit f1b6e6ec31fe823f70b5c5b09bb6d3a6bb2c0b0f.

## UI review
Pass, commit f1b6e6ec31fe823f70b5c5b09bb6d3a6bb2c0b0f (branch did not move), dt-ui, 2026-10-11. Sev 4/3: none.
How each state was checked (shots and json in .wt-notes/dt-ui/):
- D1 (FR-5, I37), WebKit: headless Playwright WebKit 26.5 over the review build's dist, fixture board stubbed (`wk.mjs`, `webkit-d1-d2.json`), 1024x640 rail open and 1440x900. init-a rest `rgb(39, 32, 51)`; hovered `rgb(46, 39, 60)` `raised`; keyboard only (7 Option-Tab, pointer parked off the card), `Open init-a` `:focus-visible` true, card `rgb(46, 39, 60)` `raised`, link ring 2px solid `rgb(138, 63, 252)`; Tab on, card back to rest; a pointer press then leaving does not raise (`:focus-visible` false). Same raise as hover: met. `webkit-*-D1-focus.png`. vitest D1 passes (29 tests in the two files).
- D2 (FR-6, I38), WKWebView: `Deltagos Review.app` (pid saved, `auth: off`), AX frames and AXPress on my own process, window shots with `screencapture -o -l`. Web area 1024x608 (window 1024x640), rail opened by AXPress: Details @928,53 76x24 closed, open, closed; goal line under the bar's first line beside `target 1 Oct`. 1440x900: @1344,53 76x24 all three, goal on the first line. `wkwebview-1024x608-D2-*.png`, `wkwebview-1440x900-D2-*.png`. Headless WebKit agrees (x 928.70 / 1344.70, y 53, 75.30x24) on init-a, init-many, init-b, init-blind and init-define, no horizontal scroll.
Findings (none fails):
- U1 (sev 1) Two cards raised at once. What: with keyboard focus on one card's `Open <id>` and the pointer resting on another card, both raise, so "this opens" points two ways. Where: Initiatives, `webkit-d1-d2.json` `focusPlusHoverOther: [init-a, init-b]`. Evidence: measured, WebKit, both sizes. Proposal: let the latest of pointer or focus win, or accept as is; for aglaea.
- U2 (sev 2, not this card's FRs) In WebKit plain Tab never reaches `Open <id>`: 80 Tabs from the page start did not land on it; Option-Tab did in 7. WKWebView follows Safari (links in the Tab order only with Option-Tab or Keyboard navigation on), so the raise reaches only those keyboard users. Where: `webkit-d1-d2.json` first run, recorded in run notes. Proposal: decide whether the id link must be in plain Tab order (I12 says Tab reaches it); ties to open question Q1 in docs/ux/memory.md.
Spec gaps (for the FSE): D2 names "1024×640" without saying window or viewport (the app's 1024x640 window gives a 1024x608 web area); D1 says "keyboard focus" without naming Tab or Option-Tab, which differ in WebKit.
For aglaea: U1 (focus versus pointer when both raise), U2 (plain Tab and links in WKWebView).
Not verified in WKWebView: D1 (keyboard focus needs input I may not give in the review app; rests on headless WebKit computed styles and vitest).
