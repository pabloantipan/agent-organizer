#!/bin/zsh
# floating-icon-by-hand.sh — the lead's pointer take for the floating icon
# (docs/ux/specs/floating-icon.md). This is the short take left after takes
# 1-4: F7 by pointer (Escape twice, a click outside) and Amendment 2's
# double-click on a list already open, which grows it without a blink. The
# float log names each close (key: Escape, list lost key with the pointer's
# place) and the recording shows the pointer (-C). A seat may not post
# pointer events, so these steps are done by hand. (F10-F12, F4, F5 and F8
# were taken in takes 1-4, recorded on the card.)
#
# Builds nothing: it launches the build already in this checkout
# (build/bin/Deltagos.app, from `wails build`) under a throwaway fixture
# home of twenty initiatives, records the main display, prints the steps,
# and on Enter (or Ctrl+C, or any failure) quits the app and the fixture's
# stand-in agents. Each run writes its own recording and float log under
# NOTES (default: the fi2-build notes), and prints the log's lines at the end.
# The recording is a fixed one minute, the steps' length with room:
# screencapture -v keeps its file only when it ends by itself (SIGINT and
# SIGTERM lose it), so it is left to end, and its own file name means a later
# run cannot overwrite it.
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

APP_PID= REC= RECORD_S=60
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

screencapture -v -C -V $RECORD_S -x $MOV &
REC=$!
END=$(date -v+${RECORD_S}S +%H:%M:%S)

cat <<'STEPS'

Recording for one minute. Deltagos (this build) is full on this desktop.
About thirty seconds:

  ctrl+→ to desktop 2 (the icon is bottom right). Then:

  a. Click the icon (the list opens). Press Escape, then Escape again: the
     list goes.
  b. Click the icon. Click the empty desktop beside the list (not the icon):
     the list goes.
  c. Click the icon and wait until the list is open (a second). THEN
     double-click the icon: the open list grows into the full window, with
     no blink.
  d. ctrl+← to desktop 1, this terminal, and press Enter.

STEPS
echo "(The recording ends by itself at $END.)"
read "?Press Enter here when done (the app quits). "
