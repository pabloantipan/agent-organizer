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
