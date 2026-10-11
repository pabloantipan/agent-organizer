---
title: "Settings has its heading, Help is an overlay, the bar's last marks"
status: now
repos: [organizer]
branch: lf19-places
seat: pl-build
stage: one-window
updated: 2026-10-11
next: "review: lf19-places, gate met (L1-L6, X0), 79d9049"
depends_on: []
boundary: ["docs/specs/leftovers-19.md Boundary, lf19-places"]
spec: "docs/specs/leftovers-19.md (FR-1 to FR-6; initiatives-view Amendment 4, I28-I32)"
gate: "docs/specs/leftovers-19.md Acceptance, rows L1, L2, L3, L4, L5, L6 and X0"
ui_review: true
---

## Goal
lf18-current-mark's UI review U1-U5 and the title (Aglaea, e93a3ef).

## Gate
docs/specs/leftovers-19.md, rows L1, L2, L3, L4, L5, L6 and X0.

- [x] L1: `.wt-notes/pl-build/L1-L6-vitest.log`, `ax-L1-settings.txt`
- [x] L2: `.wt-notes/pl-build/L1-L6-vitest.log`, `ax-L2-initiative.txt`, `ax-L2-after-back.txt`
- [x] L3: `.wt-notes/pl-build/L1-L6-vitest.log`, `styles-stale.json`, `styles-fresh.json`, `styles-fresh-regular.json`
- [x] L4: `.wt-notes/pl-build/L1-L6-vitest.log`, `ax-L4-help-over-home.txt`, `ax-L4-help-over-settings.txt`, `ax-L4-help-over-initiative.txt`
- [x] L5: `.wt-notes/pl-build/styles-initiative-off.json`, `L5-initiative-1280.png`
- [x] L6: `.wt-notes/pl-build/L6-grep.txt`
- [x] X0: `.wt-notes/pl-build/X0-make-test.log`, `X0-pnpm-build.log`, `X0-wails-build.log`, `X0-git-status.txt`

## Done
- 2026-10-11 pl-build: Settings h1, rail back link to Initiatives, Sync ghost, Help as an overlay (aria-expanded, no aria-current), title at 600, `.needs-me.on` gone; gate met at 79d9049.

## Notes
- Help dropped `aria-haspopup`: with it WebKit exposes `?` as a pop-up button without AXExpanded, so the open state was invisible to AX (34d2866). The Memory button has the same blindness; outside this card.
- L5's computed style is read in an offscreen WKWebView with the review build's css (the review app's page is AX-only); the review app's shot shows the result.
