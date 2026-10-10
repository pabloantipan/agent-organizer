---
title: "The Help header's mark moves 4.5 s, then stops; named once"
status: done
repos: [organizer]
branch: lf15-help-mark
seat: lh-build
stage: one-window
updated: 2026-10-09
next: "none: reviewed, pass (lh-review)"
depends_on: []
boundary: ["the spec's Boundary for this card"]
spec: "docs/specs/leftovers-15.md (FR-11)"
gate: "docs/specs/leftovers-15.md Acceptance, rows H1 and X0"
ui_review: false
review: pass
---

## Goal
Leftovers from 2026-10-09's reviews (0111).

## Gate
docs/specs/leftovers-15.md, H1 and X0.
- [x] H1: vitest with fake timers; a headless check that the animation stops at 4.5 s; AX tree of the lockup — `.wt-notes/lh-build/h1-vitest.log`
- [x] X0: `XDG_DATA_HOME=$(mktemp -d) make test`, `cd frontend && npm run build`, `wails build` — `.wt-notes/lh-build/x0-make-test.log`, `x0-npm-build.log`, `x0-wails-build.log`

## Done
- 2026-10-09 lh-build: the mark moves 4.5 s, rests, hover plays 4.5 s more, never under Reduce motion; aria-hidden in the lockup (7add260); gate met from a clean clone.

## Notes
- The headless check is runMark under fake timers; the component's mount is not exercised (no jsdom in devDependencies). The frontend installs with pnpm, not npm ci.

## Review
- Verdict: pass. Unmet rows: none. Reviewer lh-review, 2026-10-09, commit 7add260253a7e43647c1e61b2dbbe89e238a2a78 (a fresh clone at that SHA, removed after; evidence in `.wt-notes/lh-review/`).
- H1, met. Vitest with fake timers: `DeltagosMark.test.tsx` 16/16 in the clean clone (`h1-vitest.log`), covering rest by 4.5 s, the hover replay, the hover restarting the count, Reduce motion, and the lockup's markup. The builder's evidence had no headless run and no real AX tree, so the reviewer ran both: the mounted `DeltagosLockup` in headless Chrome over CDP (`h1-headless.log`, `drive.mjs`, `h1-harness-main.tsx`). Frames stop 4535 ms after mount and nothing is painted after that; a hover at 7.8 s plays 271 frames, the last 4515 ms after the hover; with prefers-reduced-motion emulated, only the mount's still frame and nothing on hover. In the AX tree the svg is ignored, and "Deltagos" appears once, as StaticText of the wordmark.
- X0, met. `XDG_DATA_HOME=$(mktemp -d) test-lease run -- make test` passed: 16 Go packages ok, 424 vitest (`x0-make-test.log`). `npm install && npm run build` exited 0, and so did `wails build`.
- Diff inside the Boundary: `DeltagosMark.tsx` and its test only.
- Not covered: the headless check ran in Chromium, not WKWebView. A Reduce motion change while the mark shows has no test.
