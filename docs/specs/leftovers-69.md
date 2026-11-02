# Leftovers 69: the lf67 UI notes, folded by Aglaea: the build spec

status: accepted (0182, ruled 2026-11-02)
by: the FSE, 2026-11-02, on main at e0502c7
sources: sup111's UI reviewers (runs/2026-11-02-sup111-leftovers-67.md);
Aglaea's 160f7fc: `docs/ux/specs/map-and-roadmap.md` Amendment 5
(M15-M18), `docs/ux/specs/run-report.md` Amendment 5 (AR31),
`docs/ux/specs/usage.md` Amendment 2 (U9 amended), `docs/design-system.md`
(scroll regions pad 4 px; no proper name in an uppercased label).

## Premises (read 2026-11-02 at e0502c7, from the lf67 UI reviews)

| Premise | Shown by |
|---|---|
| the map trail's steps draw in `--fg`, the current one a button too | l67-map-ui note A1 |
| the panel title takes a ring after a level change | l67-map-ui note A2 |
| at 1024 the focus ring is cut at `.map-scroll`'s right edge | l67-map-ui F1 |
| the picked edge is a rectangle on pill nodes | l67-map-ui F2 |
| the panel list renders alphabetical until the figure draws | l67-map-ui F3 |
| the gap before the `·` differs between a pressable and a still wave footer | l67-ui-ui note |
| U9's title reads `NOT ACCEPTED BY DISCUSS-RECORD` (`.sec-title` uppercases) | l67-ui-ui note; `frontend/src/components/UsageTable.tsx` |

## Requirements

Card `lf69-ui-notes` (frontend, ui_review):
- **FR-1 (M15)** Trail steps that navigate draw in `--accent-fg`; the
  current step is `--fg` text, not a button.
- **FR-2 (A5)** The panel title focused after a level change is a landing:
  no ring (as AR30).
- **FR-3 (M16)** A scroll region holding focusable things pads its inside
  by 4 px, so no ring is cut.
- **FR-4 (M17)** The picked edge takes the node's own `rx`.
- **FR-5 (M18)** The panel list renders once, in reading order; until
  positions are known it reads `Drawing the map…`.
- **FR-6 (AR31)** The same gap before the `·` on pressable and still
  footers.
- **FR-7 (U9 amended)** Title `Not accepted · N`; the line under it
  `discuss-record did not take these. Sent again when its usage changes.
  Nothing for you to do; the reason is for the FSE.`

## Acceptance → gate

UI rows run as leftovers-67 says (review build in the worktree, launched by
its own path after the fixture launcher's exports in the same shell, pid
saved, AX and `screencapture -l`, resize only by `ORGANIZER_REVIEW_RESIZE`).
No row drives Pablo's desktops, focus or input.

| # | FR | Check | Expected (fails on main) |
|---|---|---|---|
| V1 | 1, 2, 5 | vitest of the trail's elements, the title's focus class after a level change, the panel list before and after positions | as FR-1, FR-2, FR-5 |
| V2 | 4 | vitest of the picked mark over a pill node of the fixture's SVG | its `rx` equals the node's |
| V3 | 6, 7 | vitest of the footers' gap and the rejected list's title and line | as FR-6, FR-7 |
| M15-M18, AR31, U9 | 1-7 | review build, harbor and the run-report fixture, Aglaea's rows as written, at 1024x640 | each as its row says |
| X0 | all | `XDG_DATA_HOME=$(mktemp -d) CONTRACTS_DIR=<specs checkout>/contracts make test`, `wails build`, `make review-build` in the worktree, `git status --porcelain` | pass, empty |

## Boundary

`frontend/src/components/MapView.tsx`, `MapPanel.tsx`, `MapFigure.tsx`,
`RunReport.tsx`, `UsageTable.tsx`; `frontend/src/lib/mapSvg.ts`,
`runReport.ts`; `frontend/src/styles/map.css`, `runreport.css`,
`usage.css`; and their tests.

## Cards

| Card | Gate rows | Depends on | ui_review |
|---|---|---|---|
| `lf69-ui-notes` | V1-V3, M15-M18, AR31, U9, X0 | — | true |
