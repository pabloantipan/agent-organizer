---
title: "The map and the report's last small looks, as Aglaea folded them"
status: now
repos: [organizer]
branch: lf69-ui-notes
seat: l69-build
reviewer: l69-rev, l69-ui
review: "l69-rev: pass at c2a9771 (V1-V3, X0); l69-ui: pending"
stage:
updated: 2026-11-02
next: "review: lf69-ui-notes, gate met (V1-V3 fail on 7f88854 and pass; M15-M18, AR31, U9 shown in the review build at 1024x640; X0 clean), c2a9771"
depends_on: []
boundary: ["frontend/src/components/MapView.tsx", "frontend/src/components/MapPanel.tsx", "frontend/src/components/MapFigure.tsx", "frontend/src/components/RunReport.tsx", "frontend/src/components/UsageTable.tsx", "frontend/src/lib/mapSvg.ts", "frontend/src/lib/runReport.ts", "frontend/src/styles/map.css", "frontend/src/styles/runreport.css", "frontend/src/styles/usage.css", "frontend/src/components/MapView.test.tsx", "frontend/src/components/MapFigure.test.tsx", "frontend/src/components/RunReport.lf64.test.tsx", "frontend/src/components/RunReport.test.tsx", "frontend/src/components/Usage.rejected.test.tsx"]
spec: "docs/specs/leftovers-69.md (FR-1 to FR-7)"
gate: "docs/specs/leftovers-69.md#Acceptance → gate"
ui_review: true
touches: []
change_order: {add: [], change: [], retire: []}
autonomy: unattended
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

## Notes
- The fixture-report launcher's stand-in agents are reparented to launchd, so `safe-kill` refuses them; they exit after 6 h on their own (progress.md, Found, not asked).
