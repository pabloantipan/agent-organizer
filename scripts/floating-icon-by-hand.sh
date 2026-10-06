#!/bin/zsh
# floating-icon-by-hand.sh — the lead's pointer take for the floating icon
# (docs/ux/specs/floating-icon.md, T7: F4, F5, F7 and F8). A seat may not
# post pointer events, so these rows are done by hand.
#
# Builds nothing: it launches the build already in this checkout
# (build/bin/Deltagos.app, from `wails build`) under a throwaway fixture
# home of twenty initiatives, records the main display, prints the steps,
# and on Enter (or Ctrl+C, or any failure) quits the app and the fixture's
# stand-in agents. Each run writes its own recording and float log under
# NOTES (default: the fic-build notes), and prints the log's lines at the end.
# The recording is a fixed four minutes: screencapture -v keeps its file only
# when it ends by itself (SIGINT and SIGTERM lose it), so it is left to end,
# and its own file name means a later run cannot overwrite it.
#
#   scripts/floating-icon-by-hand.sh        # from desktop 1, in a terminal
set -u
ROOT=${0:A:h:h}
NOTES=${NOTES:-/Users/pabloantipan/organizer/.wt-notes/fic-build}
APP=$ROOT/build/bin/Deltagos.app/Contents/MacOS/organizer
[[ -x $APP ]] || { echo "no build at $APP: run wails build in $ROOT first"; exit 1; }
mkdir -p $NOTES
STAMP=$(date +%Y%m%d-%H%M%S)
MOV=$NOTES/by-hand-$STAMP.mov
export FLOAT_LOG=$NOTES/by-hand-$STAMP.log

APP_PID= REC= RECORD_S=240
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

Recording for four minutes. Deltagos (this build, a fixture of twenty
initiatives) is full on this desktop. About three minutes, at an easy pace:

F4  move it
  1. ctrl+→ to desktop 2. The icon appears bottom right, after the slide.
  2. Drag it up into the menu bar and let go with the pointer in the menu
     bar: it springs back to just below it.
  3. Drag it down over the middle of the Dock, between two Dock icons, and
     let go with the pointer on the Dock: it stays visible over the Dock
     while you drag, then springs up to just above it. Do it twice, the
     second time slowly.
  4. Drag it to the middle of the right edge and let go.
  5. ctrl+→ to desktop 3: the icon is in the same spot.
  5b. Drag the icon over another app's window, then click that window just
      beside the icon (a few mm off its edge): that window comes to the
      front (it got the click). Rest the pointer on the icon: it lifts.
  5c. Move the pointer from far away onto the icon and click at once, with
      no pause: the list opens. Press Escape: it goes.

F5  pick by typing
  6. Click the icon. The list opens by it, with the search field focused.
  7. Drag the icon a little with the list open: the list follows it. Then
     drag it onto the Dock and let go there: icon and list end above it.
  8. Type  pay  (keyboard only, do not click a row) and press Enter:
     partner-payouts opens full, here on desktop 3.

F7  get out without moving anything
  9. ctrl+← to desktop 2. Click the icon; press Escape twice (no clicks):
     the list goes, the icon stays.
 10. Click the icon again, then click the empty desktop beside the list
     (not the icon): it goes.
 11. ctrl+→ to desktop 3: Deltagos is still full there.

F8  compact by hand
 12. In Deltagos's top bar, press Compact to icon (just left of the ?):
     the window shrinks into the icon, which stays on this desktop.
 13. ctrl+← to desktop 2: the icon is there too.
 14. ctrl+← to desktop 1, back to this terminal.

STEPS
echo "(The recording ends by itself at $END.)"
read "?Press Enter here when done (the app quits). "
