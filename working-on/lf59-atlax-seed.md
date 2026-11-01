---
title: "Deltagos's atlax slice: the nameplate, its readers and what it consumes, seeded by hand"
status: now
repos: [organizer]
branch: lf59-atlax-seed
seat: l59-atlax
stage:
updated: 2026-11-01
next: "decide: S4 cannot hold as written: `ATLAX_NO_PULL=1 atlax verify --repo .` exits 1 with a blocking ext-break for any consumes: ext:agent-mailbox-record#… ('agent-mailbox-record's published folder does not hold it'; atlax.py:731-746 checks every consumes: line, authored or not, and $ATLAX_DIR/artifacts/ holds only agent-mailbox-api). FR-2 requires those lines. Amend S4 (accept ext-break for the unpublished record), drop record consumes: until it is published, or wait for its seed? Also the working-on and factory-report readers have no published artifact to consume. Nothing committed; .wt-notes/l59-atlax/progress.md"
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
