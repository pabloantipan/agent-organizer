---
title: The Ruled line never widens the board (no sideways swing), names and the wake count, Needs me's five landings
status: now
repos: [organizer]
branch: decisions-line-and-names
seat: dln-build
updated: 2026-10-06
next: "review: decisions-line-and-names, X0 met; X1-X5 met in Chromium and WKWebView but X1's trackpad swipe (Pablo, by hand) and X4 row 12 in WKWebView (not verified)"
depends_on: [decisions-still]
boundary: ["frontend/src/components/DecisionsView.tsx, frontend/src/styles/global.css (.dec-meta and the Ruled line only), decisions.css", "frontend/src/components/Conversation.tsx and SlackView.tsx (divider name, wake count)", "the roles drawer component (session state word)", "frontend/src/components/Home.tsx, frontend/src/styles/home.css (Needs me's focus and landing; stage and id tracks)", "frontend/src/lib/width.ts, lib/queue.ts (first-five helper only) and lib/ tests", "not: Go, docs/design-system.md"]
spec: "docs/specs/leftovers-12.md (FR-1 to FR-7); Aglaea cb20fcf, 2203d7d"
gate: "docs/specs/leftovers-12.md Acceptance, rows X1 to X5 and X0"
ui_review: true
---

## Goal
The Decisions board never swings sideways; the rest of the last two waves' leftovers.

## Gate
- [ ] X1-X5: see `docs/specs/leftovers-12.md`, Acceptance (met in both engines except X1's trackpad row, by hand for Pablo, and X4 row 12 not verified in WKWebView; table in `.wt-notes/dln-build/progress.md`)
- [x] X0: see `docs/specs/leftovers-12.md`, Acceptance

## Done
- 2026-10-06 dln-build: c381bb6 (FR-1), 638a84b (FR-2, FR-6), 87ee2d3 (FR-3), afbc690 (FR-4), f23a58c (FR-5), 1ec2867 (FR-7) on decisions-line-and-names, rebased on main 91fe1e0; X0 green from a clean checkout
- 2026-10-06 sup45: seat dln-build, worktree .wt/decisions-line-and-names from main ce1675d
- 2026-10-06 sup45 launched by the FSE
- 2026-10-05 0087 ruled by pablo ("ok", 821b13d)
- 2026-10-05 cut from leftovers-12 by the FSE

## Next

## Blockers

## Notes
- 2026-10-06 dln-build, by hand for Pablo (X1, never passed by the seat): `make review-build` in .wt/decisions-line-and-names; fresh shell there, `eval "$(scripts/fixture-home.sh)"`, copy `working-on/decisions/*.md` into `$FIXTURE_HOME/init-nopeople/working-on/decisions/`; run `build/bin/Deltagos Review.app/Contents/MacOS/organizer`; window 1512×945, then 1024×640; init-nopeople › Decisions › Ruled › "Show the other 82"; 0082 in view; two-finger swipe left and right over the list, slow then fast. Pass: nothing moves or rubber-bands sideways, 0082's chosen ends in "…" and is whole on hover. Optionally the same on the real home's organizer Decisions.
- 2026-10-06 dln-build: X4 row 12 is `seat:init-a/dev_bruno`; no link in the UI calls openNeedsMe for a seat row (only Overview gates and the FSE panel, decisions and threads), so in WKWebView only a landing on row 6 (FSE link 0074) was checked; Chromium called the store.
- 2026-10-06 dln-build: dpc-U1's cut was OneLine's natural width taking scrollWidth (rounded up, 142.73 → 143): five roundings capped a lozenge that fit; fixed in Home.tsx with FR-7. The wake count's red came from `global.css:560` (`.wakes.hot`, outside the boundary); the class is no longer used on it and the rule is left in place.
- 2026-10-06 dln-build, X1 cause (measured before any change, Chromium, fixture init-nopeople with the organizer's 92 records copied in, Ruled open, 0082 in view): `frontend/src/styles/global.css:756` `.dec-meta { flex-shrink: 0; white-space: nowrap }` holds the chosen option in the meta span (`DecisionsView.tsx:310-315`), so 0082's meta is 1043 px and never shrinks; the line, `.dec`, `.dec-ruled` and `.decisions` overflow and `.board-wrap` (`overflow-x: auto`) scrolls: at 1512×913 rail full, overlay, board-wrap sw 1337 / cw 1262; at 1024×609 strip, sw 1337 / cw 978. A deltaX wheel scrolled board-wrap to scrollLeft 75 (1512) and 359 (1024); the document did not move. Logs `.wt-notes/dln-build/x1-before-*.log`.
