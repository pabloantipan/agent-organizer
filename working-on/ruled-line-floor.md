---
title: The Ruled line drops its chosen option cleanly, the wake count beside Rule, the review window says Review, one word map
status: now
repos: [organizer]
branch: ruled-line-floor
seat: rlf-build
stage: one-window
updated: 2026-10-06
next: "rlf-build builds it on branch ruled-line-floor (sup46, wave 1)"
depends_on: []
boundary: ["frontend/src/components/DecisionsView.tsx, decisions.css, global.css (.dec-meta and .wakes only)", "frontend/src/components/Conversation.tsx (rule box, WakeCount), Home.tsx (its rule box's wake count only)", "AgentList.tsx, Crew.tsx, RoleDrawer.tsx (the state word map only), one new lib/ module and its test", "main.go (the window title only)", "scripts/fixture-home.sh (--empty)", "not: docs/design-system.md, the floating panel's native code"]
spec: "docs/specs/leftovers-13.md (FR-1 to FR-5); Aglaea 5c937df"
gate: "docs/specs/leftovers-13.md Acceptance, rows L1 to L5 and X0"
ui_review: true
---

## Goal
leftovers-13: no Ruled line ever shows an empty option or a stray dot; the
rest of the last two waves' leftovers, every gate row a seat's (0095).

## Gate
docs/specs/leftovers-13.md, L1-L5 and X0.

## Notes
- 0096 ruled 2026-10-06; supervisor sup46, spawned by the FSE.
