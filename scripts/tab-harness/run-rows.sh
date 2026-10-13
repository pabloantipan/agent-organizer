#!/usr/bin/env bash
# run-rows.sh — the Tab rows of docs/specs/leftovers-22.md (K1-K4) in an
# offscreen WKWebView, with tabFocusesLinks on and off.
#
#   eval "$(scripts/fixture-home.sh)"                 # auth off, never the real home
#   wails dev -devserver localhost:34115 &            # save its pid; kill it by pid after
#   scripts/tab-harness/run-rows.sh <out-dir>         # one <row>-<on|off>.jsonl per row
#   python3 scripts/tab-harness/summ.py <out-dir>/k2-on.jsonl
#   python3 scripts/tab-harness/order.py <out-dir>    # the four Tab-order lists (K4)
#
# The harness (tabharness.swift) never activates, never orders its window
# in and posts keys only to its own window through sendEvent:. Each row's
# steps are the k*.txt files beside it; tabharness.swift documents the verbs.
set -euo pipefail
here="$(cd "$(dirname "$0")" && pwd)"
out="${1:?usage: run-rows.sh <out-dir>}"
bin="${TMPDIR:-/tmp}/tabharness-$(id -u)"
[ "$bin" -nt "$here/tabharness.swift" ] || swiftc -O "$here/tabharness.swift" -o "$bin"
mkdir -p "$out"
for f in k1 k2 k3 k4-home k4-initiatives k4-overview k4-settings; do
  for flag in on off; do
    "$bin" --links $flag --size 1440x900 "$here/$f.txt" > "$out/$f-$flag.jsonl"
  done
done
