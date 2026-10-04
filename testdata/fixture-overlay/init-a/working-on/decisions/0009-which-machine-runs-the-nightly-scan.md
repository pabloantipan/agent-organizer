---
title: Which machine runs the fixture's nightly scan, and who watches it
status: proposed
raised: 2026-10-03
raised_by: fse
owner: pablo
ruled:
ruled_by:
options: [lodestar alone, the laptop alone, both machines alternating, both machines every night, a cloud runner, a cloud runner with lodestar as fallback, no nightly scan, decide after the next wave]
chosen:
stage: joins
cards: []
threads: []
supersedes: []
superseded_by:
---

## Question

The fixture initiative scans every root it is given each night, so that the
morning board is current before anyone opens the app. Today nothing runs it:
the scan happens only when the window is open, and the two machines disagree
about what they saw last. Which machine should run the nightly scan, and who
is told when it fails?

The choice touches three things at once. First, where the cache lives: a
scan on lodestar writes lodestar's cache, and the laptop's board stays as old
as its last open window. Second, what a failure looks like: a scan that dies
at 03:00 leaves no trace unless something reads its log, and nothing does
today. Third, cost: a cloud runner needs a copy of every root, which the
fixture has and a real initiative does not.

Eight answers are on the table. Each is short; the trade-offs are under
Options. Rule one, and say in your words why, so the next wave knows what
the nightly scan is for before it builds anything around it.

## Options

- **lodestar alone**: the desk machine, always on.
- **the laptop alone**: where the work happens, often asleep.
- **both machines alternating**: odd nights lodestar, even nights the laptop.
- **both machines every night**: two caches, merged by the sync.
- **a cloud runner**: a copy of every root, off both machines.
- **a cloud runner with lodestar as fallback**: the cloud first, the desk if
  it fails.
- **no nightly scan**: the window's own scan is enough.
- **decide after the next wave**: not now.

## Recommendation

The FSE's: lodestar alone, until a second person needs the board.

## Ruling

## Consequences

A record with eight options and a long Question, so the rule box is taller
than its room at a 1024×640 window and scrolls with Rule and Cancel inside
(leftovers-5 FR-12, leftovers-6 S2, leftovers-4 L7).
