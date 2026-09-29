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
