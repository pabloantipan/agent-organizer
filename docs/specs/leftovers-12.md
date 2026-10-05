# Leftovers 12: the drafts, roles and Decisions findings: the build spec

status: proposed (0087)
by: the FSE, 2026-10-05, on main
design: Aglaea's calls cb20fcf (the Ruled line never widens its view),
2203d7d (the wake count), and the reviews of drafts-per-chat (sup39) and
roles-and-needs-me-five (sup40), in `working-on/done/`; the design system as
amended.

## Problem

- **The Decisions board swings sideways** on a trackpad: a Ruled line with a
  long chosen option (0082) makes `.dec-meta` 1043 px (`global.css:756`,
  nowrap, no shrink), so the board overflows and rubber-bands. Possibly part
  of Pablo's "vibrates" (0086), which measured a different loop.
- Severity 2: a thread divider you land on has no accessible name (rn5-U1).
- Severity 1: the wake count's tone and place (rn5-A1, A2); the roles drawer
  says `running` where its row says `idle` (rn5-U2); focus after "Show the
  other N" and a landing on a Needs me row hidden behind it (rn5-G1, G2); the
  Needs me rule box's recipient select is unnamed (dpc-G1); the stage and id
  columns keep ~40 px of slack at a 1512 strip (dpc builder note); a
  sub-pixel cut on init-a's lozenge in Chromium (dpc-U1).

## Requirements, card `decisions-line-and-names`

After decisions-still (both change `DecisionsView.tsx` and `global.css`).

- **FR-1** A Ruled line stays one line and never widens its view: number,
  status, ruler and date stay whole; the chosen option gives way first, with
  an ellipsis and its whole text in the hover and the accessible name; then
  the title.
- **FR-2** A landed thread divider has an accessible name (its subject and
  status), and is where focus lands.
- **FR-3** The wake count is neutral, takes the magenta tone when it wakes
  every seat, never the blocked red, and sits beside Send in the reply
  composer as beside Start.
- **FR-4** The roles drawer names a session's state with the row's word.
- **FR-5** "Show the other N" on Needs me puts focus on the first row it
  revealed; a landing on a row hidden behind it opens the rest first.
- **FR-6** The Needs me rule box's recipient select has a name.
- **FR-7** Home's stage and id columns give their slack to cut cells
  (`--t-stage`, `--t-id`, as the other tracks); no lozenge is cut mid-pixel
  in Chromium.

## Acceptance → gate

Rows name window or content, the rail state and the scrollbar kind; UI review
in `make review-build`, pinned; visual rows hit-tested in both engines.

| # | FR | Check | Expected |
|---|---|---|---|
| X1 | 1 | Decisions, Ruled open, 0082's line, windows 1024×640 and 1512×945, both engines; a trackpad swipe sideways | the board's `scrollWidth` equals its `clientWidth`; the chosen option ellipsized, whole in hover and name; nothing moves sideways |
| X2 | 2, 4, 6 | the names log after a mail-line landing, over a drawer session, over the Needs me rule box | the divider named and focused; `idle` as the row says; the select named |
| X3 | 3 | the channel's form and a reply, with one seat and with all | neutral, then magenta when all; never red; beside Start and beside Send |
| X4 | 5 | Needs me with 14 rows: "Show the other 9"; a landing on row 12 | focus on row 6; row 12 shown and focused |
| X5 | 7 | Home at a 1512×945 window, rail as a strip, both engines | stage and id slack given to cut cells; init-a's lozenge whole |
| X0 | all | `XDG_DATA_HOME=$(mktemp -d) make test` from a clean checkout; `cd frontend && npm run build`; `wails build` | pass |

## Boundary

`DecisionsView.tsx` and `global.css` (`.dec-meta` and the Ruled line only),
`decisions.css`, `Conversation.tsx` and `SlackView.tsx` (divider name, wake
count), the roles drawer component, `Home.tsx` and `home.css` (Needs me's
focus and landing; stage and id tracks), `lib/width.ts`, `lib/queue.ts`
(first-five helper only) and `lib/` tests. Not: Go, `docs/design-system.md`.

## Technical notes

- Spec check (spec-craft 5b): no row asks for stored state; files by grep
  (`.dec-meta` at `global.css:756`). Result: holds.

## Cards

| Card | Gate rows | Depends on | ui_review |
|---|---|---|---|
| `decisions-line-and-names` | X1–X5, X0 | decisions-still | true |
