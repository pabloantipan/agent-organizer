# Leftovers 26: scroll regions are stops, descriptions say their nouns, the last small fixes, a fixture for the rows that could not run: the build spec

status: proposed (0122)
by: the FSE, 2026-10-13, on main at f7998aa
sources: sup61's close (`runs/2026-10-13-sup61-leftovers-25.md`; the
`## UI review` sections of `working-on/done/lf25-*.md`), Aglaea's
`docs/ux/specs/tab-reaches-links.md` Amendment 3 (70a43e9, rows T22, T23,
and the design-system rule it added: a region that scrolls is a stop while
it scrolls), and leftovers-25 Amendment 1 (f72c7f3, two fixture gaps).
Gate rows follow 0095 and 0108: no row drives Pablo's desktops, focus or
input. Key presses go through the Tab harness (`scripts/tab-harness/`); AX
rows read the review build's own pid; screenshots are the harness's own
WKWebView.

## Requirements, card `lf26-scroll-stops` (frontend)

- **FR-1** (T22, dg-ui U3) A region that scrolls is a Tab stop only while
  it overflows: `tabindex="0"`, `role="region"`, `aria-label`, the focus
  ring under `:focus-visible`; it loses all three when it stops
  overflowing (a resize, new content). With it focused WebKit scrolls it
  natively (arrows, Page Up/Down, Home/End). One function in
  `lib/useScrollEdges.ts`, driven by the measurement the edge hooks already
  take, so no second observer.
- **FR-2** Where it applies now: the card back's body (`CardDrawer.tsx:77`,
  named `<card title>, details`), and every `pre` and `table` that
  `useMarkdownEdges` watches (card back, decision record, rule box, Help:
  named `Code, scrolls` or `Table, scrolls`). The shared trap (lf25,
  `lib/`) walks them as stops; nothing in the trap changes.
- **FR-3** (Aglaea, A3 §1, the names of 2026-10-13) The other regions the
  edge hooks watch follow the same rule. Where a visible heading sits over
  the region, `aria-labelledby` points at it; otherwise: the role drawer's
  body `<role>, details`, the rule box `Record <NNNN>, <title>`, the
  floating list `Initiatives list`, the header's open area `Details of
  <id>` (the id its button's `aria-controls` names), Help `Help`. Code and
  tables inside any of them keep `Code, scrolls` / `Table, scrolls`.
- **FR-9** and **FR-10** (moved here from the menu card, since this
  card now owns `RoleDrawer.tsx`; see below).

## Requirements, card `lf26-words` (frontend)

- **FR-4** (T23, nm-ui U1) F3's description (`SlackView.tsx:92`) reads
  `session <word>, mail <word>, owes <n> message(s), context <n>%`, the
  value words from `lib/health.ts` unchanged, each with its noun first;
  `owes` only when it owes.
- **FR-5** (T23, U4) Every count said in an `aria-describedby` of
  Amendment 2 (F1, F3, F5, the rail row is `lf25-rail`'s and already
  correct) carries its noun in the right number, through `plural`
  (`lib/initiatives.ts:62`): F1 says `1 agent`, never `1 agents`; the
  visible text at `AgentsView.tsx:155` too.
- **FR-6** (nm-ui U3) The Conversations search field shows the focus ring:
  `.cell-search:focus-within` draws it on the wrapper (the input keeps no
  outline of its own).
- **FR-7** (nm-ui U2) The dead `.cell-filters .hot .mono` selector goes
  (`global.css:585`); the rule keeps its other selectors.

## Requirements, card `lf26-menu` (frontend)

- **FR-8** (rl-ui U1) The group menu's placement is measured after the
  first item's focus has scrolled the rail, so a menu pressed while its ⋯
  is out of view (AXPress) opens downward when there is room below.
## Requirements carried by `lf26-scroll-stops`

- **FR-9** (dg-ui U1) The role drawer's initiative `ul` carries
  `role="list"` (WebKit drops list semantics under `list-style: none`).
- **FR-10** (dg-ui U2) The comment at `styles/roles.css:101` says "an
  inline list", not "a comma list".

## Requirements, card `lf26-fixture` (scripts, testdata)

- **FR-11** (leftovers-25 N1) `scripts/fixture-home.sh` leaves one
  organizer-fixture thread holding a `decision` (the way `asking_thread`
  leaves one that asks pablo: only organizer-fixture, tokens never
  printed, idempotent), so a ruling (F5) is drawn in the review build.
- **FR-12** (leftovers-25 R3) The fixture with groups has a lowest group
  whose ⋯ has less room below than its menu at 1024×640 without scrolling
  (more initiatives or groups in the overlay, the builder's pick; said in
  `testdata/fixture-overlay/README.md`).

## Acceptance → gate

| # | FR | Check | Expected (fails on main) |
|---|---|---|---|
| S1 | 1, 2 | harness at 1024×640: open a long card back, Tab until the body; AX of the body; Down ×3, read `scrollTop`; same at 1440×900 with a short card | a stop named `<title>, details`, `scrollTop` > 0; at 1440 not a stop |
| S2 | 2 | harness: a card back with a wide code block; Tab to it; Right ×3, `scrollLeft`; vitest of the hook over a fake overflowing / non-overflowing `pre` and `table` | `Code, scrolls`, `scrollLeft` > 0; tabindex and role on only while overflowing |
| S3 | 1, 2 | harness: Tab through the long card back to its end and on | the trap walks body and code block, never `body` |
| S4 | 3 | harness at 1024×640 with each region overflowing (role drawer, rule box, floating list, header open area, Help); AX of each; vitest of each name | each a stop while it overflows, named as FR-3 or labelled by its heading |
| W1 | 4, 5 | vitest of F3's and F1's descriptions with live/off, alive/stale, owes 0/1/2, 1 and 25 agents; AX of one person row | the FR-4 form, words equal to `HEALTH`'s; `1 agent`, `2 messages`, never `1 agents` |
| W2 | 6, 7 | harness: Tab to the search field, screenshot and computed outline of `.cell-search`; `grep -n cell-filters` in `src` | ring drawn; no match |
| M1 | 8 | vitest of the placement with the ⋯ out of view, then scrolled into view with room below; harness AXPress case of lf25's rl-ui (`.wt-notes`) | opens downward |
| D1 | 9, 10 | AX of the role drawer's initiatives; `sed -n 101p styles/roles.css` | `AXList` with N items; "an inline list" |
| F1 | 11 | `eval "$(scripts/fixture-home.sh)"` twice, then the review build: AX of a ruling row in Conversations | one decision thread (not two); F5 named `Open the thread <subject>` with its description |
| F2 | 12 | review build on the fixture with groups at 1024×640, no scroll: open the lowest group's menu, bounding box | above the ⋯, inside the window |
| X0 | all | `XDG_DATA_HOME=$(mktemp -d) make test`, `cd frontend && pnpm run build`, `wails build`, then `git status --porcelain` | pass, empty |

## Boundary

Stylesheets per card with the rules each owns.

- `lf26-scroll-stops`: `lib/useScrollEdges.ts` and its test,
  `CardDrawer.tsx`, `RoleDrawer.tsx`, `RuleDecisionBox.tsx`,
  `FloatList.tsx`, `InitiativeHeader.tsx`, `HelpView.tsx`,
  `DecisionsView.tsx` (only where they name or label a region, and the
  role drawer's `ul`), their tests; in `styles/global.css` only
  `.modal-body*`, `.markdown pre*`, `.markdown table*`; `styles/help.css`
  `.help-doc*`; `styles/roles.css` `.rd-*` and line 101's comment;
  `styles/rule-box.css` the box's scroll rules; `styles/shell.css` the
  header's open area only. Not: `SlackView.tsx`, `AgentsView.tsx`,
  `Conversation.tsx`, `Rail.tsx`, the trap's module.
- `lf26-words`: `SlackView.tsx`, `AgentsView.tsx`, `Conversation.tsx`
  (the search field only), their tests; `lib/health.ts` read only; in
  `styles/global.css` only `.cell-search*` and the line-585 rule. Not:
  the files of the other cards.
- `lf26-menu`: `Rail.tsx` (`GroupActions`, `menuPlace`) and its tests.
  Not: any stylesheet, the files of the other cards.
- `lf26-fixture`: `scripts/fixture-home.sh`, `testdata/fixture-overlay/`.
  Not: `frontend/`, `internal/`.

## No-gos

- No change to `lib/health.ts`'s words.
- No arrow keys inside the board's columns; no shortcuts.

## Cards

| Card | Gate rows | Depends on | ui_review |
|---|---|---|---|
| `lf26-scroll-stops` | S1, S2, S3, S4, D1, X0 | — | true |
| `lf26-words` | W1, W2, X0 | — | true |
| `lf26-menu` | M1, X0 | — | true |
| `lf26-fixture` | F1, F2, X0 | — | false |
