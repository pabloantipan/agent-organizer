---
title: "One word for alive seats; a busy button keeps focus; focus then words"
status: now
repos: [organizer]
branch: lf34-busy-focus
seat: bf-build
stage: one-window
updated: 2026-10-15
next: "review: lf34-busy-focus, gate met (F1-F4, X0), 87abf10"
depends_on: []
boundary: ["docs/specs/leftovers-34.md Boundary, lf34-busy-focus"]
spec: "docs/specs/leftovers-34.md (FR-1 to FR-3; launch-progress L24, L26, L27)"
gate: "docs/specs/leftovers-34.md Acceptance, rows F1, F2, F3, F4 and X0"
ui_review: true
review: pass
---

## Goal
An assumed-live seat reads idle; a busy button keeps focus and says what it is doing; focus moves before the reason is said (launch-progress Amendment 7).

## Gate
docs/specs/leftovers-34.md, rows F1, F2, F3, F4 and X0.

- [x] F1: at once (no feed since the press) and after the next feed, fse, po_ana, dev_bruno all read `idle` (`.wt-notes/bf-build/out/f1.jsonl`)
- [x] F2: helper and seven controls, aria-disabled, gerund, one call, focus kept (`.wt-notes/bf-build/out/f2-vitest.txt`)
- [x] F3: Start `Starting…` aria-disabled with focus, then the heading; 0 body samples (`.wt-notes/bf-build/out/f3.jsonl`)
- [x] F4: N3 and the race, focusin on `Attach fse` before the region's text (`.wt-notes/bf-build/out/f4.jsonl`, `out/f1.jsonl`)
- [x] X0: clean clone at 87abf10, make test, pnpm run build, wails build pass, status empty (`.wt-notes/bf-build/out/x0-*.txt`)

## Done
- 2026-10-15 bf-build: busy rule helper `lib/busy.ts` on Start, Draft the cell's Open, Rule, Retire, comment Save and both Sends; assumed seats read idle; feed-closed confirm moves focus before the words; branch lf34-busy-focus at 87abf10 (progress: `.wt-notes/bf-build/progress.md`).

## Notes
- "New agent's Open" read as Draft the cell's Open, the only Open/Opening… in AgentsView; New agent's own Start has no busy state (progress.md, Found, not asked).
- F2 runs without a DOM (no DOM library in package.json): server render with seeded state and a stand-in focus; F3 is the live check.
- F3's 20 ms interval stalls around the harness's key step; samples on every mutation and focusin cover it.

## Review
Verdict: pass. Every row met at 87abf10c9e4048e65aff190f26a528ae1b09283a; unmet: none. Evidence in `.wt-notes/bf-review/out/`.

- F1: Tab harness (builder's steps, my clean clone, my `wails dev` on 34202, fixture, auth off, probe stub via `ORGANIZER_PROBE_BIN`), N1 race: stale feed shows fse off, Start pressed, the real `CreateCrew` names fse running (Attach on `organizer-fixture-probe-fse`). At once, 0 feeds since the press: `fse:idle po_ana:idle dev_bruno:idle`; after the next real feed: the same (`out/f1.jsonl`). Met.
- F2: vitest, `lib/busy.test.ts` (props, a press while busy ignored, disabled kept when not busy) and `Busy.controls.test.tsx`, one test per control with a never-resolving fake call: Start, Open (Draft the cell), Rule, Retire, comment Save, the docked Send and the new-thread Start/Branch, each `aria-disabled="true"`, no `disabled`, the gerund, the call once. 24 passing (`out/f2-vitest.txt`). The diff passes the other reasons (`!ready`, no plan, empty body or subject) to `disabled`, tested for Send. Focus is a stand-in, since vitest here has no DOM; F3 is the live check. Met.
- F3: harness, fse off: keydown 3830 ms, Start `Starting…` aria-disabled with focus 3832, heading `Starting 1 seat…` 4061; 9 samples, 0 `body` (`out/f3.jsonl`). The 20 ms interval stalled from 3535 to 4061 around the key step, so samples between come from every mutation and focusin, which any focus loss would trigger. Met.
- F4: N3 (`out/f4.jsonl`): applyAgents with fse live 3730, focusin `Attach fse` 3740, region text 3842. Race (`out/f1.jsonl`): focusin `Attach fse` 4680, region text 4783. No `body` in either. Met.
- X0: fresh clone at 87abf10: `make test` exit 0 (16 Go packages ok, vitest 62 files / 721 tests), `pnpm run build` 0, `wails build` 0, `git status --porcelain` empty (`out/x0-*.txt`). Met.
- Boundary and No-gos: the diff touches only `lib/busy.ts` and its test, Crew, AgentsView, RuleDecisionBox, Retire, CardDrawer, Conversation, their tests and `global.css` (aria-disabled drawn as disabled). No Go, `Gate.tsx` or `lib/queue.ts`. No new service call.
- Spec naming: FR-2's "New agent's Open (`Opening…`)" names no control. New agent's own submit is `Start`, which still has no busy state (a second press can start a second seat). I judged it as Draft the cell's Open, the only `Opening…` in AgentsView.tsx. Raised to sup71.
- Shared test run: reused, run 89bc8959-43994 of 87abf10c9e40 (by organizer-probe-bf-ui).
- Reviewer bf-review, 2026-10-15, commit 87abf10.
