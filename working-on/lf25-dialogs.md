---
title: "An open card holds Tab; the drawer's list has no commas"
status: now
repos: [organizer]
branch: lf25-dialogs
seat: dg-build
stage: one-window
updated: 2026-10-13
next: "review: lf25-dialogs, gate met (D1, D2, X0), d5c8246"
depends_on: []
boundary: ["docs/specs/leftovers-25.md Boundary, lf25-dialogs"]
spec: "docs/specs/leftovers-25.md (FR-10, FR-11; tab-reaches-links Amendment 2, T18, T20)"
gate: "docs/specs/leftovers-25.md Acceptance, rows D1, D2 and X0"
ui_review: true
---

## Goal
An open card holds Tab; the drawer's list has no commas (Aglaea, a5c30ed, from sup60's close).

## Gate
docs/specs/leftovers-25.md, rows D1, D2 and X0.

- [x] D1: harness Tab loop of the card back, links on and off (`.wt-notes/dg-build/d1-on.jsonl`, `d1-off.jsonl`, steps `d1.txt`); one definition (`.wt-notes/dg-build/d1-grep.txt`)
- [x] D2: vitest `frontend/src/components/RoleDrawer.inits.test.tsx`; harness ring 6 px from the next item (`.wt-notes/dg-build/d2-on.jsonl`, `d2-off.jsonl`, steps `d2.txt`), snapshot `.wt-notes/dg-build/d2-link2.png`
- [x] X0: clean clone at d5c8246, make test, pnpm run build, wails build, porcelain empty (`.wt-notes/dg-build/x0-summary.txt`)

## Done
- 2026-10-13 dg-build: `loopTab` moved to `lib/tabTrap.ts` and shared by the rule box, the role drawer (its edge-only copy gone) and the card back; the drawer's initiatives are an inline `ul`, 8 px gap, no commas (58d4cfd, 100afd4, d5c8246; progress `.wt-notes/dg-build/progress.md`).

## UI review
dg-ui, 2026-10-13, every row on d5c8246 (branch did not move). **Verdict: pass.** No sev 4 or 3. Shots and logs in `.wt-notes/dg-ui/`.

How each state was checked (auth off, fixture, own processes only, killed by saved pid):
- D1, card back holds Tab: tab harness (offscreen WKWebView) against my `wails dev` on 34123, links on and off, 1440×900 and 1024×640. 7 stops (Close, comment box, Open card in editor, Terminal, Reveal, seat select, Write about this card); 40 Tabs loop, Shift+Tab past Close lands on Write about, from the title Tab → Close and Shift+Tab → Write about; never `body`, every stop on screen with the ring (`d1-on.jsonl`, `d1-off.jsonl`, `d1-small.jsonl`, `wkwebview-1440x900-D1-cardback-first.png`, `wkwebview-1024x640-D1-cardback-wrap.png`). One `function loopTab` in `src` (`lib/tabTrap.ts`); rule box, role drawer, card back import it; no other trap copy.
- D2, drawer initiatives: harness on Hephaistos's drawer, links on and off: `UL` of 5 `LI`, no comma, flex, gap 8px, ring 2px offset 0, `:focus-visible`, ring 6.0px from the next item (`d2-*.jsonl`, `wkwebview-1440x900-D2-link{1,2}-focused-{on,off}.png`). Review app (`Deltagos Review`, its pid): AXPress on the role row, AX tree `ax-drawer.txt`, window shot `webkit-app-1440x900-D2-drawer-open.png`.
- X0: `make review-build` and `wails build` from my detached worktree passed; vitest 593/593 (49 files); porcelain empty after. make test as recorded by the builder (`.wt-notes/dg-build/x0-summary.txt`), not rerun.

Findings:
- **U1 (sev 2) the list is not a list to VoiceOver.** A VoiceOver user hears five links but not "list, 5 items", so not how many initiatives there are or where they end. Where: role drawer, Initiatives (`webkit-app-1440x900-D2-drawer-open.png`). Evidence: `ax-drawer.txt` lines 53-68, `.rd-inits` and each `li` are `AXGroup`, while the bitácora's `ul` in the same drawer is `AXList`; WebKit drops list semantics under `list-style: none`. Proposal: `role="list"` on the `ul`.
- **U2 (sev 1) stale comment.** `styles/roles.css:101` still says "plain text links in a comma list". Proposal: "an inline list".
- **U3 (sev 2, before this card, outside FR-10) the card back's body cannot be scrolled from the keyboard.** At 1024×640 the body overflows by 257px and the code block is cut sideways; with focus on any stop, three Down presses leave `scrollTop` 0, and a body without links has no stop. Evidence: `d1-small.jsonl` last lines, `wkwebview-1024x640-D1-cardback-wrap.png`. Proposal: an overflowing `.modal-body` (and code block) becomes a named stop, which the shared trap then walks.

Spec gaps for the FSE: D2 checks the DOM tag, not the role WebKit exposes (U1); FR-10 does not say whether a scroll region is a stop (U3).

For aglaea: U3, should an overflowing card body or code block be a Tab stop, and with what name?

Not verified in WKWebView: the rule box's walk after the move (vitest and code path only: same function, unchanged body); a card body with a link (no fixture card has one; the selector holds `a[href]`); the card back in the review app itself (opened only in the harness, same engine); firebase states (n/a to this card).
