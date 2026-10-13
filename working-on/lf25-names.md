---
title: "A row says what it shows; focus stays put"
status: now
repos: [organizer]
branch: lf25-names
seat: nm-build
stage: one-window
updated: 2026-10-13
next: "review: lf25-names, gate met (N1-N4, X0), 3f76114"
depends_on: []
boundary: ["docs/specs/leftovers-25.md Boundary, lf25-names"]
spec: "docs/specs/leftovers-25.md (FR-1 to FR-5; tab-reaches-links Amendment 2, T13, T14, T19, T21)"
gate: "docs/specs/leftovers-25.md Acceptance, rows N1, N2, N3, N4 and X0"
ui_review: true
---

## Goal
A row says what it shows; focus stays put (Aglaea, a5c30ed, from sup60's close).

## Gate
docs/specs/leftovers-25.md, rows N1, N2, N3, N4 and X0.
- [x] N1: vitest `frontend/src/components/Controls.test.tsx` (F1, F3, F5: short name, aria-describedby target and its text; F1 no aria-pressed); AX of the review build .wt-notes/nm-build/n1-ax.txt (F1 and F3 descriptions in AXCustomContent, no AXPressed). F5's AX read was not possible: the fixture mailbox holds no decision, so no ruling is drawn; F5 met by vitest (sup61, spec Amendment 1)
- [x] N2: .wt-notes/nm-build/n2-on.jsonl (Return on `Chat with fse` leaves focus on it; after `Show only init-a` focus is on init-a's first agent row)
- [x] N3: .wt-notes/nm-build/n3-on.jsonl, .wt-notes/nm-build/n3-divider-focus.png (focused Escalate: `.a-actions` opacity 1, 2 px ring)
- [x] N4: .wt-notes/nm-build/n4-grep.txt (no cell list, no rule left), .wt-notes/nm-build/n4-on.jsonl (35/35 clickable elements in Conversations reached)
- [x] X0: .wt-notes/nm-build/x0-make-test.log, x0-pnpm-build.log, x0-wails-build.log, x0-status.txt (clean clone of 3f76114, all pass, porcelain empty)

## Done
- 2026-10-13 nm-build: FR-1..FR-5 built on lf25-names (f69ea20..3f76114); Chat with <seat> lost focus because a chat switch mounted the new-thread form with autoFocus, now it takes focus only when asked or landed on. Evidence and reproduction in .wt-notes/nm-build/progress.md.

## Notes
- Opening Conversations no longer puts focus in the new thread's Subject by itself (FR-3's fix); + and "new thread instead" still do.
- With macOS Keyboard navigation off (`--links off`) WebKit's Tab reaches only Conversations' 4 text fields (.wt-notes/nm-build/n4-off.jsonl): platform behaviour, not this card.

## UI review
nm-ui, 2026-10-13, on 3f76114 (the branch did not move). **Verdict: pass.** No severity 4 or 3.

How each row was checked (shots and logs in `.wt-notes/nm-ui/`):
- N1: vitest `Controls.test.tsx` 7/7. F3 by AX on my review build (pid saved, fixture, auth off): `Chat with fse` "off alive owes 2", `po_ana` "live alive", `dev_bruno` "live deaf", no AXPressed (`n1-f3-ax.txt`, `wk-1440x900-N1-people.png`). The screen then locked, so F1's AX read and later shots returned nothing; F1 rests on the harness DOM (`n2b-on.jsonl`: every `Show only <id>` has no `aria-pressed`, describedby text e.g. "0 agents · 0 live · 0 working · 3 seats in definition") plus vitest. F5 on vitest (sup61's note).
- N2: harness, `wails dev` on 34119: Return on `Chat with fse` keeps focus there, aria-current true, twice (`n2-on.jsonl`); Show only init-a lands on its first crew row, ring visible (`wk-1440x900-N2-f1-after-return.png`); also a non-first group, init-define, lands on its first row (`n2b-on.jsonl`).
- N3: Tab onto Escalate: its `.a-actions` opacity 1, the other dividers 0, 2 px ring; leaving restores 0 (`n3-on.jsonl`, `wk-1440x900-N3-divider-focus-crop.png`).
- N4: both greps empty (`n4-grep.txt`); Tab walk reached 19/19 clickables in channel, 35/35 in the fse chat (`n4-on.jsonl`, `n4-fse-on.jsonl`).
- X0: not rerun; builder's clean-clone logs accepted.

Findings (none fail):
- U1 (2) F3's description words carry no labels. A listener hears "Chat with fse, off alive owes 2": "off" (session) and "alive" (mailbox watcher) read as a contradiction, and in vitest the context is a bare "42%". Where: People panel. Evidence: AX above, vitest. Proposal: "session off, mail alive, owes 2, context 42%". For aglaea.
- U2 (1) `.cell-filters .hot .mono` stays in `global.css:585`; nothing uses `.cell-filters`. Proposal: drop that selector when next touched.
- U3 (2, pre-existing, not this spec) the Conversations search field draws no focus ring (`.cell-search input:focus { outline: none }`, no `:focus-within` on the wrapper); Tab lands there with only the caret. Proposal: `.cell-search:focus-within` ring.
- U4 (1, pre-existing) F1's description says "1 agents" for init-asleep.

Spec gaps (FSE): FR-1 lists F3's facts but not their words; a describedby that only repeats badges inherits their missing labels (U1).

For aglaea: U1, the wording of the person row's description.

Not verified in WKWebView: F1 by AX on the review build (screen locked); F5 in any engine but vitest (no fixture ruling); context in F3's description (no statusline record in the fixture); `auth: firebase` states (none touched).
