#!/bin/zsh
# floating-icon-by-hand.sh — the lead's pointer take for the floating icon
# (docs/ux/specs/floating-icon.md, T7 and Amendment 1: F10, F11, F12, and
# F4, F5, F7, F8 again since click handling changed). A seat may not post
# pointer events, so these rows are done by hand.
#
# Needs the laptop lid OPEN before it starts: F12 drags the icon from the
# 3440 display onto the built-in one, as a second display. Close the lid only
# after the take.
#
# Builds nothing: it launches the build already in this checkout
# (build/bin/Deltagos.app, from `wails build`) under a throwaway fixture
# home of twenty initiatives, records the main display, prints the steps,
# and on Enter (or Ctrl+C, or any failure) quits the app and the fixture's
# stand-in agents. Each run writes its own recording and float log under
# NOTES (default: the fi2-build notes), and prints the log's lines at the end.
# The recording is a fixed six minutes, the steps' length with room:
# screencapture -v keeps its file only when it ends by itself (SIGINT and
# SIGTERM lose it), so it is left to end, and its own file name means a later
# run cannot overwrite it. It records the main display only, so the built-in
# display's part of F12 is in the float log (size lines read from the window).
#
#   scripts/floating-icon-by-hand.sh        # from desktop 1, in a terminal
set -u
ROOT=${0:A:h:h}
NOTES=${NOTES:-/Users/pabloantipan/organizer/.wt-notes/fi2-build}
APP=$ROOT/build/bin/Deltagos.app/Contents/MacOS/organizer
[[ -x $APP ]] || { echo "no build at $APP: run wails build in $ROOT first"; exit 1; }
mkdir -p $NOTES
STAMP=$(date +%Y%m%d-%H%M%S)
MOV=$NOTES/by-hand-$STAMP.mov
export FLOAT_LOG=$NOTES/by-hand-$STAMP.log

APP_PID= REC= RECORD_S=360
cleanup() {
  trap - EXIT INT TERM
  [[ -n $APP_PID ]] && kill $APP_PID 2>/dev/null
  [[ -n ${FIXTURE_AGENT_PIDS:-} ]] && kill ${=FIXTURE_AGENT_PIDS} 2>/dev/null
  echo
  [[ -n $REC ]] && kill -0 $REC 2>/dev/null && echo "Recording: $MOV (still writing; it ends by itself at $END)" || echo "Recording: $MOV"
  echo "Float log of this take ($FLOAT_LOG):"
  [[ -f $FLOAT_LOG ]] && cat $FLOAT_LOG
}
trap cleanup EXIT
trap 'exit 130' INT TERM

cd $ROOT
eval "$(scripts/fixture-home.sh --twenty 2>/dev/null)" || { echo "fixture-home.sh failed"; exit 1; }
$APP >> $NOTES/by-hand-$STAMP.out 2>&1 &
APP_PID=$!
sleep 5
kill -0 $APP_PID 2>/dev/null || { echo "the app did not start; see $NOTES/by-hand-$STAMP.out"; exit 1; }

screencapture -v -V $RECORD_S -x $MOV &
REC=$!
END=$(date -v+${RECORD_S}S +%H:%M:%S)

cat <<'STEPS'

Recording for six minutes. Deltagos (this build, a fixture of twenty
initiatives) is full on this desktop, on Home. The laptop lid is open.
About five minutes, at an easy pace:

F12 the size
  1. ctrl+→ to desktop 2. The icon appears bottom right, after the slide:
     larger than before on this display (88 pt).

F11 single click, then double-click
  2. Click the icon once: the list shows at once, by the icon. Press Escape:
     it goes.
  3. Click the icon and click again quickly (a double-click): the list shows
     and grows into the full window, here on desktop 2, on Home.

F10 the last view
  4. In Deltagos, click billing-api in the rail, then its Roadmap tab.
  5. ctrl+→ to desktop 3. Double-click the icon: Deltagos opens full here,
     on billing-api, Roadmap.
  6. Click Home in the top bar's crumbs. ctrl+← to desktop 2. Double-click
     the icon: full here, on Home.

F4  move it (again: the click handling changed)
  7. ctrl+→ to desktop 3. Drag the icon up into the menu bar and let go with
     the pointer in the menu bar: it springs back to just below it.
  8. Drag it down over the middle of the Dock and let go with the pointer on
     the Dock: it stays visible over the Dock while you drag, then springs
     up to just above it. Twice, the second time slowly.
  9. Drag it to the middle of the right edge and let go.
 10. ctrl+← twice to desktop 1, then ctrl+→ twice back to desktop 3: the
     icon is in the same spot on each.
 11. Move the pointer from far away onto the icon and click at once: the
     list opens. Press Escape: it goes.

F12 across displays
 12. Drag the icon onto the laptop's display and let go there: it shrinks
     (56 pt). Drag it back onto this display and let go: it grows again
     (88 pt).

F5  pick by typing
 13. Click the icon. The list opens by it, with the search field focused.
 14. Drag the icon a little with the list open: the list follows it.
 15. Type  pay  (keyboard only) and press Enter: partner-payouts opens full,
     here on desktop 3.

F7  get out without moving anything
 16. ctrl+← to desktop 2. Click the icon; press Escape twice (no clicks):
     the list goes, the icon stays.
 17. Click the icon again, then click the empty desktop beside the list
     (not the icon): it goes.
 18. ctrl+→ to desktop 3: Deltagos is still full there.

F8  compact by hand
 19. In Deltagos's top bar, press Compact to icon (just left of the ?):
     the window shrinks into the icon, which stays on this desktop.
 20. ctrl+← to desktop 2: the icon is there too.
 21. ctrl+← to desktop 1, back to this terminal, and press Enter.

STEPS
echo "(The recording ends by itself at $END.)"
read "?Press Enter here when done (the app quits). "
