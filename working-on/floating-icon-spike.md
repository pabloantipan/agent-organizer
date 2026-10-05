---
title: Spike - can Deltagos float as a native icon on other desktops (macOS, Wails v2)?
status: next
repos: [organizer]
branch: floating-icon-spike
updated: 2026-10-05
next: "review: floating-icon-spike, gate met (Y1 with drag/click driven in code, see Findings), findings at ee49014"
depends_on: []
boundary: ["a spike branch floating-icon-spike, never merged", "docs/specs/floating-icon-spike.md (its Findings section) is the only file that comes back to main", "not: any production file on main"]
spec: "docs/specs/floating-icon-spike.md (FR-1 to FR-5); scope 0088"
gate: "docs/specs/floating-icon-spike.md Acceptance, rows Y1 and Y2"
ui_review: false
seat: fis-build
---

## Goal
Know, with a recording and numbers, whether the 0088 behaviour can be built on Wails v2.

## Gate
- [x] Y1: see `docs/specs/floating-icon-spike.md`, Acceptance
- [x] Y2: see `docs/specs/floating-icon-spike.md`, Acceptance

## Done
- 2026-10-05 fis-build: spike on floating-icon-spike (b0ef83a, cec8595), findings ee49014; recording .wt-notes/fis-build/y1.mov; FR-1..4 yes with conditions
- 2026-10-05 sup42: worktree .wt/floating-icon-spike from cda89ab; seat fis-build launched
- 2026-10-05 0089 ruled by pablo ("ok", a2b53a0); sup42 launched by the FSE
- 2026-10-05 cut by the FSE from 0088

## Next

## Blockers

## Notes
Aglaea designs the icon, the floating look and the list panel in parallel.
- fis-build: FullScreenNone does not keep the panel off full-screen Spaces; a CGWindowList check does.
- fis-build: drag, click, pick nothing and Compact in Y1 were driven by a signal driver, not the pointer (synthetic mouse refused to the seat); verify by hand.
- fis-build: only MoveToActiveSpace (or a temporary CanJoinAllSpaces) brings the window; activation otherwise switches the user back.
