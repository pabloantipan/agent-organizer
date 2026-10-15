---
title: "Focus ring violet-11 on every surface; busy twins tested; a sent thread that never shows lets go"
status: now
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
- Verdict: **pass**. Every row met on e0779e4ef48923c364436d4ebed8cda9313918ab (the branch had not moved), from a fresh clone at that SHA; notes in `.wt-notes/rt-review/`.
- R1: Tab harness (my own `wails dev` on :34212, fixture, auth off, 1024x640), `out/r1.jsonl`: outline-color rgb(192, 171, 254), 2px solid, :focus-visible true, on crew panel Bring 1 up 8.38:1 (`.crew` rgb(32,27,43)), card back Close 8.38:1, selected rail row strip 9.52:1 and expanded (inset) 7.45:1, busy Start (aria-disabled, Starting…) 8.38:1. Met.
- R2: my own scan of 66 `:focus`/`:focus-visible` rules in `frontend/src` (comments stripped, multi-line): 0 name `--accent`, `#8a3ffc` or `rgb(138`; the only `#8a3ffc` left is `--violet-9`. In WebKit `.gear.on` (A5) computes `rgb(138, 63, 252) 0 -2px 0 inset`, `--accent` #8a3ffc, the accent fill on Bring 1 up rgb(138, 63, 252), `--focus-ring` #c0abfe. Met.
- R3: `src/lib/tokens.test.ts` passes on the file and asserts exactly one drift on the `--fg`-changed copy; all eight `--busy-*` carry a source comment (read in tokens.css lines 197-204). Met.
- R4: `src/components/Conversation.sent.test.tsx` passes: real NewThread with a fake postToCell returning an id, timers faked to LIST_WAIT_MS: Send not busy on the remounted form, fields empty, region text exact, focus on the docked field, unchanged after the late listing, no "failed". `LIST_WAIT_MS = 20000` is defined once (`lib/listWait.ts`), Crew imports it. Met. (The test drives `sentWatch`/`letGoUnlisted`, not a mounted Conversation; the wiring is in the diff.)
- R5: `src/lib/agentFocus.dom.test.tsx` passes (list order owl, fox vs feed fox, owl; lands on owl's row, not index 1). Also in a real WebKit DOM: on init-a's Agents I moved the last row first and every one of 9 `li[data-agent]` was found by `agentTarget`+`agentRow` at its new index (`out/r2r5.jsonl`). Met.
- R6: harness `out/r6.jsonl`: Usage x 249 < memory 539 < Rescan 781; all 11 drawn `.ol-gem > i` and both `.ol-gem-key` compute `border-radius: 4px` (Amendment 1). TopBar.tsx unchanged. Met.
- X0: shared `make test` was **reused**: run 36a77df8-53433 of e0779e4ef489 by organizer-probe-rt-ui, exit 0 (all Go ok, vitest 66 files 741 tests); `pnpm run build` exit 0 and `make review-build` (wails build) exit 0 in my clone; `git status --porcelain` empty after. Met.
- Boundary and No-gos: diff touches only boundary files (AgentList is the agent row's component; TopBar.test is FR-5's test); no Go, Gate.tsx or lib/queue.ts; no color-mix, oklch or nesting; no new service call.
- Unmet rows: none.
- Gate note, not a failure: R2 and R6's order do not fail on main as the table's header claims (no focus rule named the accent on main; FR-5 was already met).
- Reviewer rt-review, 2026-10-15, commit e0779e4ef48923c364436d4ebed8cda9313918ab.

## UI review
- 2026-10-15 rt-ui, on e0779e4 (detached worktree `.wt/rt-ui`; the branch did not move during the review). **Verdict: fail**, one severity 3 against FR-1 / L30.
- **U1 (sev 3) the card back's comment field still draws focus in an accent derivative, not the ring.**
  - What the lead cannot do: tab into Comments on a card back (a drawer) and see that the field has focus; it changes only a 1px border from `--border` to `--border-accent`.
  - Where: card back, Comments field; `frontend/src/styles/global.css:755` `.comment-box textarea:focus { border-color: var(--border-accent); outline: none; }` overrides the global field rule (`global.css:55`, `border-color: var(--focus-ring)`). Shot: `.wt-notes/rt-ui/wkwebview-1024x640-r1x-cardback-comment-focused.png`.
  - Evidence: Tab harness in WKWebView, 1024×640, fixture, auth off (`.wt-notes/rt-ui/out/r1x.jsonl`): `:focus-visible` true, outline none, border `rgba(160, 110, 255, 0.45)` 1px → 2.03:1 on the drawer, 2.05:1 on the field's fill, 1.55:1 against its own unfocused border. A plain input in the same drawer computes `rgb(192, 171, 254)`. FR-1: "any rule drawing focus with the accent or a literal reads `--focus-ring`"; L30: "see focus on any surface". `--border-accent` is a literal rgba of the accent family, so R2's grep (`--accent`, `#8a3ffc`, `rgb(138`) passes while the rule is the one Amendment 9 measured failing 1.4.11.
  - Proposal: delete the `border-color` from `.comment-box textarea:focus` (global.css:55 then gives `--focus-ring`), or write `var(--focus-ring)`; inside the Boundary ("any stylesheet with a focus rule that does not read `--focus-ring`").
- Gate rows as I checked them:
  - R1 met (own `wails dev -devserver localhost:34213`, builder's steps copied to `.wt-notes/rt-ui/steps/`, `out/r1.jsonl`): `rgb(192, 171, 254)` 2px solid, `:focus-visible` on all; crew panel Bring 1 up 8.38, card back Close 8.38, selected rail row strip 9.52 / expanded (inset, on violet-3) 7.45, busy Start (aria-disabled) 8.38. The gate's four surfaces pass; U1 is a fifth control on the drawer surface.
  - R2 met as written: no `:focus`/`:focus-visible`/`:focus-within` block names `--accent`, `#8a3ffc` or `rgb(138` (`.wt-notes/rt-ui/r2-grep.txt`); in WKWebView the accent fill computes `rgb(138, 63, 252)` and Settings' `.gear.on` line `rgb(138, 63, 252) 0 -2px inset` (`out/r2a.jsonl`).
  - R3 met: `tokens.test.ts` passes, its `--fg`-changed copy fails with the exact drift line; all eight `--busy-*` carry a source comment.
  - R4 met in vitest (`Conversation.sent.test.tsx`): exact sentence, focus to the docked field, unchanged after the late listing, no "fail"; `LIST_WAIT_MS` is one export in `lib/listWait.ts`, imported by Crew and Conversation. The wiring in `Conversation` (sentWatch fed from `all`, `cleared` in both NewThread keys, live region outside the post gate) I read; the test drives the exported pieces, not the mounted component.
  - R5 met (`agentFocus.dom.test.tsx`): lands on `organizer-probe-owl#42` by `data-agent`, not the row at index 1.
  - R6 met (`out/r6.jsonl`): Usage 249 < memory 539 < Rescan 781; every `.ol-gem > i` and `.ol-gem-key` `4px` (`--radius-xs`). Review build AX at 1440 reads the same order.
  - X0: my run, **fresh**, test-lease run `36a77df8-53433` on e0779e4, rc 0 (Go ok, vitest 66 files / 741 tests); the code reviewer reused it. `make review-build` rc 0.
  - Diff: 13 files, all frontend, inside the Boundary; no Go, `Gate.tsx`, `lib/queue.ts`; no new service call; no `color-mix`/`oklch`/nesting.
- Spec gaps (for the FSE): R2's grep names three literal spellings, so a focus rule in an accent-derived token (`--border-accent`) or one that sets `border-color`/`box-shadow` instead of `outline` passes it; FR-1 means "reads `--focus-ring`", so R2 could check that every focus rule that draws colour reads it. R1's "pressed control" was read as the busy pressed Start (ring outset on `.crew`); no row measures a ring on `--surface-pressed` itself.
- For aglaea: none.
- Not verified: `screencapture -o -l` of the review app's window returned a blank white image (window not composited where the shot reads it; screen not locked per ioreg), so shots are the harness's WKWebView `takeSnapshot`s; FR-3 in a running app (needs a cell mailbox whose feed never lists a thread; vitest only); the other `outline: none` focus rules (`.r-row`, `.crew-seats li`, `.cell-search input` and kin) were not measured, pre-existing and outside this card's rows.
