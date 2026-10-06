---
title: A stage for the work outside any stage - Deltagos is the lead's one window
status: proposed
raised: 2026-10-06
raised_by: fse
owner: pablo
ruled:
ruled_by:
options: [add the stage as drafted, add it with other exit items, no stage]
chosen:
cards: []
threads: []
supersedes: []
superseded_by:
---

## Question

Since 2026-10-03 about 23 cards landed with no `stage:` (decisions-still,
decisions-view, drafts-and-slack, drafts-per-chat, floating-icon,
floating-icon-spike, floating-icon-2, header-fold-3, home-signals-5,
home-widths-4, layers-focus-and-words, markdown-and-labels, needs-me-relays,
review-build, roles-and-needs-me-five, roles-feed, roles-ui,
rule-box-and-stages, rule-words-and-dates, time-zoom, time-zoom-2,
timeline-and-find-6, zoom-decisions-polish), so the roadmap shows none of
the last four days' work. Pablo (0093) chose a new stage for it. Which one?

## Options

1. **Add the stage as drafted below**, placed after `discovery-in-a-cell`
   and before `decisions-owned-and-used` (which waits on identity, 0004
   withdrawn), and stamp `stage: one-window` on the cards above.
2. **Add it with other exit items** you name.
3. **No stage**: the work stays unstaged and the Roadmap shows it as such.

Draft (option 1):

```yaml
  - id: one-window
    title: Deltagos is the lead's one window
    phase: building
    outcome: the lead reads, rules and plans every initiative from Deltagos, on any desktop, without a terminal for status
    exit:
      - text: Deltagos is one click away on every desktop (floating icon, 0088-0092)
        met: 2026-10-06    # floating-icon-2 merged, 74e9b0a
      - text: a decision is read and ruled in the app with the record in view (decisions-view, rule-box-and-stages)
        met: 2026-10-04    # to check against the cards before the ruling
      - the Roadmap reads as a plan: stages, waves, iterations, cards and decisions at four levels (0093)
      - no UI leftover older than one batch (leftovers-13 landed)
    gates: ["0093"]
    appetite: three waves    # the roadmap view, leftovers-13, one spare
```

## Recommendation

Option 1. The two met items are already true on main; the two open ones are
the work on hand, so the stage closes when they land instead of staying
open-ended like the leftover batches did.

Cost: one commit (roadmap.yaml plus `stage:` on 23 done cards); no code.

## Ruling
