# Leftovers 71: one count look, and a slug read whole under its ring: the build spec

status: accepted (0184, ruled 2026-11-02)
by: the FSE, 2026-11-02, on main at b09ed16
sources: sup114's UI review of lf70-small (runs/2026-11-02-sup114-leftovers-70.md,
R1, Q1, Q2, Found 1); Aglaea's `docs/ux/specs/run-report.md` Amendment 7
and `docs/design-system.md` (25baf46; AR33, AR34).

## Premises (read 2026-11-02 at b09ed16)

| Premise | Shown by |
|---|---|
| the inset ring on `.rt-waitline .rr-card` covers about 1.5 px of the slug's first glyph: the card has no side padding | l70-ui R1; `frontend/src/styles/runreport.css:62` |
| four section titles write `<title> · <count>` by hand, with a wider gap before the count than after the title | `frontend/src/components/Home.tsx:79`, `:357`; `frontend/src/components/Overview.tsx:145`; `frontend/src/components/UsageTable.tsx` (lf70 fixed its gap there alone) |

## Requirements

Card `lf71-count-look` (frontend, ui_review):
- **FR-1 (AR33)** `.rr-card` takes `padding-inline: var(--space-1)`,
  `min-width: 24px` kept, so a focused slug has 4 px between the ring
  and its first and last glyph.
- **FR-2 (AR34)** One shared piece draws `<title> · N` with one space
  each side of the dot; Usage's Not accepted, Home's two groups and
  Overview's stage title use it, and no title writes the dot by hand.

## Acceptance → gate

UI rows run as leftovers-67 says (review build in the worktree, launched by
its own path after the fixture launcher's exports in the same shell, pid
saved; a ring row by the offscreen Tab harness, which sup114 found is the
working method, saying so). No row drives Pablo's desktops, focus or input.

| # | FR | Check | Expected (fails on main) |
|---|---|---|---|
| V1 | 1 | vitest reading `runreport.css`: `.rr-card`'s padding and min-width | `padding-inline: var(--space-1)`, `min-width: 24px` |
| V2 | 2 | vitest of the shared piece, and a source scan that no component writes ` · <span className="num sec-count">` by hand | one space each side; the scan finds none (main: four) |
| AR33, AR34 | 1, 2 | review build at 1024x640: a focused `waits on` link; Usage, Home's Needs me and Waiting on others, Overview's stage title | as Aglaea's rows |
| X0 | all | `XDG_DATA_HOME=$(mktemp -d) CONTRACTS_DIR=<specs checkout>/contracts make test`, `wails build`, `make review-build` in the worktree, `git status --porcelain` | pass, empty |

## Boundary

`frontend/src/styles/runreport.css`, `frontend/src/components/Home.tsx`
(the two titles only), `Overview.tsx` (the stage title only),
`UsageTable.tsx`, a new `frontend/src/components/SecCount.tsx` and its
test, and the `.sec-count` rules in `frontend/src/styles/shell.css`.

## Cards

| Card | Gate rows | Depends on | ui_review |
|---|---|---|---|
| `lf71-count-look` | V1, V2, AR33, AR34, X0 | — | true |

## Amendment 1 (FSE, 2026-11-02, on l71-build's question)

FR-1 and FR-2 change markup two existing tests assert:
`RunReport.lf64.test.tsx:139` and `Home.waits.test.tsx:135`. The boundary
adds those two files, for those asserts only.

## Amendment 2 (FSE, 2026-11-02, on l71-rev's V2 fail at 003c839, cause gate)

The premise listed four titles from one grep for `sec-count`; three more
write the count by hand with a bare `num` span:
`frontend/src/components/InitiativesView.tsx:304` (Awake), `:308`
(Asleep) and `:328` (Archived). FR-2 covers them too. V2's scan matches
`<title> · <span className="num` (with or without `sec-count`) in every
non-test file under `frontend/src/components/`, expecting none. The
boundary adds `InitiativesView.tsx` (those three titles only) and its test.

Addendum (on sup115's finding 2): V2's scan also matches `{" · "}`,
`&middot;` and `·` beside a count span inside a `.sec-title`, across
lines. On main it then finds seven (Home two, Overview one, Usage one,
InitiativesView three); on the branch none.
