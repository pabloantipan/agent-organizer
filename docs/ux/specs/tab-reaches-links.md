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
