---
title: Accept leftovers 22 - Tab reaches every link
status: proposed
raised: 2026-10-11
raised_by: fse
owner: pablo
options: ["accept as written", "accept with amendments", "send back"]
cards: [lf22-tab-links, lf22-rail-roving]
threads: []
supersedes: []
superseded_by:
---

## Question

Your 0117 answer ("I use Tab"), designed by Aglaea (3ce6af1). Two cards
(`docs/specs/leftovers-22.md`):

1. **Tab reaches links**: one switch in the app makes plain Tab stop on
   links (a card's `Open <id>`, a role drawer's initiatives), whatever
   your macOS keyboard setting. The first Tab on any screen shows `Skip to
   content`, so you can jump past the bar and the rail. Every link shows
   the focus ring. The builder lists every link and anything that
   navigates without being one.
2. **The rail is one Tab stop**: Tab enters the rail on the current
   initiative, Up and Down move, Enter opens, the next Tab leaves it. It
   waits for leftovers-21's rail card. It also makes the rail's top block
   read its counts as one line ("3 now, 0 blocked, 5 next") to a screen
   reader, and removes code leftovers-21 left unused.

Checks press Tab inside an offscreen copy of the app that never takes
focus; nothing touches your keyboard or screen.

forecast: 40-70 min over 1 wave (two builders, the rail one after
leftovers-21 merges), plus one risk: if WKWebView ignores keys sent to a
window that is not focused, the checks need a new route and I come back to
you; basis: leftovers-15 to 21, this initiative.

## Options

- **"accept as written"**
- **"accept with amendments"**: name them.
- **"send back"**: say what is wrong.

## Recommendation

The FSE's: accept as written.
