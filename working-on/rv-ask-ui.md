---
title: "Ask <seat> on a Question or Blocked mark, and the thread it opened"
status: now
repos: [organizer]
branch: rv-ask-ui
seat: au-build
stage: review-map
updated: 2026-10-18
next: "review: rv-ask-ui, gate met (A4, A5, X0, A6, A7, A8), 60f74c3"
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
- [x] A4: vitest "A4 (FR-28, FR-29)" in `lib/review.test.ts`, `components/ReviewSymbol.test.tsx`, `components/Review.test.tsx`, `components/SlackView.review.test.tsx` (run: .wt-notes/au-build/x0-make-test.txt)
- [x] A5: harness 1024x640, .wt-notes/au-build/out/h-a5-1024x640.txt (`a5_after`), .wt-notes/au-build/out/a5-state.json, .wt-notes/au-build/out/a5-after.png
- [x] X0: clean clone at 60f74c3: .wt-notes/au-build/x0-make-test.txt, x0-pnpm-build.txt, x0-wails-build.txt, x0-porcelain.txt (empty), x0-head.txt
- [x] A6: vitest "A6 (FR-38)" in the three review test files; also in WK, .wt-notes/au-build/out/h-a-rows-1024x640.txt (`a6_after`)
- [x] A7: harness 1024x640, .wt-notes/au-build/out/h-a5-1024x640.txt (`a7_row`: name 58, muted flag text 58), .wt-notes/au-build/out/a7-flags.png
- [x] A8: vitest "A8 (FR-40)" in `lib/review.test.ts`, `components/ReviewSymbol.test.tsx`, `components/Review.test.tsx`

## Declared changes
- modified `frontend/src/lib/review.ts`: `askLine`, `askedLine`, `askFailedLine`, `firstLine`, `saidAfter`, `lastToReview`, `Addressee`, `Via`; `primaryOf` asks and drops `, next` on the last; `affectedLine` takes the list; `Row.asked`, `marksOf`, `rowName`; WORDS.v3 replaced
- modified `frontend/src/components/ReviewSymbol.tsx`: the ask (`AskReview`), `markPress`, `AskStatus`, links say their list
- modified `frontend/src/components/Review.tsx`: `ReviewAddressee`, the asked row, the live region (`saidAfter`), `via`, `last`, Open the thread, focus on return
- modified `frontend/src/stores/board.store.ts`: `openSlack` with a thread, `reviewBack`, `backToReview`, `leaveReview` drops `reviewBack`
- modified `frontend/src/components/SlackView.tsx`: `ReviewBack` (`← Review`) in the toolbar
- modified `frontend/src/styles/review.css`: `.rv-asked`, `.rs-ask-line`, `.rs-asked`, `.rv-flag.muted` padding
- modified `frontend/src/lib/review.test.ts`, `frontend/src/components/ReviewSymbol.test.tsx`, `frontend/src/components/Review.test.tsx`: A4, A6, A7, A8
- added `frontend/src/components/SlackView.review.test.tsx`: the store round trip and `← Review` (A4)
Risky:
- `leaveReview`: every navigation naming a screen now also drops `reviewBack`
- `openSlack`: a thread not yet in the 10 s feed lands Conversations on the archive (Conversation.tsx's draft handler, unchanged)
Not changed, on purpose:
- any Go, `app.go`, `frontend/wailsjs/`: the bindings sufficed
- `Conversation.tsx`: the existing `slackDraft.threadId` landing is used as is

## Notes
- Harness runs set `discuss_state_dir: <an empty mktemp -d>` in the fixture's config from my own `run-dev.sh` (sup82, thread 01M57TR1): the `--review` fixture names none, so the app used the real token registry. With it every post fails before connecting (`open …/tokens.json: no such file or directory`), which is the spec's "no mailbox". Confirmed by the FSE as review-map v3 Amendment 3.
- Before that, A5's premise ("fixture health, no mailbox") was false: the `--review` config names `canned_health` but no `discuss_state_dir`, so `discussStateDir` (internal/service/factory.go:119) uses the real `~/.local/state/discuss`, which has a token for `organizer-fixture/pablo`. My A5 run posted one ask: project `organizer-fixture`, to `fse`, thread `01M57TKJC6HSEGBS46PQQV10YY`, message `01M57TKJC6HSEGBS46PT5VTACG`. Nothing reached the `organizer` project. Detail: `.wt-notes/au-build/progress.md`.
- Thread 01M57TKJC6HSEGBS46PQQV10YY (organizer-fixture, to fse, from the first A5 run) is left as it is, as sup82 asked; sup82 reports it and the fixture gap to the FSE.

## Done
- 2026-10-18 au-build: FR-28, FR-29, FR-38, FR-40 (e0dc71a) and FR-39 (60f74c3) on rv-ask-ui; gate A4, A5, X0, A6, A7, A8 met; notes `.wt-notes/au-build/progress.md`.
