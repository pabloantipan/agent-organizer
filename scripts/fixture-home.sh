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
# The FSE thread of G19 lives in the discuss mailbox, project organizer-fixture,
# not on disk; the supervisor posted it once. Ruling it or the records only
# touches this temp copy.
set -euo pipefail

repo="$(cd "$(dirname "$0")/.." && pwd)"
tmp="$(mktemp -d "${TMPDIR:-/tmp}/organizer-fixture.XXXXXX")"
home="$tmp/home"

mkdir -p "$home"
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
