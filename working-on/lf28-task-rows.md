---
title: "Over, stalled and unheard asks are Needs me rows"
status: now
repos: [organizer]
branch: lf28-task-rows
seat: tr-build
stage: one-window
updated: 2026-10-14
next: "review: lf28-task-rows, gate met (R1, R2, R3, X0), 7965886"
depends_on: [lf28-task-watch, lf27-launch-view]
boundary: ["docs/specs/leftovers-28.md Boundary, lf28-task-rows"]
spec: "docs/specs/leftovers-28.md (FR-5, FR-6)"
gate: "docs/specs/leftovers-28.md Acceptance, rows R1, R2, R3 and X0"
ui_review: true
review: pass
---

## Goal
Over, stalled and unheard asks are Needs me rows (agent-slack 0014, ruled 2026-10-14).

## Gate
docs/specs/leftovers-28.md, rows R1, R2, R3 and X0.
- [x] R1: .wt-notes/tr-build/r1.log
- [x] R2: .wt-notes/tr-build/r2-ax-needsme.txt, r2-needsme.png, r2-ax-agents.txt, r2-agents.png
- [x] R3: .wt-notes/tr-build/r3.log
- [x] X0: .wt-notes/tr-build/x0-make-test.log, x0-pnpm.log, x0-wails.log, x0-status.txt

## Done
- tr-build: task rows (over, stalled) and asker health on asks in Needs me, 0011 ruled 10 min back in the fixture; gate met on 7965886.

## Notes
- Home.tsx gained a `task` case in InboxRow and calls `threadContext`: a new row kind cannot render without it (the anatomy had its second line already).
- "twice its forecast" is said at any elapsed ≥ 2 × top (fixture: 10 m on 1-2m). Needs me is 16 with live discuss, 15 in fixture-home's count.

## Review
Pass: R1, R2, R3 and X0 met on 79658865fdf0b6fe2b073de005213dca88da86e8, from a fresh clone (removed after).
- R1: `vitest run src/lib/queue.test.ts -t "tasks over their forecast"`, 5 passed (.wt-notes/tr-review/r1.log). Rows only for over and stalled, one per task, FR-5's three wordings and the `sup64: <subject>: <first line>` second line asserted. The vitest does not assert the verb: Agents is read from the diff (Home.tsx `task` case, button Agents opening `openInitiative(id, "agents")`) and seen in R2.
- R2: review build (`make review-build`), fixture-home with auth off (0011 `forecast: 1-2m` ruled 12:48:50, w-task in now), app pid saved. AX after Show the other 11: row `stalled · init-a 0011 · Accept the task watch: stalled, 10 m, twice its forecast`, second line `record 0011 · w-task now · no post from its supervisor`, verb `Agents init-a 0011`; AXPress → crumb init-a, Agents tab `.on` (r2-ax-needsme.txt, r2-ax-agents.txt). screencapture returned a blank image, no screen access from this seat; the row rests on AX.
- R3: `-t "asks name the seat"`, 3 passed (r3.log): stale asker says `hestia is not picking up (<HEALTH.stale.label>): <HEALTH.stale.why>`, alive one does not.
- X0: make test, reused run 4199e382-13147 of 79658865fdf0 (organizer-probe-tr-ui), Go all ok, vitest 658 passed, exit 0; `pnpm run build` 0, `wails build` 0, `make review-build` 0; `git status --porcelain` empty.
- Unmet: none.
- Noted, not gated: Home.tsx gained a whole `task` case beyond "only the second line" (a new kind cannot render otherwise); Needs me counts 16 with live discuss against fixture-home's 15; "twice its forecast" is said at 5× the band too.
- Reviewer tr-review, 2026-10-14, commit 7965886.
