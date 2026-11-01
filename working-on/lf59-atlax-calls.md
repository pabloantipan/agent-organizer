---
title: "Deltagos's atlax slice names its five other mailbox calls"
status: now
repos: [organizer]
branch: lf59-atlax-calls
seat: l59-calls
reviewer: l59-calls-rev
stage:
updated: 2026-11-01
next: "talos-lab merges the PR (seed first, then calls); the FSE moves it to done/ on the merge sha. sup97 ended 2026-11-01"
review: pass
depends_on: [lf59-atlax-seed]
boundary: ["docs/specs/atlax-seed.md Boundary"]
spec: "docs/specs/atlax-seed.md (Amendment 2)"
gate: "docs/specs/atlax-seed.md#Acceptance → gate"
ui_review: false
---

## Goal
An upstream change to any mailbox call Deltagos makes tells its FSE.

## Gate
docs/specs/atlax-seed.md, rows S1, S2 (the five calls), S4 and X0.

## Done
- Five unauthored elements, one per mailbox call in client.go (Thread, Post, SetStatus, Search, PickUp), each consuming its published agent-mailbox-api element; method and path checked against the published files (f096ef2).
- S1, S2: plant and all 13 elements valid by contracts/atlax/test.py's validator; the list is the 8 plus these 5.
- X0: make test in a clean clone exit 0, git status --porcelain empty.
- S4: `atlax verify agent-organizer: 0 finding(s), 0 blocking; exit 0`

## Declared changes
- added `atlax/elements/prod.agent-organizer.discuss.Thread.yaml`: client.go Thread, consumes fn:mailbox.thread.get
- added `atlax/elements/prod.agent-organizer.discuss.Post.yaml`: client.go Post, consumes fn:mailbox.messages.post
- added `atlax/elements/prod.agent-organizer.discuss.SetStatus.yaml`: client.go SetStatus, consumes fn:mailbox.thread.status.set
- added `atlax/elements/prod.agent-organizer.discuss.Search.yaml`: client.go Search, consumes fn:mailbox.search
- added `atlax/elements/prod.agent-organizer.discuss.PickUp.yaml`: client.go PickUp (the drain), consumes fn:mailbox.drain
Risky:
- `PickUp`: designation follows the Go function, not the endpoint's name (drain), as Amendment 2's "<Func>" shape asks
Not changed, on purpose:
- `atlax/plant.yaml` and the eight existing elements: outside this card
- `test:` names TestClientRoundTrips, which exercises all five; `authored` stays false

## Notes
- Search's element names the client's filters; the only caller today (service/cell.go:412) passes just Limit. Went to: no defect; it is written in `prod.agent-organizer.discuss.Search.yaml`'s summary at f096ef2.

## Review
- Verdict: **pass** at f096ef2 (branch `lf59-atlax-calls`, full sha f096ef2e3271; reviewed only 1091b60..f096ef2, five added files under `atlax/elements/`). Unmet gate items: none.
- Reviewer: l59-calls-rev, 2026-11-01. Clean clone at f096ef2, removed at the end; logs in `.wt-notes/l59-calls-rev/`.
- change-check (base origin/main 1a5ba08 as the clone saw it): 14 files, 9 flags, all `undeclared`, 0 outside boundary, 0 declared-not-changed. The nine are `atlax/plant.yaml` and the eight elements Health, ThreadsByStatus, record.IssueKey, PostUsage, RegisterCell, RevokeKey, scan.ReadInitiative, service.Report: exactly what 1091b60 (lf59-atlax-seed, reviewed pass, not on main) adds; `git diff 1091b60..f096ef2` holds only the five declared files.
- S1: `atlax/plant.yaml` valid against plant.schema.json (agent-mailbox-specs 54cf10d), by `contracts/atlax/test.py`'s own `validate`; the validator rejects a planted bad `kind` and a string `authored` (negative check).
- S2: all 13 elements valid against element.schema.json. client.go's seven Client calls are Thread, Post, SetStatus, ThreadsByStatus, Search, Health, PickUp: the 2 from 1091b60 plus these 5, none missing, none extra; the 8 from 1091b60 unchanged. Each new `consumes:` names a file in `atlax/artifacts/agent-mailbox-api/elements/` (fn.mailbox.thread.get, messages.post, thread.status.set, search, drain), and each `terminal` method and path equals the published one.
- S3 (not a row here): authored count 0 (13 × `authored: false`).
- S4 (`atlax verify --repo <clone>`, ATLAX_DIR=/Users/pabloantipan/atlax, origin set to github agent-organizer and fetched, origin/main 21b5d5d): `atlax verify agent-organizer: 0 finding(s), 0 blocking; exit 0`. Negative check on a throwaway copy: `consumes: …#fn:mailbox.nope` gives `1 blocking (ext-break 1); exit 1`.
- X0: fresh run (go tests uncached, vite build ran; test-lease printed no run id): `make test` exit 0, 19 Go packages ok, vitest 86 files / 1297 tests passed; `git status --porcelain` empty.
- Builder's "Found, not asked": Search filters, see Notes; PickUp at retire (`service/retire.go:269,280`) went to: no defect, written in `prod.agent-organizer.discuss.PickUp.yaml`'s summary; the refused `npm ci` went to: nothing to file, tooling behaved as designed.

