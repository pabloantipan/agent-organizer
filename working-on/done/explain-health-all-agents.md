---
title: Supervisors and builders show their mailbox health
status: done
repos: [organizer]
branch: main
updated: 2026-09-28
review: pass
next: "review: explain-health-all-agents, branch explain-health-all-agents, gate G4, G5, G6 met (G7 is the reviewer's), 216e3b8 2c3d966 eab935e 52235ce 0dec2e0 3dedf4a"
depends_on: ["explain-health-words"]
boundary: ["internal/service/crew.go (health on non-roster agents, and capped; not the blocker reasons)", "internal/model/model.go (Agent: capped, identity)", "internal/scan/agents.go (read-only use of the env it reads)", "frontend/src/components/AgentsView.tsx", "frontend/src/components/AgentList.tsx", "testdata/ (a canned health source for the fixture, A3)", "internal/service/crew_test.go"]
spec: "docs/specs/machine-explains-itself.md (FR-6, FR-7); values: docs/design-system.md"
gate: "docs/specs/machine-explains-itself.md Acceptance, rows G4, G5, G6, G7; the Gate section below"
stage: machine-explains-itself
seat: stage3-agents
---

## Goal
Roadmap stage machine-explains-itself (0032): FR-6, FR-7 of `docs/specs/machine-explains-itself.md`.

## Gate
- [x] G4: see `docs/specs/machine-explains-itself.md`, Acceptance
- [x] G5: see `docs/specs/machine-explains-itself.md`, Acceptance
- [x] G6: see `docs/specs/machine-explains-itself.md`, Acceptance
- [ ] G7: see `docs/specs/machine-explains-itself.md`, Acceptance

## Done
- 2026-09-28 cut from the spec by the FSE
- 2026-09-28 stage3-agents: health stamped on every agent discuss knows by persona, crew seat or session short name, capped and no_identity on `model.Agent`, personas outside the roster listed, rows show badge plus why and what to do from lib/health; canned health via config `canned_health`, fixture brings up deaf (dev_bruno), capped (sup10), stale builder (build-help) and no identity (sup9). Commits 216e3b8 2c3d966 eab935e 52235ce 0dec2e0 3dedf4a on explain-health-all-agents, rebased on main 3cb71fe. Evidence: G4 `/Users/pabloantipan/organizer/.wt-notes/stage3-agents/g4-g5-agents-tab.png` (build-help stale, sup10 capped, sup9 no identity with why and what to do; persona rows sup10 and build-help listed; dev_bruno deaf), `/Users/pabloantipan/organizer/.wt-notes/stage3-agents/g4-badge-titles.json` (every badge's why/what), `go test ./internal/service/ -run TestHealthIsStampedOnEveryAgentWithAName` → `--- PASS` (`/Users/pabloantipan/organizer/.wt-notes/stage3-agents/g4-g5-tests.txt`); G5 same screenshot (sup9 "no identity · 3 waiting") and `/Users/pabloantipan/organizer/.wt-notes/stage3-agents/g5-with-agent-name-sup9.png` (AGENT_NAME=sup9: "never · 3 waiting"), `TestNoIdentityIsASessionUnderASeatsNameWithoutItsIdentity` → `--- PASS`; G6 `/Users/pabloantipan/organizer/.wt-notes/stage3-agents/g6.txt`: `npm run build` → `✓ built`, `XDG_DATA_HOME=$(mktemp -d) make test` → all `ok`, G18 grep → empty (exit 1). Choices and findings: `/Users/pabloantipan/organizer/.wt-notes/stage3-agents/progress.md`

## Next
1. review: explain-health-all-agents, branch explain-health-all-agents, gate G4, G5, G6 met (G7 is the reviewer's), 216e3b8 2c3d966 eab935e 52235ce 0dec2e0 3dedf4a

## Blockers
none

## Notes
- 2026-09-28 sup10 runs this card (organizer-probe-sup10), spawned by the FSE after 0040
- 2026-09-28 stage3-agents: crew seat rows (Crew.tsx, outside this boundary) show why and what to do only as the badge tooltip; a visible line there needs Crew.tsx
- 2026-09-28 stage3-agents: `WatcherBadge` (ContextBar.tsx, previous card) takes no noIdentity, so AgentList draws that badge itself; `.badge.watcher.no-identity` has no style in global.css (the word carries the state)
- 2026-09-28 stage3-agents: `organizer agents` (internal/cli) prints health only for persona rows, without capped or no identity; `discuss.AgentHealth.Capped`'s comment still says "until it is restarted"
- 2026-09-28 stage3-agents: canned health replaces the API for threads too, so the default fixture no longer shows G19's FSE thread; `scripts/fixture-home.sh --live-mailbox` brings it back. `kill $FIXTURE_AGENT_PIDS` needs `${=FIXTURE_AGENT_PIDS}` in zsh

## Review
- Verdict: pass. G4, G5, G6 met by the diff and the checks; G7 all four answers right in 70 s from the app (48 s for the three seats, 22 s for the Help).
- Unmet gate items: none.
- Reviewer: stage3-review-agents, 2026-09-28. Evidence: `.wt-notes/stage3-review-agents/` (g7.md, screenshots, g4-g5-tests.txt, g6-*.txt).
- G7 caveat: the built `.app` was launched on the fixture (01-home.png, native), but it refused synthetic clicks, so the questions were answered on `wails dev` of the same worktree, driven by Playwright. Same backend, frontend and fixture.
- Outside the gate: the roster seat's row (dev_bruno, deaf) gives why and what only as the badge's tooltip, while supervisors and builders get a visible line. The gate accepts this, but a first-time reader would not see it without hovering. Also: the Help's section list highlighted "2." without visibly scrolling the document (explain-help's G2); and in the built app, Home's init-a dropped "5 live" after the first 10 s agents sample. That last one was seen once and is not investigated.
