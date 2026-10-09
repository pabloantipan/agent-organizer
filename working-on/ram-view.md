---
title: "The memory indicator: top-bar button and popover, the floating icon's ring and panel line, the notification at critical"
status: next
repos: [organizer]
branch: ram-view
seat: rv-build
stage: one-window
updated: 2026-10-09
next: "sup49 runs it after ram-sample (0103 accepted 2026-10-09)"
depends_on: [ram-sample]
boundary: ["new top-bar memory component, popover and css (tier-2 tokens)", "the store (popover state, Agents › focus), AgentsView.tsx (focus a row by agent id only)", "floaticon_darwin.m/.h/.go (ring, panel line), new notify_darwin.m/.go and notify_other.go, app.go (post on warn, the click)", "scripts/fixture-home.sh (the fake reading)", "not: Go under internal/, the Deltagos mark (0102)"]
spec: "docs/specs/ram-indicator.md (FR-5 to FR-7; docs/ux/specs/ram-indicator.md (6d84a12))"
gate: "docs/specs/ram-indicator.md Acceptance (ram-view), rows M1 to M8, N1 and X0"
ui_review: true
---

## Goal
0101: the reading `ram-sample` puts on the feed, drawn as Aglaea designed it,
on the top bar and on the floating icon, with one warning at critical.

## Gate
docs/specs/ram-indicator.md, M1 to M8, N1 and X0.

## Notes
- 2026-10-09 sup49: boundary widened by `App.tsx`'s screen switch only, to mount AgentsView with no initiative selected so an unassigned session's `Agents ›` lands on the unassigned group, as the design says.
- 2026-10-09 sup49: boundary widened by one setter, `Service.SetMemoryReader` in `internal/service/memory.go` and its test, so the fake reading reaches the service from `app.go` (ram-sample was asked for an injectable reader and left it unexported).
- 2026-10-09: supervisor sup49 (window 7535), spawned by the FSE.
