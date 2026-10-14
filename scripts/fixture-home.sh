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
#   eval "$(scripts/fixture-home.sh --empty)"    # a home with no initiatives
#   eval "$(scripts/fixture-home.sh --groups)"   # the default home without Asleep and Archived
#   eval "$(scripts/fixture-home.sh --memory critical)"  # memory forced, with any of the above
#
# Memory (docs/specs/ram-indicator.md, Acceptance (ram-view)): --memory
# normal|high|critical|fail|none, anywhere among the options, exports
# ORGANIZER_MEMORY_FAKE=@$FIXTURE_MEMORY_FILE and that file holding the level,
# read by app.go only (memfake.go): a 32 GB Mac with 12 GB free at normal,
# 3.1 at high and 1.2 at critical, or a failed read; none is no sample yet,
# so the memory popover stays at "Reading memory…" (leftovers-15 FR-3). A
# forced reading never posts a notification. The app reads the file
# at every 10 s sample, so `echo normal > "$FIXTURE_MEMORY_FILE"` walks the
# levels without a restart (critical then normal shows "Was critical
# until"). Only the numbers are forced: the service's since, was critical
# until and warn rule run as for real. Without --memory the app reads this
# Mac.
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
# Needs me has 15 rows in the default home, with or without discuss: the 14
# of leftovers-11 V1 (see asking_thread's call below) and init-a's stalled
# task, 0011 ruled 10 min back (leftovers-28 R2). With discuss, init-a's
# Conversations also hold one solved thread whose ruling Solved draws (F5);
# see decided_thread.
#
# The default home also holds init-many (testdata/fixture-many), 76 decision
# records for the find and limit rows (leftovers-6 FR-7).
#
# --groups lays the default home without testdata/fixture-sleep but for
# init-blind (leftovers-26 Amendment 2, F2): no init-asleep, init-archived or
# frozen session, so no Asleep or Archived fold trails the rail. Grouped by
# client, the last group is ccint with init-blind alone, and with the rail
# scrolled to its end its ⋯ has less room below than its menu at 1024x640,
# so the menu opens above it. Everything else is the default home's.
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
# --twenty and --empty export CLAUDE_CONFIG_DIR to an empty directory, so
# Usage there shows "No sessions recorded yet" and never reads ~/.claude.
#
# --empty lays out a home with no initiatives at all (leftovers-13 FR-5), so
# the floating list's "no initiatives" state (docs/ux/specs/floating-icon.md
# §3) can be shown: the config's only root is an empty directory, and
# zellij, the probe layouts and discuss are pointed away as in --twenty. It
# starts no stand-in agent, since there is no initiative to put one in;
# FIXTURE_AGENT_PIDS is exported empty, so there is nothing to kill.
#
# Usage (docs/specs/usage.md U1-U8): the default home also carries a usage
# history, laid by testdata/fixture-usage/usage.py: synthetic transcripts
# under $tmp/claude/projects (CLAUDE_CONFIG_DIR is exported to $tmp/claude,
# since the ledger reads $CLAUDE_CONFIG_DIR/projects; never the real
# ~/.claude) and their run records appended to the fixture's runs.jsonl.
# Six weeks ending this one: a partial first week (from its Thursday), a
# week with one session, a week with no sessions, last week, and this week
# with a wave on init-a's w-review (wave1-build, wave1-review and sup11, whom
# the temp copy's Notes name as its supervisor), a wave of two cards (sup12,
# named in w-queued's and w-nogate's Notes, with one builder per card), an
# FSE session, a session
# outside every initiative (Not attributed), one with no cost, a Haiku
# sub-agent, and the running Hephaistos session (the probe-hefesto
# stand-in's live record). The script's header in usage.py lists each.
#
# Initiatives (docs/specs/initiatives-view.md, I1-I13): the default home also
# lays testdata/fixture-sleep: init-asleep (paused, "sleeping since" a week
# ago, one frozen session under the fixture's probe state dir, with its
# exited layout), init-archived, and init-blind (active, four levels down,
# and not among the roots the fake factory sees: camp's case). A fake
# `factory` goes first on PATH ($FIXTURE_FACTORY_DIR/bin): it acts on this
# copy only, never runs the real one, and logs each call to calls.log there.
# Drive it with files in $FIXTURE_FACTORY_DIR, read at every call:
#   echo 10 > "$FIXTURE_FACTORY_DIR/limit"    # the limit (default 12; 10
#                                              # awake: 11 under, 10 at, 9 over)
#   echo refuse > "$FIXTURE_FACTORY_DIR/mode"  # ok | refuse | fail | partial | awake-fail
#   echo 0 > "$FIXTURE_FACTORY_DIR/delay"      # seconds sleep and wake take (default 3)
# then Rescan. One or none awake: `factory sleep <id>` from this shell (the
# fake, on PATH) for the others, then Rescan. The factory missing cannot be a
# mode, since Deltagos falls back to ~/bin/factory: launch the app under
# `env $FIXTURE_NOFACTORY_ENV` (a HOME without bin/factory and a PATH
# without the fake).
#
# Seat starts (docs/specs/leftovers-27.md FR-4): no fixture launch starts a
# real seat. Export ORGANIZER_PROBE_BIN="$PWD/scripts/probe-stub.sh" before
# launching the app or `organizer crew|run`, and the stub stands in for probe
# and every family wrapper: each seat "starts" in PROBE_STUB_SLEEP seconds
# (default 3), and a seat whose short name is in PROBE_STUB_FAIL (b,c) fails
# twice with exit 3 and two pane lines. PROBE_STUB_LOG names a file that
# gets one line per call. The crew's discuss-api token preflight still runs.
#
# The FSE thread of G19 lives in the discuss mailbox, project organizer-fixture,
# not on disk; the supervisor posted it once. Ruling it or the records only
# touches this temp copy.
set -euo pipefail

# --memory <level> is taken out of the options wherever it is; the rest
# keep their place.
args=()
while [ $# -gt 0 ]; do
  case "$1" in
    --memory)
      case "${2:-}" in normal|high|critical|fail|none) ;; *) echo "--memory takes normal, high, critical, fail or none" >&2; exit 2 ;; esac
      memfile=$(mktemp -t organizer-memory-level)
      echo "$2" > "$memfile"
      echo "export FIXTURE_MEMORY_FILE='$memfile'"
      echo "export ORGANIZER_MEMORY_FAKE='@$memfile'"
      shift 2 ;;
    *) args+=("$1"); shift ;;
  esac
done
set -- ${args[@]+"${args[@]}"}
# A shell that evaluated an earlier --memory keeps it otherwise.
[ -n "${memfile:-}" ] || echo "unset ORGANIZER_MEMORY_FAKE FIXTURE_MEMORY_FILE"

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

# decided_thread <state.json>: one open organizer-fixture thread holds a
# decision of pablo's, and the fixture's state marks it solved, so the
# worklist's Solved list draws its ruling (F5, leftovers-26 FR-11). The
# thread is the oldest open one that holds a decision; when its latest
# decision is not the fixture's words, pablo posts them into it; when no open
# thread holds one, the fse asks and pablo rules. Run twice, nothing is
# posted the second time and it is still one thread. Only organizer-fixture;
# tokens are read inside python and never printed. Without discuss it says so
# on stderr and writes no state.
decided_thread() {
  DISCUSS_STATE="${DISCUSS_STATE_DIR:-$HOME/.local/state/discuss}" \
  DISCUSS_ADDR="${DISCUSS_BIND:-127.0.0.1:9494}" python3 - "$1" <<'PY' >&2
import json, os, sys, time, urllib.request
path, project = sys.argv[1], "organizer-fixture"
state, addr = os.environ["DISCUSS_STATE"], os.environ["DISCUSS_ADDR"]
subject = "w-queued: which repo does the queued card start in"
ask = "pablo, the queued card names repo-one only. Does it start there, or in a repo the fixture does not have yet?"
ruling = "It starts in repo-one; a second repo waits for a card of its own.\nNext action: fse sets w-queued's next to start in repo-one"
try:
    toks = json.load(open(os.path.join(state, "tokens.json")))["tokens"]
    tok = {v["agent"]: t for t, v in toks.items() if v.get("project") == project}
    def call(who, method, rest, data=None):
        req = urllib.request.Request("http://%s/projects/%s%s" % (addr, project, rest), method=method,
            data=None if data is None else json.dumps(data).encode(),
            headers={"Authorization": "Bearer " + tok[who], "Content-Type": "application/json"})
        with urllib.request.urlopen(req, timeout=3) as r:
            return json.load(r)
    def decisions(t):
        return [m for m in call("pablo", "GET", "/threads/" + t["id"])["messages"] if m["kind"] == "decision"]
    decided = [(t, d) for t in call("pablo", "GET", "/health")["threads"] if t["status"] == "open" for d in [decisions(t)] if d]
    if decided:
        t, d = decided[0]
        tid = t["id"]
        if d[-1]["from"] != "pablo" or d[-1]["body"] != ruling:
            call("pablo", "POST", "/messages", {"to": "fse", "thread_id": tid, "kind": "decision", "body": ruling})
        if len(decided) > 1:
            print("fixture-home: %d open threads hold a decision; %s is the one marked solved" % (len(decided), tid))
    else:
        tid = call("fse", "POST", "/messages", {"to": "pablo", "kind": "question", "subject": subject, "body": ask})["thread_id"]
        call("pablo", "POST", "/messages", {"to": "fse", "thread_id": tid, "kind": "decision", "body": ruling})
except Exception as e:
    print("fixture-home: no thread holds a decision (discuss %s: %s)" % (addr, e))
    sys.exit(1)
os.makedirs(os.path.dirname(path), exist_ok=True)
json.dump({"order": {"initiatives": None, "cards": None,
    "resolved": {"thread:" + tid: time.strftime("%Y-%m-%d")}}}, open(path, "w"))
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
  mkdir -p "$tmp/claude"
  echo "export ORGANIZER_CONFIG='$tmp/config.yaml'"
  echo "export XDG_DATA_HOME='$tmp/data'"
  echo "export CLAUDE_CONFIG_DIR='$tmp/claude'"
  echo "export FIXTURE_HOME='$home'"
  echo "export FIXTURE_AGENT_PIDS='${pids# }'"
  exit 0
fi
if [ "${1:-}" = "--empty" ]; then
  tmp="$(cd "$tmp" && pwd -P)"
  home="$tmp/home"
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
  : > "$tmp/agents.pid"
  mkdir -p "$tmp/claude"
  echo "export ORGANIZER_CONFIG='$tmp/config.yaml'"
  echo "export XDG_DATA_HOME='$tmp/data'"
  echo "export CLAUDE_CONFIG_DIR='$tmp/claude'"
  echo "export FIXTURE_HOME='$home'"
  echo "export FIXTURE_AGENT_PIDS=''"
  exit 0
fi
live_mailbox=""
[ "${1:-}" = "--live-mailbox" ] && live_mailbox=1
groups=""
[ "${1:-}" = "--groups" ] && groups=1
# lsof resolves symlinks in an agent's cwd, as in --twenty above.
tmp="$(cd "$tmp" && pwd -P)"
home="$tmp/home"
# node_modules and Library are ignore-dir fixtures; they are not needed here.
(cd "$repo/testdata/home" && tar --exclude=./node_modules --exclude=./Library -cf - .) | (cd "$home" && tar -xf -)
(cd "$repo/testdata/fixture-overlay" && tar --exclude=./README.md -cf - .) | (cd "$home" && tar -xf -)

a="$home/init-a"
sed -i '' "s#\"/h/init-a\"#\"$a\"#" "$a/agents/cell.json"
# Initiatives (header): the asleep, archived and factory-blind initiatives,
# the frozen session, and the fake factory over this copy.
# --groups (leftovers-26 Amendment 2) lays init-blind alone: no Asleep or
# Archived fold trails the groups, so Group by client ends the rail with
# ccint, one row, and its ⋯ is short of room at the end of the scroll.
if [ -n "$groups" ]; then
  (cd "$repo/testdata/fixture-sleep" && tar -cf - ./init-blind) | (cd "$home" && tar -xf -)
  mkdir -p "$tmp/probe"
else
(cd "$repo/testdata/fixture-sleep" && tar --exclude=./README.md --exclude=./factory -cf - .) | (cd "$home" && tar -xf -)
since="$(date -v-7d +%Y-%m-%d)"
sed -i '' "s/@SINCE@/$since/" "$home/init-asleep/working-on/initiative.yaml"
mkdir -p "$tmp/probe/frozen/init-asleep-probe-otter"
echo "$home/init-asleep" > "$tmp/probe/frozen/init-asleep-probe-otter/cwd"
printf 'layout {\n  cwd "%s"\n}\n' "$home/init-asleep" > "$tmp/probe/init-asleep-probe-otter.kdl"
fi
fd="$tmp/factory"
mkdir -p "$fd/bin"
cp "$repo/testdata/factory/factory" "$fd/factory-real"
sed "s#@DIR@#$fd#" "$repo/testdata/fixture-sleep/factory" > "$fd/bin/factory"
chmod +x "$fd/factory-real" "$fd/bin/factory"
mkdir -p "$tmp/nohome"
# The roles' bitácoras (roles-ui R2): each @D<n>@ is the date n days before
# today, so the HAND-OFFs read as recent (and Daedalus's as older than a
# week) whenever the fixture is laid.
for f in "$home/agent-slack/docs/bitacora/hephaistos_bitacora.md" "$a/docs/bitacora/aglaea_bitacora.md" "$home/work/init-b/docs/bitacora/daedalus_bitacora.md"; do
  perl -MPOSIX=strftime -pi -e 's/\@D(\d+)\@/strftime("%Y-%m-%d", localtime(time - $1 * 86400))/ge' "$f"
done
# The usage history (header): sup11 supervises w-review in the temp copy,
# written before init-a's first commit so the checkout stays clean.
printf '\n## Notes\n- sup11: launched wave1-build, then wave1-review\n' >> "$a/working-on/w-review.md"
# and sup12 supervises w-queued and w-nogate: a wave of two cards.
for c in w-queued w-nogate; do printf '\n## Notes\n- sup12: launched the %s builder\n' "$c" >> "$a/working-on/$c.md"; done
# The task watch (leftovers-28 R2): 0011 is laid proposed in the first
# commit and ruled in its own commit 10 min back, after the others, so its
# task started 10 min ago and reads stalled at once (forecast 1-2m, past
# twice its top). The ruling commit carries no FSE signature, so init-a
# keeps its two FSE-signed commits.
d11="$a/working-on/decisions/0011-accept-the-task-watch.md"
cp "$d11" "$tmp/0011-ruled.md"
sed -i '' 's/^status: ruled$/status: proposed/' "$d11"
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
ruled_at="$(date -v-10M +%Y-%m-%dT%H:%M:%S%z)"
cp "$tmp/0011-ruled.md" "$d11"
GIT_COMMITTER_DATE="$ruled_at" g commit -q --date="$ruled_at" -m "docs(decisions): rule 0011" -- "$d11"

# init-many, the many-records fixture (leftovers-6 FR-7): 76 decision
# records, generated by testdata/fixture-many/generate.py and committed as
# its output. Its own git repo, so m-timed's branch carries times of day
# (30 Sep 09:05 to 16:40) and its Cards offer Hours.
(cd "$repo/testdata/fixture-many" && tar --exclude=./generate.py -cf - init-many) | (cd "$home" && tar -xf -)
m="$home/init-many"
gm() { git -C "$m" -c user.name=fixture -c user.email=fixture@example.invalid "$@"; }
gm init -q -b main
gm add -A
gm commit -q -m "chore: the many-records fixture"
gm checkout -q -b feat/timed
GIT_COMMITTER_DATE=2026-09-30T09:05:00-03:00 gm commit -q --allow-empty --date=2026-09-30T09:05:00-03:00 -m "feat: timed starts"
GIT_COMMITTER_DATE=2026-09-30T16:40:00-03:00 gm commit -q --allow-empty --date=2026-09-30T16:40:00-03:00 -m "feat: timed lands"
gm checkout -q main

cp "$repo/testdata/fixture-health.json" "$tmp/health.json"
# A ruling in Solved (leftovers-26 FR-11): before asking_thread, so the
# decided thread rides the canned threads it copies.
decided_thread "$tmp/data/organizer/state.json" || true
# Needs me holds the 14 rows of leftovers-11 V1 (five, then "Show the other
# 9"; with 0011's task, 15 and "the other 10"), one of them the thread above.
# Without discuss that thread cannot exist, so a card in init-a addressed to
# pablo takes its place and the count stays the same.
if [ -z "$live_mailbox" ] && ! asking_thread "$tmp/health.json"; then
  cat > "$a/working-on/w-asks-pablo.md" <<'CARD'
---
title: Review before the queued card lands
status: next
repos: [repo-one]
branch: none
updated: 2026-09-26
next: "pablo: may the review start before w-queued lands, or after it"
---

## Goal
Stands in for the fixture thread that asks pablo when discuss is not
running, so Needs me keeps its 14 rows (leftovers-11 V1).
CARD
  echo "fixture-home: a card addressed to pablo stands in for that thread" >&2
fi
# A relay to Aglaea (roles-ui R3): a [for aglaea] thread to pablo with no
# reply, open, in organizer-fixture's canned threads. The organizer cannot
# read its messages (the mailbox does not hold it), so it has no sender and
# no reply, which is what "waiting" needs. 0079 keeps it out of Needs me.
[ -n "$live_mailbox" ] || python3 - "$tmp/health.json" <<'PY'
import json, sys
path = sys.argv[1]
doc = json.load(open(path))
p = doc["organizer-fixture"]
p["threads"] = (p.get("threads") or []) + [{
    "id": "01FIXTUREFORAGLAEA000000000", "subject": "[for aglaea] does the roles row fold at 1024 the way you meant",
    "status": "open", "kind": "conversation", "participants": ["fse", "pablo"], "messages": 1,
    "since_decision": 1, "undecided": False, "quiet_seconds": 7200, "age_seconds": 7200}]
json.dump(doc, open(path, "w"), indent=1)
PY
cat > "$tmp/config.yaml" <<EOF
machine: fixture
roots:
  - $home
max_depth: 3
ignore_dirs: [node_modules, Library]
auth: off
agent_binary: organizer-fixture-agent
zellij: /usr/bin/true
probe_state_dir: $tmp/probe
EOF
[ -n "$live_mailbox" ] || echo "canned_health: $tmp/health.json" >> "$tmp/config.yaml"
# The transversal roles (docs/ux/specs/transversal-roles.md, R1-R4): the
# default list's names and globs with every bitácora inside the fixture
# home, never the real ones. Hephaistos keeps two HAND-OFFs (this machine's,
# "fixture", and odyssey's), Aglaea a log without one, Ariadna none and
# Daedalus a stale one; Talos and Hermione are named only.
cat >> "$tmp/config.yaml" <<EOF
roles:
  - name: Hephaistos
    description: "Forges the agent factory with Pablo: skills, seats, shared primitives"
    sessions: "probe-hefesto*"
    bitacora: $home/agent-slack/docs/bitacora/hephaistos_bitacora.md
    here: true
  - name: Aglaea
    description: "Product designer: UI, user research and validation, one seat per initiative"
    sessions: "*-probe-aglaea"
    bitacora: <initiative>/docs/bitacora/aglaea_bitacora.md
    here: true
  - name: Ariadna
    description: Business analyst beside a non-technical person
    sessions: "*-probe-ariadna"
    bitacora: <initiative>/docs/bitacora/ariadna_bitacora.md
    here: true
  - name: Daedalus
    description: "Head of architecture: reviews a solution from an initiative's docs"
    sessions: "*-probe-daedalus"
    bitacora: <initiative>/docs/bitacora/daedalus_bitacora.md
    here: true
  - name: Talos
    description: PLV infra, on odyssey
    here: false
  - name: Hermione
    description: PLV infra, on odyssey
    here: false
EOF
mkdir -p "$tmp/data"

# The live agents of init-a, as probe would launch them: the family is the
# cell's project, so each session is organizer-fixture-probe-<short>.
f=organizer-fixture
standin "$a" AGENT_NAME=po_ana PROJECT_ID=$f AGENT_SESSION=$f-probe-ana
standin "$a" AGENT_NAME=dev_bruno PROJECT_ID=$f AGENT_SESSION=$f-probe-bruno
standin "$a" AGENT_NAME=sup10 PROJECT_ID=$f AGENT_SESSION=$f-probe-sup10
standin "$a/.wt/build-help" AGENT_NAME=build-help PROJECT_ID=$f AGENT_SESSION=$f-probe-build-help
standin "$a" AGENT_SESSION=$f-probe-sup9

# The roles' sessions (R1, R4): two Hephaistos sessions, one in init-a and
# one outside every initiative, and one Aglaea seat of init-a's cell; no
# Ariadna or Daedalus. Each carries a statusline record in the fixture's
# data dir, so the two Hephaistos sessions read different context fills.
mkdir -p "$tmp/data/organizer/sessions"
record() { # record <pid> <session> <cwd> <percent>
  printf '{"pid":%s,"session_id":"fixture-%s","session":"%s","cwd":"%s","model":"claude-opus-5-5","used_percent":%s,"input_tokens":0,"window_size":200000,"cost_usd":0,"updated_at":"%s"}\n' \
    "$1" "$2" "$2" "$3" "$4" "$(date -u +%Y-%m-%dT%H:%M:%SZ)" > "$tmp/data/organizer/sessions/$1.json"
}
standin "$a" AGENT_SESSION=probe-hefesto
record "${pids##* }" probe-hefesto "$a" 42
standin "$home/agent-slack" AGENT_SESSION=probe-hefesto-odd
record "${pids##* }" probe-hefesto-odd "$home/agent-slack" 61
standin "$a" AGENT_SESSION=$f-probe-aglaea
record "${pids##* }" $f-probe-aglaea "$a" 28
# Daedalus ran once in init-b two days ago and is gone: one ended run in the
# fixture's own runs.jsonl, never the real one (not running · last seen).
seen="$(date -u -v-2d +%Y-%m-%dT10:00:00Z)"
printf '{"pid":999999,"session_id":"fixture-daedalus","session":"init-b-probe-daedalus","cwd":"%s","model":"claude-opus-5-5","used_percent":35,"input_tokens":0,"window_size":200000,"cost_usd":0,"first_seen":"%s","last_seen":"%s","ended":true}\n' \
  "$home/work/init-b" "$seen" "$seen" > "$tmp/data/organizer/runs.jsonl"
# Earlier Hephaistos sessions in four more initiatives, so its where reads
# five initiatives, "+2" past three, and gives way at 1024 (R7).
n=0
for d in "$home/work/init-b" "$home/init-many" "$home/init-define" "$home/init-drafted"; do
  n=$((n + 1))
  at="$(date -u -v-$((n + 2))d +%Y-%m-%dT09:00:00Z)"
  printf '{"pid":%s,"session_id":"fixture-hefesto-%s","session":"probe-hefesto-%s","cwd":"%s","model":"claude-opus-5-5","used_percent":50,"input_tokens":0,"window_size":200000,"cost_usd":0,"first_seen":"%s","last_seen":"%s","ended":true}\n' \
    "$((999990 - n))" "$n" "$n" "$d" "$at" "$at" >> "$tmp/data/organizer/runs.jsonl"
done
echo "${pids# }" > "$tmp/agents.pid"

# The usage history (header).
mkdir -p "$tmp/claude"
python3 "$repo/testdata/fixture-usage/usage.py" "$tmp/claude" "$tmp/data" "$home" fixture-probe-hefesto

# The roots the fake factory sees: every initiative laid, init-blind apart.
find "$home" -path '*/working-on/initiative.yaml' -not -path '*/.*' -not -path "$home/init-blind/*" | sed 's#/working-on/initiative.yaml$##' | sort > "$fd/roots"
echo "export ORGANIZER_CONFIG='$tmp/config.yaml'"
echo "export XDG_DATA_HOME='$tmp/data'"
echo "export CLAUDE_CONFIG_DIR='$tmp/claude'"
echo "export FIXTURE_HOME='$home'"
echo "export FIXTURE_AGENT_PIDS='${pids# }'"
echo "export FIXTURE_FACTORY_DIR='$fd'"
echo "export PATH='$fd/bin':\"\$PATH\""
echo "export FIXTURE_NOFACTORY_ENV='HOME=$tmp/nohome PATH=/usr/bin:/bin:/usr/sbin:/sbin'"
