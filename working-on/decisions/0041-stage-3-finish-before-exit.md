---
title: "Stage machine-explains-itself: fix two findings, then exit met"
status: ruled
raised: 2026-09-28
raised_by: fse
owner: pablo
ruled: 2026-09-28
ruled_by: pablo
options: [fix two findings first, exit met now]
chosen: fix two findings first
cards: [explain-finish, install-current-build-3]
threads: []
supersedes: []
superseded_by:
stage: machine-explains-itself
---

## Question

All three stage-3 cards passed review (`done/explain-help.md`,
`done/explain-health-words.md`, `done/explain-health-all-agents.md`).
G7 was answered all right in 70 s by a reviewer who did not build it. The
last review found, outside the gate:

1. A roster seat's row gives why and what to do only as the badge's
   tooltip; supervisors and builders get a visible line.
2. The Help's section list highlights a section without visibly scrolling
   the document to it.
3. Once, Home's live-agent count dropped after the first 10 s sample. It
   was not investigated.

The stage's outcome is "a developer new to the factory learns the flow and
diagnoses the mailbox from the app". Findings 1 and 2 are that outcome.

## Options

- **fix two findings first**: one small card:
  - roster rows get the same visible why and what-to-do line;
  - the Help's section list scrolls the document.
  Then the FSE proposes exit met. Finding 3 goes to the FSE's open
  questions.
- **exit met now**: the stage closes; the two findings become cards
  outside the roadmap.

## Recommendation

The FSE's: fix two findings first. It is a one-card task, and a newcomer
who must hover to learn why a seat is deaf is the gap this stage exists to
close.

## Ruling

Pablo, 2026-09-28, in the FSE's session (organizer-probe-fse): "do as
recommended. Reinstall".

## Consequences

On "fix first": the FSE amends the spec (FR-8 and FR-9), cuts the card and
spawns its supervisor. Then it proposes exit met with the reinstall.
