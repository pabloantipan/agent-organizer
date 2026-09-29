---
title: Accept the ui-leftovers spec, and launch its card
status: proposed
raised: 2026-09-29
raised_by: fse
owner: pablo
ruled:
ruled_by:
options: [accept as written, accept with amendments, send back]
chosen:
cards: [ui-leftovers]
threads: [01M3Q04G1TTG9JX71GA5CKMWBW]
supersedes: []
superseded_by:
stage: discovery-in-a-cell
---

## Question

Is `docs/specs/ui-leftovers.md` (proposed) the fix for what the last three
waves' UI reviewers left at severity 2–1? Aglaea merged the findings into 14
ranked rows (`docs/ux/reviews/2026-09-29-triage-ui-leftovers.md`) and wrote
the design-system rules they break (ec3ecbb, "Focus and names"). One
frontend card, with a UI reviewer:

- **The rule box:**
  - shows the Question and the Recommendation, not a repeated Options list;
  - fits the window;
  - its link opens the record.
- **The keyboard:** focus goes into what opens and back on close, and every
  verb names its row ("Rule init-a 0002").
- **Conversations:** the accent only on a commit; with no token, the reason
  is said once.
- **Blockers:** a missing persona file replaces "waits on its first launch"
  everywhere and says who writes it; "no owner" is the one phrase.
- **The fixture:** a thread that asks you, a roster record with seat lines,
  and health that names the fixture's cells, so the UI reviewer can see
  Answer and the roster.

forecast: 30–46 min of wave time over 1 wave, plus this decision (median
0 d); basis: 26 cards in 13 single-wave tasks, this initiative, plus ~10 min
for the UI reviewer on the critical path (sup18, sup19).

## Options

- **accept as written**
- **accept with amendments**: name them.
- **send back**: say what is wrong.

## Recommendation

The FSE's: accept as written. Five of the rows are Aglaea's design calls,
not conformance to a rule you have seen: rows 1, 4, 7, 12 and 14 in the
triage (the rule box's content and size, the blocker's words, "no owner",
the card-back hint). Rows 9 and 13 are yours, in 0059 and 0060.

## Ruling



## Consequences

On acceptance: the FSE starts one supervisor for the card, with a UI
reviewer, and adds 0059's and 0060's FRs first if they are ruled by then.
