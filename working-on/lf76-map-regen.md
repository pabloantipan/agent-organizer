---
title: "The organizer's map is regenerated with the grounded stamp and checks clean"
status: next
repos: [organizer]
branch: lf76-map-regen
seat: l76-map
reviewer: l76-rev
review: "pass, df5b9e17, 2026-11-08: C1-C3, X0 met"
stage:
updated: 2026-11-08
next: "merged as organizer #70 85cf237a; c4-map check clean on the merge commit; supervisor moves it to done/"
depends_on: []
boundary: ["docs/architecture/"]
spec: "docs/specs/leftovers-76.md (FR-1)"
gate: "docs/specs/leftovers-76.md#Acceptance → gate"
ui_review: false
touches: []
change_order: {add: [], change: [], retire: []}
autonomy: unattended
prs:
  - {repo: organizer, pr: 70, target: main, state: merged, merge: 85cf237a}
---

## Goal
`c4-map check` is clean on main after this merge, and stays clean.

## Gate
docs/specs/leftovers-76.md, rows C1-C3 and X0.

## Pre-answered
- Base: origin/main at the card's start.
- Merge target: `main` through talos-lab's PR.
- Tests: the c4-map, diagram-check and mermaid2svg runs of C1-C3 (mermaid2svg on copies, leftovers-63 Amendment 1).
- Short-sample fallback: n/a, the map is generated from the repo itself.
- Data shape across states: c4-map/1.
- Evidence: command output in the card's Done line.
- Retention: n/a.

## Declared changes
- modified `docs/architecture/containers.md`: gen restamps `agent_organizer` evidence from `agent-organizer@784a1f3` to `agent-organizer@46fc597`
- modified `docs/architecture/map.json`: gen restamps `inputs` and the container grounding to 46fc597
Risky:
- none: generated region and index only
Not changed, on purpose:
- `docs/architecture/context.md`: L1 changes only by a ruled record; gen did not touch it
- `docs/architecture/modules.md`: not regenerated (`gen` without `--modules`); check does not flag it
- `docs/architecture/c4.json`: gen locked no new id

## Done
- 2026-11-08 l76-map, df5b9e17 on 46fc597e (origin/main unmoved): C1 on main `c4-map check .` exit 1 `stale: containers.md containers`; `c4-map gen .` exit 0 (wrote containers.md, map.json), `c4-map check .` exit 0 clean, on the commit exit 0 clean and gen "wrote: nothing (up to date)"; a simulated `--no-ff` merge onto 46fc597e checks clean. C2 `diagram-check <page> --map docs/architecture` exit 0, 0 flags for context, containers, modules. C3 cmp identical copies in `.wt-notes/l76-map/c3/`, `mermaid2svg <copy> --check` exit 0 each, no crossings. X0 porcelain empty, diff only containers.md, map.json. Logs `.wt-notes/l76-map/`.

## Review
- Verdict: pass. Unmet rows: none. Reviewer l76-rev, 2026-11-08, commit df5b9e17 on 46fc597e, fresh clone of git@github.com:pabloantipan/agent-organizer.git plus a fetch of the local branch. Logs `.wt-notes/l76-rev/`.
- change-check `organizer lf76-map-regen --base origin/main`: 2 files (containers.md, map.json, both modified), "0 flags: outside boundary 0, outside footprint 0, undeclared 0, declared, not changed 0, …". Nothing to explain.
- C1 met: at 46fc597e `c4-map check .` exit 1 `stale: containers.md containers`; at df5b9e17 exit 0 clean; `c4-map gen .` exit 0 "wrote: nothing (up to date)", porcelain empty, check exit 0; `git merge --no-ff --no-edit df5b9e17` onto a local branch at 46fc597e (dc8c391d, clone only) checks exit 0 clean.
- C2 met: `diagram-check <page> --map docs/architecture` for context, containers, modules: 0 flags each, exit 0, no `ungrounded:`; README.md exit 0 "nothing to check" (not exit 2 as progress.md says; harmless).
- C3 met: the four pages copied, `cmp` identical, `mermaid2svg <page> --check` exit 0 for context (6 nodes), containers (5), modules (20), no crossings; no svg written in the clone.
- Skill read: the diff is the generated region's one evidence cell and map.json's `inputs` and grounding ref, 784a1f3 → 46fc597; context.md and c4.json untouched, ids unchanged; every grounding table has the five columns (edge tables three); map.json c4-map/1, 31 nodes, 0 ungrounded; the stamp 46fc597e is the base and the branch changes nothing outside docs/architecture, so the map grounds it; 784a1f3..46fc597e changed 58 files outside working-on/docs, so main's stale was real.
- X0 met: porcelain empty after all rows; `git diff --name-only 46fc597e..df5b9e17` is containers.md and map.json only. Clone removed.
- Cases the builder did not try: (A) a working-on-only commit on the merge: check exit 0 clean, as a5778f3 promises; (B) a one-line code commit (`main.go` comment): check exit 1 `stale: containers.md containers`.
- Note (goes to Hephaistos, factory c4-map, not this card): (B) means any code merge restales the map, so "stays clean" holds only until the next code change lands. (C) map.json `inputs` hand-edited back to 784a1f3…: `c4-map check .` exit 0 clean, so check never reads the index stamp; a wrong stamp in map.json passes the check (here gen reproduces it byte for byte, so this card is not affected).
