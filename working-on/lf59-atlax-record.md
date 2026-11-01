---
title: "Deltagos's atlax slice consumes the record, and its first two readers are authored"
status: now
repos: [organizer]
branch: lf59-atlax-record
seat: l59-record
stage:
updated: 2026-11-01
next: "l59-record builds FR-5, FR-6 on lf59-atlax-record (sup102 launched 2026-11-01 16:30)"
depends_on: [lf59-atlax-calls]
boundary: ["atlax/"]
spec: "docs/specs/atlax-seed.md (Amendment 3, FR-5 and FR-6)"
gate: "docs/specs/atlax-seed.md#Acceptance → gate"
ui_review: false
autonomy: unattended
touches: [prod:agent-organizer.record.PostUsage, prod:agent-organizer.record.IssueKey, prod:agent-organizer.record.RevokeKey, prod:agent-organizer.record.RegisterCell, prod:agent-organizer.scan.ReadInitiative]
change_order:
  adds: []
  modifies: [prod:agent-organizer.record.PostUsage, prod:agent-organizer.scan.ReadInitiative]
  retires: []
---

## Goal
A change to the record's usage, key or cell calls tells the organizer's FSE, and the two readers with a contract test are promises atlax checks.

## Gate
docs/specs/atlax-seed.md, rows S1, S2 (the changed files), S4, S5 and X0.

## Pre-answered
- Base: origin/main at the card's start (includes #12 and #13, the slice).
- Merge target: `main` through talos-lab's PR.
- Tests: `atlax verify` (`~/claudecode/bin/atlax`) and `make test`; no new test is written: an authored element names an existing test.
- Short-sample fallback: if an element's named test does not pass or does not read its sample, it stays unauthored and the card says why; never a new test written to pass the guard.
- Data shape across states: element files per `contracts/atlax/element.schema.json` at specs 54cf10d.
- Evidence: `atlax verify --json` output under `.wt-notes/<seat>/`.
- `atlax publish` and `atlax check` are never run from the card: atlax-watch publishes on merge.
- Retention: n/a.
