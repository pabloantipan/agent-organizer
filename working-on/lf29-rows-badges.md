---
title: "Failures dated, task rows read late not stuck, deaf and capped show their count"
status: now
repos: [organizer]
branch: lf29-rows-badges
seat: rb-build
stage: one-window
updated: 2026-10-14
next: "review: lf29-rows-badges, gate met (B2 AX replaced by offscreen DOM: screen locked), 9b107f0"
depends_on: [lf28-task-rows]
boundary: ["docs/specs/leftovers-29.md Boundary, lf29-rows-badges"]
spec: "docs/specs/leftovers-29.md (FR-5 to FR-8; launch-progress L11, L12; task-rows N1-N5)"
gate: "docs/specs/leftovers-29.md Acceptance, rows B1, B2, B3, B4 and X0"
ui_review: true
---

## Goal
Failures dated in Needs me; deaf and capped show their count (launch-progress Amendment 1, 8c1b167).

## Gate
docs/specs/leftovers-29.md, rows B1, B2, B3, B4 and X0.
- [x] B1: vitest, unseen failure dated 12:05 between 11:00 and 13:00 (.wt-notes/rb-build/out/vitest-b1-b4.log)
- [x] B3: vitest, capped asker with alive watcher reads `capped, mail waits for its next prompt`; stale one "not picking up" (.wt-notes/rb-build/out/vitest-b1-b4.log)
- [x] B4: vitest N1-N4 (.wt-notes/rb-build/out/vitest-b1-b4.log); harness 1024x640, 60-char title, rail open: lozenge `lz warning` amber and fact whole, title cut (out/b4-shot.jsonl, out/b4-1024x640.png); Return with live supervisor focuses sup10's row, highlighted, named `Agents, supervisor of 0011` (out/b4-return-sup.jsonl, .png); without, Open focuses the card back's title in Work (out/b4-return-none.jsonl, .png)
- [x] B2: vitest (out/vitest-b1-b4.log); AX impossible, screen locked (out/b2-ax-attempt.txt), so offscreen harness DOM: `deaf · 3 waiting` / `capped · 3 waiting`, descriptions `3 messages waiting` (out/b2.jsonl, out/b2-capped.jsonl, out/b2-people-capped.png)
- [x] X0: clean clone at 9b107f0, make test, pnpm run build, wails build pass, porcelain empty (out/x0-summary.txt, out/x0-*.log)

## Notes
- The launch feed has no failure time; the row is dated by the last failed seat's last try start (`started_at`), `now` if none. Exact needs a Go `failed_at`.
- The person badge is drawn in SlackView; `WatcherBadge` (ContextBar.tsx, Crew, AgentList) still hides the deaf count.
- Agents landing: a later feed draw grows rows above the landed one after ~4 s and it drifts below the fold (no scroll anchoring in WebKit).

## Done
- 2026-10-14 rb-build: B1-B4 and X0 met on lf29-rows-badges (96abc83, 28565d1, 9b107f0); progress and repro in .wt-notes/rb-build/progress.md.

## UI review
rb-ui, 2026-10-14, on 9b107f0 (branch did not move). **Verdict: pass.** No sev 4 or 3.

How each row was checked (notes and shots in `.wt-notes/rb-ui/`):
- X0: `XDG_DATA_HOME=$(mktemp -d) test-lease run --share -- make test` in a clean detached clone: **fresh** run, key e99803528dbe36ca7ac7a23f71838bfb, rc 0 (Go ok, vitest 670/670); rb-review waited on it and replays it (out of x0-make-test.log).
- B1, B3: vitest only (out/vitest-b1-b4.log); Home's start row uses the shared age column, so its date draws.
- B4: vitest N1-N4 pass; my own harness on my own `wails dev` (34181, fixture, auth off, 60-char title): at 1024×640 rail open, `lz warning` #ffb020, lozenge and `10 m, 5× its forecast` whole, title cut (426 of 571 px), hover `forecast 1-2 m` (wkwebview-1024x640-B4-stalled-row.png). Return with sup10 live: Agents, row focused, `memory-landed`, ring on; still in view at 2, 6 and 12 s (the drift is fixed). Without: verb is `Open`, Return lands on the card back's H2 `Task watch card` in Work, ring visible (…-B4-return-supervisor-12s.png, …-B4-return-open.png).
- B2: AX impossible, screen locked (`CGSSessionScreenIsLocked` true; ax.swift recurses on AXApplication, `screencapture -l` cannot create an image: out/b2-ax-attempt.txt). Harness DOM at 1280×800: `deaf · 3 waiting` (#ff4d63) and `capped · 3 waiting` (#d946ef), described `session live, mail deaf|capped, 3 messages waiting` (…-B2-people-capped.png).

Findings:
1. **R1 (sev 2)** The lead cannot see the waiting count everywhere a deaf seat shows. Where: Agents rows and the Crew block (`WatcherBadge`, ContextBar.tsx) still draw `deaf` with no count, while People draws `deaf · 3 waiting`. Evidence: code, and the builder's note. Inside the spec's words ("a person's badges"), outside the boundary, so not a fail. Proposal: move the rule into `WatcherBadge` and drop `PersonBadge`, one small card.
2. **R2 (sev 1)** A failed start is dated by its last try's start, not by the failure, so up to a minute early. Evidence: `lastFailure` in queue.ts. Proposal: a Go `failed_at` on the seat (spec gap below).

Spec gaps (for the FSE): the launch feed has no failure time (FR-5 says "the last failure's time"); FR-6's "person" does not say whether Agents and Crew count as one.

For aglaea: A1, `stalled` and `unreadable` draw the same amber lozenge one row apart in Needs me (wkwebview-1024x640-B4-stalled-row.png): is a late task the same kind of thing as an unread file? A2, the Agents landing scrolls `block: nearest`, so at 1024×640 the landed row sits flush on the bottom edge; is centre better?

Not verified in WKWebView: B1's dated start row on screen (it needs a failed crew launch); B3's capped ask row on screen (no fixture thread asks pablo from a capped seat); every AX row (screen locked). The worktree was removed after `wails dev` without a second `wails build`, since nothing launches from it again.
