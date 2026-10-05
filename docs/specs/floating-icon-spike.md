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
