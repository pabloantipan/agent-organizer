---
title: "The rail reads whole and walks as drawn"
status: now
repos: [organizer]
branch: lf25-rail
seat: rl-build
stage: one-window
updated: 2026-10-13
next: "review: lf25-rail, gate met (R1 R2 R3 R4 X0), 48914c1"
depends_on: []
boundary: ["docs/specs/leftovers-25.md Boundary, lf25-rail"]
spec: "docs/specs/leftovers-25.md (FR-6 to FR-9; tab-reaches-links Amendment 2, T13, T15-T17)"
gate: "docs/specs/leftovers-25.md Acceptance, rows R1, R2, R3, R4 and X0"
ui_review: true
review: pass
---

## Goal
The rail reads whole and walks as drawn (Aglaea, a5c30ed, from sup60's close).

## Gate
docs/specs/leftovers-25.md, rows R1, R2, R3, R4 and X0.
- [x] R1: vitest Rail.lf25.test.tsx; AX /Users/pabloantipan/organizer/.wt-notes/rl-build/ax-tree.txt (2 machines vitest only: no fixture initiative on two machines)
- [x] R2: harness /Users/pabloantipan/organizer/.wt-notes/rl-build/r2.jsonl (steps r2.txt)
- [x] R3: vitest Rail.lf25.test.tsx; harness 1024x640 /Users/pabloantipan/organizer/.wt-notes/rl-build/r3.jsonl (steps r3.txt)
- [x] R4: vitest Rail.lf25.test.tsx; AX /Users/pabloantipan/organizer/.wt-notes/rl-build/ax-rename.txt:40
- [x] X0: /Users/pabloantipan/organizer/.wt-notes/rl-build/x0-make-test.log, /Users/pabloantipan/organizer/.wt-notes/rl-build/x0-build.log (clean clone, porcelain empty)

## Done
- rl-build built FR-6 to FR-9 on lf25-rail (48914c1); gate met; progress in /Users/pabloantipan/organizer/.wt-notes/rl-build/progress.md.

## Notes
- At 1024x640 the fixture's lowest group sits mid-rail (folds below), so its menu opens down; the upward case was proved with the ⋯ scrolled to the rail's bottom edge.

## Review
Verdict: pass. R1, R2, R3, R4 and X0 met on 48914c1, all run from a fresh clone at that SHA (removed after), fixture, auth off.
- R1: vitest `Rail.lf25.test.tsx` R1 passes (cell in definition, 1 and 2 live agents, 2 machines, in that order; nothing that is not drawn; the strip gets the same name). AX on my own review build: `init-define … 0 next, cell in definition`, `init-a … 31 live agents`, plain rows unchanged (/Users/pabloantipan/organizer/.wt-notes/rl-review/ax-tree.txt:42-61). The fixture has no initiative on two machines, so `2 machines` is vitest only.
- R2: harness on my own wails dev (34120), 1440x900: rank 1 init-a, Up → `Daedalus` (last of four roles); last initiative init-c, Down → init-c (/Users/pabloantipan/organizer/.wt-notes/rl-review/r2.jsonl).
- R3: vitest R3 passes (first group: no Move up; last: no Move down; `menuPlace` both ways). Harness 1024x640, grouped by client: lowest group ccint as drawn (⋯ 437-461) opens down, menu 463-551, inside; scrolled so that ⋯ sits at the window's bottom (616-640) it opens up, menu 526-614, above the ⋯, inside 1024x640; items `Rename, Move up, Remove`, first group `Rename, Move down, Remove` (/Users/pabloantipan/organizer/.wt-notes/rl-review/r3.jsonl). The row expects "above the ⋯" for the lowest group, but as drawn on the fixture that group has 177 px below it, so FR-8 rightly opens it down; "above" needs the scroll. The row's premise does not hold on the fixture; FR-8 holds in both cases. Reported to sup61.
- R4: vitest R4 passes; AX of my own build: AXPress `Actions for acme`, then `Rename` → `AXTextField t="Rename acme"` (/Users/pabloantipan/organizer/.wt-notes/rl-review/ax-rename.txt:39).
- X0: `XDG_DATA_HOME=$(mktemp -d) make test` rc 0 (Go ok, vitest 592/592), `pnpm run build` rc 0, `wails build` rc 0, `git status --porcelain` empty (/Users/pabloantipan/organizer/.wt-notes/rl-review/x0-*.log).
Unmet: none. UI review: missing, so status and place stay as they are.
Reviewer rl-review, 2026-10-13, commit 48914c1a978b296767fb99a44f9cb9de04109ccf.

## UI review
Verdict: pass. Commit 48914c1a978b296767fb99a44f9cb9de04109ccf (branch did not move), my own detached worktree, fixture, auth off. Sev 4/3: none. Evidence in /Users/pabloantipan/organizer/.wt-notes/rl-ui/.

How each state was checked:
- R1 (FR-6, T13): AX of my own `Deltagos Review` (own pid): `init-define … 0 next, cell in definition`, `init-a … 25 live agents` (ungrouped, ax-tree.txt:37-46) and grouped at 1440 (ax-tree-grouped-1024.txt); rows with nothing extra drawn read as before; strip names from the harness (`s-rank1`). `2 machines`: vitest only (no fixture initiative on two machines). Shot wk-1440x900-R1-rail.png.
- R2 (FR-7, T15): harness, my wails dev on 34121, 1440x900 (r2.jsonl): rank 1 Up → Daedalus (last role), Up again → Ariadna, Down → Daedalus → rank 1; last initiative Down stays; first role Up stays; Roles closed: rank 1 Up stays; strip: rank 1 Up → Daedalus, last rank Down stays. Ring visible at every step.
- R3 (FR-8, T16): harness 1024x640, grouped (r3.jsonl): lowest group as drawn opens down, whole; at the rail's bottom edge, and half below the window then focused, opens up, menu 526-614 above the ⋯ 616-640, inside; first group `Rename, Move down, Remove`, last `Rename, Move up, Remove`, arrows walk only those. AX on the review app agrees (ax-ccint-menu.txt).
- R4 (FR-9, T17): AXPress `Actions for ccint` then `Rename` on my own pid: `AXTextField t="Rename ccint"`, focused (ax-rename.txt:62; shot wk-1440x900-R4-rename.png).
- vitest `src/components/Rail*` 36/36 (vitest-rail.log). X0: not rerun; the review build compiled, rl-review's X0 stands.

Findings:
- U1 (sev 1) The group menu can open upward with room below. Where: rail group ⋯ pressed while out of view (AXPress, a VoiceOver press); shot wk-1440x900-R3-ccint-menu-axpress.png. Evidence: `menuPlace` measures in the layout effect before the first item's focus scrolls the rail; harness case d: ⋯ at y 1077 when pressed, 437 after, 179 px below, menu `up` at 347-435; AX on the app: ccint menu up with ~280 px below. Keyboard (focus scrolls first) and pointer (a visible ⋯) never hit it. The menu is whole and works; it only covers the row above. Proposal: measure after the focus scroll (or scroll the ⋯ into view before measuring).

Spec gaps (for the FSE):
- G1 R3's "the lowest group's menu … above the ⋯" does not hold on the fixture at 1024x640: Asleep and Archived sit below the lowest group, so FR-8 rightly opens it down; the row needs "scrolled to the window's bottom" or a fixture whose last group ends the rail.
- G2 FR-6 says "only when drawn" and "both the full row and the strip": the strip draws no machines badge, yet says `n machines` (builder's reading, vitest pins it). True facts, said once more than drawn; decide which clause wins.
- G3 The task prompt's "X0 (FR-1 to FR-5)" names lf25-names' FRs; this card's are FR-6 to FR-9, which is what I checked.

For aglaea: none.

Not verified in WKWebView: `2 machines` on a real row (no fixture state; vitest only); auth firebase (not run, by rule).
Seen, outside this card: init-a's `25`–`31 live agents` counts stand-ins leaked from other seats' fixture homes (`organizer-fixture-probe-*` pids under other /private/tmp/organizer-fixture.* dirs, joined by family); the name says what the dot draws.
UI reviewer rl-ui, 2026-10-13.
