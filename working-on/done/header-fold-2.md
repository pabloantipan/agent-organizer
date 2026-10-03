---
title: The header, second pass - a height budget at compact, landings stay folded, stage buttons that look it, names
status: done
repos: [organizer]
branch: header-fold-2
updated: 2026-10-03
next: "merged 4afddc0; U1-U3 and the spec gaps are the FSE's"
depends_on: []
boundary: ["frontend/src/components/InitiativeHeader.tsx and its CSS", "frontend/src/stores/board.store.ts (landings store folded, FR-11 only)", "frontend/src/components/AgentsView.tsx (group head and toolbar line, FR-13 only)", "frontend/src/components/RoadmapView.tsx and Roadmap.tsx (stage word and row, FR-14 only)", "frontend/src/components/DecisionsView.tsx (aria-expanded on dec-line only)", "frontend/src/styles/shell.css (header and stepper rules only)", "frontend/src/lib/ and its tests", "testdata/fixture-overlay/ and the fixture script (FR-16)", "not: Home.tsx, Rail.tsx, lib/width.ts, home.css, rule-box.css, Overview.tsx, CardDrawer.tsx, Conversation.tsx (widths-and-focus); no Go; not docs/design-system.md"]
spec: "docs/specs/initiative-header.md (FR-10 to FR-16, amendment 3); the ranking: docs/ux/reviews/2026-09-30-rank-header-fold-responsive-2.md (Aglaea, 3f3df2f); the design system as amended there"
gate: "docs/specs/initiative-header.md Acceptance, rows G12 to G17 and G11; the Gate section below"
stage: twenty-at-a-glance
ui_review: true
review: pass
---

## Goal
header-fold's UI leftovers, ranked by Aglaea: FR-10 to FR-16 of
`docs/specs/initiative-header.md`.

## Gate
- [x] G12: see `docs/specs/initiative-header.md`, Acceptance
- [x] G13: see `docs/specs/initiative-header.md`, Acceptance
- [x] G14: see `docs/specs/initiative-header.md`, Acceptance
- [x] G15: see `docs/specs/initiative-header.md`, Acceptance
- [x] G16: see `docs/specs/initiative-header.md`, Acceptance
- [x] G17: see `docs/specs/initiative-header.md`, Acceptance
- [x] G11: see `docs/specs/initiative-header.md`, Acceptance

## Review
- Verdict: pass (code review; the UI review is separate).
- Unmet gate items: none. G11 rerun at ac49856: `XDG_DATA_HOME=$(mktemp -d) make test` green (Go, vitest 64), `npm run build` green, G18 grep empty. G12, G14, G16, G17 from the diff plus the shots and measurements in .wt-notes/hf2-build.
- G13 and G15 pass on the diff, not on the literal check: the fixture has no Needs me card row, so G13 ran through the cell row's Open. Home's card Open is `select(c)` on Home, and that calls the same `folded()` helper. The all-initiatives Agents view is not mounted, so "the all view unchanged" can only be read in the diff: the group head is the same apart from one shared counts string. Both checks ask for something the fixture or the app cannot show. For Pablo: add a card row to the fixture, and drop or rewrite G15's "with none".
- Outside the gate: StageRoadmap.tsx is outside the boundary. The boundary named Roadmap.tsx and RoadmapView.tsx, but the "current" word lives in StageRoadmap.tsx; the change is 3 lines and FR-14 only. Spec boundary wrong, not the build. No test covers FR-11 (a landing stores "folded"): the store has no tests, so a regression would show only by hand.
- Reviewer: hf2-review, 2026-10-03

## Done
- 2026-10-03 sup25 merged header-fold-2 as 4afddc0 after code and UI review pass; make test and npm run build green on main
- 2026-10-03 hf2-build: FR-10 to FR-16 on header-fold-2 (f30a7e5 713558c 944fb1b f16b13f 97cd0d0 b9c0e85 ac49856), rebased on main (main runs ahead only by this card's own commits); G12-G17 measured on the fixture at 1024x640 (header 256 px, scrolls inside; folded across tab and reload; target whole, goal cut; no id on Agents; pointer, chevron, 2px offset, runs 1:3; names and aria-expanded; "2 decisions waiting on you"); G11 green. Shots and numbers in .wt-notes/hf2-build/progress.md
- 2026-10-03 sup25 launched seat hf2-build in .wt/header-fold-2
- 2026-10-03 sup25 launched by the FSE (Pablo's go-ahead, "ok")
- 2026-09-30 0069 ruled by pablo ("Ok", accept as written, 549217f); launchable, sup25 not started yet
- 2026-09-30 cut from initiative-header amendment 3 by the FSE

## Next

## Blockers

## UI review
hf2-ui, 2026-10-03, on `ac49856` (header-fold-2), fixture and `--twenty`,
wails dev :34335, headless Chromium. Shots and logs: `.wt-notes/hf2-ui/`.

**Verdict: pass.** No severity 4 or 3. G12-G17 hold as measured:
- G12: open at 1024x640 the header is 256 px (40.0%), `.ihead-open` scrolls (180 of 450 px) on Work, Decisions, Conversations; 307 px at 1024x768.
- G13: Open on a Needs me card row (`--twenty`, onboarding-flow) stores folded; next tab and reload stay folded; chip and stage tile too. Details then switching initiative stays open, reload too.
- G14: folded at 1024, target whole (122 px), goal cut with an ellipsis (236 px).
- G15: no id or client under the tabs; counts, "1 need you", New agent on the toolbar line.
- G16: pointer, hover surface, chevron on bar stage and tiles; current tile ring 2px offset; no "current"; runs 229:698 px for 1:3.
- G17: Goal/Measure/Scope in/Scope out, more; "Open initiative.yaml in editor"; `dec-line` false then true. init-drafted reads "2 decisions waiting on you", landing focuses 0001 with Rule in view.

**U1, sev 2.** *Cannot:* see the stage after opening Details on the laptop. *Where:* 1024x640-g12-open-work.png. *Evidence:* the bar's stage leaves when open, and the strip sits at 399-527 px under a 180 px area that shows no sign it scrolls (overlay scrollbars). *Severity:* 2, it is one scroll away. *Proposal:* a bottom fade while more is below, or the strip first at compact.

**U2, sev 2.** *Cannot:* keep Rule in view while reading a tall record. *Where:* 1024x640-g17-drafted-landing-scrolled.png. *Evidence:* landing puts 0001's head at the top; one scroll and Rule sits at -362 px. Main does the same, no regression. *Severity:* 2. *Proposal:* a sticky head, as the technical note describes.

**U3, sev 1.** *Cannot:* tell what the record line says. *Where:* Decisions. *Evidence:* the `dec-line` name reads "…waiting owner pablo · 5d waiting". *Severity:* 1. *Proposal:* drop one "waiting" from the name.

**Spec gaps (FSE):**
- G12 "the strip shown" does not say if the strip may be scrolled out of view (U1).
- The tall-record note says the head "stays at the top" while the body scrolls, but main only lands it there (U2); say which is meant.
- A tile whose stage id is a duplicate (init-a's stage 3) opens stage 2. The spec does not say what a tile does in a malformed roadmap.

**Not verified:**
- The all-initiatives Agents view: it is not mounted.
- Regular and wide widths: the scripts need the rail's numbers.
- 200% zoom: below the 1024 minimum window.
- G11: code review's.

## Notes
- The Roadmap rows that said "current" are in StageRoadmap.tsx, not Roadmap.tsx/RoadmapView.tsx as the boundary says; hf2-build changed the word there only (FR-14).
- The all-initiatives Agents view is not mounted (App.tsx renders AgentsView only inside an initiative), so G15's "all view unchanged" is code-only.
- The fixture has no Needs me card row; G13 used the cell row's Open (openAgentsAt), also a landing.
