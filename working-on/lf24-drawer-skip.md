---
title: "The skip link never sits under a drawer"
status: now
repos: [organizer]
branch: lf24-drawer-skip
seat: ds-build
stage: one-window
updated: 2026-10-13
next: "review: lf24-drawer-skip, gate met (E6, E7, X0), 7fe680f"
depends_on: []
boundary: ["docs/specs/leftovers-24.md Boundary, lf24-drawer-skip"]
spec: "docs/specs/leftovers-24.md (FR-10, FR-11; tab-reaches-links Amendment 1, T7, T12)"
gate: "docs/specs/leftovers-24.md Acceptance, rows E6, E7 and X0"
ui_review: true
---

## Goal
No skip link while a drawer is open; the drawer's link ring clears its comma (Aglaea, b131393, from sup59's close).

## Gate
docs/specs/leftovers-24.md, rows E6, E7 and X0.

- [x] E6 (10): vitest `SkipLink.modal.test.tsx` (absent while a drawer is open); harness, links on and off: skip link 1 → 0 while the drawer is open → 1 after; focus forced to body, Tab → `Close Hephaistos` inside the drawer (`.wt-notes/ds-build/e6-on.jsonl`, `e6-off.jsonl`)
- [x] E7 (11): harness screenshot `.wt-notes/ds-build/e7-ring.png` (`e7-ring-zoom.png`), focused `init-define` before a comma: ring 2 px clear of the comma on both sides (`e7-gaps.txt`); computed `padding-inline` 2px (`e7-on.jsonl`); vitest `RoleDrawer.inits.test.ts`
- [x] X0 (all): clean clone of 07b53a9: `make test` pass, `pnpm run build` pass, `wails build` pass, `git status --porcelain` empty (`.wt-notes/ds-build/x0-*.log`, `x0-status.txt`); rebased since onto card-only commits, 7fe680f

## Done
- FR-10 and FR-11 built on `lf24-drawer-skip` (730459e skip link out from under a modal, 7fe680f ring clears the comma); gate rows E6, E7, X0 met; how to rerun each in `.wt-notes/ds-build/progress.md`.

## Notes
- FR-11: 2 px padding alone does not clear the comma. The ring (2 px at offset 2 px) reaches 4 px past the link, and the comma sits right at its edge (measured 4.7 px over it). Inside `.rd-init*`: the ring moves to offset 0, so the 2 px padding is the gap between text and ring, and `margin-inline-end: 4px` gives the ring room. The design system asks for the 2 px offset only on accent-drawn elements. Unfocused, the comma sits 6 px after the id.
- A modal is a `.modal` inside a `.modal-backdrop` (role drawer, card back, Retire), read from the document by `SkipLink.tsx`. No store flag, and no change to App.tsx or the modals.
- Found, not asked: with `tabFocusesLinks` off, the role drawer's own trap lets Tab escape past its last link to body (`e6-off.jsonl`, trap#3). FR-10's handler brings the next Tab back in. The trap is in RoleDrawer.tsx, outside this boundary.

## UI review
ds-ui, 2026-10-13, on 7fe680f (the pinned commit; the branch did not move). **Verdict: pass.** Severity 4 or 3: none. Shots and runs are in `.wt-notes/ds-ui/`.

How each state was checked:
- E6 role drawer, review build (`make review-build`, fixture, auth off, own pid, AXPress only): the skip link is in the AX tree with the drawer closed, gone while it is open, and back after Close. Focus goes back to the Hephaistos row (`ax-drawer-*.txt`, `wkwebview-1440x900-E6-home-closed.png`, `-drawer-open.png`).
- E6 card back, review build: same result, 1 → 0 → 1 (`ax-cardback*.txt`, `wkwebview-1440x900-E6-cardback-open.png`).
- E6 Tab, harness (main's `scripts/tab-harness` plus a `shot` verb, own `wails dev` on :34123), links on (what `main.go` ships) and off. Role drawer: forced to body, Tab goes to `Close Hephaistos` and Shift+Tab to `Open init-drafted`. Twelve more Tabs stay inside, and nothing renders "Skip to content" while the drawer is open. Card back: Tab from body goes to `Close`, Shift+Tab to `Write about this card` (`e6-on.jsonl`, `e6-off.jsonl`, `e6-card-on.jsonl`, `e6-card-off.jsonl`).
- E7, harness, 3× snapshot: computed padding 2px 2px, margin-right 4px, outline 2px with offset 0. Ink gaps around focused `init-define` are 2.33 px left and 2.33 px right (`e7-gaps.txt`, `harness-1440x900-E7-focused-init-define.png`, `crop-*.png`). At 1024×640 the box geometry is the same (`e7-1024.jsonl`).

Findings:
- **U1 (2): the commas float off their ids.** What the person cannot do: read the drawer's initiative list as normal punctuation. Unfocused, it reads "init-a , init-b , init-many": the comma sits 6 px after each id (2 px padding plus 4 px margin), like a stray space. Where: role drawer, Initiatives (`crop-unfocused.png`). Evidence: computed styles and the shot; everyone sees it, while the ring it makes room for shows only on keyboard focus. Proposal: for aglaea, below.
- **U2 (2): the card back has no Tab trap.** What the person cannot do: see where focus is for one press. Tab from the card back's last control (`Write about this card`) goes to body, so one Tab shows no focus at all. FR-10's handler brings the next Tab back to `Close`, so focus never lands under the backdrop and T7 holds. Where: card back (`e6-card-on.jsonl`, `cardback-next#1`). Evidence: harness, links on and off. Proposal: give the card back the role drawer's trap. `CardDrawer.tsx` is outside this card's boundary, so it needs a card of its own.
- **U3 (1): with links off, the role drawer's trap leaks to body on every third Tab** (Close → summary → body). Links off is not the mode that ships (`main.go`, `TabFocusesLinks: Enabled`), and the builder found it too. Record only.

Spec gaps (for the FSE):
- FR-11 names the means, "2 px inline padding", and its own check (E7, T12) shows the means is not enough. The build needed offset 0 and a 4 px end margin. Amend FR-11 to the outcome (the ring clears the comma by at least 2 px) or to what was built.
- FR-10 counts a modal only when it has a backdrop. The spec never says whether Help, the rule box, the float list and the memory popover count as modals; the builder's choice was no.

For aglaea:
- Q1 (U1): is a 6 px detached comma the price of the ring? Alternatives: a middot or a gap-separated list with no commas, or the comma inside the link's span so only the ring side carries the margin.

Not verified in WKWebView:
- The Retire sheet: reaching it needs a crew retire action from the fixture. Checked from source only (same `.modal-backdrop > .modal` shape) and by the builder's vitest source match.
- Vitest: my two runs of the card's test files could not get a test-lease slot (machine memory pressure high, 1800 s timeout twice), so I rest on the builder's X0 log (46 files, 564 tests pass). My `wails build` after `wails dev` passed, and `git status` in my checkout is empty.
- No real key presses went to the review app (0108). Every Tab result above comes from the harness's own offscreen WKWebView.
