---
title: The roles feed - configured roles, their sessions, hand-off, mail and initiatives on the agents feed
status: next
repos: [organizer]
branch: roles-feed
updated: 2026-10-04
next: "decide: pablo - accept 0083 (the Roles design and its launch)"
depends_on: []
boundary: ["internal/config (roles)", "internal/model (Role and its parts)", "internal/service (roles.go, AgentsView.Roles, its tests)", "internal/cli (organizer roles)", "app.go bindings and frontend/wailsjs regenerated", "testdata/ fixtures for roles", "not: frontend/src components, docs/design-system.md"]
spec: "docs/ux/specs/transversal-roles.md (Aglaea, 299b221) and its Technical notes T1-T4; ruling 0082"
gate: "the Gate section below"
ui_review: false
---

## Goal
The data the Roles group shows, on the 10 s agents feed and `organizer roles`.

## Gate
- [ ] G1: `go test ./internal/...` with fixtures covering T2's states: a live role with two sessions (max context), not running with last seen from runs.jsonl, never seen, no bitácora, a stale HAND-OFF (> 7 days), mail waiting and answered (`[<role>` reply), discuss down (mail unknown), `here: false` (name only), `roles: []`
- [ ] G2: `organizer roles --json` on the real home lists probe-hefesto under Hephaistos with its context, and organizer-probe-aglaea under Aglaea with initiative organizer
- [ ] G3: `wails generate module` run; `XDG_DATA_HOME=$(mktemp -d) make test` from a clean checkout; `wails build`

## Done
- 2026-10-04 cut by the FSE from Aglaea's design (299b221) and 0082

## Next

## Blockers

## Notes
