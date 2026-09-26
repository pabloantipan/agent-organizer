---
title: The organizer's cards are tracked in its repo
status: ruled
raised: 2026-09-26
raised_by: claude
owner: pablo
ruled: 2026-09-26
ruled_by: pablo
options: [track working-on/, cards in their own repo, notify from the app on file change]
chosen: track working-on/
cards: [fse-pilot]
supersedes: []
superseded_by:
---

## Question

`working-on/` was gitignored, so a card change never reached a commit and the post-commit hook could not wake the FSE. How does it get woken?

## Options

- **track working-on/**: cards and machine names go into the public app repo.
- **cards in their own repo**: the app repo stays clean; a second repo to keep.
- **notify from the app**: organizer code, which the hand-off put off limits.

## Recommendation



## Ruling

Pablo chose tracking, 2026-09-26.

## Consequences

Card edits in this initiative must be committed from now on.
