#!/usr/bin/env python3
"""Scores a revmap.json of 35671ed against hand-lists.md (T1, T2, T3) and
checks T4 (package level). Usage: check.py revmap.json"""
import json, sys
d = json.load(open(sys.argv[1]))
C, L, H = "frontend/src/components/", "frontend/src/lib/", "frontend/src/hooks/"
t1 = {
    C+"Crew.tsx#CrewResult": "added", C+"Crew.tsx#useAnnouncer": "modified", C+"Crew.tsx#runningOf": "added",
    C+"Crew.tsx#startCrew": "modified", C+"Crew.tsx#Crew": "modified", C+"Crew.tsx#SeatRow": "modified",
    L+"liveRegion.ts#SAY_GAP_MS": "added", L+"liveRegion.ts#speaker": "modified", L+"liveRegion.ts#Say": "added",
    L+"liveRegion.ts#useLiveRegion": "modified", H+"useWails.ts#api": "modified",
    C+"Crew.button.test.tsx#B3: Start finds every seat running (FR-3, L18)": "modified",
    C+"Crew.newest.test.tsx#P2 in markup: a seat the press found running (leftovers-33 FR-2, L23)": "added",
    L+"liveRegion.test.ts#N2: a repeated message is said again": "modified",
    L+"liveRegion.test.ts#P4: a repeat waits 100 ms (leftovers-33 FR-4, L25)": "added",
}
t1 = {"ts:" + k: v for k, v in t1.items()}
picks = {"ts:"+C+"Crew.tsx#startCrew", "ts:"+L+"liveRegion.ts#speaker", "ts:"+L+"liveRegion.ts#useLiveRegion", "ts:"+C+"Crew.tsx#runningOf"}
t2 = {("ts:"+C+"Crew.tsx#Crew", "ts:"+C+"Crew.tsx#startCrew"), ("ts:"+L+"liveRegion.ts#useLiveRegion", "ts:"+L+"liveRegion.ts#speaker"),
      ("ts:"+C+"Crew.tsx#useAnnouncer", "ts:"+L+"liveRegion.ts#useLiveRegion"), ("ts:"+C+"AgentsView.tsx#NewAgent", "ts:"+L+"liveRegion.ts#useLiveRegion"),
      ("ts:"+C+"InitiativesView.tsx#InitiativesView", "ts:"+L+"liveRegion.ts#useLiveRegion"), ("ts:"+C+"Crew.tsx#startCrew", "ts:"+C+"Crew.tsx#runningOf")}
untested = {"ts:"+C+"Crew.tsx#useAnnouncer", "ts:"+L+"liveRegion.ts#useLiveRegion", "ts:"+L+"liveRegion.ts#Say", "ts:"+C+"Crew.tsx#CrewResult", "ts:"+H+"useWails.ts#api"}
nodes = {n["id"]: n for n in d["nodes"]}
ts_changed = {n["id"]: n["change"] for n in d["nodes"] if n["lang"] == "ts" and n["level"] == "symbol" and n["change"] != "affected"}
miss1 = [k for k, v in t1.items() if ts_changed.get(k) != v or nodes[k]["lang"] != "ts"]
extra1 = [k for k in ts_changed if k not in t1]
edges = {(e["from"], e["to"]) for e in d["edges"] if e["kind"] == "uses"}
miss2 = [e for e in t2 if e not in edges or nodes.get(e[0], {}).get("change") not in ("affected", "modified", "added")]
extra2 = [e for e in edges if e[1] in picks and e not in t2 and not nodes.get(e[0], {}).get("kind") == "test"]
trap = [e for e in edges if e[1].endswith("#CrewResult") and "useWails" in e[0]]
flagged = {n["id"] for n in d["nodes"] if "untested" in n["flags"] and n["lang"] == "ts"}
sp = nodes.get("ts:"+L+"liveRegion.ts#speaker", {}).get("evidence", {}).get("tests", [])
t3 = {"speaker tests": sp, "untested missing": sorted(untested - flagged), "untested extra": sorted(flagged - untested)}
level = {n["id"]: n["level"] for n in d["nodes"]}
parent = {n["id"]: n["parent"] for n in d["nodes"]}
bad_parent = [n["id"] for n in d["nodes"] if n["level"] == "symbol" and level.get(n["parent"]) != "package"]
crossed = {(parent[e["from"]], parent[e["to"]]) for e in d["edges"] if level.get(e["from"]) == "symbol"}
bad_pkg_edge = [(e["from"], e["to"]) for e in d["edges"] if level.get(e["from"]) == "package" and (e["from"], e["to"]) not in crossed]
pk_ids = [n["id"] for n in d["nodes"] if n["level"] == "package"]
print(json.dumps({"T1 missed": miss1, "T1 extra": extra1, "T2 missed": miss2, "T2 extra": extra2, "trap edges api->CrewResult": trap,
                  "T3": t3, "T4 symbols without package parent": bad_parent, "T4 package edges without symbol edge": bad_pkg_edge,
                  "T4 packages emitted twice": len(pk_ids) - len(set(pk_ids)), "problems": d.get("problems"), "notes": d.get("notes")}, indent=1))
