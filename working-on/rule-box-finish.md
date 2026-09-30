---
title: The rule box keeps focus, shows the recommendation on short records, and names its initiative
status: now
repos: [organizer]
branch: main
updated: 2026-09-30
next: "review: rule-box-finish, branch rule-box-finish, gate met, efa7a34 b6ae943 22e7308 9f1c0c1 3828425"
depends_on: ["responsive-home"]
boundary: ["frontend/src/components/RuleDecisionBox.tsx", "frontend/src/styles/rule-box.css", "frontend/src/components/DecisionsView.tsx (ownerPhrase only)", "frontend/src/components/Conversation.tsx (the People toggle label only)", "frontend/src/lib/ tests"]
spec: "docs/specs/initiative-header.md (FR-7); the design: docs/ux/specs/initiative-header.md (Aglaea, 6c93a49)"
gate: "docs/specs/initiative-header.md Acceptance, rows G9, G11; the Gate section below"
stage: twenty-at-a-glance
seat: hdr-rule
ui_review: true
review: pass
---

## Goal
FR-7 of `docs/specs/initiative-header.md`, from Aglaea's header design and Pablo's header-review-2.

## Gate
- [x] G9: see `docs/specs/initiative-header.md`, Acceptance
- [x] G11: see `docs/specs/initiative-header.md`, Acceptance

## Done
- 2026-09-29 cut from initiative-header by the FSE
- 2026-09-30 hdr-rule built FR-7 on branch rule-box-finish, rebased on main: efa7a34 (UI2 Tab loop), b6ae943 (UI6 name), 22e7308 (UI4 three-line Question), 9f1c0c1 (UI5 ownerPhrase), 3828425 (UI7 People label; `SlackView.tsx:87` aria-label only, sup23 allowed it, text in `peopleLabel`, `lib/health.ts`, tested in `lib/health.test.ts`). Choices in `.wt-notes/hdr-rule/progress.md`.
- G9 (fixture, driver `.wt-notes/hdr-rule/g9.cjs`, headless Chromium, nothing ruled): Tab loop and one box: `.wt-notes/hdr-rule/g9-focus-home-1024.log` (Home, init-drafted 0001, Rule disabled: 9 Tab and 9 Shift+Tab all `inBox=true boxes=1`; Escape back to "Rule init-drafted 0001", `boxes=0`), `.wt-notes/hdr-rule/g9-focus-chosen-1024.log` (option chosen: Cancel → Rule → more loops), `.wt-notes/hdr-rule/g9-focus-decisions-people-1024.log` (Decisions box on init-a 0005 loops the same). Question at three lines on the roster record at 1024: `.wt-notes/hdr-rule/g9-box-1024.log` (Question 2 lines + "more in view", Recommendation 4 of 4 lines visible) against main `.wt-notes/hdr-rule/g9-box-before-main-1024.log` (Question 6, Recommendation 1 line visible); `home-1024.png`, `before-main-1024.png`, `home-1512.png`. Head's name: dialog name "init-drafted 0001 Is this the cell for the first stage?" and "init-a 0005 Where the fixture's logs go" (same logs; `decisions-1024-rule.png`). Owner phrase: 0005 with its owner blanked in the temp fixture copy reads "0005 Where the fixture's logs go waiting no owner · 2d waiting", "owner —" nowhere (`.wt-notes/hdr-rule/decisions-1024.png`, the run's output). People: `aria-label="People, 3 seats, 2 live, 1 deaf" face="3 · 2 live · 1 deaf"` (`.wt-notes/hdr-rule/g9-focus-decisions-people-1024.log`, `decisions-1024-rule-people.png`).
- G11 after the rebase on main: `XDG_DATA_HOME=$(mktemp -d) make test` exit 0, 13 Go packages ok, vitest 5 files 43 tests passed (`.wt-notes/hdr-rule/g11-make-test.log`); `cd frontend && npm run build` exit 0 (`.wt-notes/hdr-rule/g11-npm-build.log`); the G18 grep over `main...rule-box-finish` empty (`.wt-notes/hdr-rule/g11-g18-grep.log`, 0 lines). `wails build` run after `wails dev`; `frontend/wailsjs/runtime` restored.

## Next
1. review: a reviewer that is not hdr-rule, with the UI review (ui_review)

## Blockers
none

## Notes
- 2026-09-29 sup23 runs this card with its sibling, spawned by the FSE after responsive-home landed (d8591aa)
- The frontend uses pnpm; add no dependency. No Go change.
- 2026-09-30 hdr-rule: the People toggle lives in `SlackView.tsx` (the title row header-fold removes), not `Conversation.tsx` as the boundary said; sup23 allowed the one attribute, and hdr-fold carries it when it rebases.
- 2026-09-30 hdr-rule: "one box at a time" already held in the store (Home's `ruleDraft`, Decisions' `ruling`); the second box in UI2 came only from Tab reaching a covered row, which the loop closes. A mouse click on a visible Rule elsewhere still swaps boxes (responsive-home's U2 behaviour).
- 2026-09-30 hdr-rule: the Question cuts at block boundaries, so "three lines" shows the roster record's first paragraph (2 lines) and "more"; a first block longer than three lines is cut at its third line. On this record the six-line clamp also shows only the paragraph at 1512, since a trailing heading is dropped.

## UI review
- Commit: 3828425 (branch rule-box-finish), worktree `.wt/hdr-rule-ui`, `wails dev` on the fixture home, headless Chromium at 1024×640, 1512×945, 3440×1380; driver and shots in `.wt-notes/hdr-rule-ui/`. Nothing ruled, nothing posted into the fixture.
- **Verdict: pass.** No finding of severity 4 or 3 against FR-7. FR-7 holds: Tab and Shift+Tab loop inside the box on Home (init-drafted 0001, Rule disabled and enabled) and on Decisions (init-a 0005), focus visible on every stop, Escape returns to the row's Rule; one box at a time; the Question clamps to three lines on the roster record at 1024 with the Recommendation whole (`home-1024-drafted-words.png`), and a first paragraph longer than three lines is cut at its third line with "more" (temp record copy, restored; `home-1024-long-first.png`); head and dialog name "init-drafted 0001 Is this the cell for the first stage?" and "init-a 0005 Where the fixture's logs go"; Decisions reads "no owner · 3d waiting", "owner —" nowhere (`dec-1024-list.png`, owner blanked in the temp copy, restored); People toggle `aria-label="People, 3 seats, 2 live, 1 deaf"`, `aria-pressed` follows Enter (`conv-1024-people-off.png`).
- **R1.** The lead loses a half-written ruling without warning: with words typed and an option chosen in one box, a click on another row's Rule (visible beside the box, no scrim) opens that box and discards the first box's words and option; reopening shows it empty. Where: Home, Needs me, 1024, `.wt-notes/hdr-rule-ui/home-1024-second-box.png`. Evidence: heuristic, design system "Focus and names" ("What was typed in a box survives it closing for another one, and only Cancel discards it"), Nielsen 5. Severity 3, but outside FR-7 (FR-7 asks one box at a time, which holds; the draft lives in `board.store.ts` `openRule` and Home, responsive-home's), so recorded for the FSE, not a fail. Proposal: keep the draft per record key in the store, or give the box the scrim the design system names so covered rows cannot be clicked.
- **R2.** After a mouse click outside the open box (the Needs me heading, the top bar), the box stays open but the keyboard leaves it: Tab walks to the other rows' Rule and Answer, Escape no longer closes the box, and Answer then navigates away dropping the typed words. Where: Home, 1024, `.wt-notes/hdr-rule-ui/home-1024-click-out.png`, `home-1024-keyboard-second-box.png`. Evidence: heuristic, design system "An open box keeps the keyboard", WCAG 2.4.3. Severity 2: a keyboard-only user never reaches it; the mixed mouse and keyboard lead does. Proposal: close the box, or pull focus back into it, when focus leaves it; or make the rest inert while it is open.
- **R3.** On Decisions the Rule button's accessible name is "Rule", without the record, where Home's says "Rule init-a 0005". Where: Decisions, init-a 0005 expanded, `dec-1024-rule-words.png`. Evidence: heuristic, design system "Names". Severity 1 (only the expanded record shows Rule). Proposal: `aria-label="Rule <initiative> <NNNN>"` as on Home.
- **R4.** The People toggle and the panel it opens count differently: the toggle says "3 seats" (name and face), the panel heads "People 4" (it counts the human). Where: Conversations, init-a, 1024, `conv-1024-people-off.png`. Evidence: heuristic, Nielsen 4. Severity 1. Proposal: one count, the same word in both.
- **Spec gaps** (for the FSE): FR-7 says "one box at a time" but not what happens to what was typed when a second box replaces the first by mouse; the design system says it survives, the store discards it (R1). Neither FR-7 nor the design says whether the box is modal (scrim, inert background) or what happens when focus leaves it by mouse (R2); that is the rule box's placement, a Non-goal here.
- **Not verified:** WKWebView (the installed app's engine): the loop was checked in Chromium only, and the code's WebKit path (every Tab moved by script) was not exercised; VoiceOver: names and roles read from the DOM (aria-labelledby, aria-label, aria-pressed), not heard; 200% zoom and ~400 px width (not in the card's sizes); the Question clamp in the compact sheet at widths below 1024.

## Review
- **Verdict: pass.** Commit 3828425 (branch rule-box-finish). Unmet gate rows: none.
- **G9** (my own run, fixture home, `wails dev` on 34224, headless Chromium 1024×640, driver and log `.wt-notes/hdr-rule-review2/g9.cjs`, `g9-1024.log`; nothing ruled, nothing posted). Tab loop: Home, init-drafted 0001, Rule disabled, 8 Tab and 8 Shift+Tab all `inBox=true boxes=1` over more → 0001 in Decisions → radio → words → Cancel; with an option chosen and words typed, Rule joins the loop (7 Tab, all in box); Escape returns to "Rule init-drafted 0001", `boxes=0`. Decisions, init-a 0005: 5 Tab and 5 Shift+Tab loop radio → words → Cancel, `boxes=1`; Escape back to Rule. One box: `boxes=1` on every stop. Question at three lines, roster record at 1024: Question 2 lines (its first paragraph) with "more" in view, Recommendation 4 of 4 lines visible (`home-1024-box.png`); the builder's main baseline shows Question 6, Recommendation 1 (`.wt-notes/hdr-rule/g9-box-before-main-1024.log`). Head's name: dialog name and head "init-drafted 0001 Is this the cell for the first stage?" and "init-a 0005 Where the fixture's logs go". Owner phrase: 0005's owner blanked in the temp fixture copy (restored): "no owner · 3d waiting", "owner —" not in the page (`decisions-1024-owner.png`); the builder's `decisions-1024.png` did not show that row, hence my run. People: `aria-label="People, 3 seats, 2 live, 1 deaf" face="3 · 2 live · 1 deaf"` (`conversations-1024-people.png`).
- **G11**: `XDG_DATA_HOME=$(mktemp -d) make test` exit 0, 13 Go packages ok, vitest 5 files 43 tests (`g11-make-test.log`); `npm run build` exit 0 (`g11-npm-build.log`); redesign G18 grep over `main...rule-box-finish` 0 lines (`g11-g18-grep.log`).
- **Findings the gate does not cover:** (1) Boundary: the diff touches `SlackView.tsx` (the People toggle lives there; sup23 allowed it, card Notes) and adds `peopleLabel` to `frontend/src/lib/health.ts`, lib code where the boundary says "lib/ tests"; small and tested, but not recorded as allowed. (2) Radios in the box report `outline: none` on focus; whether focus shows elsewhere on them is the UI review's call. (3) Only Chromium; the WebKit Tab path the code comments on was not exercised (the UI review says the same). (4) The fixture stand-in agents I started (`FIXTURE_AGENT_PIDS` 53638 53640 53642 53644 53646) were left running as told; they exit after six hours. `wails dev` (pid 53650) stopped, `wails build` run, `frontend/wailsjs/runtime` restored, worktree clean.
- Reviewer: hdr-rule-review2, 2026-09-30.
