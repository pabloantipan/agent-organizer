---
title: "Deltagos's atlax slice: the nameplate, its readers and what it consumes, seeded by hand"
status: now
repos: [organizer]
branch: lf59-atlax-seed
seat: l59-atlax
stage:
updated: 2026-11-01
next: "l59-atlax builds it under Amendment 1 (77b2321): consumes: only for agent-mailbox-api; record calls and the two readers name their provider in summary"
depends_on: []
boundary: ["docs/specs/atlax-seed.md Boundary"]
spec: "docs/specs/atlax-seed.md (FR-1 to FR-4)"
gate: "docs/specs/atlax-seed.md#Acceptance → gate"
ui_review: false
---

## Goal
Deltagos is in the platform's architecture model, so a change upstream that breaks what it reads tells its FSE.

## Gate
docs/specs/atlax-seed.md, rows S1-S4 and X0.

## Notes
- 2026-11-01 l59-atlax: premise check stopped the build before any commit; S4 probe, cause and the two readers with no ext: producer are in `.wt-notes/l59-atlax/progress.md`. The spec (5c33dd0) is on local main, not on origin/main 21b5d5d.
- 2026-11-01: decide settled by the FSE, atlax-seed.md Amendment 1 (77b2321).
