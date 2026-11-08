#!/usr/bin/env bash
# launch.sh — the review build over the run-report and Usage states of
# leftovers-67 (FR-8 to FR-13; AR27-AR30, U9, R53), from a worktree root
# where `make review-build` ran:
#
#   testdata/fixture-report/launch.sh <notes dir> <label> [--no-record] [--rejected] [--wide-slug] [--resize <w>x<h>@<s>]
#
# It lays a fresh fixture home (scripts/fixture-home.sh, evaluated in this
# shell, auth off), adds the factory-report contract fixture dir as a root (its
# initiative is `fixture`: Overview's last run is the contract's window, with
# sup1/1 and sup2/1 in the footer and runs/2026-10-20-sup1.md as their
# record), puts the real factory first on PATH instead of the fixture's
# stub (which refuses `report`), and then:
#   --no-record  puts bin/factory (a shim) first: sup2/1 has no run record
#   --rejected   writes two refused usage rows (rejected.py) into the home
#   --resize     exports ORGANIZER_REVIEW_RESIZE (reviewresize.go)
#   --wide-slug  adds an open card `wide-slug` (stage build) to the generated
#                copy's 04:00 commit (`c done`, the board the last run reads),
#                replaying the two later commits with their own dates, so the
#                build track's `left` reads `d, e, wide-slug, f (not cut)`: a
#                slug wider than the 24 px minimum, where the comma's pull
#                shows (leftovers-72 AR35; the contract's one-letter slugs sit
#                centred in that minimum). Only <notes dir>/fx changes, never
#                the contracts checkout; the board's shas are the replayed ones.
# The contract fixture is built once in <notes dir>/fx from
# $CONTRACTS_DIR/factory-report/make-fixture.sh (a read-only checkout of
# agent-mailbox-specs). It refuses unless ORGANIZER_CONFIG and XDG_DATA_HOME
# sit under the fixture's temp dir and auth is off, writes <label>.pid (the
# app: the script execs it), <label>.env (the fixture's exports, FIXTURE_DIR
# among them) and <label>.log, and never touches the real home; the fixture's
# stand-in agents are listed only in $FIXTURE_DIR/agents.pid, inside the temp
# dir (leftovers-75 FR-3). Run it as a background task so its pid is yours to
# stop. After: stop the app by <label>.pid, then the stand-ins with
# `scripts/fixture-home.sh stop "$FIXTURE_DIR"` (FIXTURE_DIR from
# <label>.env), and only then remove the dir.
set -euo pipefail
[ $# -ge 2 ] || { echo "usage: launch.sh <notes dir> <label> [--no-record] [--rejected] [--wide-slug] [--resize WxH@S]" >&2; exit 2; }
N=$1; label=$2; shift 2
norecord=; rejected=; resize=; wide=
while [ $# -gt 0 ]; do
  case $1 in
    --no-record) norecord=1;;
    --rejected) rejected=1;;
    --wide-slug) wide=1;;
    --resize) resize=$2; shift;;
    *) echo "unknown option $1" >&2; exit 2;;
  esac
  shift
done
repo=$(pwd)
here=$repo/testdata/fixture-report
app="$repo/build/bin/Deltagos Review.app/Contents/MacOS/organizer"
[ -x "$app" ] || { echo "no review build at $app: run make review-build" >&2; exit 2; }
mkdir -p "$N"
D=$N/fx
if [ ! -d "$D/init" ]; then
  [ -n "${CONTRACTS_DIR:-}" ] || { echo "CONTRACTS_DIR unset (agent-mailbox-specs contracts/)" >&2; exit 2; }
  bash "$CONTRACTS_DIR/factory-report/make-fixture.sh" "$D" >/dev/null
fi
if [ -n "$wide" ] && [ ! -f "$D/init/working-on/wide-slug.md" ]; then
  W=$D/init/working-on
  g() { git -c user.name=t -c user.email=t@example.invalid -c commit.gpgsign=false -C "$W" "$@"; }
  base=$(g log --format=%H --grep='chore(cards): c done' -1)
  head=$(g symbolic-ref --short HEAD)
  g checkout -q -b wide "$base"
  printf -- '---\ntitle: the wide slug\nstage: build\nstatus: next\n---\n\nbody\n' > "$W/wide-slug.md"
  g add wide-slug.md
  GIT_COMMITTER_DATE=$(g log -1 --format=%cI) g commit -q --amend --no-edit
  g rebase -q --committer-date-is-author-date --onto wide "$base" "$head"
  g branch -q -D wide
fi
# env.sh first: it unsets ORGANIZER_CONFIG, which the fixture home sets.
source "$D/env.sh"
out=$("$repo/scripts/fixture-home.sh" 2>"$N/$label.fixture.err")
eval "$out"
tmp=$(dirname "$ORGANIZER_CONFIG")
[ "${FIXTURE_DIR:-}" = "$tmp" ] || { echo "refused: FIXTURE_DIR ${FIXTURE_DIR:-unset} is not $tmp" >&2; exit 1; }
case "$(basename "$tmp")" in organizer-fixture.*) ;; *) echo "refused: config $ORGANIZER_CONFIG not under a fixture dir" >&2; exit 1;; esac
case "$XDG_DATA_HOME" in "$tmp"/*) ;; *) echo "refused: XDG_DATA_HOME $XDG_DATA_HOME not under $tmp" >&2; exit 1;; esac
if grep -q '^auth:' "$ORGANIZER_CONFIG" && ! grep -q '^auth: off' "$ORGANIZER_CONFIG"; then echo "refused: auth is not off" >&2; exit 1; fi
echo "$out" | grep -v TOKEN > "$N/$label.env"
python3 -I - "$ORGANIZER_CONFIG" "$D" <<'PY'
import sys
p, d = sys.argv[1], sys.argv[2]
s = open(p).read()
s = s.replace("roots:\n", "roots:\n  - %s\n" % d, 1)
open(p, "w").write(s)
PY
PATH=$(printf '%s' "$PATH" | tr ':' '\n' | grep -vx "${FIXTURE_FACTORY_DIR:-/nonexistent}/bin" | paste -sd: -)
[ -n "$norecord" ] && PATH="$here/bin:$PATH"
export PATH
[ -n "$rejected" ] && python3 -I "$here/rejected.py" "$XDG_DATA_HOME"
if [ -n "$resize" ]; then export ORGANIZER_REVIEW_RESIZE=$resize; else unset ORGANIZER_REVIEW_RESIZE; fi
echo "fixture $tmp; factory $(command -v factory); resize ${resize:-none}; no-record ${norecord:-0}; rejected ${rejected:-0}" >> "$N/$label.env"
echo $$ > "$N/$label.pid"
exec "$app" >"$N/$label.log" 2>&1
