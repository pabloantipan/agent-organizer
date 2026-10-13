# Leftovers 25: names that say what a row shows, focus that stays put, a rail walked as drawn, dialogs that hold Tab: the build spec

status: proposed (0121)
by: the FSE, 2026-10-13, on main at d00165d
sources: sup60's close (`runs/2026-10-13-sup60-leftovers-24.md`; the
`## Review` and `## UI review` sections of `working-on/done/lf24-*.md`) and
Aglaea's `docs/ux/specs/tab-reaches-links.md` Amendment 2 (a5c30ed, rows
T13-T21, her shortlist of 2026-10-13). Gate rows follow 0095 and 0108: no
row drives Pablo's desktops, focus or input. Tab, arrow and Return presses
go through the Tab harness (`scripts/tab-harness/`); AX rows read the
review build's own pid; screenshots are the harness's own WKWebView.

## Requirements, card `lf25-names` (frontend)

- **FR-1** (T13, ct A1) F1 (`AgentsView.tsx:90`), F3 (`SlackView.tsx:123`)
  and F5 (`Conversation.tsx:850`) keep their short names and gain
  `aria-describedby` pointing at the row's drawn content: F1 the counts,
  memory and cell state; F3 live or off, deaf or capped, context; F5 who
  ruled, when, the words, next.
- **FR-2** (ct A2) F1 drops `aria-pressed`: it is a plain button.
- **FR-3** (T14, ct U2) Return on `Chat with <seat>` leaves focus on that
  button. After F1 the button unmounts, so focus goes to the first agent
  row of the initiative it filtered to.
- **FR-4** (T19, ct U1) A thread divider's actions (Escalate, Close,
  Reopen, the reply button) show at full opacity while focus is inside the
  divider: `.tl-divider:focus-within .a-actions { opacity: 1 }`.
- **FR-5** (T21, F2) The cell list in `SlackView.tsx` (the
  `!selectedInitiative` branch, lines 33-70) is unreachable: `SlackView`
  mounts only under an initiative (`App.tsx:115`, redesign FR-14), and the
  rail and Home already choose the initiative. The branch, its
  `.cells`/`.cell-row*` rules and its vitest go. T21 holds as "no control
  in the built app that Tab cannot reach" (the FSE's reading; Aglaea
  told, 2026-10-13: a list nobody can open is not made reachable by
  mounting it somewhere new without a design for it).

## Requirements, card `lf25-rail` (frontend)

- **FR-6** (T13, rk U1) `rowName` (`Rail.tsx:546`) appends, after the
  counts and only when drawn: `cell in definition`, `<n> live agent(s)`,
  `<n> machines`. Both the full row and the strip (`Rail.tsx:233`, `:347`).
- **FR-7** (T15, rk A1, corrects A1 §4) The roving order is the drawn
  order: Roles, then the initiatives. Up from rank 1 lands on the last
  role; Down from the last initiative stays there, no wrap.
- **FR-8** (T16, rk A4, U3) The group menu leaves out Move up on the first
  group and Move down on the last (not dimmed). When the room below the ⋯
  is shorter than the menu it opens upward; it never passes the window's
  edge.
- **FR-9** (T17, rk U4) The rename field is named `Rename <group>`.

## Requirements, card `lf25-dialogs` (frontend)

- **FR-10** (T20) The card back (`CardDrawer.tsx`) holds Tab: from its last
  control Tab goes to its first, Shift+Tab the reverse; no Tab lands on
  `body`. One trap function shared with the role drawer and the rule box
  (today `loopTab` in `RuleDecisionBox.tsx:208`, moved to `lib/`), not a
  third copy.
- **FR-11** (T18, ds Q1) The role drawer's initiatives
  (`RoleDrawer.tsx:146`) become an inline `ul` of links, 8 px gap, no
  commas. Outcome: a link's focus ring clears its neighbour by at least
  2 px.

## Acceptance → gate

| # | FR | Check | Expected (fails on main) |
|---|---|---|---|
| N1 | 1, 2 | vitest of F1, F3, F5's name, `aria-describedby` target and its text; AX tree of the review process for one of each | short name; description holds the drawn facts; F1 has no `aria-pressed` |
| N2 | 3 | harness: Tab to `Chat with <seat>`, Return, read `document.activeElement`; Tab to F1, Return, read it | the same button; the first agent row of that initiative |
| N3 | 4 | harness: Tab onto a divider's Escalate; computed `opacity` of `.a-actions`; screenshot | 1; the ring shows |
| N4 | 5 | `grep -n "cell-row\|selectedInitiative)" SlackView.tsx` and the css; harness Tab walk of Conversations | no cell list, no rule left; every clickable element reached |
| R1 | 6 | vitest of `rowName` with a cell in definition, 1 and 2 live agents, 2 machines; AX tree of a rail row on the fixture | the facts appended in that order, only when drawn |
| R2 | 7 | harness: focus rank 1, Up; focus the last initiative, Down | the last role; stays |
| R3 | 8 | vitest: menus of first and last group; harness at 1024×640 on the fixture with groups: open the lowest group's menu, read its bounding box | no Move up / no Move down; the menu above the ⋯, inside the window |
| R4 | 9 | vitest and AX of the rename field | `Rename <group>` |
| D1 | 10 | harness: open a card back, Tab past its last control, Shift+Tab past its first; `grep -n "function loopTab"` in `src` | first, then last control; never `body`; one definition |
| D2 | 11 | vitest of the drawer list; harness screenshot of a focused link and the next item's box | `ul`, no `,` text; gap 8px; ring ≥ 2 px from the neighbour |
| X0 | all | `XDG_DATA_HOME=$(mktemp -d) make test`, `cd frontend && pnpm run build`, `wails build`, then `git status --porcelain` | pass, empty |

## Boundary

Stylesheets per card with the rules each owns.

- `lf25-names`: `AgentsView.tsx`, `SlackView.tsx`, `Conversation.tsx`,
  their tests (`Controls.test.tsx` included); in `styles/global.css` only
  `.agent-group-title*`, `.person*`, `.cells`, `.cell-row*`, `.cell-*`,
  `.tl-*` and `.tl-divider .a-actions`; in `styles/shell.css` only
  `.tl-divider*`. Not: `Rail.tsx`, `.rail-*`, `CardDrawer.tsx`,
  `RoleDrawer.tsx`, `RuleDecisionBox.tsx`, `roles.css`.
- `lf25-rail`: `Rail.tsx` and its tests; in `styles/global.css` only
  `.rail-*` rules; in `styles/roles.css` only `.rail-group.roles` and the
  rail's role rows. Not: the files of the other two cards.
- `lf25-dialogs`: `CardDrawer.tsx`, `RoleDrawer.tsx`, `RuleDecisionBox.tsx`
  (only to import the moved trap), a new `lib/` module for the trap and its
  test; `styles/roles.css` `.rd-inits*`, `.rd-init*` only; their tests. Not:
  `Rail.tsx`, `global.css`, the three files of `lf25-names`.

## No-gos

- rk A2 and rk A3 as built (Aglaea, Amendment 2 §5, §6): groups cost three
  stops each; the strip's folds stay stops.
- No new place for a cell list (FR-5).
- No arrow keys inside the board's columns; no shortcuts.

## Cards

| Card | Gate rows | Depends on | ui_review |
|---|---|---|---|
| `lf25-names` | N1, N2, N3, N4, X0 | — | true |
| `lf25-rail` | R1, R2, R3, R4, X0 | — | true |
| `lf25-dialogs` | D1, D2, X0 | — | true |
