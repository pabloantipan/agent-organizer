---
title: "Deltagos's atlax slice consumes the record, and its first two readers are authored"
status: now
repos: [organizer]
branch: lf59-atlax-record
seat: l59-record
stage:
updated: 2026-11-01
next: "PR with talos-lab"
review: pass
reviewer: l59-record-rev
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
- S4 run bare (`atlax verify --repo .`, no --card) exits 1 with two book-guard findings, exactly PostUsage and ReadInitiative: with no card there is no change order. That is the guard working; S4 holds with the card (identical to S5). Once a card authors an element, S4 needs --card. Went to: docs/specs/atlax-seed.md Amendment 3, last paragraph (c9ab0c6).
- ReadInitiative's contract path is now the directory contracts/working-on/ (was expected.json): the test reads expected.json and sample/. Went to: nothing to file; FR-6 names `contracts/working-on/` itself.

## Review
- Verdict: **pass**. Unmet gate items: none.
- Reviewer: l59-record-rev, 2026-11-01, on c7cb263 (base origin/main 43e2bcd, origin re-pointed to github and fetched in the clean clone).
- Pin: card added at c1bda4c, ancestor of 525014f4; `git diff 525014f4 -- working-on/lf59-atlax-record.md` leaves `touches:` and `change_order:` unchanged. Pass.
- change-check (exit 0; it diffed against local main c9ab0c6, which shows the same 5 files as 43e2bcd..c7cb263): 5 files changed, all under `atlax/elements/`; `0 flags: outside boundary 0, outside footprint 0, undeclared 0, declared, not changed 0, new env var 0, new dependency 0, new host 0, risk 0, untested? 0, could not read 0, boundary unreadable 0`. Nothing to explain.
- S1, S2: Draft 2020-12 jsonschema against specs 54cf10d's plant/element schemas: plant.yaml and all 13 element files `valid`; file list identical to 43e2bcd (13). FR-5: the four record elements consume `fn:record.usage.post`, `fn:record.factories.keys.issue`, `.keys.revoke`, `.cells.post`, each present in `atlax/artifacts/agent-mailbox-record/elements/`; no summary says "unpublished".
- FR-6 / authored count: 2 (PostUsage, ReadInitiative); Report `authored: false`. `TestU1PostsThreeRowsWithContractKeys` (internal/service/usagepost_test.go:351) and `TestWorkingOnContract` (internal/scan/contract_test.go:150) exist at 43e2bcd, PASS with CONTRACTS_DIR, and FAIL naming the missing sample with an empty CONTRACTS_DIR, so each reads its sample. No code, test or fixture in the diff.
- S4 bare: `atlax verify agent-organizer: 2 finding(s), 2 blocking (book-guard 2); exit 1` (PostUsage, ReadInitiative not in a change order). Judged by --card per Amendment 3 (c9ab0c6).
- S4/S5 with `--card`: `atlax verify agent-organizer: 0 finding(s), 0 blocking; exit 0` (base_sha 43e2bcd, head_sha c7cb263, change_order modifies PostUsage and ReadInitiative).
- X0: pnpm install --frozen-lockfile, then `CONTRACTS_DIR=… XDG_DATA_HOME=$(mktemp -d) test-lease run --share -- make test` exit 0 (go: all ok; vitest 87 files, 1397 tests passed); `git status --porcelain` empty. Fresh run (full output, no replay; test-lease printed no run id).
- Evidence: .wt-notes/l59-record-rev/ (change-check.txt, s1s2.txt, s4-bare.txt, s4-card.txt, s5.json, x0.log).
