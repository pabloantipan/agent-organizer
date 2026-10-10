---
title: "A fact shows once: Charter omit, card hover on body, readOnly detail, header pills wrap"
status: now
repos: [organizer]
branch: lf18-charter-once
seat: co-build
stage: one-window
updated: 2026-10-10
next: "review: lf18-charter-once, H1-H5 met, X0 met but porcelain until lf18-build-drift merges, 242dc0c"
depends_on: []
boundary: ["docs/specs/leftovers-18.md Boundary, lf18-charter-once"]
spec: "docs/specs/leftovers-18.md (FR-4 to FR-7b; initiatives-view Amendment 3, I25-I27)"
gate: "docs/specs/leftovers-18.md Acceptance, rows H1, H2, H3, H4, H5 and X0"
ui_review: true
---

## Goal
lf17-initiative-card's review Q1, U2-U4 and the header at 1024 (Aglaea, 237db96).

## Gate
docs/specs/leftovers-18.md, rows H1, H2, H3, H4, H5 and X0.

- [x] H1: `frontend/src/components/CharterOnce.test.tsx` (H1); on screen `.wt-notes/co-build/chromium-1024x640-H2-init-asleep-open.png`, `.wt-notes/co-build/h2-h4-chromium-1024x640.json` (openCharterLabels)
- [x] H2: `CharterOnce.test.tsx` (H2); computed style `.wt-notes/co-build/h2-h4-chromium-1024x640.json` (H2)
- [x] H3: `CharterOnce.test.tsx` (H3); `.wt-notes/co-build/h3-chromium-1024x640.json`
- [x] H4: `CharterOnce.test.tsx` (H4); review app AX `.wt-notes/co-build/ax-h4-open.txt`, `.wt-notes/co-build/ax-h4-folded.txt`, `.wt-notes/co-build/review-1024x640-H4-*.png`; scrollWidth `.wt-notes/co-build/h2-h4-chromium-1024x640.json` (H4)
- [x] H5: `CharterOnce.test.tsx` (H5)
- [x] X0: `.wt-notes/co-build/x0-make-test.log`, `.wt-notes/co-build/x0-npm-build.log`, `.wt-notes/co-build/x0-wails-build.log` pass; `.wt-notes/co-build/x0-porcelain.txt` holds only the runtime mode flips and package-lock.json that lf18-build-drift (6a064a1, 9eed8e6) fixes

## Done
- 2026-10-10 co-build: Charter `omit`, header omits target and stage, open card shows the goal once, raise on body only, `InitiativeDetail` `readOnly`, header pills wrap, sub-tabs `aria-current="true"` (d9dbc1f, bc9d1d4, 38b3061, 8dad649, 242dc0c); how to reproduce in `.wt-notes/co-build/progress.md`

## Notes
- X0's `git status --porcelain` is empty only once lf18-build-drift merges; until then a clean clone shows the three `frontend/wailsjs/runtime/*` mode flips and an untracked `frontend/package-lock.json`.
- Before the fix the header ran to 1878 px at 1024 while the document's scrollWidth stayed 1024 (an ancestor clips): H4's header frame is what catches it, not scrollWidth alone.
- Home passes no `readOnly`: it lists only awake initiatives, so Home.tsx is unchanged.
