#!/bin/sh
# probe-stub.sh — stands in for ~/bin/probe and every <family>-probe wrapper
# in gates and the fixture (docs/specs/leftovers-27.md FR-4). Point the
# organizer at it with ORGANIZER_PROBE_BIN=scripts/probe-stub.sh; it starts
# nothing, no zellij, no claude, no window.
#
#   probe-stub.sh --wrap <family> | -k <s> | -c | --attach <s>   exit 0 at once
#   probe-stub.sh <name> <dir>     sleeps PROBE_STUB_SLEEP seconds (default 3)
#                                  and exits 0; exits 3 printing two pane lines
#                                  when <name> is in PROBE_STUB_FAIL
#                                  (comma or space separated), as probe does
#                                  when the pane did not run claude in 30 s.
#
# PROBE_STUB_LOG, when set, gets one line per call: the time, the arguments
# and the exit.
log() { [ -n "${PROBE_STUB_LOG:-}" ] && echo "$(date +%H:%M:%S) $* -> $code" >> "$PROBE_STUB_LOG"; return 0; }
case "${1:-}" in
  --wrap|-k|-c|--attach|"") code=0; log "$@"; exit 0 ;;
esac
name=$1
sleep "${PROBE_STUB_SLEEP:-3}"
code=0
for f in $(echo "${PROBE_STUB_FAIL:-}" | tr ',' ' '); do
  if [ "$f" = "$name" ]; then
    code=3
    echo "pane $name: claude did not start within 30 s"
    echo "pane $name: \$ (probe stub) exit 3"
  fi
done
log "$@"
exit "$code"
