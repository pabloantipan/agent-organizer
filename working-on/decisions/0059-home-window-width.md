---
title: At which window width does "at a glance" hold on Home?
status: proposed
raised: 2026-09-29
raised_by: fse
owner: pablo
ruled:
ruled_by:
options: [1024 is real, 1440 or wider]
chosen:
cards: []
threads: [01M3Q04G1TTG9JX71GA5CKMWBW]
supersedes: []
superseded_by:
stage: twenty-at-a-glance
---

## Question

Aglaea's triage, row 9 (hr-U6, severity 2, heuristic): since
home-rule-and-rows keeps every id whole, Home's rows take two lines at the
app's minimum window (1024×640). About three initiatives then show under
Needs me, and the stage column is what gets cut. twenty-at-a-glance never
said which width "at a glance" means (its G9 was timed at 1440). At which
width do you read Home?

## Options

- **1024 is real**: you read Home in a half-screen window. At that width the
  stage keeps only its number and title, so rows go back to one line. Cost:
  one small FR in the next UI card.
- **1440 or wider**: keep it as built; at 1024 rows wrap. twenty-at-a-glance
  records 1440 as the width. Cost: none.

## Recommendation

None from the FSE: it depends on how you work. Aglaea's note: a half-screen
window on a laptop is this size.

## Ruling



## Consequences

On "1024 is real": an FR in ui-leftovers if it has not launched, else in the
next UI card. Either way, twenty-at-a-glance records the width.
