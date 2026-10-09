---
title: ram-sample G4 contradicts the top-five cap - list every session, or narrow the check
status: proposed
raised: 2026-10-09
raised_by: fse
owner: pablo
ruled:
ruled_by:
options: ["A: organizer memory lists every agent session grouped by initiative; the feed's top five stays for the popover", "B: G4 checks only the top five and camp's total in by_initiative"]
chosen:
cards: [ram-sample]
threads: []
supersedes: []
superseded_by:
---

## Question

rs-review failed ram-sample on G4 (6b0ccbe): "`organizer memory` must list
the crew's sessions by name with their initiative (the top-5 cap hides all
six camp seats)". The spec contradicts itself: FR-3 has the command print
"the top sessions" (FR-2 caps them at five), while G4 expects every crew
session by name. The build follows FR-3; the gate is what is wrong. Which
way does the spec go?

## Options

- **"A: organizer memory lists every agent session grouped by initiative;
  the feed's top five stays for the popover"**: FR-3 widened to print each
  initiative's total, then every one of its sessions with its memory (the
  data already exists: `mem_bytes` per agent, `by_initiative`). It is what
  you asked for on the command line today ("how ram is being used by each
  initiavie, each agent"). Cost: a small change in `internal/cli` by
  rs-build, then a re-review of G4 only.
- **"B: G4 checks only the top five and camp's total in by_initiative"**:
  no code change; the per-agent list waits for the Initiatives view (0106).

## Recommendation

A: it is small, and it is the per-agent view you asked for, available now
from the terminal.

## Note

The fault is the FSE's: a gate row that asked for more than its requirement.
