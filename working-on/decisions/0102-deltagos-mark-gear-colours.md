---
title: The Deltagos mark - the gears' colours
status: proposed
raised: 2026-10-09
raised_by: fse
owner: pablo
ruled:
ruled_by:
options: ["A: magenta and periwinkle", "B: plum steel", "C: ember and amber, as the sketch"]
chosen:
cards: []
threads: ["01M4CKBP8N0MGTVP3E0BCZB7JB"]
supersedes: []
superseded_by:
---

## Question

Pablo, 2026-10-09: "adjust pallete to current one and let's draw it". Aglaea
drew the mark in the app's palette (e1cdce1,
`docs/ux/inputs/deltagos-mark/deltagos-mark-drawn.html` and `.png`;
`docs/ux/specs/floating-icon.md` Amendment 4). The D is the accent
(#8a3ffc) and the ground is `--bg`; that bends nothing. The two gears cannot
take the palette without bending a rule of `docs/design-system.md` (one
accent, magenta as the tone, red only for blocked, status hues only for
status). Which colours do the gears take?

## Options

- **"A: magenta and periwinkle"** (Aglaea's proposal): big gear
  `--magenta-9` #d946ef, small gear `--periwinkle-9` #a9a0ff. Only the
  palette's hues; bends one rule, periwinkle (the `next` status hue) used
  as decoration, as the current app icon's bars already do.
- **"B: plum steel"**: `--plum-9` and `--plum-7`. Bends nothing; the gears
  go quiet and the mark loses its warmth.
- **"C: ember and amber, as the sketch"**: #FF6A4A and #FFC25A. Two hues
  the app uses nowhere else, and ember sits near blocked's red.

## Recommendation

A, with Aglaea: it stays inside the palette and the bend it makes already
exists in the shipped app icon. Look at the drawing before ruling; it shows
the three options side by side.

## Consequences

The ruling fixes floating-icon Amendment 4's colour table. The mark's build
(floating icon, app icon cuts, Help header) and the RAM indicator's icon
state (0101, `docs/specs/ram-indicator.md`) are drawn on it; Aglaea draws
the RAM states next. Native constraint for the build card: Core Animation
does the gears turning and constant-speed gap travel; points, notches and
varying speed need per-frame path work and may be dropped at 56 pt.
