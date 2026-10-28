---
title: "Deltagos draws the two autonomous-report charts: progress along a run, then where each track is"
status: next
repos: [organizer]
branch: spec/autonomous-report-charts
seat:
stage:
updated: 2026-10-27
next: "fse: review the spec, rule the open questions with Pablo, cut the step cards"
depends_on: []
spec: "docs/specs/autonomous-report-charts.md"
risk: low
autonomy: needs-operator(open questions Q1-Q6 wait on Pablo and the talos and working-on skill owners; end-to-end rows S8 and T5 read a real initiative on its own machine)
---

## Goal
An FSE pastes both report charts from one command, and Pablo reads them in Deltagos, instead of drawing them by hand after every autonomous run.

## Where
| Repo | Branch | State |
|---|---|---|
| organizer | spec/autonomous-report-charts | the spec only, off origin/main 21b5d5d5 |

## Done
- 2026-10-27 Hephaistos: spec written on odyssey from a client initiative's FSE's three-step proposal (mailbox thread on odyssey), Pablo's word in the Hephaistos session; 21 premises, FR-1 to FR-22, gates S/D/T, six open questions.

## Next
1. fse: review the spec, rule the open questions with Pablo, cut the step cards
2. Cut `charts-progress` (step 1) once Q1-Q3 are ruled; `deploy-record-read` and `charts-tracks` after their skill owners adopt the formats
3. Hand the talos-skill and working-on-skill proposals (Q4, Q5) to Hephaistos

## Blockers
- Q1-Q6 in the spec's Open questions, each with its owner.

## Notes
- This card cuts cards and builds nothing: no gate or boundary on purpose.
- Real-initiative evidence (S8, T5) stays outside the repo: client card slugs must not reach GitHub.
