---
title: Overview shows the current stage's gates, the work summary and the FSE panel
status: next
repos: [organizer]
branch: main
updated: 2026-09-27
seat: wave2-overview
next: "Build Overview: the current stage's gate records and exit items, the work summary in tokens, the FSE panel with its feed, hand-off and what it waits on (FR-12, 0021)"
depends_on: ["redesign-shell-home"]
boundary: ["frontend/src/components/Overview.tsx (replaces the shell stub)", "frontend/src/components/FsePanel.tsx (new)", "frontend/src/styles/overview.css (new)"]
spec: "docs/specs/redesign.md (FR-23, FR-18, FR-12); visual: docs/specs/redesign-mockups.html; values: docs/design-system.md"
gate: "docs/specs/redesign.md Acceptance, rows G12, G19, G18; the Gate section below"
---

## Goal
The redesign, wave 2 of 2: FR-18 of `docs/specs/redesign.md`. Decisions 0013–0020.

## Gate
- [ ] G12 (Overview): see `docs/specs/redesign.md`, Acceptance
- [ ] G19: see `docs/specs/redesign.md`, Acceptance
- [ ] G18: see `docs/specs/redesign.md`, Acceptance

## Done
- 2026-09-26 cut from the redesign spec by the FSE

## Next
1. Build Overview: the current stage's gate records and exit items, the work summary in tokens, the FSE panel with its feed, hand-off and what it waits on (FR-12, 0021)

## Blockers
none

## Notes
- 2026-09-27 sup3: the gate screenshots run against `eval "$(scripts/fixture-home.sh)"` (1993e12): a temp copy of `testdata/home` with `testdata/fixture-overlay` laid over it: init-a a git repo with two FSE-signed commits, proposed records 0002 (the fixture record G15/G16 rule) and 0003 raised by the FSE and owned by pablo, the current stage gated on 0002, three cards seated `wave1-*`, and a cell `organizer-fixture` whose `fse` seat has one question thread open to pablo in the mailbox. `testdata/home` and `status.golden` are unchanged
- `stage:` is left out: the organizer has no roadmap yet (it waits on Pablo's intake); the FSE adds it once one is ruled
- 2026-09-27 sup3 runs this card (organizer-probe-sup3), spawned by the FSE after wave 1 passed
- 2026-09-26 from wave 1 (sup2): FR-11's third bullet, the FSE's open threads, was not built by redesign-fse-activity (threads live behind the discuss API in `internal/service`, outside that boundary) and no card owns it now; it needs Pablo's call: this card takes it beside FR-12, or a card of its own (fse-activity review)
- 2026-09-26 from wave 1: `model.FSECommit` is a nested type no binding reaches, so Wails will not emit it; use the `App.MilestoneType` trick or a hand-written type (fse-activity notes)
- 2026-09-26 from wave 1: `Wave.InputTokens` is the live statusline sum, not FR-10's archive+live total (the lock `agentsViewLocked` holds); the work summary in tokens should read `Runs` for the archive (waves review)
