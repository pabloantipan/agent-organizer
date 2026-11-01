---
title: "Deltagos's atlax slice: the nameplate, its readers and what it consumes, seeded by hand"
status: now
repos: [organizer]
branch: lf59-atlax-seed
seat: l59-atlax
reviewer: l59-atlax-rev
stage:
updated: 2026-11-01
next: "review: lf59-atlax-seed, S1-S4 and X0 pass, 1091b60"
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
