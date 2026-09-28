---
title: The header clamps and the page body scrolls
status: done
repos: [organizer]
branch: main
updated: 2026-09-28
next: "review: glance-header-scroll, gate G13, G14, G10 met, 2153142 bc3f970 fa37615"
depends_on: []
boundary: ["frontend/src/components/InitiativeHeader.tsx", "frontend/src/App.tsx (the initiative page's layout only)", "frontend/src/styles/ (the header's and the shell's CSS only)", "testdata/fixture-overlay/ (a long goal and measure, if missing)"]
spec: "docs/specs/twenty-at-a-glance.md (FR-10, FR-11); values: docs/design-system.md"
gate: "docs/specs/twenty-at-a-glance.md Acceptance, rows G13, G14, G10; the Gate section below"
stage: twenty-at-a-glance
seat: wave1-scroll
review: pass
---

## Goal
Pablo's review of the installed app (0038): FR-10, FR-11 of `docs/specs/twenty-at-a-glance.md`.

## Gate
- [x] G13: see `docs/specs/twenty-at-a-glance.md`, Acceptance
- [x] G14: see `docs/specs/twenty-at-a-glance.md`, Acceptance
- [x] G10: see `docs/specs/twenty-at-a-glance.md`, Acceptance

## Done
- 2026-09-28 cut from the spec by the FSE
- 2026-09-28 built by wave1-scroll on `glance-header-scroll`, rebased on main: 2153142 (fixture: init-a's long goal and measure in `testdata/fixture-overlay/`), bc3f970 (header clamp, more/less), fa37615 (body is the one scroll container). G13: `G13-clamped.png` (two lines of each plus "more"), `G13-more.png` (both opened, "less" shown), `G13-focus.png` (keyboard focus ring on the control); init-b's short goal shows no "more". G14 at 1280×720: `G14-decisions-top.png`, `G14-decisions-bottom.png` (0002 expanded, scrolled to the last ruled row), `G14-overview-top.png`, `G14-overview-bottom.png`; header top 45 and tabs bottom 423 in all four, last row in view at the bottom. Screenshots in `.wt-notes/wave1-scroll/`. G10: `npm run build` → `✓ built in 1.12s`; the G18 grep over `main...glance-header-scroll` printed nothing (exit 1). `wails build` run after `wails dev`.

## Review
- Verdict: pass. Unmet gate items: none. Reviewer: wave1-review-scroll, 2026-09-28.
- G13: init-a's goal and measure clamp at two lines (measured 2 of 3) with "more"; after "more" 3 of 3 and "less"; init-b (no goal) shows no control. `G13-clamped.png`, `G13-more.png`, `G13-init-b-short.png`.
- G14: 1280×720, Decisions with 0002 expanded wheel-scrolled to scrollTop 866 of 866 (last ruled row 0001 at 640–680), Overview to 230 of 230; header 45–423 and tabs 391–423 at top and bottom, document never scrolls. `G14-*.png`, `G14-measure.txt`.
- G10: `npm run build` ✓; the G18 grep printed nothing (exit 1); every token the diff uses exists in `tokens.css`.
- Evidence in `.wt-notes/wave1-review-scroll/`. The main checkout's `scripts/fixture-home.sh` lays main's overlay, which has no long goal; G13 ran from the worktree's copy, which the diff adds to.
- Not gated: at 1280×720 the header is 378 px and leaves the body 297 px; the unclamped scope lines add to that.

## Next
1. review: glance-header-scroll, gate G13, G14, G10 met, 2153142 bc3f970 fa37615

## Blockers
none

## Notes
- 2026-09-28 sup8 runs this card (organizer-probe-sup8), spawned by the FSE after 0038
- 2026-09-28 the body already scrolled at 1280×720 on main (Chromium and the WKWebView window); Pablo's "no scroll" was a header taller than the window. The clamp fixes it; fa37615 makes the scroll row explicit and opens each tab at its top.
- 2026-09-28 not in this boundary: Conversations' body overflows by 25 px (inside `.slack`, the Slack view's CSS), a small second scroll; the scope lines are not clamped and can still crowd the body at the minimum window height (640).
- 2026-09-28 the screenshots ran from the worktree's `scripts/fixture-home.sh`: the main checkout's lays main's overlay, which has no long goal until this merges.
