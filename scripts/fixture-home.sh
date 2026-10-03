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
#   eval "$(scripts/fixture-home.sh --live-mailbox)"  # init-a's health from discuss
#
# Mailbox health (docs/specs/machine-explains-itself.md, A3): deaf and capped
# cannot be made on demand, so the config's canned_health points at a copy of
# testdata/fixture-health.json, read in place of the discuss API: a roster seat
# alive (po_ana), one deaf (dev_bruno), a supervisor capped (sup10), a builder
# stale (build-help), and sup9 never with 3 undelivered. It also names the
# other cells' projects (define-fixture, drafted-fixture, ready-fixture) with
# only the human alive, so their Crew headers carry no "no project" line, and
# asking_thread below copies organizer-fixture's live threads into it. One stand-in agent per
# standin line at the end runs in init-a with the environment a probe launch
# would give it; organizer-fixture-probe-sup9 has no AGENT_NAME, so its row
# says "no identity". --live-mailbox drops canned_health and reads every
# thread from discuss as it is. Either way the
# stand-ins are in FIXTURE_AGENT_PIDS; `kill $FIXTURE_AGENT_PIDS` ends them.
#
# --twenty lays out testdata/fixture-twenty (docs/specs/twenty-at-a-glance.md,
# FR-7): twenty initiatives in the spec's mix and nothing from testdata/home.
# Executing cannot come from files: the scan reads it from the process table.
# So the script starts one stand-in agent per line of fixture-twenty/agents.txt,
# a process named after the config's agent_binary, with its cwd in the
# card's .wt/<slug>, and the real scan joins it to the card. It also exports
# FIXTURE_AGENT_PIDS; `kill $FIXTURE_AGENT_PIDS` ends them (they sleep 6 h).
# zellij, the probe layouts and discuss are pointed away in that config, so
# nothing of this machine leaks into the fixture.
#
# The FSE thread of G19 lives in the discuss mailbox, project organizer-fixture,
# not on disk; the supervisor posted it once. Ruling it or the records only
# touches this temp copy.
set -euo pipefail

# standin <dir> [VAR=value ...]: one stand-in agent, a process named after
# the fixture's agent_binary that sleeps 6 h, in <dir>, with only the identity
# given. It is testdata/fixture-agent built into the temp dir, not /bin/sleep:
# macOS hides a platform binary's environment from ps -E, where the scan reads
# the identity. The caller's own identity is dropped first: a seat running
# this script carries AGENT_NAME, and the scan would read it as the stand-in's.
standin() {
  local dir="$1"; shift
  mkdir -p "$dir"
  (
    cd "$dir"
    unset AGENT_NAME PROJECT_ID AGENT_SESSION DISCUSS_TOKEN
    for kv in "$@"; do export "$kv"; done
    exec "$tmp/bin/organizer-fixture-agent" 21600
  ) </dev/null >/dev/null 2>&1 &
  pids="$pids $!"
}
pids=""

# asking_thread <health.json>: the canned file carries organizer-fixture's
# live threads from the discuss mailbox, so the fixture shows a thread that
# asks the human (ui-leftovers FR-12, V1): Answer on Home, the worklist's
# thread rows. The organizer computes "asks you" from the thread's messages,
# which it reads from the mailbox as the cell's human, so the thread has to
# live there; only its head rides the canned file. If no open thread of
# organizer-fixture asks pablo, the fixture's fse posts one to pablo. Only
# organizer-fixture, never another project. Tokens are read from the
# registry inside python and never printed. Without discuss it says so on
# stderr and the canned file keeps no threads.
asking_thread() {
  DISCUSS_STATE="${DISCUSS_STATE_DIR:-$HOME/.local/state/discuss}" \
  DISCUSS_ADDR="${DISCUSS_BIND:-127.0.0.1:9494}" python3 - "$1" <<'PY' >&2
import json, os, sys, urllib.request
path, project = sys.argv[1], "organizer-fixture"
state, addr = os.environ["DISCUSS_STATE"], os.environ["DISCUSS_ADDR"]
subject = "w-review: may the review start before the queued card lands"
body = ("pablo, w-review is ready for its reviewer, but w-queued has not landed. "
        "Does the review start now, or after w-queued?")
try:
    toks = json.load(open(os.path.join(state, "tokens.json")))["tokens"]
    tok = {v["agent"]: t for t, v in toks.items() if v.get("project") == project}
    def call(who, method, rest, data=None):
        req = urllib.request.Request("http://%s/projects/%s%s" % (addr, project, rest), method=method,
            data=None if data is None else json.dumps(data).encode(),
            headers={"Authorization": "Bearer " + tok[who], "Content-Type": "application/json"})
        with urllib.request.urlopen(req, timeout=3) as r:
            return json.load(r)
    def asks(t):
        n = 0
        for m in call("pablo", "GET", "/threads/" + t["id"])["messages"]:
            n = 0 if m["from"] == "pablo" else n + (m["to"] == "pablo")
        return n > 0
    threads = call("pablo", "GET", "/health")["threads"]
    if not any(t["status"] == "open" and asks(t) for t in threads):
        call("fse", "POST", "/messages", {"to": "pablo", "kind": "question", "subject": subject, "body": body})
        threads = call("pablo", "GET", "/health")["threads"]
except Exception as e:
    print("fixture-home: no thread asks pablo (discuss %s: %s)" % (addr, e))
    sys.exit(1)
doc = json.load(open(path))
doc[project]["threads"] = threads
json.dump(doc, open(path, "w"), indent=1)
PY
}

repo="$(cd "$(dirname "$0")/.." && pwd)"
tmp="$(mktemp -d "${TMPDIR:-/tmp}/organizer-fixture.XXXXXX")"
home="$tmp/home"

mkdir -p "$home" "$tmp/bin"
(cd "$repo/testdata/fixture-agent" && go build -o "$tmp/bin/organizer-fixture-agent" main.go) >&2

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
  while read -r init card; do
    case "$init" in ''|'#'*) continue ;; esac
    standin "$home/$init/.wt/$card"
  done < "$src/agents.txt"
  echo "$pids" > "$tmp/agents.pid"
  echo "export ORGANIZER_CONFIG='$tmp/config.yaml'"
  echo "export XDG_DATA_HOME='$tmp/data'"
  echo "export FIXTURE_HOME='$home'"
  echo "export FIXTURE_AGENT_PIDS='${pids# }'"
  exit 0
fi
live_mailbox=""
[ "${1:-}" = "--live-mailbox" ] && live_mailbox=1
# lsof resolves symlinks in an agent's cwd, as in --twenty above.
tmp="$(cd "$tmp" && pwd -P)"
home="$tmp/home"
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
# feat/beta's two commits carry a time of day, so the Cards Gantt offers
# Hours (time-zoom, 0070): its bar runs 09:12 to 17:48 on 2 Oct 2026.
g checkout -q -b feat/beta
GIT_COMMITTER_DATE=2026-10-02T09:12:00-03:00 g commit -q --allow-empty --date=2026-10-02T09:12:00-03:00 -m "feat: beta starts"
GIT_COMMITTER_DATE=2026-10-02T17:48:00-03:00 g commit -q --allow-empty --date=2026-10-02T17:48:00-03:00 -m "feat: beta lands"
g checkout -q main

cp "$repo/testdata/fixture-health.json" "$tmp/health.json"
[ -n "$live_mailbox" ] || asking_thread "$tmp/health.json" || true
cat > "$tmp/config.yaml" <<EOF
machine: fixture
roots:
  - $home
max_depth: 3
ignore_dirs: [node_modules, Library]
auth: off
agent_binary: organizer-fixture-agent
zellij: /usr/bin/true
probe_state_dir: ""
EOF
[ -n "$live_mailbox" ] || echo "canned_health: $tmp/health.json" >> "$tmp/config.yaml"
mkdir -p "$tmp/data"

# The live agents of init-a, as probe would launch them: the family is the
# cell's project, so each session is organizer-fixture-probe-<short>.
f=organizer-fixture
standin "$a" AGENT_NAME=po_ana PROJECT_ID=$f AGENT_SESSION=$f-probe-ana
standin "$a" AGENT_NAME=dev_bruno PROJECT_ID=$f AGENT_SESSION=$f-probe-bruno
standin "$a" AGENT_NAME=sup10 PROJECT_ID=$f AGENT_SESSION=$f-probe-sup10
standin "$a/.wt/build-help" AGENT_NAME=build-help PROJECT_ID=$f AGENT_SESSION=$f-probe-build-help
standin "$a" AGENT_SESSION=$f-probe-sup9
echo "${pids# }" > "$tmp/agents.pid"

echo "export ORGANIZER_CONFIG='$tmp/config.yaml'"
echo "export XDG_DATA_HOME='$tmp/data'"
echo "export FIXTURE_HOME='$home'"
echo "export FIXTURE_AGENT_PIDS='${pids# }'"
