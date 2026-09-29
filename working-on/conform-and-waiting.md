---
title: Needs me verbs and blocked reasons follow the design system; waiting says whose
status: now
repos: [organizer]
branch: main
updated: 2026-09-29
next: "review: conform-and-waiting, branch conform-and-waiting, gate pass, 327fcd9 601623d f72d7cc e20dbd9 6be6a5a"
depends_on: ["home-rule-and-rows", "cell-screens-fix"]
boundary: ["frontend/src/components/Home.tsx (the waiting signal; the row verbs' class)", "frontend/src/components/InitiativeHeader.tsx (waitingDecisions may move to lib, same count)", "frontend/src/components/Conversation.tsx (the worklist's Rule toggle; the chat list's no-token line)", "frontend/src/components/CardDrawer.tsx (Write about this card)", "frontend/src/components/AgentsView.tsx and Crew.tsx (aria-describedby only)", "frontend/src/lib/ (the owner list and its test)", "CSS", "testdata/"]
spec: "docs/specs/lead-side-fixes.md (FR-10, FR-11, FR-12; amendments 1 and 2; decisions 0056, 0057); the rules: docs/design-system.md principle 3, Inbox row, Disabled actions (7b6afd4)"
gate: "docs/specs/lead-side-fixes.md Acceptance, rows G8, G9, G7; the Gate section below"
review: pass
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
- 2026-09-29 conform-build built it on branch conform-and-waiting (327fcd9 FR-10, 601623d and 6be6a5a fixtures, f72d7cc FR-11, e20dbd9 FR-12), rebased on main 0a34750. Choices and findings: `.wt-notes/conform-build/progress.md`
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

## Review
Verdict: pass. Unmet gate rows: none.

- G8: `waitingOwners` in `frontend/src/lib/decisions.ts` (distinct owners of proposed records, oldest raised first, blank owner → "no owner"); `decisions.test.ts` 6 tests pass in my `make test` run. Fixture records match the claim (data-lake 0002 carla 09-18, 0003 rodrigo 09-20, 0004 carla 09-22; vendor-audit 0002 no owner; email-digest 0002 fse), and the builder's `g8-g9-home-twenty-1440.png` shows "1 waiting · fse", "3 waiting · carla, rodrigo". The header's count only moved to lib, same filter.
- G9: Home's Answer, Launch and Rule go from `act primary` to `act`; no `primary` is left in `Home.tsx`, and the accent stays on the commit in `RuleDecisionBox.tsx:80`. The worklist's Rule toggles are `tiny-btn` with `aria-pressed`, and `.tiny-btn[aria-pressed="true"]` uses `--surface-selected` (`g9-conversations-rule-toggle-open.png`). With no token there is one line in the chat list, and + and both Rule toggles point at it with `aria-describedby`. Bring crew up and Draft the cell point at their visible reasons. Write about this card: the section returns null without a cell; with an empty roster it is disabled and points at "no seat to write to" (screenshots `g9-*`, DOM in `g8-g9-dom.md`, code read).
- G7: `XDG_DATA_HOME=$(mktemp -d) make test` exit 0, Go ok, "Tests 26 passed (26)"; `npm run build` exit 0; G18 grep empty (`.wt-notes/conform-review/g7-*.txt`). Diffstat is inside the boundary; worktree clean.

Not covered by the gate:
- The worklist's Discuss, Answer and Open stay accent on every row, and the People toggle turns `primary`. Principle 3 is still broken in Conversations, but FR-11 does not list them.
- Draft the cell, when `opened` and the preflight is blocked by anything other than cell.json: the button is disabled with no visible reason (`AgentsView.tsx` spans). This predates this card.
- Home's decision row says "owner —" where the signal says "no owner".

Reviewer: conform-review, 2026-09-29.
