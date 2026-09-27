---
title: The header shows scope, and every stage shows its phase
status: now
repos: [organizer]
branch: glance-header-phase
seat: wave1-header
updated: 2026-09-27
next: "review: glance-header-phase, gate G5, G6, G10 met, 99f0473 036343f ca21639"
depends_on: ["glance-scope-phase"]
boundary: ["frontend/src/components/InitiativeHeader.tsx", "frontend/src/components/StageRoadmap.tsx", "frontend/src/components/Overview.tsx", "frontend/src/styles/ (the CSS files of those three only)"]
spec: "docs/specs/twenty-at-a-glance.md (FR-4, FR-5); values: docs/design-system.md"
gate: "docs/specs/twenty-at-a-glance.md Acceptance, rows G5, G6, G10; the Gate section below"
stage: twenty-at-a-glance
---

## Goal
Roadmap stage twenty-at-a-glance (0032): FR-4, FR-5 of `docs/specs/twenty-at-a-glance.md`.

## Gate
- [x] G5: see `docs/specs/twenty-at-a-glance.md`, Acceptance
- [x] G6: see `docs/specs/twenty-at-a-glance.md`, Acceptance
- [x] G10: see `docs/specs/twenty-at-a-glance.md`, Acceptance

## Done
- 2026-09-27 cut from the spec by the FSE
- 2026-09-27 wave1-header: branch glance-header-phase rebased on main, unmerged: 99f0473 gate matched by number (gateKey in StageRoadmap.tsx, Overview imports it), 036343f phase word on stepper, Roadmap rows and Overview's stage title, ca21639 scope in/out under the goal or "no scope yet". Gate, evidence in `.wt-notes/wave1-header/`: G5 `G5-header-scope.png` (init-a scope in and out, stepper discovery/building), `G5-header-noscope.png` (init-b "no scope yet"), `G5-roadmap-phase.png` (each stage row with its phase; the phaseless duplicate shows none); G6 `G6-roadmap-gate4.png` (views stage draws 0004 from gate `4`, joins still says "0099 names no record, not drawn"), `G6-overview-gate4.png` (0004 ruled row under stage 4; see Notes on how it was made current); G10 `cd frontend && npm run build` → `✓ built in 1.11s`, the G18 grep over `git diff main...glance-header-phase` printed nothing (grep exit 1). `wails build` run after `wails dev` was stopped.

## Next
1. review: glance-header-phase, gate G5, G6, G10 met

## Blockers
none

## Notes
- 2026-09-27 sup5 runs this card (organizer-probe-sup5), spawned by the FSE after 0033
- 2026-09-27 sup5: seat wave1-header, branch glance-header-phase in .wt/glance-header-phase; evidence under .wt-notes/wave1-header/
- 2026-09-27 sup5: header and Home both draw from shell.css; neither card edits it. New rules go in a new file per card (styles/header.css here), so the two branches merge clean
- 2026-09-27 wave1-header: Overview draws only the current stage, and the fixture's `4` gate is on stage 4 (views), not the current one. For G6-overview-gate4.png both joins stages got `done:` in the throwaway temp copy only (not testdata/), then Rescan. A fixture whose current stage gates on `4` would make this reproducible; that is testdata, the backend card's boundary.
- 2026-09-27 wave1-header: `wails dev` and `wails build` flip frontend/wailsjs/go/main/App.{d.ts,js} to mode 755; restored each time, never committed.
- 2026-09-27 wave1-header: no token missed; phase is a neutral lozenge, the word carries it.
