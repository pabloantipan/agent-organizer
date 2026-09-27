---
title: The header shows scope, and every stage shows its phase
status: done
repos: [organizer]
branch: glance-header-phase
seat: wave1-header
updated: 2026-09-27
next: "none; merge glance-header-phase (99f0473 036343f ca21639)"
review: pass
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
1. merge glance-header-phase

## Review
- Verdict: pass. G5, G6 and G10 are met by the diff and by running the checks.
- Unmet gate items: none.
- G5: own screenshots `.wt-notes/wave1-header/review-G5-header-scope.png` (init-a in and out of scope, a phase on every phased stage of the stepper), `review-G5-header-noscope.png` (init-b "no scope yet"), `review-G5-G6-roadmap.png` (Roadmap rows with their phase; the duplicate stage, which has no phase, shows none).
- G6: `gateKey` compares all-digit numbers by value, so `4`, `04`, `0004` and ` 4 ` all give `4`; the Roadmap and Overview both use `recordsByGate`. Roadmap: stage 4 draws 0004 from gate `4` and 0099 still says "names no record" (`review-G5-G6-roadmap.png`). Overview draws only the current stage, and the stage that gates on `4` is not current in the fixture as shipped. To make it current I set `done:` on both joins stages in my own throwaway copy and rescanned: `review-G6-overview.png` shows 0004 drawn, ruled. The builder had to do the same.
- G10: `npm run build` in the worktree printed ✓ built. The G18 grep over the diff printed nothing (exit 1).
- Design system beyond the grep: no legacy aliases, only tier-2 tokens and `--font-size-md`, no removed focus ring, and the phase is a neutral lozenge whose word carries it, so it never relies on colour alone. The diff is `InitiativeHeader.tsx`, `StageRoadmap.tsx`, `Overview.tsx`, a new `styles/header.css`, `overview.css` and `roadmap.css`, all inside the boundary. `shell.css` is untouched.
- The gate does not cover this: G6 on Overview cannot be reproduced from the fixture without an edit. A fixture overlay whose current stage gates on `4` would fix that, and it belongs to the backend card's boundary. Left to Pablo.
- Reviewer: wave1-review-header, 2026-09-27

## Blockers
none

## Notes
- 2026-09-27 sup5 runs this card (organizer-probe-sup5), spawned by the FSE after 0033
- 2026-09-27 sup5: seat wave1-header, branch glance-header-phase in .wt/glance-header-phase; evidence under .wt-notes/wave1-header/
- 2026-09-27 sup5: header and Home both draw from shell.css; neither card edits it. New rules go in a new file per card (styles/header.css here), so the two branches merge clean
- 2026-09-27 wave1-header: Overview draws only the current stage, and the fixture's `4` gate is on stage 4 (views), not the current one. For G6-overview-gate4.png both joins stages got `done:` in the throwaway temp copy only (not testdata/), then Rescan. A fixture whose current stage gates on `4` would make this reproducible; that is testdata, the backend card's boundary.
- 2026-09-27 wave1-header: `wails dev` and `wails build` flip frontend/wailsjs/go/main/App.{d.ts,js} to mode 755; restored each time, never committed.
- 2026-09-27 wave1-header: no token missed; phase is a neutral lozenge, the word carries it.
