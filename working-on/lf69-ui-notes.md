---
title: "The map and the report's last small looks, as Aglaea folded them"
status: now
repos: [organizer]
branch: lf69-ui-notes
seat: l69-build
reviewer: l69-rev, l69-ui
review: "pass: l69-rev at c2a9771 (V1-V3, X0); l69-ui at c2a9771 (M15-M18, AR31, U9)"
stage:
updated: 2026-11-02
next: "merged as organizer #55 440d577; supervisor moves it to done/"
depends_on: []
boundary: ["frontend/src/components/MapView.tsx", "frontend/src/components/MapPanel.tsx", "frontend/src/components/MapFigure.tsx", "frontend/src/components/RunReport.tsx", "frontend/src/components/UsageTable.tsx", "frontend/src/lib/mapSvg.ts", "frontend/src/lib/runReport.ts", "frontend/src/styles/map.css", "frontend/src/styles/runreport.css", "frontend/src/styles/usage.css", "frontend/src/components/MapView.test.tsx", "frontend/src/components/MapFigure.test.tsx", "frontend/src/components/RunReport.lf64.test.tsx", "frontend/src/components/RunReport.test.tsx", "frontend/src/components/Usage.rejected.test.tsx"]
spec: "docs/specs/leftovers-69.md (FR-1 to FR-7)"
gate: "docs/specs/leftovers-69.md#Acceptance → gate"
ui_review: true
touches: []
change_order: {add: [], change: [], retire: []}
autonomy: unattended
prs:
  - {repo: organizer, pr: 55, target: main, state: merged, merge: 440d577}
---

## Goal
Nothing on the map or the report looks pressable unless it is, and no ring is cut.

## Gate
docs/specs/leftovers-69.md, rows V1-V3, M15-M18, AR31, U9 and X0.

## Pre-answered
- Base: origin/main at the card's start.
- Merge target: `main` through talos-lab's PR.
- Tests: vitest beside each file (`cd frontend && npm test`); UI rows in the review build.
- Design: Aglaea's 160f7fc; anything else to the FSE, which asks the judge-design subagent while Pablo is away.
- Short-sample fallback: a state the fixture lacks is added to the fixture; never the real home.
- Data shape across states: as the fixtures give it.
- Screen locked: UI rows may render offscreen, and the card says which.
- Evidence: shots under `.wt-notes/<seat>/`.
- Retention: n/a.

## Done
- l69-build, 2026-11-02: FR-1 to FR-7 on `lf69-ui-notes` at c2a9771, rebased on origin/main 7f88854: b69906b (FR-7), 981e0fa (FR-4), 67da1ab (FR-6), 2be1282 (FR-1), 4965644 (FR-2), b6cce13 + f1513ba (FR-3, scroll-padding added after the review build showed the focused rightmost node flush at the edge), 97b78d1 + c2a9771 (FR-5, the panel stuck on `Drawing the map…` on a map shown once: MapTags read a ref before it was set). Vitest rows fail on 7f88854 (10) and pass; UI rows on screen at 1024x640, unlocked, window shots; X0 clean. Evidence and the reviewer's steps: `.wt-notes/l69-build/progress.md`.

## Declared changes
- modified `frontend/src/components/UsageTable.tsx`: title `Not accepted · N`; `REJECTED_WHY` opens with `discuss-record did not take these.` (FR-7)
- modified `frontend/src/lib/mapSvg.ts`: added `Corner`, `cornerOf`, `cornerRadius`; `DrawnNode.corner` (FR-4)
- modified `frontend/src/components/MapFigure.tsx`: node button `borderRadius` from `cornerRadius` (FR-4)
- modified `frontend/src/styles/runreport.css`: `.rr-wave-line` `display: block; white-space: normal` (FR-6)
- modified `frontend/src/styles/map.css`: `button.linkish.map-trail-go` (FR-1), `.map-panel-title` no ring on focus (FR-2), `.map-scroll` padding 4 px and scroll-padding (FR-3)
- modified `frontend/src/components/MapView.tsx`: trail current `aria-current="location"` (FR-1); `panelOrder`, order per initiative and level, scroller held as state for `MapTags`, a failed figure reports `[]` (FR-5)
- modified `frontend/src/components/MapPanel.tsx`: `order` prop; `Drawing the map…` in the list's place until positions are known (FR-5)
- modified `frontend/src/components/MapView.test.tsx`, `MapFigure.test.tsx`, `RunReport.lf64.test.tsx`, `Usage.rejected.test.tsx`: V1, V2, V3 rows and the amended expectations
- modified `frontend/src/lib/mapSvg.test.ts`: `drawnNodes` result carries `corner: null` (the test beside `mapSvg.ts`)
Risky:
- `cornerOf`: reads a path shape's radius from where its outline starts; a mermaid shape that starts elsewhere falls back to 4 px, never a wrong large radius (capped at half the box)
- `.rr-wave-line` as a block: a long pressable footer now wraps like the still one instead of running on one line
Not changed, on purpose:
- `global.css` `button` and `button.linkish`: scoped overrides in the boundary's sheets instead
- `testdata/`: the fixtures already put every row on screen

## Review
- Verdict (l69-rev, code gate): **pass**. Unmet rows: none of V1, V2, V3, X0. Reviewer l69-rev, 2026-11-02, commit reviewed c2a9771 (on origin/main 7f88854; the branch did not move). M15-M18, AR31, U9 are l69-ui's.
- change-check `organizer lf69-ui-notes --base origin/main`: 12 files, 4 flags; undeclared 0, declared not changed 0. `outside boundary frontend/src/lib/mapSvg.test.ts` is the test beside `mapSvg.ts` (spec Boundary: "and their tests"; declared; one line, `corner: null` on the result). `untested? firstPath, cornerOf, cornerRadius`: private helpers reached through `drawnNodes` and the button style, which V2 asserts (stadium 17.5, mail_relay, cylinder and plain rects 4px, rect rx 5).
- V1-V3 (`-t leftovers-69` over MapView, MapFigure, RunReport.lf64, Usage.rejected tests): 7f88854 with the tests copied in: 11 failed, 5 passed (guards); c2a9771: 16 passed. Every FR has a failing row on main.
- Cases the builder's tests lack (scratch vitest, removed): FR-1 at Context alone, one `span aria-current=location`, no button; at L3 two `button.linkish.map-trail-go`, then `harbor-api` as span. FR-2: `.map-panel-node`, `.map-trail-go`, `.map-node` still win `2px solid var(--focus-ring)` on focus-visible. FR-3: the boundary's other scroll region, `.week-list` (usage.css), already pads 4 px. FR-4: `ry` only 3 gives 3/3; `rx` 99 caps at half the box; scale(2) doubles it; a cylinder path gives 4px. FR-5: a partial order trails undrawn nodes in map.json order; a failed figure reports `[]`. FR-7: one row reads `Not accepted · 1`; zero rows renders nothing.
- X0 in a clean clone: `pnpm install --frozen-lockfile` ok; `make test` exit 0 (go 19 ok, vitest 100 files 1687 passed), test run **fresh**, test-lease run 1ba9c4023f8aaef090275c1fdffb2ff5; `wails build` 0; `make review-build` 0; `frontend/wailsjs/runtime` unchanged; `git status --porcelain` empty. Logs: `.wt-notes/l69-rev/`.
- Note (goes to the FSE, a later leftovers spec if wanted): `cornerOf` reads `rx` as a bare number, so `rx="6px"` or `rx="0.5em"` gives 4px, not 6; a `<g class="label-container">` wrapping a `<rect rx="8">` gives 4px too (only a path is looked for under a group). Mermaid's fixture output uses neither, so no row fails.
- Note (goes to the FSE): `.rt-waitline` (runreport.css:160) is `overflow: hidden` around `rr-card` buttons; a clip region, not a scroll one, so outside FR-3's words, but its rings may be cut. Unproved on screen.
- Note (goes to the FSE): the reading order is kept per initiative and level for the session; a map re-read that adds a node lists it last until the figure reports, then reorders once.

## UI review
- Verdict (l69-ui): **pass**. Commit reviewed c2a9771 (detached worktree `.wt/l69-ui`, removed after). Rows unmet: none. Sev 4/3: none. Every state on screen in the review build (`make review-build`, exit 0), screen unlocked (`CGSSessionScreenIsLocked` absent), 1024x640 by `ORGANIZER_REVIEW_RESIZE=1024x640@3`, AX of my own pid and `screencapture -o -l`; nothing offscreen. Env checked before each launch: harbor map fixture under `$TMPDIR/organizer-fixture-map.*`, report fixture under `/private/tmp/organizer-fixture.7lOte9`. Shots `.wt-notes/l69-ui/shots/`.
- Shared test run: **reused**, `test-lease: reused run 1ba9c402-68536 of c2a97714b9f1 by organizer-probe-l69-rev`, exit 0 (`.wt-notes/l69-ui/x0-make-test.log`).
- M15 **met**: harbor › Roadmap › Map, pick harbor-api, Open harbor-api's modules: trail `Context › Containers › harbor-api`; Context and Containers are `AXButton .linkish.map-trail-go` drawn violet (`button.linkish.map-trail-go { color: var(--accent-fg) }`, 8.9:1 on ground per the design system); harbor-api is `.map-trail-here`, `--fg` semibold, an AXGroup, not a button. `1024x640-m15-l3-trail.png`.
- FR-2 (A2): at that moment `map-panel-title` "Modules of harbor-api" is FOCUSED (AX `focus`) and no ring is drawn (same shot). Proved by the shot plus the rule `.map-panel-title:focus, .map-panel-title:focus-visible { outline: none }` (map.css:104), which covers the keyboard case too; a real Tab was not sent (no synthetic keys). Enough with V1's vitest.
- M16 **met**: on Containers, AXFocused on Card gateway (rightmost; the scroller moved to `.edge-right.edge-left`, the node at 1649 in a 1282+458 scroller): ring drawn whole on all four sides, with a gap before the 1 px edge line. AX focus did draw the `:focus-visible` ring here (`button.map-node:focus-visible { outline: 2px solid var(--focus-ring); outline-offset: 2px }`); `.map-scroll` pads 4 px with `scroll-padding: 4px` (map.css:45). `1024x640-m16-ring-rightmost.png`, `1024x640-m16-ring-zoom.png`.
- M17 **met**: Mail relay picked: the inset accent edge follows the pill's radius (`1024x640-m17-pill-picked.png`, `1024x640-m17-zoom.png`); harbor_db (cylinder) picked keeps 4 px corners (`1024x640-m17-cylinder-picked.png`, `-cylinder-zoom.png`).
- M18 **met**, twice: first launch, harbor-ruled › Map, 35 AX polls of the panel: only two states ever, `.map-panel-drawing` alone (polls 1-20), then harbor-web, harbor-api, harbor-ledger, harbor_db, Card gateway, Mail relay (reading order); never alphabetical (`m18-poll.txt`, `1024x640-m18-drawn.png`). Reload = relaunch of my own pid, harbor › Map: poll 1-25 drawing, 26-30 the same reading order (`m18-reload-poll.txt`).
- AR31 **met**: fixture › Overview › Last run · 20 Oct, Waves in this window: `sup2/1 · …` (still) and `sup1/1 · …` (pressable `.rr-wave-line`) show the same gap before the first `·`, by eye on the 1x shot and zoom (`1024x640-ar31-footers.png`, `1024x640-ar31-zoom.png`); not re-measured in points (the builder's 2x measure stands, 5.0 pt both).
- U9 **met**: Usage, scrolled by AXScrollToVisible: title `NOT ACCEPTED · 2` (`.sec-title` uppercases `Not accepted · 2`; no proper name in it), the line `discuss-record did not take these. Sent again when its usage changes. Nothing for you to do; the reason is for the FSE.` in its own case, above the two rows `fixture-u-w1a`, `fixture-u-w1c` (`1024x640-u9-rejected.png`).
- Design system: tier-2 tokens only in the diff (`--accent-fg`, `--fg`, `--space-1`, `--focus-ring`); accent text 8.9:1; rings whole; scroll-region padding as written; no uppercased proper name. 1440x900 not shot: no row reads differently there (M16 is the 1024 case; the others do not depend on width).
- Findings: none at 4 or 3. One at 1: on U9's title the count `2` sits after a wider gap than the `·` before it (`NOT ACCEPTED ·  2`), in the count's own face; where: Usage, `1024x640-u9-rejected.png`; evidence: the shot; severity 1; proposal: none unless Aglaea wants the count's gap the same as AR31's (for aglaea).
- Spec gaps (for the FSE): none found.
- For aglaea: the U9 count's gap above (sev 1).
- Not verified: AR31 in points (by eye only); FR-2 and M16 after a real Tab (no keys may be sent; rule and AX focus stand).
- Process (mine): my first map launch was a double fork, reparented to launchd so `safe-kill` refused it; I quit those two pids (both mine, saved) by AXPress on their own app menu's Quit, then relaunched as a tracked task. The report fixture's 8 stand-in agents were refused by `safe-kill` as the builder found (they exit after 6 h); their temp dir is removed.

## Notes
- The fixture-report launcher's stand-in agents are reparented to launchd, so `safe-kill` refuses them; they exit after 6 h on their own (progress.md, Found, not asked).
