---
title: The roles feed - configured roles, their sessions, hand-off, mail and initiatives on the agents feed
status: done
repos: [organizer]
branch: roles-feed
updated: 2026-10-04
next: "merged 8402e31; roles-ui is next (fse)"
depends_on: []
boundary: ["internal/config (roles)", "internal/model (Role and its parts)", "internal/service (roles.go, AgentsView.Roles, its tests)", "internal/cli (organizer roles)", "app.go bindings and frontend/wailsjs regenerated", "testdata/ fixtures for roles", "not: frontend/src components, docs/design-system.md"]
spec: "docs/ux/specs/transversal-roles.md (Aglaea, 299b221) and its Technical notes T1-T4; ruling 0082"
gate: "the Gate section below"
ui_review: false
seat: rf-build
review: pass
---

## Goal
The data the Roles group shows, on the 10 s agents feed and `organizer roles`.

## Gate
- [x] G1: `go test ./internal/...` with fixtures covering T2's states: a live role with two sessions (max context), not running with last seen from runs.jsonl, never seen, no bitácora, a stale HAND-OFF (> 7 days), mail waiting and answered (`[<role>` reply), discuss down (mail unknown), `here: false` (name only), `roles: []`
- [x] G2: `organizer roles --json` on the real home lists probe-hefesto under Hephaistos with its context, and organizer-probe-aglaea under Aglaea with initiative organizer
- [x] G3: `wails generate module` run; `XDG_DATA_HOME=$(mktemp -d) make test` from a clean checkout; `wails build`

## Done
- 2026-10-04 sup37: review pass at de539d9 (rf-review); merged to main as 8402e31; seats ended, threads closed; run record runs/2026-10-04-roles-feed.md
- 2026-10-04 rf-build: roles config, `service.Roles` on `AgentsView.Roles`, `organizer roles [--json]`, bindings (70fb345, 1e9fc4a, a13493d, de539d9 on roles-feed, based on 363edcf); G1-G3 met
- 2026-10-04 0083 ruled by pablo ("Ok", accept as written); sup37 launched by the FSE
- 2026-10-04 cut by the FSE from Aglaea's design (299b221) and 0082

## Next

## Blockers

## Review
- Verdict: pass
- Commit reviewed: de539d9 (branch roles-feed), from a clean clone
- Unmet gate items: none
- G1: `go test ./internal/...` passes; `roles_test.go` covers every listed state (live x2 with max context 61, runs.jsonl last seen, never seen, no bitácora with expected path, stale HAND-OFF, mail waiting, `[aglaea` reply answers, discuss down = unknown with Mail `[]` not nil, `here: false` name and description only, `roles: []` none on config and on the feed, key absent = six in the spec's order, Daedalus in); `[for <name>]` case-insensitive (`[for Aglaea]`, `[FOR aglaea]`).
- G2: `go run . roles --json` on lodestar: probe-hefesto under Hephaistos, live, 29%; organizer-probe-aglaea under Aglaea, initiative organizer, 31%.
- G3: `XDG_DATA_HOME=$(mktemp -d) make test` exit 0 (vitest 191 passed); `wails generate module` leaves `frontend/wailsjs` clean; `wails build` exit 0.
- T2: roles built in `agentsViewLocked` from the same sample; no new ticker, ps or zellij call; the second `threadFacts` call hits the `openers` cache filled by `liveThreads`. T3: new bound types all json-tagged. T4: Needs me untouched (no `frontend/src` diff, server `NeedsMe` unchanged). Boundary: all paths inside it.
- Findings (not gate): (1) mail counts stalled and escalated threads too, where T2 says `status=open`; the card notes it, the FSE may confirm. (2) A thread whose facts fetch failed has an empty last body and counts as waiting until fetched. (3) `go test ./...` from a clean clone fails the root package (`frontend/dist` embed, pre-existing); G1 names `./internal/...`, which passes. (4) `wails build` rewrites `frontend/wailsjs/runtime/*`, generator drift, pre-existing.
- Reviewer: rf-review, 2026-10-04

## Notes
- G2, 2026-10-04 on lodestar, `go run . roles --json` from .wt/roles-feed (excerpt):
  `{"name":"Hephaistos","state":"live","context":29,"sessions":[{"name":"probe-hefesto","initiative":"","state":"running","context":29,"pid":97011}],"initiatives":["agent-slack"]}`
  `{"name":"Aglaea","state":"live","context":31,"sessions":[{"name":"organizer-probe-aglaea","initiative":"organizer","state":"running","context":31,"pid":87516}],"initiatives":["organizer"]}`
  Ariadna and Daedalus `never_seen`, no bitácora; Talos, Hermione name and description only.
- probe-hefesto runs with cwd `~`: its session has no initiative; Hephaistos's initiatives come from its bitácora (agent-slack).
- HAND-OFF: the spec's T2 says "the first"; the feed gives this machine's (host named after the date in the heading) as `hand_off`, else the first, and the rest as `others`, so R2 holds on both Macs and the drawer can fold odyssey's.
- `first_line` joins the first paragraph: bitácoras wrap at 80 columns, so the file's first line is half a sentence.
- Mail counts every live thread (open, stalled, escalated), not only `open`; unknown only when no cell answers.
- Choices and cost of the 10 s tick: `.wt-notes/rf-build/progress.md`.
