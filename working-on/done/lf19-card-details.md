---
title: "The card's id raises it; the header's Details keeps one label"
status: done
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

## UI review
Verdict: pass. Reviewer cd-ui, 2026-10-11, every row checked on 3f3aea6 (the dist `make review-build` built in my worktree).

How each state was checked:
- The review app's own process (pid saved) could not be read: AX gave back the application element for its windows (`AXWindows`, `AXMainWindow`), even after a restart, while AX on Finder worked; `screencapture -o -l` of its window gave "could not create image from window". Evidence: `.wt-notes/cd-ui/ax-broken-tree-head.txt`. cd-review saw the same in its own app.
- So the screen evidence is headless WebKit (Playwright WebKit 26.5) over that same dist, with the Wails bindings stubbed to return the fixture's `organizer board --json` (`.wt-notes/cd-ui/wk.mjs`, `webkit-c1-c2.json`). No window, no desktop, no real pointer. I ran no wails dev: it would open a window under `cl.antipan.organizer`, so I stopped it at the bindings step.
- C1 (FR-7, I33), 1024x640 and 1440x900, four cards: at rest rgb(39,32,51); pointer on `Open <id>` gives `.raised` rgb(46,39,60), the same as the body; card Details does not raise. Shots `webkit-{1024x640,1440x900}-C1-{id-hover,body-hover}.png`. vitest `CardDetails.test.tsx` and `CharterOnce.test.tsx` pass (15).
- C2 (FR-8, I34), both widths: label `Details` closed, open and closed again; `aria-expanded` false/true/false; 75x24 every time; the chevron goes down to up with no transform; open uses `--surface-selected` rgb(47,27,85). Shots `webkit-*-C2-{closed,open}.png`.

Findings:
- U1 (severity 2). What the lead cannot do: at 1024 he cannot press Details twice in the same place. Where: initiative header at 1024x640 (`webkit-1024x640-C2-closed.png` / `-open.png`). Evidence: closed, the folded goal wraps the button onto a second row (top 77); open, the goal line goes and the button moves up to the first row (top 55), 22 px from the pointer. At 1440 it stays put (55/55). Its height stays the same, so C2 holds. Proposal: keep the button on one row in both states, for example by reserving its row or letting the folded goal shrink before it wraps. I34's "without a jump" reads as covering position, but the row checks height only.

No severity 4 or 3 findings.

Spec gaps (for the FSE): I34 says "open without a jump", but its check is height only, so the 1024 position change (U1) falls outside the gate. Sleep/Wake not raising was not seen in WebKit, because the stubbed factory sees no initiative and shows no button; vitest covers `raisesOn` over buttons.

For aglaea:
- A1: FR-8 says "turning chevron" and the button swaps chevron-down for chevron-up. That matches the card's Details, which I34 asks it to copy ("exactly as the card's button does"). Confirm the swap is the intended turn.
- A2: keyboard focus on `Open <id>` does not raise the card (it is hover only). This was the same before, and FR-7 covers only hover.
- A3: U1's position change at 1024.

Not verified in WKWebView: every state above (WebKit engine only, not the app's WKWebView, since AX and screencapture failed on my process); AX frame heights in the review process (the builder's `ax-C2-*.txt`, 76x24, stand in); focus-visible rings (programmatic focus in headless WebKit showed no ring, which proves nothing).
