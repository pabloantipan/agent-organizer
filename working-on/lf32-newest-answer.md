---
title: "The press's answer shows at once; repeats are said again; a dead confirm closes; focus never drops"
status: now
repos: [organizer]
branch: lf32-newest-answer
seat: nw-build
stage: one-window
updated: 2026-10-14
next: "review: nw-review and nw-ui on 1cb7c38 (sup69, 2026-10-14)"
depends_on: []
boundary: ["docs/specs/leftovers-32.md Boundary, lf32-newest-answer"]
spec: "docs/specs/leftovers-32.md (FR-1 to FR-4; launch-progress L19-L22)"
gate: "docs/specs/leftovers-32.md Acceptance, rows N1, N2, N3, N4 and X0"
ui_review: true
---

## Goal
The press's answer shows at once; a repeated message is said again; a confirm that cannot act closes; focus never drops to the body (launch-progress Amendment 5).

## Gate
docs/specs/leftovers-32.md, rows N1, N2, N3, N4 and X0.

- [x] N1: .wt-notes/nw-build/out/n1n2.jsonl (at once and after the next real feed: `0 off`, no launch button, `Every seat is already running`, 0 meta mutations)
- [x] N2: .wt-notes/nw-build/out/n-vitest.txt (liveRegion.test.ts); .wt-notes/nw-build/out/n1n2.jsonl region timeline (race 2: `""` at 12247 ms, text at 12249 ms)
- [x] N3: .wt-notes/nw-build/out/n3.jsonl (confirm gone, focus `Attach fse`)
- [x] N4: .wt-notes/nw-build/out/n-vitest.txt (Crew.newest.test.tsx, four cases plus never the body); .wt-notes/nw-build/out/n4.jsonl (list closed with fse off: focus `Bring 1 up`)
- [x] X0: .wt-notes/nw-build/out/x0-make-test.txt, x0-pnpm-build.txt, x0-wails-build.txt, x0-status.txt (empty), clean clone at 2f392db; head 1cb7c38 is the same code (x0-rebase-same-code.txt)

## Done
- 2026-10-14 nw-build: lib/liveRegion helper in every sr-only region, the press's answer at once, the dead confirm closes, `focusAfter` for every leave; harness N1-N4 at 1024x640 with the probe stub, stale feed via the page's own `applyAgents` (.wt-notes/nw-build/progress.md)

## Notes
- The first N2 harness run showed a 0 ms timer queued at once batching with the empty text in WKWebView, so race 2 said nothing; the hook now queues the timer after the empty text commits.
- Cancel and Escape on the confirm still return focus to the opener; FR-4's "the confirm's close" is read as FR-3's close.
