---
title: Roadmap draws stages with their gating decisions
status: done
repos: [organizer]
branch: main
updated: 2026-09-26
review: pass
seat: wave2-roadmap
next: "review: redesign-roadmap, gate G14, G18 met, 7bf24ae a2dae6d"
depends_on: ["redesign-shell-home"]
boundary: ["frontend/src/components/RoadmapView.tsx", "frontend/src/components/StageRoadmap.tsx (new)", "frontend/src/components/Calendar.tsx (embedding only)", "frontend/src/styles/roadmap.css (new)"]
spec: "docs/specs/redesign.md (FR-23, FR-20, FR-21); visual: docs/specs/redesign-mockups.html; values: docs/design-system.md"
gate: "docs/specs/redesign.md Acceptance, rows G14, G18; the Gate section below"
---

## Goal
The redesign, wave 2 of 2: FR-20, FR-21 of `docs/specs/redesign.md`. Decisions 0013–0020.

## Gate
- [x] G14: see `docs/specs/redesign.md`, Acceptance
- [x] G18: see `docs/specs/redesign.md`, Acceptance

## Done
- 2026-09-26 cut from the redesign spec by the FSE
- 2026-09-26 wave2-roadmap: `StageRoadmap.tsx`, `roadmap.css` (7bf24ae) and the Stages | Cards | Calendar switch in `RoadmapView.tsx` (a2dae6d) on `redesign-roadmap`, rebased on main 9bb5afe. G14: `.wt-notes/wave2-roadmap/G14-stages.png` (foundations done; joins current with 0001 at raised and ruled, 0002 at raised, "0099 names no record, not drawn"; views dashed "a week"), `G14-cards.png`, `G14-calendar.png`, from `wails dev -devserver localhost:34118` on `fixture-home.sh`. G18: the grep prints nothing (exit 1). `npm run build` passes; `wails build` done. Choices in `.wt-notes/wave2-roadmap/progress.md`

## Next
1. review: redesign-roadmap, gate G14, G18 met, 7bf24ae a2dae6d

## Blockers
none

## Review
- Verdict: pass. Unmet gate items: none.
- G14: `G14-stages.png` ties to 7bf24ae (legend and labels verbatim): four rows for the four fixture stages, 0001 hollow at raised and solid at ruled, waiting 0002 at raised with its age, 0099 reported not drawn, dashed "two waves", "no appetite", "a week" bars in an undated region with no computed date; Stages | Cards | Calendar switch (a2dae6d), Cards and Calendar screenshots show today's Gantt and month grid. Layout matches R1, R2.
- G18: the grep prints nothing (exit 1); `npm run build` green in `.wt/redesign-roadmap` at a2dae6d. Every `var()` in `roadmap.css` is defined in `tokens.css`, no legacy alias, only the seven sizes, `tabular-nums` on `.srm`, no focus ring removed. Boundary: 3 files, all inside it.
- Outside the gate: `.srm-gem` uses `border-radius: 2px`, off the radius scale (4 for small marks); the design system's Timeline asks for a "today" control, absent here (the lane fits, so nothing scrolls); the header stepper says "now" where Stages says "current".
- Reviewer: wave2-review-roadmap, 2026-09-26

## Notes
- 2026-09-27 sup3: the gate screenshots run against `eval "$(scripts/fixture-home.sh)"` (1993e12): a temp copy of `testdata/home` with `testdata/fixture-overlay` laid over it: init-a a git repo with two FSE-signed commits, proposed records 0002 (the fixture record G15/G16 rule) and 0003 raised by the FSE and owned by pablo, the current stage gated on 0002, three cards seated `wave1-*`, and a cell `organizer-fixture` whose `fse` seat has one question thread open to pablo in the mailbox. `testdata/home` and `status.golden` are unchanged
- `stage:` is left out: the organizer has no roadmap yet (it waits on Pablo's intake); the FSE adds it once one is ruled
- 2026-09-27 sup3 runs this card (organizer-probe-sup3), spawned by the FSE after wave 1 passed
- 2026-09-26 wave2-roadmap: Cards and Calendar each repeat the initiative id heading under the initiative header; left, since Cards is "unchanged" and Calendar "edit only to embed". The browser console against `wails dev` shows `Cannot read properties of null (reading 'nodes')` and a 404 already on Home, before Roadmap mounts; not from this card
