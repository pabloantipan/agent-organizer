#!/usr/bin/env python3
"""The fixture's usage history (docs/specs/usage.md U1-U8): synthetic Claude
Code transcripts under <claude>/projects and the matching run records in
<data>/organizer/runs.jsonl, so the Usage view can show every state of
docs/ux/specs/usage.md. Weeks are relative to today, Monday first, local:

  W-5  the first recorded week, from its Thursday (partial first week)
  W-4  three sessions in init-b and init-many
  W-3  one session (a week with one session)
  W-2  none (a week with no sessions inside the history)
  W-1  last week: four sessions, so this week's money has a change
  W0   this week: a wave on init-a's w-review (wave1-build, wave1-review,
       sup11 its supervisor), an FSE session, a session outside every
       initiative (Not attributed), a session with no cost, a Haiku
       sub-agent, and the running Hephaistos session (the stand-in whose
       live record is fixture-probe-hefesto)

usage.py <claude dir> <data dir> <fixture home> <running session id>
Writes nothing outside the first two directories.
"""
import datetime as dt
import json
import os
import sys

claude, data, home, running = sys.argv[1:5]
a = os.path.join(home, "init-a")
b = os.path.join(home, "work", "init-b")
many = os.path.join(home, "init-many")
outside = os.path.join(home, "scratch")  # under no initiative root

today = dt.datetime.now().astimezone().replace(hour=0, minute=0, second=0, microsecond=0)
monday = today - dt.timedelta(days=today.weekday())
OPUS, HAIKU = "claude-opus-5-5", "claude-haiku-4-5-20251001"
runs = []
n_msg = [0]


def at(week, day, hour, minute=0):
    """A local time: week 0 is this one, day 0 its Monday."""
    return monday + dt.timedelta(weeks=week, days=day, hours=hour, minutes=minute)


def write(path, lines):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w") as f:
        for l in lines:
            f.write(json.dumps(l, separators=(",", ":")) + "\n")


def session(sid, cwd, name, start, minutes, tokens, model=OPUS, record=None, transcript_cost=None, sub=None):
    """One transcript of four assistant messages spread over `minutes`.
    tokens is (input, output, cache read, cache write) in total. record is
    the statusline's cost in runs.jsonl; transcript_cost the transcript's
    own cost-state; neither is a session with no cost."""
    proj = os.path.join(claude, "projects", "-fixture" + cwd.replace("/", "-"))
    lines = []
    if name:
        lines.append({"type": "agent-name", "agentName": name, "sessionId": sid})
    steps = 4
    for i in range(steps):
        n_msg[0] += 1
        ts = start + dt.timedelta(minutes=minutes * i / (steps - 1))
        k = [t // steps for t in tokens]
        lines.append({"type": "assistant", "timestamp": ts.isoformat(), "cwd": cwd, "sessionId": sid,
                      "message": {"id": "msg_fixture_%05d" % n_msg[0], "model": model,
                                  "usage": {"input_tokens": k[0], "output_tokens": k[1],
                                            "cache_read_input_tokens": k[2], "cache_creation_input_tokens": k[3]}}})
    if transcript_cost is not None:
        lines.append({"type": "cost-state", "totalCostUSD": transcript_cost})
    write(os.path.join(proj, sid + ".jsonl"), lines)
    if sub:
        # A sub-agent's transcript, counted under its parent (FR-1).
        n_msg[0] += 1
        write(os.path.join(proj, sid, "subagents", "agent-1.jsonl"), [{
            "type": "assistant", "timestamp": (start + dt.timedelta(minutes=5)).isoformat(), "cwd": cwd, "sessionId": sid,
            "message": {"id": "msg_fixture_%05d" % n_msg[0], "model": HAIKU,
                        "usage": {"input_tokens": sub[0], "output_tokens": sub[1], "cache_read_input_tokens": sub[2], "cache_creation_input_tokens": sub[3]}}}])
    if record is not None:
        end = start + dt.timedelta(minutes=minutes)
        runs.append({"pid": 900000 + len(runs), "session_id": sid, "session": name or "", "cwd": cwd, "model": model,
                     "used_percent": 40, "input_tokens": 0, "window_size": 200000, "cost_usd": record,
                     "first_seen": start.astimezone(dt.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
                     "last_seen": end.astimezone(dt.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"), "ended": True})


M = 1_000_000
# W-5, from its Thursday: the partial first week.
session("fixture-u-w5a", b, "init-b-probe-dana", at(-5, 3, 10), 50, (90_000, 40_000, 2 * M, 120_000), record=6.40)
session("fixture-u-w5b", many, "probe-hefesto-w5", at(-5, 4, 15), 80, (120_000, 60_000, 3 * M, 200_000), record=9.10)
# W-4
session("fixture-u-w4a", b, "init-b-probe-dana", at(-4, 0, 9), 120, (200_000, 90_000, 6 * M, 300_000), record=14.20)
session("fixture-u-w4b", many, "init-many-probe-fse", at(-4, 2, 11), 60, (80_000, 30_000, 2_500_000, 90_000), record=5.75)
session("fixture-u-w4c", a, "organizer-fixture-probe-ana", at(-4, 3, 14), 45, (60_000, 25_000, 1_800_000, 70_000), transcript_cost=3.30)
# W-3: one session.
session("fixture-u-w3a", a, "organizer-fixture-probe-fse", at(-3, 1, 10), 95, (150_000, 70_000, 4 * M, 160_000), record=11.60)
# W-2: nothing.
# W-1: last week.
session("fixture-u-w1a", a, "organizer-fixture-probe-wave0-build", at(-1, 0, 9), 150, (300_000, 140_000, 9 * M, 420_000), record=21.40)
session("fixture-u-w1b", a, "organizer-fixture-probe-fse", at(-1, 1, 13), 70, (110_000, 50_000, 3 * M, 130_000), record=8.90)
session("fixture-u-w1c", b, "init-b-probe-dana", at(-1, 2, 10), 100, (170_000, 80_000, 5 * M, 210_000), record=13.75)
session("fixture-u-w1d", many, "probe-hefesto-w1", at(-1, 4, 16), 60, (90_000, 40_000, 2 * M, 100_000), record=6.10)
# W0: this week. The wave on w-review: builder, reviewer and its supervisor.
session("fixture-u-build", a, "organizer-fixture-probe-wave1-build", at(0, 0, 9, 5), 140, (420_000, 210_000, 14 * M, 600_000), record=31.20, sub=(40_000, 12_000, 300_000, 20_000))
session("fixture-u-review", a, "organizer-fixture-probe-wave1-review", at(0, 0, 12, 10), 55, (160_000, 60_000, 5 * M, 220_000), record=11.85)
session("fixture-u-sup", a, "organizer-fixture-probe-sup11", at(0, 0, 8, 40), 260, (130_000, 70_000, 6 * M, 180_000), record=12.40)
# An FSE session: in init-a, on no single card.
session("fixture-u-fse", a, "organizer-fixture-probe-fse", at(0, 0, 16), 40, (70_000, 30_000, 1_600_000, 60_000), record=4.95)
# Outside every initiative: Not attributed, with its reason.
session("fixture-u-loose", outside, "", at(0, 0, 17, 30), 25, (50_000, 20_000, 900_000, 40_000), transcript_cost=2.65)
# No statusline record and no cost-state: no cost recorded.
session("fixture-u-nocost", b, "init-b-probe-dana", at(0, 0, 10, 20), 35, (60_000, 25_000, 1_200_000, 50_000))
# The running session: the stand-in's live record names it; its money is the
# transcript's so far.
session(running, a, "", at(0, 0, 13, 30), 90, (140_000, 60_000, 4_400_000, 150_000), transcript_cost=9.80)

os.makedirs(os.path.join(data, "organizer"), exist_ok=True)
with open(os.path.join(data, "organizer", "runs.jsonl"), "a") as f:
    for r in runs:
        f.write(json.dumps(r, separators=(",", ":")) + "\n")
