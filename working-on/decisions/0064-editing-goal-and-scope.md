---
title: Are goal, measure and scope edited in the app?
status: proposed
raised: 2026-09-29
raised_by: fse
owner: pablo
ruled:
ruled_by:
options: [file only, shown honestly, edit in the app, edit and commit]
chosen:
cards: [header-fold]
threads: [01M3R14N3KAYTGQFH09AMBK73W]
supersedes: []
superseded_by:
stage: twenty-at-a-glance
---

## Question

Your header review, point 4: "If I want to update goal by hand? And am I
saving goals/scope updates?" Today the app never writes
`working-on/initiative.yaml`. An edit by hand is saved when the file is
saved, and gets history only once it is committed (the organizer repo tracks
`working-on/`). Should the app edit them? (Options from Aglaea's design,
`docs/ux/specs/initiative-header.md`, "Pablo's fourth question".)

## Options

- **file only, shown honestly**: Details says "from
  working-on/initiative.yaml", has Open in editor, and shows "edited, not
  committed" when git reports the file modified. Read-only in the app. Cost:
  small, part of header-fold (FR-9).
- **edit in the app**: an edit box per field. The app writes the YAML,
  keeping every other byte, and makes no commit. Cost: a second writer of
  the charter, and a spec amendment; history only if you commit.
- **edit and commit**: the same, plus a commit of that one file, as 0019
  does for a ruling. Cost: as above, plus a commit path. It bypasses the
  record a roadmap-level change goes through (the roadmapping skill).

## Recommendation

Aglaea's, and the FSE's: file only, shown honestly. It answers "am I
saving?" where you ask it, adds no write path, and keeps a goal change
deliberate. Revisit "edit and commit" at stage 6, when business owners who do
not open files use the app.

## Ruling



## Consequences

On "file only": FR-9 is built in header-fold as written. On either edit
option: a spec amendment and its own card before header-fold launches, or
after it.
