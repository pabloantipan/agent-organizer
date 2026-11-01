---
title: "Deltagos's atlax slice consumes the record, and its first two readers are authored"
status: now
repos: [organizer]
branch: lf59-atlax-record
seat: l59-record
stage:
updated: 2026-11-01
next: "review: lf59-atlax-record, gate met (S1, S2, S5, X0; S4 exit 0 with --card, see Notes), c7cb263"
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

## Declared changes
- modified `atlax/elements/prod.agent-organizer.record.IssueKey.yaml`: consumes ext:agent-mailbox-record#fn:record.factories.keys.issue (FR-5); summary and header drop "unpublished"/"planned"
- modified `atlax/elements/prod.agent-organizer.record.RevokeKey.yaml`: consumes fn:record.factories.keys.revoke (FR-5); same wording
- modified `atlax/elements/prod.agent-organizer.record.RegisterCell.yaml`: consumes fn:record.factories.cells.post (FR-5); same wording
- modified `atlax/elements/prod.agent-organizer.record.PostUsage.yaml`: consumes fn:record.usage.post (FR-5); authored: true with contracts/usage-batch.json and its existing test TestU1PostsThreeRowsWithContractKeys (FR-6)
- modified `atlax/elements/prod.agent-organizer.scan.ReadInitiative.yaml`: authored: true, contract path contracts/working-on/, test internal/scan/contract_test.go:TestWorkingOnContract (FR-6)
Risky:
- `PostUsage`, `ReadInitiative`: now redlines; a change to usagepost_test.go, contract_test.go or the specs samples needs a change order
Not changed, on purpose:
- `atlax/elements/prod.agent-organizer.service.Report.yaml`: stays unauthored until lf57-report-go lands
- any code, test or fixture: boundary atlax/ only; no test written

## Done
- 2026-11-01 l59-record: FR-5 and FR-6 on lf59-atlax-record (4fbd098, c7cb263, unmerged). S1, S2 valid; S5 exit 0, 0 findings, both named tests run by verify and pass; X0 make test pass, tree clean. Evidence and commands in .wt-notes/l59-record/ (progress.md, verify-s5.json).

## Notes
- S4 run bare (`atlax verify --repo .`, no --card) exits 1 with two book-guard findings, exactly PostUsage and ReadInitiative: with no card there is no change order. That is the guard working; S4 holds with the card (identical to S5). Once a card authors an element, S4 needs --card.
- ReadInitiative's contract path is now the directory contracts/working-on/ (was expected.json): the test reads expected.json and sample/.

