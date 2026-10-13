---
title: "The rail is one Tab stop"
status: now
repos: [organizer]
branch: lf22-rail-roving
seat: rr-build
stage: one-window
updated: 2026-10-13
next: "review: lf22-rail-roving, gate met (V1, V2, X0), c4f0cd7"
depends_on: [lf21-hero-summary]
boundary: ["docs/specs/leftovers-22.md Boundary, lf22-rail-roving"]
spec: "docs/specs/leftovers-22.md (FR-5 to FR-7; tab-reaches-links, T3; initiatives-view A6 §3, I40)"
gate: "docs/specs/leftovers-22.md Acceptance, rows V1, V2 and X0"
ui_review: true
---

## Goal
Tab crosses the rail in one stop; Up and Down move inside it (0117; Aglaea, 3ce6af1).

## Gate
docs/specs/leftovers-22.md, rows V1, V2 and X0.
- [x] V1 (FR 5, 6): harness flag on, on init-a: Tab enters on init-a (tabindex 0, rest -1), Down, Down, Up lands on init-many, Return opens it, next Tab leaves the rows for Expand Asleep, then Initiatives ›, Expand Archived, then main content (Amendment 1); vitest Rail.roving.test.tsx, Places.test.tsx: .wt-notes/rr-build/v1-flag-on.txt
- [x] V2 (FR 7): vitest Rail.said.test.tsx (Home and initiative); AX of own review pid: one AXStaticText "1 now, 1 blocked, 11 next" on Home, "1 now, 1 blocked, 7 next" on init-a, no number items: .wt-notes/rr-build/ax-home.txt, ax-initiative.txt
- [x] X0: clean clone of c4f0cd7, make test (43 files, 550 tests), pnpm run build, wails build pass, porcelain empty: .wt-notes/rr-build/x0-*.log, x0-status.txt

## Done
- 2026-10-13 rr-build: rail rows one Tab stop with roving tabindex, pressHero's Home branch gone, hero counts one spoken line (5f69e1a, 494d610, c4f0cd7); gate V1, V2, X0 met; progress.md in .wt-notes/rr-build/.

## Notes
- V1's last step reads as Amendment 1 (sup59, thread 01M4TND4GWDZDHBZGRK0ZRPW3B): the fold controls stay ordinary stops after the rows.
- The harness window is never key, so :focus-visible never matches in it; it proves where focus goes, not the ring.
