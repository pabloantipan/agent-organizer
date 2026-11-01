---
title: "Deltagos's atlax slice: the nameplate, its readers and what it consumes, seeded by hand"
status: now
repos: [organizer]
branch: lf59-atlax-seed
seat: l59-atlax
reviewer: l59-atlax-rev
review: pass
stage:
updated: 2026-11-01
next: "PR with talos-lab"
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

## Done
- 2026-11-01 l59-atlax: plant.yaml (dcaac86) and 8 unauthored elements (1091b60) under Amendment 1; S1/S2 valid, none missing or extra; authored 0 (S3); S4 `atlax verify agent-organizer: 0 finding(s), 0 blocking; exit 0`; X0 make test pass in a clean clone, porcelain empty. Commands in .wt-notes/l59-atlax/progress.md.

## Declared changes
- added `atlax/plant.yaml`: Deltagos's nameplate, artifact agent-organizer (FR-1)
- added `atlax/elements/prod.agent-organizer.discuss.ThreadsByStatus.yaml`: mailbox thread list read, consumes ext:agent-mailbox-api#fn:mailbox.threads.list (FR-2)
- added `atlax/elements/prod.agent-organizer.discuss.Health.yaml`: mailbox health read, consumes ext:agent-mailbox-api#fn:mailbox.health (FR-2)
- added `atlax/elements/prod.agent-organizer.record.IssueKey.yaml`: POST /v1/factories/keys, record unpublished, no consumes (Amendment 1)
- added `atlax/elements/prod.agent-organizer.record.RevokeKey.yaml`: POST /v1/factories/{f}/keys/revoke, same
- added `atlax/elements/prod.agent-organizer.record.RegisterCell.yaml`: POST /v1/factories/{f}/cells, same
- added `atlax/elements/prod.agent-organizer.record.PostUsage.yaml`: usage post, reader of usage-batch.json and the record's /v1/usage call in one element
- added `atlax/elements/prod.agent-organizer.scan.ReadInitiative.yaml`: working-on reader, kind data, provider named in summary
- added `atlax/elements/prod.agent-organizer.service.Report.yaml`: factory-report reader, kind data, lifecycle planned (lf57-report-go)
Risky:
- `kind: data` for the two readers: the schema has no file-reader kind; a later extractor may want another
Not changed, on purpose:
- Wails methods and CLI subcommands: wait for Hephaistos's extractor (FR-4)
- consumes: for the record and the two readers: their providers are unpublished (Amendment 1)

## Notes
- 2026-11-01 l59-atlax: premise check stopped the build before any commit; S4 probe, cause and the two readers with no ext: producer are in `.wt-notes/l59-atlax/progress.md`. The spec (5c33dd0) is on local main, not on origin/main 21b5d5d.
- 2026-11-01: decide settled by the FSE, atlax-seed.md Amendment 1 (77b2321).

## Review
- Verdict: **pass** at 1091b60 (1091b60335872c1b48fc800ca777d18a7861ffe6), from a clean clone at `.wt-notes/l59-atlax-rev/clean`, removed after the review.
- Unmet gate items: none.
- Reviewer: l59-atlax-rev, 2026-11-01.
- I read the spec from the root's local main (atlax-seed.md 5c33dd0 plus Amendment 1, 77b2321). The branch base 21b5d5d has none of it: `docs/specs/atlax-seed.md` is missing there, so FR-1 to FR-4, S1-S4, X0 and Amendment 1 are all absent from the base (`git merge-base --is-ancestor 5c33dd0 origin/main` is false, and origin/main is 21b5d5d).
- change-check (`change-check organizer lf59-atlax-seed`, run from the clone): base ef6dc6a (the clone's origin/main is the root's local main), head 1091b6033, 9 files, all added under `atlax/`. It printed `0 flags: outside boundary 0, outside footprint 0, undeclared 0, declared, not changed 0, new env var 0, new dependency 0, new host 0, risk 0, untested? 0, could not read 0, boundary unreadable 0`, so there is nothing to explain. `git diff --stat 21b5d5d 1091b60` shows the same 9 files and 143 insertions, with no code, test or fixture change.
- S1: `atlax/plant.yaml` is valid against plant.schema.json (agent-mailbox-specs 54cf10d, checked with the validator in its own `contracts/atlax/test.py`). The FR-1 fields match: agent-organizer, organizer-fse, norm "0.1" as a string, the repo, c4_system deltagos. Control: an unquoted norm 0.1 is refused (`$.norm: 0.1 is not string`).
- S2: all 8 element files are valid against element.schema.json (control: kind `file` is refused). I compared the list to FR-2 from the code:
  - record: IssueKey `/v1/factories/keys`, RevokeKey `/v1/factories/{f}/keys/revoke` and RegisterCell `/v1/factories/{f}/cells` (record.go:73, 89, 96), plus usage `/v1/usage` (usage.go:53). That is 4 elements; the usage post and the usage reader are the same call, so they share one element, PostUsage.
  - mailbox: health (discuss.go:164) and the thread list (client.go:161, `/threads?status=`). That is 2.
  - readers: the working-on reader and the factory-report reader. That is 2.
  - None is missing and none is extra.
  - consumes: only Health (→ `fn:mailbox.health`) and ThreadsByStatus (→ `fn:mailbox.threads.list`) carry one. Both targets are files in `/Users/pabloantipan/atlax/artifacts/agent-mailbox-api/elements/` with the same method and path. The other six have no consumes: and name their provider in summary, as Amendment 1 asks.
- S3: the authored count is 0. No element is `authored: true`. At 21b5d5d no Go file names CONTRACTS_DIR or a `contracts/` path (`git grep` prints nothing), and TestU1PostsThreeRowsWithContractKeys hardcodes the keys instead of reading usage-batch.json, so 0 is correct. Every named `test:` exists at 21b5d5d (discuss_test.go:14, client_test.go:14, record_test.go:85, usagepost_test.go:154), and every `contract:` path exists in specs 54cf10d.
- S4 (`ATLAX_DIR=/Users/pabloantipan/atlax ~/claudecode/bin/atlax verify --repo <clone> --base 21b5d5d`; I used `--base` and did not change the remote) printed `atlax verify agent-organizer: 0 finding(s), 0 blocking; exit 0`, with JSON findings `[]`. Control on a throwaway copy where Health consumes `fn:mailbox.nosuch`: `1 finding(s), 1 blocking (ext-break 1); exit 1`.
- X0: `pnpm install --frozen-lockfile` succeeded. `XDG_DATA_HOME=$(mktemp -d) test-lease run --share -- make test` exited 0: every Go package ok, and vitest passed 86 files and 1297 tests. `git status --porcelain` is empty afterwards. The run was fresh: the frontend build and every package ran under the lease, nothing was replayed, and no run id was printed.
- The builder's "Found, not asked" items:
  - Found 1 (the spec is not on origin/main) has no home yet; see next.
  - Found 2 (the two readers have no ext: producer) went to atlax-seed.md Amendment 1 (77b2321, under 0171).
- Note 1 (outside the gate, does not fail the card): internal/discuss/client.go makes five more mailbox calls that have no element: thread get (:139), post message (:146), thread status (:152), search (:180) and drain (:224). FR-2 names only the thread list and health, so the gate holds. Still, if upstream changes `/messages` or `/drain`, nothing will tell this repo. It has no home yet; see next.
- Note 2: PostUsage covers both the usage reader and the `/v1/usage` call in one element. Both of FR-2's lists name it, so I read one file as correct, not as a missing one.
- Findings filed (sup97, 2026-11-01): Found 1 → talos-lab's working-on PR carries 5c33dd0 and 77b2321 to origin; Note 1 → FSE, thread 01M6C098RAEXKJN36RCRYKRJFX (five unelemented mailbox calls).
