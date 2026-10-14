# Leftovers 31: no button that does nothing, the landed row keeps its ring, focus after a list closes: the build spec

status: proposed (0127)
by: the FSE, 2026-10-14, on main at 703d3b5
sources: lf30-launch-view's UI review (`working-on/done/lf30-launch-view.md`,
`## UI review`, U1 and the spec gaps) and sup67's close
(`runs/2026-10-14-sup67-leftovers-30.md`: Bring crew up with every seat
running shows nothing), answered by Aglaea in `docs/ux/specs/launch-progress.md`
Amendment 3 (f07eced, L15, L16) and Amendment 4 (703d3b5, L17, L18, L16
amended). Gate rows follow 0095 and 0108: no row drives Pablo's desktops,
focus or input, starts a real seat, or writes the real clipboard.

## Requirements, card `lf31-crew-button` (frontend)

- **FR-1** (L15) A row an Agents landing holds (`holdInView` in
  `Crew.tsx`, the crew and Agents landings alike) carries
  `scroll-margin-block: var(--space-2)`, so the centring and every
  `nearest` pull leave its whole focus ring, plus air, inside the scroller.
- **FR-2** (L17) With no seat off, the crew block has no launch button:
  `Reattach all` goes as a label and as a branch (`Crew.tsx:464`, and the
  comment at `:130`). The meta `n seats · n live · 0 off` stays; Retire…
  stays. `Bring crew up` and `Bring n up` are unchanged.
- **FR-3** (L18) If the confirm is open when the last off seat comes up
  elsewhere, `Start` queues nothing: the confirm closes, the crew block's
  live region says `Every seat is already running`, no list or heading
  appears, and focus goes to the first seat row's `Attach`.
- **FR-4** (L16 amended) When `Seat up` or `Crew up` closes by itself
  (5 s), focus, only if it was in the list, goes to the `Attach` of the
  first seat the list showed; with focus elsewhere it stays where it is;
  never the body. A list closed with a seat still off (Close the list after
  a failure) keeps its target, `Bring n up`.

## Acceptance → gate

| # | FR | Check | Expected (fails on main) |
|---|---|---|---|
| B1 | 1 | Tab harness at 1024×640: land on a crew seat below the fold (`openAgentsAt`), push two feed updates through the store's `applyAgents` that add rows above it; read the row's and the scroller's rects and the row's computed `scroll-margin-block` | margin 8px; the ring (row rect grown by outline width + offset) is inside the scroller with ≥ 2 px to its edge after each update |
| B2 | 2 | vitest of the crew block with every seat live, one off, all off; `grep -rn "Reattach" frontend/src` | no launch button with all live and the meta `3 live · 0 off`; `Bring 1 up`, `Bring crew up` otherwise; no match |
| B3 | 3 | vitest: confirm open with one seat off, the feed then marks it live, press Start (a fake `createCrew` that queues nothing) | confirm gone, the live region `Every seat is already running`, no `.launch-head`, `document.activeElement` the first seat's `Attach` |
| B4 | 4 | Tab harness with the probe stub (`ORGANIZER_PROBE_BIN=scripts/probe-stub.sh`): `Bring 1 up`, focus on the list's heading, wait for `Seat up` to close; again with focus moved to the top bar before it closes; vitest of Close the list after a failure | focus on the listed seat's `Attach`; then on the top bar control, unchanged; after the failure on `Bring 1 up` |
| X0 | all | `XDG_DATA_HOME=$(mktemp -d) make test`, `cd frontend && pnpm run build`, `wails build`, then `git status --porcelain` | pass, empty |

## Boundary

- `lf31-crew-button`: `Crew.tsx` (the button, the confirm's Start, the
  self-close focus, `holdInView`), `AgentsView.tsx` only for its landing's
  class if FR-1 needs it, their tests (`Crew.hold.test.ts` or a new
  `Crew.*.test.ts`); `styles/launch.css`, and in `styles/memory.css` and
  `styles/roles.css` only the `*-landed` rules. Not: Go, `lib/queue.ts`,
  `SlackView.tsx`.

## No-gos

- No new launch states or service calls: the race is read from what the
  press finds, not a new Go field.
- No window opened from the crew block (`Attach` stays per seat).

## Cards

| Card | Gate rows | Depends on | ui_review |
|---|---|---|---|
| `lf31-crew-button` | B1, B2, B3, B4, X0 | — | true |
