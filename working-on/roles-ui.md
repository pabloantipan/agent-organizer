---
title: Roles on Home and in the rail, and a role's drawer - show only
status: next
repos: [organizer]
branch: roles-ui
updated: 2026-10-04
next: "review: roles-ui, gate met in Chromium (R1-R7, build); R5 and R7 not verified in WKWebView, left to the UI reviewer"
seat: ru-build
depends_on: [roles-feed, drafts-and-slack]
boundary: ["frontend/src/components/Home.tsx, Rail.tsx, a new RoleDrawer.tsx", "frontend/src/styles/home.css, shell.css (the rail group only), a roles stylesheet", "frontend/src/lib/ (a roles view helper) and its tests", "frontend/src/stores/board.store.ts (the drawer's open state and the rail group's collapse only)", "scripts/fixture-home.sh and testdata/fixture-overlay/ (the roles fixture R1-R4 read; added by sup38)", "not: Go, docs/design-system.md"]
spec: "docs/ux/specs/transversal-roles.md (Aglaea, 299b221) and its Technical note T5; ruling 0082"
gate: "docs/ux/specs/transversal-roles.md Acceptance R1-R7, plus the build row below"
ui_review: true
review: pass
---

## Goal
He sees on Home and in the rail which roles are live, what each is on, its
mail and its initiatives, and opens a role without starting anything.

## Gate
- [ ] R1-R7: see `docs/ux/specs/transversal-roles.md`, Acceptance (met in Chromium; R5, R7 not verified in WKWebView)
- [x] `XDG_DATA_HOME=$(mktemp -d) make test` from a clean checkout; `cd frontend && npm run build`; `wails build`

## Done
- 2026-10-04 sup38 launched ru-review and ru-ui pinned at c6f39ce
- 2026-10-04 ru-build: built on roles-ui (49f8256..c6f39ce), unmerged and rebased on main; R1-R7 measured in Chromium at 1024x609 (strip and full, overlay and classic), 1512x945, 1920x1080, 3440x1440; build row green; WKWebView not driveable from the seat (no AX windows, no screen capture); rows in .wt-notes/ru-build/progress.md
- 2026-10-04 sup38 launched ru-build in .wt/roles-ui from 1f0cb4a
- 2026-10-04 sup38 launched by the FSE
- 2026-10-04 0083 ruled by pablo ("Ok", accept as written)
- 2026-10-04 cut by the FSE from Aglaea's design (299b221) and 0082

## Next

## Blockers

## Review
- Verdict: pass (code and checks; the WKWebView rows of R5 and R7 are the UI reviewer's)
- Commit reviewed: c6f39ce (branch roles-ui, base ee7658a)
- Unmet gate items: none
- Evidence: clean clone of c6f39ce, `XDG_DATA_HOME=$(mktemp -d) make test` 0 (vitest 224); `npm install && npm test && npm run build` 0; `wails build` 0. Fixture `go run . roles --json`: Hephaistos live, 2 sessions (42, 61), hand-off 3 Oct; Aglaea live 28%, one `[for aglaea]` mail; Ariadna never seen, no bitácora; Daedalus not running, last seen 2 Oct; Talos, Hermione here: false. Code: roles.ts feeds nothing to queueOf/needsMeRows, lib/queue.ts untouched (T4); UI reads `agents.roles` only (T5); drawer and rows hold no Attach, Kill, Start or Message (R6); Escape through boxStack, focus on the title and back to the opener or its `data-role` (R5); dates through lib/dates; tests cover the States table. Boundary: every changed path inside it. R5, R7 layout taken from ru-build's Chromium measurements in .wt-notes/ru-build.
- Not gated, worth a card: `ageWords` copies Home's private `age` instead of sharing it; `sessionStarted` prints the feed's `created` string raw; the strip carries a role's mail only in its hover title; `kill $FIXTURE_AGENT_PIDS` does not word-split in zsh, so the documented cleanup leaves the eight stand-ins running (killed by pid here).
- Reviewer: ru-review, 2026-10-04

## Notes
- 2026-10-04 sup38: R1-R4 are checked "by fixture" and no fixture carried roles (its zellij is /usr/bin/true). Stand-ins with AGENT_SESSION, a roles config, bitácoras, runs.jsonl and a canned [for aglaea] thread make it; those live in scripts/fixture-home.sh and testdata/fixture-overlay/, so the boundary gained them (supervise precondition 10). The gate is unchanged; told the FSE.
- 2026-10-04 ru-build: Home's sections were not collapsible; Roles is the first (heading disclosure, `home.roles.open`). The drawer is mounted from Rail.tsx (App.tsx outside the boundary). A session landing focuses the session's Attach on Agents, found by its title `probe <session>`, since AgentList rows carry no data-session; a `session:` agentsLanding would be cleaner. The fixture's [for aglaea] thread is canned, so Conversations shows it "opening…" and the drawer names no sender. A Hephaistos session outside every initiative is a static line: no Agents to land on.
