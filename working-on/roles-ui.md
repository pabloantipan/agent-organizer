---
title: Roles on Home and in the rail, and a role's drawer - show only
status: next
repos: [organizer]
branch: roles-ui
updated: 2026-10-04
next: "fse: start a supervisor once roles-feed is in done/ (0083 ruled)"
depends_on: [roles-feed]
boundary: ["frontend/src/components/Home.tsx, Rail.tsx, a new RoleDrawer.tsx", "frontend/src/styles/home.css, shell.css (the rail group only), a roles stylesheet", "frontend/src/lib/ (a roles view helper) and its tests", "frontend/src/stores/board.store.ts (the drawer's open state and the rail group's collapse only)", "not: Go, docs/design-system.md"]
spec: "docs/ux/specs/transversal-roles.md (Aglaea, 299b221) and its Technical note T5; ruling 0082"
gate: "docs/ux/specs/transversal-roles.md Acceptance R1-R7, plus the build row below"
ui_review: true
---

## Goal
He sees on Home and in the rail which roles are live, what each is on, its
mail and its initiatives, and opens a role without starting anything.

## Gate
- [ ] R1-R7: see `docs/ux/specs/transversal-roles.md`, Acceptance
- [ ] `XDG_DATA_HOME=$(mktemp -d) make test` from a clean checkout; `cd frontend && npm run build`; `wails build`

## Done
- 2026-10-04 0083 ruled by pablo ("Ok", accept as written)
- 2026-10-04 cut by the FSE from Aglaea's design (299b221) and 0082

## Next

## Blockers

## Notes
