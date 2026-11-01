#!/usr/bin/env bash
# home.sh — a throwaway home holding the map fixture's five initiatives, for
# the review build (docs/specs/leftovers-58.md, M1-M7). It copies this folder
# into a temp dir and writes a config whose only root is the copy, auth off,
# no agents, an empty mailbox. Never points at the real home.
#
#   eval "$(testdata/fixture-map/home.sh)"   # from the worktree root
#   "build/bin/Deltagos Review.app/Contents/MacOS/organizer" & echo $! > "$FIXTURE_TMP/app.pid"
#
# Exports ORGANIZER_CONFIG, XDG_DATA_HOME, CLAUDE_CONFIG_DIR, FIXTURE_HOME
# (the copied roots) and FIXTURE_TMP (everything, for the caller to remove).
set -euo pipefail
here="$(cd "$(dirname "$0")" && pwd -P)"
tmp="$(mktemp -d -t organizer-fixture-map)"
tmp="$(cd "$tmp" && pwd -P)"
home="$tmp/home"
mkdir -p "$home" "$tmp/data" "$tmp/discuss" "$tmp/claude"
for d in "$here"/*/; do
  cp -R "$d" "$home/$(basename "$d")"
done
cat > "$tmp/config.yaml" <<YAML
machine: fixture
roots:
  - $home
max_depth: 3
auth: off
agent_binary: organizer-fixture-agent
zellij: /usr/bin/true
probe_state_dir: ""
discuss_state_dir: $tmp/discuss
YAML
echo "export ORGANIZER_CONFIG='$tmp/config.yaml'"
echo "export XDG_DATA_HOME='$tmp/data'"
echo "export CLAUDE_CONFIG_DIR='$tmp/claude'"
echo "export FIXTURE_HOME='$home'"
echo "export FIXTURE_TMP='$tmp'"
