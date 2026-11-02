---
title: "Every count title through one piece, and commas that sit beside their names"
status: now
repos: [organizer]
branch: lf72-counts-commas
seat: l72-build
reviewer: l72-rev, l72-ui
stage:
updated: 2026-11-02
next: "review: lf72-counts-commas, V1 V2 X0 pass, AR35 AR36 for l72-ui, 27962f3"
depends_on: [lf71-count-look]
boundary: ["frontend/src/components/RunTracks.tsx", "frontend/src/components/UsageSessions.tsx", "frontend/src/components/Overview.tsx", "frontend/src/components/Rail.tsx", "frontend/src/components/RunReport.tsx", "frontend/src/components/SecCount.tsx", "frontend/src/styles/runreport.css", "frontend/src/styles/usage.css", "frontend/src/styles/overview.css", "frontend/src/styles/shell.css", "frontend/src/components/RunTracks.test.tsx", "frontend/src/components/RunReport.test.tsx", "frontend/src/components/RunReport.lf64.test.tsx", "frontend/src/components/SecCount.test.tsx", "frontend/src/components/"]
spec: "docs/specs/leftovers-72.md (FR-1 to FR-3)"
gate: "docs/specs/leftovers-72.md#Acceptance → gate"
ui_review: true
touches: []
change_order: {add: [], change: [], retire: []}
autonomy: unattended
---

## Goal
No count title left by hand, and no comma set apart from its name.

## Gate
docs/specs/leftovers-72.md, rows V1, V2, AR35, AR36 and X0.

## Pre-answered
- Base: origin/main at the card's start (includes #59, SecCount).
- Merge target: `main` through talos-lab's PR.
- Tests: vitest beside each file (`cd frontend && npm test`); a test outside the named files may change only where it asserts the old count or comma markup (the boundary's last entry, for that only).
- Design: Aglaea's f62790a; anything else to the FSE.
- Short-sample fallback: the existing fixtures; a state they lack (a `left` list of three) is added to the fixture; never the real home.
- Data shape across states: as the fixtures give it.
- Screen locked: UI rows may render offscreen, and the card says which.
- Evidence: shots under `.wt-notes/<seat>/`.
- Retention: n/a.

## Done
- l72-build (2026-11-02): FR-1 d28a8f1, FR-2 bfc322a, fixture `--wide-slug` 27962f3 on origin/main 35992ed (no rebase needed). V1 and V2 fail on 35992ed (V2: the spec's five) and pass on the branch; X0 passes from a clean clone (1702 vitest, 19 Go packages, porcelain empty). AR35/AR36 states read by AX in the review build; how to put each on screen in `.wt-notes/l72-build/progress.md`.

## Declared changes
- modified `frontend/src/components/RunTracks.tsx`: the `left` list's comma is a sibling `.rt-comma` after its item, outside the link (FR-1)
- modified `frontend/src/styles/runreport.css`: `.rr-card + .rt-comma` pulls the comma into the link's padding (FR-1)
- modified `frontend/src/components/SecCount.tsx:SecCount`: `countClass`, `className`, element `title` props (FR-2)
- modified `frontend/src/components/UsageSessions.tsx`: Sessions disclosure through SecCount (FR-2)
- modified `frontend/src/components/Overview.tsx`: Gates label through SecCount (FR-2)
- modified `frontend/src/components/Rail.tsx`: group count and Roles through SecCount, `rail-group-n` kept (FR-2)
- modified `frontend/src/components/RunReport.tsx:Rulings`: title through SecCount (FR-2)
- modified `frontend/src/styles/shell.css`: `.rail-group-title`, the rail's `<name> · N` row (FR-2)
- modified `frontend/src/components/RunTracks.test.tsx`: V1
- modified `frontend/src/components/SecCount.test.tsx`: V2 widened scan, props test
- modified `testdata/fixture-report/launch.sh`: `--wide-slug`, a slug wider than the 24 px minimum in the last run's left list (AR35)
Risky:
- `Rail.tsx` group header: the name sits inside SecCount's inline-flex; a long group name must still ellipsize with the count visible (checked only with short names)
- `.rail-group-title` `white-space: pre` reaches the rename field's wrapper (an input; no visible effect found)
Not changed, on purpose:
- `Overview.tsx` Exit `0/2` and `FsePanel.tsx` `and N more`: not counts (A8 (d))
- AR33 `.rr-card` padding (FR-3)
- one-letter slugs still show a gap before the comma from `min-width: 24px` (AR28); in progress.md, Found, not asked

## Notes
- The default report fixture's last run already lists three slugs (`d, e, f (not cut)`) but all one letter; `--wide-slug` is what shows AR35.
- The rail's folded groups draw `ASLEEP (1)`, a count form outside this spec (Found, not asked).
