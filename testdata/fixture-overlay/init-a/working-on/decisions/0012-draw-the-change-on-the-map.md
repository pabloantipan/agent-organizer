---
title: Draw the change on the map
status: ruled
raised: 2026-10-15
raised_by: fse
owner: pablo
ruled: 2026-10-15
ruled_by: pablo
options: [figure, prose]
chosen: figure
cards: []
threads: []
supersedes: []
superseded_by:
---

## Question

Does a record show its change as a figure on the base map, or in prose?

## Change on the map

```mermaid
flowchart LR
    pwa["PWA"] --> bff["✎ BFF"]
    bff --> payments_svc["✚ Payments"]
    payments_svc --> datastore[("Datastore")]
    bff --> legacy_pay["✕ Legacy pay"]
    class pwa,datastore context
    class bff changed
    class payments_svc added
    class legacy_pay removed
    classDef added   fill:#e6f4ea,stroke:#1e7f3c,color:#14532d,stroke-width:2px
    classDef changed fill:#fff4d6,stroke:#b8860b,color:#6b4e00,stroke-width:2px
    classDef removed fill:#fdecef,stroke:#c00000,color:#8b0000,stroke-dasharray:5 3
    classDef context fill:#f3f4f6,stroke:#c4c7cc,color:#8a8f98
```

## The nightly scan, end to end

```mermaid
flowchart LR
    cron["Nightly timer"] --> scan["Scan the roots"] --> cards["Read the cards"] --> records["Read the records"]
    records --> roadmap["Read the roadmap"] --> merge["✎ Merge the board"] --> cache["Write the cache"]
    cache --> sync["Push the snapshot"] --> pull["Pull every machine"] --> board["Draw the board"]
    class cron,scan,cards,records,roadmap,cache,sync,pull,board context
    class merge changed
```

## Options

- **figure**: the change drawn on the base map, with a text line under it.
- **prose**: the change described in words only.

## Ruling

figure. pablo, 2026-10-15, in the organizer on fixture.
