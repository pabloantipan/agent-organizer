# Leftovers 24: every control is a link or a button, the rail in a few stops, the skip link out from under a drawer: the build spec

status: proposed (0120)
by: the FSE, 2026-10-13, on main at e7407b2
sources: sup59's close (`runs/2026-10-13-sup59-leftovers-22.md`: F1-F5, G2,
rr-ui U1-U3, tl-ui A1 and U1), Aglaea's `docs/ux/specs/tab-reaches-links.md`
Amendment 1 (b131393, rows T6-T12) and the design-system rule it added (a
link changes where you are; a button changes what is shown in place).
tl-ui U2 as built. Gate rows follow 0095 and 0108: no row drives Pablo's
desktops, focus or input. Tab, arrow and Return presses go through the Tab
harness (`scripts/tab-harness/`, NSEvents to its own offscreen window,
proven by lf22); AX rows read the review build's own pid; screenshots are
the harness's own WKWebView.

## Requirements, card `lf24-controls` (frontend)

- **FR-1** F1, the Agents group title (`AgentsView.tsx:88`): a `button`,
  `aria-pressed`, named `Show only <id>`.
- **FR-2** F2, a cell row (`SlackView.tsx:47`): a link named
  `Conversations of <id>`, `aria-current` on the shown one.
- **FR-3** F3, a person (`SlackView.tsx:117`): a `button` named `Chat with
  <seat>`.
- **FR-4** F4, a search hit (`Conversation.tsx:320`): a `button`; it moves
  focus to the thread's divider.
- **FR-5** F5, a ruling (`Conversation.tsx:842`): a `button` named `Open
  the thread <subject>`; focus to the divider. Each of F1-F5 keeps its row
  look (T6).

## Requirements, card `lf24-rail-keys` (frontend)

- **FR-6** A rail row's counts are `aria-hidden`; the row's name is `<id>,
  <client>, rank <n>, <a> now, <b> blocked, <c> next`, zeros said (T8).
- **FR-7** A group head is two Tab stops, `Collapse <group>` and an
  `Actions for <group>` ⋯ menu (Rename, Move up, Move down, Remove); the
  group's drag handle takes `tabindex="-1"` (the mouse still drags); heads
  stay in DOM order (T9).
- **FR-8** The collapsed strip uses the same roving tabindex: one stop,
  Up and Down move, Enter opens (T10).
- **FR-9** Roles join the rail's roving set: Down past the last initiative
  lands on the first role, Enter opens its drawer; `Collapse Roles` stays a
  stop; Home's Roles stay. The rail's Tab count does not grow with the
  number of initiatives or roles (T11).

## Requirements, card `lf24-drawer-skip` (frontend)

- **FR-10** While a drawer or modal is open the skip link is not rendered
  (no `inert`; the floor is Safari 15.0); focus fallen to `body` goes into
  the modal on the next Tab (T7).
- **FR-11** The drawer's initiative links (`.rd-init`) get 2 px inline
  padding, so the focus ring clears the following comma (T12).

## Acceptance → gate

| # | FR | Check | Expected (fails on main) |
|---|---|---|---|
| E1 | 1-5 | `grep` for `onClick` on `span`, `li`, `div` in the three files; vitest of each control's role and name; harness: each takes focus by Tab and Return does what a click does | no such element; roles and names as FR-1 to FR-5; Return acts; F4, F5 focus lands on the divider |
| E2 | 6 | vitest of a rail row's name; AX tree of the review process | one name per row in FR-6's form, counts hidden |
| E3 | 7 | harness on the fixture with groups: Tab from the last row of one group to the first row of the next; vitest of Move up and Move down; `tabindex` of the drag handle | two stops between, `Collapse <group>` and `Actions for <group>`; the menu reorders groups; handle `-1` |
| E4 | 8 | harness with the rail collapsed: Tab in, Down, Up, Return, Tab | one stop; arrows move; Return opens; the next Tab leaves the strip |
| E5 | 9 | harness: Down past the last initiative, Return; Tab counts of the rail on the fixture and on the fixture with three more initiatives and two more roles (overlay or vitest) | lands on the first role; its drawer opens; the rail's Tab count equal in both |
| E6 | 10 | vitest: skip link absent while a drawer is open; harness: open a drawer, force focus to `body`, Tab | absent; focus lands inside the drawer |
| E7 | 11 | harness screenshot of a drawer with a focused `.rd-init` before a comma; computed padding | the ring does not touch the comma; `padding-inline` 2px |
| X0 | all | `XDG_DATA_HOME=$(mktemp -d) make test`, `cd frontend && pnpm run build`, `wails build`, then `git status --porcelain` | pass, empty |

## Boundary

Stylesheets per card with the rules each owns.

- `lf24-controls`: `AgentsView.tsx` (the group title), `SlackView.tsx`
  (cell row, person), `Conversation.tsx` (search hit, ruling) and their
  tests; in `styles/global.css` only `.agent-group-title*`, `.cell-row*`,
  `.person*`, and the hit and ruling rules wherever they live. Not:
  `Rail.tsx`, `.rail-*` rules, `roles.css`, `SkipLink.tsx`, `App.tsx`.
- `lf24-rail-keys`: `Rail.tsx` and its tests; in `styles/global.css` only
  `.rail-*` rules; in `styles/roles.css` only `.rail-group.roles` and the
  rail's role rows. Not: `.rd-*` rules, `RoleDrawer.tsx`, `SkipLink.tsx`,
  `App.tsx`, the three files of `lf24-controls`.
- `lf24-drawer-skip`: `SkipLink.tsx`, `App.tsx` (where the skip link
  learns a modal is open), the store only for that flag, `RoleDrawer.tsx`
  only if it must report open; `styles/roles.css` `.rd-init*` only; their
  tests. Not: `Rail.tsx`, `global.css`.

Amendment 1, 2026-10-13, the FSE, from sup60 (thread
01M4TV4E3SYETWJH3DXZBH9K3X): E1's grep also finds `Conversation.tsx`'s
`div.tl-divider` (a click replies) and `span.a-actions` (stopPropagation
only). The divider gets a real reply `button` (a button changes what is
shown in place, the design system's rule); `lf24-controls` also owns the
`.tl-*` rules of `styles/global.css`, which no other card touches.

## No-gos

- No change to tl-ui U2 (as built).
- No arrow keys inside the board's columns; no shortcuts.

## Cards

| Card | Gate rows | Depends on | ui_review |
|---|---|---|---|
| `lf24-controls` | E1, X0 | — | true |
| `lf24-rail-keys` | E2, E3, E4, E5, X0 | — | true |
| `lf24-drawer-skip` | E6, E7, X0 | — | true |
