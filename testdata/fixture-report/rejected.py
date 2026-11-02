#!/usr/bin/env python3
"""Two usage rows discuss-record refused, for Usage's rejected list
(leftovers-62 FR-7, leftovers-67 FR-12, U9): writes
<data>/organizer/usage-post.json with fixture-u-w1a and fixture-u-w1c, two
of testdata/fixture-usage/usage.py's sessions of last week, keyed by session
and local day as the ledger keys them, so the ledger pass keeps them.

rejected.py <XDG_DATA_HOME of a fixture home>
Refuses a data dir that is not under a temp dir. Writes nothing else.
"""
import datetime as dt
import json
import os
import sys

data = os.path.realpath(sys.argv[1])
tmp = os.path.realpath(os.environ.get("TMPDIR", "/tmp"))
if not (data.startswith(tmp + os.sep) or data.startswith("/private/tmp/") or data.startswith("/private/var/folders/")):
    sys.exit("refused: %s is not under a temp dir" % data)
today = dt.datetime.now().astimezone().replace(hour=0, minute=0, second=0, microsecond=0)
monday = today - dt.timedelta(days=today.weekday())
day = lambda d: (monday + dt.timedelta(weeks=-1, days=d)).strftime("%Y-%m-%d")
at = dt.datetime.now(dt.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
rows = [
    ("fixture-u-w1a", day(0), "input is a JSON string"),
    ("fixture-u-w1c", day(2), "token counts and messages cannot be negative"),
]
st = {"accepted": {}, "rejected": {"%s|%s" % (s, d): {"session_id": s, "day": d, "reason": r, "hash": "fixture", "at": at} for s, d, r in rows}}
os.makedirs(os.path.join(data, "organizer"), exist_ok=True)
with open(os.path.join(data, "organizer", "usage-post.json"), "w") as f:
    json.dump(st, f)
print("rejected: %d rows in %s" % (len(rows), os.path.join(data, "organizer", "usage-post.json")))
