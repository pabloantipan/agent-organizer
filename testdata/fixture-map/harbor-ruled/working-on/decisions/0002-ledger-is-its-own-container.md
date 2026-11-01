---
title: The ledger becomes its own container
status: ruled
raised: 2026-10-02
raised_by: fse
owner: pablo
ruled: 2026-10-03
ruled_by: pablo
options: ["its own container", "a module of harbor-api"]
chosen: its own container
cards: []
supersedes: []
superseded_by:
---

## Question

Does the ledger move out of harbor-api into its own container? (Fixture
record; the containers map's `ledger` node is `ruled`, grounded by it.)

## Ruling

pablo, 2026-10-03: its own container. harbor-web retires once the counter
moves into harbor-api.
