---
title: "The rail is one Tab stop"
status: done
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
review: pass
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

## UI review
rr-ui, 2026-10-13, on c4f0cd7 (every row checked there; the branch did not move). Verdict: **pass**. No severity 4 or 3.

How each state was checked (shots and logs in `.wt-notes/rr-ui/`):
- V1, flag on, in the offscreen harness (`harness/tab.swift`, `NSEvent`s through `sendEvent:` to its own never-key window) against my own `wails dev` on 34120, fixture, auth off. On init-a: Tab enters on init-a (init-a=0, rest -1); Down, Down, Up lands on init-many; Return opens it; the next Tabs go Expand Asleep, Initiatives ›, Expand Archived, then main (`v1-flag-on.txt`). Also from Home: enters on the first row, Shift-Tab leaves to the button before the rows, Tab comes back on the current row, the ends hold (`v1-extra-home.txt`). Grouped by client: still one row stop, Down crosses groups, Tab from a row goes to the next group's head (`v1-extra-grouped*.txt`).
- V2, AX of my own review build (pid saved): one AXStaticText `1 now, 1 blocked, 11 next` on Home and `1 now, 1 blocked, 7 next` on init-a, no number items; hero unchanged to the eye at 1440×900 and 1024×640 (`ax-*.txt`, `wkwebview-1440x900-V2-{home,initiative}.png`, `wkwebview-1024x640-V2-initiative.png`). vitest 550/550.

Findings (none fails the card):
- U1 (2) What: a keyboard and VoiceOver user on a row hears `1 init-a acme 1 1 7`: the row's counts are bare numbers, while the hero now says `now, blocked, next`. Where: every rail row, `Rail.tsx` `Counts`. Evidence: harness and AX row names. Proposal: the hero's treatment on the row (counts `aria-hidden`, one phrase). Not in FR-5–7; next task.
- U2 (2, spec gap) What: grouped, each group's head costs up to four stops (drag handle, chevron, rename, remove) and sits between the row groups; FR-5's "group headers before the rows" holds only for the first group. Where: grouped rail. Evidence: `v1-extra-grouped.txt`. Proposal: say whether group heads stay ordinary stops in DOM order (as built, and right for 2.4.3) or join a roving group of their own.
- U3 (1, spec gap) What: the collapsed strip still gives every initiative its own Tab stop (up to twenty). Where: `rail strip`. Proposal: decide if T3 covers the strip.
- U4 (1, pre-existing) Rename and remove group icons are named by `title` only (AX description, no name); Group by client and New group likewise.
- Seen, not this card: at 1024×640 the header's `target … goal` line touches the sub-view tabs (shot above).

For aglaea: U1, U2, U3.

Not verified in WKWebView: the row's focus ring (`outline-offset: -2px` over the global 2px `--focus-ring`): the harness window is never key and I may not focus the review app, so `:focus-visible` never matched; judged from CSS only. Space-to-lift drag by keyboard (read in code: the row returns on `defaultPrevented`). VoiceOver speech itself (AX tree only). `wails build` after `wails dev` skipped: the worktree was removed.

## Review
Verdict: **pass**. rr-review, 2026-10-13, commit c4f0cd762d60fa4153161b3553836705ff6632db (the branch did not move). Every run from a fresh clone at that SHA under `.wt-notes/rr-review/clean` (removed after); logs in `.wt-notes/rr-review/`.

- V1 (FR-5, 6): met. My copy of the builder's harness (activation prohibited, offscreen never-key window, `NSEvent`s via `sendEvent:`), against my own `wails dev` on 34118, fixture, auth off, flag on. On init-a: Tab enters on init-a (init-a=0, the other nine -1); Down, Down, Up lands on init-many with the 0 following; Return opens init-many; the next Tabs go Expand Asleep, Initiatives ›, Expand Archived, then main (`Roadmap, stage 2 of 3`), as Amendment 1 reads (`v1-flag-on.txt`). Since init-a is also the first row, a second run opened init-b first: Tab enters on init-b, not the first row (`v1-current-row.txt`). Diff: `pressHero(selectedInitiative, to)` has no Home branch (FR-6); vitest `Rail.roving.test.tsx` (tabindex 0/-1, entry, moves, ends) and `Places.test.tsx` pass in make test. `wails build` rerun after dev.
- V2 (FR-7): met. Diff: `.stats` `aria-hidden="true"`, one `.sr-only` span inside the hero, no `aria-label` on a div; `.rail-hero` positioned. vitest `Rail.said.test.tsx` (Home and initiative) passes. AX of my own review build (`make review-build`, pid saved, AXPress on that pid only): Home one AXStaticText `1 now, 1 blocked, 11 next` (the active rows' sums: 1, 1, 7+3+1), init-a `1 now, 1 blocked, 7 next`, no stat number items in the hero (`ax-home.txt`, `ax-initiative.txt`).
- X0: met. `XDG_DATA_HOME=$(mktemp -d) make test` (Go ok, vitest 43 files 550 tests), `pnpm run build`, `wails build` all exit 0 through test-lease; `git status --porcelain` empty (`x0-*.log`, `x0-status.txt`).

Unmet: none.

