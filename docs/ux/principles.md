# Design principles — Deltagos (initiative: organizer)

The visual and component rules are `docs/design-system.md` (seven
principles, tokens, components, anti-patterns). This file adds only what is
specific to how Deltagos is used, each with its reason.

1. **The glance is the product.** Home must answer "which of twenty execute,
   are in discovery, wait on business, wait on me" without opening one
   (twenty-at-a-glance, G9: under a minute). Anything that makes a row
   unidentifiable or ambiguous is major, not cosmetic.
2. **Rule where you read.** A decision is ruled with its question, options
   and recommendation in view; a ruling is committed to git and costs a
   superseding record to undo (0019, 0045).
3. **One word per state, everywhere.** A state (agent, health, initiative)
   has one word and one "why / what to do", from one table, in every view
   (`lib/health.ts` is the pattern; machine-explains-itself FR-4).
4. **The app teaches the machine.** A new developer learns the flow from the
   screens and the Help, "we don't have too much time for introducing a dev"
   (0029): an empty or disabled state says what is missing and how to get it.
5. **Works at the smallest window and uses the widest.** Pablo works at
   1024×640 on a 14-inch laptop and at 3440×1440 on an ultrawide (0059);
   every screen is checked at 1024×640, 1512×945 and 3440×1440.
