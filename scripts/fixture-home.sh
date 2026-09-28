#!/usr/bin/env bash
# fixture-home.sh — a throwaway home for screenshots and the end to end check
# of docs/specs/redesign.md (G10–G16, G19). It copies testdata/home to a temp
# dir, lays testdata/fixture-overlay over it, makes init-a a git repo with two
# FSE-signed commits, and writes a config whose only root is the copy. Never
# points at the real home.
#
#   eval "$(scripts/fixture-home.sh)"      # exports ORGANIZER_CONFIG, XDG_DATA_HOME, FIXTURE_HOME
#   wails dev -devserver localhost:34115
#
#   eval "$(scripts/fixture-home.sh --twenty)"   # twenty initiatives instead
#
# --twenty lays out testdata/fixture-twenty (docs/specs/twenty-at-a-glance.md,
# FR-7): twenty initiatives in the spec's mix and nothing from testdata/home.
# Executing cannot come from files: the scan reads it from the process table.
# So the script starts one stand-in agent per line of fixture-twenty/agents.txt,
# a sleep whose process name is the config's agent_binary, with its cwd in the
# card's .wt/<slug>, and the real scan joins it to the card. It also exports
# FIXTURE_AGENT_PIDS; `kill $FIXTURE_AGENT_PIDS` ends them (they sleep 6 h).
# zellij, the probe layouts and discuss are pointed away in that config, so
# nothing of this machine leaks into the fixture.
#
# The FSE thread of G19 lives in the discuss mailbox, project organizer-fixture,
# not on disk; the supervisor posted it once. Ruling it or the records only
# touches this temp copy.
set -euo pipefail

repo="$(cd "$(dirname "$0")/.." && pwd)"
tmp="$(mktemp -d "${TMPDIR:-/tmp}/organizer-fixture.XXXXXX")"
home="$tmp/home"

mkdir -p "$home"

if [ "${1:-}" = "--twenty" ]; then
  # lsof reports an agent's cwd with symlinks resolved (/tmp is /private/tmp
  # on macOS), and the scan places it by root prefix, so the root must be real.
  tmp="$(cd "$tmp" && pwd -P)"
  home="$tmp/home"
  src="$repo/testdata/fixture-twenty"
  (cd "$src" && tar --exclude=./README.md --exclude=./agents.txt -cf - .) | (cd "$home" && tar -xf -)
  for c in "$home"/*/agents/cell.json; do
    [ -f "$c" ] || continue
    id="$(basename "$(dirname "$(dirname "$c")")")"
    sed -i '' "s#\"/h/$id\"#\"$home/$id\"#" "$c"
  done
  mkdir -p "$tmp/data" "$tmp/discuss"
  cat > "$tmp/config.yaml" <<EOF
machine: fixture
roots:
  - $home
max_depth: 3
auth: off
agent_binary: organizer-fixture-agent
zellij: /usr/bin/true
probe_state_dir: ""
discuss_state_dir: $tmp/discuss
EOF
  pids=""
  while read -r init card; do
    case "$init" in ''|'#'*) continue ;; esac
    dir="$home/$init/.wt/$card"
    mkdir -p "$dir"
    (cd "$dir" && exec -a organizer-fixture-agent sleep 21600) </dev/null >/dev/null 2>&1 &
    pids="$pids $!"
  done < "$src/agents.txt"
  echo "$pids" > "$tmp/agents.pid"
  echo "export ORGANIZER_CONFIG='$tmp/config.yaml'"
  echo "export XDG_DATA_HOME='$tmp/data'"
  echo "export FIXTURE_HOME='$home'"
  echo "export FIXTURE_AGENT_PIDS='${pids# }'"
  exit 0
fi
# node_modules and Library are ignore-dir fixtures; they are not needed here.
(cd "$repo/testdata/home" && tar --exclude=./node_modules --exclude=./Library -cf - .) | (cd "$home" && tar -xf -)
(cd "$repo/testdata/fixture-overlay" && tar --exclude=./README.md -cf - .) | (cd "$home" && tar -xf -)

a="$home/init-a"
sed -i '' "s#\"/h/init-a\"#\"$a\"#" "$a/agents/cell.json"
g() { git -C "$a" -c user.name=fixture -c user.email=fixture@example.invalid "$@"; }
g init -q -b main
g add -A
g commit -q -m "chore: the fixture initiative"
echo "- the fixture wave runs" >> "$a/docs/bitacora/fse_bitacora.md"
g commit -q -am "docs(bitacora): the fixture wave" -m "Committed-by: FSE"
echo "- 0002 and 0003 raised" >> "$a/docs/bitacora/fse_bitacora.md"
g commit -q -am "docs(decisions): raise 0002 and 0003" -m "Committed-by: FSE"

cat > "$tmp/config.yaml" <<EOF
machine: fixture
roots:
  - $home
max_depth: 3
ignore_dirs: [node_modules, Library]
auth: off
EOF
mkdir -p "$tmp/data"

echo "export ORGANIZER_CONFIG='$tmp/config.yaml'"
echo "export XDG_DATA_HOME='$tmp/data'"
echo "export FIXTURE_HOME='$home'"
