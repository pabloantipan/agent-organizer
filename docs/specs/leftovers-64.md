# Leftovers 64: the run report's polish from its UI reviews: the build spec

status: proposed (0177)
by: the FSE, 2026-11-01
sources: Aglaea's `docs/ux/specs/run-report.md` Amendment 3 (AR22-AR26) and
`docs/ux/specs/progress-and-waves.md` Amendment 2 (PW4 amended, PW8),
60ea44c; the UI reviews of lf57-run-report and lf57-wave-footer
(`working-on/done/`).

## Requirements

Card `lf64-run-report-polish` (frontend):
- **FR-1 (AR22)** Several waits in one cell read `0002 (pablo) · 0003 (pablo)`; past the cell, "+N" with the rest in the hover and name.
- **FR-2 (AR23)** The not-drawn state is `sm` `--fg-muted` text, no rule, no hue.
- **FR-3 (AR24)** `.rr-card`, `.rr-more`, `.rt-fold` and the `waits on` links are at least 24 px high, by padding.
- **FR-4 (AR25)** A line the usage ledger has no run for reads `no tokens recorded`.
- **FR-5 (AR26)** When the window spans days the time column fits `Ddd HH:MM` whole, with the column gap before the wave.
- **FR-6** The chain connector `↓` is `--fg-subtle`, hidden from the accessible name.
- **FR-7 (PW4)** A wave footer opens Work only when Work draws that wave's strip (one helper, Work's own predicate); any other wave, finished or stopped, opens its run record, named `open <sup>'s run record`.
- **FR-8 (PW8)** The reader opens a run record at its first prose heading; the `waves:` block folds under a closed `Rounds as recorded`, mono when opened. Other files the reader opens are unchanged.

## Acceptance → gate

Rows read the report's contract fixture and the overlay's run records; UI
rows run in the review build (`make review-build` in the worktree, never
auth: firebase; launched by its own path, pid saved, AX of that pid,
`screencapture -l` or an offscreen render when the screen is locked, said
which). No row drives Pablo's desktops, focus or input.

| # | FR | Check | Expected (fails on main) |
|---|---|---|---|
| P1 | 1 | vitest of the waits cell over a track waiting on two records | `0002 (pablo) · 0003 (pablo)` |
| P2 | 2 | vitest of the not-drawn state's classes; review build | no rule, no red, muted words |
| P3 | 3 | review build: each control's box from AX | 24 px or more |
| P4 | 4 | vitest of a line with no ledger run | `no tokens recorded` |
| P5 | 5 | review build over a window spanning two days | `Tue 01:00` whole, the gap before the wave |
| P6 | 6 | vitest of the connector's colour token and name | `--fg-subtle`, not in the name |
| P7 | 7 | vitest of the footer target over the fixture's sup2/1 (not merged, no strip), a merged wave and a wave with a strip | record, record, Work |
| P8 | 8 | vitest of the reader over a run record; review build | opens at the first prose heading; `Rounds as recorded` closed, opens to the yaml |
| X0 | all | `XDG_DATA_HOME=$(mktemp -d) CONTRACTS_DIR=<specs checkout>/contracts make test`, `wails build`, `make review-build` in the worktree, `git status --porcelain` | pass, empty |

## Boundary

`frontend/src/components/RunReport.tsx`, `RunTracks.tsx`,
`SpecReader.tsx`; `frontend/src/lib/runReport.ts`, `specReader.ts`, and
the helper Work's strip predicate lives in (read, not changed, unless it
must be exported); `frontend/src/styles/runreport.css`; their tests.

## Cards

| Card | Gate rows | Depends on | ui_review |
|---|---|---|---|
| `lf64-run-report-polish` | P1-P8, X0 | — | true |

## Amendment 1 (FSE, 2026-11-01, on sup106's question)

FR-7 when a wave is not merged, Work draws no strip for it, and there is
no run record the scan read for it: the footer is drawn as text with no
press, its name saying why (`sup2/1: no run record`); never a link that
goes nowhere (Aglaea's rule, "the press keeps its promise in every
state"). P7 adds that case.
