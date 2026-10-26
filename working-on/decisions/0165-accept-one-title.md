---
title: Accept leftovers 55 - one band at the top, the name only where the system shows it (revises 0066)
status: ruled
raised: 2026-10-25
raised_by: fse
owner: pablo
options: ["accept as written", "accept with amendments", "send back"]
cards: [lf55-one-title]
forecast: 30-60m
supersedes: []
superseded_by:
ruled: 2026-10-26
ruled_by: pablo
chosen: accept as written
---

## Question

You asked, 2026-10-25, with a screenshot: "I see deltagos twice here, is it
neceesary?", then "Send to Aglaea for a propper aproach please". Aglaea's
design, `docs/ux/specs/one-title.md` as rewritten (269ebd7): with the window
in front the name shows three times today (the macOS menu bar, the native
title bar, the top bar's brand). After this it shows once, in the menu bar:

- the native title bar draws no text and the content runs to the top edge;
  the traffic lights sit in an 80 px box at the top bar's left, which is
  where the brand word was, so the bar folds at 1024 as today;
- the brand word leaves the top bar;
- the window keeps its title, so the Dock, Cmd-Tab, Mission Control,
  VoiceOver and the review tooling still say Deltagos;
- the version, hover-only today, gets real homes: About Deltagos in the app
  menu, and `Deltagos <version> · <machine>` at the foot of Settings;
- empty bar space drags the window and a double-click follows your system
  setting; full screen and the lock screen keep the lights' box.

This revises 0066's "the top bar says Deltagos" (the name itself stays
Deltagos everywhere the system reads it). One card,
`docs/specs/leftovers-55.md`, with a UI review.

## Options

- **accept as written**: one card, one wave.
- **accept with amendments**: say which.
- **send back**: keep both.

## Recommendation

accept as written.

## Forecast

forecast: 30-60m over 1 wave, plus the UI review and no lease data; basis:
9 tasks, this initiative (one-card tasks: 14, 33, 43 min).

## Ruling

pablo, 2026-10-26, in the organizer on lodestar: ok
