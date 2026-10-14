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
