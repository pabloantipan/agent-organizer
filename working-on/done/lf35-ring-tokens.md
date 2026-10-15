---
title: "Focus ring violet-11 on every surface; busy twins tested; a sent thread that never shows lets go"
status: done
repos: [organizer]
branch: lf35-ring-tokens
seat: rt-build
stage: one-window
updated: 2026-10-15
next: "review: lf35-ring-tokens, gate met (R1-R6, X0; U1 fixed), cae9f2b"
depends_on: []
boundary: ["docs/specs/leftovers-35.md Boundary, lf35-ring-tokens"]
spec: "docs/specs/leftovers-35.md (FR-1 to FR-6; launch-progress L29, L30)"
gate: "docs/specs/leftovers-35.md Acceptance, rows R1, R2, R3, R4, R5, R6 and X0"
ui_review: true
review: pass
---

## Goal
Focus is visible on every surface, a busy colour follows its role, and a sent thread the feed never lists stops leaving Send busy (launch-progress Amendment 9, U5).

## Gate
docs/specs/leftovers-35.md, rows R1, R2, R3, R4, R5, R6 and X0.
- [x] R1: outline-color rgb(192, 171, 254) on crew panel 8.38, card back 8.38, selected rail row 9.52 (strip) / 7.45 (expanded), busy Start (aria-disabled) 8.38; `.wt-notes/rt-build/out/r1.jsonl`, `progress.md`
- [x] R2: 0 focus rules naming --accent, #8a3ffc or rgb(138; `.gear.on` keeps --accent; `.wt-notes/rt-build/r2-grep.txt`
- [x] R3: `src/lib/tokens.test.ts` passes on the file, fails on the --fg copy; `.wt-notes/rt-build/out/r3-r4-r5-vitest.txt`
- [x] R4: `src/components/Conversation.sent.test.tsx`; same file
- [x] R5: `src/lib/agentFocus.dom.test.tsx`; same file
- [x] R6: Usage 249 < memory 539 < Rescan 781 (FR-5 met on main, unchanged); every `.ol-gem > i` and `.ol-gem-key` 4px (Amendment 1); `.wt-notes/rt-build/out/r6.jsonl`
- [x] X0: clean clone, make test, pnpm run build, wails build pass, porcelain empty; `.wt-notes/rt-build/out/x0.log`
- [x] R1 (Amendment 2, fifth surface): card back Comments field reached by Tab, `:focus-visible`, border-color rgb(192, 171, 254) 1px (fields draw focus as a border, outline none) 8.38 on the drawer, 9.52 on its fill; the four others re-run on cae9f2b unchanged; `.wt-notes/rt-build/out/r1x.jsonl`, `out/r1.jsonl`
- [x] R2 (Amendment 2): 0 focus rules naming `--border-accent`, `--accent*`, #8a3ffc or rgb(a)(138,63; 17 pre-existing `outline: none` focus rules, each drawing `--focus-ring` another way (15 by a same-selector `:focus-visible`, `.cell-search input` by `.cell-search:focus-within`, `.tz-frame` by `.tz-wrap.ring::after`), none drawing nothing, so none changed; read as met (sup72 and the FSE, 2026-10-15). Each rule and what draws its ring: `.crew-seats li`, `.inbox > button.ib-more`, `.ivw-head h1`, `.ic-note`, `.launch-head`, `.memory-pop`, `.agents li.memory-landed`, `.fl-memory-row`, `.ol-label`, `.roles-sec .sec-toggle`, `.r-row`, `.rd-init`, `.agents li.role-landed`, `.rb-title`, `.home .sec-title` → own `:focus-visible { outline: 2px solid var(--focus-ring) }`; `.cell-search input` → `.cell-search:focus-within` outline `--focus-ring`; `.tz-frame` → `.tz-wrap.ring::after` border `--focus-ring`; `.wt-notes/rt-build/r2-amended.txt`, `focus-grep2.mjs`
- [x] X0 on cae9f2b: clean clone, make test (vitest 66 files, 741 tests), pnpm run build, wails build rc 0, porcelain empty; `.wt-notes/rt-build/out/x0.log`

## Done
- 2026-10-15 rt-build: ring violet-11, busy twins tested, sent-unlisted lets Send go, Agents › by key, gem 4px; commits 74d264f 65fff17 77953ca 3004db3 e6ee99f; after Amendment 1 the `.srm-gem` change reverted (1919794) and the live gem and key at 4px (e0779e4).
- 2026-10-15 rt-build: U1 fixed, rebased on bb77b0c: `.comment-box textarea:focus` names `var(--focus-ring)` (deleting it was not enough: `.comment-box textarea`'s own border outranks `input, textarea:focus`); cae9f2b.

## Notes
- 2026-10-15 rt-build: FR-5 was already met on main; `.srm-gem` is dead CSS, so Amendment 1 (dbb77a7) moved FR-6 to outline.css. TopBar.test's fixture email was red on main; fixed (3004db3).
- 2026-10-15 rt-build: R1's fifth surface is a field, and fields draw focus as a 1px `--focus-ring` border with outline none (`input, textarea:focus`), so it is measured by border-color (the property that draws it), not outline-color; sup72 and the FSE agreed. R2 as amended, read literally, flags the 17 `outline: none` rules that draw the ring in a sibling rule; read as met (sup72).
- 2026-10-15: run by sup72 (organizer-probe-sup72), spawned by the FSE after 0133.

## Review
- Verdict: **pass**, round 2. Every row met on cae9f2b6255e6cd5db7e9e985ff457098f4b8ac8 (branch moved from e0779e4: rebased on main, plus the U1 fix in global.css), from a fresh clone at that SHA; spec read with Amendments 1 and 2 (bb77b0c); notes in `.wt-notes/rt-review/`.
- R1 (five surfaces): Tab harness, my own `wails dev` on :34212 (vite :5174, mine), fixture, auth off, 1024x640, `out/r1.jsonl`, `out/r1c.jsonl`. Outline rgb(192, 171, 254) 2px solid, :focus-visible true: crew panel Bring 1 up 8.38:1 on `.crew` rgb(32,27,43); card back Close 8.38:1; selected rail row strip 9.52:1, expanded (inset) 7.45:1; busy Start (aria-disabled, Starting…) 8.38:1. Fifth, the card back's Comments field reached by Tab from the control before it: `.comment-box textarea`, :focus-visible true, border-color rgb(192, 171, 254) (measured on border, as every field is), 8.38:1 on the drawer, 9.52:1 on its own fill. Met.
- R2 (Amendment 2): my own scan of the 61 `:focus`/`:focus-visible`/`:focus-within` rules in `frontend/src` (comments stripped, multi-line): 0 name `--accent`, `--border-accent`, any `--accent-*`, `#8a3ffc` or `rgb(138`. 17 set `outline: none` without `--focus-ring` in the same block; each draws `--focus-ring` by another rule (checked per selector, e.g. `.cell-search:focus-within`, `.tz-wrap.ring::after`) and none is in this diff, so none is this round's (the FSE's reading, 01M503K7). The comment rule this card touches now reads `--focus-ring`. In WebKit `.gear.on` (A5) `rgb(138, 63, 252) 0 -2px 0 inset`, the accent fill rgb(138, 63, 252), `--accent` #8a3ffc, `--focus-ring` #c0abfe. Met.
- R3: `src/lib/tokens.test.ts` passes, asserts exactly one drift on the `--fg`-changed copy; all eight `--busy-*` carry a source comment. Met.
- R4: `src/components/Conversation.sent.test.tsx` passes (Send not busy, form cleared, exact region text, focus on the docked field, unchanged after the late listing, no "failed"); `LIST_WAIT_MS` is defined once in `lib/listWait.ts`. Met. The test drives the exported pieces, not a mounted Conversation; the wiring is in the diff.
- R5: `src/lib/agentFocus.dom.test.tsx` passes; in a real WebKit DOM, with init-a's last Agents row moved first, all 9 `li[data-agent]` were found by key at their new index (`out/r2r5.jsonl`). Met.
- R6: Usage x 249 < memory 551 < Rescan 781; all 11 drawn `.ol-gem > i` and both `.ol-gem-key` `border-radius: 4px` (`out/r6.jsonl`). TopBar.tsx unchanged. Met.
- X0: shared `make test` **reused**: run 807d64a2-3894 of cae9f2b6255e by organizer-probe-rt-ui, exit 0 (16 Go packages ok, vitest 66 files 741 tests). In my clone `pnpm run build` exit 0, `make review-build` (wails build) exit 0, `git status --porcelain` empty. Met.
- Boundary and No-gos: 14 frontend files, all inside the Boundary (global.css as a stylesheet with a focus rule not reading `--focus-ring`); no Go, `Gate.tsx` or `lib/queue.ts`; no color-mix, oklch or nesting; no new service call.
- Unmet rows: none.
- Reviewer rt-review, 2026-10-15, commit cae9f2b6255e6cd5db7e9e985ff457098f4b8ac8.

## UI review
- 2026-10-15 rt-ui, round 2, on cae9f2b (fresh detached worktree `.wt/rt-ui`; spec read with Amendment 2, bb77b0c). **Verdict: pass**, no severity 4 or 3.
- Round 1 (e0779e4) failed on U1 (sev 3): the card back's Comments field drew focus with `--border-accent`, 2.03:1 on the drawer. **U1 fixed**: `global.css:756` now reads `.comment-box textarea:focus { border-color: var(--focus-ring); outline: none; }`; nothing else in the code changed since e0779e4.
- Gate rows, all checked on cae9f2b:
  - R1 met, five surfaces (own `wails dev -devserver localhost:34213`, fixture, auth off, Tab harness at 1024×640, `.wt-notes/rt-ui/out2/r1.jsonl`, `out2/r1x.jsonl`): crew panel Bring 1 up 8.38, card back Close 8.38, selected rail row strip 9.52 / expanded (inset, on violet-3) 7.45, busy Start (aria-disabled) 8.38, each outline `rgb(192, 171, 254)` 2px solid with `:focus-visible`; Comments field (Tab, focus-visible) border `rgb(192, 171, 254)` 1px, 8.38:1 on the drawer, 9.52:1 on its fill. Shots `.wt-notes/rt-ui/wkwebview-1024x640-cae9f2b-r1*.png`.
  - R2 met as amended (`.wt-notes/rt-ui/r2-grep-r2.txt`): no `:focus`/`:focus-visible`/`:focus-within` rule names `--accent`, `--accent-*`, `--border-accent`, `#8a3ffc` or `rgb(138`; the 17 pre-existing `outline: none` rules without the ring in the same rule are the ones the FSE confirmed draw `--focus-ring` by another rule (not this round's). In WKWebView the accent fill computes `rgb(138, 63, 252)` and Settings' `.gear.on` line `rgb(138, 63, 252) 0 -2px inset` (`out2/r2a.jsonl`).
  - R3 met: `tokens.test.ts` passes, its `--fg`-changed copy fails with the drift line; all eight `--busy-*` carry a source comment.
  - R4 met in vitest (`Conversation.sent.test.tsx`): exact sentence, focus to the docked field, unchanged after the late listing, no "fail"; `LIST_WAIT_MS` one export (`lib/listWait.ts`) imported by Crew and Conversation. The test drives the exported pieces (`sentWatch`, `letGoUnlisted`); the mounted wiring I read.
  - R5 met (`agentFocus.dom.test.tsx`): lands by `data-agent` key on `organizer-probe-owl#42`, not the row at index 1.
  - R6 met (`out2/r6.jsonl`): Usage 249 < memory 539 < Rescan 781; all 13 `.ol-gem > i` and `.ol-gem-key` `4px`.
  - X0: my run, **fresh**, test-lease run `807d64a2-3894` on cae9f2b, rc 0 (16 Go packages ok, vitest 66 files / 741 tests); the code reviewer reused it. `make review-build` rc 0.
  - Diff from main: frontend only, inside the Boundary; no Go, `Gate.tsx`, `lib/queue.ts`; no new service call; no `color-mix`/`oklch`/nesting.
- Spec gaps (for the FSE): R1's "pressed control" is the busy pressed Start (ring outset on `.crew`); no row measures a ring on `--surface-pressed` itself (violet-11 there is 6.3:1 by Amendment 9's numbers, so a later row, not a risk).
- For aglaea: none.
- Not verified: FR-3 in a running app (needs a cell mailbox whose feed never lists a thread; vitest only); round 1's `screencapture -o -l` of the review app came back blank, so shots are the harness's WKWebView `takeSnapshot`s and I did not relaunch the review app this round.
