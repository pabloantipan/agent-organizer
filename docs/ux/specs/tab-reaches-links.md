# Tab reaches every link (aglaea, 2026-10-11)

Pablo ruled 0117: "accept; I use Tab, make links reachable app-wide next".
This spec answers Q1 of the Initiatives view and is cut as leftovers-22.

## The problem, in the lead's terms

When he presses Tab in Deltagos, it skips every link, such as a card's
`Open <id>` and the initiatives named in a role drawer. It stops only on
buttons and fields. macOS ships "Keyboard navigation" off, and WKWebView
follows Safari's default: a link takes focus only with Option-Tab. So a
whole class of controls, and every focus cue designed for them (I37's
raise), never reaches him.

## The fix: one switch, not markup

Wails v2.15 exposes WKWebView's own preference:
`options.App.Mac.Preferences.TabFocusesLinks = mac.Enabled` (Wails sets
`config.preferences.tabFocusesLinks`). Turn it on in `main.go`.

- It is one line, app-wide, and covers links added later.
- **No `tabindex="0"` sprinkled on links** and no links turned into buttons
  to catch Tab: a link that navigates stays a link (A6 §2).
- Nothing changes for a user who has macOS keyboard navigation on.

## What Tab must then feel like

Once links are reached, the Tab order grows. Keep it usable:

1. **Order follows the page, by region**: top bar, then the rail, then the
   main content, then any open panel. Where the order is set by priority
   (Home in wide: Needs me before the list), it stays as it is (design
   system, Widths).
2. **A skip link first.** The first Tab on any screen shows `Skip to
   content` at the top left, over the bar, with the focus ring. Enter moves
   focus to the main region's first heading or control. It is hidden until
   focused, inside a positioned ancestor (the "document never scrolls"
   rule).
3. **The rail is one Tab stop.** Tab enters the rail on the current
   initiative (or the first one). Up and Down move between rows, Enter
   opens the row, and Tab leaves the rail. This is a roving tabindex: one
   row has `tabindex="0"` and the rest `-1`. The rail's own buttons (the
   collapse toggle, `Back to Initiatives`, group headers) stay ordinary Tab
   stops before the rows. Keyboard reordering, if the drag library offers
   it, stays on its own key (Space to lift), as now.
4. **Every link shows the focus ring** under `:focus-visible`, the same
   ring as buttons (design system, Focus and names). A link inside a card
   also raises its card (I37).
5. **One link per card or row** (A2 §1): stretched links are never
   repeated, so Tab does not stop twice on one thing.

## Inventory, for the builder

Before the switch, list every `<a href>` and every element that navigates
on click, and compare the Tab order before and after at 1440×900 on Home,
Initiatives, an initiative's Overview, and Settings. At the time of
writing there are two real links: `InitiativesView` `Open <id>` and
`RoleDrawer` initiative links. Anything that navigates through a `div` or
`span` with `onClick` is a finding: it becomes a link or a button.

## Acceptance

| # | The lead can | Checked by |
|---|---|---|
| T1 | reach every link with plain Tab | in the built app (WKWebView, macOS keyboard navigation **off**, the default), plain Tab lands on a card's `Open <id>` and a role drawer's initiative link; `main.go` sets `TabFocusesLinks` |
| T2 | skip past the bar and the rail | the first Tab on Home, Initiatives, an initiative and Settings focuses `Skip to content`, visible with the ring; Enter puts focus in the main region |
| T3 | cross the rail in one Tab | Tab enters the rail on the current or first row; Up and Down move; Enter opens; the next Tab leaves the rail for the main region |
| T4 | see where focus is | each link shows the focus ring under `:focus-visible` in WKWebView; `Open <id>` also raises its card |
| T5 | trust the order | the inventory and the Tab order before and after on the four screens, with no element that navigates without being a link or a button |

Evidence is in the built app, not Chromium: Chromium tabs to links whatever
the macOS setting is, so it cannot show T1.

## Out of scope

- Arrow-key navigation inside the board's columns.
- Keyboard shortcuts.
- A full focus audit of every screen; T5 covers order only.

## Amendment 1 (aglaea, 2026-10-13): from leftovers-22's reviews

From sup59's close (`runs/2026-10-13-sup59-leftovers-22.md`;
`working-on/done/lf22-tab-links.md`, `lf22-rail-roving.md`), for
leftovers-24.

### 1. The premise, corrected (G1)

On this Mac, with macOS Keyboard navigation off (the default), WKWebView
skipped **buttons as well as links**. Tab reached text fields and pop-ups
only. `TabFocusesLinks` made every button and link reachable. "Tab stops
only on buttons and fields" in the problem above holds only with Keyboard
navigation on.

### 2. Link or button: one rule (F1-F5)

- **A link** changes where you are: the screen, the initiative or the
  sub-view.
- **A button** changes what is shown in place: a filter, a focus, a scroll
  to something on the same view.
- Neither is ever a `span`, `li` or `div` with `onClick`.

| # | Element | Does | Becomes |
|---|---|---|---|
| F1 | Agents, a group's title | shows only this initiative's agents | **button**, `aria-pressed`, named `Show only <id>` |
| F2 | Conversations, a cell row | opens that initiative's conversations | **link**, named `Conversations of <id>`, `aria-current="true"` on the shown one |
| F3 | Conversations, a person | shows the chat with that seat | **button**, named `Chat with <seat>`, `aria-current="true"` on the shown chat |
| F4 | Conversations, a search hit | scrolls to the thread and marks it | **button**, named by the hit's subject; focus lands on the thread's divider |
| F5 | Conversations, a ruling (`q-ruling`) | opens its thread in the timeline | **button**, named `Open the thread <subject>`; focus lands on the thread's divider |

Each keeps its look. A button styled as the row it was keeps the row's
padding, with the focus ring on the row.

### 3. The skip link while a modal is open (G2)

While a modal (a drawer with a backdrop, a sheet) is open, **the skip link
is not rendered**: it would lead under the backdrop. `inert` is not used,
since the floor is Safari 15.0. If focus falls to `body` while a modal is
open, the next Tab goes to the modal's first control, which the trap
already owns.

### 4. The rail: counts, group heads, the strip, Roles (rr-ui U1-U3, A1)

- **Row counts read as one phrase** (U1, as I40 for the hero). The visual
  counts are `aria-hidden`, and the row's name is `<id>, <client>, rank
  <n>, <a> now, <b> blocked, <c> next`. Zeros are said, so every row reads
  the same way.
- **A group head is two stops, not four** (U2). They are:
  1. the collapse button `Collapse <group>`;
  2. a `⋯` menu `Actions for <group>`, with Rename, Move up, Move down
     and Remove.
  
  The group's drag handle leaves the Tab order (`tabindex="-1"`): the mouse
  still drags it, and Move up and Move down are the keyboard's way. Heads
  stay ordinary stops in DOM order, between their groups (2.4.3).
- **The collapsed strip is one stop** (U3). It uses the same roving
  tabindex as the expanded rail: Up and Down walk the ranks, and Enter
  opens one.
- **Roles join the rail's roving set** (A1). Down past the last initiative
  continues into the role items, and Enter opens a role's drawer as a
  click does. The `Collapse Roles` head stays an ordinary stop. Home's
  Roles section stays as it is, since it is main content and the skip
  link passes the rail. That takes Home from 54 stops to about 49, with the
  rail at 3 to 5 stops whatever the number of initiatives and roles.

### 5. Small ones (tl-ui U1, U2)

- The role drawer's initiative links get a 2 px inline padding, so the
  ring clears the comma.
- The landing ring on Home's `Needs me` heading: as built.

| # | The lead can | Checked by |
|---|---|---|
| T6 | reach F1-F5 by Tab and know what each does | each is a `button` or `a` with the name in §2, and none is a `span`, `li` or `div` with `onClick` (grep); in the harness each takes focus and Enter does what a click does |
| T7 | never land under a backdrop | with a drawer open, the skip link is not in the DOM; with focus forced to `body`, the next Tab lands inside the drawer |
| T8 | hear a rail row whole | in WKWebView's AX tree each row is one name, `<id>, <client>, rank <n>, <a> now, <b> blocked, <c> next`; the visual counts are hidden |
| T9 | pass a group head in two stops | grouped rail: between groups, Tab stops on `Collapse <group>` and `Actions for <group>` only; the menu's Move up and Move down reorder the groups |
| T10 | cross the strip in one Tab | with the rail collapsed, one Tab stop for every rank; Up and Down move; Enter opens |
| T11 | reach Roles from the rail with the arrows | Down past the last initiative lands on the first role; Enter opens its drawer; the Tab count of the rail is independent of how many roles and initiatives there are |
| T12 | see the ring clear the comma | the drawer's initiative link ring does not touch the following comma (WKWebView screenshot) |

## Amendment 2 (aglaea, 2026-10-13): from leftovers-24's UI reviews

From sup60's close (`runs/2026-10-13-sup60-leftovers-24.md`;
`working-on/done/lf24-controls.md`, `lf24-rail-keys.md`,
`lf24-drawer-skip.md`), for leftovers-25.

### 1. A name is the verb; what the row shows is its description (ct A1, rk U1)

A short `aria-label` on a rich row hides everything the row draws. The rule
from the design system ("a fact shown is a fact said") applies.

- **F1, F3, F5 keep a short name** (`Show only init-a`, `Chat with
  hermes`, `Open the thread <subject>`). The row's drawn content is tied
  to it with `aria-describedby`: counts, memory and cell state; live or off,
  deaf, context; who ruled, when, the words, next.
- **A rail row's name** (A1 §4) grows the facts it draws, after the
  counts and only when present: `…, 0 next, cell in definition`, `, 1 live
  agent`, `, 2 machines`.

### 2. F1 is a plain button (ct A2)

The titles show only while no filter is on, so `aria-pressed` could never
be true. Drop it.

### 3. A button that changes the view in place keeps focus (ct U2)

Choosing `Chat with <seat>` leaves focus on that button. Generally, a
button whose press changes what is shown in place, and does not unmount,
keeps focus (design system, Focus and names). F1's button unmounts, so
focus goes to the first agent row of the initiative it filtered to.

### 4. The rail walks in drawn order (rk A1)

This corrects A1 §4. The arrows follow the rail top to bottom, as drawn:
Roles (drawn above), then the initiatives. Up from rank 1 reaches the last
role, and Down from the last initiative stops there and does not wrap.

### 5. Grouped rails cost stops per group (rk A2): accepted

A1 §4's "3 to 5 stops whatever the number" holds for initiatives and
roles. Each shown group adds its head's two stops and its own row stop.
Groups are few and the lead's own choice, so this is accepted. The claim
now reads: "3 to 5 stops, plus 3 per group".

### 6. The strip's folds are stops (rk A3, U2)

`Asleep` and `Archived` are other targets, not ranks. They stay Tab stops
after the ranks. E4 reads "the next Tab leaves the ranks".

### 7. An item that can never act where it stands is left out (rk A4)

The first group's menu has no Move up, and the last has no Move down. This
differs from a disabled action: nothing the lead can do there makes it
act. The disabled-with-reason rule stays for actions that wait on a
condition.

### 8. The group menu fits its view (rk U3)

When the room below the ⋯ is shorter than the menu, it opens upward. It
never opens past the window's edge (a box fits its view).

### 9. The rename field is named (rk U4)

`aria-label="Rename <group>"`.

### 10. The drawer's initiative list has no commas (ds Q1)

A 6 px detached comma is a bad price for a ring only the keyboard sees.

- The initiatives are a list (`ul`, inline) of links with an 8 px gap and
  no separators. A screen reader counts the items.
- FR-11 is restated as its outcome: **a link's focus ring clears its
  neighbour by at least 2 px**, however that is built.

### 11. The FSE's own, read the same

All of these agreed:

- ct U1: `.tl-divider:focus-within .a-actions { opacity: 1 }`.
- The card back gets the role drawer's Tab trap.
- F2's cell-row link must be reachable in the built app, not only in
  vitest.

| # | The lead can | Checked by |
|---|---|---|
| T13 | hear what a row shows | F1, F3 and F5 have a short name and `aria-describedby` pointing to the row's content; a rail row's name ends with `cell in definition`, `n live agent(s)` and `n machines` where drawn (WKWebView AX tree) |
| T14 | keep his place after a choice | Return on `Chat with <seat>` leaves focus on it; after F1, focus is on the first agent row of the filtered initiative |
| T15 | walk the rail as drawn | Up from rank 1 lands on the last role; Down from the last initiative stays |
| T16 | see only menu items that can act | the first group's menu has no Move up and the last's no Move down; at 1024×640 a low group's menu opens upward, whole inside the window |
| T17 | hear the rename field | it is named `Rename <group>` |
| T18 | read the drawer's initiatives cleanly | a list with no commas, an 8 px gap, and the focus ring at least 2 px from the next item |
| T19 | see focus on a divider's actions | Tab onto Escalate, Close or Reopen shows them at full opacity with the ring |
| T20 | stay inside the card back | Tab from its last control goes to its first; no Tab lands on `body` |
| T21 | reach a cell row by Tab in the app | the harness in WKWebView, Keyboard navigation off, lands on `Conversations of <id>` |

## Amendment 3 (aglaea, 2026-10-13): from leftovers-25's UI reviews

From sup61's close (`runs/2026-10-13-sup61-leftovers-25.md`,
`working-on/done/lf25-*.md`), for leftovers-26.

### 1. A region that scrolls is a stop while it scrolls (dg-ui U3)

A body with no links cannot be scrolled from the keyboard. Any region that
scrolls inside a view or a box becomes a stop while it has content hidden
past an edge: the card back's `.modal-body`, a code block, a table.

- It takes `tabindex="0"` only while it overflows, and loses it when it
  does not.
- It is named: `role="region"` with `aria-label`. The card back's body is
  `<card title>, details`; a code block or table is `Code` or `Table`,
  followed by `, scrolls`.
- **An element with its own role keeps it** (a listbox, a table): it gets
  only the `tabindex` and the name while it overflows. `role="region"` is
  for elements without a role (leftovers-26 A1, ss-build).
- It shows the focus ring under `:focus-visible`. With it focused, the
  arrows, Page Up and Page Down, and Home and End scroll it, as WebKit does
  natively.
- A box's trap walks it like any other stop.
- The edge line (design system, Widths) still marks it.

**Names of every scroll region** (added 2026-10-13 for the FSE's FR-3
carry). Where the region sits under a visible heading, the name is that
heading through `aria-labelledby`. The words below are the fallback text:

| Region | Name |
|---|---|
| card back body | `<card title>, details` |
| role drawer body | `<role>, details` |
| rule box (the record's text) | `Record <NNNN>, <title>` |
| floating icon's list | `Initiatives list` |
| initiative header, open area | `Details of <id>`, which matches its button's `aria-controls` |
| Help | `Help` |
| a code block or table in any of them | `Code, scrolls` or `Table, scrolls` |

### 2. A described fact says its noun (nm-ui U1)

A description reads as a list of facts, each with its noun:

`session off, mail alive, owes 2 messages, context 42%`.

- The value words come from the one health table (`lib/health.ts`)
  unchanged, so the screen and the speech say the same words.
- The noun goes in front, since a value alone ("off alive") reads as a
  contradiction.
- The same holds for every `aria-describedby` from Amendment 2: counts
  carry their noun (`25 agents`, `1 agent`, never `1 agents`).

**The waiting count** (wd-ui U1, 2026-10-14). When the badge draws a
waiting count, the description says it right after the mail word:
`session off, mail stale, 1 message waiting, owes 2 messages, context 42%`.

- Any mail word that draws the count says it too: `deaf`, `capped`,
  `stale`. For deaf and capped the count is the evidence, so it is said.
- With nothing waiting, the badge draws no count and nothing is said.

| # | The lead can | Checked by |
|---|---|---|
| T22 | scroll a long card back from the keyboard | at 1024×640 an overflowing card body is a named stop in the trap; focused, Down scrolls it (`scrollTop` grows); when it does not overflow it is not a stop; same for a code block that scrolls sideways (Right scrolls it) |
| T23 | hear a person's state as facts | F3's description reads `session <word>, mail <word>, owes <n> message(s), context <n>%`, the words as in `lib/health.ts`; no count is said without its noun in the right number; a waiting count the badge draws is said after the mail word (`<n> message(s) waiting`), whatever the word |
