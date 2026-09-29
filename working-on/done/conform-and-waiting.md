---
title: Needs me verbs and blocked reasons follow the design system; waiting says whose
status: done
repos: [organizer]
branch: main
updated: 2026-09-29
next: "merged in d4f5658; UI sev 2-1 findings C1-C6 are the FSE's"
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

## UI review
- Ran: branch `conform-and-waiting` at 6be6a5a, detached in `.wt/conform-ui`, `wails dev -devserver localhost:34165` on `scripts/fixture-home.sh --twenty` and on the plain fixture. Browser: a private headless Chromium over CDP, because both MCP browsers were in use by other sessions. Sizes: 1440×900, 1024×640 and 400 px. Keyboard and accessible-name passes covered the Home row verbs, the worklist's Rule toggle, +, Draft the cell, Bring crew up and Write about this card. Screenshots are in `.wt-notes/conform-ui/`. To reach the token-present states I put a fake `tokens.json` in the fixture's temp discuss dir and ran with `DISCUSS_BIND=127.0.0.1:1`, so nothing reached the real mailbox. I also emptied the temp copy of onboarding-flow's roster once. Both are restored.
- Verdict: **pass**. Failing findings: none. Nothing is severity 3 or 4. The lead can do FR-10, FR-11 and FR-12's tasks:
  - Home's waiting signal names whose rulings are waiting ("3 waiting · carla, rodrigo", "2 waiting · pablo, no owner"). It fits whole at 1024×640.
  - The Needs me verbs on both fixtures are default buttons with a visible focus ring, and the accent is only on the rule box's commit. This closes U8 from home-rule-and-rows.
  - The worklist's open Rule toggle reads as selected (`aria-pressed="true"`, `#2f1b55`).
  - Every blocked control named in FR-12 has its reason as `sm` `--fg-muted` text beside or under it, tied by `aria-describedby`.
  - Write about this card is absent without a cell and says "no seat to write to" with an empty roster.

**C1: in Conversations the accent still marks every row, not the action (2).**
1. In the needs-me worklist, the lead's eye goes to Discuss. With Rule open, four accent-shaped buttons are on the view: People "2", Discuss, the commit Rule and Start. The commit, the one action that matters, is not the one that stands out.
2. onboarding-flow › Conversations › needs me, with a token, Rule open: `.wt-notes/conform-ui/conversations-needs-me-rule-open-1440.png`. Measured: `tiny-btn primary` on the People toggle and on Discuss (`#8a3ffc`). Every card row and thread row (Discuss, Answer, Open) gets one (`Conversation.tsx`).
3. heuristic: design system principle 3, Inbox row, and the anti-pattern "an accent button on every row of a list".
4. Severity 2. FR-11 names only the Rule toggle in Conversations, so this is not the builder's miss.
5. Proposal: make Discuss, Answer and Open default buttons, and mark the People toggle with `aria-pressed` and the selected surface, as the Rule toggle does now.

**C2: "no token" is said three ways on one screen (2).**
1. Without a token, the lead reads three different messages:
   - the chat-list line: "no token for pablo to post with; the cell bootstrap issues one";
   - the chat header: "no token, read only · open /private/tmp/…/discuss/tokens.json: no such file or directory", a raw OS error with a path;
   - a red danger banner in the composer: "No token for the human seat: run the cell bootstrap to issue one".

   The composer is still drawn in full, with a disabled Start.
2. onboarding-flow › Conversations on `--twenty`: `.wt-notes/conform-ui/conversations-onboarding-no-token-1440.png` and `conversations-needs-me-no-token-1440.png`.
3. heuristic: design system Disabled actions ("blocked": one reason in `sm` `--fg-muted`, not the danger role); Nielsen 8 and 9; the checklist's Words (no internal paths on screen).
4. Severity 2.
5. Proposal: keep the FR-12 line as the only reason. Drop the composer banner and show the composer's controls blocked and pointing at that line, or treat the composer as "never here". Keep the raw error out of the header.

**C3: the two Rule toggles show "open" differently (1).**
1. On Home, an open Rule looks the same as a closed one. In Conversations, an open Rule turns the selected surface. The lead is not lost on Home, because the row highlights and the box is anchored to it.
2. Home, plain fixture, Rule open by keyboard: background `rgb(39,32,51)` in both states, with `aria-expanded` only (`home-plain-rule-open-toggle-1440.png`). Compare `conversations-needs-me-rule-open-1440.png`.
3. heuristic: Nielsen 4 (consistency).
4. Severity 1.
5. Proposal: give Home's open Rule the same `--surface-selected`, and keep `aria-expanded` since it opens a box.

**C4: the row verbs have no name of their own for a screen reader (2).**
1. A keyboard or screen-reader lead tabbing through Needs me hears "Rule, button, collapsed" four times and "Open" twice, with no record or initiative in the name.
2. Home, plain fixture and `--twenty`: accessible names are "Rule", "Open", "Launch" and "Agents" (DOM). Focus is visible on each (`home-1024-keyboard-rule-focus.png`).
3. heuristic: WCAG 2.4.6 and 2.4.4 (the row text is there in browse mode, but not on focus).
4. Severity 2. It predates this card, but these are the controls FR-11 touched.
5. Proposal: point `aria-describedby` at the row's subject, or add an `aria-label` such as "Rule init-a 0002".

**C5: owner words disagree, and the lead is named in the third person (1).**
1. On vendor-audit, Home's row says "owner —" while the signal says "no owner". On claims-portal and init-a, the state says "waits on you" next to "1 waiting · pablo" or "3 waiting · pablo, alejandro".
2. `home-twenty-1440.png` and `home-plain-1440.png`.
3. heuristic: Nielsen 2 and 4.
4. Severity 1.
5. Proposal: use one word for no owner, and read the lead as "you" in the signal ("3 waiting · you, alejandro").

**C6: the card back points at an action it does not draw (1).**
1. On a card with no cell, the Comments hint says comments are "carried into 'Write about this card'", but that action is not drawn there.
2. claims-portal › Claim form: `card-back-claims-portal-no-cell-1440.png`.
3. heuristic: Nielsen 2.
4. Severity 1.
5. Proposal: drop that clause from the hint when the initiative has no cell.

Already the FSE's and not raised again: after Escape closes Home's rule box, focus goes to `body` (U2, U7 of home-rule-and-rows).

**Spec gaps (for the FSE)**
- FR-11 lists only the Rule toggle for Conversations. Principle 3 also covers the worklist's Discuss, Answer and Open, and the People toggle (C1).
- FR-11 says "an open Rule toggle is marked with `aria-pressed` and `--surface-selected`", after a list that includes Rule on Home. It does not say whether Home's Rule, which is a disclosure, is covered (C3).
- FR-12 puts the no-token reason in the chat list, but says nothing about the composer's banner or the header's raw error, which repeat it (C2).
- No FR covers the accessible names of row verbs (C4).
- FR-10 does not say whether the lead's own name reads "you" (C5).

**Not verified**
- Draft the cell's opened ("Drafting…") and error states: they need a real Open, which is not allowed. The checking state is too brief to catch.
- Home's Answer verb and the worklist's thread rows (Answer, Open, and Rule on a thread): neither fixture has a thread asking the human. I read the code only (`act`, `tiny-btn primary`).
- WKWebView (the Safari 15 floor). Everything was seen in Chromium.
- VoiceOver itself. Names come from the DOM and ARIA attributes.
- 400 px: the shell scrolls sideways (586 px), and the waiting lozenge is clipped to 14 px. This predates the card, and the app's minimum window is 1024 (`main.go`).
- Reviewer: UI review session (aglaea references/ui-review.md), 2026-09-29.
