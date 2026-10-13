---
title: "Every click target is a link or a button"
status: now
repos: [organizer]
branch: lf24-controls
seat: ct-build
stage: one-window
updated: 2026-10-13
next: "review: lf24-controls, gate met (E1, X0; F2 by vitest only, unreachable in the app), 37b056f"
depends_on: []
boundary: ["docs/specs/leftovers-24.md Boundary, lf24-controls"]
spec: "docs/specs/leftovers-24.md (FR-1 to FR-5; tab-reaches-links Amendment 1, T6)"
gate: "docs/specs/leftovers-24.md Acceptance, rows E1 and X0"
ui_review: true
---

## Goal
F1-F5 become buttons or a link, reachable by Tab (Aglaea, b131393, from sup59's close).

## Gate
docs/specs/leftovers-24.md, rows E1 and X0.

- [x] E1: no span/li/div with onClick in the three files, roles and names as FR-1 to FR-5, Return acts, F4 and F5 focus lands on the divider. Evidence: `frontend/src/components/Controls.test.tsx`, `.wt-notes/ct-build/e1.txt`, `e1-on.jsonl` and `e1-summary.txt`. F2 is vitest only: `f2.jsonl` shows its list never mounts.
- [x] X0: `XDG_DATA_HOME=$(mktemp -d) make test`, `pnpm run build`, `wails build` pass; `git status --porcelain` empty (clean clone of f801a1b; rebased to 37b056f over card-only commits, same code tree). Evidence: `.wt-notes/ct-build/x0-make-test.log`, `x0-pnpm-build.log`, `x0-wails-build.log`, `x0-status.txt`.

## Done
- F1, F3, F4 and F5 are buttons and F2 is a link, each keeping its row look. The thread divider replies through a `Reply into <subject>` button; a search hit and a ruling land focus on the divider (db349dd, 84aebab, 0081190, 37b056f; ct-build, 2026-10-13).

## Notes
- Boundary extended by sup60 (spec Amendment 1, fc41775): E1's grep also hit `div.tl-divider` and `span.a-actions`. The divider gets a `Reply into <subject>` button whose `::after` still takes a click anywhere on the divider, the divider stays the F4/F5 focus target, and `.tl-*` rules in `global.css` are this card's.
- F2's cell list (SlackView with no initiative) cannot be reached since the redesign: `InitiativeScreen` mounts SlackView only with a selected initiative. Its `aria-current` therefore never applies; it is proven by vitest only.
- After Return on F1 or F3, focus falls to `body`, as a click does. Not asked by the spec.
- Choices and how to reproduce: `.wt-notes/ct-build/progress.md`.
