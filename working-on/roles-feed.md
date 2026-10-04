---
title: The roles feed - configured roles, their sessions, hand-off, mail and initiatives on the agents feed
status: next
repos: [organizer]
branch: roles-feed
updated: 2026-10-04
next: "review: roles-feed, G1-G3 met"
depends_on: []
boundary: ["internal/config (roles)", "internal/model (Role and its parts)", "internal/service (roles.go, AgentsView.Roles, its tests)", "internal/cli (organizer roles)", "app.go bindings and frontend/wailsjs regenerated", "testdata/ fixtures for roles", "not: frontend/src components, docs/design-system.md"]
spec: "docs/ux/specs/transversal-roles.md (Aglaea, 299b221) and its Technical notes T1-T4; ruling 0082"
gate: "the Gate section below"
ui_review: false
seat: rf-build
---

## Goal
The data the Roles group shows, on the 10 s agents feed and `organizer roles`.

## Gate
- [x] G1: `go test ./internal/...` with fixtures covering T2's states: a live role with two sessions (max context), not running with last seen from runs.jsonl, never seen, no bitácora, a stale HAND-OFF (> 7 days), mail waiting and answered (`[<role>` reply), discuss down (mail unknown), `here: false` (name only), `roles: []`
- [x] G2: `organizer roles --json` on the real home lists probe-hefesto under Hephaistos with its context, and organizer-probe-aglaea under Aglaea with initiative organizer
- [x] G3: `wails generate module` run; `XDG_DATA_HOME=$(mktemp -d) make test` from a clean checkout; `wails build`

## Done
- 2026-10-04 rf-build: roles config, `service.Roles` on `AgentsView.Roles`, `organizer roles [--json]`, bindings (6dfd625, 37f39a6, da3f68e, be92b7d on roles-feed); G1-G3 met
- 2026-10-04 0083 ruled by pablo ("Ok", accept as written); sup37 launched by the FSE
- 2026-10-04 cut by the FSE from Aglaea's design (299b221) and 0082

## Next

## Blockers

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
