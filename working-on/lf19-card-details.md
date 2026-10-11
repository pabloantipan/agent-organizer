---
title: "The card's id raises it; the header's Details keeps one label"
status: now
repos: [organizer]
branch: lf19-card-details
seat: cd-build
stage: one-window
updated: 2026-10-11
next: "review: lf19-card-details, gate met (C1, C2, X0), 3f3aea6 (sup56 rebase of 023cb1e, same tree)"
depends_on: []
boundary: ["docs/specs/leftovers-19.md Boundary, lf19-card-details"]
spec: "docs/specs/leftovers-19.md (FR-7, FR-8; initiatives-view Amendment 4, I33-I34)"
gate: "docs/specs/leftovers-19.md Acceptance, rows C1, C2 and X0"
ui_review: true
review: pass
---

## Goal
lf18-charter-once's UI review U1-U2 (Aglaea, e93a3ef).

## Gate
docs/specs/leftovers-19.md, rows C1, C2 and X0.

- [x] C1: vitest `CardDetails.test.tsx`; Chromium computed style `.wt-notes/cd-build/c1-c2-chromium-1024x640.json` (hover in the review process needs the real pointer, 0108)
- [x] C2: vitest `CardDetails.test.tsx`; review-app AX frames `.wt-notes/cd-build/ax-C2-{1-open,2-closed,3-open}.txt` (76x24 each)
- [x] X0: `.wt-notes/cd-build/x0-rc.txt`, `x0-porcelain.txt` (clean clone of 023cb1e)

## Done
- 2026-10-11 cd-build: the id link raises the card; the header's Details reads `Details` both ways with a swapped chevron and one height (023cb1e, progress in `.wt-notes/cd-build/progress.md`).

## Notes
- The header chevron swaps instead of rotating: WebKit's AX frame of the rotated svg read 33 px tall against 24 drawn. shell.css's rotate rules are now dead (pl-build's file this wave).

## Review
Verdict: pass. Reviewer cd-review, 2026-10-11, commit 3f3aea6.

- C1: met. vitest `CardDetails.test.tsx` passes at 3f3aea6 and fails 3 of 5 with main's `InitiativesView.tsx`, `InitiativeHeader.tsx`, `header.css` (`.wt-notes/cd-review/c-vitest-*.txt`); `raisesOn` is true over `.ic-id`, false over Details, Sleep, Wake and the confirm; `.ic.raised` unchanged. The row's "computed style in the review process" cannot run under 0108 (hover needs the real pointer); taken from the spec's "else vitest" fallback plus the builder's Chromium computed styles (`.wt-notes/cd-build/c1-c2-chromium-1024x640.json`: id link and body raise to rgb(46,39,60), Details and Sleep stay rgb(39,32,51), three cards).
- C2: met. vitest: label `Details` closed and open, `aria-expanded` false/true, `Hide details` gone. AX frames: the builder's `ax-C2-{1-open,2-closed,3-open}.txt`, `.ihead-details` 76x24 in all three (the open files carry `.ihead.open`, the closed `.ihead.folded`). 023cb1e to 3f3aea6 differs only in this card, so they hold for 3f3aea6. My own AX reads of my review app (built at 3f3aea6) failed: the app's windows answered as the application element, as other seats' dumps after 02:34 show.
- X0: met. Clean clone of 3f3aea6: `make test` (Go 16 ok, vitest 39 files / 518), `pnpm run build`, `wails build` rc=0; `git status --porcelain` empty; no `package-lock.json` (`.wt-notes/cd-review/x0-*`).

Unmet rows: none. Not covered by C2: FR-8's "turning chevron" is a swap (down to up), not a rotation; Aglaea's call. `## UI review` missing, so status and place stay.
