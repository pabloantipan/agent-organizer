# Deltagos floating on every desktop

status: proposed
owner: pablo
by: aglaea, 2026-10-05, for the FSE (thread 01M46K870W9YST0YV90F1S8GSE)
rulings it rests on: 0088 (scope, Pablo's words); the design system
(Elevation, Motion, Focus and names, signals' fold order, dates as words);
0089 (spike, proposed) decides what is native

Looked at: 0088, the app icon (`build/appicon.png`: three rounded bars in
now purple, blocked red and next periwinkle on the warm near-black ground),
and the design system. Nothing to run yet. The icon may be a native panel
(NSPanel, Core Animation), so everything it does below is a transform,
opacity or shadow that Core Animation does directly.

## The problem, in the lead's terms

Pablo, 2026-10-05: "I've seen Teams feature that reduces the full view to an
small square along all desktop … let's place an icon with an animation …
on click … show the list of initiatives, with a search, and then on click at
one, we show that one at full deltagos", and "Let's add that 'floating'
impression Teams does to our app please" (`said`). He works on several
desktops; Deltagos lives on one. On the others he has no way back to it
without switching desktops.

## 1. The icon

- **Shape**: the app icon's mark, the three bars, on a 56×56 rounded
  square (radius 14, continuous corners), ground `--bg` (#1a1523), 1 px
  hairline in white at 8% inside the edge (the design system's overlay
  edge). The bars use the status hues as in the app icon. It is
  recognisably Deltagos's own icon, smaller.
- **Size**: 56 px, the size of a Dock icon at its default, so it reads as
  an app and still leaves the desktop alone.
- **Animation, decorative** (0088: "Decorative only"): the three bars
  breathe. Each scales on Y from 0.82 to 1.0 and back, anchored at its
  base, over 2.4 s, easing in and out, staggered by 0.3 s per bar, and
  repeats forever. One `CABasicAnimation` on `transform.scale.y` per bar
  layer, `autoreverses`, a different `beginTime` each. It says nothing about
  state: the same motion whatever waits.
- **Reduced motion** (macOS "Reduce motion"): no breathing; the bars stand
  still at full height. Hover and drag keep their shadow change and drop
  the scale.
- **Name**: accessible name `Deltagos`, role button, hint `Opens the
  initiative list`. The hover tooltip says `Deltagos`.

## 2. The floating look

What makes it feel like it floats is the shadow and a slight lift, not
colour.

| State | Shadow | Scale | Other |
|---|---|---|---|
| resting | two layers: `0 1px 3px rgba(0,0,0,.35)` and `0 8px 24px rgba(0,0,0,.40)` | 1.0 | |
| hover | `0 2px 4px rgba(0,0,0,.35)` and `0 12px 32px rgba(0,0,0,.45)` | 1.06, 120 ms ease-out | pointer cursor |
| pressed | the resting shadow | 0.96, 80 ms | |
| dragging | `0 16px 40px rgba(0,0,0,.50)` | 1.08 | follows the pointer; opacity 1 |
| dropped | back to resting over 160 ms | 1.0 | |

- **Drag**: from anywhere on the icon. A press that moves more than 4 px is
  a drag; less is a click. It is placed freely, kept 8 px inside the
  visible screen, never under the menu bar or the Dock, and its place is
  remembered per display and shared by every desktop, so it is in the same
  spot wherever he goes.
- **First place**: the bottom-right corner, 24 px in from both edges.
- **Never** over a full-screen app's desktop (0088), never stealing focus
  when it appears, and never above a system dialog.
- **Appearing**: on a desktop other than Deltagos's, it fades and scales in
  from 0.9 over 200 ms. Under reduced motion it simply appears.

## 3. The list panel

Clicking the icon brings Deltagos to this desktop as a panel: the list of
initiatives, to pick one.

- **Place and size**: anchored to the icon, opening toward the centre of the
  screen. 360 px wide; as tall as its rows up to 480 px, or 70% of the
  screen's height if smaller; then it scrolls its own list, with the scroll
  edge. Radius 12, surface `--surface-overlay`, the same two-layer shadow as
  the icon's hover. It opens in 160 ms from the icon's corner, with only a
  fade under reduced motion.
- **Head**: one search field, focused on open, placeholder `Find an
  initiative`, with no other title. It filters as he types, by id or goal
  words, every word in any order.
- **First row**: `Home`, with Needs me's count (`Home · 3 need you`), since
  Home is where his queue is. It is one row, and it opens Home full.
- **Rows**: the rail's order and its groups, as the rail draws them: a small
  `--fg-subtle` group heading, then one row per initiative, 36 px high,
  showing the rank number, the id (mono), and the signals in one line by the
  design system's fold order (waits on you, blocked and waiting never fold).
  The not-active group sits folded at the end, as in the rail. No goal, no
  stage: name and signals (0088).
- **Keyboard**: ↑ and ↓ move through the rows, starting on the first match;
  Enter opens the row; Escape clears the search, then closes the panel; Tab
  stays inside the panel. The pointer works the same: one click opens.
- **Choosing one**: Deltagos opens full on **this** desktop, on that
  initiative (`openInitiative(id)`, with its current sub-view), growing out
  of the panel in 200 ms (none under reduced motion). This desktop becomes
  Deltagos's own; the desktop it left now shows the icon.
- **Closing without choosing**: Escape, a click outside, or the icon. It
  goes back to the icon, and nothing moves.

| State | What shows |
|---|---|
| list | Home, then the groups and rows |
| filtering | the matching rows, with group headings only over groups that have matches; the first match is highlighted |
| no match | `No initiative matches "pay".` and `Clear` |
| no initiatives | Home, then `No initiatives yet. Deltagos finds them under the roots in its settings.` |
| still scanning on first launch | the cached list at once; if there is none, `Reading initiatives…` |

## 4. The compact button

On the desktop where Deltagos is full, a button in the top bar, just left of
Help: an icon of the three bars shrinking into a corner, named `Compact to
icon`, with the hover title `Compact to icon (the icon floats on every
desktop)`. It is a default (quiet) button, never the accent. Pressing it
shrinks the window into the icon at the icon's remembered place (200 ms, a
plain swap under reduced motion). The icon then shows on this desktop too.

## 5. Moving between desktops

- He leaves Deltagos's desktop: nothing changes there; every other desktop
  shows the icon (0088: "it compacts automatically").
- He comes back: the full window is where he left it, and there is no icon
  on that desktop.
- He compacted it: every desktop shows the icon, including the one it came
  from, until he picks something from a panel.

## Acceptance, in the lead's terms

| # | The lead can | Checked by |
|---|---|---|
| F1 | find Deltagos on any desktop | on a second desktop, the icon is shown at its remembered place; on a full-screen app's desktop it is not |
| F2 | tell it floats | shots: resting and hover shadows as the table; hover scales to 1.06 |
| F3 | see it breathe, or not | the three bars animate staggered; with Reduce motion on, they are still |
| F4 | move it where he wants | drag to a new spot; on another desktop it is in the same spot; it never lands under the menu bar or Dock |
| F5 | pick an initiative by typing | click the icon: the panel opens with the search focused; type `pay`, Enter: partner-payouts opens full on this desktop |
| F6 | read what waits on each initiative in the list | rows show signals with blocked and waiting whole |
| F7 | get out without moving anything | Escape twice, or a click outside: back to the icon, the window still on its own desktop |
| F8 | compact Deltagos by hand | the top bar's `Compact to icon` shrinks it into the icon |
| F9 | use the panel by keyboard and screen reader | ↑↓, Enter, Escape as §3; the icon's name is `Deltagos`, a button |

## Open questions

- **O1** (Pablo, through the FSE): 0088 made the animation decorative. Should
  the icon still carry Needs me's count as a small badge, the way Teams
  shows unread? I left it out to keep to the ruling; it would be one red
  number at the icon's top-right corner, outside the animation.
- **O2** (FSE): reaching the icon without a pointer. A global shortcut to
  open the panel is the usual answer, but it is outside 0088. Raise it if
  0089's spike makes it cheap.
- **O3** (FSE): the `Home` row is my addition. It costs one row, and
  without it the panel cannot reach his queue.

## Technical notes

by the FSE, 2026-10-05, from the spike's Findings (branch
`floating-icon-spike`, d8d6585; card in `done/`, 0089) and scope 0088.

- **T1, the shape (0090 decides it).** Recommended, as the spike proved on
  Wails v2: a native non-activating `NSPanel` for the icon (Objective-C,
  darwin-only, about 250-300 lines, `floaticon_darwin.m/.h` plus Go glue),
  the main Wails window as the list panel and the full app. The
  alternatives, and their costs, are in 0090.
- **T2, desktops.** Show and hide on `NSWorkspaceActiveSpaceDidChangeNotification`
  plus `-[NSWindow isOnActiveSpace]`; no private API (no `CGS*`/`SLS*`
  symbols in the binary). The icon appears about 1.2 s after a switch
  starts, after the slide: the floor with public API.
- **T3, full-screen desktops.** `FullScreenNone` is not enough. Hide the icon
  when another app's layer-0 window covers a whole display
  (`CGWindowListCopyWindowInfo`: owner pid, layer, bounds), checked only
  after the slide (the spike's 0.5 s re-check misfired twice mid-slide) and
  again on the next notification. Tried on one display only; a second,
  smaller display is untested and a gate row says so.
- **T4, bringing Deltagos here.** `NSWindowCollectionBehaviorMoveToActiveSpace`
  around `setFrame` and `orderFrontRegardless`, restored 150 ms later, then
  activate. Never `orderFront` a window ordered out on another Space without
  it (it pulls the user back there). "Pick nothing" returns the window home
  through a 1x1 `Managed` marker window on the home Space, re-ordered on
  arrival. The list size (360x520) is set with `setFrame`; the 1024x640
  minimum (Wails' `userMinSize`) is restored when it goes full.
- **T5, Wails internals it leans on:** the window found by class name
  `WailsWindow` in `[NSApp windows]`, and `userMinSize`. Both are named in a
  comment and a startup check logs if either is missing (no crash, no icon).
- **T6, the list panel** is the frontend (`FloatList.tsx`), shown on the
  Wails event `floaticon:list`; rows from the board in the rail's order and
  groups, signals in the fold order; choosing one is `openInitiative`.
- **T7, by hand.** Pointer drag, the 4 px click threshold, and the panel by
  pointer are checked by Pablo with a script like the spike's
  `y1-pointer.sh` (the seats may not post synthetic pointer events).
- **T8, nothing new for signing**: no entitlement; `codesign --options
  runtime` as today.
- Spec check (spec-craft 5b, with the gate lines proposed 2026-10-05): every
  F row fails on main today (there is no icon); pointer rows name Pablo;
  files by grep (`TopBar.tsx`, `app.go`, `WailsWindow`). Result: holds.
