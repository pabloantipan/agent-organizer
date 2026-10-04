---
title: How wide the scan report may be
status: proposed
raised: 2026-10-04
raised_by: fse
owner: pablo
ruled:
ruled_by:
options: [ten columns, five columns, one column per machine]
chosen:
stage: joins
cards: [w-wide]
threads: []
supersedes: []
superseded_by:
---

## Question

The nightly scan prints one line per initiative, and the line has grown to
ten columns. Is that the report we want, or should it be cut? This is the
command and what it prints today:

```
organizer scan --report --columns id,client,machine,stage,phase,now,blocked,next,waiting,problems --since 2026-09-01T00:00:00-03:00 --format table --no-color
```

| initiative id | client | machine | current stage | phase | now cards | blocked cards | next cards | waiting decisions | scanner problems |
|---|---|---|---|---|---|---|---|---|---|
| init-a | acme | lodestar.local | joins | building | 1 | 1 | 3 | 2 | 4 |
| init-b | personal | the-laptop.local | foundations | discovery | 0 | 0 | 2 | 1 | 0 |

## Options

- **ten columns**: keep it as it is.
- **five columns**: id, stage, now, blocked, waiting.
- **one column per machine**: a matrix, machines across.

## Recommendation

The FSE's: five columns.

## Ruling

## Consequences

A record whose Question holds a wide code block and a ten-column table, so
the rule box, the record on Decisions and its card's back each have a body
that scrolls sideways inside itself (leftovers-7 FR-5, FR-9, P4).
