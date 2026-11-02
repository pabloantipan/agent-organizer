# Leftovers 70: two sev-1 looks and the runs paragraph: the build spec

status: accepted (0183, ruled 2026-11-02)
by: the FSE, 2026-11-02, on main at bec14ab
sources: Aglaea 5a333ac (`docs/ux/specs/run-report.md` Amendment 6, AR32;
`docs/ux/specs/usage.md` Amendment 3, U10; `docs/design-system.md`); sup113
Found 3 and 5; sup112 Found 3 (CLAUDE.md's Runs baseline paragraph).

## Premises (read 2026-11-02 at bec14ab)

| Premise | Shown by |
|---|---|
| `.rt-waitline` is `overflow: hidden` around `.rr-card` buttons, so their rings can be cut | `frontend/src/styles/runreport.css:160` |
| U9's count sits after a wider gap than its dot | `frontend/src/components/UsageTable.tsx:156`; sup113 Found 5 |
| CLAUDE.md's Runs baseline paragraph names directory and branch matching only, not the reviewer and supervisor attribution of lf68-go (`task NNNN`) | `CLAUDE.md`, "Runs baseline"; `internal/session/runs.go` `MatchRun` |

## Requirements

Card `lf70-small`:
- **FR-1 (AR32)** Controls inside `.rt-waitline` draw their focus ring
  inset (`outline-offset: -2px`).
- **FR-2 (U10)** The rejected list's title reads `Not accepted · N`, one
  space each side of the dot.
- **FR-3** CLAUDE.md's Runs baseline paragraph names the seat, reviewer
  and supervisor matches and the `task NNNN` label, in one or two
  sentences.

## Acceptance → gate

| # | FR | Check | Expected (fails on main) |
|---|---|---|---|
| V1 | 1 | vitest reading `runreport.css`: the focus rule for controls under `.rt-waitline` | `outline-offset: -2px` |
| V2 | 2 | vitest of the rejected list's title text over two rows | `Not accepted · 2` with single spaces (main: a wider gap) |
| D1 | 3 | `grep -n "task NNNN\|reviewer:" CLAUDE.md` within the Runs baseline paragraph | both named |
| AR32, U10 | 1, 2 | review build, the run-report fixture and the Usage fixture at 1024x640, as leftovers-67 says UI rows run | the ring whole inside the wait line; the title as U10 |
| X0 | all | `XDG_DATA_HOME=$(mktemp -d) CONTRACTS_DIR=<specs checkout>/contracts make test`, `wails build`, `make review-build` in the worktree, `git status --porcelain` | pass, empty |

## Boundary

`frontend/src/styles/runreport.css`, `frontend/src/components/UsageTable.tsx`,
`frontend/src/styles/usage.css`, their tests, and CLAUDE.md (the Runs
baseline paragraph only).

## Cards

| Card | Gate rows | Depends on | ui_review |
|---|---|---|---|
| `lf70-small` | V1, V2, D1, AR32, U10, X0 | — | true |
