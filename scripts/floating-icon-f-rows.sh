#!/bin/zsh
# floating-icon-f-rows.sh — the floating icon's F-rows that float-focus-steal's
# fix touches (the list's open and close, the double-click's growth), driven
# without a pointer on a desktop that is not Deltagos Review's home, against an
# app launched with FLOAT_LOG. Read the float log after it:
#
#   F11  "list front: … N ms after the click", N < 100
#   F16  the second press: "close waits …", then "dismiss", then
#        "activation: handed to … (the list closed)" (focus goes back)
#   F10  a press then SIGUSR2 100 ms later: "close cancelled (second press)",
#        "full (double-click) read back: full window … key=1"
#
#   scripts/floating-icon-f-rows.sh <review app pid> <steps log>
set -u
zmodload zsh/datetime
pid=$1 log=$2 here=${0:A:h}
step() { printf '%.3f %s\n' $EPOCHREALTIME "$*" >> $log; }
press() { swift $here/floating-icon-press.swift $pid >> $log 2>&1 || { step "no visible icon (exit $?)"; exit 3; }; step "icon press ($1)"; }

step "F-rows start, app pid $pid"
press "F11: list"; sleep 3
press "F16: close"; sleep 3
press "F10: list"; sleep 0.1; kill -USR2 $pid; step "SIGUSR2 (F10: second press)"; sleep 2
step "F-rows end"
