---
title: "Ask <seat> on a Question or Blocked mark, and the thread it opened"
status: now
repos: [organizer]
branch: rv-ask-ui
seat: au-build
stage: review-map
updated: 2026-10-18
next: "decide: A5's premise is false: fixture-home.sh --review sets no discuss_state_dir, so the fixture cell posts to the real local mailbox; my A5 run posted one ask to organizer-fixture/fse (thread 01M57TKJC6HSEGBS46PQQV10YY). Run A5 with DISCUSS_STATE_DIR=$(mktemp -d) in my run-dev.sh, or fix the fixture, and close that thread or leave it?"
risk: medium
footprint: [frontend/src/components/ReviewSymbol.tsx, frontend/src/components/ReviewSymbol.test.tsx, frontend/src/lib/review.ts, frontend/src/lib/review.test.ts, frontend/src/styles/review.css, frontend/src/components/Review.tsx, frontend/src/components/Review.test.tsx, frontend/src/stores/board.store.ts (openSlack thread, review place), frontend/src/components/SlackView.tsx (← Review)]
depends_on: [rv-ask-data, rv-polish]
boundary: ["docs/specs/review-map.md v3 Boundary, rv-ask-ui"]
spec: "docs/specs/review-map.md (v3, FR-28, FR-29; docs/ux/specs/review-view.md §3.3 and Amendment 2)"
gate: "docs/specs/review-map.md v3 Acceptance, rows A4, A5 and X0; v3 Amendment 1 rows A6, A7; Amendment 2 row A8"
ui_review: true
---

## Goal
From the mark Pablo asks the card's supervisor and lands on the thread it opened.

## Gate
docs/specs/review-map.md v3, rows A4, A5 and X0.

## Declared changes

## Notes
- A5's premise ("fixture health, no mailbox") is false: the `--review` config names `canned_health` but no `discuss_state_dir`, so `discussStateDir` (internal/service/factory.go:119) uses the real `~/.local/state/discuss`, which has a token for `organizer-fixture/pablo`. My A5 run posted one ask: project `organizer-fixture`, to `fse`, thread `01M57TKJC6HSEGBS46PQQV10YY`, message `01M57TKJC6HSEGBS46PT5VTACG`. Nothing reached the `organizer` project. Detail: `.wt-notes/au-build/progress.md`.
- Code and vitest are in (e0dc71a, 60f74c3); A7 and A6 met in the harness; A5 and X0 wait on the answer.
