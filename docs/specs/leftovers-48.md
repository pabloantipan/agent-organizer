# Leftovers 48: a landing shows its chat row, state fills do not ease, the picker reaches Others, and a fixture chat with a supervisor: the build spec

status: proposed (0156)
by: the FSE, 2026-10-23, on main at bd04f92
sources: Aglaea's `docs/ux/specs/review-view.md` Amendment 13 (9d65a97) and
its design-system rule (`docs/design-system.md`, same commit), from o47-ui's
UI review of lf47-others (UO1, UO2, the picker); o47-ui's spec gap (the
fixture has no chat with a name outside the roster). Every premise read
today.

## Premises (read 2026-10-23 at bd04f92)

| Premise | Shown by |
|---|---|
| the chat list never scrolls its current row into view; the only `scrollIntoView` calls are the timeline's | `frontend/src/components/Conversation.tsx:232-238` |
| `.chat.active` is a fill on a `button`, and every button eases background, border and colour | `frontend/src/styles/global.css:22, 356-357, 642` |
| the new-thread recipient select lists the roster plus the current addressee, nothing else | `frontend/src/components/Conversation.tsx:765, 818` (`shownSeats` in `NewThread`) |
| the fixture's canned feed holds no thread unless `asking_thread` copies live ones; `sup10` is in its health but not in init-a's roster; R41 needed a hand-edited `health.json` | `scripts/fixture-home.sh:58-71, 538-547`; `testdata/fixture-health.json`; o47-ui's spec gaps |

## Requirements

Card `lf48-chat-landing` (frontend and fixture, one card):

- **FR-1** (UO1) Whenever the chat list's current row changes by a landing
  (an open from a review, a card, Message, or the feed's later selection of
  the thread), the list scrolls that row into view with
  `block: "nearest"`, instantly. A click inside the list does not scroll.
  Focus does not move.
- **FR-2** (UO2) State fills switch with no transition: `.chat.active`
  and any other current or selected fill that rides the global button
  transition opt out of it for background, border and colour; hover keeps
  its transition.
- **FR-3** (picker) `NewThread`'s recipient select lists, below the
  roster, under an `Others` group (`<optgroup label="Others">`), the
  names the chat list's Others group shows at that moment. No free-typed
  name. No group when Others is empty.
- **FR-4** (fixture) `fixture-home.sh --review` adds to the canned
  `health.json` one open direct thread between the human and `sup10`
  (posters the human and `sup10`, the human's message last, so it asks
  nothing), so R41 to R44 run without a hand edit. Needs me's row count
  and every other fixture count stay as the script's header states them.

## Acceptance → gate

| # | FR | Check | Expected (fails on main) |
|---|---|---|---|
| L1 | 1 | vitest with a stand-in list: a landing on a row; a click on a row | `scrollIntoView({ block: "nearest" })` called once on the landed row, no `behavior: "smooth"`, focus unchanged; a click calls nothing |
| L2 | 2 | vitest reading `global.css` (as the repo's CSS tests do) | `.chat.active` (and each current or selected fill named in the card) sets no transition on background, border-color or color; `button:hover` keeps its transition |
| L3 | 3 | vitest of `NewThread`: Others `[sup10]`; Others empty | an `Others` optgroup holding `sup10` after the roster; no optgroup |
| L4 | 4 | `eval "$(scripts/fixture-home.sh --review)"`, read `$tmp/health.json` | one open thread with participants the human and `sup10`, last message the human's; the existing fixture tests that count Needs me pass unchanged |
| X0 | all | `XDG_DATA_HOME=$(mktemp -d) make test`, `cd frontend && pnpm run build`, `wails build`, then `git status --porcelain` | pass, empty |

The UI review (ui_review: true) checks review-view R42 to R44 in the review
build, with the fixture of FR-4.

## Boundary

`frontend/src/components/Conversation.tsx` and its tests,
`frontend/src/styles/global.css` (the state fills only) and the CSS test
that reads it, `scripts/fixture-home.sh` (`--review` only),
`testdata/fixture-health.json` only if the thread cannot be added by the
script.

## Cards

| Card | Gate rows | Depends on | ui_review |
|---|---|---|---|
| `lf48-chat-landing` | L1-L4, X0 | — | true |
