---
title: Cut the scan report to what is read
status: next
repos: [repo-one]
branch: w-wide
updated: 2026-10-04
next: "Wait for 0010"
stage: joins
---

## Goal
The nightly scan's report fits a window.

## Today

```
organizer scan --report --columns id,client,machine,stage,phase,now,blocked,next,waiting,problems --since 2026-09-01T00:00:00-03:00 --format table --no-color
```

| id | client | machine | stage | phase | now | blocked | next | waiting | problems |
|---|---|---|---|---|---|---|---|---|---|
| init-a | acme | lodestar | joins | building | 1 | 1 | 3 | 2 | 4 |
| init-b | personal | the-laptop | foundations | discovery | 0 | 0 | 2 | 1 | 0 |

## Gate
- [ ] G1: the report is the columns 0010 rules

## Next
1. Wait for 0010
