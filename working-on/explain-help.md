---
title: The Help shows how we follow the flow
status: now
repos: [organizer]
branch: main
updated: 2026-09-28
next: "review: explain-help, branch explain-help, gate G1, G2, G6 met, 458427f 380b858 e65b77f"
depends_on: []
boundary: ["internal/config/config.go (help_doc)", "internal/service/help.go (new)", "internal/service/help_test.go (new)", "app.go (one Help method)", "frontend/wailsjs/ (regenerated)", "frontend/src/components/HelpView.tsx (new)", "frontend/src/components/TopBar.tsx (the Help entry)", "frontend/src/styles/ (the Help's CSS only)"]
spec: "docs/specs/machine-explains-itself.md (FR-1, FR-2, FR-3); values: docs/design-system.md"
gate: "docs/specs/machine-explains-itself.md Acceptance, rows G1, G2, G6; the Gate section below"
stage: machine-explains-itself
seat: stage3-help
---

## Goal
Roadmap stage machine-explains-itself (0032): FR-1, FR-2, FR-3 of `docs/specs/machine-explains-itself.md`.

## Gate
- [x] G1: see `docs/specs/machine-explains-itself.md`, Acceptance
- [x] G2: see `docs/specs/machine-explains-itself.md`, Acceptance
- [x] G6: see `docs/specs/machine-explains-itself.md`, Acceptance

## Done
- 2026-09-28 cut from the spec by the FSE
- 2026-09-28 built on branch explain-help (458427f config and service, 380b858 App.Help and bindings, e65b77f HelpView, help.css, the TopBar entry), rebased on main. G1: `XDG_DATA_HOME=$(mktemp -d) go test ./internal/service/ -run Help -v` gives 4 PASS, `ok organizer/internal/service` (.wt-notes/stage3-help/g1.txt). G2: .wt-notes/stage3-help/g2-sections.png (sections list and the real how-we-build.md), .wt-notes/stage3-help/g2-diagram-start.png and g2-diagram-scrolled.png (diagram 2 before and after scrolling sideways in its box, at an 880px window, since its 84-char lines fit at 1280), .wt-notes/stage3-help/g2-fr3-missing.png (help_doc set to a missing path names the path and help_doc). G6: make test exit 0, npm run build exit 0, G18 grep empty (.wt-notes/stage3-help/g6.txt). Choices and findings in .wt-notes/stage3-help/progress.md

## Next
1. Read help_doc (default ~/agent-slack/docs/how-we-build.md) at open and render it with its sections and monospace diagrams; say which path and key when missing

## Blockers
none

## Notes
- 2026-09-28 sup10 runs this card (organizer-probe-sup10), spawned by the FSE after 0040
- 2026-09-28 the Help is an overlay under the top bar that TopBar owns (the store is outside the boundary). It is reached by the ? before the gear and left by Close, Esc, Home, Needs me or the gear. help_doc has no Settings field (Settings.tsx is outside the boundary), so it is set in config.yaml only
- 2026-09-28 the frontend is pnpm (no package-lock.json), so `npm ci` fails; `wails generate module` needs frontend/dist built first
