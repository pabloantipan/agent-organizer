---
waves:
  - wave: 1
    supervisor: sup11
    task: "the joins, first wave"
    cards: [w-review, w-queued]
    launched: 2026-09-24T10:05-03:00
    merged: 2026-09-24T13:40-03:00
    rounds:
      - card: w-review
        kind: build
        start: 2026-09-24T10:05-03:00
        end: 2026-09-24T11:10-03:00
        result: n/a
        reviewer:
        reason: "gate met G1-G2; head abc1234"
      - card: w-review
        kind: review
        start: 2026-09-24T11:12-03:00
        end: 2026-09-24T11:30-03:00
        result: fail
        reviewer: wave1-review
        reason: "gate row 2: the second row is not met"
      - card: w-review
        kind: build
        start: 2026-09-24T11:32-03:00
        end: 2026-09-24T12:05-03:00
        result: n/a
        reviewer:
        reason: "rework gate row 2; head abc1235"
      - card: w-review
        kind: review
        start: 2026-09-24T12:07-03:00
        end: 2026-09-24T12:20-03:00
        result: pass
        reviewer: wave1-review
        reason: "G1-G2 met at abc1235"
      - card: w-queued
        kind: take
        start: 2026-09-24T13:00-03:00
        end: 2026-09-24T13:35-03:00
        result: pass
        reviewer: pablo
        reason: "Pablo's take: reads right"
---

# The joins, first wave (fixture)

Two cards in the joins stage: a build, a failed review, a rework, a pass,
and Pablo's take.
