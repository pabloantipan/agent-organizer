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

## UI review
tr-ui, 2026-10-14, on 79658865 (7965886) throughout. **Verdict: pass** (no sev 4 or 3).

Checked: R2 in the review build (`make review-build`, fixture-home, auth off, 1440×900 window): AX read of Needs me after AXPress "Show the other 11": row `stalled` · `init-a 0011 · Accept the task watch: stalled, 10 m, twice its forecast`, second line `record 0011 · w-task now · no post from its supervisor`, dated `10m`, verb `Agents init-a 0011` (accessible name carries the row); AXPress on it lands on init-a, Agents tab `.on`. Shots: `.wt-notes/tr-ui/wk-1440x900-r2-needsme-stalled.png`, `wk-1440x900-r2-agents-landed.png`; AX in `ax-needsme.txt`, `ax-agents.txt`. R1, R3: the branch's vitest (in the X0 run) plus reading `queue.ts`/`Home.tsx`. X0: `make test` **fresh**, test-lease run 4199e382-13147, rc 0, 658 vitest, Go ok (tr-review reused it); worktree `git status --porcelain` empty after it and after `make review-build`.

Findings (none fails):
- U1 (2) A capped asker is called "not picking up". Where: `threadContext` in `lib/queue.ts` (from code, no capped asker in the fixture). Evidence: `healthState` returns `capped` even when the watcher is alive, so the row reads `<seat> is not picking up (capped): Alive and posting, …`; FR-6 says the line appears when the watcher is not alive, and `HEALTH.capped.blocker` is "capped, mail waits for its next prompt". The lead may restart a seat that will get the answer. Proposal: use `HEALTH[state].blocker` after the seat name (deaf already reads "not picking up"), or skip capped when the watcher is alive.
- U2 (1) "twice its forecast" said at 5×. Where: the R2 row (10 m on 1-2m). Evidence: shot above. The spec's words, kept by the builder. Proposal: "past twice its forecast" or "N× its forecast"; spec gap below.
- U3 (2) Agents lands with nothing about the task. Where: `wk-1440x900-r2-agents-landed.png`. Evidence: the Agents view names no record 0011, no w-task, no seat of the task; focus stays on the web area. The lead must find the task's seats unaided. Proposal: land on the task's seat or card (as `openAgentsAt` does for seats); spec gap.
- U4 (1) The fact sits at the end of a single-line, ellipsized subject/context (`.ib-subject`, `.ib-context` nowrap). At 1024 a long title or the stale-asker line ("… · hestia is not picking up (stale): Its wake watcher …") can cut the words that matter; the lozenge still says stalled/over, the title attribute holds the full context. Not seen: no resize done.

Spec gaps for the FSE: "twice its forecast" at any multiple ≥ 2 (U2); what Agents shows on a task landing (U3); FR-6 vs capped (U1); fixture-home's "15" vs the 16 a review build shows with live discuss (one row from the live mailbox, not this card); the boundary allowed Home.tsx only for a second line, but a new row kind needs its `task` case to render at all.

For aglaea: stalled uses the danger (blocked red) lozenge, as escalated does; is red right for "late" rather than "stopped"? Over uses tone.

Not verified in WKWebView: the over and on states (vitest only; reachable by editing 0011's forecast, not done), a stale/deaf/capped asker row (canned health has none asking pablo; vitest R3 and code), 1024×640 (no AX resize, rules allow reads and AXPress only), keyboard/focus order.
