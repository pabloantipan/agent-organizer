---
title: Home says each initiative's phase and state, for twenty
status: next
repos: [organizer]
branch: glance-home-state
seat: wave1-home
updated: 2026-09-27
next: "Show each Home row's phase and one state (waits on you, executing, waits on business, quiet); a --twenty fixture; the timed end-to-end"
depends_on: ["glance-scope-phase"]
boundary: ["frontend/src/components/Home.tsx", "frontend/src/lib/initiativeState.ts (new)", "frontend/src/lib/queue.ts (read only, unless the lead's name moves there)", "scripts/fixture-home.sh", "testdata/fixture-twenty/ (new)", "frontend/src/styles/ (Home's CSS only)"]
spec: "docs/specs/twenty-at-a-glance.md (FR-6, FR-7); values: docs/design-system.md"
gate: "docs/specs/twenty-at-a-glance.md Acceptance, rows G7, G8, G9, G10; the Gate section below"
stage: twenty-at-a-glance
---

## Goal
Roadmap stage twenty-at-a-glance (0032): FR-6, FR-7 of `docs/specs/twenty-at-a-glance.md`.

## Gate
- [ ] G7: see `docs/specs/twenty-at-a-glance.md`, Acceptance
- [ ] G8: see `docs/specs/twenty-at-a-glance.md`, Acceptance
- [ ] G9: see `docs/specs/twenty-at-a-glance.md`, Acceptance
- [ ] G10: see `docs/specs/twenty-at-a-glance.md`, Acceptance

## Done
- 2026-09-27 cut from the spec by the FSE

## Next
1. Show each Home row's phase and one state (waits on you, executing, waits on business, quiet); a --twenty fixture; the timed end-to-end

## Blockers
none

## Notes
- 2026-09-27 sup5 runs this card (organizer-probe-sup5), spawned by the FSE after 0033
- 2026-09-27 sup5: seat wave1-home, branch glance-home-state in .wt/glance-home-state; evidence under .wt-notes/wave1-home/
- 2026-09-27 sup5: G9 is the reviewer's row, not the builder's: the builder leaves the screenshot (G9-home-1440x900.png) and the key (which initiative is in which state) in a separate file the reviewer opens only after answering; the reviewer times itself and flips G9
- 2026-09-27 sup5: new rules go in styles/home.css (new), not shell.css, which the header card also draws from
