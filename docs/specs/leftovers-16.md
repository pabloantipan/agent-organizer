# Leftovers 16: the ring's swell, the folds, and the Memory cell's words: the build spec

status: proposed (0112)
by: the FSE, 2026-10-10, on main at 3b828ad
sources: Aglaea's answers b3295f2 (`docs/ux/specs/ram-indicator.md`, amended
for lf15-ring-breath A1; `docs/ux/specs/initiatives-view.md` Amendment 1,
rows I14-I16), lf15-initiatives-polish's UI review (V3, V4, FR-4's widths),
initiatives-view's UI review A1. Gate rows follow 0095 and 0108: no row
drives Pablo's desktops, focus or input; screen checks only on the review
app's own process (AX reads and AXPress, as lp-ui did in leftovers-15),
else renders, logs or vitest.

## Requirements, card `lf16-ring-swell` (native)

- **FR-1** At critical the ring swells 3 to **6** px (was 4.5), full
  opacity, the keyline following; steady 3 px under Reduce motion. Whether it
  pulls the eye from the ultrawide's edge is Pablo's look in use, not a row.

## Requirements, card `lf16-folds` (frontend)

- **FR-2** The rail's 46 px strip shows each fold as a glyph over its count:
  `Asleep` a moon (lucide `Moon`, 14 px), `Archived` a box (lucide
  `Archive`), both muted; hover and name `Asleep, 11 initiatives` /
  `Archived, n initiatives` (A1, I14).
- **FR-3** The floating list has the rail's two folds: `Asleep (n)` counts
  paused initiatives only, then `Archived (n)` for the rest, shown only when
  there are any. An archived initiative is never called asleep (V3, I15).

## Requirements, card `lf16-memory-words` (frontend), after `lf15-names-and-notices`

- **FR-4** An empty Memory cell has three words only, on every Agents row and
  crew seat: an off seat shows `—` named `Memory: not running`; a failed
  reading `Memory: could not be read`; before the first reading `Memory:
  reading…`. "Unknown" is not shown for an off seat (V4, I16).
- **FR-5** The Agents rows' Memory cell stays on the right edge's track at
  1024×640 and 1440×900, both with the rail open, wrapped or not (FR-4's
  widths from leftovers-15).

## Acceptance → gate

| # | FR | Check | Expected (fails on main) |
|---|---|---|---|
| R1 | 1 | review build, `ORGANIZER_MEMORY_FAKE=critical` on the fixture, the icon window shot (`screencapture -o -l`) at trough and peak, composited over white and the dark ground; `FLOAT_REDUCE_MOTION=1` | full-opacity amber with its keyline, 3 and 6 px; Reduce motion steady 3 px |
| F1 | 2 | vitest of the strip; the review build on the fixture, rail collapsed, AX tree of its own process | a moon over the asleep count, a box over the archived count; names `Asleep, n initiatives`, `Archived, n initiatives` |
| F2 | 3 | vitest of `lib/floatList.ts` with active, paused and archived initiatives; the fixture's floating list read by AX on the review process | `Asleep (n)` = paused only; `Archived (n)` apart, absent at zero |
| M1 | 4 | vitest over an off seat, a failed reading and no reading yet, for an Agents row and a crew seat | `—` with the three names exactly; no "unknown" for an off seat |
| M2 | 5 | review build on the fixture at 1024×640 and 1440×900, rail open: each Memory cell's x read from the AX tree of its own process | equal x on every row at each size |
| X0 | all | `XDG_DATA_HOME=$(mktemp -d) make test`, `cd frontend && npm run build`, `wails build` | pass |

## Boundary

`lf16-ring-swell`: `floaticon_darwin.m` (the ring's breath constants and
animation only). Not: the mark's layers, activation paths, the frontend.
`lf16-folds`: `Rail.tsx` (the strip's fold buttons), `FloatList.tsx`,
`lib/floatList.ts`, their css and tests. Not: `lib/initiatives.ts`.
`lf16-memory-words`: `lib/initiatives.ts` (the Memory cell helpers),
`AgentList.tsx`, `Crew.tsx`, their css and tests. Depends on
`lf15-names-and-notices`, which edits `AgentList.tsx` and `lib/memory.ts`.

## No-gos

- No new fold, no Wake on archived, no change to the rail's expanded folds.
- Nothing about A2 (inline confirm, no change) or A3 (Q1, Pablo's).
- The statusline samples that stop after one (ra-*/aic-* seats) are not here:
  the cause is unproven; it gets its own card once it is.

## Cards

| Card | Gate rows | Depends on | ui_review |
|---|---|---|---|
| `lf16-ring-swell` | R1, X0 | — | false |
| `lf16-folds` | F1, F2, X0 | — | true |
| `lf16-memory-words` | M1, M2, X0 | lf15-names-and-notices | true |
