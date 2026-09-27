---
title: Accept the redesign spec, and launch its wave 1
status: proposed
raised: 2026-09-26
raised_by: fse
owner: pablo
ruled:
ruled_by:
options: [accept as written, accept with amendments, send back]
chosen:
cards: [redesign-goal-stages, redesign-agent-card, redesign-runs-binding, redesign-waves, redesign-fse-activity, redesign-rule-record, redesign-shell-home, redesign-overview, redesign-work, redesign-roadmap, redesign-rule-box]
threads: [01M3G3SE8B4QAK39G6JY2W8ZH8]
supersedes: []
superseded_by:
stage:
---

## Question

`docs/specs/redesign.md` (proposed) turns 0013–0020 and the reviewed mockups
into 22 requirements, a 16-row gate and 11 cards in two waves. Is it the spec
the supervisors build against? Once it is accepted, the FSE spawns `sup1` for
wave 1 (the six backend cards) and lets go (0015).

## Options

- **accept as written**: the spec goes `status: ruled`; the FSE spawns sup1.
  FR-12 (0021) and FR-21's label (0022) stay out until those are ruled.
- **accept with amendments**: name them; the FSE amends the spec and the
  cards, then spawns sup1 without a second round.
- **send back**: say what is wrong; nothing launches.

## Recommendation

The FSE's: accept as written. What to look at first, because each is a choice
the spec made that you have not ruled:
- A1–A4 (Assumptions): the supervisor's session name, gate rows as checkboxes
  under `## Gate`, phases from `progress.md` checkboxes, and `ruled_by` taken
  from the record's `owner` on auth off.
- The appetite: two waves; a third means the spec was wrong.
- Wave 2 waits on wave 1's review, not on a second acceptance.

## Ruling



## Consequences

On acceptance: the spec's status goes to ruled, the FSE writes sup1's prompt
and starts it, notes `sup1` on the six wave-1 cards, commits, and lets go.
