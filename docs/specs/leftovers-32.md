# Leftovers 32: the press's answer shows at once, a repeated message is said again, a dead confirm closes, focus never drops: the build spec

status: proposed (0128)
by: the FSE, 2026-10-14, on main at 320ce40
sources: lf31-crew-button's UI review (`working-on/done/lf31-crew-button.md`,
`## UI review`, U1-U3 and the focus gap), answered by Aglaea in
`docs/ux/specs/launch-progress.md` Amendment 5 (75bc7c6, L19-L22) and the
design-system rule it added ("The newest answer wins, and focus never
drops"). Gate rows follow 0095 and 0108: no row drives Pablo's desktops,
focus or input, starts a real seat, or writes the real clipboard.

## Requirements, card `lf32-newest-answer` (frontend)

- **FR-1** (L19) When Start finds nothing to start, the press's result is
  applied to the crew block at once, with no new service call: the seats it
  reports running read live, the meta reads `0 off`, the launch button goes,
  and the live region says `Every seat is already running`. If the result
  names no seats, every seat the view shows off reads live until a feed says
  otherwise. The next feed that agrees changes nothing on screen.
- **FR-2** (L20, the design-system rule) A live region that says a message
  empties, then sets its text in a following task (`setTimeout`, never
  `requestAnimationFrame`, which a hidden window does not run), so a
  repeated message is said again. One helper in `lib/` used by every
  screen-reader-only live region: the crew block's two (`Crew.tsx`,
  `useAnnouncer`), Agents' (`AgentsView.tsx:254`) and Initiatives'
  (`InitiativesView.tsx:333`). Visible text that is also live
  (`TimeZoom.tsx:281`, `InitiativesView.tsx:251`) is not emptied, since
  that would blink on screen; the FSE tells Aglaea.
- **FR-3** (L21) When a feed turns the block to `0 off` while the confirm
  is open, the confirm closes; its words are not rewritten.
- **FR-4** (L22, and L16, L21) When a list or the confirm leaves the crew
  block and focus was inside it, focus goes, in order, to the `Attach` of
  the first listed seat that has one, else `Bring n up`, else `Retire…`.
  Never the body. One function, used by the self-close, Close the list, the
  race and the confirm's close.

## Acceptance → gate

| # | FR | Check | Expected (fails on main) |
|---|---|---|---|
| N1 | 1 | Tab harness at 1024×640 with the probe stub: a stale feed showing `1 off` for a seat that runs (the store's `applyAgents`), press Bring 1 up, Start; read the block at once and after the next `applyAgents` with the seat live | at once: meta `0 off`, no launch button, the live region `Every seat is already running`; after the feed: the same, nothing re-rendered in the meta |
| N2 | 2 | vitest of the helper with a fake clock: say `a`, say `a` again; harness: repeat N1's race twice, read the region's text over time | the text empties then reads `a` twice; the second race announces again |
| N3 | 3 | Tab harness: open the confirm with one seat off and focus on Start, then `applyAgents` with the seat live | confirm gone, focus on the first seat's `Attach` |
| N4 | 4 | vitest of the focus function over: first listed seat with Attach; first without and second with; none with Attach and a seat off; none off; harness: a list whose first seat went off before it closes | in turn the first `Attach`, the second `Attach`, `Bring n up`, `Retire…`; never `body` |
| X0 | all | `XDG_DATA_HOME=$(mktemp -d) make test`, `cd frontend && pnpm run build`, `wails build`, then `git status --porcelain` | pass, empty |

## Boundary

- `lf32-newest-answer`: `Crew.tsx`, a new helper in `lib/` and its test,
  `AgentsView.tsx` and `InitiativesView.tsx` only where their live region
  takes the helper, their tests (`Crew.*.test.ts`). Not: Go, `lib/queue.ts`,
  `TimeZoom.tsx`, stylesheets.

## No-gos

- No new service call or Go field: the press's result is what `CreateCrew`
  already returns.
- No visible text emptied to repeat it.

## Cards

| Card | Gate rows | Depends on | ui_review |
|---|---|---|---|
| `lf32-newest-answer` | N1, N2, N3, N4, X0 | — | true |
