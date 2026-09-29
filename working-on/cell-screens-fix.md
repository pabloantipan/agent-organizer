---
title: Draft the cell and Bring crew up say what they are doing and why
status: now
repos: [organizer]
branch: main
updated: 2026-09-29
next: "review: cell-screens-fix, branch cell-screens-fix, gate G4 G5 G6 G7 pass, c86cfcc 419f67f 835a16a 2e8d469 16ef8f3 5296bb0 a835399"
depends_on: []
boundary: ["frontend/src/components/AgentsView.tsx (Draft the cell's states)", "frontend/src/components/Crew.tsx (the visible reason, the roster link)", "frontend/src/components/DecisionsView.tsx and frontend/src/stores/board.store.ts (landing on a record expanded)", "frontend/src/styles/global.css (.tiny-btn:disabled only)", "internal/model/model.go (Cell: accept_record)", "internal/service/ (draft.go, crew.go, retire.go)", "frontend/wailsjs (generated)", "tests", "testdata/"]
spec: "docs/specs/lead-side-fixes.md (FR-4, FR-5, FR-6, FR-8, FR-9); the findings: docs/ux/reviews/2026-09-29-cell-screens.md C2 C3 C4 C5 C8; values: docs/design-system.md"
gate: "docs/specs/lead-side-fixes.md Acceptance, rows G4, G5, G6, G7; the Gate section below"
stage: discovery-in-a-cell
seat: fix-cells
ui_review: true
---

## Goal
FR-4, FR-5, FR-6, FR-8 and FR-9 of `docs/specs/lead-side-fixes.md`:
Aglaea's C2, C3, C4, C5 and C8, and sup16's two open points.

## Gate
- [x] G4: see `docs/specs/lead-side-fixes.md`, Acceptance
- [x] G5: see `docs/specs/lead-side-fixes.md`, Acceptance
- [x] G6: see `docs/specs/lead-side-fixes.md`, Acceptance
- [x] G7: see `docs/specs/lead-side-fixes.md`, Acceptance

## Done
- 2026-09-29 cut from lead-side-fixes by the FSE
- 2026-09-29 fix-cells: FR-9 `accept_record` on `model.Cell` (c86cfcc), retire reason (419f67f), `.tiny-btn:disabled` .45 (835a16a), `openDecision` landing (2e8d469), Bring crew up reason as text (16ef8f3), Draft the cell states (5296bb0, a835399); choices and the double in `.wt-notes/fix-cells/progress.md`
- 2026-09-29 G4: `.wt-notes/fix-cells/g4-init-define-bring-crew-up-reason-1440.png`, `g4-init-drafted-bring-crew-up-reason-1440.png`, `g4-roster-link-lands-expanded-1440.png`; `g4-g5-browser.txt`: `G4 init-define {"disabled":true,"opacity":"0.45","reasonText":"no persona file: agents/designer_diego.md"}`, `G4 init-drafted {... "reasonText":"draft roster: nothing launches until 0001 is ruled"}`, `G4 landing {"classes":"dec proposed expanded focused",...}`
- 2026-09-29 G5: `.wt-notes/fix-cells/g5-1-checking-1440.png` … `g5-7-refused-init-nopeople-1440.png` (checking, ready, confirm, opening, opened, opened after navigation, error, refused); opened, opening and error from a browser-only double of `window.go.main.App.DraftCell` (open=true never reached Go; no prompt written); log `g4-g5-browser.txt`
- 2026-09-29 G6: `go test ./internal/service/ -run 'TestDraftCellIsInDefinition…|TestPlanRetireRetirableSaysTheCellIsInDefinition' -v` → `ok organizer/internal/service` (`g6-go-test.txt`); `organizer retire init-define --retirable` on the fixture home → `! no seat is retirable: the cell is in definition` (`g6-retire-init-define.txt`)
- 2026-09-29 G7, after rebase on main 7c86c74 at a835399: `XDG_DATA_HOME=$(mktemp -d) make test` → `exit 0`, vitest `18 passed` (`g7-make-test.txt`); `cd frontend && npm run build` → `✓ built`, `exit 0` (`g7-npm-build.txt`); G18 grep → empty, `grep exit 1` (`g7-g18-grep.txt`)

## Next
1. review: cell-screens-fix (code and UI), branch cell-screens-fix

## Blockers
none

## Notes
- `ui_review: true`: the wave gets a UI reviewer (aglaea skill,
  references/ui-review.md) besides the code reviewer.
- G5 never presses a real Open: it starts a real Claude session.
- `useBoard().openDecision(initiativeId, number)` opens Decisions with that record expanded and highlighted; home-rule-and-rows' Rule box link can call it.
- `crewCell` takes the decisions now, so `internal/service/service.go` and `cell.go` changed one line each (outside the listed files).
- The Decisions highlight and the Open error colour are inline styles (`--surface-selected`, `--danger`): no stylesheet for them is in this boundary; conform-and-waiting or a later card may move them to CSS. `aria-describedby` is left to conform-and-waiting (FR-12).
- `wails dev` fails without a TTY (`pnpm install`) unless `CI=true`, and rewrites `frontend/wailsjs/runtime/*`.

## UI review
- Ran: branch `cell-screens-fix` at a835399, `wails dev` on `scripts/fixture-home.sh`, headless Chrome at 1440×900, 1024×640 and 400×800; keyboard passes over the roster link, Draft the cell, its confirm and Cancel. Screenshots and DOM log in `.wt-notes/fix-cells-ui/` (`browser.txt`).
- **Verdict: pass**, failing: none. FR-4: the reason reads as text beside Bring crew up on init-define ("no persona file: agents/designer_diego.md") and init-drafted ("draft roster: nothing launches until 0001 is ruled"), at 1440 and 1024 (`agents-init-define-bring-crew-up-blocked-1440.png`, `agents-init-drafted-bring-crew-up-blocked-1024.png`). FR-5: checking (disabled, no reason), ready, confirm, refused as the table (`agents-init-draftable-{checking,ready,confirm}-1440.png`, `agents-init-nopeople-refused-1024.png`). FR-6: the link, by mouse and by Enter, lands with 0001 expanded, in view and on `--surface-selected` at 1440 and 1024 (`decisions-init-drafted-landed-0001-{1440,1024}.png`); the highlight clears on leaving. FR-8: every disabled `.tiny-btn` computes `0.45`.
- **U1** 1. A keyboard or screen reader user who activates Draft the cell, Cancel or the roster link loses their place: the pressed control unmounts and focus falls to the page body, with nothing announced. 2. Agents on init-draftable (`agents-init-draftable-confirm-1440.png`); Decisions after the link (`decisions-init-drafted-landed-0001-1440.png`). 3. `heuristic`: WCAG 2.4.3, Nielsen 1; `document.activeElement` is BODY after each (`browser.txt`); Chrome's next Tab recovers (Open, the record's line), WKWebView untested. 4. Severity 2. 5. Move focus to Open on confirm, back to Draft the cell on Cancel, and to the landed record's line on FR-6.
- **U2** 1. On init-define the lead reads two blockers in one Crew header: "no seat has run yet; waits on its first launch" and, beside the button, "no persona file". The first is wrong while the second holds. 2. `agents-init-define-bring-crew-up-blocked-1440.png`. 3. `heuristic`: Nielsen 1, 2 (C1's cause, left in the Crew header). 4. Severity 2. 5. `IN_DEFINITION_WAITS` gives way to the missing file, as FR-3 does for the Needs me row.
- **U3** 1. A lead who sees "no persona file: agents/designer_diego.md" is not told who writes it. 2. same screenshot. 3. `heuristic`: design system, Disabled actions ("what is missing, and who or what fixes it"); no `aria-describedby` on either button (FR-12, conform-and-waiting). 4. Severity 1. 5. Add the fixer in the reason when conform-and-waiting ties it with `aria-describedby`.
- **U4** 1. Escape does not leave Draft the cell's confirm; only Cancel does. 2. `agents-init-draftable-confirm-1440.png`. 3. `heuristic`: Nielsen 3 (`browser.txt`, "after Escape still confirm? 1"). As built before this card. 4. Severity 1. 5. Escape cancels the confirm.
- **Spec gaps** (for the FSE): focus after an inline confirm opens or closes and after a landing (FR-5, FR-6 name what shows, not where focus goes; U1); FR-3 fixed the Needs me row's words but not the Crew header's `IN_DEFINITION_WAITS` (U2); FR-12's `aria-describedby` and the "who fixes it" half of the design system's blocked treatment belong to conform-and-waiting (U3). The fixture's cells show "canned health: no project …" in every Crew header, which crowds the row at 1024; a fixture fix.
- **Not verified**: opening, opened and error on Open. The branch carries no test double for Open and it starts a real session, so it was not pressed (in-page guard, `opens counted 0`); read only in `AgentsView.tsx`, where the words match FR-5's table, the button reads "Drafting…" disabled, and the error sits in `--danger` with `role="alert"`. The builder's G5 shots come from a browser-only double outside the branch. Focus behaviour in WKWebView and screen-reader output (headless Chrome only). 400 px: not reachable (minimum window 1024×640, `main.go`); at 400 the page scrolls sideways from the top bar, not from this card's rows.
