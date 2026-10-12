---
title: "The rail hero is a summary, never a button"
status: now
repos: [organizer]
branch: lf21-hero-summary
seat: hs-build
stage: one-window
updated: 2026-10-11
next: "review: lf21-hero-summary, gate met (H1, H2, H3, X0), ea21679"
depends_on: []
boundary: ["docs/specs/leftovers-21.md Boundary, lf21-hero-summary"]
spec: "docs/specs/leftovers-21.md (FR-1, FR-2; initiatives-view Amendment 6, I39)"
gate: "docs/specs/leftovers-21.md Acceptance, rows H1, H2, H3 and X0"
ui_review: true
---

## Goal
The hero is read as what it is, a summary; Home is the Home tab (Aglaea, f5d0302, from sup57's bk-ui).

## Gate
docs/specs/leftovers-21.md, rows H1, H2, H3 and X0.

- [x] H1 vitest of `RailHero` on Home and on an initiative: `frontend/src/components/Rail.hero.test.tsx`, `.wt-notes/hs-build/x0-make-test.log`
- [x] H2 AX tree of the review process on Home and on an initiative: `.wt-notes/hs-build/ax-home.txt`, `ax-initiative.txt`, `ax-press-home-tab.txt`, `ax-after-home-tab.txt`
- [x] H3 computed style of `.rail-hero` on Home, plain and hover forced: `.wt-notes/hs-build/h3-computed.json` (WebKit 26.5, Chromium 151)
- [x] X0 make test, pnpm run build, wails build, git status --porcelain from a clean clone: `.wt-notes/hs-build/x0-*.log`, `x0-porcelain.txt` (empty)

## Done
- hs-build, 2026-10-11: the hero is a role-less summary on every screen (no title, press, pointer or hover); on an initiative its one control stays Back to Initiatives; ea21679 (rebased on main from d6e12f7, where the gate ran; same code), gate met. Progress: `.wt-notes/hs-build/progress.md`.

## Notes
- lf20's initiative wrapper `<section aria-label>` was a region landmark; it is now a plain div on both screens, since A6 says no role.
- `pressHero`'s Home branch is now unreachable from the rail; left in place (outside the boundary), covered by Places.test.
