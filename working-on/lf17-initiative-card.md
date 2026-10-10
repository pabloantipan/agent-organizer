---
title: "An Initiatives card opens its initiative and shows its details in place"
status: now
repos: [organizer]
branch: lf17-initiative-card
seat: ic-build
stage: one-window
updated: 2026-10-10
next: "review: lf17-initiative-card, gate met (C1, C2, X0), 870e0ad"
depends_on: []
boundary: ["InitiativesView.tsx and css", "a Charter component extracted from InitiativeHeader.tsx", "their tests", "not: lib/initiatives.ts, Rail.tsx, Initiatives.tsx"]
spec: "docs/specs/leftovers-17.md (FR-1, FR-2; docs/ux/specs/initiatives-view.md Amendment 2, I17-I18)"
gate: "docs/specs/leftovers-17.md Acceptance, rows C1, C2 and X0"
ui_review: true
review: pass
---

## Goal
Pablo, 2026-10-10: "On clicking the card I should be able to go to the initiative. Also, getting details of the project."

## Gate
docs/specs/leftovers-17.md, rows C1, C2 and X0.

- [x] C1: vitest `frontend/src/components/InitiativesView.test.tsx` (C1 block); review build AX: `.wt-notes/ic-build/c1-ax-initiatives-1440.txt`, `c1-ax-after-press-awake.txt`, `c1-ax-after-press-asleep.txt`
- [x] C2: vitest (C2 block); review build: `.wt-notes/ic-build/c2-card-details-1440.png`, `c2-card-details-1024.png`, `c2-ax-card-details-1024.txt`, `c2-ax-asleep-details.txt`, `c2-ax-header-details.txt`
- [x] X0: `.wt-notes/ic-build/x0-make-test.log`, `x0-npm-build.log`, `x0-wails-build.log` (clean clone of 870e0ad, all pass)

## Done
- 2026-10-10 ic-build: Charter extracted and shared by header and card; card body opens on Overview, one `Open <id>` link; Details in place with Charter and Workspace; gate met (21a9d17, 16c0a70, 39abaa4, 870e0ad).

## Notes
- A card not awake hides InitiativeDetail's "Review with agent" (0042) by a css rule in initiatives.css, since Initiatives.tsx was outside the boundary; a `readOnly` prop there would be cleaner.
- The header's Details gained Measure/Target/Stage lines from the shared Charter; the Stage line repeats the strip below it.

## UI review
ic-ui, 2026-10-10, on 870e0ad (Deltagos Review on the fixture, WKWebView; shots and AX trees in `.wt-notes/ic-ui/`). **Verdict: pass.** No sev 4 or 3.

How each state was checked:
- C1 cards and links: AX tree at 1440×900, 11 cards, 11 AXLinks named `Open <id>`, Details and Sleep/Wake separate (`ax-initiatives-1440.txt`, `wk-1440x900-C1-initiatives.png`).
- C1 link: AXPress `Open init-asleep` opens it on Overview with `asleep: read-only` (`ax-after-open-asleep.txt`); `Open init-a` opens on Overview.
- C1 body press: AXPress on init-many's goal text opens init-many on Overview.
- C1 with confirm open: Sleep init-a opens the confirm. A body press then stays on Initiatives, and focus goes to Cancel (`ax-confirm-after-body.txt`, `wk-1440x900-C1-confirm-open.png`).
- C2 at 1440: full row, Charter beside Workspace, focus stays on `Details of init-a` (`wk-1440x900-C2-details-open.png`).
- C2 one open at a time: opening init-asleep's Details closes init-a's (one `.ic-details` in the tree). The asleep Workspace has no Review with agent, and `no measure yet`, `no scope yet`, `no roadmap yet` read as words (`wk-1440x900-C2-details-asleep.png`).
- C2 at 1024×640: Charter stacks over Workspace, the right edge equals the window edge and the cards below flow on (`wk-1024x640-C2-details-*.png`, `ax-details-1024.txt`).
- C2 header: the header's Details render the same Charter (`wk-1440x900-C2-header-details.png`).
- vitest `InitiativesView.test.tsx`: 13 tests pass.

Findings:
- **U1 (2)**. The lead cannot read the header's open Details without seeing the target and the stage twice or three times. Where: the initiative header with Details open (`wk-1440x900-C2-header-details.png`). Evidence: the shared Charter adds `TARGET 1 Oct` under the bar's `target 1 Oct`, and `STAGE The joins … (2 of 4)` above the strip's `Roadmap · stage 2 of 4` and its `2 · now` tile. The open header is about 55 px taller, which pushes the body down (0038's concern). Proposal: for aglaea, see Q1.
- **U2 (1)**. The lead sees the goal twice on an open card. Where: an open card (`wk-1440x900-C2-details-open.png`). Evidence: the head keeps the goal cut to one line with "…" just above the Charter's goal in full. Proposal: hide the head's goal line while the card is open, or leave it as it is.
- **U3 (1)**. The hover does not match the spec. Where: `initiatives.css` `.ic:not(.open):hover`; checked from code, since a hover cannot be given. Evidence: hovering Details or Sleep also raises the whole card, against "keep their own hover". An open card shows the hand over its body but never rises, though a press there still opens it. Proposal: raise the card on `.ic-main:hover`, and keep the rise on open cards too.
- **U4 (1, code)**. Read-only depends on button order. Where: `initiatives.css`. Evidence: the asleep Workspace hides Review with agent with `.init-actions > button:last-of-type`, so a button added after it in `InitiativeDetail` would be hidden and Review with agent would show. Proposal: a `readOnly` prop on `InitiativeDetail` (the builder's own note).

Spec gaps (for the FSE):
- FR-2 calls the Charter "the same fields as the initiative header's Details". Target and stage were not in those Details, and the header already shows both elsewhere. The spec does not say whether the header gains them (U1).
- FR-1 does not say whether Details stays reachable while the Sleep confirm is open. As built, the whole foot hides.

For aglaea:
- **Q1**. Should the header's Charter drop the Target and Stage lines? That would need a prop, which is two field sets against "one component, same fields". The other choice is to keep them and drop the bar's target and the strip label.

Not verified in WKWebView:
- Hover (no pointer events allowed).
- Escape closing Details and returning focus: no keys allowed. The handler is checked by vitest as source plus `escapeCloses`.
- A real mouse click and text selection on the body: AXPress on the text stood in.
- Keyboard Tab order (Q1 of the memory).
- Archived cards' Details: the fold was closed, same code path.
- The focus ring after AXPress may be WebKit treating it as keyboard focus, not judged.

## Review
Pass: C1, C2 and X0 met at 870e0ad (fresh clone, review build of that clone on the fixture, my own pid; evidence in `.wt-notes/ic-review/`).

- C1: vitest C1 block passes in `make test`. AX on my review app: 11 cards, 11 AXLinks, each `Open <id>` (`r-c1-initiatives.txt`); AXPress on a body line of init-a opened init-a on Overview (`r-c1-after-body-press.txt`); AXPress on `Open init-b` the same (`r-c1-link-press.txt`); AXPress on Details stayed on Initiatives; with init-a's Sleep confirm open a body press stayed and focus went to Cancel (`r-c1-confirm-body-press.txt`); a body press on init-asleep opened it on Overview, `asleep: read-only` (`r-c1-asleep-body-press.txt`).
- C2: vitest C2 block passes (fields, each missing `no … yet`, Escape and focus via source, one at a time, same Charter in header and card, stacking rule). On screen: init-a's Charter verbatim from its initiative.yaml and roadmap, goal in full, `1 Oct`, `The joins — “every card says who is on it” (2 of 4)`, Workspace present (`r-c2-details-1440.txt/.png`); init-b shows each `no … yet`; Details on init-b closed init-a's, cards below flow (`r-c2-one-at-a-time.txt`); at 1024×640 Charter stacks over Workspace (`r-c2-details-1024.txt/.png`); asleep Workspace has no Review with agent (`r-c2-asleep-details.txt`). Escape itself was not pressed on screen (no synthetic keys); vitest covers it.
- X0: `make test` (Go ok, vitest 473/473), `npm run build`, `wails build` all exit 0 (`x0-*.log`).

Unmet: none. Reviewer ic-review, 2026-10-10, commit 870e0ad.
