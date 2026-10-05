---
title: Needs me shows its oldest five then "Show the other N"; role landings focus what they name; role names and tracks
status: now
repos: [organizer]
branch: roles-and-needs-me-five
updated: 2026-10-05
next: "review: roles-and-needs-me-five, gate met (V1-V5, V0; Chromium and WKWebView)"
seat: rn5-build
depends_on: [drafts-per-chat]
boundary: ["frontend/src/components/Home.tsx, frontend/src/styles/home.css (Needs me's five, role rows' tracks)", "frontend/src/lib/queue.ts (a first-five helper only; needsMeRows unchanged) and lib/ tests", "the roles drawer and rail item components and their CSS; Rail.tsx (the role item's name)", "frontend/src/components/AgentsView.tsx and AgentList.tsx (the landed row's name only: rowName lives in AgentList.tsx, sup40), Conversation.tsx and SlackView.tsx (focus on a landing; the composer's default addressee and wake count, FR-6), InitiativeHeader.tsx (focus target only)", "testdata/ and scripts/fixture-home.sh (a 14-row Needs me fixture)", "not: Go, docs/design-system.md"]
spec: "docs/specs/leftovers-11.md (FR-1 to FR-6); transversal-roles.md Amendment 1 (Aglaea, f3535e7)"
gate: "docs/specs/leftovers-11.md Acceptance, rows V1 to V5 and V0"
ui_review: true
---

## Goal
Roles stay in view on Home with a long Needs me; the rest of roles-ui's leftovers.

## Gate
- [x] V1-V5: see `docs/specs/leftovers-11.md`, Acceptance
- [x] V0: see `docs/specs/leftovers-11.md`, Acceptance

## Done
- 2026-10-05 rn5-build: branch roles-and-needs-me-five, rebased on 6a5d6d4 (3eb4803 e6f31ff fb7d3d9 9f607cb 50a3c19 d9e03b5 71417d8 e52a1fd eb2964e); V1-V5 measured in Chromium and in Deltagos Review.app, overlay and classic, V0 green; measurements and choices in .wt-notes/rn5-build/progress.md
- 2026-10-05 sup40: worktree .wt/roles-and-needs-me-five from c147c6a, seat rn5-build; boundary names AgentList.tsx for FR-3 (rowName lives there), spec field says FR-6 as the boundary already did
- 2026-10-05 0085 ruled by pablo ("ok", f6e7aea); sup40 launched by the FSE
- 2026-10-04 cut from leftovers-11 by the FSE

## Next

## Blockers

## Notes
- 2026-10-05 rn5-build: the fixture already had 14 Needs me rows only while discuss runs (one is the live asking thread); without it fixture-home.sh now writes a card addressed to pablo in its place.
- 2026-10-05 rn5-build: V4 names three roles; the fixture has four that run here, measured with four.
- 2026-10-05 rn5-build: the mail landing's focus target (`div.tl-divider`) has no accessible name of its own; the drawer's session line says `running` where the Agents row says `idle` (each true to its own view); Crew seat rows have no accessible name. All outside this boundary.
- 2026-10-05 rn5-build: V5's "no post reaches a seat" is checked in Chromium with PostToCell stubbed; in WKWebView only the defaults were read (Start not pressed). HID clicks from the seat's session did not reach the Review app; AXPress did.
