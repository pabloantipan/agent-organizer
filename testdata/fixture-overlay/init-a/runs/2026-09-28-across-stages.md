---
waves:
  - wave: 1
    supervisor: sup12
    task: "foundations and joins together"
    cards: [w-queued, w-nogate, w-founded]
    launched: 2026-09-28T09:00-03:00
    merged: 2026-09-28T12:15-03:00
    rounds:
      - card: w-founded
        kind: build
        start: 2026-09-28T09:00-03:00
        end: 2026-09-28T10:20-03:00
        result: n/a
        reviewer:
        reason: "gate met; head def5678"
      - card: w-nogate
        kind: build
        start: 2026-09-28T09:00-03:00
        end: 2026-09-28T10:45-03:00
        result: n/a
        reviewer:
        reason: "gate met; head def5679"
      - card: w-founded
        kind: review
        start: 2026-09-28T10:50-03:00
        end: 2026-09-28T11:20-03:00
        result: pass
        reviewer: sup12-review
        reason: "met at def5678"
      - card: w-nogate
        kind: ui-review
        start: 2026-09-28T10:50-03:00
        end: 2026-09-28T12:10-03:00
        result: pass
        reviewer: sup12-ui
        reason: "no sev 4 or 3"
  - wave: 2
    supervisor: sup13
    task: "the late card, outside any stage"
    cards: [w-later]
    launched: 2026-10-05T16:00-03:00
    merged:
    rounds:
      - card: w-later
        kind: build
        start: 2026-10-05T16:00-03:00
        end: 2026-10-05T17:30-03:00
        result: n/a
        reviewer:
        reason: "gate met; head 0a1b2c3"
      - card: w-later
        kind: review
        start: 2026-10-05T17:35-03:00
        end:
        result:
        reviewer: sup13-review
        reason: ""
---

# Foundations and joins together, then the late card (fixture)

Wave 1's cards sit in two stages (w-queued and w-nogate in joins;
w-founded, done, in foundations). Wave 2's card joins no stage and is still in review.
