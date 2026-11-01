---
title: "Deltagos's atlax slice names its five other mailbox calls"
status: now
repos: [organizer]
branch: lf59-atlax-calls
seat: l59-calls
reviewer: l59-calls-rev
stage:
updated: 2026-11-01
next: "review: lf59-atlax-calls, S1, S2, S4 and X0 pass, f096ef2"
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
- Search's element names the client's filters; the only caller today (service/cell.go:412) passes just Limit.
