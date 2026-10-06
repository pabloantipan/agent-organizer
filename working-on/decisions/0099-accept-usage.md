---
title: Accept the usage spec and launch its two cards; money in Usage only
status: proposed
raised: 2026-10-06
raised_by: fse
owner: pablo
ruled:
ruled_by:
options: ["accept as written, and money shows only in Usage (0020 narrowed)", "accept, and money shows wherever tokens do (0020 superseded)", "accept with amendments", "send back"]
chosen:
cards: [usage-ledger, usage-view]
threads: []
supersedes: []
superseded_by:
---

## Question

Your ask (0098): token consumption and money as clear as possible, weekly,
in Deltagos, with a history.

Two cards, one after the other:

1. **usage-ledger**: every Claude session on this Mac gets its real tokens
   (input, output, cache read, cache write) summed from its transcript, and
   its money from Claude Code's own cost, per day. Each session is tied
   to its initiative, its role (supervisor, builder, reviewer, FSE, persona,
   pair) and its card **when it is first seen**, so a builder still counts
   after its worktree is gone. That is why builders and reviewers showed no
   tokens. Kept in a history file on this Mac; `organizer usage` prints it.
2. **usage-view**: Aglaea's design (`docs/ux/specs/usage.md`): a Usage view
   from the top bar; this week's money, tokens and sessions; 12 weeks of
   money; one table by initiative, role, task or model; `Not attributed`
   always last, with its reason.

Off the machine (both laptops, a cloud table) waits on Hephaistos's record;
neither card writes to a cloud.

**One question for you (Aglaea's O2):** 0020 says cards and waves show
tokens, not dollars ("just token consumption"). 0098 asks for money. Her
design keeps money **only in Usage**; cards, waves and Agents stay tokens.
Or money everywhere tokens show.

Build spec `docs/specs/usage.md`. Every gate row is a seat's (0095).

forecast: 2-4 h of wave time over 2 waves (the view waits on the ledger),
plus this decision; basis: today's single-card tasks, 52-90 min each (run
records 2026-10-06), and a new Go package plus a new view counted as two.

## Options

- **accept as written, and money shows only in Usage (0020 narrowed)**
- **accept, and money shows wherever tokens do (0020 superseded)**
- **accept with amendments**: name them.
- **send back**: say what is wrong.

## Recommendation

The FSE's and Aglaea's: accept as written, money only in Usage. One place
for money keeps the cards about the work.

## Ruling
