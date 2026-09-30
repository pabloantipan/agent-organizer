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
