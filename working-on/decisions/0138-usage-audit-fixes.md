---
title: Usage numbers - fix the money of resumed sessions, and choose what hours and missing costs mean
status: proposed
raised: 2026-10-15
raised_by: fse
owner: pablo
options:
  - "fix money now; hours = active, a 5-minute gap rule; keep a price table for missing costs and the split"
  - "fix money now; hours = wall clock with any session working; keep a price table for missing costs and the split"
  - "fix money now; drop hours from the view; no price table, missing costs stay shown as missing"
  - "send back"
cards: [uc-resume]
forecast: 25-50m
threads: [01M50ZTJGYCSX4VTJB1SRR7EB3]
supersedes: []
superseded_by:
ruled:
ruled_by:
chosen:
---

## Question

You asked "are we sure of these numbers?"; Hephaistos recomputed this week
from the raw transcripts (`docs/specs/usage-audit.md` has the detail).
Tokens, sessions and who did what are right. Three things are not:

1. **Money of a resumed or woken seat is too low, every week.** Each time a
   seat restarts, Claude Code's cost counter starts again at zero, and the
   organizer keeps only the largest count. The FSE session shows $18.08;
   it really cost about $74.71. Last week shows $783.08; about $801.82.
   This is a plain bug: card `uc-resume`, ready.
2. **"179 h of work" is not work.** It adds up the time each session was
   open each day, idle and parallel ones included. Active time (messages
   less than about 5 minutes apart) is about 65 h; wall clock with any
   session working is about 18.7 h. Which do you want to read, or none?
3. **A session with no cost record shows $0** (the week of 17 Aug: 342M
   tokens, $0.00), and cost is split across days and models by token
   count, not price. Both need a price table the organizer keeps (today's
   Opus 5.5 prices are checked); without one, a missing cost stays shown as
   missing, never as $0.

forecast for uc-resume: 25-50 min over 1 wave; basis: one-card Go tasks
here (usage-post landed today inside its 25-50m). Hours and the price table
are cut as their own small card after your choice.

## Options

- **"fix money now; hours = active, a 5-minute gap rule; keep a price table for missing costs and the split"**
- **"fix money now; hours = wall clock with any session working; keep a price table for missing costs and the split"**
- **"fix money now; drop hours from the view; no price table, missing costs stay shown as missing"**
- **"send back"**: say what is wrong.

## Recommendation

The FSE: the first. Active hours answer "how much did the agents work",
which is what the label promises; wall clock answers "how long was the
factory busy", a second number worth adding later if you want it. A price
table is a small file to keep current, and it is the only way the 17 Aug
week stops reading $0.

## Ruling

## Consequences

On any "fix money now": uc-resume runs in the next wave (with rm-v0, after
sup73's). On a price table or an hours rule: one more card from this spec.
