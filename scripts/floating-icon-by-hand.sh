#!/bin/zsh
# floating-icon-by-hand.sh — an optional look at the floating icon for the lead
# (docs/ux/specs/floating-icon.md, Amendment 3: F13-F16). NOT A GATE: every
# gate row is checked by the seats with synthetic events (0095); this is only
# for Pablo's own eyes and hands, if he wants them. The float log names each
# close (dismiss (icon) with its time from the click, key: Escape, list lost
# key with the pointer's place), each growth (from the list or from the icon)
# and each full-screen test, and the recording shows the pointer (-C).
#
# Builds nothing: it launches the build already in this checkout
# (build/bin/Deltagos.app, from `wails build`) under a throwaway fixture
# home of twenty initiatives, records the main display, prints the steps,
# and on Enter (or Ctrl+C, or any failure) quits the app and the fixture's
# stand-in agents. Each run writes its own recording and float log under
# NOTES (default: the fi3-build notes), and prints the log's lines at the end.
# The recording is a fixed one minute, the steps' length with room:
# screencapture -v keeps its file only when it ends by itself (SIGINT and
# SIGTERM lose it), so it is left to end, and its own file name means a later
# run cannot overwrite it.
#
#   scripts/floating-icon-by-hand.sh        # from desktop 1, in a terminal
set -u
ROOT=${0:A:h:h}
NOTES=${NOTES:-/Users/pabloantipan/organizer/.wt-notes/fi3-build}
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
About forty seconds, all optional:

  ctrl+→ to desktop 2 (the icon is bottom right). Then:

  a. (F16) Click the icon: the list opens. Click the icon again: the list
     goes at once, no wait.
  b. (F16) Click the icon, wait a second, then double-click it: the list goes
     and the full window grows out of the icon; the list does not come back.
  c. ctrl+← to desktop 1: the window lives on desktop 2 now, so the icon is
     here. (F13) Click the icon and type `pay`: the list
     ends 8 px under partner-payouts. Delete a letter, type `zzz`: it follows.
     Escape twice.
  d. (F14) Drag the icon to the top of the screen: it stops 8 px under the
     menu bar, as at the other edges.
  e. (F15) Zoom a window of yours (option-click its green button): the icon
     stays above it. A full-screen app's desktop has no icon.
  f. Press Enter in this terminal.

STEPS
echo "(The recording ends by itself at $END.)"
read "?Press Enter here when done (the app quits). "
