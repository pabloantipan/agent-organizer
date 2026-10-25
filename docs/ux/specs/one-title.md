# The window's top edge (aglaea, 2026-10-25)

Pablo, 2026-10-25, with a screenshot: "I see deltagos twice here, is it
neceesary?", then to the FSE: "Send to Aglaea for a propper aproach
please." This spec covers the whole top edge (the native title bar, the
traffic lights, the brand and version, the places and crumbs, the
groups), not just the duplicate. It revises what 0066 put at the top of
the window, so the FSE's record revising 0066 cites it and Pablo rules it.

## 0. What the top edge does today

Two bands, read top-down:

1. **The native title bar** (~28 px): the traffic lights, and `Deltagos`
   centred. It holds nothing else.
2. **The top bar** (`TopBar.tsx`, leftovers-17), grouped by kind:
   - the brand `Deltagos` (a span, with the version only in its hover);
   - where you are (Places: Home, Initiatives, Usage; then the crumb or
     the Review crumbs);
   - this Mac (memory, status);
   - your work (Needs me, Rescan, Sync);
   - the app (Lock, account, Compact, Help, Settings).

   At 1024 the bar is already at its limit: it folds in four steps
   (A3 §2), and cm-build measured it 42 px over before the folds.

While the window is active, macOS's menu bar also says **Deltagos** in
bold, right of the Apple menu. So the name is on screen **three** times
when the window is focused, and the version can be reached only by
hovering a word that does not look interactive, which the design system's
"never only a hover" forbids.

## 1. The approach: one band, and the system says the name

**One band.** The window's content runs to its top edge (the native bar is
hidden, its title text gone), and the traffic lights sit at the left of
the top bar. The 28 px band that held only a repeated name goes to the
content.

**The name is said by the system, not drawn twice by us.** While the
window is in front, the menu bar names the app. The Dock, Cmd-Tab,
Mission Control, the Window menu and VoiceOver all read the window's
title, which stays `Deltagos` (`Deltagos Review` in the review build).
Mac apps with this one-band shape (Slack, Linear, Notion, Teams) do not
repeat their own name inside the window. Their top-left is the traffic
lights, then where you are.

**So the brand word leaves the top bar, and the traffic lights take its
place.** That is also what makes it fit:

- The lights need about 80 px at the left.
- The brand and its group gap gave back about 86 px.
- At 1024 the bar is as wide as today, with no new fold step.
- Keeping the brand after the lights would cost about 86 px at 1024, one
  more fold, for a third copy of the name.

**The version gets a real home**, since the brand's hover goes with the
brand:

- the app menu's **About Deltagos** (macOS's native place for it; Wails
  `mac.Options.About`, title `Deltagos`, message `Version <version>`);
- one line at the foot of **Settings**: `Deltagos <version> · <machine>`,
  selectable text.

`organizer version` is unchanged.

## 2. The top bar, left to right

```
┌───────────────────────────────────────────────────────────────────────┐
│ ● ● ●   Home  Initiatives  Usage   camp      ▣ 62%   ⌂ Needs me 3   ↻ Rescan   ?  ⚙ │
└───────────────────────────────────────────────────────────────────────┘
  └ lights' box, 80 px ┘
```

- **The lights' box**, 80 px from the window's left edge. It holds no text
  and no control, and it is a drag region. The lights are drawn by macOS,
  never by us.
- **Where you are**, first after the lights: Places, then the crumb (or
  the Review crumbs). Unchanged otherwise (initiatives-view A3, I22). The
  place you are on is now the first thing read at the top left, which is
  what the brand used to hold without telling you anything.
- **This Mac · your work · the app**, as today, with the same fold steps.
- **Height**: the lights are vertically centred on the top bar's content
  line (±2 px). The build picks the title-bar variant (Wails `TitleBar
  Hidden` or `HiddenInset`) and the top bar's height between 40 and 52 px
  that gives this, measured, and states which in the card.
- **Drag and double-click**: every empty stretch of the bar drags the
  window, and every control is no-drag (as today). A double-click on empty
  space does what the user's system setting says ("Double-click a window's
  title bar to": zoom, minimise or nothing), as a native title bar does.
- **Full screen**: the lights are gone, and the 80 px box stays. The
  places do not jump when the window enters or leaves full screen.
- **Window inactive**: the lights grey out as macOS draws them. The bar
  does not change.
- **Keyboard and screen reader**: the brand was never a Tab stop, so the
  order is unchanged and the first stop is still the first place. The
  window's title stays the name VoiceOver says when the window is
  focused. Nothing inside the window needs to say `Deltagos`.

## 3. What does not change

- The window title (`Deltagos`, `Deltagos Review`), so seat-pointer and
  every reviewer's window lookup still find it.
- The bundle, the DMG, the Dock icon, the menu bar's app name.
- The top bar's groups, their order after the brand, the fold steps, and
  the one `aria-current="page"` rule.
- The Compact-to-icon float and the lock screen. The lock screen draws no
  top bar today; it gets the same lights' box at its top left and nothing
  else.

## 4. Cut

- No app name or logo inside the window. If Pablo later wants a mark
  there, it is the app icon at 16 px after the lights, not the word, and
  it counts against the 1024 budget.
- No custom traffic lights, and no moving them.
- No second band for anything: the top edge is one row.

## Acceptance

| # | Pablo can | Checked by |
|---|---|---|
| T1 | read the name once | with the window in front, `Deltagos` shows in the menu bar and nowhere inside the window; there is no native title text |
| T2 | find the window from the system | Cmd-Tab, Mission Control, the Window menu, the Dock's window list and VoiceOver say `Deltagos` (the review build: `Deltagos Review`); seat-pointer finds it by title |
| T3 | get the room back | the content starts at the window's top edge, so the window shows about 28 px more content than on main at the same size |
| T4 | leave the lights alone | at 1024×640 and 1440×900, no top bar text or control lies within 80 px of the left edge; the lights are centred on the content line ±2 px |
| T5 | keep the bar on one line | at 1024×640 the bar folds at the same step as on main with the same content (Needs me with a badge, `Sync · stale`) |
| T6 | move and zoom the window | dragging any empty stretch of the bar moves the window; a double-click there follows the system setting; pressing a control never drags |
| T7 | read the version | the app menu's About Deltagos shows `Version <version>`; Settings' foot reads `Deltagos <version> · <machine>`; no hover is needed |
| T8 | keep his place in full screen | entering full screen, the places stay at the same x |
| T9 | be met the same at the lock | the lock screen keeps the lights' box free and shows no title text |
