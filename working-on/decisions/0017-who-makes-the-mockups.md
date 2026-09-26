---
title: Who makes the redesign's mockup page
status: proposed
raised: 2026-09-26
raised_by: fse
owner: pablo
ruled:
ruled_by:
options: [the session that reviewed the UI, a builder card under a supervisor, the FSE]
chosen:
cards: []
threads: []
supersedes: []
superseded_by:
---

## Question

0016 puts a mockup page (Home, Initiative overview, Work with the wave strip,
Roadmap with stages and decision gates, in the app's tokens) before any code,
and 0015 has the FSE write the redesign spec from 0013, 0014 and that page.
No page exists yet (checked at f7b01da: nothing under `docs/`, no card), and
no record says who makes it. The spec waits on it.

## Options

- **the session that reviewed the UI**: the Claude session that raised
  0013–0016 with Pablo builds the page as a pair, Pablo reacts in place and
  the FSE records the reactions as rulings. Fastest, the context is already
  there; the page is not graded against a gate and does not fill the pilot's
  run record.
- **a builder card under a supervisor**: the FSE writes a mockup card
  (`spec`: 0013, 0014, 0016; `gate`: the four screens render in
  `frontend/src/styles/tokens.css` tokens at desktop and phone width;
  `boundary`: one file under `docs/mockups/`) and spawns `sup1`. It fills the
  pilot's metrics from the first task, as 0015 wanted; a supervisor and a
  review for one static page is heavy, and a builder guesses the layout the
  UI review already discussed.
- **the FSE**: the FSE drafts the page itself. Not in the FSE's authority
  table (a page is neither a spec nor a card, and is close to code); it would
  need a ruling that extends the seat.

## Recommendation

The FSE's: the session that reviewed the UI. The page is the input to the
spec, not the build; the pilot's first supervised task is the redesign itself
(0015), cut from the spec once the page exists.

## Ruling



## Consequences

Once ruled and the page exists, the FSE writes the redesign spec
(spec-craft) under `docs/specs/` as proposed, cuts its cards, and spawns the
first supervisor (0015).
