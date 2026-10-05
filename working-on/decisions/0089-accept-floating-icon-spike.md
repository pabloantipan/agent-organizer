---
title: Accept the floating-icon spike before the feature is designed and built
status: ruled
raised: 2026-10-05
raised_by: fse
owner: pablo
ruled: 2026-10-05
ruled_by: pablo
options: [accept as written, skip the spike and build, send back]
chosen: accept as written
cards: [floating-icon-spike]
threads: []
supersedes: []
superseded_by:
---

## Question

0088's Teams behaviour needs macOS parts Wails v2 does not have: a second,
native floating panel on every desktop, and knowing when you have left
Deltagos' desktop. It looks feasible (`NSPanel`, `isOnActiveSpace`), but it
would be the riskiest native code in the app. The spike
(`docs/specs/floating-icon-spike.md`, card `floating-icon-spike`) proves it
on a throwaway branch with a screen recording, and writes what it cost and
what fought back. Nothing reaches main but its findings. Aglaea designs the
icon, the floating look and the list in parallel.

forecast: 40-90 min of wave time over 1 wave, plus this decision (median
0 d); basis: this initiative's single-wave tasks; no native spike in the
record yet, so the high end is raised.

## Options

- **accept as written**: the spike first, then the build spec.
- **skip the spike and build**: Aglaea's design and the build card directly;
  a dead end found late costs a wave.
- **send back**: say what is wrong.

## Recommendation

The FSE's: accept as written.

## Ruling

pablo, 2026-10-05, in the organizer on lodestar: ok

## Consequences

On acceptance: the FSE starts one supervisor for floating-icon-spike; its
findings decide the build spec.
