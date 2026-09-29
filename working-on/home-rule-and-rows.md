---
title: Rule from Needs me with the record in view, and Home rows that keep their names
status: now
repos: [organizer]
branch: main
updated: 2026-09-29
next: "review: home-rule-and-rows, branch home-rule-and-rows, gate G1 G2 G3 G7 pass, 8eaf010 3c885ec 05137e2 bf4915a"
depends_on: []
boundary: ["frontend/src/components/Home.tsx (RuleAction, RuleDecisionBox, the row layout, the Launch/Open row, the subtitle)", "frontend/src/lib/queue.ts (the row's kind, verb and words)", "frontend/src/components/TopBar.tsx (the badge title only)", "frontend/src/styles/shell.css, Home and rule-box CSS", "frontend/src/lib/*.test.ts", "testdata/"]
spec: "docs/specs/lead-side-fixes.md (FR-1, FR-2, FR-3, FR-7); the findings: docs/ux/reviews/2026-09-29-first-look.md F1 F2, docs/ux/reviews/2026-09-29-cell-screens.md C1 C6 C7; values: docs/design-system.md"
gate: "docs/specs/lead-side-fixes.md Acceptance, rows G1, G2, G3, G7; the Gate section below"
stage: discovery-in-a-cell
seat: fix-home
ui_review: true
---

## Goal
FR-1, FR-2, FR-3 and FR-7 of `docs/specs/lead-side-fixes.md`: Aglaea's F1,
F2, C1, C6 and C7.

## Gate
- [x] G1: see `docs/specs/lead-side-fixes.md`, Acceptance
- [x] G2: see `docs/specs/lead-side-fixes.md`, Acceptance
- [x] G3: see `docs/specs/lead-side-fixes.md`, Acceptance
- [x] G7: see `docs/specs/lead-side-fixes.md`, Acceptance

## Done
- 2026-09-29 cut from lead-side-fixes by the FSE
- 2026-09-29 fix-home built FR-7 8eaf010, FR-3 3c885ec, FR-1 05137e2, FR-2 bf4915a on home-rule-and-rows, rebased on main 7c86c74; evidence in `/Users/pabloantipan/organizer/.wt-notes/fix-home/`, DOM numbers in `g2-dom-check.txt`, choices in `progress.md`
  - G1: `g1-rule-clamped-claims-portal-0002-1440.png`, `g1-rule-expanded-claims-portal-0002-1440.png`, `g1-rule-clamped-init-drafted-0001-1440.png`, `g1-rule-expanded-init-drafted-0001-1440.png`, `g1-link-lands-decisions-claims-portal-1440.png`; body 160 of 250 px clamped with "show all", 250/250 expanded; link "0002 in Decisions" opens claims-portal's Decisions
  - G2: `g2-home-1024x640.png`, `g2-home-1440x900.png` (before: `before-home-1024.png`, ids 40 px of 82–129); DOM over all 20 rows of `--twenty`: `cut: []` at 1024×640 (narrow, --id-w 129px) and 1440×900
  - G3: `cd frontend && npx vitest run src/lib/queue.test.ts -t FR-3` → "Tests 2 passed | 10 skipped"; `g3-needs-me-open-and-launch-1440.png` ("designer_diego has no persona file" · Open; init-ready · Launch), `g3-open-lands-agents-init-define-1440.png` (sub-view Agents); subtitle "everything waiting on you, oldest first", badge title "everything waiting on you"
  - G7 (after rebase): `XDG_DATA_HOME=$(mktemp -d) make test` → exit 0, all go packages ok, "Tests 20 passed (20)" (`g7-make-test.log`); `npm run build` → exit 0 (`g7-npm-build.log`); redesign G18 grep on `git diff main...home-rule-and-rows` → empty

## Next
1. review: home-rule-and-rows (code and UI review, ui_review: true)

## Blockers
none

## Notes
- `ui_review: true`: the wave gets a UI reviewer (aglaea skill,
  references/ui-review.md) besides the code reviewer.
- FR-1's link opens the initiative's Decisions with `openInitiative(id, "decisions")`. Landing on the record expanded needs a store action carrying the record key (initiative and number) that `DecisionsView` reads to expand and scroll to it, the same thing cell-screens-fix builds for FR-6; once it lands, `RecordBody` in `RuleDecisionBox.tsx` should call it.
- The rule box's record is a `withRecord` prop on `RuleDecisionBox.tsx` (not in the boundary's file list, but it is the rule box); the Decisions tab does not set it.
- fixture-twenty's onboarding-flow cell has an `fse` seat without a persona file, so its row now reads "fse has no persona file" with Open.
- init-a's next date ("2026-10-01 target") wraps in its 96 px column at 1440; not new, not carried.
- New fixture `testdata/fixture-overlay/init-ready` (a cell in definition with every file) adds one Launch row and one initiative to the fixture's Home, which the other builder's screenshots will show.
