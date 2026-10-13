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
