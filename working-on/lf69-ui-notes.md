---
title: "The map and the report's last small looks, as Aglaea folded them"
status: now
repos: [organizer]
branch: lf69-ui-notes
seat: l69-build
reviewer: l69-rev, l69-ui
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

## Notes
- The fixture-report launcher's stand-in agents are reparented to launchd, so `safe-kill` refuses them; they exit after 6 h on their own (progress.md, Found, not asked).
