#!/bin/zsh
# focus-steal-check.sh — float-focus-steal's reproduction (S1 exp8), run
# against a Deltagos Review launched on desktop H with FLOAT_LOG set and
# scripts/frontmost-log.swift recording:
#
#   1. right to H+1, open a stand-in app there (it activates itself);
#   2. left to H, activate the review app by pid (the lead's Cmd-Tab);
#   3. right to H+1 (the stand-in is activated again);
#   4. the stand-in quits.
#
# Before the fix macOS handed activation to Deltagos Review, which made its
# main window key on H and pulled the desktop to H. After it the float log says
# "refused the system's hand-on" and the frontmost log shows no desktop change.
#
#   scripts/focus-steal-check.sh <review app pid> <steps log> [stand-in binary]
# The stand-in is scripts/focus-handoff-check.swift, compiled with swiftc.
set -u
pid=$1 log=$2 standin=${3:-${TMPDIR:-/tmp}/focus-handoff-check}
[[ -x $standin ]] || swiftc -O -o $standin ${0:A:h}/focus-handoff-check.swift || exit 2
here=${0:A:h}
step() { printf '%.3f %s\n' $EPOCHREALTIME "$*" >> $log; }
# exit 4 (the person is using the Mac) is retried with --wait 120, never a lower --idle
sp() {
  local rc tries=0
  while :; do
    ~/bin/seat-pointer --wait 120 space $1; rc=$?
    (( rc == 4 && ++tries < 10 )) || break
  done
  (( rc == 0 )) || { step "seat-pointer space $1 exit $rc"; exit 3; }
  step "space $1"
}

zmodload zsh/datetime
step "focus-steal-check start, app pid $pid"
sp right; sleep 2
$standin 600 >> $log 2>&1 & a=$!; step "stand-in pid $a opened"; sleep 2
sp left; sleep 2
swift $here/activate-pid.swift $pid >> $log; step "lead act: activated app by pid"; sleep 2
sp right; sleep 3
kill $a; step "stand-in quit"
sleep 5
step "focus-steal-check end"
