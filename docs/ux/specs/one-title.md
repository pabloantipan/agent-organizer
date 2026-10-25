# The name once at the top of the window (aglaea, 2026-10-25)

Pablo, 2026-10-25, with a screenshot: "I see deltagos twice here, is it
neceesary?" It is not. The native title bar draws `Deltagos` centred, and
the top bar starts `● Deltagos` with the version right under it. A fact
shows once per screen.

## The pick: hide the native bar's text (the FSE's recommendation)

- The window's title bar becomes Wails mac `TitleBarHiddenInset()`: the
  title text and the bar's own band go, the content runs to the window's
  top edge, and the traffic lights sit over the top bar. The window keeps
  its title `Deltagos` for Mission Control, Cmd-Tab, the Window menu,
  VoiceOver and seat-pointer's window lookup.
- **The top bar is the one place the name shows**, and keeps `● Deltagos`
  plus the version line. The app gains the native bar's ~28 px.
- Not the alternative (keep the native bar, drop the brand from the top
  bar): the native band would hold only the name, the top bar's left would
  lose its home mark, and the 28 px would stay spent on chrome.

## What the top bar must leave free

- **The traffic lights' box**: the top bar's left padding is at least
  **80 px** from the window's left edge (the three lights end near 70 px
  in hidden-inset; 80 leaves the system's gap). Nothing interactive and no
  text sits in it. It is a drag region like the rest of the top bar's
  empty space.
- **Height**: the top bar is at least **40 px** tall so the lights sit
  inside it, vertically centred on its content line within ±2 px. If the
  top bar is shorter, it grows to 40; it does not move the lights.
- **Drag**: the bar's empty space drags the window, every control in it is
  no-drag (as today). Double-click on the empty space zooms the window, as
  a native title bar does.
- **Full screen**: the lights are gone, and the 80 px stays. One layout in
  both modes is better than a brand that jumps when the window goes full
  screen.
- **The rail collapsed (46 px)** does not change any of this: the top bar
  spans the window above the rail.
- Window inactive: the lights grey out as the system draws them. The top
  bar does not change.

## Acceptance

| # | Pablo can | Checked by |
|---|---|---|
| T1 | read the name once | the window shows `Deltagos` once, in the top bar; there is no native title text; Cmd-Tab, Mission Control and the Window menu still say `Deltagos` |
| T2 | reach every control | at 1024×640 and 1440×900, no top bar control or text lies within 80 px of the window's left edge; the lights are centred on the top bar's content line ±2 px |
| T3 | move the window | dragging the top bar's empty space moves the window; double-click zooms it; pressing any control does not drag |
| T4 | keep the layout in full screen | in full screen the brand stays where it was |
| T5 | still be found by a seat | seat-pointer finds the window by its title `Deltagos` |
