# Floating icon: the macOS spike

status: proposed (0089)
by: the FSE, 2026-10-05, on main; scope ruled in 0088.

## Problem

0088 asks for the Teams behaviour: Deltagos full on its own desktop, a
floating animated icon on every other desktop, appearing by itself when the
operator switches desktop. Wails v2 (v2.15.0, one window) exposes size,
position, always-on-top and drag, but not a window's Spaces behaviour, a
second window, or "which desktop is active". macOS has no public API for a
Space's identity. The likely shape is a native non-activating `NSPanel`
(on all Spaces, floating, not over full-screen apps) beside the Wails
window, shown when the main window is not on the active Space
(`isOnActiveSpace`, `NSWorkspaceActiveSpaceDidChangeNotification`). It is
unproven here, and the riskiest native code the app would carry.

## Requirements, card `floating-icon-spike`

A throwaway branch that proves or disproves each point, with the numbers,
and writes the answer to `docs/specs/floating-icon-spike.md` under
"Findings". Nothing merges to main but that file.

- **FR-1** A native `NSPanel` from the Wails app's process (cgo,
  darwin-only file): borderless, rounded, shadowed, draggable, on all
  Spaces, not over full-screen apps, not stealing focus, showing an animated
  image (Core Animation).
- **FR-2** It shows when the main window is not on the active Space and hides
  when it is, by itself, on a Space switch (no private API).
- **FR-3** A click on it brings the main window to the active Space, sized as
  a panel (about 360×520), with the frontend told to show a list view
  (a Wails event); the main window can then go full size there.
- **FR-4** A top-bar action on the main window's own Space hides the main
  window and shows the icon.
- **FR-5** Cost and risk: lines of native code, what Wails v2 fights (its
  window delegate, the 1024×640 minimum), what a Wails v3 multi-window
  build would change, and whether signing or notarising changes.

## Acceptance → gate

| # | FR | Check | Expected |
|---|---|---|---|
| Y1 | 1–4 | a screen recording on lodestar: three Spaces, a full-screen app on one; switch through them; drag the icon; click it on Space 3; pick nothing; then compact by the button on Space 1 | each point behaves as stated, or the finding says why not |
| Y2 | 5 | the Findings section | every FR answered yes / no / with conditions, with the numbers |

## Boundary

A spike branch `floating-icon-spike`, not merged; only `docs/specs/floating-icon-spike.md`
(its Findings) comes back to main. Not: any production file on main.

## Cards

| Card | Gate rows | Depends on | ui_review |
|---|---|---|---|
| `floating-icon-spike` | Y1, Y2 | — | false |

## Findings

fis-build, 2026-10-05, on lodestar (macOS 26, Darwin 25.1.0, Wails v2.15.0,
one 3440×1440 display), branch `floating-icon-spike`. Spike code:
`floaticon_darwin.m`, `.h`, `.go`, a hook in `app.go`, `FloatList.tsx` and a
Compact button in `TopBar.tsx`. Logs, stills and the recording are in
`.wt-notes/fis-build/` in the root (not committed).

### Verdicts

- **FR-1 yes, with one condition** (the pointer drag and the 4 px threshold
  were proven by hand afterwards; see the Y1 pointer take). A borderless non-activating `NSPanel` from
  the app's own process works: rounded (radius 14, continuous corners),
  two-layer shadow drawn by layers, three bars breathing on
  `transform.scale.y` staggered 0.3 s, on every Space, never key. The
  pointer drag and the 4 px click/drag threshold (`mouseDown/Dragged/Up` in
  `FloatIconView`) work by hand: in Pablo's take, drags started at 4.3 and
  21.7 px and clicks registered at 0.8 and 0.0 px (Y1 pointer take below).
  The driver take's drag (take 4) moved the panel with `setFrameOrigin` from
  code and is not evidence for them. The condition: `FullScreenNone` does
  **not** keep a `CanJoinAllSpaces` panel off a full-screen app's Space; the
  icon showed over TextEdit in full screen
  (`still-fs-without-check.png`, `FLOAT_NO_FS_CHECK=1`). A public-API check fixes it: on a Space change, if
  another app's layer-0 window covers a whole display in
  `CGWindowListCopyWindowInfo` (owner pid, layer and bounds only), hide.
  With that, take 4 shows no icon on the full-screen Space.
- **FR-2 yes.** `NSWorkspaceActiveSpaceDidChangeNotification` plus
  `-[NSWindow isOnActiveSpace]` (and `isVisible`) is enough; no private API.
  `float.log` holds 106 Space-change notifications (70 of them after the
  on-screen window list was added to the log). `isOnActiveSpace` was already
  correct when each one arrived. The 0.5 s re-check did change something
  twice (`float.log` lines 599 and 614, a run of back-to-back ctrl+← at
  ~1.5 s apart): it hid the panel through the full-screen check on a normal
  Space, because mid-slide `CGWindowListCopyWindowInfo` lists both Spaces'
  windows (line 614 lists TextEdit on the way to S1). The next notification
  showed it again. See risk 2 below.
- **FR-3 yes, with conditions.** What brings the window to the active Space:
  set `NSWindowCollectionBehaviorMoveToActiveSpace`, `setFrame`,
  `orderFrontRegardless`, restore the behaviour 150 ms later, *then*
  activate. A temporary `CanJoinAllSpaces` works the same way. What does
  **not** work: moving the frame (`move`), and `orderOut` + `orderFront`
  (`reorder`): in both, activating the app switches the user back to the
  window's own Space instead (macOS "switch to a Space with open windows for
  the application", on by default here). An ordered-out window keeps its old
  Space: ordering it in later yanks the user there. The list comes up by a
  Wails event (`floaticon:list`) the frontend answers; a row or Full size
  restores the 1024×640 minimum and fills the screen there.
- **FR-4 yes.** Compact = `orderOut` the main window plus a `compacted` flag;
  the icon then shows on every Space including the home one, until the next
  click.
- **FR-5 answered below.** About 280 lines of Objective-C for the real thing,
  nothing new for signing.

### Numbers

| What | Measured |
|---|---|
| keystroke (osascript ctrl+→) to notification | 1.15–1.21 s over every logged switch (osascript itself costs 0.03 s) |
| notification to panel shown or hidden | 1–6 ms (same run-loop turn), then a 200 ms fade-in |
| show, Space 1 → 2 (burst of region captures) | slide moves from ~0.5 s to ~1.2 s after the key; icon absent through the slide, visible in the first frame after it (≈1.3 s). It appears **after** the slide |
| hide, Space 2 → 1 | the icon rides the slide over Deltagos (it is on every Space) and vanishes ≈0.1 s after the slide ends |
| click to window on this Space | 10 ms to `isOnActiveSpace` = 1; activation 150 ms later |
| 1024×640 minimum vs 360×520 | `setFrame` is not clamped by `minSize`: with the minimum untouched the window still came up 360×520 (`FLOAT_KEEP_MIN=1`). The minimum bites on user resizing (an edge drag snaps to ≥1024×640) and in Wails' own `adjustWindowSize` (runtime `WindowSetSize`, `WindowSetMinSize`, full-screen exit re-applies `userMinSize`). The spike lowers both `-[NSWindow setMinSize:]` and Wails' `userMinSize` (KVC on `WailsWindow`, an internal property) to 360×520 on click and puts 1024×640 back on Full size / pick nothing |
| native lines (`wc -l`) | `floaticon_darwin.m` 413 at ee49014, 416 with the pointer logging of e91d2a7 (of which ~60 spike-only: demo driver, on-screen logging, the three losing FR-3 modes), `.h` 6; Go glue `floaticon_darwin.go` 80 (35 of it the demo driver); frontend 34 + 1 |

### What Wails v2 fought

- **No handle to its window.** v2 exposes no `NSWindow`; the spike finds it
  by class name (`WailsWindow`) in `[NSApp windows]`. Works, but it is an
  internal class name.
- **Its minimum size lives twice**: `NSWindow.minSize` and `WailsWindow.userMinSize`,
  re-applied by Wails after full screen and on any runtime size call. A
  compact size needs both lowered (KVC on an internal property) or the
  runtime's `WindowSetMinSize` called from Go with the threading that implies.
- **Single window.** The list has to be the main window, so "pick nothing"
  must move the window back home. Ordering it back in pulled the user to the
  Space it was last on; the fix is the same MoveToActiveSpace trick, fired
  when the home Space becomes active, which is known only through a 1×1
  invisible marker window (`Managed`, not `Transient`: a transient window
  follows you to every Space, which made the first attempt lie).
- **Activation policy and activation.** Wails sets `Regular` and calls
  `activateIgnoringOtherApps` at launch; any later activation while the
  window is elsewhere triggers the Space switch above, so order matters:
  window first, activate after. Pick nothing calls `[NSApp deactivate]`.
- **Its window delegate** was not in the way: nothing in the spike needed
  `NSWindowDelegate` callbacks, so Wails' `WindowDelegate` stays untouched.
- **Not Wails, macOS**: "Automatically rearrange Spaces based on most recent
  use" is on (the default) here, so every activation-driven switch reordered
  the Spaces between takes (S2 was Chrome in one take, Teams in the next).
  The feature must not assume a Space order; the spike never does.

### Wails v3 (read, not built)

v3.0.0-beta.28 (`v3/pkg/application/webview_window_options.go`,
`v3/pkg/events/events.go`): several windows from Go
(`app.Window.NewWithOptions`), and per window `Mac.WindowClass =
MacWindowClassPanel` with `Mac.PanelPreferences{FloatingPanel, NonActivating}`,
`Mac.CollectionBehavior` (`MacWindowCollectionBehaviorCanJoinAllSpaces`,
`…MoveToActiveSpace`, `…Stationary`, `…FullScreenAuxiliary`, …),
`Mac.WindowLevel`, per-window `MinWidth`/`MinHeight`, and window events
`mac:WindowDidChangeSpace` / `WindowDidChangeScreenSpace`. So in v3 the icon
could be a frameless webview panel and the list its own small panel window:
the main window would never leave its Space, the minimum-size juggling and
the home marker go away, and most of the Objective-C becomes options. Still
needed natively or unverified: `isOnActiveSpace` (no v3 method found), the
full-screen check, the Core Animation bars if the icon stays native. v3 is
beta; moving the app to it is a migration, not a card.

### Signing and notarising

Nothing new needed. The release signs with `codesign --options runtime`
(hardened runtime) and no entitlements file; the spike uses `NSPanel`,
`NSWorkspace` notifications, Core Animation and
`CGWindowListCopyWindowInfo` for owner pid, layer and bounds only, none of
which needs an entitlement. Window *titles* (`kCGWindowName`) would need
Screen Recording; the spike does not read them. Condition: checked against
the docs and an ad hoc signed build launched from a terminal (which carries
the terminal's TCC grants); not checked with a Developer ID build launched
from Finder.

### Y1, the recording

`.wt-notes/fis-build/y1.mov` (take 4, 62 s, `screencapture -v -V 62`), stills
`still-1…6`. Space order in this take: S1 Deltagos (full) · S2 Teams · S3
Chrome · TextEdit in full screen (my window, the full-screen app) · S4 · S5.
Space switches are real ctrl+←/→ through System Events. **Drag, click, pick
nothing and Compact are driven by a spike-only signal driver** (`do.sh`,
SIGUSR1), because synthetic pointer events were refused to this seat. The
click, pick nothing and Compact commands call the same functions the UI does
(`bringMain` + `floatIconClicked`, `FloatIconDismiss`, `FloatIconCompact`).
The drag command does **not**: it animates `setFrameOrigin` and skips
`mouseDown/Dragged/Up` and the 4 px threshold. The real pointer path and the
top-bar button were not exercised by me.
Times ±0.5 s (recorder start-up).

| t (s) | Action | What happens |
|---|---|---|
| 0–3 | S1 | Deltagos full, no icon |
| 3.0 → 4.2 | ctrl+→ to S2 | icon fades in after the slide, bottom right |
| 6.9 → 8.1 | ctrl+→ to S3 | icon stays |
| 10.6 → 11.8 | ctrl+→ to TextEdit full screen | icon hidden at the slide's end (full-screen check) |
| 14.9 → 16.0 | ctrl+← to S3 | icon back |
| 18.0–19.0 | drag (driver, −500, +300 px) | icon moves |
| 21.3 | click (driver) | Deltagos comes to S3 at 360×520 by the icon, showing the spike list; icon hides |
| 25.6 | pick nothing (driver) | window leaves S3, icon back |
| 28.1 → 29.3 | ctrl+← to S2 | icon |
| 31.8 → 33.0 | ctrl+← to S1 | Deltagos back full where it was; icon gone after the slide |
| 36.0 | Compact (driver, same call as the top-bar button) | window hidden, icon on S1 |
| 39.8 → 41.0 | ctrl+→ to S2 | icon |
| 42.9 → 44.1 | ctrl+← to S1 | icon (still compacted) |

**Y1 pointer, by hand: done by Pablo, 2026-10-05, with conditions.** He ran
`.wt-notes/fis-build/y1-pointer.sh` twice (16:41:39 and 16:42:07). Run 1 has
no pointer lines (S2, S3, back to S1, then stopped with Ctrl+C). The file
`y1-pointer.mov` is **run 1's recorder**: born 16:41:44, 89.995 s long
(`avmediainfo`), last written 16:43:14. Ctrl+C did not stop it, it outlived
run 2's `rm -f`, and it was written last, so run 2's own recording is lost.
Because it records the whole main display, it still shows run 2's pointer
actions at t ≈ 26–43 s. Recording t = `float.log` epoch − 1791229304.8,
±0.3 s, checked on frames at t 31, 32, 33, 34, 37, 41, 42, 43.

| t (s) | `float.log` | What happens |
|---|---|---|
| 26.4 | space-change, panel show | ctrl+→ to S2 (Teams): icon appears |
| 27.8 | space-change | ctrl+→ to S3 (Chrome): icon stays |
| 31.7 | `pointer down`, `pointer drag start … (moved 4.3 px)` | the drag begins at the first event past 4 px |
| 32.7 | `pointer drag end … panel origin {2494, 720}, moved 1043.0 px` | icon dropped mid-right, stays there |
| 33.2 | `pointer click … (moved 0.8 px, under the 4 px threshold)` | a real click, through `mouseUp` |
| 33.5 | `click +0.3s: onActive=1 frame={{2218, 812}, {360, 520}}` | Deltagos comes to S3 at 360×520 by the icon, with the list; icon hides |
| 36.4 | space-change, panel show | ctrl+← to S2. **Pick nothing was not pressed**: the small window stays on S3 |
| 38.3–39.8 | `pointer drag start (moved 21.7 px)` … `drag end … moved 1007.0 px` | second drag on S2, to the bottom right |
| 40.2–40.5 | `pointer click (moved 0.0 px)`, `frame={{2978, 152}, {360, 520}}` | the window comes from S3 to S2 at 360×520 |
| 41.9 | `full: frame={{0, 103}, {3440, 1306}}` | a list row or Full size: Deltagos full on S2, which becomes its home |
| 42.3 | space-change, panel show | ctrl+← to S1: the icon shows there, because the window now lives on S2 |

Proven by the pointer: the 4 px threshold (drags started at 4.3 and
21.7 px, clicks at 0.8 and 0.0 px); a click brings the window to the active
Space at 360×520, twice, including from a Space that was not its home; the
list's row/Full size goes full there. **Not proven by the pointer**: Pick
nothing and the return to S1, since he took the list to full instead. The
driver take (take 4, t 25.6–33.0) remains the only evidence for those.
Nothing in the take misbehaved. The script's cleanup does not run on Ctrl+C:
both runs left their 8 fixture stand-ins alive, and I ended those 16 by pid
afterwards. A by-hand script needs a `trap` and should give each run its own
recording file.

Also seen, not driven by me: during an earlier test Pablo clicked a row of
the spike list on his own Space and the window went full there (`full:` at
16:14:42 in `float.log`).

### What the build spec needs to know

1. Use MoveToActiveSpace (or a temporary CanJoinAllSpaces) around
   `orderFrontRegardless`, and activate only after the window is on the
   active Space. Never `orderFront` a window that was ordered out on another
   Space without it.
2. `FullScreenNone` is not enough; keep a full-screen-Space check (or accept
   the icon over full-screen apps and amend 0088). **Risk:** the spike's
   check (another app's window as large as a display in CGWindowList) can
   misfire on a fast switch, since mid-slide the list holds both Spaces'
   windows: it hid the icon on a normal Space twice in this run until the
   next switch. Run the check only once the slide is over (or re-run it on
   the next notification and a later tick), and it was tried on **one
   display only**: it compares each window against every screen's size, so
   a second, smaller display is untested.
3. The icon appears ~1.2 s after a switch starts, after the slide, and slides
   along on the way back home for ≈0.1 s past the slide. That is the floor
   with public API; there is no "will change" notification.
4. With one Wails window, "pick nothing" needs a home marker window and
   re-ordering on arrival; the window then reappears after the slide, not
   with it. A second window (v3, or a second native window with its own
   webview in v2, which the spike did not try) avoids moving the main window
   at all and fits F7 better.
5. Hover, pressed, dropped states, Reduce motion, the remembered place per
   display and keeping 8 px inside the screen were skipped (cheap: a
   tracking area and `NSWorkspace.accessibilityDisplayShouldReduceMotion`).
   Accessibility (role button, name Deltagos) not done.
6. Size the work at about 250–300 lines of Objective-C on v2 plus a small Go
   glue, the riskiest parts being the two Wails internals it leans on
   (`WailsWindow` class name, `userMinSize`).
7. Verify a real pointer click and drag on the icon by hand before the
   build card's gate: this spike drove them through code (the drag not even
   through the pointer handlers). A gate row for pointer behaviour should
   name a by-hand check, not allow "or the finding says why not".
