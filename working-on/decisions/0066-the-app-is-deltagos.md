---
title: The app is named Deltagos; repos and identifiers keep "organizer"
status: ruled
raised: 2026-09-29
raised_by: pablo
owner: pablo
ruled: 2026-09-29
ruled_by: pablo
options: [what you see plus the .app, what you see only, everything user-facing]
chosen: what you see plus the .app
cards: [rename-deltagos]
threads: []
supersedes: []
superseded_by:
stage:
---

## Question

Pablo, 2026-09-29, in the FSE's session on lodestar: "we'll update name
organizer to Deltagos. This name is for the app context, repos preserves
current". How far does "the app context" reach?

## Options

Asked by the FSE in the same session. In every option, the repos, the
initiative id, the discuss project and the Firestore database keep
"organizer".

- **what you see plus the .app**: the window title, the top bar, the version
  line, Help and docs text, the DMG, and the bundle as `Deltagos.app`. The
  `organizer` CLI, the bundle id `cl.antipan.organizer`, the config and data
  paths and the keychain service stay, so nothing installed breaks.
- **what you see only**: the window title, the top bar, and the Help and
  docs text. `organizer.app` stays on disk, the DMG keeps its name, and the
  CLI stays `organizer`.
- **everything user-facing**: the above, plus a `deltagos` CLI (keeping
  `organizer` as an alias), and the bundle id and paths migrated.

## Recommendation

The FSE's: what you see plus the .app.

## Ruling

pablo, 2026-09-29, in the FSE's session on lodestar: "What you see, plus the
.app" (the recommended option, picked from the FSE's question), after "we'll
update name organizer to Deltagos. This name is for the app context, repos
preserves current".

## Consequences

The FSE cuts `rename-deltagos`, whose spec is this record, as 0052 was for
frontend-tests. Hephaistos is told: skills and factory docs that name "the
organizer app" are its to update. Aglaea is told: `docs/design-system.md`'s
title is hers.
