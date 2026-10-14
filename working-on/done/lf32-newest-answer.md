---
title: "The press's answer shows at once; repeats are said again; a dead confirm closes; focus never drops"
status: done
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
review: pass
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

## Review
nw-review, 2026-10-14, commit 1cb7c3822b5cd11c76839c5ddff8607fbd15001d (the branch did not move). Verdict: **pass**. Unmet rows: none.

All runs from a fresh clone at 1cb7c38 under `.wt-notes/nw-review/clean` (removed after); evidence in `.wt-notes/nw-review/`. Harness rows: my own `wails dev -devserver localhost:34198`, fixture exported, `auth: off`, `ORGANIZER_PROBE_BIN` = the probe stub (via the builder's stand-in wrapper), a fake `discuss-api`; Tab harness offscreen at 1024x640 with the builder's steps files copied. Diff: no Go file, no new service call; the race reads `CreateCrew`'s existing result (`startCrew`'s `none`). Changes stay inside the Boundary.

- N1 met: stale feed via the page's own `applyAgents` (fse off), Bring 1 up, Start: at once meta `3 seats · 3 live · 0 off`, no launch button, region `Every seat is already running`; after the next real feed the same, same meta node, 0 mutations; the stub log shows no probe call for the press (`out/n1n2.jsonl`). My first n1n2 run was a real launch, not the race, because fse was off in CreateCrew's scan (`out/n1n2-run1.jsonl`); the rerun with fse running is the one counted.
- N2 met: `liveRegion.test.ts` with fake timers reads `""`, `a`, `""`, `a`, and never calls rAF (`n-vitest.txt`); harness region timeline `[[1263,""],[3843,"Every…"],[12272,""],[12274,"Every…"]]`, so the second race empties and announces again.
- N3 met: confirm open with focus on Start, then `applyAgents` with fse live: confirm gone, words unchanged before it closed, focus `Attach fse`, the first seat's Attach (`out/n3.jsonl`).
- N4 met: vitest of `focusAfter` gives first Attach, second Attach, `Bring 3 up`, `Retire…`, never the body (`Crew.newest.test.tsx`, `n-vitest.txt`); harness: fse's stand-in killed by saved pid, Bring 1 up, fse shown off at `Seat up`, list closes by itself, focus `Bring 1 up` (`out/n4.jsonl`).
- X0 met: `XDG_DATA_HOME=$(mktemp -d) test-lease run --share -- make test` **reused** run `1da99a7e-41271` of 1cb7c3822b5c (nw-ui's), exit 0, Go ok, vitest 60 files / 703 tests (`x0-make-test.txt`); `pnpm run build` exit 0; `wails build` exit 0; `git status --porcelain` empty (`x0-status.txt`).

Not covered by the gate: N2 checks the text over time, not VoiceOver's speech (the gap is ~2 ms); FR-1's "names no seats" is the only branch that runs, since `CreateCrew` never returns seat names.

## UI review
nw-ui, 2026-10-14, all rows on 1cb7c38 (the branch did not move). Verdict: **pass**. No severity 4 or 3.

How checked: my own `wails dev -devserver localhost:34199` from a detached clone at 1cb7c38, fixture exported, auth off, `ORGANIZER_PROBE_BIN` = probe stub with stand-ins, a fake `discuss-api`; the Tab harness (offscreen WKWebView, 1024x640, links on) ran the builder's steps files copied to `.wt-notes/nw-ui/steps/` with snapshots added. Stale feed = the page's own `applyAgents` with a copy of the real feed where fse is off; the race's result is what `CreateCrew` already returns (diff: no Go file, no new service call). No AX and no review build were needed, so none was launched.

- N1 (L19) met: at once meta `3 seats · 3 live · 0 off`, no launch button, region `Every seat is already running`, focus `Attach po_ana`; after the next real feed the same, meta node kept, 0 mutations (`.wt-notes/nw-ui/out/n1n2.jsonl`, `wkwebview-1024x640-N1-confirm-stale.png`, `-N1-at-once.png`, `-N1-after-feed.png`).
- N2 (L20) met: `liveRegion.test.ts` (fake clock, `""`,`a`,`""`,`a`; never rAF); harness region timeline `[[1275,""],[3963,"Every…"],[12324,""],[12326,"Every…"]]`, race 2 empties and says it again. All four sr-only regions take the helper (Crew x2, AgentsView:255, InitiativesView:334); visible `tz-level` and `ic-line` untouched.
- N3 (L21) met: confirm open with focus on Start, `applyAgents` with fse live: confirm gone, words unchanged before, focus `Attach fse` (`out/n3.jsonl`, `-N3-confirm-open.png`, `-N3-confirm-closed.png`).
- N4 (L22) met: vitest `Crew.newest.test.tsx` covers the four cases plus never the body; harness: fse went off while `Seat up` was shown, the list closed by itself, focus `Bring 1 up` (`out/n4.jsonl`, `-N4-list-closed.png`). One `focusAfter` serves self-close, Close the list, the race and the dead confirm.
- X0: my shared run `XDG_DATA_HOME=$(mktemp -d) test-lease run --share -- make test` was **fresh**, run `1da99a7e-41271`, exit 0 (Go all ok, vitest 60 files / 703 tests); nw-review reused it. Clone clean before (`git status --porcelain` empty).

Findings (recorded, not failing):
- U1 (2) A seat assumed live by the press reads `idle` with `—` where Attach sits until the next feed (up to 10 s), so the lead cannot attach to it yet and focus skips it to the next seat's Attach. Where: crew block, fse row, `-N1-at-once.png`. Evidence: n1n2.jsonl `active: Attach po_ana`. Proposal: none needed if the 10 s gap is accepted; else say `starting…` or similar in place of `—` (for aglaea).
- U2 (2) When a feed closes the dead confirm (N3), the live region says nothing; a screen-reader user hears focus land on `Attach fse` with no reason the confirm went. Where: crew block. Evidence: n3.jsonl `live: ""` after the feed. Proposal: say `Every seat is already running` there too, through the helper (for aglaea; the spec does not ask it).

Spec gaps (for the FSE):
- The design system's rule says the region is "set on the next frame"; FR-2 says a task (`setTimeout`), never `requestAnimationFrame`. The code follows FR-2; the rule's wording should follow.
- FR-4 with no list (race, dead confirm) does not say which seats count as "listed"; the build uses every seat row. Reasonable, unwritten.

For aglaea:
- A1: the empty-then-text gap is ~2 ms in WKWebView. Whether VoiceOver reliably re-announces after so short a gap is unverified; many patterns use ~100 ms.
- A2: U1 and U2 above.

Not verified in WKWebView: VoiceOver's actual speech (only the region's text over time was read); widths other than 1024x640; a real (non-stand-in) seat; the race through a CLI `organizer crew` rather than the stale-feed fake.
