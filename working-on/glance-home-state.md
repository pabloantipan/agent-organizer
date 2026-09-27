---
title: Home says each initiative's phase and state, for twenty
status: now
repos: [organizer]
branch: glance-home-state
seat: wave1-home
updated: 2026-09-27
next: "review: glance-home-state, gate G7, G8, G10 met, G9 material in .wt-notes/wave1-home, 9fc3f3d 2b001c1 9c1a1f8"
depends_on: ["glance-scope-phase"]
boundary: ["frontend/src/components/Home.tsx", "frontend/src/lib/initiativeState.ts (new)", "frontend/src/lib/queue.ts (read only, unless the lead's name moves there)", "scripts/fixture-home.sh", "testdata/fixture-twenty/ (new)", "frontend/src/styles/ (Home's CSS only)"]
spec: "docs/specs/twenty-at-a-glance.md (FR-6, FR-7); values: docs/design-system.md"
gate: "docs/specs/twenty-at-a-glance.md Acceptance, rows G7, G8, G9, G10; the Gate section below"
stage: twenty-at-a-glance
---

## Goal
Roadmap stage twenty-at-a-glance (0032): FR-6, FR-7 of `docs/specs/twenty-at-a-glance.md`.

## Gate
- [x] G7: see `docs/specs/twenty-at-a-glance.md`, Acceptance
- [x] G8: see `docs/specs/twenty-at-a-glance.md`, Acceptance
- [ ] G9: see `docs/specs/twenty-at-a-glance.md`, Acceptance
- [x] G10: see `docs/specs/twenty-at-a-glance.md`, Acceptance

## Done
- 2026-09-27 cut from the spec by the FSE
- 2026-09-27 wave1-home: Home rows show phase and one state (9fc3f3d `lib/initiativeState.ts`, 2b001c1 `Home.tsx` + `styles/home.css`), `fixture-home.sh --twenty` (9c1a1f8, `testdata/fixture-twenty/`), rebased on main at ec3d878, unmerged. G7: `.wt-notes/wave1-home/G7-home-twenty.png` and `-2.png` (wails dev on --twenty, every row one state word and its phase, all 20 rows in -2). G8: `G8-status.txt`, `go run . status` lists 20 initiatives, no problems; states executing 4 (auth-gateway, billing-api, field-app, ops-dashboard), waits on you 3, waits on business 2, quiet 11; phases discovery 5, building 10, no roadmap 5. G9 material: `G9-home-1440x900.png` (built app, 1440×900 window capture, all 20 rows) and `G9-key.md`. G10: `npm run build` → `✓ built in 1.08s`; the G18 grep over `git diff main...glance-home-state` printed nothing (exit 1).

## Next
1. review: glance-home-state — a reviewer who did not build it answers G9 from the screenshot, timed, then opens the key

## Blockers
none

## Notes
- 2026-09-27 sup5 runs this card (organizer-probe-sup5), spawned by the FSE after 0033
- 2026-09-27 sup5: seat wave1-home, branch glance-home-state in .wt/glance-home-state; evidence under .wt-notes/wave1-home/
- 2026-09-27 sup5: G9 is the reviewer's row, not the builder's: the builder leaves the screenshot (G9-home-1440x900.png) and the key (which initiative is in which state) in a separate file the reviewer opens only after answering; the reviewer times itself and flips G9
- 2026-09-27 sup5: new rules go in styles/home.css (new), not shell.css, which the header card also draws from
- 2026-09-27 wave1-home: executing cannot come from files alone — the scan reads agents from the process table. `--twenty` starts four stand-in processes (a sleep named after the config's `agent_binary`) in the cards' `.wt/<slug>`, and the real scan joins them; `kill $FIXTURE_AGENT_PIDS` ends them. Details in `testdata/fixture-twenty/README.md` and `.wt-notes/wave1-home/progress.md`.
- 2026-09-27 wave1-home: FR-6 read literally leaves "waits on business" unreachable, since `needsMeRows` lists every proposed record whoever owns it and "waits on you" is tried first. `initiativeState.ts` counts a decision row as the lead's only when its owner is empty or the lead; queue.ts is untouched.
- 2026-09-27 wave1-home: decide: should Needs me (and its badge) keep listing proposed records owned by business or the FSE? Today it does (6 rows in the --twenty fixture for 3 initiatives that wait on you); dropping them is a change to `needsMeRows` in queue.ts.
- 2026-09-27 wave1-home: the queue reads `pablo:` cards only in initiatives with a cell (`queueOf` skips groups without one), so such a card elsewhere never reaches Needs me.
