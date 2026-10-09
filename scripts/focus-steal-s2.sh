#!/bin/zsh
# focus-steal-s2.sh — float-focus-steal S2: <minutes> (default 30) of moving
# between desktops 1, 2 and 3 with Deltagos Review's home on desktop 2, the
# floating icon used twice (a press opens the list, a second press closes it;
# at a third and two thirds of the run). The hand-on (an app quitting) is
# scripts/focus-steal-check.sh's: macOS still activates Deltagos for an
# instant before the fix hands it on, which would read as a false steal here.
# Read the result from the frontmost log: Deltagos Review (by pid) is
# activated only inside the two "icon use" spans of the steps log.
#
#   scripts/focus-steal-s2.sh <review app pid> <frontmost log> <steps log> [minutes]
# The review app must already be on desktop 2 (launch it there); the
# frontmost log is scripts/frontmost-log.swift's output, read for the desktop.
set -u
zmodload zsh/datetime
pid=$1 front=$2 log=$3 mins=${4:-30}
here=${0:A:h}
step() { printf '%.3f %s\n' $EPOCHREALTIME "$*" >> $log; }
desk() { grep -o 'desktop [0-9]* of' $front | tail -1 | cut -d' ' -f2; }
# exit 4 (the person is using the Mac) is retried with --wait 120, never a lower --idle
sp() {
  local rc tries=0
  while :; do
    ~/bin/seat-pointer --wait 120 space $1; rc=$?
    (( rc == 4 && ++tries < 10 )) || break
  done
  (( rc == 0 )) || { step "seat-pointer space $1 exit $rc"; exit 3; }
  sleep 1.5; step "space $1 (now desktop $(desk))"
}
# move to desktop $1 one step at a time, so a desktop change nobody asked for
# (another app's steal) is logged and walked back instead of drifting the run
goto() {
  local d n=0
  while d=$(desk); [[ $d != $1 ]] && (( n++ < 6 )); do
    (( d < $1 )) && sp right || sp left
  done
}
use() {
  step "icon use $1 begins"
  swift $here/floating-icon-press.swift $pid >> $log 2>&1; step "icon press (list)"; sleep 4
  swift $here/floating-icon-press.swift $pid >> $log 2>&1; step "icon press (close)"; sleep 2
  step "icon use $1 ends"
}

[[ $(desk) == 2 ]] || { step "not on desktop 2 at start (on $(desk))"; exit 4; }
step "S2 start, app pid $pid, $mins min"
end=$(( EPOCHSECONDS + mins * 60 )); third=$(( mins * 20 )); start=$EPOCHSECONDS
used=0 round=0
while (( EPOCHSECONDS < end )); do
  (( round++ ))
  # 2 → 1 → 2 → 3 → 2: every desktop each round, home crossed twice
  goto 1; sleep 8
  goto 2; sleep 8
  goto 3; sleep 8
  goto 2; sleep 8
  (( used == 0 && EPOCHSECONDS - start > third )) && { goto 3; use 1; used=1; }
  (( used == 1 && EPOCHSECONDS - start > 2 * third )) && { goto 1; use 2; used=2; }
done
step "S2 end after $round rounds, $used icon uses"
