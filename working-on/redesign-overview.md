---
title: Overview shows the current stage's gates, the work summary and the FSE panel
status: next
repos: [organizer]
branch: main
updated: 2026-09-27
seat: wave2-overview
next: "review: redesign-overview, gate G12 (Overview), G19, G18 met, 047e960"
depends_on: ["redesign-shell-home"]
boundary: ["frontend/src/components/Overview.tsx (replaces the shell stub)", "frontend/src/components/FsePanel.tsx (new)", "frontend/src/styles/overview.css (new)"]
spec: "docs/specs/redesign.md (FR-23, FR-18, FR-12); visual: docs/specs/redesign-mockups.html; values: docs/design-system.md"
gate: "docs/specs/redesign.md Acceptance, rows G12, G19, G18; the Gate section below"
---

## Goal
The redesign, wave 2 of 2: FR-18 of `docs/specs/redesign.md`. Decisions 0013–0020.

## Gate
- [x] G12 (Overview): see `docs/specs/redesign.md`, Acceptance
- [x] G19: see `docs/specs/redesign.md`, Acceptance
- [x] G18: see `docs/specs/redesign.md`, Acceptance

## Done
- 2026-09-26 cut from the redesign spec by the FSE
- 2026-09-27 wave2-overview: Overview, FsePanel, overview.css on `redesign-overview` (047e960, rebased on main 9bb5afe). G12: `.wt-notes/wave2-overview/G12-overview.png` (init-a, stage 2 `joins`: 0001 ruled, 0002 waiting 6d, 0099 missing; exit 0/2 open). G19: `G19-fse-open.png` (0002, 0003 and the fse thread "w-queued: which repo…", three items), `G19-fse-collapsed.png` (header "waiting on you: 3"), `G19-link.png` (clicked the thread: Home, its Needs me row highlighted; 0002 also checked, lands on its row). G18: `git diff main...redesign-overview -- 'frontend/src/**/*.css' 'frontend/src/**/*.tsx' ':!frontend/src/styles/tokens.css' | grep -E …` prints nothing. `npm run build` passes; `wails build` done

## Next
1. review: redesign-overview, gate G12 (Overview), G19, G18 met, 047e960

## Blockers
none

## Notes
- 2026-09-27 wave2-overview: `model.FSECommit` is emitted in `wailsjs/go/models.ts` after all (nested in FSEActivity); FsePanel keeps a hand-written type as asked. `wails dev`/`wails build` flip `wailsjs/go/main/App.{d.ts,js}` to mode 755 (reverted, not committed). A console error on every browser load, `reading 'nodes'` in `/wails/ipc.js`, is Wails' runtime, not a view. `.ov-stub` in shell.css is dead now. Choices: `.wt-notes/wave2-overview/progress.md`
- 2026-09-27 sup3: the gate screenshots run against `eval "$(scripts/fixture-home.sh)"` (1993e12): a temp copy of `testdata/home` with `testdata/fixture-overlay` laid over it: init-a a git repo with two FSE-signed commits, proposed records 0002 (the fixture record G15/G16 rule) and 0003 raised by the FSE and owned by pablo, the current stage gated on 0002, three cards seated `wave1-*`, and a cell `organizer-fixture` whose `fse` seat has one question thread open to pablo in the mailbox. `testdata/home` and `status.golden` are unchanged
- `stage:` is left out: the organizer has no roadmap yet (it waits on Pablo's intake); the FSE adds it once one is ruled
- 2026-09-27 sup3 runs this card (organizer-probe-sup3), spawned by the FSE after wave 1 passed
- 2026-09-26 from wave 1 (sup2): FR-11's third bullet, the FSE's open threads, was not built by redesign-fse-activity (threads live behind the discuss API in `internal/service`, outside that boundary) and no card owns it now; it needs Pablo's call: this card takes it beside FR-12, or a card of its own (fse-activity review)
- 2026-09-26 from wave 1: `model.FSECommit` is a nested type no binding reaches, so Wails will not emit it; use the `App.MilestoneType` trick or a hand-written type (fse-activity notes)
- 2026-09-26 from wave 1: `Wave.InputTokens` is the live statusline sum, not FR-10's archive+live total (the lock `agentsViewLocked` holds); the work summary in tokens should read `Runs` for the archive (waves review)
