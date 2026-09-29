---
title: Needs me verbs and blocked reasons follow the design system; waiting says whose
status: now
repos: [organizer]
branch: main
updated: 2026-09-29
next: "review: conform-and-waiting, branch conform-and-waiting, gate pass, 35933d1 14b1391 0fe3dca b0ea790 c6a44e5"
depends_on: ["home-rule-and-rows", "cell-screens-fix"]
boundary: ["frontend/src/components/Home.tsx (the waiting signal; the row verbs' class)", "frontend/src/components/InitiativeHeader.tsx (waitingDecisions may move to lib, same count)", "frontend/src/components/Conversation.tsx (the worklist's Rule toggle; the chat list's no-token line)", "frontend/src/components/CardDrawer.tsx (Write about this card)", "frontend/src/components/AgentsView.tsx and Crew.tsx (aria-describedby only)", "frontend/src/lib/ (the owner list and its test)", "CSS", "testdata/"]
spec: "docs/specs/lead-side-fixes.md (FR-10, FR-11, FR-12; amendments 1 and 2; decisions 0056, 0057); the rules: docs/design-system.md principle 3, Inbox row, Disabled actions (7b6afd4)"
gate: "docs/specs/lead-side-fixes.md Acceptance, rows G8, G9, G7; the Gate section below"
stage: discovery-in-a-cell
seat: conform-build
ui_review: true
---

## Goal
FR-10 (0056, waiting says whose), FR-11 and FR-12 (Aglaea's design-system
rewrite, 7b6afd4) of `docs/specs/lead-side-fixes.md`.

## Gate
- [x] G8: see `docs/specs/lead-side-fixes.md`, Acceptance
- [x] G9: see `docs/specs/lead-side-fixes.md`, Acceptance
- [x] G7: see `docs/specs/lead-side-fixes.md`, Acceptance

## Done
- 2026-09-29 cut from lead-side-fixes amendments 1 and 2 by the FSE; replaces waiting-says-whose
- 2026-09-29 conform-build built it on branch conform-and-waiting (35933d1 FR-10, 14b1391 and c6a44e5 fixtures, 0fe3dca FR-11, b0ea790 FR-12), rebased on main 8916167. Choices and findings: `.wt-notes/conform-build/progress.md`
- 2026-09-29 G8: `cd frontend && npm test` → `src/lib/decisions.test.ts` 6 tests pass (in "Tests 26 passed (26)"); on `--twenty` Home reads data-lake "3 waiting · carla, rodrigo", vendor-audit "2 waiting · pablo, no owner", email-digest "1 waiting · fse" (`.wt-notes/conform-build/g8-g9-dom.md`, `g8-g9-home-twenty-1440.png`)
- 2026-09-29 G9: `--twenty` Needs me rows: 5 verbs, all class `act`, 0 `.ib-row button.primary`; open Rule toggle in Conversations `aria-pressed="true"`, background rgb(47,27,85) = --surface-selected, commit Rule inside the box the accent; + and Rule toggles without a token point with aria-describedby at the chat-list line "no token for pablo to post with; …"; Bring crew up and Draft the cell point at their visible reasons; Write about this card absent on claims-portal (no cell), and with an empty roster disabled, pointing at "no seat to write to: …" (`g8-g9-dom.md`, `g9-*.png`)
- 2026-09-29 G7: `XDG_DATA_HOME=$(mktemp -d) make test` → "make test exit=0", "Tests 26 passed (26)" (`g7-make-test.txt`); `cd frontend && npm run build` → "npm run build exit=0" (`g7-npm-build.txt`); G18 grep on `main...conform-and-waiting` → empty (`g7-g18-grep.txt`, 0 lines)

## Next
1. sup19 runs this card

## Blockers
none

## Notes
- 2026-09-29 sup19 runs this card; 0057 accepted as written, so the previous wave's sev 2–1 UI findings stay out (the FSE's next batch)
- The UI reviewer checks against docs/design-system.md's "Disabled actions".
- The frontend uses pnpm; `make test` runs the frontend tests.
- 2026-09-29 conform-build, found and not built (outside FR-11/12's wording): the worklist's Discuss/Answer/Open are still an accent per row; the People toggle in Conversations turns `primary` when on; Home's decision row says "owner —" where the signal says "no owner"; Home's open Rule toggle has no selected surface; a record with no owner is the lead's (`ownedByLead`), so it is a Needs me row and "waits on you" (the fixture's no-owner record sits on vendor-audit for that reason); the new-thread composer repeats the no-token reason per control. Detail in `.wt-notes/conform-build/progress.md`.
