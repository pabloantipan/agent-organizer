---
title: Review the app with Pablo, soon — a long header, no Rule on the Decisions tab, no scroll
status: next
repos: [organizer]
branch: main
updated: 2026-09-27
next: "reviewed with Pablo 2026-09-28 (0038); the work is in glance-header-scroll and glance-rule-in-decisions, run by sup8; this note closes when they land"
stage: twenty-at-a-glance
---

## Goal
Pablo, 2026-09-27, in the FSE's session, from the installed app
(v0.2.0-154, built 2026-09-26 23:41, after the redesign): "I see no way to
rule these at organizar app. Place a note we need to review this soon."

## Findings (his words, then what the FSE read)
1. "Goal takes so many vertical space that I need to exapnd window to reach
   bottom." The header shows goal and measure in full; the organizer's
   measure (written by the FSE from 0029) is a long paragraph.
2. "I see desicions tab, I expand the decision and have no way to rule it
   there." The Rule box was built on Home's Needs me rows only (redesign
   FR-22, `RuleDecisionBox.tsx`); the Decisions tab expands a record with no
   action.
3. "when I expand, I have no way to get bottom else expanding the window."
   The initiative page does not scroll below the header and tabs.

## Candidates to put to Pablo (not decided)
- The header clamps goal and measure to two lines each, with "more".
- Rule on an expanded record in the Decisions tab, with the same box as
  Needs me.
- The body under the tabs scrolls on its own; the header stays.
- The FSE shortens the organizer's measure, in Pablo's words.

## Done
- 2026-09-27 opened by the FSE from Pablo's report

## Next
1. reviewed (0038); closes with glance-header-scroll and glance-rule-in-decisions

## Blockers
none
